const express = require('express');
const { fetchTrends, listTrends } = require('../controllers/trendsController');
const requireWorkspaceAccess = require('../middlewares/requireWorkspaceAccess');

const router = express.Router();

router.use(requireWorkspaceAccess);
router.post('/fetch', fetchTrends);
router.get('/', listTrends);

module.exports = router;
