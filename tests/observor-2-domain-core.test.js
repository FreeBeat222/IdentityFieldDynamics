import test from "node:test";
import assert from "node:assert/strict";
import {
  CONDITIONS,
  createSession,
  createTrial,
  transitionTrial,
  sealTrial,
  validateStudyProtocol,
  ObservorError
} from "../public/observor-assets/js/domain-core.js";

const protocol = () => ({
  study_id: "STUDY-TEST",
  protocol_version: "1.0.0",
  research_question: "Test the recorder state model.",
  candidate_property: "candidate continuity",
  history_definition: "Fixture-only operational definition.",
  experimental_unit: "simulated test unit",
  task: { task_id: "TASK-TEST", task_version: "1.0.0" },
  perturbation: { perturbation_id: "PERT-TEST", perturbation_version: "1.0.0" },
  condition_procedures: Object.fromEntries(CONDITIONS.map(condition => [
    condition,
    { procedure_id: `PROC-${condition}`, description: `Fixture procedure for ${condition}` }
  ]))
});

function setup(condition = "H+") {
  const p = protocol();
  const session = createSession({
    studyId: p.study_id,
    participantId: "P-TEST",
    protocolVersion: p.protocol_version,
    instrumentBuild: "test-build",
    now: "2026-11-01T00:00:00.000Z"
  });
  return { p, session, trial: createTrial(session, p, condition, { now: "2026-11-01T00:00:01.000Z" }) };
}

test("protocol validation requires all four distinct procedures", () => {
  assert.deepEqual(validateStudyProtocol(protocol()), []);
  const incomplete = protocol();
  delete incomplete.condition_procedures.SHAM;
  assert.ok(validateStudyProtocol(incomplete).some(message => message.includes("SHAM")));
});

test("each assigned condition is preserved as a distinct category", () => {
  for (const condition of CONDITIONS) {
    const { trial } = setup(condition);
    assert.equal(trial.assigned_condition, condition);
  }
});

test("trial snapshot does not change when source protocol changes", () => {
  const { p, trial } = setup();
  p.candidate_property = "changed after trial creation";
  p.condition_procedures["H+"].description = "changed";
  assert.equal(trial.configuration_snapshot.candidate_property, "candidate continuity");
  assert.notEqual(trial.configuration_snapshot.condition_procedure.description, "changed");
});

test("invalid lifecycle transitions are rejected", () => {
  const { trial } = setup();
  assert.throws(() => transitionTrial(trial, "completed"), error =>
    error instanceof ObservorError && error.code === "INVALID_TRANSITION"
  );
});

test("assigned condition is not treated as proof of successful manipulation", () => {
  const { trial } = setup("H−");
  transitionTrial(trial, "config_frozen");
  transitionTrial(trial, "started", { at: "2026-11-01T00:00:02.000Z" });
  transitionTrial(trial, "manipulation_recorded", {
    manipulation_status: "unverifiable",
    evidence: "No independent verification mechanism available."
  });
  assert.equal(trial.assigned_condition, "H−");
  assert.equal(trial.manipulation.status, "unverifiable");
});

test("terminal trial can be sealed and then becomes immutable", () => {
  const { trial } = setup();
  transitionTrial(trial, "config_frozen");
  transitionTrial(trial, "started");
  transitionTrial(trial, "manipulation_recorded", { manipulation_status: "not_attempted" });
  transitionTrial(trial, "task_presented", { task_result: { status: "presented" } });
  transitionTrial(trial, "response_captured", { observation: { response_raw: "fixture" }, response_time_ms: 10 });
  transitionTrial(trial, "completed");
  sealTrial(trial);
  assert.equal(trial.status, "sealed");
  assert.ok(Object.isFrozen(trial));
  assert.throws(() => transitionTrial(trial, "started"));
});
