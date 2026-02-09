const DraftPost = require('../models/DraftPost');

const scheduleDraft = async (req, res) => {
  try {
    const { draftId, scheduledTime } = req.body;
    if (!draftId || !scheduledTime) {
      return res.status(400).json({ message: 'draftId and scheduledTime are required.' });
    }

    const draft = await DraftPost.findOne({ _id: draftId, workspace: req.user.workspaceId });
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found.' });
    }

    if (draft.status !== 'draft') {
      return res.status(400).json({ message: 'Draft already scheduled.' });
    }

    const scheduledDate = new Date(scheduledTime);
    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ message: 'scheduledTime must be a valid ISO string.' });
    }

    draft.status = 'scheduled';
    draft.scheduledTime = scheduledDate;
    await draft.save();

    return res.status(200).json({ message: 'Draft scheduled.', draft });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to schedule draft.', error: error.message });
  }
};

module.exports = {
  scheduleDraft
};
