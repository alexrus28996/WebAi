const PostingRules = require('../models/PostingRules');
const { successResponse, errorResponse } = require('../utils/response');

const createRule = async (req, res) => {
  try {
    const { niche, audience, tone, frequency, preferredTime, autoGenerate } = req.body;
    const rule = await PostingRules.create({
      workspace: req.user.workspaceId,
      user: req.user.userId,
      niche,
      audience,
      tone,
      frequency,
      preferredTime,
      autoGenerate
    });

    return successResponse(res, 201, rule);
  } catch (error) {
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to create rule.');
  }
};

const getRules = async (req, res) => {
  try {
    const rules = await PostingRules.find({ workspace: req.user.workspaceId }).sort({ createdAt: -1 });
    return successResponse(res, 200, rules);
  } catch (error) {
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to fetch rules.');
  }
};

module.exports = {
  createRule,
  getRules
};
