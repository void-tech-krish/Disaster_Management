const express = require('express');
const router = express.Router();
const mapService = require('../services/map.service');
const { protect } = require('../middleware/authMiddleware'); // For protected endpoints if needed

// Get Risk Zones
router.get('/risk-zones', async (req, res, next) => {
  try {
    const hazardType = req.query.hazard;
    const geojson = await mapService.getRiskZones(hazardType);
    res.status(200).json({ status: 'success', data: geojson });
  } catch (error) {
    next(error);
  }
});

// Get Official Warnings
router.get('/warnings', async (req, res, next) => {
  try {
    const geojson = await mapService.getOfficialWarnings();
    res.status(200).json({ status: 'success', data: geojson });
  } catch (error) {
    next(error);
  }
});

// Get Historical Events
router.get('/historical-events', async (req, res, next) => {
  try {
    const hazardType = req.query.hazard;
    const geojson = await mapService.getHistoricalEvents(hazardType);
    res.status(200).json({ status: 'success', data: geojson });
  } catch (error) {
    next(error);
  }
});

// POST Impact Analysis
router.post('/impact-analysis', async (req, res, next) => {
  try {
    const { geometry } = req.body;
    if (!geometry) {
      return res.status(400).json({ status: 'error', message: 'Geometry is required for impact analysis.' });
    }
    const impact = await mapService.calculatePopulationImpact(geometry);
    res.status(200).json({ status: 'success', data: impact });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
