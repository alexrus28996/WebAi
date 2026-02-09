const OpenAI = require('openai');
const BaseProvider = require('./baseProvider');

const PRIMARY_MODEL = 'gpt-4.1-mini';
const FALLBACK_MODEL = 'gpt-4o-mini';

const resolveOpenAIModel = () => process.env.OPENAI_MODEL || PRIMARY_MODEL;

const isModelNotFoundError = (error) => {
  const code = error?.code || error?.error?.code;
  if (code === 'model_not_found') {
    return true;
  }
  const message = (error?.message || '').toLowerCase();
  return message.includes('model') && message.includes('not found');
};

const buildSystemPrompt = () =>
  [
    'You are an assistant that writes LinkedIn posts for professionals.',
    'Output must be plain text only (no markdown fences, no JSON).',
    'Do not invent statistics, quotes, or facts not provided.',
    'Reference freshness using the provided published date.',
    'Follow the provided angle, audience, and tone strictly.',
    'Avoid repeating phrases from the avoid list.'
  ].join(' ');

const buildUserPrompt = ({
  trendTitle,
  trendSource,
  publishedAt,
  niche,
  audience,
  tone,
  angle,
  avoidTopics,
  avoidPhrases
}) => {
  const avoidTopicsLine = avoidTopics?.length
    ? `Avoid these recent topics: ${avoidTopics.join('; ')}.`
    : 'No avoid-topic list was provided.';
  const avoidPhrasesLine = avoidPhrases?.length
    ? `Avoid these phrases: ${avoidPhrases.join('; ')}.`
    : 'No avoid-phrase list was provided.';

  return [
    `Trend title: ${trendTitle}`,
    `Trend source: ${trendSource}`,
    `Published at: ${publishedAt}`,
    `Niche: ${niche}`,
    `Audience: ${audience}`,
    `Tone: ${tone}`,
    `Angle: ${angle}`,
    avoidTopicsLine,
    avoidPhrasesLine,
    'Write a LinkedIn post with a strong hook, short paragraphs, and a clear call-to-action.',
    'Keep it concise and ready to paste into LinkedIn.'
  ].join('\n');
};

class OpenAIProvider extends BaseProvider {
  async generateLinkedInPost(payload) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required for OpenAI provider.');
    }

    const client = new OpenAI({ apiKey });
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(payload);

    const createCompletion = async (model) =>
      client.chat.completions.create({
        model,
        temperature: 0.2,
        max_tokens: 400,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      });

    let model = resolveOpenAIModel();
    let completion;

    try {
      completion = await createCompletion(model);
    } catch (error) {
      if (!process.env.OPENAI_MODEL && model !== FALLBACK_MODEL && isModelNotFoundError(error)) {
        model = FALLBACK_MODEL;
        completion = await createCompletion(model);
      } else {
        throw error;
      }
    }

    const text = completion?.choices?.[0]?.message?.content?.trim();

    if (!text) {
      throw new Error('OpenAI response was empty.');
    }

    return {
      text,
      meta: {
        provider: 'openai',
        model,
        tokensUsed: completion?.usage?.total_tokens
      }
    };
  }
}

module.exports = { openAIProvider: new OpenAIProvider(), resolveOpenAIModel, FALLBACK_MODEL };
