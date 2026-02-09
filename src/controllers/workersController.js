const { runMockWorker } = require('../services/workerService');
const { successResponse, errorResponse } = require('../utils/response');
const { logAuditEvent } = require('../services/auditService');

const runWorker = async (req, res) => {
  try {
    const result = await runMockWorker();
    await logAuditEvent({
      workspaceId: req.workspaceId,
      userId: req.user.userId,
      action: 'WORKER_RUN'
    });
    return successResponse(res, 200, result);
  } catch (error) {
    return errorResponse(res, 500, 'INVALID_STATE', 'Worker failed.');
  }
};

module.exports = {
  runWorker
};
