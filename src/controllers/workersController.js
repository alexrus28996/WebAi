const { runMockWorker } = require('../services/workerService');

const runWorker = async (req, res) => {
  try {
    const result = await runMockWorker({
      workspaceId: req.user.workspaceId,
      userId: req.user.userId
    });

    if (result.draft) {
      return res.status(201).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Worker failed.', error: error.message });
  }
};

module.exports = {
  runWorker
};
