function positiveIntegerSetting(value, fallback, name) {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(name + " must be a positive integer.");
  }
  return parsed;
}

function getResearchIntakeRateLimitConfig(env = process.env) {
  return {
    limit: positiveIntegerSetting(env.RESEARCH_INTAKE_RATE_LIMIT, 30, "RESEARCH_INTAKE_RATE_LIMIT"),
    windowMs: positiveIntegerSetting(env.RESEARCH_INTAKE_RATE_WINDOW_MS, 15 * 60 * 1000, "RESEARCH_INTAKE_RATE_WINDOW_MS")
  };
}

module.exports = { getResearchIntakeRateLimitConfig, positiveIntegerSetting };
