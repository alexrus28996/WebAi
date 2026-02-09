const DraftPost = require('../models/DraftPost');
const { successResponse, errorResponse } = require('../utils/response');

const scheduleDraft = async (req, res) => {
  try {
    const { draftId } = req.body;
    const draft = await DraftPost.findOne({ _id: draftId, workspace: req.user.workspaceId });
    if (!draft) {
      return errorResponse(res, 404, 'INVALID_STATE', 'Draft not found.');
    }

    if (draft.status === 'scheduled') {
      return errorResponse(res, 409, 'CONFLICT', 'Draft already scheduled.');
    }

    if (draft.status === 'posted') {
      return errorResponse(res, 400, 'INVALID_STATE', 'Draft already posted.');
    }

    if (draft.status !== 'draft') {
      return errorResponse(res, 400, 'INVALID_STATE', 'Draft status cannot be scheduled.');
    }

    draft.status = 'scheduled';
    draft.scheduledTime = req.validatedScheduledTime;
    await draft.save();

    return successResponse(res, 200, { message: 'Draft scheduled.', draft });
  } catch (error) {
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to schedule draft.');
  }
};

module.exports = {
  scheduleDraft
};
