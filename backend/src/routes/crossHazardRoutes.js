const express = require('express');
const router = express.Router();
const crossHazardService = require('../services/crossHazard.service');
const { protect } = require('../middleware/authMiddleware');

// Get cross hazard intelligence for a location
router.get('/:locationId', protect, async (req, res, next) => {
  try {
    const intelligence = await crossHazardService.getIntelligence(req.params.locationId);
    res.status(200).json({ status: 'success', data: intelligence });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
