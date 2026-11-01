/**
 * OBSERVOR 2.0 domain core.
 * Browser-native ES module. No DOM, network, persistence, or framework dependency.
 * Scope: OBSERVOR 2.0 only; no OBSERVOR 5.2 imports or legacy scoring.
 */

export const CONDITIONS = Object.freeze(["H+", "H−", "H−I", "SHAM"]);

export const MANIPULATION_STATUS = Object.freeze([
  "not_attempted",
  "completed_as_specified",
  "partial",
  "failed",
  "unverifiable"
]);

export const TRIAL_STATUS = Object.freeze([
  "created",
  "config_frozen",
  "started",
  "manipulation_recorded",
  "task_presented",
  "response_captured",
  "completed",
  "aborted",
  "invalidated",
  "failed",
  "sealed"
]);

const TRANSITIONS = Object.freeze({
  created: ["config_frozen", "aborted"],
  config_frozen: ["started", "aborted"],
  started: ["manipulation_recorded", "aborted", "failed"],
  manipulation_recorded: ["task_presented", "aborted", "failed"],
  task_presented: ["response_captured", "aborted", "failed"],
  response_captured: ["completed", "aborted", "invalidated", "failed"],
  completed: ["sealed"],
  aborted: ["sealed"],
  invalidated: ["sealed"],
  failed: ["sealed"],
  sealed: []
});

export class ObservorError extends Error {
  constructor(code, message, details = []) {
    super(message);
    this.name = "ObservorError";
    this.code = code;
    this.details = details;
  }
}

const isObject = value => value !== null && typeof value === "object" && !Array.isArray(value);
const required = (obj, key) => typeof obj?.[key] === "string" && obj[key].trim().length > 0;

function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

export function validateStudyProtocol(protocol) {
  const errors = [];
  if (!isObject(protocol)) return ["Protocol must be an object."];
  for (const field of ["study_id", "protocol_version", "research_question", "candidate_property", "history_definition"]) {
    if (!required(protocol, field)) errors.push(`Missing required protocol field: ${field}`);
  }
  if (!isObject(protocol.task) || !required(protocol.task, "task_id") || !required(protocol.task, "task_version")) {
    errors.push("Task must declare task_id and task_version.");
  }
  if (!isObject(protocol.perturbation) || !required(protocol.perturbation, "perturbation_id") || !required(protocol.perturbation, "perturbation_version")) {
    errors.push("Perturbation must declare perturbation_id and perturbation_version.");
  }
  if (!isObject(protocol.condition_procedures)) {
    errors.push("condition_procedures must define all four condition procedures.");
  } else {
    for (const condition of CONDITIONS) {
      const procedure = protocol.condition_procedures[condition];
      if (!isObject(procedure) || !required(procedure, "procedure_id") || !required(procedure, "description")) {
        errors.push(`Condition ${condition} requires procedure_id and description.`);
      }
    }
  }
  if (!required(protocol, "experimental_unit")) errors.push("Missing required protocol field: experimental_unit.");
  return errors;
}

export function assertValidProtocol(protocol) {
  const errors = validateStudyProtocol(protocol);
  if (errors.length) {
    throw new ObservorError("INVALID_PROTOCOL", "Study protocol is incomplete.", errors);
  }
  return deepFreeze(clone(protocol));
}

export function createSession({ studyId, participantId, protocolVersion, instrumentBuild, now = new Date().toISOString() }) {
  for (const [key, value] of Object.entries({ studyId, participantId, protocolVersion, instrumentBuild })) {
    if (typeof value !== "string" || !value.trim()) {
      throw new ObservorError("INVALID_SESSION", `Session requires ${key}.`);
    }
  }
  return {
    session_id: crypto.randomUUID(),
    study_id: studyId,
    participant_id: participantId,
    protocol_version: protocolVersion,
    instrument_build: instrumentBuild,
    started_at: now,
    ended_at: null,
    next_trial_index: 1,
    trials: [],
    deviations: []
  };
}

export function createTrial(session, protocol, assignedCondition, options = {}) {
  if (!session || !Array.isArray(session.trials)) throw new ObservorError("INVALID_SESSION", "A valid session is required.");
  if (!CONDITIONS.includes(assignedCondition)) throw new ObservorError("INVALID_CONDITION", "Assigned condition must be one of H+, H−, H−I, or SHAM.");
  const frozenProtocol = assertValidProtocol(protocol);
  if (session.study_id !== frozenProtocol.study_id || session.protocol_version !== frozenProtocol.protocol_version) {
    throw new ObservorError("PROTOCOL_SESSION_MISMATCH", "Trial protocol does not match the active session.");
  }
  const trialIndex = session.next_trial_index++;
  const trialId = crypto.randomUUID();
  const procedure = frozenProtocol.condition_procedures[assignedCondition];
  const snapshot = deepFreeze(clone({
    study_id: session.study_id,
    participant_id: session.participant_id,
    session_id: session.session_id,
    trial_id: trialId,
    trial_index: trialIndex,
    assigned_condition: assignedCondition,
    protocol_version: frozenProtocol.protocol_version,
    task: frozenProtocol.task,
    perturbation: frozenProtocol.perturbation,
    condition_procedure: procedure,
    candidate_property: frozenProtocol.candidate_property,
    history_definition: frozenProtocol.history_definition,
    created_at: options.now ?? new Date().toISOString()
  }));
  const trial = {
    schema: "OBSERVOR-2.0-TRIAL",
    schema_version: "1.0.0",
    trial_id: trialId,
    trial_index: trialIndex,
    assigned_condition: assignedCondition,
    status: "created",
    configuration_snapshot: snapshot,
    manipulation: { attempted: false, status: "not_attempted", evidence: null, deviation: null },
    task_result: null,
    observation: null,
    timing: { started_at: null, ended_at: null, response_time_ms: null },
    events: [{ type: "trial_created", at: snapshot.created_at }],
    operator_notes: []
  };
  session.trials.push(trial);
  return trial;
}

export function transitionTrial(trial, nextStatus, details = {}) {
  if (!trial || !TRANSITIONS[trial.status]) throw new ObservorError("INVALID_TRIAL", "Trial state is invalid.");
  if (!TRANSITIONS[trial.status].includes(nextStatus)) {
    throw new ObservorError("INVALID_TRANSITION", `Cannot transition trial from ${trial.status} to ${nextStatus}.`);
  }
  if (trial.status === "sealed") throw new ObservorError("TRIAL_SEALED", "A sealed trial cannot be changed.");
  const fromStatus = trial.status;
  const at = details.at ?? new Date().toISOString();
  if (nextStatus === "started") trial.timing.started_at = at;
  if (nextStatus === "manipulation_recorded") {
    const status = details.manipulation_status;
    if (!MANIPULATION_STATUS.includes(status)) throw new ObservorError("INVALID_MANIPULATION_STATUS", "A valid manipulation status is required.");
    trial.manipulation = {
      attempted: status !== "not_attempted",
      status,
      evidence: details.evidence ?? null,
      deviation: details.deviation ?? null
    };
  }
  if (nextStatus === "task_presented") {
    if (!isObject(details.task_result)) throw new ObservorError("MISSING_TASK_RESULT", "Task presentation requires a structured adapter result.");
    trial.task_result = clone(details.task_result);
  }
  if (nextStatus === "response_captured") {
    if (!isObject(details.observation)) throw new ObservorError("MISSING_OBSERVATION", "Response capture requires a structured observation.");
    trial.observation = clone(details.observation);
    if (Number.isFinite(details.response_time_ms) && details.response_time_ms >= 0) {
      trial.timing.response_time_ms = details.response_time_ms;
    }
  }
  if (["completed", "aborted", "invalidated", "failed"].includes(nextStatus)) {
    trial.timing.ended_at = at;
    if (details.reason) trial.events.push({ type: "terminal_reason", reason: String(details.reason), at });
  }
  trial.status = nextStatus;
  trial.events.push({ type: "status_transition", from: fromStatus, to: nextStatus, at, details: clone(details) });
  if (nextStatus === "sealed") deepFreeze(trial);
  return trial;
}

export function addTrialAnnotation(trial, { kind = "operator_note", text, at = new Date().toISOString() }) {
  if (!trial || trial.status === "sealed") throw new ObservorError("TRIAL_SEALED", "Cannot annotate a missing or sealed trial.");
  if (typeof text !== "string" || !text.trim()) throw new ObservorError("EMPTY_ANNOTATION", "Annotation text is required.");
  trial.operator_notes.push({ kind, text, at });
  trial.events.push({ type: "annotation_added", kind, at });
  return trial;
}

export function sealTrial(trial, { at = new Date().toISOString() } = {}) {
  if (!["completed", "aborted", "invalidated", "failed"].includes(trial?.status)) {
    throw new ObservorError("NOT_TERMINAL", "Only a completed, aborted, invalidated, or failed trial can be sealed.");
  }
  return transitionTrial(trial, "sealed", { at });
}
