const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authMiddleware = require('./utils/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const rulesRoutes = require('./routes/rulesRoutes');
const trendsRoutes = require('./routes/trendsRoutes');
const draftsRoutes = require('./routes/draftsRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const schedulerRoutes = require('./routes/schedulerRoutes');
const workersRoutes = require('./routes/workersRoutes');
const publisherRoutes = require('./routes/publisherRoutes');
const aiRoutes = require('./routes/aiRoutes');
const trendSourcesRoutes = require('./routes/trendSourcesRoutes');
const { successResponse, errorResponse } = require('./utils/response');
const requestContext = require('./middlewares/requestContext');
const logger = require('./utils/logger');
const env = require('./config/env');
const { version } = require('../package.json');

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestContext);

app.get('/health', (req, res) => {
  successResponse(res, 200, {
    status: 'ok',
    version,
    uptime: process.uptime()
  });
});

app.get('/ready', (req, res) => {
  const isMongoReady = mongoose.connection.readyState === 1;
  const isAiReady = env.aiProvider !== 'openai' || Boolean(env.openaiApiKey);
  const isReady = isMongoReady && isAiReady;

  if (!isReady) {
    return errorResponse(res, 503, 'NOT_READY', 'Service not ready.');
  }

  return successResponse(res, 200, {
    status: 'ready',
    checks: {
      mongo: isMongoReady,
      aiProvider: env.aiProvider
    }
  });
});

app.use('/auth', authRoutes);

app.use(authMiddleware);
app.use('/rules', rulesRoutes);
app.use('/trends', trendsRoutes);
app.use('/trend-sources', trendSourcesRoutes);
app.use('/drafts', draftsRoutes);
app.use('/schedule', scheduleRoutes);
app.use('/scheduler', schedulerRoutes);
app.use('/workers', workersRoutes);
app.use('/publisher', publisherRoutes);
app.use('/ai', aiRoutes);

app.use((req, res) => {
  errorResponse(res, 404, 'INVALID_STATE', 'Route not found.');
});

app.use((err, req, res, next) => {
  logger.error({
    requestId: req.requestId,
    message: err.message,
    path: req.originalUrl || req.url
  });
  errorResponse(res, 500, 'INTERNAL_ERROR', 'Something went wrong');
});

module.exports = app;
