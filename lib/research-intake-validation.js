const allowedEncounterTypes = new Set([
  "Something happened to me",
  "Something happened between me and another identity",
  "I observed something in another identity",
  "I observed a recurring pattern",
  "I am investigating a question",
  "I don't know yet"
]);
const allowedParticipants = new Set([
  "Human", "Animal", "Machine", "AI / electrical system",
  "Collective / group", "Other / unknown"
]);
const allowedPersistence = new Set(["", "It persisted", "It changed", "It disappeared", "It recurred", "Unclear"]);
const allowedRepeatable = new Set(["", "Yes", "No", "Possibly", "I don't know"]);
const allowedConsent = new Set(["No follow-up requested", "Yes, you may contact me"]);
const textLimits = {
  participantOther: 1000, summary: 5000, sequence: 5000, firstObserved: 255,
  observable: 5000, persistence: 100, repeatable: 100, evidence: 5000,
  independent: 3000, interpretation: 5000, question: 3000, name: 255,
  email: 320, consent: 100, notes: 5000
};
const required = ["encounterType", "summary", "observable", "interpretation", "question"];

function validateResearchIntake(incoming) {
  const fail = error => ({ ok: false, status: 400, error });
  if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
    return fail("Please submit a valid research-intake record.");
  }

  const body = {};
  for (const key of Object.keys(textLimits)) {
    const value = incoming[key] ?? "";
    if (typeof value !== "string") {
      return fail("Please check the format of each text field and try again.");
    }
    const normalized = value.trim();
    if (normalized.length > textLimits[key]) {
      return fail("One or more fields exceed the permitted length. Please shorten the entry and try again.");
    }
    body[key] = normalized;
  }

  if (typeof incoming.encounterType !== "string" || !allowedEncounterTypes.has(incoming.encounterType)) {
    return fail("Please choose a valid encounter type.");
  }
  body.encounterType = incoming.encounterType;

  if (!Array.isArray(incoming.participants) ||
      incoming.participants.length > allowedParticipants.size ||
      incoming.participants.some(value => typeof value !== "string" || !allowedParticipants.has(value)) ||
      new Set(incoming.participants).size !== incoming.participants.length) {
    return fail("Please choose valid participant categories.");
  }
  body.participants = incoming.participants;

  if (!allowedPersistence.has(body.persistence) || !allowedRepeatable.has(body.repeatable) ||
      !allowedConsent.has(body.consent)) {
    return fail("Please choose valid options for the observation and follow-up fields.");
  }
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return fail("Please enter a valid email address or leave the email field blank.");
  }
  if (required.some(key => !body[key])) {
    return fail("Please complete the encounter, phenomenon, observation, interpretation, and research-question fields.");
  }
  return { ok: true, body };
}

module.exports = { validateResearchIntake };
