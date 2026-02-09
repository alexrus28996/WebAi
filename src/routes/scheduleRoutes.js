const express = require('express');
const { scheduleDraft } = require('../controllers/scheduleController');
const { validateScheduleDraft } = require('../middlewares/validateRequest');

const router = express.Router();

router.post('/', validateScheduleDraft, scheduleDraft);

module.exports = router;
