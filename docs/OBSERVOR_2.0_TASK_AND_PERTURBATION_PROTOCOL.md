# OBSERVOR 2.0 — Task and Perturbation Protocol Contract

**Status:** Design specification  
**Project:** OBSERVOR 2.0 — Phenomenon / Ablation  
**Depends on:** `OBSERVOR_2.0_TRIAL_RECORD_AND_CONDITION_MODEL.md`  
**Scope:** Requirements for defining an executable, reproducible task and its condition-specific manipulation  
**Separation:** This document applies only to OBSERVOR 2.0. It does not import OBSERVOR 5.2 methods, fields, scores, or assumptions.

## 1. Purpose

The trial record specifies how an experiment is documented. This contract specifies what must be true before a task can be called an executable experiment.

A stimulus text box is not a task. A condition label is not a manipulation. A researcher note that a history was removed is not evidence that the intended ablation occurred.

OBSERVOR 2.0 must distinguish:

1. **Task:** the repeatable procedure that elicits an observable response.
2. **Stimulus:** the specific input presented during a task.
3. **Perturbation:** the controlled change introduced to test a candidate causal condition.
4. **Manipulation:** the operation used to create the assigned experimental condition.
5. **Manipulation check:** the evidence recorded that the intended operation actually occurred.
6. **Outcome:** the observable response or state change recorded after the task.

These are separate protocol elements. One must not stand in for another.

## 2. Task definition contract

Every executable task must have a versioned definition containing:

| Element | Required specification |
|---|---|
| Task ID/version | Stable identifier and revision |
| Purpose | What observable behavior/state the task is intended to elicit |
| Experimental unit | The system or unit to which the task is administered |
| Inputs | Exact stimulus/input types and permitted ranges |
| Presentation | How, when, and in what order inputs are delivered |
| Response | What the unit can do and how the response is captured |
| Timing | Start/end events, deadlines, and timeout handling |
| Repetition | Rules for repeated or novel trials |
| Scoring/coding | Observable outcome coding, if any, defined before collection |
| Invalidity | Conditions that make a trial invalid or incomplete |
| Reproduction | Information needed to repeat the same task version |

A task definition must not presuppose that the observed response represents identity, intelligence, consciousness, agency, or any other theoretical construct.

## 3. Perturbation definition contract

Every perturbation must specify:

- A unique perturbation ID and version.
- The candidate causal condition being manipulated.
- The exact operation performed.
- The state before manipulation, to the extent observable.
- The intended state after manipulation.
- The timing of the operation relative to task presentation.
- The scope and duration of the operation.
- The evidence used to verify completion.
- Known side effects or confounds.
- Recovery or reset procedure, if applicable.
- The distinction between successful, partial, failed, and unverifiable manipulation.

A perturbation is not operationally defined by a label such as “remove history.” The protocol must say what is removed, from where, by what operation, and how the result is checked for the specific experimental system.

If the operation cannot be verified, the record must say so. The instrument must not silently treat an attempted manipulation as a successful one.

## 4. Condition-to-procedure mapping

The four conditions remain distinct and must each map to an explicit procedure.

| Condition | Procedure requirement | Required verification |
|---|---|---|
| H+ | Define how the relevant internal causal history is retained and protected from unintended reset | Evidence that the continuity/retention procedure was maintained |
| H− | Define the actual ablation/reset operation and its scope | Evidence that the targeted history/state was removed or reset; note residuals or uncertainty |
| H−I | Apply the H− procedure, then supply a versioned, specified historical-information package | Evidence of the ablation plus exact identity/version and delivery record for the supplied information |
| SHAM | Perform a procedure matched as closely as feasible for handling, duration, and disruption, while omitting the relevant causal ablation | Evidence that the sham procedure occurred and that the targeted history was not ablated |

The protocol must explain what is equivalent across conditions and what intentionally differs. If the system cannot support one of these procedures, the study must report that limitation rather than silently redefining the condition.

## 5. Common future task and perturbation

For a direct condition comparison, the protocol must specify which task and future perturbation are held constant across H+, H−, H−I, and SHAM.

At minimum, record:

- Task ID/version.
- Stimulus set ID/version.
- Future perturbation ID/version.
- Presentation sequence or sequence-generation method.
- Any condition-specific difference that is unavoidable.
- Whether the comparison is intended to test immediate response, repeated behavior, recovery, or persistence over time.

If the future task differs across conditions, the difference must be declared and justified. A comparison must not be described as isolating history when task differences provide an alternative explanation.

## 6. Manipulation check and validity

Manipulation checks are observations about whether the procedure was executed as specified. They are not evidence that the hypothesized phenomenon exists.

Use these statuses:

- `not_attempted`
- `completed_as_specified`
- `partial`
- `failed`
- `unverifiable`

Record the evidence source and any deviation. The status must not be inferred solely from the operator selecting a condition.

Trial validity is a separate field. A trial can have a completed manipulation but an invalid task response, or a validly recorded response after a failed manipulation. Preserve both facts.

## 7. Repetition, order, and allocation

The study protocol must declare the allocation unit and order procedure before collection.

Possible designs include within-unit, between-unit, or mixed allocation. This document does not select one universally.

If order is randomized or counterbalanced, preserve the generated assignment/sequence and its method. If order is fixed, state that explicitly and recognize potential order effects.

Repetition must specify whether trials are:

- Exact repeats.
- New stimuli under the same task.
- Novel perturbations.
- Recovery/retest trials.

Do not treat these as interchangeable. Preserve trial order and session boundaries so later analysis can evaluate practice, fatigue, carryover, and recovery where relevant.

## 8. First-build execution boundary

The current `public/observor` prototype records a free-text stimulus description but does not deliver a controlled stimulus or enforce a perturbation. Therefore, it does not yet satisfy this contract.

The next implementation should provide a task adapter boundary rather than embedding assumptions about one particular experimental system in the general recorder.

A task adapter must expose the following conceptual operations:

1. `validateProtocol(protocol)` — reject incomplete or internally inconsistent task definitions.
2. `prepareTrial(frozenTrialConfig)` — prepare the exact task/stimulus version for this trial.
3. `applyCondition(manipulationPlan)` — request the assigned condition's operation through an explicitly configured mechanism.
4. `verifyCondition()` — return manipulation-check evidence and status.
5. `presentTask()` — deliver the declared task.
6. `captureResponse()` — return raw response data in the task's declared format.
7. `completeTrial()` — close timing and produce a record linked to the frozen configuration.

These are interface responsibilities, not existing functions. A general browser-only recorder cannot directly manipulate arbitrary external systems. The adapter must use a supported, authorized mechanism for the system under study. Where no such mechanism exists, OBSERVOR must operate in documented manual-observation mode and clearly mark manipulation verification as unavailable.

## 9. No fabricated experimental capability

The interface must not imply that it has:

- Removed or reset a system's history when it only recorded a condition label.
- Delivered identical stimuli when delivery was manual or uncontrolled.
- Verified a manipulation when it only recorded operator confirmation.
- Randomized condition order when it used a fixed sequence.
- Preserved data across reloads when storage is in-memory only.
- Established causation from descriptive differences alone.

The distinction between assigned, attempted, verified, observed, and inferred must remain visible in both the interface and exported data.

## 10. Acceptance criteria

A task/perturbation implementation is eligible for controlled pilot testing only when:

1. The task has a versioned, complete protocol definition.
2. The stimulus is actually delivered or its manual presentation is explicitly documented.
3. The perturbation is an executable operation or a clearly identified manual procedure.
4. Each of the four conditions maps to a distinct declared procedure.
5. H−I identifies the exact information package supplied.
6. SHAM defines the procedure and what causal operation it omits.
7. Manipulation status is supported by recorded evidence and can be marked unverifiable.
8. The common future task/perturbation is specified across conditions.
9. Order/allocation and repetition rules are declared.
10. Raw response capture follows the task's declared format.
11. Trial records preserve deviations, invalidity, and manipulation failures.
12. The interface makes no unsupported claims about manipulation, persistence, randomization, or causal inference.

Passing these criteria establishes implementation readiness for a specified pilot protocol. It does not establish that the experiment has been validated or that any hypothesized phenomenon exists.

## 11. Decisions reserved for the first empirical protocol

The actual system, experimental unit, task, history definition, ablation mechanism, sham procedure, information-equivalence rule for H−I, future perturbation, and outcome coding remain study-specific decisions.

They cannot be responsibly filled in by a generic instrument specification. Until these are selected and operationally justified, OBSERVOR 2.0 can build and test its recording/control framework, but it cannot claim to execute the target history-ablation experiment.

---

**Design conclusion:** The recorder must never pretend to perform an experiment. OBSERVOR 2.0 will execute only the task and manipulation procedures that a versioned study protocol actually defines and that the instrument can genuinely deliver or verify.
