const test = require("node:test");
const assert = require("node:assert/strict");
const { validateResearchIntake } = require("../lib/research-intake-validation");

function validPayload(overrides = {}) {
  return {
    encounterType: "I am investigating a question",
    participants: ["Human"],
    participantOther: "",
    summary: "A concise event summary.",
    sequence: "",
    firstObserved: "",
    observable: "A directly observable behavior.",
    persistence: "",
    repeatable: "",
    evidence: "",
    independent: "",
    interpretation: "A provisional interpretation.",
    question: "What would distinguish competing explanations?",
    name: "",
    email: "",
    consent: "No follow-up requested",
    notes: "",
    ...overrides
  };
}

test("accepts a valid minimal intake and normalizes text whitespace", () => {
  const result = validateResearchIntake(validPayload({ summary: "  Event summary  " }));
  assert.equal(result.ok, true);
  assert.equal(result.body.summary, "Event summary");
  assert.deepEqual(result.body.participants, ["Human"]);
});

test("rejects missing, null, array, and primitive request bodies", () => {
  for (const value of [null, undefined, [], "text", 42]) {
    assert.equal(validateResearchIntake(value).ok, false);
  }
});

test("rejects missing required research fields", () => {
  for (const field of ["encounterType", "summary", "observable", "interpretation", "question"]) {
    const payload = validPayload();
    payload[field] = "";
    assert.equal(validateResearchIntake(payload).ok, false, field);
  }
});

test("rejects unknown encounter types and participant categories", () => {
  assert.match(validateResearchIntake(validPayload({ encounterType: "made up" })).error, /encounter type/i);
  assert.match(validateResearchIntake(validPayload({ participants: ["Admin"] })).error, /participant categories/i);
});

test("rejects missing, non-array, duplicate, and oversized participant lists", () => {
  for (const participants of [undefined, "Human", ["Human", "Human"], ["Human", "Animal", "Machine", "AI / electrical system", "Collective / group", "Other / unknown", "Human"]]) {
    assert.equal(validateResearchIntake(validPayload({ participants })).ok, false);
  }
});

test("rejects non-string text fields and fields over their length limit", () => {
  assert.equal(validateResearchIntake(validPayload({ summary: 17 })).ok, false);
  assert.equal(validateResearchIntake(validPayload({ summary: "x".repeat(5001) })).ok, false);
  assert.equal(validateResearchIntake(validPayload({ email: "x".repeat(321) })).ok, false);
  assert.equal(validateResearchIntake(validPayload({ participantOther: "x".repeat(1001) })).ok, false);
});

test("rejects invalid enumerated observation and follow-up values", () => {
  for (const overrides of [
    { persistence: "maybe" },
    { repeatable: "sometimes" },
    { consent: "sure" }
  ]) {
    assert.equal(validateResearchIntake(validPayload(overrides)).ok, false);
  }
});

test("accepts a normal email and rejects malformed email addresses", () => {
  assert.equal(validateResearchIntake(validPayload({ email: "researcher@example.org" })).ok, true);
  for (const email of ["not-an-email", "a b@example.org", "a@@example.org", "a@example", "@example.org"]) {
    assert.equal(validateResearchIntake(validPayload({ email })).ok, false, email);
  }
  assert.equal(validateResearchIntake(validPayload({ email: "" })).ok, true);
  assert.equal(validateResearchIntake(validPayload({ email: " a@example.org " })).body.email, "a@example.org");
});

test("does not retain arbitrary client-supplied properties", () => {
  const result = validateResearchIntake(validPayload({ admin: true, raw_payload: { secret: "x" }, unexpected: "extra" }));
  assert.equal(result.ok, true);
  assert.equal(Object.hasOwn(result.body, "admin"), false);
  assert.equal(Object.hasOwn(result.body, "raw_payload"), false);
  assert.equal(Object.hasOwn(result.body, "unexpected"), false);
});

test("accepts the full set of distinct participant categories", () => {
  const participants = ["Human", "Animal", "Machine", "AI / electrical system", "Collective / group", "Other / unknown"];
  const result = validateResearchIntake(validPayload({ participants }));
  assert.equal(result.ok, true);
  assert.deepEqual(result.body.participants, participants);
});
