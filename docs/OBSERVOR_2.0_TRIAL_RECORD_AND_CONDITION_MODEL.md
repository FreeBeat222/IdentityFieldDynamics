# OBSERVOR 2.0 — Trial Record and Condition-Control Model

**Status:** Design specification  
**Project:** OBSERVOR 2.0 — Phenomenon / Ablation  
**Scope:** Trial-level data structure, condition integrity, and experimental provenance  
**Separation:** This specification applies only to OBSERVOR 2.0. It does not inherit schemas, constructs, scoring, or assumptions from OBSERVOR 5.2.

## 1. Governing rule

OBSERVOR 2.0 records what was configured, what was done, what was observed, and any deviation from the plan. It does not convert observations into an identity score or infer a construct during data collection.

The operating sequence remains:

**MEASURE → MANIPULATE → OBSERVE → COMPARE → CONSTRUCT**

A record must preserve enough information for another researcher to reconstruct the trial without relying on memory or an interpretation written after the fact.

## 2. Identifier hierarchy

These identifiers have separate meanings and must never be collapsed into one field.

| Field | Meaning | Rule |
|---|---|---|
| `study_id` | The registered study/protocol instance | Stable across participants and sessions in that study |
| `participant_id` | The experimental unit being observed | Stable within the study; pseudonymous where appropriate |
| `session_id` | One bounded data-collection session | Unique within the study and participant |
| `trial_id` | One attempted trial | Globally unique within the exported study dataset |
| `trial_index` | Order in the session | Integer assigned when the trial is created; never reused |

A participant may have multiple sessions; a session may contain multiple trials. The interface must not use a single “Study / participant ID” input for these different roles.

## 3. Condition model

The four conditions are categorical and mutually exclusive at the trial level:

| Code | Internal causal history | History supplied as information | Intended role |
|---|---|---|---|
| `H+` | Retained | As naturally available to the continuing system | History-retained comparison |
| `H−` | Ablated/reset | No | History-ablation condition |
| `H−I` | Ablated/reset | Yes, according to the declared reconstruction protocol | Tests whether supplied information reproduces the observed effect |
| `SHAM` | Retained | As naturally available | Controls for procedure without the relevant causal ablation |

The condition code describes the assigned condition, not proof that the manipulation succeeded. Each trial therefore records both:

- `assigned_condition`: the planned condition.
- `manipulation_status`: `not_attempted`, `completed_as_specified`, `partial`, `failed`, or `unknown`.

A deviation never silently changes the assigned condition. It is recorded separately and considered during analysis.

### 3.1 Condition integrity

- Never pool H−, H−I, and SHAM into a generic “not H+” category for primary comparisons.
- Preserve all four condition labels in raw records and exports.
- The same declared future task/perturbation must be applied across conditions when that is the intended comparison.
- The protocol must specify what “history” means for the particular system and what operation counts as retaining, ablating, externally supplying, or sham-manipulating it.
- H−I is not adequately defined by entering a free-text note. Its supplied information must be identified and versioned sufficiently to establish what was provided.
- SHAM must specify the procedure performed and why it omits the relevant causal ablation.

## 4. Study-level protocol declaration

Before collecting trials, the study configuration must declare:

- Study ID and protocol version.
- Research question.
- System/participant description sufficient to identify the experimental unit without unnecessary personal data.
- Candidate property or causal condition under investigation.
- Operational definition of history for this study.
- Task definition and task version.
- Stimulus/perturbation definition and version.
- Procedure for each of the four conditions.
- Allocation unit (for example, participant, session, or trial).
- Intended comparison structure (within-unit, between-unit, or another explicitly described design).
- Planned repetitions and stopping rule.
- Condition-order procedure, including whether order is fixed, randomized, or counterbalanced.
- Recorded outcome fields and their operational definitions.
- Exclusion/deviation rules established before examining outcomes.

The instrument may support these choices, but it must not silently choose a design. Randomization, counterbalancing, matching, and sample-size decisions remain protocol-level decisions until specified for a particular experiment.

## 5. Trial lifecycle

Each trial follows a controlled lifecycle:

1. **Create:** allocate trial ID and trial index.
2. **Freeze configuration:** snapshot study, participant, session, condition, task, stimulus, and protocol versions.
3. **Start:** record start timestamp and monotonic clock value.
4. **Manipulate:** record the operation attempted and its status.
5. **Present:** deliver the declared task/perturbation using the frozen configuration.
6. **Respond:** capture the response in the declared data format.
7. **Complete:** record end timestamp, elapsed time, and completion status.
8. **Annotate:** record deviations and operator notes separately from the raw response.
9. **Seal:** append the trial to the session record; do not rewrite its frozen configuration.

If configuration controls change after trial creation, those changes apply only to a later trial. They must not alter the metadata of a trial already started.

A reset or abandoned trial is not silently deleted. It receives an explicit status such as `aborted` or `invalidated`, with a reason.

## 6. Canonical trial record

The following is the logical record shape. It is a design contract, not a claim that the current HTML implements it.

```json
{
  "schema": "OBSERVOR-2.0-TRIAL",
  "schema_version": "1.0.0",
  "study_id": "STUDY-001",
  "participant_id": "P001",
  "session_id": "P001-S001",
  "trial_id": "STUDY-001-P001-S001-T001",
  "trial_index": 1,
  "assigned_condition": "H+",
  "protocol_version": "1.0.0",
  "task": {
    "task_id": "TASK-001",
    "task_version": "1.0.0",
    "stimulus_id": "STIM-001",
    "stimulus_version": "1.0.0",
    "perturbation_id": "PERT-001",
    "perturbation_version": "1.0.0"
  },
  "configuration_snapshot": {
    "candidate_property": "historical continuity",
    "history_definition": "Defined by the study protocol",
    "condition_procedure_id": "PROC-HPLUS-001"
  },
  "timing": {
    "started_at": "2026-11-01T20:00:00.000Z",
    "ended_at": "2026-11-01T20:00:02.350Z",
    "response_time_ms": 2350
  },
  "manipulation": {
    "attempted": true,
    "status": "completed_as_specified",
    "procedure_id": "PROC-HPLUS-001",
    "deviation": null
  },
  "observation": {
    "response_format": "text",
    "response_raw": "Recorded response",
    "choice": null,
    "outcome": null
  },
  "trial_status": "completed",
  "operator_notes": [],
  "instrument": {
    "name": "OBSERVOR",
    "version": "2.0",
    "build": "recorded-build-identifier"
  }
}
```

The example values are illustrative only. Actual timestamps, IDs, task definitions, response formats, and procedure identifiers must come from the experiment. A field that does not apply should be null or omitted according to the schema; it must not be fabricated.

## 7. Raw observation versus derived measures

Raw observations are primary records. Derived measures are computed later from explicitly defined subsets of those records.

The data model must distinguish:

- **Raw:** response, selected choice, timestamps, task outcome, manipulation status, deviations.
- **Descriptive:** counts, response-time distributions, within-condition variability, and other summaries with stated denominators.
- **Comparative:** contrasts between explicitly named conditions under a declared design.
- **Interpretive:** progression through the L0–L4 evidence ladder.

No derived value may overwrite a raw observation.

### 7.1 Suspended measures

The current prototype's `history-dependence index` is suspended. Its present calculation pools unlike conditions and has no method-approved operational definition.

The current cross-condition `choice persistence` aggregate is also suspended. Any future persistence measure must specify the sequence, unit of analysis, relevant condition, response coding, and treatment of missing/aborted trials before calculation.

Response time may be reported descriptively only when its start/end events and handling of timeouts, interruptions, and invalid trials are defined.

## 8. Comparison contract

The comparison layer must:

- Preserve the four conditions as separate groups.
- State the unit of analysis and the number of valid observations contributing to each result.
- Report missing, aborted, invalidated, and manipulation-failure counts.
- Compare like task/stimulus versions unless a deliberate variation is part of the protocol.
- Preserve trial order and session boundaries.
- Avoid causal language when the design or manipulation does not support it.
- Make the comparison reproducible from exported raw records.

The method document requires controlled conditions and repetitions. It does not prescribe one universal statistical test or one universal allocation design. Those must be declared by each study protocol.

## 9. Interpretation gate

The interface must not automatically promote a result up the interpretation ladder.

- **L0 — Observable behavior:** raw observations are available and inspectable.
- **L1 — Reproducible pattern:** repetition supports a pattern under stated conditions.
- **L2 — Persistent/distinctive organization:** the pattern persists across the specified relevant situations or perturbations.
- **L3 — Demonstrated causal historical dependence:** controlled manipulation and comparison support a causal historical-dependence claim.
- **L4 — Candidate construct:** a candidate construct is proposed to account for sufficiently established regularities.

Each promotion requires a written rationale, supporting trial set, protocol reference, and limitations. L4 is a candidate construct, not proof of identity. Identity remains a possible outcome, never a required label.

## 10. Export and preservation requirements

A study export must include:

- Study protocol and protocol version.
- All participant/session/trial identifiers.
- All raw trial records, including aborted or invalidated records.
- Condition definitions and procedure versions.
- Task, stimulus, and perturbation definitions/versions.
- Instrument version/build identifier.
- Derived summaries with explicit formulas and included-record references.
- Deviations, exclusions, and analysis notes.
- Export timestamp and schema version.

Export must be deterministic for an unchanged dataset. The original raw record must remain recoverable even if later analysis definitions change.

The current prototype stores data only in memory. Until durable storage is deliberately implemented and verified, the interface must clearly warn that reloading or closing the page loses unexported records.

## 11. Acceptance criteria for the next instrument build

The trial/condition core is not ready until all of the following are true:

1. Study, participant, session, and trial identifiers are separate.
2. Each trial receives a unique ID and immutable trial index.
3. All four conditions remain distinct from entry through export.
4. Assigned condition and actual manipulation status are separate.
5. Trial configuration is frozen at trial start.
6. Task and perturbation are executable, versioned procedures—not merely descriptive text fields.
7. Start/end timing uses a consistent clock and records the event definitions.
8. Raw responses and deviations are preserved without interpretive scoring.
9. Aborted, invalidated, and failed-manipulation trials remain visible in the record.
10. Export includes enough protocol and provenance information to reconstruct the trial.
11. No identity score, six-variable schema, or automatic L0–L4 promotion is present.
12. The user is warned accurately about persistence and data loss.

## 12. Open protocol decisions — deliberately not guessed

These must be decided for the first actual experiment before implementation is treated as research-ready:

- What exact system and experimental unit will be tested?
- What does “history” mean operationally for that system?
- What specific history-ablation and sham procedures are feasible?
- What constitutes equivalent historical information in H−I?
- What task and future perturbation will be applied identically across conditions?
- Is the design within-unit, between-unit, or mixed?
- How will condition order be assigned?
- What response/outcome is directly observable, and how is it coded?
- What counts as a valid trial, a failed manipulation, and an exclusion?

These are study-design decisions, not reasons to reintroduce a predetermined identity ontology.

---

**Design conclusion:** OBSERVOR 2.0 should be rebuilt around an immutable, provenance-rich trial record and four-condition integrity. The instrument records the experiment; the protocol defines the experiment; analysis evaluates the observations; construct formation comes last.
