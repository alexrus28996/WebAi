const mongoose = require('mongoose');
const TrendSource = require('../models/TrendSource');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

const listTrendSources = async (req, res) => {
  try {
    const sources = await TrendSource.find({ workspaceId: req.workspaceId }).sort({ createdAt: -1 });
    return successResponse(res, 200, sources);
  } catch (error) {
    logger.error({
      requestId: req.requestId,
      action: 'TREND_SOURCE_LIST_FAILED',
      message: error.message
    });
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to list trend sources.');
  }
};

const createTrendSource = async (req, res) => {
  try {
    const { name, url, freshnessHours, enabled } = req.validatedBody;
    const source = await TrendSource.create({
      workspaceId: req.workspaceId,
      name,
      url,
      freshnessHours,
      enabled
    });
    logger.info({
      requestId: req.requestId,
      action: 'TREND_SOURCE_CREATED',
      workspaceId: req.workspaceId,
      sourceId: source._id.toString()
    });
    return successResponse(res, 201, source);
  } catch (error) {
    logger.error({
      requestId: req.requestId,
      action: 'TREND_SOURCE_CREATE_FAILED',
      message: error.message
    });
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to create trend source.');
  }
};

const updateTrendSource = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'VALIDATION_ERROR', 'Invalid trend source id.');
    }

    const source = await TrendSource.findOne({ _id: id, workspaceId: req.workspaceId });
    if (!source) {
      return errorResponse(res, 403, 'FORBIDDEN', 'Trend source access denied.');
    }

    const updates = {};
    const { name, url, freshnessHours, enabled } = req.validatedBody;
    if (name !== undefined) {
      updates.name = name;
    }
    if (url !== undefined) {
      updates.url = url;
    }
    if (freshnessHours !== undefined) {
      updates.freshnessHours = freshnessHours;
    }
    if (enabled !== undefined) {
      updates.enabled = enabled;
    }

    Object.assign(source, updates);
    await source.save();

    logger.info({
      requestId: req.requestId,
      action: 'TREND_SOURCE_UPDATED',
      workspaceId: req.workspaceId,
      sourceId: source._id.toString()
    });
    return successResponse(res, 200, source);
  } catch (error) {
    logger.error({
      requestId: req.requestId,
      action: 'TREND_SOURCE_UPDATE_FAILED',
      message: error.message
    });
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to update trend source.');
  }
};

const deleteTrendSource = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'VALIDATION_ERROR', 'Invalid trend source id.');
    }

    const source = await TrendSource.findOne({ _id: id, workspaceId: req.workspaceId });
    if (!source) {
      return errorResponse(res, 403, 'FORBIDDEN', 'Trend source access denied.');
    }

    await source.deleteOne();

    logger.info({
      requestId: req.requestId,
      action: 'TREND_SOURCE_DELETED',
      workspaceId: req.workspaceId,
      sourceId: source._id.toString()
    });
    return successResponse(res, 200, { message: 'Trend source deleted.' });
  } catch (error) {
    logger.error({
      requestId: req.requestId,
      action: 'TREND_SOURCE_DELETE_FAILED',
      message: error.message
    });
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to delete trend source.');
  }
};

module.exports = {
  listTrendSources,
  createTrendSource,
  updateTrendSource,
  deleteTrendSource
};
