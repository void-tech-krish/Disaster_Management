const express = require('express');
const router = express.Router();
const commandCenterController = require('../controllers/commandCenterController');
const { verifyToken, isAdminOrAuthority } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(isAdminOrAuthority);

router.get('/summary', commandCenterController.getSummary);

module.exports = router;
