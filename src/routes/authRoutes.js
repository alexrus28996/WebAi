const express = require('express');
const { signup, login } = require('../controllers/authController');
const { rateLimitAuth } = require('../middlewares/rateLimiters');

const router = express.Router();

router.post('/signup', rateLimitAuth, signup);
router.post('/login', rateLimitAuth, login);

module.exports = router;
