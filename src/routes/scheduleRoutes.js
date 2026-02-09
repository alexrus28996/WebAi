const express = require('express');
const { scheduleDraft } = require('../controllers/scheduleController');

const router = express.Router();

router.post('/', scheduleDraft);

module.exports = router;
