const express = require('express');
const { generateDraftHandler, listDrafts } = require('../controllers/draftsController');
const { validateGenerateDraft } = require('../middlewares/validateRequest');
const { rateLimitGeneration } = require('../middlewares/rateLimiters');
const requireWorkspaceAccess = require('../middlewares/requireWorkspaceAccess');

const router = express.Router();

router.use(requireWorkspaceAccess);
router.post('/generate', rateLimitGeneration, validateGenerateDraft, generateDraftHandler);
router.get('/', listDrafts);

module.exports = router;
