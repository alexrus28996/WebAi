const Trend = require('../models/Trend');
const { fetchMockTrends } = require('../services/trendService');
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
    const created = await fetchMockTrends(req.workspaceId);
    await logAuditEvent({
      workspaceId: req.workspaceId,
      userId: req.user.userId,
      action: 'TRENDS_FETCHED',
      resourceType: 'Trend',
      meta: { count: created.length }
    });
    logger.info({
      requestId: req.requestId,
      action: 'TRENDS_FETCH_END',
      workspaceId: req.workspaceId,
      userId: req.user.userId,
      count: created.length
    });
    return successResponse(res, 201, { message: 'Mock trends stored.', trends: created });
  } catch (error) {
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to fetch trends.');
  } 
};

const listTrends = async (req, res) => {
  try {
    const trends = await Trend.find({ workspace: req.workspaceId }).sort({ createdAt: -1 });
    return successResponse(res, 200, trends);
  } catch (error) {
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to list trends.');
  }
};

module.exports = {
  fetchTrends,
  listTrends
};
