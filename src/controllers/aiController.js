const { getProviderInfo } = require('../services/aiService');
const { successResponse, errorResponse } = require('../utils/response');

const getProviderInfoHandler = (req, res) => {
  try {
    const info = getProviderInfo();
    return successResponse(res, 200, {
      provider: info.provider,
      model: info.model,
      fallbackEnabled: info.fallbackEnabled
    });
  } catch (error) {
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to fetch provider info.');
  }
};

module.exports = {
  getProviderInfoHandler
};
