const express = require('express');
const { scheduleDraft } = require('../controllers/scheduleController');
const { validateScheduleDraft } = require('../middlewares/validateRequest');
const requireWorkspaceAccess = require('../middlewares/requireWorkspaceAccess');

const router = express.Router();

router.post('/', requireWorkspaceAccess, validateScheduleDraft, scheduleDraft);

module.exports = router;
