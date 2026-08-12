# Corrected AI Governance, Workflow, and Privacy-by-Design Specification

**Document status:** Corrected working specification  
**Version:** 1.0  
**As-of date for regulatory statements:** August 11, 2026  
**Primary author and developer credit:** Nicholas Michael Grossi  
**Architecture contributor credit in the source materials:** Alexis M. Adams (age 25)  

> **Purpose and limits.** This document replaces unsupported guarantees and outdated legal summaries with a testable technical and governance specification. It describes proposed architecture and operational requirements; it does **not** certify that a product is implemented, legally compliant, secure, patentable, or commercially valuable. Legal, security, payment-network, and privacy conclusions require scope-specific professional review and operating evidence.

## Executive Summary

This specification defines a proposed AI workflow platform and associated governance controls intended to support structured research, human oversight, privacy-aware data handling, auditable workflow execution, and optional tokenized payment integration. The intended design objective is not to make artificial intelligence autonomous, infallible, or universally safe. Rather, it is to build a system in which people retain authority over material decisions, consequential actions are gated by explicit review, risks are recorded and assessed, and claims about the system are bounded by evidence.

The architecture may use proprietary labels including **Axiom Hive**, **AFEI**, **XPII**, **Deterministic Coherence Gate**, **Pre-Response Quality Gate**, **Cross-FLD Lossless Validation**, and **epistemic auditing**. In this document, these labels describe proposed controls or internal concepts. They are not presented as independently validated scientific methods, recognized standards, or proof that an output is true, safe, unbiased, lawful, or ethically correct.

The platform is designed to support a practical distinction between four different properties. **Repeatability** concerns whether comparable system conditions produce comparable behavior. **Integrity** concerns whether an artifact has been altered. **Formal verification** concerns whether a precisely specified property holds in a defined model. **Factual accuracy** concerns whether a claim is supported by reliable evidence. These properties are valuable but distinct; satisfying one does not establish the others.[9] [10] [11]

| Design objective | Corrected requirement | Evidence needed before external claim |
|---|---|---|
| Human authority | People approve consequential actions and can pause, revise, or reject workflow output. | Role design, user-interface records, audit-log samples, and test evidence. |
| Structured AI output | The platform may constrain output formats and validate policy rules before release. | Prompt/configuration versioning, rule tests, failure-rate metrics, and red-team results. |
| Privacy by design | The platform minimizes personal data and applies purpose, retention, access, and deletion controls. | Data inventory, data-flow map, privacy test results, and operating procedures. |
| Auditability | Material workflow events are recorded in an auditable log with defined retention and integrity controls. | Log architecture, access controls, integrity-verification procedure, and evidence of operation. |
| Payment tokenization | An optional payment design may reduce exposure to primary account numbers through transaction-specific tokenization. | Processor architecture, PCI DSS scope assessment, penetration testing, and merchant-flow evidence. |

## 1. Scope, Roles, and Claim Discipline

This document applies to the design, development, testing, deployment, operation, and revision of the proposed workflow platform. It covers the platform’s policy layer, workflow orchestration, user interfaces, data model, logging, research and response pipeline, export process, and any optional payment-tokenization module. It does not establish compliance with any law merely by describing a control.

The words **MUST**, **SHOULD**, and **MAY** are internal specification terms. They express product requirements or recommendations; they do not by themselves state legal requirements. Each implementation must maintain a traceable mapping from a requirement to its design artifact, test case, release version, owner, and evidence of operation.

| Role | Internal responsibility | Authority boundary |
|---|---|---|
| Product owner | Defines intended use, user population, acceptance criteria, and release scope. | Must not represent an untested feature as implemented or compliant. |
| System architect | Maintains architecture, control boundaries, data-flow assumptions, and technical-debt records. | Must document assumptions and unresolved risks. |
| Security and privacy reviewer | Reviews security architecture, data classification, threat model, retention, access, and incident process. | Does not certify legal compliance without a formal scoped assessment. |
| Human reviewer | Reviews outputs or actions designated as consequential under the approval policy. | May approve, revise, reject, or escalate; must not rubber-stamp automated output. |
| Operator | Configures permitted workflows, models, sources, credentials, and retention settings. | Must follow least privilege and change-control procedures. |
| User | Provides inputs, selects templates, reviews plans, and accepts or declines outputs. | Cannot waive mandatory safety, privacy, or access-control requirements through ordinary interface settings. |

The system MUST distinguish a **documented design claim** from an **implemented capability claim**. A documented design claim may state that a control is proposed or specified. An implemented capability claim requires build, configuration, test, and deployment evidence. A measured performance claim requires an identified metric, test dataset, sampling method, date, system version, and known limitations.

## 2. Intended Use and Prohibited Representations

The intended use is to support research, documentation, structured reasoning workflows, and human-supervised production of professional outputs. The platform may assist users in organizing information, mapping concepts, drafting material, validating formats, maintaining project documentation, and preparing exports. It is not designed to make final, solely automated determinations that produce legal or similarly significant effects for an identifiable person unless a separate, jurisdiction-specific assessment and control design authorizes that use.

The platform MUST NOT be marketed or documented as a system that proves every output true, prevents all harm, eliminates hallucinations, ensures legal compliance, establishes non-repudiation without supporting infrastructure, or makes users anonymous. Such language exceeds the evidence normally available from software architecture alone.

| Representation to avoid | Corrected representation |
|---|---|
| “Every output is mathematically proven.” | “Specified rule checks and, where applicable, formal methods may be used to verify defined properties within a stated model.” |
| “Cryptography proves truth and safety.” | “Cryptographic mechanisms may protect integrity, provenance, and origin authentication when properly implemented; semantic accuracy and safety require separate controls.” |
| “The system prevents unsafe output.” | “The system is designed to reduce identified risks through policy checks, review gates, monitoring, and escalation. Residual risk remains.” |
| “No personal data is ever processed.” | “The design seeks to minimize personal data and block disallowed collection paths; actual processing must be verified by data-flow and operational review.” |
| “Tokenization eliminates PCI DSS obligations and fraud.” | “Tokenization may reduce data exposure and PCI DSS scope, subject to the actual payment flow, token service, segmentation, and formal assessment.” |
| “The product is compliant with every global privacy law.” | “The product is designed to support compliance controls; applicable obligations depend on jurisdiction, role, data, purpose, and operation.” |

## 3. Architecture Overview

The proposed architecture contains six logical layers. The layers may be implemented in one or more services, but their responsibilities must remain distinguishable for review and testing. The architecture follows defense-in-depth principles: multiple preventive, detective, and corrective controls are used so that failure of one control does not automatically create an uncontrolled outcome.

| Layer | Purpose | Minimum control requirements |
|---|---|---|
| 1. Policy and privacy control layer | Stores operational directives, data restrictions, risk rules, and approval requirements. | Versioned policies, change approval, rule-test coverage, and non-bypassable enforcement points for designated restrictions. |
| 2. Identity and access layer | Authenticates users and services and applies authorization rules. | Least privilege, session controls, credential rotation, role-based access, and review of privileged access. |
| 3. Workflow and orchestration layer | Executes approved prompt chains, tool calls, state transitions, and review gates. | Versioned workflow definitions, permitted-tool allowlists, execution records, and defined failure states. |
| 4. AI interaction and validation layer | Generates structured drafts and applies output, source, tone, and policy validation. | Model/version recording, input/output schema validation, handling for validation failure, and user-visible uncertainty where appropriate. |
| 5. Data, evidence, and audit layer | Holds permitted project content, references, workflow records, exports, and logs. | Data classification, retention policy, access restrictions, deletion process, backup controls, and log-integrity design. |
| 6. Export and integration layer | Creates user-authorized PDF, JSON, API, or payment-related outputs. | Export approval, provenance metadata, redaction checks, integration-specific review, and release logging. |

The terms “deterministic” and “verification” must be applied with precision. A workflow may be deterministic at the orchestration level if fixed software versions, fixed input, fixed configuration, fixed tool behavior, and controlled randomness produce a defined state transition. A generative-model response is not made factually deterministic merely because its output is logged, hashed, signed, or passed through a rule gate. Any deterministic claim MUST identify the precise component and the conditions under which repeatability was tested.

## 4. Human Oversight and Approval Gates

The platform SHOULD use an explicit pre-response approval process for tasks classified as consequential, high-risk, externally distributed, regulated, or involving identifiable persons. The process is designed to ensure that users understand the proposed task before a full output or action is generated. It does not substitute for professional judgment, legal review, or emergency response.

| Gate | Required behavior | Evidence artifact |
|---|---|---|
| Intake classification | Identify intended use, data sensitivity, action type, jurisdictional flags, and whether the request is consequential. | Intake record with classification and versioned policy decision. |
| Response-plan confirmation | Show the user a concise plan, source strategy, output format, and material limitations before a full response when the policy requires it. | Approved, revised, declined, or bypass-authorized plan record. |
| Validation pass | Check structure, prohibited content patterns, source requirements, and declared policy constraints. | Validation result, rule version, exceptions, and reviewer outcome. |
| Human review | Require a qualified person to approve, revise, or reject an action where configured risk criteria are met. | Reviewer identity, decision, rationale, and timestamp. |
| Release and monitoring | Release only approved artifacts; monitor defined post-release signals and preserve traceability. | Release identifier, output fingerprint, monitoring status, and incident linkage where relevant. |

The platform MUST treat validation failure as a signal for a defined resolution path. It may request clarification, regenerate a draft, require review, or halt the workflow. It MUST NOT describe a passed rule check as proof of factual truth, legal compliance, safety, or absence of bias.

## 5. Data Protection and Privacy Engineering

Privacy by design requires more than omitting obvious fields such as “name” or “email.” Information can be personal data or personally identifiable information when it distinguishes, traces, or is linked or linkable to an individual, including through combinations of data, metadata, free text, identifiers, financial information, device information, location, or logs.[18] Therefore, a field-name filter is a useful guardrail but cannot alone establish that no personal data is processed.

The platform MUST maintain a data inventory and a data-flow map before deployment of a feature that stores, transmits, or derives user data. The inventory must identify categories of data, purpose, data source, storage location, access roles, external recipients, retention period, deletion method, and applicable legal or contractual restrictions.

| Data class | Design rule | Illustrative treatment |
|---|---|---|
| Public research material | May be processed when lawful and consistent with source terms and project purpose. | Retain citation metadata and source date; do not treat public availability as permission for unrestricted processing. |
| Project content | Process only as necessary for the project purpose and configured workflow. | Apply access controls, project scoping, export approval, and retention settings. |
| Personal data | Minimize collection and require a documented purpose, authorized processing path, and retention rule. | Use data-protection review, access restrictions, disclosure controls, and deletion procedures. |
| Sensitive or regulated data | Do not ingest unless an approved data classification, legal basis, vendor/service assessment, and enhanced control set are present. | Require encryption, least privilege, auditability, retention limits, and domain-specific review. |
| Credentials and cryptographic keys | Never place in prompts, ordinary logs, or exportable project content. | Use a managed secret store, rotation, access logging, and incident response procedures. |

The platform SHOULD use layered detection for disallowed personal-data input. A baseline design can include schema validation, semantic pattern detection, content classification, user notice, reviewer escalation, and controlled redaction. Detection results must be treated as probabilistic signals, not conclusive proof that no personal data exists.

Where a privacy notice or consent mechanism is used, it MUST accurately state actual processing. A “decline” mechanism must not be characterized as consent if the service actually relies on another lawful basis, and a consent gate must not be used to conceal essential processing. Jurisdiction-specific notice, consent, data-subject-rights, transfer, and processor/controller obligations require a scoped legal review.

## 6. Security and Auditability

The platform is intended to follow a risk-based defense-in-depth approach. Controls should address prevention, detection, response, recovery, and continuous improvement. NIST guidance supports sound log-management practices but does not, by itself, certify that a particular log is complete, immutable, tamper-evident, or legally sufficient.[17]

| Security objective | Required control design | Verification approach |
|---|---|---|
| Access control | Enforce role-based authorization and least privilege at the application, service, database, and administrative layers. | Access-control tests, privilege review, and periodic recertification. |
| Secure configuration | Maintain approved configurations, dependency inventory, patch process, and environment separation. | Configuration baseline, vulnerability scanning, and change records. |
| Prompt and tool security | Separate untrusted input from instructions; constrain tools and permissions; validate tool parameters and output. | Adversarial test cases, allowlist review, and tool-call audit records. |
| Logging | Record material security, workflow, approval, export, and administrative events without logging secrets unnecessarily. | Log schema review, retention test, access test, and sample forensic reconstruction. |
| Log integrity | Use controlled write paths and, where appropriate, chained hashes, signatures, external timestamping, or write-once storage. | Independent verification procedure and documented key-management controls. |
| Incident response | Define detection, triage, containment, eradication, recovery, communication, and lessons-learned procedures. | Tabletop exercise, incident ticket records, and post-incident review. |

Prompt injection remains a material risk for systems that process untrusted content or invoke tools. OWASP identifies prompt injection as a core LLM application vulnerability and does not treat fool-proof prevention as solved.[12] The platform MUST therefore use layered mitigations: source isolation, input and output validation, least-privilege tool design, explicit allowlists, secret isolation, human approval for consequential operations, monitoring, and adversarial testing. The security case must document residual risk rather than promise perfect prevention.

## 7. AI Quality, Evidence, and Formal-Methods Boundaries

The platform may use grammar checks, style checks, source-citation rules, output schemas, retrieval constraints, rule engines, or formal methods. Each mechanism has a defined scope. Grammar validation can improve surface quality but not truth. Citation checks can identify the presence of a reference but not necessarily whether that reference supports the claim. A theorem prover can establish a property stated in a formal model but cannot automatically establish the correctness of an unconstrained natural-language answer.

The platform MUST label outputs with an appropriate evidence state when it has one. Recommended states are **draft**, **source-backed draft**, **human-reviewed**, **validated against a defined rule set**, **released**, and **superseded**. “Verified” may be used only when the associated verification procedure, scope, and evidence are available to the reader.

| Proposed control | Permitted claim | Claim not permitted without additional proof |
|---|---|---|
| Hashing | “The recorded artifact matched the stated digest at verification time.” | “The artifact is true, safe, or legally valid.” |
| Digital signature | “The signature can support origin authentication and integrity subject to key management and verification.” | “The signer cannot legally dispute any content in all contexts.” |
| Z3, Coq, or similar formal method | “A stated property was evaluated or proved within the defined model and assumptions.” | “Every system output is formally proven correct.” |
| Output-format validator | “The output was tested against the configured schema or style rules.” | “The output is factually complete, unbiased, or compliant.” |
| Human review | “A designated reviewer approved the artifact under the stated procedure.” | “The reviewer’s approval guarantees legal correctness or eliminates risk.” |

## 8. Governance and Regulatory Alignment

The platform’s governance controls are designed to support responsible operation. They are not a blanket legal-compliance certification. Applicability depends on the organization’s role, location, user population, data, sector, intended purpose, and the actual system behavior.

The EU AI Act is a risk-based framework. The European Commission’s current implementation schedule states that prohibited practices and AI-literacy requirements applied from 2 February 2025; governance and general-purpose AI obligations from 2 August 2025; most remaining provisions, including transparency obligations, from 2 August 2026; Annex III high-risk rules from 2 December 2027; and certain Annex I product-embedded high-risk rules from 2 August 2028.[1] The highest fine tier described by the Commission is up to **€35 million or 7% of worldwide annual turnover**, whichever is higher, for the relevant infringement category; lower tiers also apply.[1]

GDPR Article 22 restricts certain decisions based solely on automated processing that produce legal or similarly significant effects. It is not a universal rule requiring human review of every AI output. When Article 22 applies, the system owner must assess the decision’s effect, available exceptions, required safeguards, transparency, and rights of the person concerned.[2]

NIST AI RMF is voluntary risk-management guidance rather than a law or certification regime. A system may state that it has used an AI RMF-informed process only if it can show a versioned crosswalk, ownership, implementation evidence, and assessment record.[3]

| Source or framework | Correct description | Specification response |
|---|---|---|
| EU AI Act | Binding EU regulation with phased application and risk-based obligations.[1] | Maintain an applicability assessment; map use cases, roles, risk classification, transparency, documentation, oversight, and post-market obligations where applicable. |
| GDPR Article 22 | Restricts certain solely automated decisions with legal or similarly significant effects and requires safeguards in applicable cases.[2] | Use a decision-impact assessment, meaningful human involvement where required, explanation process, appeal/escalation path, and evidence of review. |
| NIST AI RMF | Voluntary guidance for managing AI risks and trustworthiness.[3] | Maintain an internal Govern–Map–Measure–Manage-style risk record; do not label this statutory compliance. |
| Colorado ADMT rules | Jurisdiction-specific requirements with current effective timing that must be assessed separately.[5] | Do not generalize across states; maintain a jurisdiction-by-jurisdiction legal register. |
| U.S. federal proposals | Bills such as the Algorithmic Accountability Act of 2022 were proposed rather than enacted federal law.[6] | Track as policy context only; do not describe as current binding requirements. |
| Canada AIDA proposal | AIDA was proposed in Bill C-27 and did not become operative law in the prior parliamentary session.[7] | Treat as historical/policy context, not current legal duty. |
| UK Online Safety Act | Enacted UK legislation with service-specific duties.[8] | Assess only if the service is in scope; do not use as a generalized AI compliance label. |

The platform MAY maintain a compliance matrix. Each matrix row MUST identify the legal or contractual source, exact requirement or control objective, applicability decision, owner, implemented control, evidence, test frequency, exception process, and last review date. A matrix that lists only laws and aspirational controls must be labeled as a **planning crosswalk**, not proof of compliance.

## 9. Optional Payment Tokenization Design

This specification includes an optional payment-tokenization concept. It is not a deployed payment network, a licensed money-transmission program, a card-network approval, or a substitute for a payment processor’s security and compliance requirements.

The proposed design objective is to reduce unnecessary exposure to primary account numbers by using payment-provider or network-approved tokenization mechanisms. A transaction-specific token may be useful when properly designed, but it does not make a transaction anonymous, remove all fraud risk, or automatically eliminate PCI DSS obligations. PCI SSC states that tokenization can reduce PCI DSS scope; the actual scope and obligations depend on the tokenization implementation and system architecture.[13]

| Payment design requirement | Corrected statement |
|---|---|
| Data minimization | The system SHOULD avoid storing payment credentials unless a documented and approved payment architecture requires it. |
| Token lifecycle | Tokens SHOULD have a defined scope, cryptographic protection where applicable, expiry/revocation behavior, and documented mapping/authorization controls. |
| Merchant exposure | The design SHOULD minimize merchant exposure to payment credentials, subject to the actual payment processor and network flow. |
| Fraud controls | The design SHOULD combine tokenization with authentication, authorization, velocity controls, monitoring, dispute handling, and incident response. |
| PCI DSS | The project MUST obtain a scoped PCI DSS assessment before claiming compliance, scope reduction, or eligibility for a particular SAQ. |
| Legal and licensing | The project MUST obtain jurisdiction-specific legal review before handling funds, issuing value, operating a ledger, or making regulated payment claims. |

## 10. Product Requirements for Workflows, Research, and Export

The platform may support project workspaces, prompt chains, research topics, visual maps, structured notes, templates, datasets, audit logs, and exports. These are requirements or proposed features until implementation evidence is attached to a release.

A workflow execution MUST record the workflow version, user/project context, model and tool versions, policy version, relevant source set, gate decisions, validation outcome, reviewer decision where applicable, export identifier, and exception reason. Records must omit secrets and minimize personal data.

| Capability | Requirement | Acceptance criterion |
|---|---|---|
| Prompt-chain configuration | Users may configure approved sequential or branching tasks within policy limits. | A test workflow records each node, input/output contract, transition, and approval state. |
| Research source handling | Sources must be cited where factual claims depend on them. | The export links each material factual claim or section to accessible source metadata. |
| Output controls | Configured schemas, style constraints, and prohibited-content rules must be evaluated before release where required. | Test suite demonstrates pass, fail, override-authorized, and escalation cases. |
| Deviation handling | The system must show a clear result when a policy or format check fails. | A test run records the detected condition, rule version, user action, and final disposition. |
| Project-scoped storage | Project content must be separated by authorization boundary. | Access-control tests demonstrate that an unauthorized project account cannot retrieve content. |
| Export | Exports must include version and provenance metadata appropriate to the data sensitivity. | A generated export identifies its project, version, generation date, and approved release state. |

The platform SHOULD present uncertainty clearly. If the system cannot identify a reliable source, lacks the required data, or encounters a validation conflict, it should state the limitation, seek clarification, or route the matter to human review. It must not invent citations, fabricate data, or falsely state that a requirement has been satisfied.

## 11. Testing, Evidence, and Release Readiness

A feature must not be labeled “implemented,” “secure,” “compliant,” “audited,” or “production ready” merely because it appears in a requirements document. The release process must build an evidence package proportionate to the feature’s risk.

| Evidence category | Minimum content |
|---|---|
| Requirements traceability | Unique requirement identifier, owner, design location, implementation reference, test case, result, and release version. |
| Privacy evidence | Data inventory, data-flow map, retention/deletion test, access review, third-party/service assessment, and privacy-review decision. |
| Security evidence | Threat model, vulnerability/dependency review, access-control tests, secrets review, logging verification, incident exercise, and remediation record. |
| AI-quality evidence | Evaluated tasks, benchmark or test corpus, metric definitions, human-review method, known failure modes, and versioned results. |
| Formal-methods evidence | Formal specification, model boundaries, solver/prover output, assumptions, version, and independently reproducible verification steps. |
| Governance evidence | Applicability assessment, policy crosswalk, review ownership, exception approval, audit trail, and periodic review date. |

The product owner MUST approve a release only after reviewing applicable evidence and unresolved risks. Approval must identify the build/release version and may be time-limited. High-risk or consequential capabilities SHOULD have a documented rollback and incident-escalation procedure before release.

## 12. Commercial and Valuation Statement

This specification does not assert a market value, fair value, sale price, enterprise value, or premium pricing for the document set, proprietary framework, or proposed platform. Any labor figures are **illustrative replacement-cost estimates** only and must identify the assumed role, geography, seniority, rate, hours, scope, and date.

| Permitted commercial statement | Statement not permitted without external evidence |
|---|---|
| “The work may require a specified range of professional effort under stated assumptions.” | “The work has an established market value of $X.” |
| “The estimate is based on assumed billable rates and scope.” | “The estimate reflects what buyers will pay.” |
| “The framework may have commercial potential subject to validation, ownership, demand, and execution.” | “The framework commands premium industry pricing.” |
| “A future valuation may use comparable transactions, contracts, revenue, or cost-savings evidence.” | “The document alone establishes enterprise or IP value.” |

A credible external valuation would require a defined asset, ownership and transferability analysis, valuation date, intended transaction context, revenue/cost-savings evidence, comparable licenses or sales, development-cost support, market-demand evidence, and appropriate valuation methodology. This document does not supply those inputs.

## 13. Attribution and Intellectual-Property Hygiene

The document credits above report the credits contained in the source materials. They are not a legal determination of ownership, work-made-for-hire status, joint authorship, invention, patent inventorship, trademark rights, or rights in third-party material. Ownership and contribution questions should be documented through dated records, contributor agreements, assignments where appropriate, repository access records, and release history.

The project SHOULD maintain an intellectual-property register that identifies the asset, source repository or document, authors/contributors as credited, third-party components, licenses, date created, version, assignment status, disclosure status, and commercialization restrictions. The register should distinguish copyrightable expression, confidential know-how, patentable subject matter, trademarks, and open-source components.

## 14. Change Control and Review Cycle

This corrected specification must be treated as a living document. Regulatory statements may change, source documentation may be revised, and implemented behavior may diverge from the design. The system owner MUST review the document before material release and at least annually, or sooner after a material architecture change, new jurisdiction, data-category change, security incident, model/provider change, payment-flow change, or legal development.

| Change trigger | Required review |
|---|---|
| New AI model, provider, or tool integration | Update data flow, vendor review, prompt/tool threat model, test suite, and user notice as applicable. |
| New use involving identifiable persons or consequential decisions | Conduct privacy, legal, bias/fairness, human-oversight, and impact review before deployment. |
| New payment or tokenization flow | Conduct payment-provider, PCI DSS, licensing, fraud, privacy, and data-flow review before launch. |
| New public marketing claim | Confirm that the claim has evidence proportionate to its specificity and that limitations are disclosed. |
| Security or privacy incident | Initiate incident response, preserve evidence, assess notification duties, remediate, and update controls. |

## 15. Correction Crosswalk

| Prior error pattern | Correction adopted in this document |
|---|---|
| Inconsistent EU AI Act fine percentages | Uses the European Commission’s current highest-tier statement: up to €35 million or 7% of worldwide annual turnover for the relevant category.[1] |
| Blanket legal claims for human oversight | Separates GDPR Article 22 and EU AI Act human-oversight obligations by scope and applicability.[1] [2] |
| Treating proposed bills as operative law | Identifies H.R. 6580 and Canadian AIDA as proposals/policy context, not current binding law.[6] [7] |
| Treating NIST AI RMF as law or certification | Describes AI RMF as voluntary guidance and requires an evidence-backed crosswalk before using “aligned with.”[3] |
| Equating cryptography with truth or safety | Limits signatures and hashes to integrity, authentication, provenance, and non-repudiation support when properly implemented.[9] [10] |
| Absolute claims about prompt injection, privacy, tokens, and safety | Replaces guarantees with bounded design objectives, explicit residual risk, and required testing/evidence.[12] [13] |
| “No PII” claim based on field names | Requires data inventory, flows, classification, layered detection, and operational evidence.[18] |
| Presenting labor estimates as market value | Replaces valuation claims with illustrative replacement-cost estimates only. |
| Uncited proprietary-framework performance claims | Treats proprietary names as internal concepts and requires reproducible evidence before external effectiveness claims. |

## References

[1]: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai "European Commission — AI Act"
[2]: https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/dealing-requests-individuals/are-there-restrictions-use-automated-decision-making_en "European Commission — GDPR automated decision-making"
[3]: https://www.nist.gov/itl/ai-risk-management-framework "NIST — AI Risk Management Framework"
[4]: https://apnews.com/article/france-x-grok-deepfakes-child-sexual-abuse-charges-cac04b1869201bb4c9d425dafc4593a6 "Associated Press — French prosecutors’ X investigation"
[5]: https://coag.gov/ai/ "Colorado Attorney General — Automated Decision-Making Technology and Chatbot Safety rulemaking"
[6]: https://www.congress.gov/bill/117th-congress/house-bill/6580/text "Congress.gov — H.R. 6580, Algorithmic Accountability Act of 2022"
[7]: https://www.parl.ca/legisinfo/en/bill/44-1/c-27 "Parliament of Canada — Bill C-27"
[8]: https://www.gov.uk/government/collections/online-safety-act "GOV.UK — Online Safety Act"
[9]: https://csrc.nist.gov/projects/hash-functions "NIST — Hash Functions"
[10]: https://csrc.nist.gov/glossary/term/digital_signature "NIST — Digital Signature glossary"
[11]: https://people.eecs.berkeley.edu/~sseshia/pubdir/atva18.pdf "Seshia et al. — Formal Specification for Deep Neural Networks"
[12]: https://genai.owasp.org/llmrisk/llm01-prompt-injection/ "OWASP — LLM01:2025 Prompt Injection"
[13]: https://www.pcisecuritystandards.org/documents/Tokenization_Guidelines_Info_Supplement.pdf "PCI SSC — Tokenization Guidelines"
[14]: https://www.bls.gov/ooh/computer-and-information-technology/information-security-analysts.htm "BLS — Information Security Analysts"
[15]: https://www.bls.gov/ooh/media-and-communication/technical-writers.htm "BLS — Technical Writers"
[16]: https://www.bls.gov/news.release/ocwage.t01.htm "BLS — National employment and wage data, May 2025"
[17]: https://csrc.nist.gov/pubs/sp/800/92/final "NIST SP 800-92 — Guide to Computer Security Log Management"
[18]: https://csrc.nist.gov/glossary/term/personally_identifiable_information "NIST — Personally Identifiable Information glossary"
