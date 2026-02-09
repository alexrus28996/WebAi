const DraftPost = require('../models/DraftPost');

const scheduleDraft = async (req, res) => {
  try {
    const { draftId, scheduledFor } = req.body;
    if (!draftId || !scheduledFor) {
      return res.status(400).json({ message: 'draftId and scheduledFor are required.' });
    }

    const draft = await DraftPost.findOne({ _id: draftId, workspace: req.user.workspaceId });
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found.' });
    }

    draft.status = 'scheduled';
    draft.scheduledFor = new Date(scheduledFor);
    await draft.save();

    return res.status(200).json({ message: 'Draft scheduled.', draft });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to schedule draft.', error: error.message });
  }
};

module.exports = {
  scheduleDraft
};
