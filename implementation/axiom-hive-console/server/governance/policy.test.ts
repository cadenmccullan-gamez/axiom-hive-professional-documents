/**
 * Axiom Hive Technology — Project attribution: Alexis M. Adams and Nicholas Michael Grossi.
 * Research assistance: Manus AI. Attribution does not determine ownership or rights.
 */

import { describe, expect, it } from "vitest";
import { evaluateIntakePolicy, intakeSchema, validateDraftContent } from "./policy";

const baseIntake = {
  projectId: "4af1ffc0-0f14-44f3-8334-bab7a6e7d8be",
  title: "Controlled policy memorandum",
  intendedUse: "Prepare a source-backed internal draft for reviewer assessment.",
  sensitivity: "internal" as const,
  actionCategory: "internal_draft" as const,
  sources: [{ label: "NIST AI RMF", url: "https://www.nist.gov/itl/ai-risk-management-framework" }],
};

describe("intake policy controls", () => {
  it("accepts a structurally valid internal drafting intake", () => {
    const intake = intakeSchema.parse(baseIntake);
    const result = evaluateIntakePolicy(intake);
    expect(result.decision).toBe("ALLOW");
    expect(result.nextState).toBe("DRAFT_GENERATED");
  });

  it("routes declared high-impact use to a human-review requirement", () => {
    const intake = intakeSchema.parse({ ...baseIntake, actionCategory: "high_impact" });
    const result = evaluateIntakePolicy(intake);
    expect(result.decision).toBe("REVIEW_REQUIRED");
    expect(result.requiresHumanReview).toBe(true);
    expect(result.requiresPreGenerationApproval).toBe(true);
    expect(result.nextState).toBe("AWAITING_PRE_GENERATION_APPROVAL");
  });

  it("rejects a credential-like value in the intake", () => {
    const intake = intakeSchema.parse({ ...baseIntake, intendedUse: "Use this sk_123456789012345678901234 secret in a draft." });
    const result = evaluateIntakePolicy(intake);
    expect(result.decision).toBe("REJECT");
    expect(result.nextState).toBe("REJECTED");
  });

  it("fails validation without required limitations and uncertainty flags", () => {
    const result = validateDraftContent("A sufficiently long controlled draft text that otherwise has no required reviewer disclosures.", [], []);
    expect(result.valid).toBe(false);
    expect(result.failures).toHaveLength(2);
  });
});
