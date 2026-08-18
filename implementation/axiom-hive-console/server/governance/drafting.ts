/**
 * Axiom Hive Technology — Project attribution: Alexis M. Adams and Nicholas Michael Grossi.
 * Research assistance: Manus AI. Attribution does not determine ownership or rights.
 */

import { invokeLLM, listLLMModels } from "../_core/llm";
import { z } from "zod";
import type { Intake } from "./policy";

export const draftOutputSchema = z.object({
  draftText: z.string().min(40),
  citedSources: z.array(z.object({ label: z.string().min(2), url: z.string().url() })).min(1),
  limitations: z.array(z.string().min(8)).min(1),
  uncertaintyFlags: z.array(z.string().min(8)).min(1),
});

export type DraftOutput = z.infer<typeof draftOutputSchema>;

export function createDeterministicMockDraft(intake: Intake): DraftOutput {
  const citations = intake.sources.map(source => ({ label: source.label, url: source.url }));
  const sourceList = citations.map(source => `- ${source.label}: ${source.url}`).join("\n");
  return {
    draftText: `# ${intake.title}\n\n## Intended use\n${intake.intendedUse}\n\n## Controlled draft\nThis deterministic test draft is generated from the declared intended use and the source metadata supplied with the request. It is prepared for review only and is not released content.\n\n## Source metadata\n${sourceList}`,
    citedSources: citations,
    limitations: [
      "This is a deterministic mock-adapter result used for repeatable testing.",
      "Source metadata is recorded but the prototype does not evaluate whether each source substantiates every statement.",
    ],
    uncertaintyFlags: [
      "Human reviewer approval is required before a controlled release can be created.",
    ],
  };
}

const liveDraftSchema = {
  type: "json_schema" as const,
  json_schema: {
    name: "axiom_hive_controlled_draft",
    strict: true,
    schema: {
      type: "object",
      properties: {
        draftText: { type: "string" },
        citedSources: {
          type: "array",
          items: {
            type: "object",
            properties: { label: { type: "string" }, url: { type: "string" } },
            required: ["label", "url"],
            additionalProperties: false,
          },
        },
        limitations: { type: "array", items: { type: "string" } },
        uncertaintyFlags: { type: "array", items: { type: "string" } },
      },
      required: ["draftText", "citedSources", "limitations", "uncertaintyFlags"],
      additionalProperties: false,
    },
  },
};

export async function createLiveDraft(intake: Intake): Promise<DraftOutput> {
  const { data: models } = await listLLMModels();
  const model = models.find(candidate => candidate.id.startsWith("gpt-5-mini"))?.id ?? models[0]?.id;
  if (!model) throw new Error("No model is available for the configured drafting path.");

  const response = await invokeLLM({
    model,
    messages: [
      {
        role: "system",
        content: "Create a controlled drafting output. Treat source metadata as unverified input. Do not claim compliance, certification, legal admissibility, safety, or factual certainty. Include clear limitations and uncertainty flags. Do not invoke tools or propose external actions.",
      },
      {
        role: "user",
        content: JSON.stringify({
          title: intake.title,
          intendedUse: intake.intendedUse,
          sensitivity: intake.sensitivity,
          actionCategory: intake.actionCategory,
          sources: intake.sources,
        }),
      },
    ],
    response_format: liveDraftSchema,
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string") throw new Error("The model response did not contain structured draft content.");
  return draftOutputSchema.parse(JSON.parse(content));
}
