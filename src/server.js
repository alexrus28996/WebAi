const mongoose = require('mongoose');
const app = require('./app');
const connectDb = require('./config/db');
const env = require('./config/env');
const logger = require('./utils/logger');

let server;
let shuttingDown = false;

const startServer = async () => {
  await connectDb();
  server = app.listen(env.port, () => {
    logger.info({ message: `Server running on port ${env.port}.` });
  });
};

const shutdown = async (signal) => {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  logger.info({ message: 'Shutdown initiated.', signal });

  if (server) {
    logger.info({ message: 'Stopping HTTP server.' });
    await new Promise((resolve) => server.close(resolve));
  }

  if (mongoose.connection.readyState !== 0) {
    logger.info({ message: 'Closing MongoDB connection.' });
    await mongoose.connection.close(false);
  }

  logger.info({ message: 'Shutdown complete.' });
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
