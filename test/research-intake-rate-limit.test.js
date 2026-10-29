const test = require("node:test");
const assert = require("node:assert/strict");
const { createResearchIntakeRateLimiter } = require("../lib/research-intake-rate-limit");

function responseDouble() {
  return {
    statusCode: 200,
    headers: {},
    payload: undefined,
    set(name, value) { this.headers[name] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; }
  };
}

test("allows requests up to the configured per-process window limit", () => {
  let now = 1000;
  const limiter = createResearchIntakeRateLimiter({ limit: 2, windowMs: 1000, now: () => now });
  let nextCalls = 0;
  limiter({}, responseDouble(), () => { nextCalls += 1; });
  limiter({}, responseDouble(), () => { nextCalls += 1; });
  const blocked = responseDouble();
  limiter({}, blocked, () => { nextCalls += 1; });
  assert.equal(nextCalls, 2);
  assert.equal(blocked.statusCode, 429);
  assert.equal(blocked.headers["Retry-After"], "1");
  assert.match(blocked.payload.error, /temporarily receiving too many submissions/i);
});

test("resets the request allowance when the window expires", () => {
  let now = 1000;
  const limiter = createResearchIntakeRateLimiter({ limit: 1, windowMs: 1000, now: () => now });
  let nextCalls = 0;
  limiter({}, responseDouble(), () => { nextCalls += 1; });
  const blocked = responseDouble();
  limiter({}, blocked, () => { nextCalls += 1; });
  assert.equal(blocked.statusCode, 429);
  now = 2000;
  const allowed = responseDouble();
  limiter({}, allowed, () => { nextCalls += 1; });
  assert.equal(allowed.statusCode, 200);
  assert.equal(nextCalls, 2);
});

test("rejects invalid limiter configuration", () => {
  assert.throws(() => createResearchIntakeRateLimiter({ limit: 0 }), /positive integer/);
  assert.throws(() => createResearchIntakeRateLimiter({ windowMs: 0 }), /positive number/);
});
