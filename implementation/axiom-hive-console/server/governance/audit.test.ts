/**
 * Axiom Hive Technology — Project attribution: Alexis M. Adams and Nicholas Michael Grossi.
 * Research assistance: Manus AI. Attribution does not determine ownership or rights.
 */

import { createHash } from "crypto";
import { describe, expect, it } from "vitest";
import { verifyAuditLink } from "./audit";

describe("audit integrity links", () => {
  it("accepts a matching integrity link and rejects a modified payload hash", () => {
    const createdAt = new Date("2026-08-18T12:00:00.000Z");
    const previousHash = "GENESIS";
    const payloadHash = "a".repeat(64);
    const eventType = "INTAKE_SUBMITTED";
    const requestId = "test-request";
    const integrityHash = createHash("sha256").update(`${previousHash}|${payloadHash}|${eventType}|${requestId}|${createdAt.toISOString()}`).digest("hex");
    expect(verifyAuditLink({ previousHash, payloadHash, eventType, requestId, createdAt, integrityHash })).toBe(true);
    expect(verifyAuditLink({ previousHash, payloadHash: "b".repeat(64), eventType, requestId, createdAt, integrityHash })).toBe(false);
  });
});
