const DraftPost = require('../models/DraftPost');
const { generateDraft } = require('./aiService');
const { findMaxSimilarityScore } = require('../utils/similarity');
const logger = require('../utils/logger');

const ANGLE_POOL = [
  'Founder impact',
  'Actionable checklist',
  'Common mistakes',
  'Contrarian take',
  'Simple explanation',
  'Technical breakdown'
];

const MAX_ATTEMPTS = 3;
const SIMILARITY_THRESHOLD = 0.7;
const RECENT_DRAFT_LIMIT = 20;

const formatGenerationDate = (date = new Date()) => date.toISOString().slice(0, 10);

const selectAngleForTrend = async ({ workspaceId, trendId, preferredAngle, requestId }) => {
  const generationDate = formatGenerationDate();
  const todaysDrafts = await DraftPost.find({
    workspace: workspaceId,
    trend: trendId,
    'meta.generationDate': generationDate
  }).select('angle meta.angleUsed');

  const usedAngles = new Set(
    todaysDrafts
      .map((draft) => draft?.meta?.angleUsed || draft?.angle)
      .filter(Boolean)
  );

  const normalizedPreferred = ANGLE_POOL.includes(preferredAngle) ? preferredAngle : null;
  const availableAngles = ANGLE_POOL.filter((angle) => !usedAngles.has(angle));

  let angleUsed = null;
  let angleReused = false;

  if (normalizedPreferred && availableAngles.includes(normalizedPreferred)) {
    angleUsed = normalizedPreferred;
  } else if (availableAngles.length) {
    angleUsed = availableAngles[Math.floor(Math.random() * availableAngles.length)];
  } else {
    angleUsed = normalizedPreferred || ANGLE_POOL[Math.floor(Math.random() * ANGLE_POOL.length)];
    angleReused = true;
  }

  logger.info({
    requestId,
    action: 'ANGLE_SELECTED',
    workspaceId,
    trendId,
    angleUsed,
    angleReused,
    generationDate
  });

  return {
    angleUsed,
    angleReused,
    generationDate
  };
};

const buildAvoidPhrases = (drafts) =>
  drafts
    .map((draft) => (draft.content ? draft.content.split('\n')[0] : null))
    .filter(Boolean);

const generateUniqueDraft = async ({
  trend,
  rules,
  workspaceId,
  preferredAngle,
  requestId
}) => {
  const recentDrafts = await DraftPost.find({ workspace: workspaceId })
    .populate('trend', 'title')
    .sort({ createdAt: -1 })
    .limit(RECENT_DRAFT_LIMIT);

  const avoidTopics = recentDrafts.map((draft) => draft?.trend?.title).filter(Boolean);
  let avoidPhrases = buildAvoidPhrases(recentDrafts);

  let attempt = 0;
  let draftData = null;
  let similarityScore = 0;
  let angleMeta = null;

  while (attempt < MAX_ATTEMPTS) {
    attempt += 1;
    angleMeta = await selectAngleForTrend({
      workspaceId,
      trendId: trend._id,
      preferredAngle,
      requestId
    });

    draftData = await generateDraft({
      trend,
      angle: angleMeta.angleUsed,
      rules,
      avoidTopics,
      avoidPhrases,
      requestId
    });

    similarityScore = findMaxSimilarityScore(draftData.content, recentDrafts);

    if (similarityScore <= SIMILARITY_THRESHOLD) {
      break;
    }

    const firstLine = draftData.content ? draftData.content.split('\n')[0] : null;
    if (firstLine) {
      avoidPhrases = [...avoidPhrases, firstLine];
    }
  }

  const forceAccepted = similarityScore > SIMILARITY_THRESHOLD;

  return {
    draftData,
    similarityScore,
    generationAttempts: attempt,
    angleMeta,
    forceAccepted,
    recentDrafts
  };
};

module.exports = {
  ANGLE_POOL,
  selectAngleForTrend,
  generateUniqueDraft
};
