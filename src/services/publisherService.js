const DraftPost = require('../models/DraftPost');
const ScheduledPost = require('../models/ScheduledPost');
const { logAuditEvent } = require('./auditService');
const logger = require('../utils/logger');
const { provider } = require('../scheduler');

const truncateError = (message, limit = 300) => {
  if (!message) {
    return null;
  }
  return message.length > limit ? message.slice(0, limit) : message;
};

const runPublisher = async ({ workspaceId, userId, requestId }) => {
  const now = new Date();
  const scheduledPosts = await ScheduledPost.find({
    workspaceId,
    status: 'queued',
    scheduledTime: { $lte: now },
    attempts: { $lt: 3 }
  });

  if (!scheduledPosts.length) {
    return { message: 'No scheduled posts ready to publish.', results: [] };
  }

  const results = [];

  for (const scheduledPost of scheduledPosts) {
    logger.info({
      requestId,
      action: 'PUBLISH_ATTEMPT',
      workspaceId,
      scheduledPostId: scheduledPost._id.toString(),
      draftId: scheduledPost.draftId.toString()
    });

    try {
      const draft = await DraftPost.findOne({
        _id: scheduledPost.draftId,
        workspace: workspaceId
      });

      if (!draft) {
        throw new Error('Draft not found for scheduled post.');
      }

      const publishResult = await provider.publishNow({
        workspaceId,
        draftId: draft._id.toString(),
        text: draft.content
      });

      scheduledPost.status = 'posted';
      scheduledPost.externalId = publishResult.externalId;
      scheduledPost.lastError = null;
      await scheduledPost.save();

      draft.status = 'posted';
      await draft.save();

      await logAuditEvent({
        workspaceId,
        userId,
        action: 'POST_PUBLISHED',
        resourceType: 'ScheduledPost',
        resourceId: scheduledPost._id.toString()
      });

      logger.info({
        requestId,
        action: 'POST_PUBLISHED',
        workspaceId,
        scheduledPostId: scheduledPost._id.toString(),
        draftId: draft._id.toString(),
        externalId: publishResult.externalId
      });

      results.push({
        scheduledPostId: scheduledPost._id.toString(),
        draftId: draft._id.toString(),
        status: 'posted',
        externalId: publishResult.externalId
      });
    } catch (error) {
      scheduledPost.attempts += 1;
      scheduledPost.lastError = truncateError(error.message);
      if (scheduledPost.attempts >= 3) {
        scheduledPost.status = 'failed';
      }
      await scheduledPost.save();

      await logAuditEvent({
        workspaceId,
        userId,
        action: 'POST_FAILED',
        resourceType: 'ScheduledPost',
        resourceId: scheduledPost._id.toString()
      });

      logger.error({
        requestId,
        action: 'POST_FAILED',
        workspaceId,
        scheduledPostId: scheduledPost._id.toString(),
        draftId: scheduledPost.draftId.toString(),
        error: error.message
      });

      results.push({
        scheduledPostId: scheduledPost._id.toString(),
        draftId: scheduledPost.draftId.toString(),
        status: scheduledPost.status,
        error: scheduledPost.lastError
      });
    }
  }

  return {
    message: 'Publisher run complete.',
    results
  };
};

module.exports = {
  runPublisher
};
