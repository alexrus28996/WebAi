const express = require('express');
const cors = require('cors');

const authMiddleware = require('./utils/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const rulesRoutes = require('./routes/rulesRoutes');
const trendsRoutes = require('./routes/trendsRoutes');
const draftsRoutes = require('./routes/draftsRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const workersRoutes = require('./routes/workersRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);

app.use(authMiddleware);
app.use('/rules', rulesRoutes);
app.use('/trends', trendsRoutes);
app.use('/drafts', draftsRoutes);
app.use('/schedule', scheduleRoutes);
app.use('/workers', workersRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

module.exports = app;
