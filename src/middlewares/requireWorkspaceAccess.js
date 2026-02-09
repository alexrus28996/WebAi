const mongoose = require('mongoose');
const Workspace = require('../models/Workspace');
const { errorResponse } = require('../utils/response');

const requireWorkspaceAccess = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return errorResponse(res, 401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const headerWorkspaceId = req.headers['x-workspace-id'];
    let workspace = null;

    if (headerWorkspaceId) {
      if (!mongoose.Types.ObjectId.isValid(headerWorkspaceId)) {
        return errorResponse(res, 403, 'FORBIDDEN', 'Workspace not found.');
      }
      workspace = await Workspace.findOne({
        _id: headerWorkspaceId,
        owner: req.user.userId
      });
      if (!workspace) {
        return errorResponse(res, 403, 'FORBIDDEN', 'Workspace access denied.');
      }
    } else {
      workspace = await Workspace.findOne({ owner: req.user.userId }).sort({ createdAt: 1 });
      if (!workspace) {
        return errorResponse(res, 403, 'FORBIDDEN', 'Workspace not found.');
      }
    }

    req.workspaceId = workspace._id;
    return next();
  } catch (error) {
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to resolve workspace.');
  }
};

module.exports = requireWorkspaceAccess;
