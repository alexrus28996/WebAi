const Trend = require('../models/Trend');
const { fetchMockTrends } = require('../services/trendService');
const { successResponse, errorResponse } = require('../utils/response');

const fetchTrends = async (req, res) => {
  try {
    const created = await fetchMockTrends(req.user.workspaceId);
    return successResponse(res, 201, { message: 'Mock trends stored.', trends: created });
  } catch (error) {
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to fetch trends.');
  } 
};

const listTrends = async (req, res) => {
  try {
    const trends = await Trend.find({ workspace: req.user.workspaceId }).sort({ createdAt: -1 });
    return successResponse(res, 200, trends);
  } catch (error) {
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to list trends.');
  }
};

module.exports = {
  fetchTrends,
  listTrends
};
