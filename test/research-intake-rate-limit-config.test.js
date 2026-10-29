const test = require("node:test");
const assert = require("node:assert/strict");
const { getResearchIntakeRateLimitConfig } = require("../lib/research-intake-rate-limit-config");

test("uses safe defaults when settings are absent", () => {
  assert.deepEqual(getResearchIntakeRateLimitConfig({}), {
    limit: 30,
    windowMs: 15 * 60 * 1000
  });
});

test("accepts valid positive integer settings", () => {
  assert.deepEqual(getResearchIntakeRateLimitConfig({
    RESEARCH_INTAKE_RATE_LIMIT: "12",
    RESEARCH_INTAKE_RATE_WINDOW_MS: "60000"
  }), { limit: 12, windowMs: 60000 });
});

test("rejects zero, negative, fractional, and nonnumeric settings", () => {
  for (const value of ["0", "-1", "1.5", "nope"]) {
    assert.throws(
      () => getResearchIntakeRateLimitConfig({ RESEARCH_INTAKE_RATE_LIMIT: value }),
      /RESEARCH_INTAKE_RATE_LIMIT must be a positive integer/
    );
  }
  assert.throws(
    () => getResearchIntakeRateLimitConfig({ RESEARCH_INTAKE_RATE_WINDOW_MS: "0" }),
    /RESEARCH_INTAKE_RATE_WINDOW_MS must be a positive integer/
  );
});
