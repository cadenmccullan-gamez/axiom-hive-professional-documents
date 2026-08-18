# Axiom Hive / XPII Professional Documents

**Project attribution:** Axiom Hive Technology. Alexis M. Adams and Nicholas Michael Grossi are identified as contributors in the supplied materials. Research assistance: Manus AI. Publication does not determine authorship, ownership, licensing, or intellectual-property rights.

This public repository contains a curated, source-controlled Axiom Hive / XPII documentation set and a bounded governance-workflow reference prototype. The materials are organized for technical review, stakeholder discussion, and controlled implementation planning. They are not a product certification, legal opinion, regulatory determination, security attestation, valuation opinion, or evidence-admissibility conclusion.

## Contents

| Path | Purpose |
|---|---|
| `01_Current_Technical_Classification_Memorandum/` | Current evidence-based technical classification memorandum and editable Typst source. |
| `02_Master_Specification_Suite/` | Controlled core specification, security/control matrix, commercial-planning framework, executive brief, validation plan, and Document 06 reference-implementation record. |
| `03_Research_and_Assessment/` | Corrected governance specification and source-controlled research summary. |
| `implementation/axiom-hive-console/` | TypeScript full-stack reference prototype for project-scoped, policy-governed drafting, review, traceability, and controlled release. |
| `DOCUMENT_CONTROL.md` | Authority order, publication status, claim boundaries, and change-control requirements. |
| `releases/` | Current controlled ZIP package and SHA-256 integrity checksum. |

## Controlled implementation status

The governance console is a **reference prototype**. It implements protected project roles, project-scoped access checks, structured intake, deterministic policy gates, a high-impact pre-generation reviewer gate, optional server-side structured drafting through `invokeLLM`, final human-review approval, integrity-linked audit records, and controlled Markdown/JSON exports. Review `02_Master_Specification_Suite/06_Reference_Implementation_and_Validation_Record.md` for the requirement-to-code mapping, executed test evidence, and known limitations.

> The reference prototype does not establish that Axiom Hive / XPII is secure, safe, compliant, certified, production-ready, legally admissible, or capable of determining substantive truth. It does not include payments, payment credentials, external tool execution, browser automation, autonomous actions, production data ingestion, or regulated-data processing.

## Run the reference prototype locally

The prototype uses Node.js, pnpm, a MySQL-compatible database, and the supported project environment values supplied by its hosting template. Do not commit `.env` files or credentials.

```bash
cd implementation/axiom-hive-console
pnpm install
pnpm drizzle-kit generate
# Review the generated SQL, then apply it to an approved development database.
pnpm test
pnpm check
pnpm build
pnpm dev
```

The deterministic mock adapter is the default route for tests. The optional live drafting path is server-side only and calls `invokeLLM` with a strict output schema and no tool definitions. It should be enabled only under an approved operating policy with appropriate monitoring and cost controls.

## Publication status

The technical classification memorandum controls public use of the **HADFI** designation. It treats HADFI as an internal project designation and proposed technical characterization; it does not represent an externally recognized classification, implementation audit, legal opinion, regulatory certification, or safety-assurance case.

All public statements about a technical capability, regulatory status, security property, payment control, commercial value, or legal/evidentiary effect must satisfy the requirements in [`DOCUMENT_CONTROL.md`](DOCUMENT_CONTROL.md). Current documents distinguish proposed requirements, reference-prototype controls, test results, and independent assessments.

## Integrity

The `releases/` directory contains the current controlled archive and checksum. Verify a downloaded archive with the filename published alongside its `.sha256` file, for example:

```bash
sha256sum -c Axiom_Hive_XPII_Controlled_Public_Document_Set.zip.sha256
```
