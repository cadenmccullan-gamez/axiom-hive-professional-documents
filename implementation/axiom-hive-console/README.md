# Axiom Hive / XPII Governance Console

**Project attribution:** Axiom Hive Technology. Alexis M. Adams and Nicholas Michael Grossi are identified as contributors in the supplied materials. Research assistance: Manus AI. This statement does not determine ownership or rights.

## Reference-prototype status

This codebase is a **bounded reference prototype** for a structured, policy-governed drafting and review workflow. It provides project-scoped access controls, author/reviewer/administrator roles, policy-gated intake, a deterministic test drafting adapter, optional server-side `invokeLLM` drafting, explicit human-approval gates, integrity-linked audit records, and controlled Markdown or JSON release artifacts.

It is not a production security service, legal decision system, compliance determination, payment system, evidentiary platform, or autonomous action service. It does not process payment credentials, invoke external tools, run browser automation, or support production data ingestion in version 0.1.

## Requirements

The implementation expects a current Node.js runtime, pnpm, a MySQL-compatible database, and the environment values supplied by the supported full-stack template. Do not commit environment files, credentials, database exports, or generated runtime logs.

## Local workflow

```bash
pnpm install
pnpm drizzle-kit generate
# Review generated SQL before applying it to an approved development database.
pnpm test
pnpm check
pnpm build
pnpm dev
```

The automated test suite uses the deterministic mock adapter. The optional live drafting route is server-side only. It calls `invokeLLM` with a strict JSON schema and no tool definitions. Do not enable it for a workflow without an approved policy, accountable owner, and appropriate monitoring.

## Core control model

| Concern | Reference-prototype control |
|---|---|
| Workspace separation | Protected tRPC procedures resolve project membership before reading or changing project records. |
| High-impact drafting | Requests enter `AWAITING_PRE_GENERATION_APPROVAL` until a reviewer or administrator records authorization. |
| Final release | The server requires both `APPROVED` workflow state and a persisted reviewer approval decision. |
| Audit traceability | Material events record payload hash, predecessor hash, actor, state context, and per-project event order. |
| Model-derived content | The mock adapter is deterministic for tests; optional model outputs are structured, server-side, and subject to output validation and human review. |

## Validation boundary

Run `pnpm test`, `pnpm check`, and `pnpm build` before a reference-prototype change is released. A successful test demonstrates only the tested behavior in its test environment. The controlling public record is [`../../02_Master_Specification_Suite/06_Reference_Implementation_and_Validation_Record.md`](../../02_Master_Specification_Suite/06_Reference_Implementation_and_Validation_Record.md).
