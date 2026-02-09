const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const env = require('../config/env');
const { successResponse, errorResponse } = require('../utils/response');

const createToken = (user, workspaceId) => {
  return jwt.sign(
    { userId: user._id, workspaceId },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
};

const signup = async (req, res) => {
  try {
    const { name, email, password, workspaceName } = req.body;
    if (!name || !email || !password) {
      return errorResponse(res, 400, 'VALIDATION_ERROR', 'Name, email, and password are required.');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 409, 'CONFLICT', 'User already exists.');
    }

    const user = await User.create({ name, email, password });
    const workspace = await Workspace.create({
      name: workspaceName || `${name}'s Workspace`,
      owner: user._id
    });

    const token = createToken(user, workspace._id);

    return successResponse(res, 201, {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      workspace: {
        id: workspace._id,
        name: workspace.name
      }
    });
  } catch (error) {
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to create account.');
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, 400, 'VALIDATION_ERROR', 'Email and password are required.');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return errorResponse(res, 401, 'VALIDATION_ERROR', 'Invalid credentials.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'VALIDATION_ERROR', 'Invalid credentials.');
    }

    const workspace = await Workspace.findOne({ owner: user._id });
    const token = createToken(user, workspace ? workspace._id : null);

    return successResponse(res, 200, {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      workspace: workspace
        ? { id: workspace._id, name: workspace.name }
        : null
    });
  } catch (error) {
    return errorResponse(res, 500, 'INVALID_STATE', 'Unable to login.');
  }
};

module.exports = {
  signup,
  login
};
