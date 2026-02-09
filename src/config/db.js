const mongoose = require('mongoose');
const env = require('./env');

const connectDb = async () => {
  try {
    await mongoose.connect(env.mongoUri, {
      autoIndex: env.nodeEnv !== 'production'
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDb;
