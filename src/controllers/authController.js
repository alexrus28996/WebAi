const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const env = require('../config/env');

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
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    const user = await User.create({ name, email, password });
    const workspace = await Workspace.create({
      name: workspaceName || `${name}'s Workspace`,
      owner: user._id
    });

    const token = createToken(user, workspace._id);

    return res.status(201).json({
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
    return res.status(500).json({ message: 'Unable to create account.', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const workspace = await Workspace.findOne({ owner: user._id });
    const token = createToken(user, workspace ? workspace._id : null);

    return res.status(200).json({
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
    return res.status(500).json({ message: 'Unable to login.', error: error.message });
  }
};

module.exports = {
  signup,
  login
};
