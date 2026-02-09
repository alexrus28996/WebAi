const express = require('express');
const { generateDraftHandler, listDrafts } = require('../controllers/draftsController');
const { validateGenerateDraft } = require('../middlewares/validateRequest');

const router = express.Router();

router.post('/generate', validateGenerateDraft, generateDraftHandler);
router.get('/', listDrafts);

module.exports = router;
