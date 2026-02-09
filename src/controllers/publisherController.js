const { runPublisher } = require('../services/publisherService');
const { successResponse, errorResponse } = require('../utils/response');
const { logAuditEvent } = require('../services/auditService');
const logger = require('../utils/logger');

const runPublisherHandler = async (req, res) => {
  try {
    logger.info({
      requestId: req.requestId,
      action: 'PUBLISH_RUN_START',
      workspaceId: req.workspaceId,
      userId: req.user.userId
    });

    const result = await runPublisher({
      workspaceId: req.workspaceId,
      userId: req.user.userId,
      requestId: req.requestId
    });

    await logAuditEvent({
      workspaceId: req.workspaceId,
      userId: req.user.userId,
      action: 'PUBLISH_RUN'
    });

    logger.info({
      requestId: req.requestId,
      action: 'PUBLISH_RUN_END',
      workspaceId: req.workspaceId,
      userId: req.user.userId
    });

    return successResponse(res, 200, result);
  } catch (error) {
    return errorResponse(res, 500, 'INVALID_STATE', 'Publisher run failed.');
  }
};

module.exports = {
  runPublisherHandler
};
