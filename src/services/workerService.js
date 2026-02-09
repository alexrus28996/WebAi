const Trend = require('../models/Trend');
const DraftPost = require('../models/DraftPost');
const PostingRules = require('../models/PostingRules');
const { generateDraft } = require('./aiService');
const { fetchTrendsForWorkspace } = require('./trendService');

const resolvePreferredTime = (preferredTime) => {
  const parsed = new Date(preferredTime);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  if (typeof preferredTime === 'string') {
    const [hourPart, minutePart] = preferredTime.split(':');
    const hour = Number.parseInt(hourPart, 10);
    const minute = Number.parseInt(minutePart, 10);
    if (Number.isInteger(hour) && Number.isInteger(minute)) {
      const now = new Date();
      const scheduled = new Date(now);
      scheduled.setHours(hour, minute, 0, 0);
      if (scheduled < now) {
        scheduled.setDate(scheduled.getDate() + 1);
      }
      return scheduled;
    }
  }

  return new Date();
};

const runMockWorker = async () => {
  const rules = await PostingRules.find({ autoGenerate: true });
  if (!rules.length) {
    return { message: 'No workspaces configured for auto generation.', results: [] };
  }

  const workspaceRules = new Map();
  rules.forEach((rule) => {
    const key = rule.workspace.toString();
    if (!workspaceRules.has(key)) {
      workspaceRules.set(key, rule);
    }
  });

  const results = [];

  for (const rule of workspaceRules.values()) {
    const newTrendCount = await Trend.countDocuments({
      workspaceId: rule.workspace,
      status: 'new'
    });

    if (newTrendCount < 5) {
      await fetchTrendsForWorkspace(rule.workspace);
    }

    const usedTrendIds = await DraftPost.distinct('trend', { workspace: rule.workspace });
    const trend = await Trend.findOne({
      workspaceId: rule.workspace,
      status: 'new',
      _id: { $nin: usedTrendIds }
    }).sort({ publishedAt: -1 });

    if (!trend) {
      results.push({
        workspaceId: rule.workspace,
        message: 'No unused trends available.'
      });
      continue;
    }

    const recentDrafts = await DraftPost.find({ workspace: rule.workspace })
      .populate('trend', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    const avoidTopics = recentDrafts.map((draft) => draft?.trend?.title).filter(Boolean);
    const avoidPhrases = recentDrafts
      .map((draft) => (draft.content ? draft.content.split('\n')[0] : null))
      .filter(Boolean);

    const draftData = await generateDraft({
      trend,
      rules: rule,
      avoidTopics,
      avoidPhrases
    });
    const draft = await DraftPost.create({
      workspace: rule.workspace,
      user: rule.user,
      trend: trend._id,
      angle: draftData.angle,
      content: draftData.content,
      aiMeta: draftData.aiMeta,
      status: 'draft'
    });

    draft.status = 'scheduled';
    draft.scheduledTime = resolvePreferredTime(rule.preferredTime);
    await draft.save();

    results.push({
      workspaceId: rule.workspace,
      draft
    });
  }

  return {
    message: 'Worker run complete.',
    results
  };
};

module.exports = {
  runMockWorker
};
