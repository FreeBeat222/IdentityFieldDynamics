function createResearchIntakeRateLimiter({
  limit = 30,
  windowMs = 15 * 60 * 1000,
  now = () => Date.now()
} = {}) {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new TypeError("limit must be a positive integer");
  }
  if (!Number.isFinite(windowMs) || windowMs < 1) {
    throw new TypeError("windowMs must be a positive number");
  }

  // Deliberately global per process: do not trust proxy headers or assume req.ip
  // identifies an end user until the production proxy configuration is verified.
  let windowStartedAt = now();
  let requestCount = 0;

  return function researchIntakeRateLimiter(_req, res, next) {
    const currentTime = now();
    if (currentTime - windowStartedAt >= windowMs || currentTime < windowStartedAt) {
      windowStartedAt = currentTime;
      requestCount = 0;
    }

    if (requestCount >= limit) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((windowStartedAt + windowMs - currentTime) / 1000)
      );
      res.set("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        error: "The research-intake service is temporarily receiving too many submissions. Please wait and try again."
      });
    }

    requestCount += 1;
    return next();
  };
}

module.exports = { createResearchIntakeRateLimiter };
