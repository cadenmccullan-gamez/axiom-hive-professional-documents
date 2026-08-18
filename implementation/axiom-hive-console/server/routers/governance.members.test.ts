/**
 * Axiom Hive Technology — Project attribution: Alexis M. Adams and Nicholas Michael Grossi.
 * Research assistance: Manus AI. Attribution does not determine ownership or rights.
 */

import { randomUUID } from "crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { auditEvents, projectMembers, projects } from "../../drizzle/schema";
import { and, eq } from "drizzle-orm";
import { getDb } from "../db";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

const administratorId = 910001;
const unauthorizedUserId = 910002;
const targetMemberId = 910003;
let projectId = "";

function contextFor(userId: number): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `test-user-${userId}`,
      name: `Test user ${userId}`,
      email: null,
      loginMethod: "test",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

beforeEach(async () => {
  const db = await getDb();
  if (!db) throw new Error("Database connection is required for membership integration tests.");
  projectId = randomUUID();
  await db.insert(projects).values({ id: projectId, name: "Integration test workspace", description: "Synthetic test workspace", createdBy: administratorId });
  await db.insert(projectMembers).values({ id: randomUUID(), projectId, userId: administratorId, role: "admin" });
});

afterEach(async () => {
  const db = await getDb();
  if (!db || !projectId) return;
  await db.delete(auditEvents).where(eq(auditEvents.projectId, projectId));
  await db.delete(projectMembers).where(eq(projectMembers.projectId, projectId));
  await db.delete(projects).where(eq(projects.id, projectId));
});

describe("governance.projects membership procedures", () => {
  it("denies an unauthorized user access to membership records", async () => {
    const caller = appRouter.createCaller(contextFor(unauthorizedUserId));
    await expect(caller.governance.projects.members({ projectId })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("creates a member and reassigns the same member role through the protected mutation", async () => {
    const administrator = appRouter.createCaller(contextFor(administratorId));
    await administrator.governance.projects.addMember({ projectId, userId: targetMemberId, role: "author" });
    await administrator.governance.projects.addMember({ projectId, userId: targetMemberId, role: "reviewer" });
    const members = await administrator.governance.projects.members({ projectId });
    const targetEntries = members.filter(member => member.userId === targetMemberId);
    expect(targetEntries).toHaveLength(1);
    expect(targetEntries[0]?.role).toBe("reviewer");
    const db = await getDb();
    const [roleAudit] = await db!.select().from(auditEvents).where(and(eq(auditEvents.projectId, projectId), eq(auditEvents.eventType, "PROJECT_MEMBER_ROLE_UPDATED"))).limit(1);
    expect(roleAudit?.actorUserId).toBe(administratorId);
  });
});
