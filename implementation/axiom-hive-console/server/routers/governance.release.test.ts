/**
 * Axiom Hive Technology — Project attribution: Alexis M. Adams and Nicholas Michael Grossi.
 * Research assistance: Manus AI. Attribution does not determine ownership or rights.
 */

import { randomUUID } from "crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { auditEvents, draftingRequests, projectMembers, projects, releasedArtifacts, reviewDecisions, workflowExecutions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

const administratorId = 920001;
const reviewerId = 920002;
let projectId = "";
let requestId = "";

function contextFor(userId: number): TrpcContext {
  return {
    user: { id: userId, openId: `test-release-${userId}`, name: `Release test ${userId}`, email: null, loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

beforeEach(async () => {
  const db = await getDb();
  if (!db) throw new Error("Database connection is required for release integration tests.");
  projectId = randomUUID();
  requestId = randomUUID();
  await db.insert(projects).values({ id: projectId, name: "Release gate integration workspace", description: "Synthetic test workspace", createdBy: administratorId });
  await db.insert(projectMembers).values([
    { id: randomUUID(), projectId, userId: administratorId, role: "admin" },
    { id: randomUUID(), projectId, userId: reviewerId, role: "reviewer" },
  ]);
  await db.insert(draftingRequests).values({
    id: requestId,
    projectId,
    title: "Controlled release gate test",
    intendedUse: "Verify that reviewer approval is required before a prototype release.",
    sensitivity: "internal",
    actionCategory: "internal_draft",
    sourceInputs: JSON.stringify([{ label: "Test source", url: "https://example.test/source" }]),
    state: "AWAITING_HUMAN_REVIEW",
    requiresHumanReview: true,
    requiresPreGenerationApproval: false,
    submittedBy: administratorId,
  });
  await db.insert(workflowExecutions).values({
    id: randomUUID(),
    requestId,
    adapter: "deterministic_mock",
    promptVersion: "test-v1",
    modelName: "deterministic-test",
    draftText: "This synthetic draft contains enough text to satisfy the controlled export test boundary without asserting any external fact.",
    citedSources: JSON.stringify([{ label: "Test source", url: "https://example.test/source" }]),
    limitations: JSON.stringify(["Synthetic integration-test output."]),
    uncertaintyFlags: JSON.stringify(["Reviewer approval is required before release."]),
  });
});

afterEach(async () => {
  const db = await getDb();
  if (!db || !projectId) return;
  await db.delete(releasedArtifacts).where(eq(releasedArtifacts.requestId, requestId));
  await db.delete(reviewDecisions).where(eq(reviewDecisions.requestId, requestId));
  await db.delete(workflowExecutions).where(eq(workflowExecutions.requestId, requestId));
  await db.delete(auditEvents).where(eq(auditEvents.projectId, projectId));
  await db.delete(draftingRequests).where(eq(draftingRequests.id, requestId));
  await db.delete(projectMembers).where(eq(projectMembers.projectId, projectId));
  await db.delete(projects).where(eq(projects.id, projectId));
});

describe("governance.artifacts.release", () => {
  it("rejects release without a reviewer decision and releases only after the protected review approval", async () => {
    const administrator = appRouter.createCaller(contextFor(administratorId));
    const reviewer = appRouter.createCaller(contextFor(reviewerId));

    await expect(administrator.governance.artifacts.release({ requestId, format: "markdown" })).rejects.toMatchObject({ code: "CONFLICT" });

    await reviewer.governance.review.decide({ requestId, decision: "APPROVED", rationale: "The synthetic draft has been reviewed for this controlled release-gate test." });
    const released = await administrator.governance.artifacts.release({ requestId, format: "markdown" });

    expect(released.format).toBe("markdown");
    expect(released.content).toContain("evidence_state: released");
    expect(released.digest).toHaveLength(64);
    const db = await getDb();
    const artifacts = await db!.select().from(releasedArtifacts).where(eq(releasedArtifacts.requestId, requestId));
    expect(artifacts).toHaveLength(1);
  });
});
