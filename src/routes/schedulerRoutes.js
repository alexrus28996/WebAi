const express = require('express');
const { getProvider } = require('../controllers/schedulerController');
const requireWorkspaceAccess = require('../middlewares/requireWorkspaceAccess');

const router = express.Router();

router.get('/provider', requireWorkspaceAccess, getProvider);

module.exports = router;
