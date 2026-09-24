const express = require('express');
const router = express.Router();
const responseService = require('../services/response.service');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get active responses
router.get('/', protect, authorize('Authority', 'Admin'), async (req, res, next) => {
  try {
    const responses = await responseService.getActiveResponses();
    res.status(200).json({ status: 'success', data: responses });
  } catch (error) {
    next(error);
  }
});

// Create new response case
router.post('/', protect, authorize('Authority', 'Admin'), async (req, res, next) => {
  try {
    const responseCase = await responseService.createResponseCase(req.body, req.user.id);
    
    // Emit to dashboard
    const io = req.app.get('io');
    if (io) io.emit('response:created', responseCase);

    res.status(201).json({ status: 'success', data: responseCase });
  } catch (error) {
    next(error);
  }
});

// Activate response
router.post('/:id/activate', protect, authorize('Authority', 'Admin'), async (req, res, next) => {
  try {
    const responseCase = await responseService.activateResponse(req.params.id, req.user.id);
    const io = req.app.get('io');
    if (io) io.emit('response:activated', responseCase);

    res.status(200).json({ status: 'success', data: responseCase });
  } catch (error) {
    next(error);
  }
});

// Close response
router.post('/:id/close', protect, authorize('Authority', 'Admin'), async (req, res, next) => {
  try {
    const responseCase = await responseService.closeResponse(req.params.id);
    const io = req.app.get('io');
    if (io) io.emit('response:closed', responseCase);

    res.status(200).json({ status: 'success', data: responseCase });
  } catch (error) {
    next(error);
  }
});

// Create Response Action
router.post('/:id/actions', protect, authorize('Authority', 'Admin'), async (req, res, next) => {
  try {
    const action = await responseService.createAction(req.params.id, req.body, req.user.id);
    const io = req.app.get('io');
    if (io) io.emit('response-action:created', action);

    res.status(201).json({ status: 'success', data: action });
  } catch (error) {
    next(error);
  }
});

// Assign Resource
router.post('/:id/resources', protect, authorize('Authority', 'Admin'), async (req, res, next) => {
  try {
    const { resourceId, quantity } = req.body;
    if (!resourceId || !quantity) return res.status(400).json({ status: 'error', message: 'Resource ID and quantity required' });

    const assignment = await responseService.assignResource(req.params.id, resourceId, quantity, req.user.id);
    const io = req.app.get('io');
    if (io) io.emit('resource:assigned', assignment);

    res.status(201).json({ status: 'success', data: assignment });
  } catch (error) {
    next(error);
  }
});

// Get Recommendations
router.post('/:id/recommendations', protect, authorize('Authority', 'Admin'), async (req, res, next) => {
  try {
    const recommendations = await responseService.getRecommendations(req.params.id);
    res.status(200).json({ status: 'success', data: { recommendations } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
