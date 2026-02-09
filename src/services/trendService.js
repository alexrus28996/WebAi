const Trend = require('../models/Trend');

const mockTrends = () => {
  const now = Date.now();
  return [
    {
      title: 'AI-driven productivity for remote teams',
      description: 'How AI tools are reshaping daily workflows for distributed organizations.',
      score: 86,
      publishedAt: new Date(now - 1000 * 60 * 60 * 6)
    },
    {
      title: 'Human-centered leadership in tech',
      description: 'Balancing innovation with empathy to improve retention and performance.',
      score: 74,
      publishedAt: new Date(now - 1000 * 60 * 60 * 12)
    },
    {
      title: 'Data storytelling in SaaS marketing',
      description: 'Turning customer metrics into narratives that drive pipeline growth.',
      score: 68,
      publishedAt: new Date(now - 1000 * 60 * 60 * 24)
    },
    {
      title: 'AI copilots for customer success teams',
      description: 'How copilots reduce response times and improve renewal conversations.',
      score: 62,
      publishedAt: new Date(now - 1000 * 60 * 60 * 30)
    }
  ];
};

const fetchMockTrends = async (workspaceId) => {
  const trends = mockTrends().map((trend) => ({
    ...trend,
    workspace: workspaceId,
    source: 'mock-trends',
    status: 'new'
  }));

  return Trend.insertMany(trends);
};

module.exports = {
  fetchMockTrends
};
