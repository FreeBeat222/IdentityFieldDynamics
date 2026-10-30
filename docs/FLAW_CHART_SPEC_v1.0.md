# FLAW CHART™ — Instrument Specification v1.0

**Full name:** Failure Logging, Analysis, and Verification  
**Type:** IFD research instrument  
**Status:** Working specification; operational performance not yet validated  
**Version:** 1.0  
**Canonical public page:** `/flaw-chart.html`  
**Owning workflow:** Four-channel IFD workflow — Research / Construction / Verification / Archiving

## 1. Purpose

FLAW CHART™ is the IFD instrument for identifying, registering, classifying, investigating, tracking, verifying, and documenting suspected and demonstrated weaknesses in a theoretical structure, model, formulation, research process, or implementation.

It preserves the history of challenges, evidence, attempted corrections, verification outcomes, unresolved matters, and rejected criticisms. It is itself subject to the same scrutiny.

## 2. Governing rules

1. A suspected weakness is not a demonstrated defect.
2. A proposed correction is not a verified correction.
3. A wording change alone does not establish resolution.
4. Preserve the exact challenged passage, source, version, and context.
5. Preserve contrary evidence and rejected findings with their reasons.
6. Separate observation, inference, interpretation, and conclusion.
7. Verify that a correction addresses the original issue and does not create or relocate another.
8. Keep unresolved items visible; do not silently delete or rewrite their history.
9. Apply the same standards to FLAW CHART™ and its own procedures.
10. No severity label substitutes for evidence or a reasoned disposition.

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

Classification is descriptive, not a verdict.

## 4. Lifecycle

1. **IDENTIFY** — Locate a possible contradiction, ambiguity, unsupported claim, missing definition, failed test, or structural breakpoint.
2. **REGISTER** — Assign a stable ID and preserve exact location, version, source, and context.
3. **CLASSIFY** — Describe type, scope, dependencies, and potential significance without overstating certainty.
4. **INVESTIGATE** — Examine evidence, assumptions, derivations, counterexamples, and alternative explanations.
5. **TRACK** — Maintain dated history of tests, findings, decisions, revisions, and open questions.
6. **VERIFY** — Test whether a proposed correction resolves the original issue without creating or relocating another.
7. **DISPOSITION** — Record a reasoned outcome and supporting evidence.

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
| Issue Statement | What appears wrong, unclear, unsupported, or incomplete |
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

**Operating maxim:** NO SUSPECTED FLAW IS PRESUMED PROVEN. NO PROPOSED CORRECTION IS PRESUMED SUCCESSFUL. NO FINDING ESCAPES SCRUTINY—INCLUDING THE FLAW CHART™ ITSELF.
