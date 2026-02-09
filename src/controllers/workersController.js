const { runMockWorker } = require('../services/workerService');
const { successResponse, errorResponse } = require('../utils/response');
const { logAuditEvent } = require('../services/auditService');
const logger = require('../utils/logger');

const runWorker = async (req, res) => {
  try {
    logger.info({
      requestId: req.requestId,
      action: 'WORKER_RUN_START',
      workspaceId: req.workspaceId,
      userId: req.user.userId
    });
    const result = await runMockWorker();
    await logAuditEvent({
      workspaceId: req.workspaceId,
      userId: req.user.userId,
      action: 'WORKER_RUN'
    });
    logger.info({
      requestId: req.requestId,
      action: 'WORKER_RUN_END',
      workspaceId: req.workspaceId,
      userId: req.user.userId
    });
    return successResponse(res, 200, result);
  } catch (error) {
    return errorResponse(res, 500, 'INVALID_STATE', 'Worker failed.');
  }
};

module.exports = {
  runWorker
};
