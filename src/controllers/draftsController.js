const DraftPost = require('../models/DraftPost');
const Trend = require('../models/Trend');
const { generateDraft } = require('../services/aiService');

const generateDraftHandler = async (req, res) => {
  try {
    const { trendId, angle } = req.body;
    if (!trendId || !angle) {
      return res.status(400).json({ message: 'trendId and angle are required.' });
    }

    const trend = await Trend.findOne({ _id: trendId, workspace: req.user.workspaceId });
    if (!trend) {
      return res.status(404).json({ message: 'Trend not found.' });
    }

    const draftData = await generateDraft({ trend, angle });

    const draft = await DraftPost.create({
      workspace: req.user.workspaceId,
      user: req.user.userId,
      trend: trend._id,
      angle: draftData.angle,
      content: draftData.content,
      status: draftData.status
    });

    return res.status(201).json(draft);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to generate draft.', error: error.message });
  }
};

const listDrafts = async (req, res) => {
  try {
    const drafts = await DraftPost.find({ workspace: req.user.workspaceId }).sort({ createdAt: -1 });
    return res.status(200).json(drafts);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to list drafts.', error: error.message });
  }
};

module.exports = {
  generateDraftHandler,
  listDrafts
};
