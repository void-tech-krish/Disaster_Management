const express = require('express');
const router = express.Router();
const responseIntelligenceService = require('../services/responseIntelligence.service');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get intelligence payload for a response case
router.get('/:id', protect, authorize('Authority', 'Admin'), async (req, res, next) => {
  try {
    const intelligence = await responseIntelligenceService.getIntelligence(req.params.id);
    res.status(200).json({ status: 'success', data: intelligence });
  } catch (error) {
    next(error);
  }
});

// Approve a recommendation
router.post('/:id/recommendations/:recId/approve', protect, authorize('Authority', 'Admin'), async (req, res, next) => {
  try {
    const approval = await responseIntelligenceService.approveRecommendation(req.params.id, req.params.recId, req.user.id);
    
    // Emit to dashboard
    const io = req.app.get('io');
    if (io) io.emit('response:approval-updated', approval);

    res.status(200).json({ status: 'success', data: approval });
  } catch (error) {
    next(error);
  }
});

// Reject a recommendation
router.post('/:id/recommendations/:recId/reject', protect, authorize('Authority', 'Admin'), async (req, res, next) => {
  try {
    const rejection = await responseIntelligenceService.rejectRecommendation(req.params.id, req.params.recId, req.user.id);
    
    // Emit to dashboard
    const io = req.app.get('io');
    if (io) io.emit('response:approval-updated', rejection);

    res.status(200).json({ status: 'success', data: rejection });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
