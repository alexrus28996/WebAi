const express = require('express');
const { generateDraftHandler, listDrafts } = require('../controllers/draftsController');
const { rateLimitGeneration } = require('../middlewares/rateLimiters');
const requireWorkspaceAccess = require('../middlewares/requireWorkspaceAccess');
const { validateWithSchema } = require('../middlewares/validateWithSchema');
const { generateDraftSchema } = require('../schemas/drafts');

const router = express.Router();

router.use(requireWorkspaceAccess);
router.post('/generate', rateLimitGeneration, validateWithSchema(generateDraftSchema), generateDraftHandler);
router.get('/', listDrafts);

module.exports = router;
