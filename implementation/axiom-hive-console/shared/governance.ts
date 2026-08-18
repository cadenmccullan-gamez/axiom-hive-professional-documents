/**
 * Axiom Hive Technology — Project attribution: Alexis M. Adams and Nicholas Michael Grossi.
 * Research assistance: Manus AI. Attribution does not determine ownership or rights.
 */

export const workspaceRoles = ["author", "reviewer", "admin"] as const;
export type WorkspaceRole = (typeof workspaceRoles)[number];

export const sensitivityValues = ["public", "internal", "confidential", "restricted"] as const;
export type Sensitivity = (typeof sensitivityValues)[number];

export const actionCategoryValues = [
  "internal_draft",
  "external_release",
  "high_impact",
  "restricted",
] as const;
export type ActionCategory = (typeof actionCategoryValues)[number];

export const workflowStateValues = [
  "DRAFT_REQUEST",
  "INTAKE_VALIDATED",
  "POLICY_DECIDED",
  "AWAITING_PRE_GENERATION_APPROVAL",
  "DRAFT_GENERATED",
  "OUTPUT_VALIDATED",
  "AWAITING_HUMAN_REVIEW",
  "APPROVED",
  "REJECTED",
  "RELEASED",
  "VALIDATION_FAILED",
  "CLARIFICATION_REQUIRED",
] as const;
export type WorkflowState = (typeof workflowStateValues)[number];

export const evidenceStateValues = [
  "draft",
  "source_backed_draft",
  "human_reviewed",
  "validated_against_defined_rules",
  "released",
  "superseded",
] as const;
export type EvidenceState = (typeof evidenceStateValues)[number];

export const workflowTransitions: Record<WorkflowState, WorkflowState[]> = {
  DRAFT_REQUEST: ["INTAKE_VALIDATED"],
  INTAKE_VALIDATED: ["POLICY_DECIDED"],
  POLICY_DECIDED: ["AWAITING_PRE_GENERATION_APPROVAL", "DRAFT_GENERATED", "REJECTED", "CLARIFICATION_REQUIRED"],
  AWAITING_PRE_GENERATION_APPROVAL: ["POLICY_DECIDED", "REJECTED"],
  DRAFT_GENERATED: ["OUTPUT_VALIDATED"],
  OUTPUT_VALIDATED: ["AWAITING_HUMAN_REVIEW", "VALIDATION_FAILED"],
  AWAITING_HUMAN_REVIEW: ["APPROVED", "REJECTED"],
  APPROVED: ["RELEASED"],
  REJECTED: [],
  RELEASED: [],
  VALIDATION_FAILED: [],
  CLARIFICATION_REQUIRED: [],
};

export function isAllowedTransition(from: WorkflowState, to: WorkflowState) {
  return workflowTransitions[from].includes(to);
}

export function canReleaseArtifact(state: WorkflowState, hasRecordedReviewerApproval: boolean) {
  return state === "APPROVED" && hasRecordedReviewerApproval;
}

export function canGenerateDraft(state: WorkflowState, requiresPreGenerationApproval: boolean, hasRecordedPreGenerationApproval: boolean) {
  return state === "POLICY_DECIDED" && (!requiresPreGenerationApproval || hasRecordedPreGenerationApproval);
}

export function canAuthorizePreGeneration(role: WorkspaceRole, state: WorkflowState, requiresPreGenerationApproval: boolean, hasRecordedPreGenerationApproval: boolean) {
  return (role === "reviewer" || role === "admin") && state === "AWAITING_PRE_GENERATION_APPROVAL" && requiresPreGenerationApproval && !hasRecordedPreGenerationApproval;
}

export function canManageWorkspaceMembers(role: WorkspaceRole) {
  return role === "admin";
}

export function determineMembershipAssignment(existingRole: WorkspaceRole | undefined, nextRole: WorkspaceRole) {
  if (!existingRole) return "CREATED" as const;
  if (existingRole === nextRole) return "UNCHANGED" as const;
  return "UPDATED" as const;
}
