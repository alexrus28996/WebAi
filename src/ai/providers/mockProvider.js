const BaseProvider = require('./baseProvider');

const formatPublishedAt = (publishedAt) => {
  if (!publishedAt) {
    return 'recently';
  }
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) {
    return 'recently';
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const buildMockPost = ({ trendTitle, trendSource, publishedAt, niche, audience, tone, angle }) => {
  const formattedDate = formatPublishedAt(publishedAt);
  const safeSource = trendSource || 'industry chatter';

  return [
    `Hook: ${trendTitle}`,
    '',
    `Angle: ${angle}`,
    '',
    `Context: ${trendTitle} from ${safeSource} (${formattedDate}).`,
    `Audience: ${audience}.`,
    `Tone: ${tone}.`,
    `Niche: ${niche}.`,
    '',
    '3 takeaways:',
    '1) Focus on measurable outcomes.',
    '2) Keep the human element in every workflow.',
    '3) Share learnings transparently.',
    '',
    '#leadership #saas #productivity'
  ].join('\n');
};

class MockProvider extends BaseProvider {
  async generateLinkedInPost({
    trendTitle,
    trendSource,
    publishedAt,
    niche,
    audience,
    tone,
    angle
  }) {
    const content = buildMockPost({
      trendTitle,
      trendSource,
      publishedAt,
      niche,
      audience,
      tone,
      angle
    });

    return {
      text: content,
      meta: {
        provider: 'mock'
      }
    };
  }
}

module.exports = new MockProvider();
