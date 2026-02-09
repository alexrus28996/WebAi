const express = require('express');
const { runWorker } = require('../controllers/workersController');
const { rateLimitGeneration } = require('../middlewares/rateLimiters');
const requireWorkspaceAccess = require('../middlewares/requireWorkspaceAccess');

const router = express.Router();

router.post('/run', requireWorkspaceAccess, rateLimitGeneration, runWorker);

module.exports = router;
