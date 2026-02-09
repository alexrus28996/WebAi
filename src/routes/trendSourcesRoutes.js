const express = require('express');
const requireWorkspaceAccess = require('../middlewares/requireWorkspaceAccess');
const { validateWithSchema } = require('../middlewares/validateWithSchema');
const {
  listTrendSources,
  createTrendSource,
  updateTrendSource,
  deleteTrendSource
} = require('../controllers/trendSourcesController');
const { createTrendSourceSchema, updateTrendSourceSchema } = require('../schemas/trendSources');

const router = express.Router();

router.use(requireWorkspaceAccess);
router.get('/', listTrendSources);
router.post('/', validateWithSchema(createTrendSourceSchema), createTrendSource);
router.patch('/:id', validateWithSchema(updateTrendSourceSchema), updateTrendSource);
router.delete('/:id', deleteTrendSource);

module.exports = router;
