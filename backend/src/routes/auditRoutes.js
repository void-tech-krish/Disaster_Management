const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const auditController = require('../controllers/auditController');

// All audit routes are highly protected
router.use(authenticateToken);
router.use(authorizeRoles('Authority', 'Admin'));

router.get('/', auditController.getLogs);
router.get('/summary', auditController.getSummary);
router.get('/:id', auditController.getLogDetails);

module.exports = { router };
