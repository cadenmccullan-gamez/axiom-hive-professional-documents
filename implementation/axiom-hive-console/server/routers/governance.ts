/**
 * Axiom Hive Technology — Project attribution: Alexis M. Adams and Nicholas Michael Grossi.
 * Research assistance: Manus AI. Attribution does not determine ownership or rights.
 */

import { createHash, randomUUID } from "crypto";
import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { draftingRequests, policyVersions, projectMembers, projects, releasedArtifacts, reviewDecisions, workflowExecutions } from "../../drizzle/schema";
import { canAuthorizePreGeneration, canGenerateDraft, canManageWorkspaceMembers, canReleaseArtifact, determineMembershipAssignment, type WorkflowState } from "@shared/governance";
import { protectedProcedure, router } from "../_core/trpc";
import { appendAuditEvent } from "../governance/audit";
import { createDeterministicMockDraft, createLiveDraft } from "../governance/drafting";
import { evaluateIntakePolicy, intakeSchema, validateDraftContent } from "../governance/policy";
import {
  getAuthorizedRequest,
  getLatestExecution,
  getRequestAudit,
  listAuthorizedProjects,
  listProjectMembers,
  listProjectPolicies,
  listProjectRequests,
  listReleasedArtifacts,
  listReviewDecisions,
  listReviewQueue,
  requireWorkspaceRole,
  transitionRequest,
} from "../governance/repository";
import { getDb } from "../db";

const projectCreateSchema = z.object({
  name: z.string().trim().min(3).max(160),
  description: z.string().trim().max(2000).optional(),
});

const projectIdSchema = z.object({ projectId: z.string().uuid() });
const requestIdSchema = z.object({ requestId: z.string().uuid() });

function requireUser(user: unknown): asserts user is { id: number; role: "user" | "admin" } {
  if (!user || typeof user !== "object" || !("id" in user)) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "An authenticated user is required." });
  }
}

async function recordTransition(input: {
  projectId: string;
  requestId: string;
  actorUserId: number;
  fromState: WorkflowState;
  toState: WorkflowState;
  eventType: string;
  payload: Record<string, unknown>;
}) {
  await transitionRequest({ requestId: input.requestId, fromState: input.fromState, toState: input.toState });
  await appendAuditEvent(input);
}

function parseSources(raw: string) {
  const result = z.array(z.object({ label: z.string(), url: z.string().url() })).safeParse(JSON.parse(raw));
  if (!result.success) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The stored request source metadata is invalid." });
  return result.data;
}

function buildMarkdownExport(input: {
  projectId: string;
  request: typeof draftingRequests.$inferSelect;
  execution: typeof workflowExecutions.$inferSelect;
  version: string;
  releasedAt: Date;
}) {
  const citations = parseSources(input.execution.citedSources).map(source => `- [${source.label}](${source.url})`).join("\n");
  const limitations = JSON.parse(input.execution.limitations) as string[];
  return `---\nproject_id: ${input.projectId}\nrequest_id: ${input.request.id}\nartifact_version: ${input.version}\nevidence_state: released\nreleased_at: ${input.releasedAt.toISOString()}\nworkflow_state: RELEASED\n---\n\n# ${input.request.title}\n\n${input.execution.draftText}\n\n## Source metadata\n${citations}\n\n## Limitations\n${limitations.map(item => `- ${item}`).join("\n")}\n\n> This controlled export records a reviewed prototype artifact. It does not establish factual truth, legal compliance, security, safety, or admissibility.`;
}

export const governanceRouter = router({
  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      requireUser(ctx.user);
      return listAuthorizedProjects(ctx.user.id);
    }),
    create: protectedProcedure.input(projectCreateSchema).mutation(async ({ ctx, input }) => {
      requireUser(ctx.user);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The workspace data service is unavailable." });
      const projectId = randomUUID();
      const membershipId = randomUUID();
      const policyId = randomUUID();
      await db.insert(projects).values({ id: projectId, name: input.name, description: input.description ?? null, createdBy: ctx.user.id });
      await db.insert(projectMembers).values({ id: membershipId, projectId, userId: ctx.user.id, role: "admin" });
      await db.insert(policyVersions).values({
        id: policyId,
        projectId,
        version: "v0.1",
        name: "Controlled drafting baseline",
        policyJson: JSON.stringify({ credentialScreening: true, reviewerApprovalRequiredForRelease: true, externalToolsPermitted: false }),
        createdBy: ctx.user.id,
      });
      await appendAuditEvent({
        projectId,
        actorUserId: ctx.user.id,
        eventType: "PROJECT_CREATED",
        payload: { projectName: input.name, initialPolicyVersion: "v0.1" },
      });
      return { projectId };
    }),
    addMember: protectedProcedure
      .input(z.object({ projectId: z.string().uuid(), userId: z.number().int().positive(), role: z.enum(["author", "reviewer", "admin"]) }))
      .mutation(async ({ ctx, input }) => {
        requireUser(ctx.user);
        const membership = await requireWorkspaceRole(ctx.user.id, input.projectId, ["admin"]);
        if (!canManageWorkspaceMembers(membership.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Only a workspace administrator may assign roles." });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The workspace data service is unavailable." });
        const [existingMembership] = await db.select().from(projectMembers).where(and(eq(projectMembers.projectId, input.projectId), eq(projectMembers.userId, input.userId))).limit(1);
        const assignmentOutcome = determineMembershipAssignment(existingMembership?.role, input.role);
        await db.insert(projectMembers).values({ id: randomUUID(), projectId: input.projectId, userId: input.userId, role: input.role }).onDuplicateKeyUpdate({ set: { role: input.role } });
        await appendAuditEvent({ projectId: input.projectId, actorUserId: ctx.user.id, eventType: `PROJECT_MEMBER_ROLE_${assignmentOutcome}`, payload: { userId: input.userId, role: input.role } });
        return { success: true, assignmentOutcome };
      }),
    members: protectedProcedure.input(projectIdSchema).query(async ({ ctx, input }) => {
      requireUser(ctx.user);
      return listProjectMembers(ctx.user.id, input.projectId);
    }),
  }),

  requests: router({
    list: protectedProcedure.input(projectIdSchema).query(async ({ ctx, input }) => {
      requireUser(ctx.user);
      return listProjectRequests(ctx.user.id, input.projectId);
    }),
    get: protectedProcedure.input(requestIdSchema).query(async ({ ctx, input }) => {
      requireUser(ctx.user);
      const request = await getAuthorizedRequest(ctx.user.id, input.requestId);
      const execution = request.state === "DRAFT_REQUEST" || request.state === "INTAKE_VALIDATED" || request.state === "POLICY_DECIDED" || request.state === "AWAITING_PRE_GENERATION_APPROVAL" || request.state === "REJECTED" ? null : await getLatestExecution(request.id);
      return { request, execution };
    }),
    submit: protectedProcedure.input(intakeSchema).mutation(async ({ ctx, input }) => {
      requireUser(ctx.user);
      await requireWorkspaceRole(ctx.user.id, input.projectId, ["author", "reviewer", "admin"]);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The workspace data service is unavailable." });
      const requestId = randomUUID();
      const [activePolicy] = await db
        .select()
        .from(policyVersions)
        .where(and(eq(policyVersions.projectId, input.projectId), eq(policyVersions.isActive, true)))
        .orderBy(desc(policyVersions.createdAt))
        .limit(1);
      if (!activePolicy) throw new TRPCError({ code: "CONFLICT", message: "An active project policy is required before a drafting request can be submitted." });
      const policy = evaluateIntakePolicy(input);

      await db.insert(draftingRequests).values({
        id: requestId,
        projectId: input.projectId,
        title: input.title,
        intendedUse: input.intendedUse,
        sensitivity: input.sensitivity,
        actionCategory: input.actionCategory,
        sourceInputs: JSON.stringify(input.sources),
        policyVersionId: activePolicy.id,
        state: "DRAFT_REQUEST",
        requiresHumanReview: policy.requiresHumanReview,
        requiresPreGenerationApproval: policy.requiresPreGenerationApproval,
        submittedBy: ctx.user.id,
      });
      await appendAuditEvent({ projectId: input.projectId, requestId, actorUserId: ctx.user.id, eventType: "INTAKE_SUBMITTED", toState: "DRAFT_REQUEST", payload: { title: input.title, sensitivity: input.sensitivity, actionCategory: input.actionCategory, policyVersion: activePolicy.version } });
      await recordTransition({ projectId: input.projectId, requestId, actorUserId: ctx.user.id, eventType: "INTAKE_VALIDATED", fromState: "DRAFT_REQUEST", toState: "INTAKE_VALIDATED", payload: { structuralValidation: "passed" } });
      await recordTransition({ projectId: input.projectId, requestId, actorUserId: ctx.user.id, eventType: "POLICY_DECIDED", fromState: "INTAKE_VALIDATED", toState: "POLICY_DECIDED", payload: { decision: policy.decision, requiresHumanReview: policy.requiresHumanReview, requiresPreGenerationApproval: policy.requiresPreGenerationApproval, reasons: policy.reasons } });
      if (policy.decision === "REJECT") {
        await recordTransition({ projectId: input.projectId, requestId, actorUserId: ctx.user.id, eventType: "POLICY_REJECTED", fromState: "POLICY_DECIDED", toState: "REJECTED", payload: { reasons: policy.reasons } });
      } else if (policy.requiresPreGenerationApproval) {
        await recordTransition({ projectId: input.projectId, requestId, actorUserId: ctx.user.id, eventType: "PRE_GENERATION_REVIEW_REQUIRED", fromState: "POLICY_DECIDED", toState: "AWAITING_PRE_GENERATION_APPROVAL", payload: { reasons: policy.reasons } });
      }
      return { requestId, decision: policy.decision, requiresHumanReview: policy.requiresHumanReview, requiresPreGenerationApproval: policy.requiresPreGenerationApproval, reasons: policy.reasons };
    }),
    generate: protectedProcedure
      .input(z.object({ requestId: z.string().uuid(), adapter: z.enum(["deterministic_mock", "invoke_llm"]).default("deterministic_mock") }))
      .mutation(async ({ ctx, input }) => {
        requireUser(ctx.user);
        const request = await getAuthorizedRequest(ctx.user.id, input.requestId, ["author", "reviewer", "admin"]);
        if (!canGenerateDraft(request.state, request.requiresPreGenerationApproval, Boolean(request.preGenerationApprovedBy))) {
          throw new TRPCError({ code: "CONFLICT", message: "A reviewer must record pre-generation authorization before this high-impact request can be drafted." });
        }
        const intake = intakeSchema.parse({
          projectId: request.projectId,
          title: request.title,
          intendedUse: request.intendedUse,
          sensitivity: request.sensitivity,
          actionCategory: request.actionCategory,
          sources: parseSources(request.sourceInputs),
        });
        const draft = input.adapter === "invoke_llm" ? await createLiveDraft(intake) : createDeterministicMockDraft(intake);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The workflow data service is unavailable." });
        await db.insert(workflowExecutions).values({
          id: randomUUID(),
          requestId: request.id,
          adapter: input.adapter,
          promptVersion: "controlled-drafting-v0.1",
          modelName: input.adapter === "invoke_llm" ? "runtime-discovered" : "deterministic-mock-v0.1",
          draftText: draft.draftText,
          citedSources: JSON.stringify(draft.citedSources),
          limitations: JSON.stringify(draft.limitations),
          uncertaintyFlags: JSON.stringify(draft.uncertaintyFlags),
        });
        await recordTransition({ projectId: request.projectId, requestId: request.id, actorUserId: ctx.user.id, eventType: "DRAFT_GENERATED", fromState: "POLICY_DECIDED", toState: "DRAFT_GENERATED", payload: { adapter: input.adapter, promptVersion: "controlled-drafting-v0.1" } });
        return { success: true, evidenceState: "draft" };
      }),
    validate: protectedProcedure.input(requestIdSchema).mutation(async ({ ctx, input }) => {
      requireUser(ctx.user);
      const request = await getAuthorizedRequest(ctx.user.id, input.requestId, ["author", "reviewer", "admin"]);
      if (request.state !== "DRAFT_GENERATED") throw new TRPCError({ code: "CONFLICT", message: "Draft validation is only permitted after a draft has been generated." });
      const execution = await getLatestExecution(request.id);
      const validation = validateDraftContent(execution.draftText, JSON.parse(execution.limitations), JSON.parse(execution.uncertaintyFlags));
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The workflow data service is unavailable." });
      await db.update(workflowExecutions).set({ validationSummary: JSON.stringify(validation) }).where(eq(workflowExecutions.id, execution.id));
      await recordTransition({ projectId: request.projectId, requestId: request.id, actorUserId: ctx.user.id, eventType: "OUTPUT_VALIDATED", fromState: "DRAFT_GENERATED", toState: "OUTPUT_VALIDATED", payload: validation });
      if (!validation.valid) {
        await recordTransition({ projectId: request.projectId, requestId: request.id, actorUserId: ctx.user.id, eventType: "VALIDATION_FAILED", fromState: "OUTPUT_VALIDATED", toState: "VALIDATION_FAILED", payload: validation });
        return { valid: false, failures: validation.failures };
      }
      await recordTransition({ projectId: request.projectId, requestId: request.id, actorUserId: ctx.user.id, eventType: "REVIEW_REQUIRED", fromState: "OUTPUT_VALIDATED", toState: "AWAITING_HUMAN_REVIEW", payload: { requiresHumanReview: true } });
      return { valid: true, failures: [] };
    }),
  }),

  review: router({
    queue: protectedProcedure.query(async ({ ctx }) => {
      requireUser(ctx.user);
      return listReviewQueue(ctx.user.id);
    }),
    decisions: protectedProcedure.input(requestIdSchema).query(async ({ ctx, input }) => {
      requireUser(ctx.user);
      return listReviewDecisions(ctx.user.id, input.requestId);
    }),
    authorizeGeneration: protectedProcedure
      .input(z.object({ requestId: z.string().uuid(), rationale: z.string().trim().min(12).max(2000) }))
      .mutation(async ({ ctx, input }) => {
        requireUser(ctx.user);
        const request = await getAuthorizedRequest(ctx.user.id, input.requestId, ["reviewer", "admin"]);
        const membership = await requireWorkspaceRole(ctx.user.id, request.projectId, ["reviewer", "admin"]);
        if (!canAuthorizePreGeneration(membership.role, request.state, request.requiresPreGenerationApproval, Boolean(request.preGenerationApprovedBy))) {
          throw new TRPCError({ code: "CONFLICT", message: "This request cannot receive a pre-generation reviewer authorization in its current state." });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The review data service is unavailable." });
        await db.update(draftingRequests).set({ preGenerationApprovedBy: ctx.user.id, preGenerationApprovedAt: new Date(), preGenerationRationale: input.rationale }).where(eq(draftingRequests.id, request.id));
        await recordTransition({ projectId: request.projectId, requestId: request.id, actorUserId: ctx.user.id, eventType: "PRE_GENERATION_AUTHORIZED", fromState: "AWAITING_PRE_GENERATION_APPROVAL", toState: "POLICY_DECIDED", payload: { rationale: input.rationale } });
        return { success: true };
      }),
    decide: protectedProcedure
      .input(z.object({ requestId: z.string().uuid(), decision: z.enum(["APPROVED", "REJECTED"]), rationale: z.string().trim().min(12).max(2000) }))
      .mutation(async ({ ctx, input }) => {
        requireUser(ctx.user);
        const request = await getAuthorizedRequest(ctx.user.id, input.requestId, ["reviewer", "admin"]);
        if (request.state !== "AWAITING_HUMAN_REVIEW") throw new TRPCError({ code: "CONFLICT", message: "A review decision is only permitted while the request is awaiting human review." });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The review data service is unavailable." });
        await db.insert(reviewDecisions).values({ id: randomUUID(), requestId: request.id, reviewerId: ctx.user.id, decision: input.decision, rationale: input.rationale });
        await recordTransition({ projectId: request.projectId, requestId: request.id, actorUserId: ctx.user.id, eventType: "REVIEW_DECISION", fromState: "AWAITING_HUMAN_REVIEW", toState: input.decision, payload: { decision: input.decision, rationale: input.rationale } });
        return { success: true, state: input.decision };
      }),
  }),

  artifacts: router({
    list: protectedProcedure.input(requestIdSchema).query(async ({ ctx, input }) => {
      requireUser(ctx.user);
      return listReleasedArtifacts(ctx.user.id, input.requestId);
    }),
    release: protectedProcedure
      .input(z.object({ requestId: z.string().uuid(), format: z.enum(["markdown", "json"]) }))
      .mutation(async ({ ctx, input }) => {
        requireUser(ctx.user);
        const request = await getAuthorizedRequest(ctx.user.id, input.requestId, ["author", "reviewer", "admin"]);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The release data service is unavailable." });
        const [approval] = await db
          .select()
          .from(reviewDecisions)
          .where(and(eq(reviewDecisions.requestId, request.id), eq(reviewDecisions.decision, "APPROVED")))
          .orderBy(desc(reviewDecisions.createdAt))
          .limit(1);
        if (!canReleaseArtifact(request.state, Boolean(approval))) throw new TRPCError({ code: "CONFLICT", message: "Only an approved request with a recorded reviewer approval may be released." });
        const execution = await getLatestExecution(request.id);
        const releasedAt = new Date();
        const version = "0.1.0";
        const markdown = buildMarkdownExport({ projectId: request.projectId, request, execution, version, releasedAt });
        const content = input.format === "markdown" ? markdown : JSON.stringify({
          provenance: { projectId: request.projectId, requestId: request.id, version, timestamp: releasedAt.toISOString(), evidenceState: "released", reviewerDecisionId: approval.id },
          draft: execution.draftText,
          sources: parseSources(execution.citedSources),
          limitations: JSON.parse(execution.limitations),
          uncertaintyFlags: JSON.parse(execution.uncertaintyFlags),
        }, null, 2);
        const digest = createHash("sha256").update(content).digest("hex");
        const artifactId = randomUUID();
        await db.insert(releasedArtifacts).values({ id: artifactId, requestId: request.id, version, format: input.format, content, limitations: execution.limitations, digest, releasedBy: ctx.user.id });
        await recordTransition({ projectId: request.projectId, requestId: request.id, actorUserId: ctx.user.id, eventType: "ARTIFACT_RELEASED", fromState: "APPROVED", toState: "RELEASED", payload: { artifactId, format: input.format, digest, reviewerDecisionId: approval.id } });
        return { artifactId, content, digest, format: input.format };
      }),
  }),

  audit: router({
    byRequest: protectedProcedure.input(requestIdSchema).query(async ({ ctx, input }) => {
      requireUser(ctx.user);
      return getRequestAudit(ctx.user.id, input.requestId);
    }),
  }),

  administration: router({
    policies: protectedProcedure.input(projectIdSchema).query(async ({ ctx, input }) => {
      requireUser(ctx.user);
      return listProjectPolicies(ctx.user.id, input.projectId);
    }),
    createPolicy: protectedProcedure
      .input(z.object({ projectId: z.string().uuid(), name: z.string().trim().min(3).max(160), version: z.string().trim().min(3).max(48) }))
      .mutation(async ({ ctx, input }) => {
        requireUser(ctx.user);
        await requireWorkspaceRole(ctx.user.id, input.projectId, ["admin"]);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The policy data service is unavailable." });
        await db.insert(policyVersions).values({
          id: randomUUID(),
          projectId: input.projectId,
          name: input.name,
          version: input.version,
          policyJson: JSON.stringify({ credentialScreening: true, reviewerApprovalRequiredForRelease: true, externalToolsPermitted: false }),
          createdBy: ctx.user.id,
        });
        await appendAuditEvent({ projectId: input.projectId, actorUserId: ctx.user.id, eventType: "POLICY_VERSION_CREATED", payload: { name: input.name, version: input.version } });
        return { success: true };
      }),
  }),
});
