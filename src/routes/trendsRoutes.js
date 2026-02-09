const express = require('express');
const { fetchTrends, listTrends, updateTrendStatus } = require('../controllers/trendsController');
const requireWorkspaceAccess = require('../middlewares/requireWorkspaceAccess');
const { validateWithSchema } = require('../middlewares/validateWithSchema');
const { updateTrendStatusSchema } = require('../schemas/trends');

const router = express.Router();

router.use(requireWorkspaceAccess);
router.post('/fetch', fetchTrends);
router.get('/', listTrends);
router.patch('/:id/status', validateWithSchema(updateTrendStatusSchema), updateTrendStatus);

module.exports = router;
