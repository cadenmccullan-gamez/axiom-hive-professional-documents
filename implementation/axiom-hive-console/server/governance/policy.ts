/**
 * Axiom Hive Technology — Project attribution: Alexis M. Adams and Nicholas Michael Grossi.
 * Research assistance: Manus AI. Attribution does not determine ownership or rights.
 */

import { actionCategoryValues, sensitivityValues, type ActionCategory, type Sensitivity, type WorkflowState } from "@shared/governance";
import { z } from "zod";

export const sourceInputSchema = z.object({
  label: z.string().trim().min(2).max(200),
  url: z.string().trim().url().max(2000),
});

export const intakeSchema = z.object({
  title: z.string().trim().min(4).max(200),
  intendedUse: z.string().trim().min(12).max(2000),
  sensitivity: z.enum(sensitivityValues),
  actionCategory: z.enum(actionCategoryValues),
  sources: z.array(sourceInputSchema).min(1).max(12),
  projectId: z.string().uuid(),
});

export type Intake = z.infer<typeof intakeSchema>;

export type PolicyDecision = {
  decision: "ALLOW" | "REVIEW_REQUIRED" | "REJECT";
  requiresHumanReview: boolean;
  requiresPreGenerationApproval: boolean;
  reasons: string[];
  nextState: WorkflowState;
};

const credentialLikePatterns: RegExp[] = [
  /-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----/i,
  /\b(?:sk|pk|rk)_[A-Za-z0-9_-]{16,}\b/,
  /\b(?:api[_-]?key|access[_-]?token|secret|password)\s*[:=]\s*[^\s]{8,}/i,
  /\b(?:\d[ -]*?){13,19}\b/,
];

export function containsCredentialLikeValue(value: string) {
  return credentialLikePatterns.some(pattern => pattern.test(value));
}

export function evaluateIntakePolicy(intake: Intake): PolicyDecision {
  const serialized = JSON.stringify(intake);
  if (containsCredentialLikeValue(serialized)) {
    return {
      decision: "REJECT",
      requiresHumanReview: true,
      requiresPreGenerationApproval: false,
      reasons: ["The intake contains a value that matches a credential or payment-account-data pattern."],
      nextState: "REJECTED",
    };
  }

  const requiresPreGenerationApproval =
    intake.actionCategory === "high_impact" ||
    intake.actionCategory === "restricted" ||
    intake.sensitivity === "restricted";
  const requiresHumanReview =
    requiresPreGenerationApproval ||
    intake.actionCategory === "external_release" ||
    intake.sensitivity === "confidential";

  const reasons = requiresPreGenerationApproval
    ? ["The declared action category or sensitivity requires a recorded reviewer authorization before draft generation and a separate approval before release."]
    : requiresHumanReview
    ? ["The declared action category or sensitivity requires a recorded human review before release."]
    : ["The request may proceed to drafting, but a reviewer approval is still required before release."];

  return {
    decision: requiresHumanReview ? "REVIEW_REQUIRED" : "ALLOW",
    requiresHumanReview,
    requiresPreGenerationApproval,
    reasons,
    nextState: requiresPreGenerationApproval ? "AWAITING_PRE_GENERATION_APPROVAL" : "DRAFT_GENERATED",
  };
}

export function isHighImpactAction(actionCategory: ActionCategory, sensitivity: Sensitivity) {
  return actionCategory !== "internal_draft" || sensitivity === "confidential" || sensitivity === "restricted";
}

const prohibitedClaimPatterns = [
  /\bfully compliant\b/i,
  /\bguarantee(?:s|d)?\b/i,
  /\bzero risk\b/i,
  /\blegally admissible\b/i,
  /\bdeterministic truth\b/i,
];

export function validateDraftContent(draftText: string, limitations: string[], uncertaintyFlags: string[]) {
  const failures: string[] = [];
  if (draftText.trim().length < 40) failures.push("The draft did not meet the minimum content length.");
  if (limitations.length === 0) failures.push("A limitations statement is required.");
  if (uncertaintyFlags.length === 0) failures.push("At least one uncertainty or review flag is required.");
  if (prohibitedClaimPatterns.some(pattern => pattern.test(draftText))) {
    failures.push("The draft contains an unsupported assurance or legal-effect claim.");
  }
  return { valid: failures.length === 0, failures };
}
