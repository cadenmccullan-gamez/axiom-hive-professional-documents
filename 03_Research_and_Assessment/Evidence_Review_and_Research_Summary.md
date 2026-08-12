# Axiom Hive / XPII Evidence Review and Research Summary

**Document status:** Source-controlled research summary; not an implementation audit, legal opinion, or compliance assessment.
**Version:** 1.0 — controlled public release
**Review date:** August 12, 2026

## 1. Objective and method

This summary records the external sources used to control recurring technical, regulatory, security, and evidentiary statements in the Axiom Hive / XPII public documentation. The method was limited to comparison of project documentation against current primary or standards-body sources. It did not inspect system implementation or make an assessment of any actual deployment.

## 2. Verified reference positions

| Subject | Source-controlled position | Documentation consequence |
|---|---|---|
| EU AI Act | The European Commission states that the Act became generally applicable on 2 August 2026, with phased exceptions. The dates for Annex III and Annex I high-risk systems identified by the Commission are 2 December 2027 and 2 August 2028, respectively.[1] | Do not describe the project as in scope or compliant without a use-case and jurisdiction analysis. |
| NIST AI RMF | NIST describes AI RMF as voluntary guidance and notes that AI RMF 1.0 is being revised.[2] | Use “informed by” or “designed to support assessment against” rather than “compliant” or “certified.” |
| Incident response | NIST SP 800-61 Rev. 3, published in April 2025, supersedes Rev. 2 and integrates incident response with CSF 2.0 risk-management activities.[3] | Use the CSF functions—Govern, Identify, Protect, Detect, Respond, and Recover—rather than a simplified lifecycle claim. |
| Payment data security | PCI DSS provides baseline technical and operational requirements for entities that store, process, transmit, or could affect the security of payment-account data.[4] | Tokenization may reduce exposure but does not automatically determine scope, compliance, or assessment eligibility. |
| Formal methods | NIST describes formal methods as mathematically based techniques for specifying and verifying properties of software and systems; it also notes that testing remains necessary when specification assumptions meet implemented code.[5] | Limit verification claims to defined software properties supported by specifications, tests, and evidence. |
| AI safety assurance | The FAA’s roadmap treats AI as a tool, assigns responsibility to designers and responsible human roles, and emphasizes safety-assurance evidence.[6] | Use human-oversight and accountability language without implying aviation certification or sector eligibility. |
| Digital evidence | Federal Rule of Evidence 901 requires sufficient evidence that an item is what it is claimed to be and, for a process or system, evidence that it produces an accurate result.[7] | Logs and hashes may support an authentication foundation; they do not alone establish admissibility, truth, reliability, or chain of custody. |

## 3. Controlled technical characterization

The current documentation supports the following limited statement:

> Axiom Hive / XPII is a proposed rule-governed, human-supervised AI workflow architecture with planned evidence-traceability controls.

The statement does not establish a formal AI class, an independent certification, a high-assurance assurance case, a deterministic source of truth, or a legally admissible evidentiary system.

## 4. Evidence required for stronger claims

| Proposed claim type | Required evidence |
|---|---|
| Implemented control | Source code or configuration, release version, owner, and functional test results. |
| Secure control | Threat model, design review, control tests, remediation record, and deployment context. |
| Regulatory alignment | Use-case classification, jurisdictional analysis, relevant control crosswalk, and review record. |
| PCI DSS scope reduction | Current payment-data flow, provider architecture, contractual roles, and assessment by appropriate parties. |
| Privacy protection | Data inventory, purposes, retention policy, access controls, deletion test, and applicable privacy review. |
| High assurance | Bounded requirements, assurance case, verification evidence, operational monitoring, and independent review appropriate to the context. |
| Legal or evidentiary use | Jurisdiction-specific legal analysis, provenance record, chain-of-custody procedure, and case-specific foundation. |

## 5. Maintenance requirement

This summary SHALL be reviewed before a public statement is made about regulatory dates, standards versions, legal requirements, system capabilities, security properties, commercial value, or evidentiary effects. Source changes, system changes, or a new implementation claim require a new review record.

## 6. References

[1] European Commission. “AI Act.” *Shaping Europe’s Digital Future*, updated 3 Aug. 2026, https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai. Accessed 12 Aug. 2026.

[2] National Institute of Standards and Technology. “AI Risk Management Framework.” *NIST*, https://www.nist.gov/itl/ai-risk-management-framework. Accessed 12 Aug. 2026.

[3] National Institute of Standards and Technology. *Incident Response Recommendations and Considerations for Cybersecurity Risk Management: A CSF 2.0 Community Profile*. NIST SP 800-61 Rev. 3, Apr. 2025, https://doi.org/10.6028/NIST.SP.800-61r3. Accessed 12 Aug. 2026.

[4] PCI Security Standards Council. “PCI Data Security Standard (PCI DSS).” https://www.pcisecuritystandards.org/standards/pci-dss/. Accessed 12 Aug. 2026.

[5] National Institute of Standards and Technology. “Formal Methods and Combinatorial Testing.” *Computer Security Resource Center*, updated 8 June 2026, https://csrc.nist.gov/projects/automated-combinatorial-testing-for-software/autonomous-systems-assurance/formal-methods. Accessed 12 Aug. 2026.

[6] Federal Aviation Administration. *Roadmap for Artificial Intelligence Safety Assurance: Version I*. 23 July 2024, https://www.faa.gov/media/82891. Accessed 12 Aug. 2026.

[7] Legal Information Institute. “Rule 901. Authenticating or Identifying Evidence.” *Federal Rules of Evidence*, Cornell Law School, https://www.law.cornell.edu/rules/fre/rule_901. Accessed 12 Aug. 2026.
