const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const aiController = require('../controllers/ai.controller');

router.use(authenticateToken);

router.post('/chat', aiController.chat);
router.post('/explain-risk', aiController.explainRisk);
router.post('/what-if', aiController.whatIf);

module.exports = router;
