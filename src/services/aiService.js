const logger = require('../utils/logger');
const mockProvider = require('../ai/providers/mockProvider');
const { openAIProvider, resolveOpenAIModel, FALLBACK_MODEL } = require('../ai/providers/openaiProvider');

const DEFAULT_ANGLE = 'A practical, actionable perspective for busy teams.';

const normalizeProvider = (value) => {
  if (!value) {
    return 'mock';
  }
  const normalized = value.toLowerCase();
  return normalized === 'openai' ? 'openai' : 'mock';
};

const buildRequestPayload = ({ trend, rules, angle, avoidTopics, avoidPhrases }) => ({
  trendTitle: trend.title,
  trendSource: trend.source,
  publishedAt: trend.publishedAt,
  niche: rules?.niche || 'General',
  audience: rules?.audience || 'Professionals',
  tone: rules?.tone || 'Professional',
  angle,
  avoidTopics,
  avoidPhrases
});

const resolveProvider = (providerName) => (providerName === 'openai' ? openAIProvider : mockProvider);

const generateDraft = async ({ trend, angle, rules, avoidTopics = [], avoidPhrases = [], requestId }) => {
  const safeAngle = angle || DEFAULT_ANGLE;
  const providerName = normalizeProvider(process.env.AI_PROVIDER);
  const provider = resolveProvider(providerName);
  const payload = buildRequestPayload({ trend, rules, angle: safeAngle, avoidTopics, avoidPhrases });

  let result;

  try {
    result = await provider.generateLinkedInPost(payload);
  } catch (error) {
    logger.error({
      requestId,
      action: 'AI_PROVIDER_FAILURE',
      provider: providerName,
      message: error.message
    });
    result = await mockProvider.generateLinkedInPost(payload);
  }

  return {
    angle: safeAngle,
    content: result.text,
    status: 'draft',
    aiMeta: result.meta
  };
};

const getProviderInfo = () => {
  const provider = normalizeProvider(process.env.AI_PROVIDER);
  if (provider === 'openai') {
    const model = resolveOpenAIModel();
    return { provider, model, fallbackEnabled: true, fallbackModel: FALLBACK_MODEL };
  }
  return { provider, model: null, fallbackEnabled: true, fallbackModel: null };
};

module.exports = {
  generateDraft,
  getProviderInfo
};
