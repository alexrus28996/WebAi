const express = require('express');
const { createRule, getRules } = require('../controllers/rulesController');
const { validateCreateRule } = require('../middlewares/validateRequest');

const router = express.Router();

router.post('/', validateCreateRule, createRule);
router.get('/', getRules);

module.exports = router;
