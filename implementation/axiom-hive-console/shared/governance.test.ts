/**
 * Axiom Hive Technology — Project attribution: Alexis M. Adams and Nicholas Michael Grossi.
 * Research assistance: Manus AI. Attribution does not determine ownership or rights.
 */

import { describe, expect, it } from "vitest";
import { canReleaseArtifact, isAllowedTransition } from "./governance";

describe("governance workflow invariants", () => {
  it("permits only declared workflow state transitions", () => {
    expect(isAllowedTransition("DRAFT_REQUEST", "INTAKE_VALIDATED")).toBe(true);
    expect(isAllowedTransition("POLICY_DECIDED", "DRAFT_GENERATED")).toBe(true);
    expect(isAllowedTransition("DRAFT_GENERATED", "RELEASED")).toBe(false);
    expect(isAllowedTransition("REJECTED", "DRAFT_GENERATED")).toBe(false);
  });

  it("requires both approved state and recorded reviewer approval for release", () => {
    expect(canReleaseArtifact("APPROVED", true)).toBe(true);
    expect(canReleaseArtifact("APPROVED", false)).toBe(false);
    expect(canReleaseArtifact("AWAITING_HUMAN_REVIEW", true)).toBe(false);
    expect(canReleaseArtifact("REJECTED", true)).toBe(false);
  });
});
