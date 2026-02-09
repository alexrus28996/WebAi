const { errorResponse } = require('../utils/response');

const validateWithSchema = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const message = firstIssue && firstIssue.message ? firstIssue.message : 'Invalid request payload.';
    return errorResponse(res, 400, 'VALIDATION_ERROR', message);
  }

  req.validatedBody = result.data;

  if (Object.prototype.hasOwnProperty.call(result.data, 'scheduledTime')) {
    const scheduledTime = new Date(result.data.scheduledTime);
    if (!Number.isNaN(scheduledTime.getTime())) {
      req.validatedScheduledTime = scheduledTime;
    }
  }

  return next();
};

module.exports = {
  validateWithSchema
};
