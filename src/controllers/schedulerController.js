const { successResponse } = require('../utils/response');
const { providerName } = require('../scheduler');

const getProvider = async (req, res) => {
  return successResponse(res, 200, { provider: providerName });
};

module.exports = {
  getProvider
};
