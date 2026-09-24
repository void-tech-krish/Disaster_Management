const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const systemHealthController = require('../controllers/systemHealthController');

// Authority/Admin protected routes ONLY
router.use(authenticateToken);
router.use(authorizeRoles('Authority', 'Admin'));

router.get('/', systemHealthController.getSystemSummary);
router.get('/events', systemHealthController.getEvents);
router.get('/data-sources', systemHealthController.getDataSources);

module.exports = router;
