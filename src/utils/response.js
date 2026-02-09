const successResponse = (res, status, data) => {
  return res.status(status).json({ success: true, data });
};

const errorResponse = (res, status, code, message) => {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message
    }
  });
};

module.exports = {
  successResponse,
  errorResponse
};
