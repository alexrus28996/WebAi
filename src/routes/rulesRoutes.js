const express = require('express');
const { createRule, getRules } = require('../controllers/rulesController');
const requireWorkspaceAccess = require('../middlewares/requireWorkspaceAccess');
const { validateWithSchema } = require('../middlewares/validateWithSchema');
const { createRuleSchema } = require('../schemas/rules');

const router = express.Router();

router.use(requireWorkspaceAccess);
router.post('/', validateWithSchema(createRuleSchema), createRule);
router.get('/', getRules);

module.exports = router;
