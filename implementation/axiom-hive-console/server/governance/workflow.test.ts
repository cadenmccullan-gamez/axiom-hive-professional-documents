/**
 * Axiom Hive Technology — Project attribution: Alexis M. Adams and Nicholas Michael Grossi.
 * Research assistance: Manus AI. Attribution does not determine ownership or rights.
 */

import { describe, expect, it } from "vitest";
import { canAuthorizePreGeneration, canGenerateDraft, canManageWorkspaceMembers, canReleaseArtifact, determineMembershipAssignment, isAllowedTransition } from "../../shared/governance";

describe("server workflow invariants", () => {
  it("permits only declared workflow state transitions", () => {
    expect(isAllowedTransition("DRAFT_REQUEST", "INTAKE_VALIDATED")).toBe(true);
    expect(isAllowedTransition("POLICY_DECIDED", "DRAFT_GENERATED")).toBe(true);
    expect(isAllowedTransition("POLICY_DECIDED", "AWAITING_PRE_GENERATION_APPROVAL")).toBe(true);
    expect(isAllowedTransition("AWAITING_PRE_GENERATION_APPROVAL", "POLICY_DECIDED")).toBe(true);
    expect(isAllowedTransition("DRAFT_GENERATED", "RELEASED")).toBe(false);
    expect(isAllowedTransition("REJECTED", "DRAFT_GENERATED")).toBe(false);
  });

  it("requires approved state and a recorded reviewer approval for release", () => {
    expect(canReleaseArtifact("APPROVED", true)).toBe(true);
    expect(canReleaseArtifact("APPROVED", false)).toBe(false);
    expect(canReleaseArtifact("AWAITING_HUMAN_REVIEW", true)).toBe(false);
    expect(canReleaseArtifact("REJECTED", true)).toBe(false);
  });

  it("blocks high-impact generation until a reviewer or administrator authorizes it", () => {
    expect(canGenerateDraft("AWAITING_PRE_GENERATION_APPROVAL", true, false)).toBe(false);
    expect(canGenerateDraft("POLICY_DECIDED", true, false)).toBe(false);
    expect(canGenerateDraft("POLICY_DECIDED", true, true)).toBe(true);
    expect(canAuthorizePreGeneration("author", "AWAITING_PRE_GENERATION_APPROVAL", true, false)).toBe(false);
    expect(canAuthorizePreGeneration("reviewer", "AWAITING_PRE_GENERATION_APPROVAL", true, false)).toBe(true);
    expect(canAuthorizePreGeneration("admin", "AWAITING_PRE_GENERATION_APPROVAL", true, false)).toBe(true);
    expect(canAuthorizePreGeneration("reviewer", "POLICY_DECIDED", true, false)).toBe(false);
  });

  it("limits membership visibility and role assignment to workspace administrators", () => {
    expect(canManageWorkspaceMembers("admin")).toBe(true);
    expect(canManageWorkspaceMembers("reviewer")).toBe(false);
    expect(canManageWorkspaceMembers("author")).toBe(false);
  });

  it("distinguishes initial membership assignment from reassignment without duplicate records", () => {
    expect(determineMembershipAssignment(undefined, "author")).toBe("CREATED");
    expect(determineMembershipAssignment("author", "reviewer")).toBe("UPDATED");
    expect(determineMembershipAssignment("reviewer", "reviewer")).toBe("UNCHANGED");
  });
});
