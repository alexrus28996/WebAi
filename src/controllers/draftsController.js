const DraftPost = require('../models/DraftPost');
const Trend = require('../models/Trend');
const { generateDraft } = require('../services/aiService');
const { successResponse, errorResponse } = require('../utils/response');

const generateDraftHandler = async (req, res) => {
  try {
    const { trendId, angle } = req.body;
    const trend = await Trend.findOne({ _id: trendId, workspace: req.user.workspaceId });
    if (!trend) {
      return errorResponse(res, 404, 'INVALID_STATE', 'Trend not found.');
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

    return successResponse(res, 201, draft);
  } catch (error) {
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to generate draft.');
  }
};

const listDrafts = async (req, res) => {
  try {
    const drafts = await DraftPost.find({ workspace: req.user.workspaceId }).sort({ createdAt: -1 });
    return successResponse(res, 200, drafts);
  } catch (error) {
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to list drafts.');
  }
};

module.exports = {
  generateDraftHandler,
  listDrafts
};
