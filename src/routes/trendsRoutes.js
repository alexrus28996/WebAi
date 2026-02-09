const express = require('express');
const { fetchTrends, listTrends } = require('../controllers/trendsController');

const router = express.Router();

router.post('/fetch', fetchTrends);
router.get('/', listTrends);

module.exports = router;
