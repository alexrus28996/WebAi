const { runMockWorker } = require('../services/workerService');

const runWorker = async (req, res) => {
  try {
    const result = await runMockWorker();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Worker failed.', error: error.message });
  }
};

module.exports = {
  runWorker
};
