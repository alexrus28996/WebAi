const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { errorResponse } = require('./response');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 401, 'VALIDATION_ERROR', 'Missing or invalid authorization header.');
  }

  const token = authHeader.replace('Bearer ', '').trim();
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded;
    return next();
  } catch (error) {
    return errorResponse(res, 401, 'VALIDATION_ERROR', 'Invalid or expired token.');
  }
};

module.exports = authMiddleware;
