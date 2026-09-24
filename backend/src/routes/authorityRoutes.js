const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const authorityController = require('../controllers/authorityController');

// Protected Authority/Admin route
router.get('/summary', authenticateToken, authorizeRoles('Authority', 'Admin'), authorityController.getSummary);

module.exports = router;
