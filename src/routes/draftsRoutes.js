const express = require('express');
const { generateDraftHandler, listDrafts } = require('../controllers/draftsController');

const router = express.Router();

router.post('/generate', generateDraftHandler);
router.get('/', listDrafts);

module.exports = router;
