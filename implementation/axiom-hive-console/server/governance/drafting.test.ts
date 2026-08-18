/**
 * Axiom Hive Technology — Project attribution: Alexis M. Adams and Nicholas Michael Grossi.
 * Research assistance: Manus AI. Attribution does not determine ownership or rights.
 */

import { describe, expect, it } from "vitest";
import { createDeterministicMockDraft } from "./drafting";

const intake = {
  projectId: "4af1ffc0-0f14-44f3-8334-bab7a6e7d8be",
  title: "Controlled policy memorandum",
  intendedUse: "Prepare a source-backed internal draft for reviewer assessment.",
  sensitivity: "internal" as const,
  actionCategory: "internal_draft" as const,
  sources: [{ label: "NIST AI RMF", url: "https://www.nist.gov/itl/ai-risk-management-framework" }],
};

describe("deterministic mock drafting adapter", () => {
  it("returns repeatable structured content for the same intake", () => {
    expect(createDeterministicMockDraft(intake)).toEqual(createDeterministicMockDraft(intake));
  });

  it("returns source metadata, limitations, and uncertainty flags", () => {
    const result = createDeterministicMockDraft(intake);
    expect(result.citedSources).toEqual(intake.sources);
    expect(result.limitations.length).toBeGreaterThan(0);
    expect(result.uncertaintyFlags.length).toBeGreaterThan(0);
  });
});
