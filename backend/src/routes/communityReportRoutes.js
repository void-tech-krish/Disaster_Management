const express = require('express');
const router = express.Router();
const communityReportService = require('../services/communityReport.service');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route for viewing active verified reports
router.get('/public', async (req, res, next) => {
  try {
    const data = await communityReportService.getPublicReports();
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
});

router.use(protect);

// Citizen routes
router.post('/', async (req, res, next) => {
  try {
    const data = await communityReportService.submitReport(req.body, req.user.id);
    res.status(201).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
});

router.get('/my', async (req, res, next) => {
  try {
    const data = await communityReportService.getMyReports(req.user.id);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
});

// Authority routes
router.get('/authority', authorize('Authority', 'Admin'), async (req, res, next) => {
  try {
    const data = await communityReportService.getAuthorityQueue();
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
});

router.patch('/authority/:id/verify', authorize('Authority', 'Admin'), async (req, res, next) => {
  try {
    const data = await communityReportService.updateReportStatus(req.params.id, {
      status: req.body.status,
      verificationStatus: req.body.verificationStatus,
      authorityNotes: req.body.authorityNotes,
      isPublic: req.body.isPublic
    }, req.user.id);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
