const DraftPost = require('../models/DraftPost');
const ScheduledPost = require('../models/ScheduledPost');
const { successResponse, errorResponse } = require('../utils/response');
const { logAuditEvent } = require('../services/auditService');
const logger = require('../utils/logger');

const scheduleDraft = async (req, res) => {
  try {
    const { draftId } = req.validatedBody;
    logger.info({
      requestId: req.requestId,
      action: 'DRAFT_SCHEDULE_START',
      workspaceId: req.workspaceId,
      userId: req.user.userId,
      draftId
    });
    const draft = await DraftPost.findOne({ _id: draftId, workspace: req.workspaceId });
    if (!draft) {
      return errorResponse(res, 404, 'INVALID_STATE', 'Draft not found.');
    }

    if (draft.status === 'posted') {
      return errorResponse(res, 400, 'INVALID_STATE', 'Draft already posted.');
    }

    if (draft.status !== 'draft') {
      return errorResponse(res, 400, 'INVALID_STATE', 'Draft status cannot be scheduled.');
    }

    const existingScheduledPost = await ScheduledPost.findOne({
      workspaceId: req.workspaceId,
      draftId: draft._id
    });

    if (existingScheduledPost) {
      return errorResponse(res, 409, 'CONFLICT', 'Draft already scheduled.');
    }

    const scheduledPost = await ScheduledPost.create({
      workspaceId: req.workspaceId,
      draftId: draft._id,
      scheduledTime: req.validatedScheduledTime,
      status: 'queued'
    });

    draft.status = 'scheduled';
    draft.scheduledTime = req.validatedScheduledTime;
    await draft.save();
    await logAuditEvent({
      workspaceId: req.workspaceId,
      userId: req.user.userId,
      action: 'DRAFT_SCHEDULED',
      resourceType: 'DraftPost',
      resourceId: draft._id.toString()
    });
    logger.info({
      requestId: req.requestId,
      action: 'DRAFT_SCHEDULE_END',
      workspaceId: req.workspaceId,
      userId: req.user.userId,
      draftId: draft._id.toString()
    });

    return successResponse(res, 200, {
      message: 'Draft scheduled.',
      draft,
      scheduledPost
    });
  } catch (error) {
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to schedule draft.');
  }
};

module.exports = {
  scheduleDraft
};
