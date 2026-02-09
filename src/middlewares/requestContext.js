const crypto = require('crypto');
const logger = require('../utils/logger');

const createRequestId = () => {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return crypto.randomBytes(16).toString('hex');
};

const requestContext = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || createRequestId();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    logger.info({
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      workspaceId: req.workspaceId,
      userId: req.user ? req.user.userId : undefined,
      status: res.statusCode,
      durationMs
    });
  });

  next();
};

module.exports = requestContext;
