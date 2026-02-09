const Trend = require('../models/Trend');
const DraftPost = require('../models/DraftPost');
const { generateDraft } = require('./aiService');

const runMockWorker = async ({ workspaceId, userId }) => {
  const trend = await Trend.findOne({ workspace: workspaceId }).sort({ createdAt: -1 });
  if (!trend) {
    return { message: 'No trends available to process.' };
  }

  const draftData = await generateDraft({ trend });
  const draft = await DraftPost.create({
    workspace: workspaceId,
    user: userId,
    trend: trend._id,
    angle: draftData.angle,
    text: draftData.text,
    status: 'draft'
  });

  draft.status = 'scheduled';
  draft.scheduledFor = new Date(Date.now() + 60 * 60 * 1000);
  await draft.save();

  return {
    message: 'Worker generated and scheduled a draft.',
    draft
  };
};

module.exports = {
  runMockWorker
};
