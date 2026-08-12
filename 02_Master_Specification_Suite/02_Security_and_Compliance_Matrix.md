# Axiom Hive / XPII Security and Compliance Control Matrix

**Document status:** Proposed control matrix; not a compliance attestation, regulatory determination, or security certification.
**Version:** 4.0 — controlled public release
**Review date:** August 12, 2026

## 1. Objective and scope

This matrix identifies technical controls that may support later assessment against selected legal, regulatory, and standards-based requirements. It does not establish that a product, organization, deployment, or workflow complies with any framework. The applicable requirements depend on the system’s purpose, jurisdiction, data flows, contracts, payment roles, and deployment configuration.

## 2. Control mapping

| Framework or reference | Relevant subject | Proposed control contribution | Evidence required before an external claim |
|---|---|---|---|
| **EU AI Act** | Risk classification, transparency, documentation, logging, human oversight, and risk management may apply depending on system role and use case. | Versioned technical documentation, event logging, role-based approval gates, deployment inventory, and monitoring requirements. | Use-case classification, jurisdictional analysis, technical file, conformity-assessment analysis where applicable, and legal review. |
| **GDPR and applicable privacy law** | Lawful processing, purpose limitation, data minimization, security, and data-subject rights depend on controller/processor roles and processing context. | Data inventory, minimization requirements, retention/deletion controls, access restrictions, and request-handling records. | Data-flow map, lawful-basis analysis, role allocation, retention schedule, transfer analysis, and privacy review. |
| **PCI DSS** | PCI DSS provides baseline technical and operational requirements for entities that store, process, transmit, or could affect the security of payment-account data. | Segmentation, access controls, event logging, supplier integration controls, and a requirement to avoid storing raw account data unless explicitly approved. | Payment data-flow analysis, scope determination, applicable validation approach, and assessment by the appropriate payment stakeholders or qualified assessor. |
| **NIST AI RMF** | Voluntary guidance for managing AI-related risk. NIST states that AI RMF 1.0 is being revised. | Risk register, governance assignments, test plan, documented limits, and change management. | Versioned crosswalk to the applicable AI RMF edition or profile, owned implementation record, and review evidence. |
| **NIST SP 800-61 Rev. 3** | Incident response integrated with cybersecurity risk management and the NIST Cybersecurity Framework (CSF) 2.0. | Preparedness, monitoring, response playbooks, recovery records, and post-incident review requirements. | Tested incident-response plan, exercise results, log review evidence, and recovery validation. |

The European Commission states that the AI Act became generally applicable on 2 August 2026, with exceptions and phased dates for certain high-risk systems. The Commission’s current page identifies transparency rules as applying in August 2026, Annex III high-risk provisions from 2 December 2027, and Annex I product-embedded high-risk provisions from 2 August 2028.[1] This timeline does not determine whether any particular deployment falls within those provisions.

## 3. Security-control requirements

| ID | Requirement | Acceptance criterion |
|---|---|---|
| SC-01 | The system SHALL maintain a current asset, dependency, data-flow, and interface inventory. | Inventory owner and review cadence are recorded; material changes trigger updates. |
| SC-02 | The system SHALL apply least-privilege access controls and maintain access-review records. | Sampled access review verifies authorized roles, revocation process, and administrative logging. |
| SC-03 | The system SHALL record security-relevant events in a protected, access-controlled logging system. | Log-integrity, retention, and access-control tests are documented. |
| SC-04 | The system SHALL maintain an incident-response plan appropriate to its deployment context. | Tabletop or technical exercise results identify detection, response, recovery, ownership, and follow-up actions. |
| SC-05 | The system SHALL identify the payment data environment and prevent unapproved storage or transmission of payment-account data. | Data-flow review identifies payment service providers, tokens, account-data exposure, and residual scope. |
| SC-06 | The system SHALL document model, prompt, rule, dependency, and configuration changes that can affect a material workflow. | Change records include review, test evidence, rollback method, and accountable owner. |
| SC-07 | The system SHALL test controls designed to reduce prompt-injection and tool-use risks. | Threat model, negative tests, observed limitations, and remediation records are retained. |

## 4. Incident-response model

NIST SP 800-61 Rev. 3 was published in April 2025 and supersedes Rev. 2. It recommends incorporating incident-response considerations throughout cybersecurity risk-management activities described by CSF 2.0.[2] This matrix therefore uses the CSF functions—**Govern, Identify, Protect, Detect, Respond, and Recover**—rather than treating any abbreviated three-step sequence as a complete NIST lifecycle.

| CSF function | Proposed implementation objective |
|---|---|
| Govern | Assign incident-response ownership, escalation authority, and review cadence. |
| Identify | Maintain service, dependency, account, data-flow, and risk inventories. |
| Protect | Apply access controls, secure configuration, data minimization, backup policy, and secure development practices. |
| Detect | Monitor defined security events, configuration changes, integrity exceptions, and anomalous access patterns. |
| Respond | Triage, contain, investigate, communicate, and record response decisions under an approved plan. |
| Recover | Restore approved services, validate remediation, and track corrective actions. |

## 5. Payment and tokenization boundary

PCI DSS is intended for entities that store, process, transmit, or could affect the security of cardholder data or sensitive authentication data.[3] Tokenization, encryption, and third-party payment services may reduce the systems in scope, but scope is determined by the actual architecture and payment relationships. This specification therefore uses the phrase **“design intended to reduce payment-account-data exposure”** and does not claim scope elimination, a specific self-assessment questionnaire eligibility, or compliance.

## 6. Constraints

The project MUST NOT make the following statements without supporting evidence and applicable review:

- “PCI DSS compliant,” “GDPR compliant,” “EU AI Act compliant,” or equivalent certification language;
- “eliminates PCI scope,” “zero-risk,” “immutable” without a defined threat model, or “prompt-injection proof”;
- an assertion that tokenization makes transactions anonymous or removes fraud, privacy, security, or contractual obligations; or
- a claim that a technical control has been implemented where only a design requirement exists.

## 7. References

[1] European Commission. “AI Act.” *Shaping Europe’s Digital Future*, updated 3 Aug. 2026, https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai. Accessed 12 Aug. 2026.

[2] National Institute of Standards and Technology. *Incident Response Recommendations and Considerations for Cybersecurity Risk Management: A CSF 2.0 Community Profile*. NIST SP 800-61 Rev. 3, Apr. 2025, https://doi.org/10.6028/NIST.SP.800-61r3. Accessed 12 Aug. 2026.

[3] PCI Security Standards Council. “PCI Data Security Standard (PCI DSS).” https://www.pcisecuritystandards.org/standards/pci-dss/. Accessed 12 Aug. 2026.

[4] National Institute of Standards and Technology. “AI Risk Management Framework.” *NIST*, https://www.nist.gov/itl/ai-risk-management-framework. Accessed 12 Aug. 2026.
