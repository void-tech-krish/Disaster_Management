const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public / Citizen routes (Authenticated)
router.get('/', authenticateToken, resourceController.getAllResources);
router.get('/nearby', authenticateToken, resourceController.getNearby);
router.get('/recommendations', authenticateToken, authorizeRoles('Authority', 'Admin'), resourceController.getRecommendations);
router.get('/shortages', authenticateToken, authorizeRoles('Authority', 'Admin'), resourceController.getShortages);
router.get('/:id', authenticateToken, resourceController.getResource);

// Operational History (Authority / Admin)
router.get('/:id/history', authenticateToken, authorizeRoles('Authority', 'Admin'), resourceController.getHistory);

// Management routes (Authority / Admin)
router.post('/', authenticateToken, authorizeRoles('Authority', 'Admin'), resourceController.createResource);
router.put('/:id', authenticateToken, authorizeRoles('Authority', 'Admin'), resourceController.updateResource);
router.post('/:id/assign', authenticateToken, authorizeRoles('Authority', 'Admin'), resourceController.assignResource);

// Admin routes
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), resourceController.deleteResource);

module.exports = router;
