/**
 * Axiom Hive Technology — Project attribution: Alexis M. Adams and Nicholas Michael Grossi.
 * Research assistance: Manus AI. Attribution does not determine ownership or rights.
 */

import {
  auditEvents,
  draftingRequests,
  policyVersions,
  projectMembers,
  projects,
  releasedArtifacts,
  reviewDecisions,
  workflowExecutions,
} from "../../drizzle/schema";
import { and, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { getDb } from "../db";
import { isAllowedTransition, type WorkflowState, type WorkspaceRole } from "@shared/governance";
import { TRPCError } from "@trpc/server";

export async function requireWorkspaceRole(userId: number, projectId: string, permittedRoles?: WorkspaceRole[]) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The workspace data service is unavailable." });
  const [membership] = await db
    .select()
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
    .limit(1);
  if (!membership || (permittedRoles && !permittedRoles.includes(membership.role))) {
    throw new TRPCError({ code: "FORBIDDEN", message: "You do not have the required project authorization." });
  }
  return membership;
}

export async function listAuthorizedProjects(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      createdAt: projects.createdAt,
      workspaceRole: projectMembers.role,
    })
    .from(projectMembers)
    .innerJoin(projects, eq(projectMembers.projectId, projects.id))
    .where(eq(projectMembers.userId, userId))
    .orderBy(desc(projects.updatedAt));
}

export async function getAuthorizedRequest(userId: number, requestId: string, roles?: WorkspaceRole[]) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The workspace data service is unavailable." });
  const [request] = await db.select().from(draftingRequests).where(eq(draftingRequests.id, requestId)).limit(1);
  if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "The drafting request was not found." });
  await requireWorkspaceRole(userId, request.projectId, roles);
  return request;
}

export async function transitionRequest(input: {
  requestId: string;
  fromState: WorkflowState;
  toState: WorkflowState;
}) {
  if (!isAllowedTransition(input.fromState, input.toState)) {
    throw new TRPCError({ code: "CONFLICT", message: `The workflow transition ${input.fromState} to ${input.toState} is not permitted.` });
  }
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The workflow data service is unavailable." });
  const updated = await db
    .update(draftingRequests)
    .set({ state: input.toState })
    .where(and(eq(draftingRequests.id, input.requestId), eq(draftingRequests.state, input.fromState)));
  if (updated[0].affectedRows !== 1) {
    throw new TRPCError({ code: "CONFLICT", message: "The request state changed before the workflow transition could be applied." });
  }
}

export async function getLatestExecution(requestId: string) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The workflow data service is unavailable." });
  const [execution] = await db
    .select()
    .from(workflowExecutions)
    .where(eq(workflowExecutions.requestId, requestId))
    .orderBy(desc(workflowExecutions.createdAt))
    .limit(1);
  if (!execution) throw new TRPCError({ code: "CONFLICT", message: "The request has no generated draft to validate or review." });
  return execution;
}

export async function getRequestAudit(userId: number, requestId: string) {
  const request = await getAuthorizedRequest(userId, requestId);
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(auditEvents)
    .where(and(eq(auditEvents.projectId, request.projectId), eq(auditEvents.requestId, requestId)))
    .orderBy(desc(auditEvents.createdAt), desc(auditEvents.id));
}

export async function listProjectRequests(userId: number, projectId: string) {
  await requireWorkspaceRole(userId, projectId);
  const db = await getDb();
  if (!db) return [];
  return db.select().from(draftingRequests).where(eq(draftingRequests.projectId, projectId)).orderBy(desc(draftingRequests.updatedAt));
}

export async function listReviewQueue(userId: number) {
  const accessible = await listAuthorizedProjects(userId);
  const reviewerProjectIds = accessible.filter(project => project.workspaceRole === "reviewer" || project.workspaceRole === "admin").map(project => project.id);
  if (reviewerProjectIds.length === 0) return [];
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(draftingRequests)
    .where(and(
      inArray(draftingRequests.projectId, reviewerProjectIds),
      or(
        eq(draftingRequests.state, "AWAITING_HUMAN_REVIEW"),
        and(
          eq(draftingRequests.state, "AWAITING_PRE_GENERATION_APPROVAL"),
          eq(draftingRequests.requiresPreGenerationApproval, true),
          isNull(draftingRequests.preGenerationApprovedBy),
        ),
      ),
    ))
    .orderBy(desc(draftingRequests.updatedAt));
}

export async function listProjectPolicies(userId: number, projectId: string) {
  await requireWorkspaceRole(userId, projectId);
  const db = await getDb();
  if (!db) return [];
  return db.select().from(policyVersions).where(eq(policyVersions.projectId, projectId)).orderBy(desc(policyVersions.createdAt));
}

export async function listProjectMembers(userId: number, projectId: string) {
  await requireWorkspaceRole(userId, projectId, ["admin"]);
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ id: projectMembers.id, userId: projectMembers.userId, role: projectMembers.role, createdAt: projectMembers.createdAt })
    .from(projectMembers)
    .where(eq(projectMembers.projectId, projectId))
    .orderBy(desc(projectMembers.createdAt));
}

export async function listReleasedArtifacts(userId: number, requestId: string) {
  await getAuthorizedRequest(userId, requestId);
  const db = await getDb();
  if (!db) return [];
  return db.select().from(releasedArtifacts).where(eq(releasedArtifacts.requestId, requestId)).orderBy(desc(releasedArtifacts.releasedAt));
}

export async function listReviewDecisions(userId: number, requestId: string) {
  await getAuthorizedRequest(userId, requestId);
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviewDecisions).where(eq(reviewDecisions.requestId, requestId)).orderBy(desc(reviewDecisions.createdAt));
}
