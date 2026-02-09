const express = require('express');
const { createRule, getRules } = require('../controllers/rulesController');
const { validateCreateRule } = require('../middlewares/validateRequest');
const requireWorkspaceAccess = require('../middlewares/requireWorkspaceAccess');

const router = express.Router();

router.use(requireWorkspaceAccess);
router.post('/', validateCreateRule, createRule);
router.get('/', getRules);

module.exports = router;
