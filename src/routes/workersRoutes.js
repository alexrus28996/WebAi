const express = require('express');
const { runWorker } = require('../controllers/workersController');

const router = express.Router();

router.post('/run', runWorker);

module.exports = router;
