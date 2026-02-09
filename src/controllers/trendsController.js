const Trend = require('../models/Trend');
const { fetchTrendsForWorkspace } = require('../services/trendService');
const { successResponse, errorResponse } = require('../utils/response');
const { logAuditEvent } = require('../services/auditService');
const logger = require('../utils/logger');

const fetchTrends = async (req, res) => {
  try {
    logger.info({
      requestId: req.requestId,
      action: 'TRENDS_FETCH_START',
      workspaceId: req.workspaceId,
      userId: req.user.userId
    });
    const summary = await fetchTrendsForWorkspace(req.workspaceId, { requestId: req.requestId });
    await logAuditEvent({
      workspaceId: req.workspaceId,
      userId: req.user.userId,
      action: 'TRENDS_FETCHED',
      resourceType: 'Trend',
      meta: summary
    });
    logger.info({
      requestId: req.requestId,
      action: 'TRENDS_FETCH_END',
      workspaceId: req.workspaceId,
      userId: req.user.userId,
      summary
    });
    return successResponse(res, 200, { message: 'Trends fetched.', summary });
  } catch (error) {
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to fetch trends.');
  } 
};

const listTrends = async (req, res) => {
  try {
    const { status } = req.query;
    const limit = Number.parseInt(req.query.limit, 10) || 50;
    const query = { workspaceId: req.workspaceId };

    if (status && ['new', 'used', 'ignored'].includes(status)) {
      query.status = status;
    }

    const trends = await Trend.find(query)
      .sort({ publishedAt: -1 })
      .limit(limit);

    return successResponse(res, 200, trends);
  } catch (error) {
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to list trends.');
  }
};

module.exports = {
  fetchTrends,
  listTrends
};
