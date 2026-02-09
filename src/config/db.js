const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

const connectDb = async () => {
  try {
    await mongoose.connect(env.mongoUri, {
      autoIndex: env.nodeEnv !== 'production'
    });
    logger.info({ message: 'MongoDB connected.' });
  } catch (error) {
    logger.error({
      message: 'MongoDB connection error.',
      error: error.message
    });
    process.exit(1);
  }
};

module.exports = connectDb;
