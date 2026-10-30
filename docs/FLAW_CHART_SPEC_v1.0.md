# FLAW CHART™ — Instrument Specification v1.0

**Full name:** Failure Logging, Analysis, and Verification  
**Type:** IFD research instrument  
**Status:** Working specification; operational performance not yet validated  
**Version:** 1.0  
**Canonical public page:** `/flaw-chart.html`  
**Owning workflow:** Four-channel IFD workflow — Research / Construction / Verification / Archiving

## 1. Purpose

FLAW CHART™ is the IFD instrument for identifying, registering, classifying, investigating, tracking, verifying, and documenting features, conditions, inconsistencies, limitations, and defects in a theoretical structure, model, formulation, research process, or implementation when they warrant examination.

Its scope is broader than defect detection. It preserves the history of what has been identified, the evidence and context surrounding it, the assessments made, the options considered, the disposition selected, and the consequences observed. It is itself subject to the same scrutiny.

## 1.1 The governing view

A flaw is an identifiable feature, condition, inconsistency, limitation, or defect placed under examination. Its presence does not predetermine its value or disposition.

Depending on its nature, consequences, intended use, needs, and circumstances, an identified condition may warrant:

- correction or removal;
- redesign or reinforcement;
- further development or deeper investigation;
- preservation, including where an apparent inconsistency or limitation has research value;
- strategic exploitation, where a weakness or limitation offers a deliberate advantage and its use is justified;
- monitoring or deferral while evidence or context remains insufficient.

A condition may be a genuine defect requiring correction. The broader framework does not minimize defects or turn every weakness into an opportunity. It prevents the instrument from assuming the correct disposition before the condition has been understood.

**FLAW CHART™ identifies the condition. It does not dictate the disposition.**

**Identification precedes judgment. Investigation precedes disposition.**

**Exploitation is not endorsement.** Strategic use is one possible disposition, not an automatic recommendation or a claim that the condition is safe, ethical, effective, or desirable.

The discovery of a flaw creates an option; it does not impose an obligation.

## 2. Governing rules

1. An identified condition is not automatically a demonstrated defect.
2. A suspected defect is not a demonstrated defect.
3. A proposed correction is not a verified correction.
4. A wording change alone does not establish resolution.
5. Preserve the exact passage or observed behavior, source, version, and context.
6. Preserve contrary evidence, alternative interpretations, and rejected findings with their reasons.
7. Separate observation, inference, interpretation, assessment, and conclusion.
8. Consider the condition's context, consequences, intended use, risks, and possible utility before disposition.
9. Verify that a correction addresses the original issue and does not create or relocate another.
10. Keep unresolved items visible; do not silently delete or rewrite their history.
11. Apply the same standards to FLAW CHART™ and its own procedures.
12. No classification or severity label substitutes for evidence or a reasoned disposition.

## 3. Classification vocabulary

An entry may have one primary class and additional tags:

- **DEFINITION** — ambiguous, circular, inconsistent, or missing definition.
- **LOGICAL** — contradiction, invalid inference, hidden premise, or non sequitur.
- **MATHEMATICAL** — derivation, notation, calculation, or formal-property concern.
- **EMPIRICAL** — unsupported observation, measurement problem, failed prediction, or counterexample.
- **METHODOLOGICAL** — sampling, controls, operationalization, bias, or reproducibility concern.
- **STRUCTURAL** — missing dependency, broken relationship, scope conflict, or architecture gap.
- **PROVENANCE** — missing, incorrect, or unverifiable source/version/history.
- **IMPLEMENTATION** — code, page, instrument, link, or deployment defect.
- **PRESENTATION** — wording or interface issue that affects interpretation or use.
- **OTHER** — specify; do not force-fit.

Classification is descriptive, not a verdict. It identifies the kind of issue or condition under examination; it does not decide whether the condition is harmful, useful, neutral, or worth retaining.

## 4. Lifecycle

1. **IDENTIFY** — Locate a feature, condition, inconsistency, limitation, defect, opportunity, or question warranting examination.
2. **REGISTER** — Assign a stable ID and preserve exact location, version, source, and context.
3. **CLASSIFY** — Describe type, scope, dependencies, and potential significance without overstating certainty.
4. **INVESTIGATE** — Examine evidence, assumptions, derivations, counterexamples, and alternative explanations.
5. **TRACK** — Maintain dated history of tests, findings, decisions, revisions, and open questions.
6. **VERIFY** — Test whether a proposed correction resolves the original issue without creating or relocating another.
7. **DISPOSITION** — Record the selected treatment and its rationale: correct, remove, redesign, reinforce, develop, preserve, strategically exploit, monitor, defer, or reject the finding. Record why the selected option is appropriate in context.

The lifecycle can loop. Verification may reopen investigation; a new source may change classification; a disposition may be revised when new evidence warrants it.

## 5. Status vocabulary

- **OPEN** — registered; investigation not complete.
- **INVESTIGATING** — active examination.
- **CORRECTION PROPOSED** — a candidate change exists; not yet verified.
- **VERIFYING** — the candidate correction is being tested.
- **PARTIALLY RESOLVED** — some aspects are addressed; residual issue remains.
- **RESOLVED** — evidence supports that the defined issue has been addressed within stated limits.
- **DEFERRED** — intentionally paused with reason and review condition.
- **REJECTED** — the challenge is not accepted, with reasons and evidence preserved.
- **REOPENED** — a previously dispositioned item is active again due to new information.

Status describes workflow state, not truth value.

## 6. Canonical record schema

Every formal entry should contain:

| Field | Required content |
|---|---|
| FLAW ID | Stable identifier, e.g. FC-2026-001 |
| Title | Short, specific issue name |
| Opened / Updated | Dates and responsible editor |
| Status | One status from the controlled vocabulary |
| Primary Class / Tags | Classification and optional tags |
| Target | Document, construct, claim, instrument, code, or process |
| Source Location | Exact URL/path, section, line, version, or commit where possible |
| Exact Passage / Behavior | Verbatim excerpt or reproducible observed behavior |
| Issue Statement | What appears wrong, unclear, unsupported, incomplete, significant, or potentially useful |
| Context / Intended Use | The conditions, objectives, and setting relevant to assessing the item |
| Potential Utility / Opportunity | Any plausible advantage or research value, clearly distinguished from demonstrated utility |
| Claim / Assumption at Risk | The proposition or dependency affected |
| Evidence & Provenance | Sources, observations, calculations, files, and their provenance |
| Counterevidence / Alternatives | Relevant competing explanations or contrary evidence |
| Dependencies / Scope | Other claims or components affected; known limits |
| Investigation Log | Dated actions, tests, results, and decisions |
| Proposed Correction | Candidate remedy, clearly marked as unverified |
| Verification Protocol | What test would count as adequate and why |
| Verification Result | Actual result, evidence, and residual limitations |
| Disposition | Reasoned outcome and rationale |
| Related Entries | Linked FLAW IDs |
| Archive References | Commit, file, memorandum, or other durable record |

## 7. Verification standard

A correction may be marked RESOLVED only when the entry records:

- the original issue and its acceptance criteria;
- the exact correction and the version in which it appears;
- a verification method appropriate to the issue;
- observed result and supporting evidence;
- checks for regressions, displaced problems, or new contradictions;
- remaining limitations and the scope of the resolution.

If any required element is missing, retain a non-final status or explain the justified exception. “Resolved” is bounded by the tested scope; it does not certify the entire theory or system.

## 8. Four-channel integration

- **RESEARCH:** discover challenges, collect sources and observations, preserve provenance.
- **CONSTRUCTION:** clarify definitions, map dependencies, formulate candidate corrections.
- **VERIFICATION:** test the issue and the correction, record results and limitations.
- **ARCHIVING:** preserve the entry, revisions, evidence, decisions, and links.

Coordination and dependency tracking support the four channels; they are not a fifth channel.

## 9. Record identifier and archive convention

Suggested identifier: `FC-YYYY-NNN` (year plus sequential number). IDs are permanent and must not be reused.

Suggested record path: `docs/flaw-chart/records/FC-YYYY-NNN-short-title.md`.

The repository record is the durable archive. The public instrument page explains the protocol; it does not itself imply a live database, automatic submission, or persistent browser storage.

## 10. Blank entry template

```markdown
# FC-YYYY-NNN — [Short title]

- Opened:
- Updated:
- Status: OPEN
- Primary class:
- Tags:
- Target:
- Source location:
- Related entries:

## Exact passage / observed behavior

## Issue statement

## Claim or assumption at risk

## Evidence and provenance

## Counterevidence / alternative explanations

## Dependencies and scope

## Investigation log
- YYYY-MM-DD — Action / observation / result:

## Proposed correction
[Unverified until tested.]

## Verification protocol

## Verification result

## Disposition and rationale

## Archive references
```

## 11. Limitations and governance

FLAW CHART™ is a named IFD working instrument. This specification defines its intended operation; it does not establish that the instrument is effective, complete, unbiased, or empirically validated. Its categories, workflow, and record format may be revised through documented review. Earlier records must retain provenance and change history.

A disposition is contextual and revisable. Strategic exploitation must be recorded with its purpose, anticipated benefit, foreseeable risks, constraints, and observed consequences. It must not be used to disguise a defect, suppress contrary evidence, or imply endorsement. Where the evidence is insufficient, the item may remain open, be monitored, or be deferred.

**Operating maxim:** IDENTIFICATION PRECEDES JUDGMENT. INVESTIGATION PRECEDES DISPOSITION. FLAW CHART™ IDENTIFIES THE CONDITION; IT DOES NOT DICTATE THE DISPOSITION.
