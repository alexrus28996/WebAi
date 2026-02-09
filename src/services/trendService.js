const Trend = require('../models/Trend');

const mockTrends = () => [
  {
    title: 'AI-driven productivity for remote teams',
    description: 'How AI tools are reshaping daily workflows for distributed organizations.',
    score: 86
  },
  {
    title: 'Human-centered leadership in tech',
    description: 'Balancing innovation with empathy to improve retention and performance.',
    score: 74
  },
  {
    title: 'Data storytelling in SaaS marketing',
    description: 'Turning customer metrics into narratives that drive pipeline growth.',
    score: 68
  }
];

const fetchMockTrends = async (workspaceId) => {
  const trends = mockTrends().map((trend) => ({
    ...trend,
    workspace: workspaceId,
    source: 'mock-trends'
  }));

  return Trend.insertMany(trends);
};

module.exports = {
  fetchMockTrends
};
