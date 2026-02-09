const express = require('express');
const { signup, login } = require('../controllers/authController');
const { rateLimitAuth } = require('../middlewares/rateLimiters');
const { validateWithSchema } = require('../middlewares/validateWithSchema');
const { signupSchema, loginSchema } = require('../schemas/auth');

const router = express.Router();

router.post('/signup', rateLimitAuth, validateWithSchema(signupSchema), signup);
router.post('/login', rateLimitAuth, validateWithSchema(loginSchema), login);

module.exports = router;
