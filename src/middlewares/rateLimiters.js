const { errorResponse } = require('../utils/response');

const createRateLimiter = ({ windowMs, max, keyFn }) => {
  const store = new Map();

  return (req, res, next) => {
    const key = keyFn(req);
    if (!key) {
      return errorResponse(res, 401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const now = Date.now();
    const windowStart = now - windowMs;
    const timestamps = store.get(key) || [];
    const recent = timestamps.filter((timestamp) => timestamp > windowStart);

    if (recent.length >= max) {
      store.set(key, recent);
      return errorResponse(res, 429, 'RATE_LIMITED', 'Rate limit exceeded.');
    }

    recent.push(now);
    store.set(key, recent);
    return next();
  };
};

const rateLimitAuth = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyFn: (req) => req.ip
});

const rateLimitGeneration = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 30,
  keyFn: (req) => (req.user ? req.user.userId : null)
});

module.exports = {
  rateLimitAuth,
  rateLimitGeneration
};
