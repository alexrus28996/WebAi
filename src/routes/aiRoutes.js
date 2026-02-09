const express = require('express');
const { getProviderInfoHandler } = require('../controllers/aiController');

const router = express.Router();

router.get('/provider', getProviderInfoHandler);

module.exports = router;
