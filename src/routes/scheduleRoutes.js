const express = require('express');
const { scheduleDraft } = require('../controllers/scheduleController');
const requireWorkspaceAccess = require('../middlewares/requireWorkspaceAccess');
const { validateWithSchema } = require('../middlewares/validateWithSchema');
const { scheduleCreateSchema } = require('../schemas/schedule');

const router = express.Router();

router.post('/', requireWorkspaceAccess, validateWithSchema(scheduleCreateSchema), scheduleDraft);

module.exports = router;
