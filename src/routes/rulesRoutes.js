const express = require('express');
const { createRule, getRules } = require('../controllers/rulesController');

const router = express.Router();

router.post('/', createRule);
router.get('/', getRules);

module.exports = router;
