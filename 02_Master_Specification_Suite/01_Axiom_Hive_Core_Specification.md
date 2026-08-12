# Axiom Hive / XPII Core Technical and Governance Specification

**Document status:** Proposed technical design; not an implementation audit, certification, or legal opinion.
**Document attribution:** Nicholas Michael Grossi is identified as author/developer in the supplied materials; Alexis M. Adams and Caden McCullen are identified there as contributors. This statement does not determine ownership or rights.
**Version:** 4.0 — controlled public release
**Review date:** August 12, 2026

## 1. Objective and scope

This specification defines the proposed control architecture for Axiom Hive / XPII. The intended outcome is a **rule-governed, human-supervised AI workflow** that separates deterministic software controls from model-derived content, preserves reviewable records, and requires defined human authorization for material actions.

> **Scope boundary:** This document specifies intended requirements. It does not establish that the described controls have been implemented, independently tested, certified, or found compliant with a law or standard.

The National Institute of Standards and Technology (NIST) describes its AI Risk Management Framework (AI RMF) as voluntary guidance for incorporating trustworthiness considerations into the design, development, use, and evaluation of AI systems.[1] This specification therefore uses the AI RMF as a design reference rather than a compliance assertion.

## 2. Defined terms

| Term | Definition used in this specification |
|---|---|
| **Rule-governed workflow** | A workflow bounded by explicit schemas, policies, access controls, and validation rules. |
| **Deterministic control** | A control that returns a defined result for the same input and system state, such as a schema validator, access-control rule, or hash function. |
| **Model-derived content** | Content produced by a statistical or machine-learning component and therefore subject to task-specific evaluation. |
| **Evidence traceability** | Records sufficient to reconstruct relevant inputs, configurations, approvals, events, and outputs for review. |
| **Material action** | A defined action that can create legal, financial, safety, rights-affecting, or irreversible external consequences. |

## 3. Architectural requirements

The system SHALL implement the following proposed control layers. Each layer requires implementation evidence and test records before any external performance or assurance claim is made.

| ID | Control layer | Requirement | Minimum acceptance evidence |
|---|---|---|---|
| AR-01 | Ingestion and schema validation | The system SHALL validate input structure, type, and permitted fields before downstream processing. | Versioned schemas, negative-test results, and rejection handling records. |
| AR-02 | Workflow orchestration | The system SHALL preserve the identity and version of each policy, prompt template, model configuration, and workflow step used for a material output. | Replay record demonstrating retrieval of the applicable configuration. |
| AR-03 | Policy gates | The system SHALL apply explicit rules to route, reject, or require human review for defined high-impact or restricted requests. | Rule inventory, coverage report, change log, and exception samples. |
| AR-04 | Human authorization | The system SHALL require a designated human approver before a defined material action is executed. | Authority matrix and sampled approval records. |
| AR-05 | Audit records | The system SHALL record relevant input identifiers, configuration versions, gate outcomes, approvals, and output identifiers. | Retention policy, integrity test, and access-control records. |
| AR-06 | Data minimization | The system SHALL limit collection and retention to data fields necessary for the documented purpose. | Data inventory, data-flow diagram, retention/deletion test, and privacy review. |
| AR-07 | External integration | The system SHALL apply authentication, authorization, rate limits, and logging to external interfaces. | Interface specification, access-control tests, and monitoring evidence. |

NIST characterizes formal methods as mathematically based techniques for specifying and verifying properties of software and systems. It also notes that testing remains necessary because assumptions in a proof may not hold when a specification is mapped to implementation.[2] Accordingly, rule definitions and schemas may be verified as software artifacts, while claims about broader model behavior require separate testing.

## 4. Human supervision and authority allocation

The proposed governance model assigns material decision authority to defined human roles. The system MAY perform reversible, bounded functions such as syntax validation, routing, data classification, and draft generation. It MUST NOT perform a material action without the approval conditions defined for that action.

The Federal Aviation Administration’s AI safety-assurance roadmap uses similar systems-engineering language: AI is to be treated as a tool, not a person, and responsibility for system requirements is allocated to designers and responsible human roles.[3] This source is used only as an engineering reference; it does not certify this design for aviation or any other regulated use.

| Action category | System role | Human requirement |
|---|---|---|
| Input validation and routing | Execute defined rules | Review exception paths. |
| Draft generation or summarization | Produce clearly labeled model-derived content | Review before material external use. |
| Account, payment, rights, safety, or legal action | Prepare a proposed action only | Explicit authorization by the designated human role. |
| Compliance or regulatory filing | Prepare supporting records only | Legal or compliance owner approval. |

## 5. Evidence traceability controls

The proposed architecture uses execution records, integrity checks, and controlled retention to support review. A record may help establish what a system processed or produced; it does not by itself establish that the content is true, compliant, or admissible in a proceeding.

Federal Rule of Evidence 901 requires a proponent to provide evidence sufficient to support a finding that an item is what the proponent claims. For a process or system, the proponent must describe the process and show that it produces an accurate result.[4] Any evidentiary use therefore requires context-specific legal review, provenance evidence, and applicable chain-of-custody procedures.

## 6. Validation plan

Before using external statements such as “implemented,” “aligned,” “assessed,” or “high assurance,” the project SHALL complete the following sequence.

1. **Specify:** Define intended use, excluded use, system boundaries, decision rights, and measurable requirements.
2. **Implement:** Version-control schemas, rules, prompts, model configurations, logging logic, and access-control policies.
3. **Test:** Run unit, integration, negative, adversarial, recovery, and retention/deletion tests.
4. **Evaluate:** Measure schema conformance, rule coverage, override frequency, replay completeness, access-control failures, and human-approval enforcement.
5. **Review:** Obtain independent technical review appropriate to the use case and qualified legal review before making legal, privacy, payment, or regulatory claims.
6. **Maintain:** Re-test following material changes to models, rules, data sources, dependencies, or deployment context.

NIST’s AI test, evaluation, validation, and verification (TEVV) program emphasizes that measurements and evaluations are context dependent and that characteristics such as accuracy, reliability, safety, security, privacy, transparency, and harmful-bias mitigation require appropriate evidence.[5]

## 7. Constraints

The platform documentation MUST NOT state or imply that the proposed architecture:

- guarantees truth, safety, privacy, security, legal compliance, or regulatory certification;
- converts model-derived content into legally admissible evidence by itself;
- eliminates payment, privacy, security, or governance obligations; or
- operates autonomously beyond the authority explicitly assigned in a controlled workflow.

## 8. References

[1] National Institute of Standards and Technology. “AI Risk Management Framework.” *NIST*, https://www.nist.gov/itl/ai-risk-management-framework. Accessed 12 Aug. 2026.

[2] National Institute of Standards and Technology. “Formal Methods and Combinatorial Testing.” *Computer Security Resource Center*, updated 8 June 2026, https://csrc.nist.gov/projects/automated-combinatorial-testing-for-software/autonomous-systems-assurance/formal-methods. Accessed 12 Aug. 2026.

[3] Federal Aviation Administration. *Roadmap for Artificial Intelligence Safety Assurance: Version I*. 23 July 2024, https://www.faa.gov/media/82891. Accessed 12 Aug. 2026.

[4] Legal Information Institute. “Rule 901. Authenticating or Identifying Evidence.” *Federal Rules of Evidence*, Cornell Law School, https://www.law.cornell.edu/rules/fre/rule_901. Accessed 12 Aug. 2026.

[5] National Institute of Standards and Technology. “AI Test, Evaluation, Validation and Verification (TEVV).” *NIST*, https://www.nist.gov/ai-test-evaluation-validation-and-verification-tevv. Accessed 12 Aug. 2026.
