# Axiom Hive / XPII Reference Implementation and Validation Record

**Document status:** Bounded reference-prototype implementation record; not a production assurance case, security certification, legal opinion, compliance attestation, or evidence-admissibility determination.
**Project attribution:** Axiom Hive Technology. Alexis M. Adams and Nicholas Michael Grossi are identified as project contributors in the supplied materials. Research assistance: Manus AI. This statement does not determine ownership or rights.
**Version:** 0.1.0 — controlled public release
**Review date:** August 18, 2026

## 1. Purpose and system boundary

This record identifies the code, tests, and defined limits of the Axiom Hive / XPII governance-console reference prototype. The prototype demonstrates a **policy-governed drafting and review workflow** across project-scoped workspaces. It separates deterministic software controls from optional model-derived drafting and requires recorded human authorization at defined stages.

The implementation source is maintained at [`implementation/axiom-hive-console/`](../implementation/axiom-hive-console/). It includes a React and TypeScript interface, Express/tRPC server procedures, Drizzle schema and migrations, database-backed workflow records, and Vitest specifications. The source directory intentionally excludes generated dependencies, build output, runtime logs, local project metadata, and environment files.

> **Boundary statement.** A passing prototype test demonstrates only the bounded behavior exercised by that test in its test environment. It does not establish factual truth, legal compliance, security, safety, privacy compliance, legal admissibility, production readiness, or absence of residual risk.

| In scope for version 0.1 | Explicitly outside the version 0.1 boundary |
|---|---|
| Isolated project workspaces, project roles, policy-gated intake, deterministic mock drafting, optional server-side `invokeLLM` drafting, reviewer approvals, integrity-linked audit events, and controlled Markdown/JSON export. | Payments, payment credentials, external tool execution, browser automation, webhooks, autonomous actions, production data ingestion, regulated-data processing, PDF rendering, external publishing, and production incident operations. |

## 2. Implemented architecture and trust boundaries

The prototype contains distinct layers for project authorization, policy evaluation, workflow execution, drafting, validation, human review, audit recording, and controlled export. Browser components present permitted actions but do not grant authority. Material checks execute in protected tRPC procedures on the server.

| Component | Source location | Implemented responsibility | Control boundary |
|---|---|---|---|
| Workspace roles and workflow model | `shared/governance.ts` | Defines author, reviewer, and administrator roles; allowed states; allowed transitions; release and pre-generation eligibility checks. | A client cannot define a new allowed transition or release condition. |
| Data model | `drizzle/schema.ts` | Stores projects, memberships, policy versions, requests, executions, review decisions, releases, and audit events. | Project identifiers and server-side membership checks scope records. |
| Workspace authorization | `server/governance/repository.ts` | Resolves authorized membership and requires role-specific access before request, review, audit, policy, or artifact access. | Cross-project access is denied by protected procedures. |
| Intake policy | `server/governance/policy.ts` | Validates schema, detects credential-like values, classifies high-impact inputs, and validates required limitations and uncertainty labels. | Pattern screening is a bounded guardrail; it is not a complete classification system. |
| Draft adapter | `server/governance/drafting.ts` | Provides a deterministic mock adapter and an optional server-side `invokeLLM` structured drafting path with no tools. | The mock adapter is default for tests; model-derived content is separately labelled and reviewed. |
| Workflow and review procedures | `server/routers/governance.ts` | Enforces protected state transitions, pre-generation authorization, reviewer decision recording, and release gating. | No artifact reaches `RELEASED` unless its state is `APPROVED` and a reviewer approval record exists. |
| Integrity-linked audit service | `server/governance/audit.ts` | Appends payload hashes, preceding-event hashes, and a per-project monotonic event order. | The design supports later reconstruction; it is not claimed to provide immutable storage or legal sufficiency. |
| User interface | `client/src/` | Provides dashboard navigation for Projects, Drafting Requests, Review Queue, Audit Log, and Administration. | User-interface visibility is not used as an access-control decision. |

## 3. Workflow and authority allocation

For ordinary requests, the enforced workflow is:

```text
DRAFT_REQUEST → INTAKE_VALIDATED → POLICY_DECIDED → DRAFT_GENERATED
→ OUTPUT_VALIDATED → AWAITING_HUMAN_REVIEW → APPROVED or REJECTED → RELEASED
```

For high-impact or restricted requests, the system introduces the explicit additional gate below before generation:

```text
POLICY_DECIDED → AWAITING_PRE_GENERATION_APPROVAL → POLICY_DECIDED
```

The reviewer or administrator records pre-generation authorization. The author may then submit the approved request to the configured drafting adapter. Separately, a reviewer or administrator records the final `APPROVED` or `REJECTED` decision. The export procedure independently checks both the `APPROVED` request state and a persisted `APPROVED` reviewer decision before it creates an artifact.

| Role | Permitted reference-prototype functions | Functions not granted by the prototype |
|---|---|---|
| Author | Create authorized project work, submit drafting requests, generate permitted drafts, validate outputs, and request release after approval. | Author does not grant final reviewer approval or bypass a high-impact pre-generation gate. |
| Reviewer | Record pre-generation authorization for designated requests and record final approval or rejection. | Reviewer role does not create external consequences or make a legal, regulatory, or factual finding. |
| Administrator | Create workspaces, manage project membership and roles, record policy versions, and perform reviewer functions where assigned. | Administrator access is still constrained by the project boundary and protected procedures. |

## 4. Requirements traceability

The following table maps the core architecture requirements, **AR-01** through **AR-07**, to source components and executed evidence. The listed evidence identifies prototype verification only.

| Identifier | Reference-prototype implementation | Primary evidence |
|---|---|---|
| **AR-01** | `intakeSchema` validates title, intended use, sensitivity, action category, project ID, and source metadata before request persistence. | `server/governance/policy.test.ts`; end-to-end workflow integration test. |
| **AR-02** | `draftingRequests`, `workflowExecutions`, and `auditEvents` retain policy version, prompt version, adapter/model descriptor, state, and event context. | `drizzle/schema.ts`; `server/routers/governance.workflow.integration.test.ts`. |
| **AR-03** | `evaluateIntakePolicy` rejects credential-like patterns and routes high-impact or restricted requests to `AWAITING_PRE_GENERATION_APPROVAL`. | `server/governance/policy.ts`; `server/governance/policy.test.ts`; `server/governance/workflow.test.ts`. |
| **AR-04** | `authorizeGeneration`, `review.decide`, and `artifacts.release` require protected reviewer/administrator paths and recorded approval before the relevant transition. | `server/routers/governance.ts`; `server/routers/governance.release.test.ts`. |
| **AR-05** | `appendAuditEvent` records material events with payload hash, preceding hash, per-project order, state context, actor, and timestamp. | `server/governance/audit.ts`; end-to-end audit-chain assertion. |
| **AR-06** | The prototype captures only defined intake metadata; test fixtures are synthetic; the source tree excludes environment files and generated logs. | `server/governance/policy.ts`; repository source-tree review; controlled source copy procedure. |
| **AR-07** | The initial implementation has no external tools, webhooks, payment systems, or third-party execution interfaces. The optional model call occurs only server-side via `invokeLLM` with structured output and no tool definitions. | `server/governance/drafting.ts`; source review. |

The following table maps the validation requirements, **VV-01** through **VV-07**, to the current prototype evidence set.

| Identifier | Validation evidence | Recorded result on August 18, 2026 |
|---|---|---|
| **VV-01** | This document maps architecture and validation identifiers to modules and tests. | Traceability table completed for the bounded reference prototype. |
| **VV-02** | Unit tests cover valid intake, high-impact routing, credential-like rejection, validation failures, and allowed/blocked state transitions. | Passed in the current Vitest suite. |
| **VV-03** | Database-backed integration tests exercise high-impact authorization, final review approval, blocked release without approval, and release after approval. | Passed in the current Vitest suite. |
| **VV-04** | End-to-end integration test retrieves persisted audit records in event order and recomputes each integrity hash while checking predecessor links. | Passed in the current Vitest suite. |
| **VV-05** | Integration tests deny unauthorized membership, request, artifact, and audit access; server procedures use project-role checks. | Passed for the specified paths; not an independent penetration test. |
| **VV-06** | Synthetic test inputs and exported source tree were checked for environment files, generated logs, and generated dependency folders. | No environment files or generated source artifacts were copied to the public implementation directory. This is not a privacy-compliance assessment. |
| **VV-07** | Documentation review applies the public-claim rules in `DOCUMENT_CONTROL.md`; test fixtures and exported artifacts include limitation language. | Prototype claims remain bounded by this document and the controlling verification plan. |

## 5. Executed validation record

The following commands were executed against the reference-prototype workspace before copying the reviewed source into this repository.

| Check | Result |
|---|---|
| `pnpm test` | **Passed:** 8 test files and 17 tests. The suite includes deterministic draft output, policy routing, workflow invariants, audit hash verification, protected membership reassignment, blocked release without approval, controlled release after approval, cross-project access denial, and an end-to-end high-impact workflow. |
| `pnpm check` | **Passed:** TypeScript completed with no errors. |
| `pnpm build` | **Passed:** Vite client build and server bundle completed. The build reported a client chunk larger than 500 kB after minification; this is a performance follow-up item, not a functional failure. |
| Database migration review | **Completed:** additive workflow-schema migrations were generated, reviewed, and applied for the controlled test database. |
| Browser interface review | **Completed:** Projects, Drafting Requests, Review Queue, Audit Log, and Administration routes were rendered and reviewed at desktop viewport. |

## 6. Known limitations and required next evidence

The reference prototype is intentionally limited. Its integrity links use an application-managed hash chain and ordered records. They may help reconstruct the recorded sequence, but they are not an immutable ledger, a qualified digital-forensics system, or evidence that any model-derived content is true. Production use would require threat modeling, transaction/concurrency analysis, durable write controls, key-management design where signing is introduced, access monitoring, retention controls, backup/recovery evidence, incident exercises, and independent technical review.

The optional live drafting path uses `invokeLLM` only from server code, with a strict output schema and no tool definitions. Automated tests use the deterministic mock adapter and do not exercise a live model response. Accordingly, this record does not make a claim about model accuracy, source support, availability, prompt-injection resilience, cost, reliability, or provider behavior.

The implementation maintains project identifiers and server-side membership checks, but a production privacy or security assessment would require an actual data inventory, data-flow review, retention/deletion implementation and evidence, user and access-lifecycle review, secrets-management review, dependency/vulnerability review, and context-specific legal analysis. These limitations are consistent with NIST’s treatment of AI risk management as voluntary, context-dependent guidance and of AI evaluation as requiring task- and context-specific evidence.[1] [2]

## 7. Change control and release rule

Any material change to the workflow states, policy logic, role model, model adapter, output schema, access controls, audit format, export format, database schema, or test results SHALL trigger a review of this record, the core specification, the security and compliance matrix, and the validation report. A release note SHALL identify the code version, migration state, tests executed, unresolved limitations, and the owner approving the release.

## 8. References

[1] National Institute of Standards and Technology. “AI Risk Management Framework.” *NIST*, https://www.nist.gov/itl/ai-risk-management-framework. Accessed 18 Aug. 2026.

[2] National Institute of Standards and Technology. “AI Test, Evaluation, Validation and Verification (TEVV).” *NIST*, https://www.nist.gov/ai-test-evaluation-validation-and-verification-tevv. Accessed 18 Aug. 2026.
