const PostingRules = require('../models/PostingRules');
const { successResponse, errorResponse } = require('../utils/response');
const { logAuditEvent } = require('../services/auditService');

const createRule = async (req, res) => {
  try {
    const { niche, audience, tone, frequency, preferredTime, autoGenerate } = req.body;
    const rule = await PostingRules.create({
      workspace: req.workspaceId,
      user: req.user.userId,
      niche,
      audience,
      tone,
      frequency,
      preferredTime,
      autoGenerate
    });
    await logAuditEvent({
      workspaceId: req.workspaceId,
      userId: req.user.userId,
      action: 'RULES_CREATED',
      resourceType: 'PostingRules',
      resourceId: rule._id.toString()
    });

    return successResponse(res, 201, rule);
  } catch (error) {
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to create rule.');
  }
};

const getRules = async (req, res) => {
  try {
    const rules = await PostingRules.find({ workspace: req.workspaceId }).sort({ createdAt: -1 });
    return successResponse(res, 200, rules);
  } catch (error) {
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to fetch rules.');
  }
};

module.exports = {
  createRule,
  getRules
};
