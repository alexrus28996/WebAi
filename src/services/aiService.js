const buildMockPost = ({ title, description, angle }) =>
  [
    `Hook: ${title}`,
    '',
    `Angle: ${angle}`,
    '',
    description,
    '',
    '3 takeaways:',
    '1) Focus on measurable outcomes.',
    '2) Keep the human element in every workflow.',
    '3) Share learnings transparently.',
    '',
    '#leadership #saas #productivity'
  ].join('\n');

const generateDraft = async ({ trend, angle }) => {
  const safeAngle = angle || 'A practical, actionable perspective for busy teams.';
  const content = buildMockPost({ title: trend.title, description: trend.description, angle: safeAngle });

  return {
    angle: safeAngle,
    content,
    status: 'draft'
  };
};

module.exports = {
  generateDraft
};
