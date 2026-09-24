const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const incidentController = require('../controllers/incidentController');

// Public/Citizen accessible read routes
router.get('/', incidentController.getIncidents);
router.get('/:id', incidentController.getIncident);
router.get('/:id/timeline', incidentController.getTimeline);

// Authority/Admin protected mutation routes
router.use(authenticateToken);
router.use(authorizeRoles('Authority', 'Admin'));

router.post('/', incidentController.createIncident);
router.patch('/:id/status', incidentController.updateStatus);
router.post('/:id/timeline', incidentController.addTimelineEvent);
router.put('/:id/impact', incidentController.updateImpact);

module.exports = router;
