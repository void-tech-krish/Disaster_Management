const express = require('express');
const router = express.Router();
const commandCenterController = require('../controllers/commandCenterController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Authority', 'Admin'));

router.get('/summary', commandCenterController.getSummary);

module.exports = router;
