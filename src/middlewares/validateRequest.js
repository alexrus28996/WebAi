const { errorResponse } = require('../utils/response');

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const validateCreateRule = (req, res, next) => {
  const { niche, audience, tone, frequency, preferredTime, autoGenerate } = req.body || {};

  if (
    !isNonEmptyString(niche)
    || !isNonEmptyString(audience)
    || !isNonEmptyString(tone)
    || !isNonEmptyString(frequency)
    || !isNonEmptyString(preferredTime)
    || typeof autoGenerate !== 'boolean'
  ) {
    return errorResponse(
      res,
      400,
      'VALIDATION_ERROR',
      'niche, audience, tone, frequency, preferredTime, and autoGenerate are required.'
    );
  }

  return next();
};

const validateGenerateDraft = (req, res, next) => {
  const { trendId, angle } = req.body || {};

  if (!isNonEmptyString(trendId) || !isNonEmptyString(angle)) {
    return errorResponse(
      res,
      400,
      'VALIDATION_ERROR',
      'trendId and angle are required.'
    );
  }

  return next();
};

const validateScheduleDraft = (req, res, next) => {
  const { draftId, scheduledTime } = req.body || {};

  if (!isNonEmptyString(draftId) || !isNonEmptyString(scheduledTime)) {
    return errorResponse(
      res,
      400,
      'VALIDATION_ERROR',
      'draftId and scheduledTime are required.'
    );
  }

  const scheduledDate = new Date(scheduledTime);
  if (Number.isNaN(scheduledDate.getTime())) {
    return errorResponse(
      res,
      400,
      'VALIDATION_ERROR',
      'scheduledTime must be a valid ISO string.'
    );
  }

  req.validatedScheduledTime = scheduledDate;
  return next();
};

module.exports = {
  validateCreateRule,
  validateGenerateDraft,
  validateScheduleDraft
};
