const express = require('express');
const router = express.Router();
const recoveryService = require('../services/recovery.service');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Authority', 'Admin'));

// Get dashboard summary
router.get('/:incidentId/dashboard', async (req, res, next) => {
  try {
    const data = await recoveryService.getDashboardSummary(req.params.incidentId);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
});

// Get damage assessments
router.get('/:incidentId/damage', async (req, res, next) => {
  try {
    const data = await recoveryService.getDamage(req.params.incidentId);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
});

// Create damage assessment
router.post('/:incidentId/damage', async (req, res, next) => {
  try {
    const data = await recoveryService.addDamage({ ...req.body, incidentId: req.params.incidentId });
    res.status(201).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
});

// Get recovery tasks
router.get('/:incidentId/tasks', async (req, res, next) => {
  try {
    const data = await recoveryService.getTasks(req.params.incidentId);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
});

// Create recovery task
router.post('/:incidentId/tasks', async (req, res, next) => {
  try {
    const data = await recoveryService.addTask({ ...req.body, incidentId: req.params.incidentId });
    res.status(201).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
