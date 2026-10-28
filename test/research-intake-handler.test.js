const test = require("node:test");
const assert = require("node:assert/strict");
const { createResearchIntakeHandler, INSERT_SQL } = require("../lib/research-intake-handler");

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

function responseDouble() {
  return {
    statusCode: 200,
    payload: undefined,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; }
  };
}

function setup({ env = {}, queryImpl, sendMail, logger = { error() {} } } = {}) {
  const queries = [];
  const withDb = async callback => callback({
    query: async (sql, params = []) => {
      queries.push({ sql, params });
      if (queryImpl) return queryImpl(sql, params, queries.length);
      return [{ affectedRows: 1 }];
    }
  });
  const transports = [];
  const createTransport = config => {
    const transporter = { sendMail: async message => {
      if (sendMail) return sendMail(message);
      return { accepted: [message.to] };
    }};
    transports.push({ config, transporter });
    return transporter;
  };
  const handler = createResearchIntakeHandler({
    withDb, env, createTransport, logger,
    now: () => new Date("2026-10-28T12:00:00.000Z"),
    random: () => 0.5
  });
  return { handler, queries, transports };
}

test("INSERT SQL placeholder count matches parameter count and table columns", async () => {
  const { handler, queries } = setup();
  const res = responseDouble();
  await handler({ body: validPayload() }, res);
  assert.equal(res.statusCode, 503); // Email deliberately not configured.
  const columnBlock = INSERT_SQL.match(/INSERT INTO research_intake \(([\s\S]*?)\) VALUES/);
  assert.ok(columnBlock, "INSERT statement should declare its columns");
  const columnCount = columnBlock[1].split(",").map(column => column.trim()).length;
  assert.equal(columnCount, 22);
  assert.equal((INSERT_SQL.match(/\?/g) || []).length, 18);
  assert.equal(queries[0].params.length, 18);
  // 22 columns = 18 bound values + 2 NOW(3) expressions + 2 fixed status literals.
  assert.match(queries[0].sql, /INSERT INTO research_intake/);
  assert.equal(queries[0].params[0], res.payload.intakeId);
  assert.equal(queries[0].params[2], JSON.stringify(["Human"]));
});

test("invalid request is rejected before database or email side effects", async () => {
  const { handler, queries, transports } = setup({ env: { SMTP_USER: "x", SMTP_PASS: "y" } });
  const res = responseDouble();
  await handler({ body: validPayload({ encounterType: "forged" }) }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(queries.length, 0);
  assert.equal(transports.length, 0);
});

test("database insert failure sends no email and returns persistence error", async () => {
  const { handler, queries, transports } = setup({
    env: { SMTP_USER: "x", SMTP_PASS: "y" },
    queryImpl: async () => { throw new Error("db unavailable"); }
  });
  const res = responseDouble();
  await handler({ body: validPayload() }, res);
  assert.equal(res.statusCode, 503);
  assert.match(res.payload.error, /No email was sent/);
  assert.equal(queries.length, 1);
  assert.equal(transports.length, 0);
});

test("missing SMTP configuration records status and does not attempt email", async () => {
  const { handler, queries, transports } = setup();
  const res = responseDouble();
  await handler({ body: validPayload() }, res);
  assert.equal(res.statusCode, 503);
  assert.match(res.payload.error, /email is not yet configured/i);
  assert.match(queries[1].sql, /email_status='not_configured'/);
  assert.equal(transports.length, 0);
});

test("successful persistence and email updates status and returns intake ID", async () => {
  const { handler, queries, transports } = setup({
    env: { SMTP_USER: "sender@example.org", SMTP_PASS: "test-only" }
  });
  const res = responseDouble();
  await handler({ body: validPayload({ email: "person@example.org" }) }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.ok, true);
  assert.equal(queries.length, 2);
  assert.match(queries[1].sql, /email_status='sent'/);
  assert.equal(transports.length, 1);
  assert.deepEqual(transports[0].config, { host: "localhost", port: 25, secure: false, ignoreTLS: true });
});

test("email failure preserves saved record and records email failure", async () => {
  const { handler, queries } = setup({
    env: { SMTP_USER: "sender@example.org", SMTP_PASS: "test-only" },
    sendMail: async () => { throw new Error("relay unavailable"); }
  });
  const res = responseDouble();
  await handler({ body: validPayload() }, res);
  assert.equal(res.statusCode, 502);
  assert.match(res.payload.error, /record was saved, but email delivery failed/i);
  assert.match(queries[1].sql, /email_status='failed'/);
  assert.equal(queries[1].params[0], "relay unavailable");
});

test("email HTML escapes submitted markup before it enters the message", async () => {
  let capturedMessage;
  const { handler } = setup({
    env: { SMTP_USER: "sender@example.org", SMTP_PASS: "test-only" },
    sendMail: async message => { capturedMessage = message; return {}; }
  });
  const res = responseDouble();
  await handler({ body: validPayload({ summary: "<script>alert('x')</script>" }) }, res);
  assert.equal(res.statusCode, 200);
  assert.doesNotMatch(capturedMessage.html, /<script>/i);
  assert.match(capturedMessage.html, /&lt;script&gt;/i);
});

test("status-update failure after successful email is not misreported as delivery failure", async () => {
  let calls = 0;
  const { handler, queries } = setup({
    env: { SMTP_USER: "sender@example.org", SMTP_PASS: "test-only" },
    queryImpl: async (sql, params, count) => {
      calls++;
      if (count === 2) throw new Error("status write failed");
      return [{ affectedRows: 1 }];
    }
  });
  const res = responseDouble();
  await handler({ body: validPayload() }, res);
  assert.equal(calls, 2);
  assert.equal(res.statusCode, 503);
  assert.equal(res.payload.emailSent, true);
  assert.match(res.payload.error, /email was sent/i);
  assert.doesNotMatch(res.payload.error, /email delivery failed/i);
  assert.equal(queries.length, 2);
});
