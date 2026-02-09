const DraftPost = require('../models/DraftPost');
const PostingRules = require('../models/PostingRules');
const Trend = require('../models/Trend');
const { generateDraft } = require('../services/aiService');
const { successResponse, errorResponse } = require('../utils/response');
const { logAuditEvent } = require('../services/auditService');
const logger = require('../utils/logger');

const generateDraftHandler = async (req, res) => {
  try {
    const { trendId, angle } = req.body;
    logger.info({
      requestId: req.requestId,
      action: 'DRAFT_GENERATE_START',
      workspaceId: req.workspaceId,
      userId: req.user.userId,
      trendId
    });
    const trend = await Trend.findOne({ _id: trendId, workspaceId: req.workspaceId });
    if (!trend) {
      return errorResponse(res, 404, 'INVALID_STATE', 'Trend not found.');
    }

    const rules = await PostingRules.findOne({ workspace: req.workspaceId }).sort({ createdAt: -1 });
    const recentDrafts = await DraftPost.find({ workspace: req.workspaceId })
      .populate('trend', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    const avoidTopics = recentDrafts.map((draft) => draft?.trend?.title).filter(Boolean);
    const avoidPhrases = recentDrafts
      .map((draft) => (draft.content ? draft.content.split('\n')[0] : null))
      .filter(Boolean);

    const draftData = await generateDraft({
      trend,
      angle,
      rules,
      avoidTopics,
      avoidPhrases,
      requestId: req.requestId
    });

    const draft = await DraftPost.create({
      workspace: req.workspaceId,
      user: req.user.userId,
      trend: trend._id,
      angle: draftData.angle,
      content: draftData.content,
      aiMeta: draftData.aiMeta,
      status: draftData.status
    });

    await Trend.updateOne(
      { _id: trend._id, workspaceId: req.workspaceId },
      { $set: { status: 'used' } }
    );

    await logAuditEvent({
      workspaceId: req.workspaceId,
      userId: req.user.userId,
      action: 'DRAFT_GENERATED',
      resourceType: 'DraftPost',
      resourceId: draft._id.toString(),
      meta: { trendId: trend._id.toString() }
    });
    logger.info({
      requestId: req.requestId,
      action: 'DRAFT_GENERATE_END',
      workspaceId: req.workspaceId,
      userId: req.user.userId,
      draftId: draft._id.toString()
    });

    return successResponse(res, 201, draft);
  } catch (error) {
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to generate draft.');
  }
};

const listDrafts = async (req, res) => {
  try {
    const drafts = await DraftPost.find({ workspace: req.workspaceId }).sort({ createdAt: -1 });
    return successResponse(res, 200, drafts);
  } catch (error) {
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to list drafts.');
  }
};

module.exports = {
  generateDraftHandler,
  listDrafts
};
