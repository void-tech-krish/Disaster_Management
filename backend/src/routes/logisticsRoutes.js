const express = require('express');
const router = express.Router();
const logisticsController = require('../controllers/logisticsController');
const { verifyToken, isAdminOrAuthority } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(isAdminOrAuthority);

router.get('/requests', logisticsController.getRequests);
router.post('/requests', logisticsController.createRequest);
router.patch('/requests/:id/approve', logisticsController.approveRequest);
router.patch('/requests/:id/assign', logisticsController.assignResource);

module.exports = router;
