/**
 * Axiom Hive Technology — Project attribution: Alexis M. Adams and Nicholas Michael Grossi.
 * Research assistance: Manus AI. Attribution does not determine ownership or rights.
 */

import { createHash, randomUUID } from "crypto";
import { auditEvents } from "../../drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../db";
import type { WorkflowState } from "@shared/governance";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function appendAuditEvent(input: {
  projectId: string;
  requestId?: string;
  actorUserId: number;
  eventType: string;
  fromState?: WorkflowState;
  toState?: WorkflowState;
  payload: Record<string, unknown>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database connection is required for workflow audit records.");

  const [previousEvent] = await db
    .select()
    .from(auditEvents)
    .where(eq(auditEvents.projectId, input.projectId))
    .orderBy(desc(auditEvents.eventOrder))
    .limit(1);

  // MySQL TIMESTAMP defaults to second precision in this schema. Hash the same precision that is persisted.
  const createdAt = new Date(Math.floor(Date.now() / 1000) * 1000);
  const payloadHash = sha256(JSON.stringify(input.payload));
  const previousHash = previousEvent?.integrityHash ?? "GENESIS";
  const eventOrder = (previousEvent?.eventOrder ?? 0) + 1;
  const integrityHash = sha256(
    `${previousHash}|${payloadHash}|${input.eventType}|${input.requestId ?? ""}|${createdAt.toISOString()}`,
  );

  const record = {
    eventOrder,
    id: randomUUID(),
    projectId: input.projectId,
    requestId: input.requestId ?? null,
    actorUserId: input.actorUserId,
    eventType: input.eventType,
    fromState: input.fromState ?? null,
    toState: input.toState ?? null,
    payloadHash,
    previousHash,
    integrityHash,
    createdAt,
  };

  await db.insert(auditEvents).values(record);
  return record;
}

export function verifyAuditLink(input: { previousHash: string; payloadHash: string; eventType: string; requestId?: string | null; createdAt: Date; integrityHash: string }) {
  const computed = sha256(`${input.previousHash}|${input.payloadHash}|${input.eventType}|${input.requestId ?? ""}|${input.createdAt.toISOString()}`);
  return computed === input.integrityHash;
}
