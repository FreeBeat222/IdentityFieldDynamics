# OBSERVOR 2.0 — Software Architecture

**Status:** Architecture specification  
**Project:** OBSERVOR 2.0 — Phenomenon / Ablation  
**Depends on:**  
- `OBSERVOR_2.0_TRIAL_RECORD_AND_CONDITION_MODEL.md`
- `OBSERVOR_2.0_TASK_AND_PERTURBATION_PROTOCOL.md`

**Scope:** A practical, testable architecture for the next OBSERVOR 2.0 instrument implementation.  
**Separation:** This specification applies only to OBSERVOR 2.0. It does not import OBSERVOR 5.2 code, methods, data structures, task families, or assumptions.

## 1. Architectural objective

Build a reliable experiment recorder around a protocol-defined task, four distinct conditions, an immutable trial configuration snapshot, raw observations, and reproducible export.

The instrument must record what was planned, what operation was attempted, what could be verified, what was observed, and what deviations occurred. It must not infer identity or promote evidence levels automatically.

The first implementation should remain a small browser application. The repository is an Express-based website, but the current OBSERVOR instrument is a static HTML page. Nothing in the recovered method requires a new backend, microservices, a database, user accounts, or network submission. Do not introduce those dependencies unless a later requirement justifies them.

## 2. Architectural boundaries

Use separable modules with one-way dependencies:

| Layer | Responsibility | Must not do |
|---|---|---|
| Presentation | Render protocol, session, trial, status, and export controls | Define experimental logic or calculate interpretations |
| Application controller | Coordinate user actions and lifecycle transitions | Mutate sealed records or invent protocol choices |
| Protocol domain | Validate study, task, perturbation, and condition definitions | Execute external manipulations itself |
| Trial domain | Create IDs, freeze configuration, enforce lifecycle and status rules | Infer successful manipulation from assignment |
| Adapters | Execute a declared task or condition procedure where an authorized mechanism exists | Claim an operation succeeded without evidence |
| Observation capture | Capture declared response fields and timing events | Convert raw responses into theoretical constructs |
| Record store | Append and retrieve raw study/session/trial records | Rewrite raw observations during analysis |
| Analysis | Produce explicitly defined descriptive/comparative outputs | Pool unlike conditions or silently exclude records |
| Export/provenance | Serialize records, protocol, versions, and build metadata | Omit deviations or replace raw data with summaries |

Dependencies flow inward from presentation/controller to domain contracts and outward only through explicit adapter/store interfaces. Analysis reads records; it does not write back into them.

## 3. Suggested client-side module layout

Keep the current public route and page entry point stable. A first modular implementation can use browser-native JavaScript modules without adding a framework or build system.

Proposed layout (create only as implementation proceeds):

```text
public/
  observor                 # existing route target / page entry point
  observor-assets/
    css/
      observor.css
    js/
      app.js
      domain/
        protocol.js
        conditions.js
        trial.js
        identifiers.js
      adapters/
        task-adapter.js
        condition-adapter.js
      capture/
        response-capture.js
        timing.js
      storage/
        record-store.js
        memory-store.js
        local-store.js       # only after persistence behavior is specified and tested
      analysis/
        descriptive.js
        comparison.js
      export/
        serialize.js
        provenance.js
      ui/
        render.js
        events.js
```

This is a target boundary map, not a claim that these files already exist. Modules may be consolidated where that reduces needless complexity, provided their responsibilities and tests remain separable. Do not create empty scaffolding for every proposed file.

## 4. Core domain objects

### 4.1 Study protocol

A validated, versioned declaration containing the research question, experimental unit, candidate property/causal condition, operational history definition, task and perturbation versions, condition procedures, allocation/order plan, repetitions, outcome coding, validity rules, and stopping rule.

The protocol is immutable for a running session. Editing it creates a new protocol version; it must not silently rewrite prior trials.

### 4.2 Session

A session binds one study and one participant identifier to a bounded collection of attempted trials. It records session start/end, protocol version, instrument build, and session-level deviations.

### 4.3 Trial

A trial is created from a validated protocol and receives:
- unique `trial_id`
- monotonic `trial_index` within its session
- assigned condition
- frozen protocol/task/stimulus/perturbation versions
- frozen configuration snapshot
- lifecycle and manipulation status
- raw observations, timing, deviations, and provenance

Once sealed, the trial is append-only. Corrections are additional annotations/events with author/time/reason; they do not silently overwrite the original record.

### 4.4 Adapter result

Every adapter returns a structured result with:
- attempted/not attempted
- status
- start/end timestamps where applicable
- evidence or verification reference
- deviation/error details
- adapter name and version

A condition adapter result and a task adapter result are separate. A successful task presentation does not prove successful condition manipulation, and vice versa.

## 5. Trial lifecycle state machine

Allowed progression:

```text
CREATED
  -> CONFIG_FROZEN
  -> STARTED
  -> MANIPULATION_RECORDED
  -> TASK_PRESENTED
  -> RESPONSE_CAPTURED
  -> COMPLETED
  -> SEALED
```

Terminal alternatives:
- `ABORTED`: trial stopped before normal completion; preserve reason and all events recorded so far.
- `INVALIDATED`: trial retained but excluded under a predeclared validity rule; record the rule and rationale.
- `FAILED`: a required operation failed; retain the assigned condition and record the failure.

Rules:
1. A transition must be validated by the trial domain, not by UI button visibility alone.
2. Configuration is frozen before STARTED.
3. A trial cannot move backwards or be silently restarted.
4. Reset creates or returns to a new trial state; it never erases a prior attempted trial.
5. The assigned condition is immutable after configuration freeze.
6. Manipulation status is an observed result, not a synonym for assigned condition.
7. All terminal states remain exportable.

## 6. Adapter contracts

The core recorder must be independent of any one experimental system.

### Task adapter

Conceptual interface:
- `validateTask(taskDefinition)`
- `prepareTrial(frozenTrialConfig)`
- `presentTask()`
- `captureResponse(responseSchema)`
- `completeTask()`

It must return explicit results and errors. A free-text prompt may be used only when the protocol explicitly defines free text as the response format; it is not a substitute for a controlled task.

### Condition adapter

Conceptual interface:
- `validateProcedure(conditionProcedure)`
- `prepareCondition(frozenTrialConfig)`
- `applyCondition()`
- `verifyCondition()`
- `reportManipulationResult()`

The adapter must be authorized and technically capable of operating on the selected experimental unit. If no such mechanism exists, use an explicitly declared manual/unavailable mode. In that mode, the recorder records the operator's report and verification status; it must not imply the software performed or independently verified the manipulation.

### Adapter isolation

Adapters receive only the frozen trial configuration and their declared protocol. They return structured results. They do not directly mutate session state, raw records, or UI elements.

## 7. Storage boundary and data-loss behavior

Define a small storage interface:
- `saveStudy(studyRecord)`
- `loadStudy(studyId)`
- `appendSession(sessionRecord)`
- `appendTrial(sessionId, trialRecord)`
- `exportStudy(studyId)`

The first safe implementation may use an in-memory store plus explicit export/download. The interface permits later durable storage without binding domain logic to a storage technology.

If local browser persistence is later selected, it must be separately tested for quota errors, browser privacy modes, multi-tab conflicts, schema migration, corruption, and user deletion. Do not describe browser storage as a backup or cross-device synchronization.

Until durable persistence is implemented and verified:
- show a persistent unsaved-data warning;
- show the count of unexported records;
- require an explicit export action;
- warn before navigation/reload when unexported records exist where browser behavior permits;
- never claim data is saved merely because it is visible in the current page.

No records are sent to a server by this architecture.

## 8. Analysis boundary

Analysis operates on a read-only snapshot of sealed raw records.

Initial permitted outputs:
- record counts by condition and trial status;
- missing/aborted/invalidated/manipulation-status counts;
- descriptive response summaries where outcome coding is declared;
- response-time summaries only when timing event definitions and inclusion rules are explicit.

Comparison output must identify its exact condition pair/group, unit of analysis, task/stimulus versions, inclusion rules, denominators, and design limitations.

The history-dependence index and cross-condition choice-persistence aggregate remain suspended. No automatic construct scoring, identity score, or L0–L4 promotion is implemented.

Every derived output records:
- analysis name/version;
- formula or procedure version;
- included trial IDs;
- excluded trial IDs and reasons;
- generation timestamp.

## 9. Export and provenance

Export is a complete, deterministic package for an unchanged dataset:
1. study protocol and version;
2. study/session/participant/trial identifiers;
3. all raw trial records, including incomplete and failed attempts;
4. condition/task/stimulus/perturbation definitions and versions;
5. adapter names/versions and manipulation-check evidence;
6. deviations, exclusions, and operator annotations;
7. instrument version/build identifier;
8. derived outputs with formulas and source trial IDs;
9. schema version and export timestamp.

Use a documented JSON format as the canonical machine-readable export. A human-readable CSV may be added for trial-level tabular fields, but it must not replace the complete JSON record because nested protocol, provenance, and event details would be lost.

## 10. Error handling and integrity

- Validate protocol and required fields before enabling trial start.
- Freeze all trial-relevant settings before starting.
- Treat adapter exceptions/timeouts as explicit failures or unverifiable outcomes, never as success.
- Record unexpected interruption and partial capture.
- Preserve raw response exactly as captured, subject to the declared privacy/data-minimization protocol.
- Escape user-provided content when rendering it; never inject it as HTML.
- Do not log participant response content to server logs or browser console.
- Do not collect unnecessary personal identifiers.
- Do not add remote analytics, telemetry, or third-party scripts to the research instrument.
- A malformed record must be quarantined/reported, not silently dropped.

## 11. Test architecture

Tests should be added alongside implementation, not deferred until after the instrument is built.

### Domain unit tests
- condition codes remain four distinct values;
- IDs are unique and trial indices are monotonic within session;
- configuration snapshots do not change when UI settings later change;
- invalid lifecycle transitions are rejected;
- abort/invalidate/failure states remain records;
- assigned condition is independent of manipulation status;
- sealed raw observations cannot be mutated through normal APIs.

### Adapter contract tests
- missing or invalid protocol definitions are rejected;
- adapter success requires an explicit result;
- partial, failed, and unverifiable results remain distinguishable;
- adapter errors never become successful manipulation status;
- manual mode is labelled as operator-reported/unverified.

### Integration tests
- complete trial from configuration freeze through sealing;
- abort at each lifecycle stage and preserve partial record;
- change settings mid-trial and verify snapshot integrity;
- export/re-import round trip preserves all raw fields and condition labels;
- analysis denominators and exclusions match the source trial IDs;
- reload/data-loss warning accurately reflects storage state.

### Browser/UI tests
- keyboard-accessible controls and clear status text;
- no accidental destructive reset;
- export is available and produces valid JSON;
- user input is rendered as text, not executable markup;
- warning remains visible while data is only in memory.

## 12. Implementation sequence

Build in bounded increments:

1. **Domain core:** protocol validation, identifiers, four-condition enum, immutable trial snapshot, lifecycle state machine.
2. **Recorder shell:** session setup, trial controls, explicit status display, raw response capture.
3. **Adapter seam:** task and condition adapter interfaces; manual/unverifiable mode until a real study defines executable operations.
4. **Record store:** in-memory implementation plus complete JSON export and unsaved-data warning.
5. **Analysis minimum:** counts and declared descriptive summaries only; keep suspended measures absent.
6. **Verification:** unit, adapter, integration, and browser tests; inspect exported records with fixtures.
7. **Study-specific adapter:** only after a real experimental unit, task, history operation, H−I information package, SHAM procedure, and verification method are defined.

No implementation stage may be called research-ready solely because the UI works. Research readiness requires a specified study protocol, executable and verifiable task/manipulation procedures, valid records, and tests.

## 13. Decisions intentionally left open

This architecture does not select:
- the first experimental system or unit;
- the operational meaning of history;
- the actual H−, H−I, or SHAM procedures;
- the first task, stimulus, or future perturbation;
- response coding or outcome measures;
- allocation, matching, randomization, or counterbalancing;
- persistence technology or server storage.

These decisions require study-specific evidence and authorization. Architecture must support them without pretending they have already been resolved.

---

**Architecture conclusion:** Keep OBSERVOR 2.0 as a small, modular browser instrument with strict domain boundaries, pluggable task/condition adapters, immutable raw trial records, explicit storage limits, and reproducible export. The software records and protects the experiment; it does not invent the experiment or decide what the observations mean.
