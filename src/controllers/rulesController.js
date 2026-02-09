const PostingRules = require('../models/PostingRules');

const createRule = async (req, res) => {
  try {
    const { niche, audience, tone, frequency, preferredTime, autoGenerate } = req.body;
    if (!niche || !audience || !tone || !frequency || !preferredTime || typeof autoGenerate !== 'boolean') {
      return res.status(400).json({ message: 'All rule fields are required.' });
    }

    const rule = await PostingRules.create({
      workspace: req.user.workspaceId,
      user: req.user.userId,
      niche,
      audience,
      tone,
      frequency,
      preferredTime,
      autoGenerate
    });

    return res.status(201).json(rule);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create rule.', error: error.message });
  }
};

const getRules = async (req, res) => {
  try {
    const rules = await PostingRules.find({ workspace: req.user.workspaceId }).sort({ createdAt: -1 });
    return res.status(200).json(rules);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch rules.', error: error.message });
  }
};

module.exports = {
  createRule,
  getRules
};
