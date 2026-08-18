/**
 * Axiom Hive Technology — Project attribution: Alexis M. Adams and Nicholas Michael Grossi.
 * Research assistance: Manus AI. Attribution does not determine ownership or rights.
 */

import { afterEach, describe, expect, it } from "vitest";
import { auditEvents, draftingRequests, policyVersions, projectMembers, projects, releasedArtifacts, reviewDecisions, workflowExecutions } from "../../drizzle/schema";
import { asc, eq } from "drizzle-orm";
import { getDb } from "../db";
import { appRouter } from "../routers";
import { verifyAuditLink } from "../governance/audit";
import type { TrpcContext } from "../_core/context";

const administratorId = 930001;
const reviewerId = 930002;
const outsiderId = 930003;
let projectId = "";
let requestId = "";

function contextFor(userId: number): TrpcContext {
  return {
    user: { id: userId, openId: `test-workflow-${userId}`, name: `Workflow test ${userId}`, email: null, loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

afterEach(async () => {
  const db = await getDb();
  if (!db || !projectId) return;
  if (requestId) {
    await db.delete(releasedArtifacts).where(eq(releasedArtifacts.requestId, requestId));
    await db.delete(reviewDecisions).where(eq(reviewDecisions.requestId, requestId));
    await db.delete(workflowExecutions).where(eq(workflowExecutions.requestId, requestId));
    await db.delete(draftingRequests).where(eq(draftingRequests.id, requestId));
  }
  await db.delete(auditEvents).where(eq(auditEvents.projectId, projectId));
  await db.delete(policyVersions).where(eq(policyVersions.projectId, projectId));
  await db.delete(projectMembers).where(eq(projectMembers.projectId, projectId));
  await db.delete(projects).where(eq(projects.id, projectId));
  projectId = "";
  requestId = "";
});

describe("governance protected workflow integration", () => {
  it("requires high-impact authorization before drafting, denies cross-project access, and releases only after reviewer approval", async () => {
    const administrator = appRouter.createCaller(contextFor(administratorId));
    const reviewer = appRouter.createCaller(contextFor(reviewerId));
    const outsider = appRouter.createCaller(contextFor(outsiderId));

    const project = await administrator.governance.projects.create({ name: "High-impact workflow integration", description: "Synthetic end-to-end test workspace" });
    projectId = project.projectId;
    await administrator.governance.projects.addMember({ projectId, userId: reviewerId, role: "reviewer" });

    const submitted = await administrator.governance.requests.submit({
      projectId,
      title: "High-impact controlled drafting test",
      intendedUse: "Prepare a synthetic high-impact draft to validate human authorization and release controls.",
      sensitivity: "internal",
      actionCategory: "high_impact",
      sources: [{ label: "Synthetic source", url: "https://example.test/governance" }],
    });
    requestId = submitted.requestId;
    expect(submitted.requiresPreGenerationApproval).toBe(true);

    const preGenerationRequest = await administrator.governance.requests.get({ requestId });
    expect(preGenerationRequest.request.state).toBe("AWAITING_PRE_GENERATION_APPROVAL");
    await expect(administrator.governance.requests.generate({ requestId, adapter: "deterministic_mock" })).rejects.toMatchObject({ code: "CONFLICT" });

    await expect(outsider.governance.requests.get({ requestId })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(outsider.governance.artifacts.list({ requestId })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(outsider.governance.audit.byRequest({ requestId })).rejects.toMatchObject({ code: "FORBIDDEN" });

    await reviewer.governance.review.authorizeGeneration({ requestId, rationale: "The synthetic high-impact request is authorized to proceed to controlled draft generation for testing." });
    await administrator.governance.requests.generate({ requestId, adapter: "deterministic_mock" });
    await administrator.governance.requests.validate({ requestId });
    await reviewer.governance.review.decide({ requestId, decision: "APPROVED", rationale: "The synthetic draft passed the defined prototype review gate for test release." });
    const artifact = await administrator.governance.artifacts.release({ requestId, format: "json" });
    expect(artifact.format).toBe("json");
    expect(artifact.content).toContain('"evidenceState": "released"');

    const finalRequest = await administrator.governance.requests.get({ requestId });
    expect(finalRequest.request.state).toBe("RELEASED");

    const db = await getDb();
    const chain = await db!.select().from(auditEvents).where(eq(auditEvents.projectId, projectId)).orderBy(asc(auditEvents.eventOrder));
    expect(chain.length).toBeGreaterThanOrEqual(10);
    for (const [index, event] of chain.entries()) {
      expect(verifyAuditLink({ previousHash: event.previousHash, payloadHash: event.payloadHash, eventType: event.eventType, requestId: event.requestId, createdAt: event.createdAt, integrityHash: event.integrityHash })).toBe(true);
      if (index > 0) expect(event.previousHash).toBe(chain[index - 1]?.integrityHash);
    }
  }, 20_000);
});
