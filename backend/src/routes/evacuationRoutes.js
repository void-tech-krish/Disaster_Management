const express = require('express');
const router = express.Router();
const evacuationService = require('../services/evacuation.service');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get active public advisories (Citizen View)
router.get('/public', async (req, res, next) => {
  try {
    const data = await evacuationService.getAdvisories({ status: 'ACTIVE' });
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
});

// Require Auth for all other routes
router.use(protect);
router.use(authorize('Authority', 'Admin'));

router.get('/', async (req, res, next) => {
  try {
    const status = req.query.status;
    const data = await evacuationService.getAdvisories(status ? { status } : {});
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await evacuationService.getAdvisoryById(req.params.id);
    if (!data) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
});

router.post('/simulation', async (req, res, next) => {
  try {
    const data = await evacuationService.generateRecommendation(req.body);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = await evacuationService.createAdvisory(req.body, req.user.id);
    res.status(201).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/approve', async (req, res, next) => {
  try {
    const data = await evacuationService.updateStatus(req.params.id, 'APPROVED', req.user.id, req.body.note);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/activate', async (req, res, next) => {
  try {
    const data = await evacuationService.updateStatus(req.params.id, 'ACTIVE', req.user.id, req.body.note);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/complete', async (req, res, next) => {
  try {
    const data = await evacuationService.updateStatus(req.params.id, 'COMPLETED', req.user.id, req.body.note);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/reject', async (req, res, next) => {
  try {
    const data = await evacuationService.updateStatus(req.params.id, 'REJECTED', req.user.id, req.body.note);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
