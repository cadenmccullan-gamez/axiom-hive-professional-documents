// Technical Classification Memorandum
// Prepared from user-supplied documentation and cited public sources.

#let ink = rgb("#1A1A1A")
#let rule = rgb("#555555")
#let muted = rgb("#4A4A4A")

#import "@preview/glossarium:0.5.10": make-glossary, register-glossary, print-glossary, gls
#show: make-glossary
#let glossary-entries = (
  (key: "rule-workflow", short: "rule-governed workflow", description: [A software workflow bounded by explicit rules, schemas, policies, or access controls.]),
  (key: "deterministic-control", short: "deterministic control", description: [A control that produces a defined result for the same input and system state.]),
  (key: "probabilistic-model", short: "probabilistic model", description: [A model whose output selection may be driven by learned statistical distributions.]),
  (key: "formal-methods", short: "formal methods", description: [Mathematically based techniques for specifying and verifying properties of software and systems.]),
  (key: "evidence-traceability", short: "evidence traceability", description: [Recorded information sufficient to reconstruct relevant inputs, configurations, actions, approvals, and outputs for review.]),
  (key: "high-assurance", short: "high assurance", description: [A claim supported by a bounded assurance case, evidence, testing, and independent review appropriate to context.]),
)
#register-glossary(glossary-entries)

#set document(
  title: "Technical Classification Memorandum: Axiom Hive / XPII",
  author: "Prepared for Project Record",
)

#set page(
  paper: "us-letter",
  margin: (top: 0.84in, bottom: 0.80in, left: 0.95in, right: 0.95in),
  header: context {
    if counter(page).get().first() > 0 [
      #set text(font: "Libertinus Serif", size: 8.5pt, fill: muted)
      #grid(
        columns: (1fr, auto),
        align(left)[TECHNICAL CLASSIFICATION MEMORANDUM],
        align(right)[AXIOM HIVE / XPII]
      )
      #v(3pt)
      #line(length: 100%, stroke: 0.45pt + rule)
    ]
  },
  footer: context [
    #set text(font: "Libertinus Serif", size: 8.5pt, fill: muted)
    #align(center)[Page #counter(page).display("1")]
  ],
)

#set text(font: "Libertinus Serif", size: 10.5pt, fill: ink, lang: "en")
#set par(justify: true, leading: 14pt, spacing: 8pt, first-line-indent: 0pt)
#set heading(numbering: "1.1")
#show heading: it => block(above: 16pt, below: 7pt, sticky: true)[
  #set text(font: "Libertinus Serif", fill: ink, weight: "bold")
  #it
]
#show heading.where(level: 1): set text(size: 14pt)
#show heading.where(level: 2): set text(size: 11.5pt)
#show link: set text(fill: ink)
#show link: underline

#let label(value) = text(font: "Libertinus Serif", weight: "bold", size: 9.5pt)[#value]
#let cellfill = luma(245)

#align(center)[
  #text(size: 15pt, weight: "bold")[TECHNICAL CLASSIFICATION MEMORANDUM]
  #v(3pt)
  #text(size: 11pt)[Axiom Hive / XPII Documentation Set]
]

#v(12pt)
#table(
  columns: (1.35in, 1fr),
  stroke: none,
  inset: (x: 3pt, y: 3pt),
  align: left,
  [#label("TO:")], [Project Record],
  [#label("FROM:")], [Technical Documentation Review],
  [#label("DATE:")], [12 August 2026],
  [#label("RE:")], [Technical Classification of the Documented Axiom Hive / XPII Design],
  [#label("STATUS:")], [Research memorandum; not a legal opinion, certification, or implementation audit.]
)

#v(7pt)
#line(length: 100%, stroke: 0.8pt + ink)

= Objective and scope

This memorandum responds to one defined objective: to describe, using recognized engineering terminology, the class of AI-related system architecture documented in the supplied Axiom Hive / XPII materials. The analysis distinguishes documented design requirements from verified implementation properties, regulatory determinations, and legal conclusions.

*In scope.* The review considers the supplied descriptions of rule gates, schema-constrained outputs, audit logging, human approval controls, data-minimization requirements, and named project components such as the Deterministic Coherence Gate (DCG), Pre-Response Quality Gate (PRQG), and Algorithmic Prompt Chain (APC).

*Out of scope.* This memorandum does not establish that any described component has been implemented, tested, independently audited, certified, deployed, or accepted as evidence by a court or regulator. It does not determine intellectual-property ownership, product-market fit, safety certification, regulatory compliance, or legal admissibility in any jurisdiction.

= Question presented

What technically recognized category best describes the Axiom Hive / XPII design documented in the supplied materials?

= Short answer

The materials support a limited technical characterization: the documented design is a proposed #gls("rule-workflow"), human-supervised AI workflow and governance architecture with #gls("evidence-traceability") controls. It combines probabilistic-model outputs, where used, with deterministic software controls such as schema checks, policy gates, logging, access restrictions, and human approval requirements.

The proposed label *High-Assurance Deterministic Forensic Intelligence (HADFI)* may be retained as an internal project designation. It is not, however, an established system classification recognized by NIST, the FAA, ISO/IEC, IEEE, a court, or a certification body. The documentation therefore should not describe HADFI as a formal intelligence class, a certified high-assurance system, a deterministic model, or a legally admissible evidentiary system without implementation-specific evidence.

= Materials and method

== Materials reviewed

The analysis used the provided Axiom Hive / XPII technical specifications, application/workflow documents, governance documents, cybersecurity materials, valuation documents, and supplemental response-quality requirements. These sources consistently describe the following intended control families: structured input and output handling; policy and quality gates; human authorization for material actions; logging and traceability; privacy and data-minimization controls; and integration with conventional software services.

== Analytical method

The document set was compared against four external reference areas: formal methods, AI test/evaluation/validation/verification (TEVV), aviation AI safety assurance, and digital-evidence authentication. The comparison is terminological and architectural. It is not a certification, conformance assessment, safety case, legal opinion, or forensic examination.

= Definitions used in this memorandum

#table(
  columns: (1.65in, 1fr),
  stroke: 0.35pt + rule,
  inset: 6pt,
  [#label("Term")], [#label("Working definition")],
  [Rule-governed workflow], [A software workflow in which explicit rules, policies, schemas, or access controls restrict permitted processing states or outputs.],
  [Deterministic control], [A control that produces a defined result for the same input and system state, such as a schema validator, access-control rule, hash function, or allow-list check.],
  [Probabilistic model], [A model whose output selection may be driven by learned statistical distributions; identical prompts need not produce identical substantive content.],
  [Formal methods], [Mathematically based techniques for specifying and verifying properties of software and systems (National Institute of Standards and Technology, “Formal Methods”).],
  [Evidence traceability], [Recorded information sufficient to reconstruct relevant inputs, configurations, actions, approvals, and outputs for later review.],
  [High assurance], [A claim supported by an explicit assurance case, bounded requirements, implementation evidence, test results, operational controls, and independent review appropriate to the deployment context.]
)

= Technical classification

== Primary classification: rule-governed AI workflow architecture

The documented system is most accurately described as a *rule-governed AI workflow architecture*. The design places deterministic mechanisms around model-mediated or automated processing: schemas define allowable structure; gates define prohibited or review-required states; access control limits permitted operations; and audit records preserve an execution history.

This design pattern is technically credible. NIST describes formal methods as mathematically based techniques for specifying and verifying properties of software and systems, including rule-based systems. NIST also cautions that testing remains necessary because proof assumptions may not hold when specifications are mapped to implemented code (National Institute of Standards and Technology, “Formal Methods”). The design documents describe components that could support this category; they do not by themselves prove that formal methods have been applied.

== Secondary classification: human-supervised decision-support control plane

The documented HCTA and human-approval requirements place the system in the category of a *human-supervised decision-support control plane*. The materials specify that material legal, financial, rights-affecting, or external actions require human authorization. This is consistent with the FAA’s safety-assurance principle that AI should be treated as a tool rather than a person and that system responsibility belongs to the designer and responsible human roles, not to the software (Federal Aviation Administration 8–10).

The cited FAA document applies to aviation safety assurance. It does not certify the present design for aviation use. Its relevance here is limited to systems-engineering terminology: allocation of responsibility, human oversight, incremental assurance, and evidence-based evaluation.

== Tertiary classification: evidence-traceability and auditability layer

The logging, hashing, source-verification, and policy-rationale requirements support characterizing part of the design as an *evidence-traceability and auditability layer*. This description is more precise than calling an output “legally admissible.” Under Federal Rule of Evidence 901, a proponent must provide sufficient evidence to support a finding that an item is what the proponent claims; for a process or system, the evidence must describe the process and show that it produces an accurate result (Legal Information Institute).

Execution logs, hashes, and system documentation can contribute to an authentication foundation. They do not by themselves establish relevance, reliability, admissibility, chain of custody, the truth of an asserted fact, or compliance with jurisdiction-specific evidence rules. Those matters require legal analysis and fact-specific proof.

= Traceability matrix

#table(
  columns: (1.3in, 1.8in, 2.1in, 1.45in),
  stroke: 0.35pt + rule,
  inset: 6pt,
  [#label("Documented control")], [#label("Recognized category")], [#label("Evidence needed for a substantiated claim")], [#label("Current classification")],
  [Schema builder / structured JSON], [Deterministic syntax and contract validation], [Schema source, validator version, test corpus, pass/fail records, and rejection handling.], [Design requirement],
  [DCG / PRQG gates], [Policy-as-code or rule-governed control], [Executable rule set, rule coverage, false-positive/false-negative testing, change-control record.], [Design requirement],
  [Human approval pathway], [Human-supervised decision support], [Role definitions, approval log, authority matrix, override policy, and audit sample.], [Design requirement],
  [Hashing and audit logs], [Evidence traceability], [Key-management design, retention policy, log-integrity tests, access record, and chain-of-custody procedure.], [Design requirement],
  [Privacy / data minimization], [Privacy engineering control], [Data inventory, data-flow diagram, retention/deletion tests, and applicable legal review.], [Design requirement],
  [Constrained model output], [Output-format control], [Model configuration, schema enforcement evidence, adversarial tests, and measured failure rate.], [Requires verification]
)

= Claims that require correction or qualification

The prior draft contained terms that exceeded the evidence available in the supplied documentation. The following controlled language should be used in their place.

#table(
  columns: (2.1in, 2.8in, 2.0in),
  stroke: 0.35pt + rule,
  inset: 6pt,
  [#label("Do not use")], [#label("Use instead")], [#label("Reason")],
  [“Formal intelligence class”], [“Internal project designation and proposed technical characterization.”], [No standards body or certification authority has been shown to recognize HADFI as a formal classification.],
  [“Zero entropy” or “deterministic truth”], [“Deterministic controls around bounded workflow states.”], [Schema and policy checks do not establish truth of open-ended model content.],
  [“Legally admissible output”], [“Output accompanied by traceability artifacts that may support later authentication review.”], [Evidence admissibility depends on jurisdiction, facts, procedure, and foundation.],
  [“High-assurance system”], [“Design intended for high-assurance evaluation.”], [High assurance requires an assurance case and implementation evidence.],
  [“Compliant” or “certified”], [“Designed to support assessment against specified requirements.”], [Compliance and certification require a defined scope and independent review.]
)

= Requirements and acceptance criteria

To use the stronger, evidence-based description “high-assurance rule-governed workflow,” the project record SHALL include the following artifacts.

#table(
  columns: (0.75in, 3.0in, 2.7in),
  stroke: 0.35pt + rule,
  inset: 6pt,
  [#label("ID")], [#label("Requirement")], [#label("Acceptance criterion")],
  [R-01], [The system SHALL identify each decision-relevant rule and its owning version.], [Each released rule has a unique identifier, version, rationale, test cases, and approval record.],
  [R-02], [The system SHALL record inputs, configurations, outputs, approvals, and exceptions needed for replay.], [A controlled replay reproduces the recorded workflow state or documents the reason reproduction is not possible.],
  [R-03], [The system SHALL distinguish deterministic control results from probabilistic-model content.], [The output format labels rule outcomes, model-derived content, confidence/uncertainty, and human decisions separately.],
  [R-04], [The system SHALL require human approval for pre-defined material actions.], [Approval logs demonstrate enforcement for sampled material workflows.],
  [R-05], [The system SHALL maintain a documented TEVV plan.], [The plan identifies measures, test data, limitations, context, and review cadence consistent with NIST TEVV concepts.],
  [R-06], [The system MUST NOT claim legal admissibility, regulatory compliance, or certification without an applicable review.], [External-facing materials use qualified language and link each claim to current supporting evidence.]
)

= Validation plan

NIST’s AI TEVV work treats trustworthy AI as dependent on measurements and evaluations, with context affecting how characteristics such as accuracy, safety, privacy, reliability, robustness, transparency, and security should be assessed (National Institute of Standards and Technology, “AI Test”). The following sequence provides a defined validation path.

1. *Specify.* Establish system boundaries, intended use, excluded uses, rule definitions, data categories, and human authority assignments.
2. *Implement.* Version-control schemas, rules, model configurations, logging logic, and access-control policies.
3. *Test.* Execute unit, integration, negative, adversarial, recovery, and retention/deletion tests; preserve results.
4. *Evaluate.* Measure rule coverage, rejection precision, output-format conformance, replay completeness, log-integrity failures, and human-approval enforcement.
5. *Review.* Conduct independent technical review appropriate to the use case. Obtain qualified legal review before making legal, evidentiary, privacy, payment, or regulatory claims.
6. *Maintain.* Re-test after material changes to models, prompts, rules, dependencies, data sources, or deployment context.

= Conclusion

The supplied materials support a disciplined and commercially intelligible design direction: a proposed rule-governed, human-supervised AI workflow architecture with evidence-traceability controls. That is the appropriate current classification.

The evidence does not support presenting HADFI as a recognized intelligence class, a deterministic source of truth, a certified high-assurance system, or a legally admissible evidentiary mechanism. Those stronger claims should be reserved for specific components after the project produces an assurance case, implementation artifacts, test results, governance records, and applicable independent technical or legal review.

= Works cited

Federal Aviation Administration. *Roadmap for Artificial Intelligence Safety Assurance: Version I*. 23 July 2024, https://www.faa.gov/media/82891. Accessed 12 Aug. 2026.

Legal Information Institute. “Rule 901. Authenticating or Identifying Evidence.” *Federal Rules of Evidence*, Cornell Law School, https://www.law.cornell.edu/rules/fre/rule_901. Accessed 12 Aug. 2026.

National Institute of Standards and Technology. “AI Test, Evaluation, Validation and Verification (TEVV).” *NIST*, https://www.nist.gov/ai-test-evaluation-validation-and-verification-tevv. Accessed 12 Aug. 2026.

---. “Formal Methods and Combinatorial Testing.” *Computer Security Resource Center*, updated 8 June 2026, https://csrc.nist.gov/projects/automated-combinatorial-testing-for-software/autonomous-systems-assurance/formal-methods. Accessed 12 Aug. 2026.

---. “AI Risk Management Framework.” *NIST*, https://www.nist.gov/itl/ai-risk-management-framework. Accessed 12 Aug. 2026.

= Glossary

#print-glossary(glossary-entries, show-all: true, disable-back-references: true)

= Compliance check

*Objective:* The memorandum addresses technical classification of the documented design. *Scope:* No additional product, legal, valuation, or implementation objective was added. *Terminology:* “HADFI” is identified as an internal designation, not an external classification. *Citation status:* External conclusions are tied to the Works Cited. *Unresolved uncertainty:* Implementation, audit, certification, compliance, and evidentiary admissibility require verification.
