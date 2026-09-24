const express = require('express');
const router = express.Router();
const logisticsController = require('../controllers/logisticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Authority', 'Admin'));

router.get('/requests', logisticsController.getRequests);
router.post('/requests', logisticsController.createRequest);
router.patch('/requests/:id/approve', logisticsController.approveRequest);
router.patch('/requests/:id/assign', logisticsController.assignResource);

module.exports = router;
