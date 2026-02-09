const express = require('express');
const { runPublisherHandler } = require('../controllers/publisherController');
const requireWorkspaceAccess = require('../middlewares/requireWorkspaceAccess');
const { validateWithSchema } = require('../middlewares/validateWithSchema');
const { publisherRunSchema } = require('../schemas/publisher');

const router = express.Router();

router.post('/run', requireWorkspaceAccess, validateWithSchema(publisherRunSchema), runPublisherHandler);

module.exports = router;
