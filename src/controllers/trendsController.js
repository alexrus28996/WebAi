const Trend = require('../models/Trend');
const { fetchMockTrends } = require('../services/trendService');

const fetchTrends = async (req, res) => {
  try {
    const created = await fetchMockTrends(req.user.workspaceId);
    return res.status(201).json({ message: 'Mock trends stored.', trends: created });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch trends.', error: error.message });
  }
};

const listTrends = async (req, res) => {
  try {
    const trends = await Trend.find({ workspace: req.user.workspaceId }).sort({ createdAt: -1 });
    return res.status(200).json(trends);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to list trends.', error: error.message });
  }
};

module.exports = {
  fetchTrends,
  listTrends
};
