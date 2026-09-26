const express = require('express');
const router = express.Router();
const mapService = require('../services/map.service');
const { protect } = require('../middleware/auth'); // For protected endpoints if needed

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

// GET Map Locations with their Risk Predictions
router.get('/risk-map-locations', async (req, res, next) => {
  try {
    const { pool } = require('../config/database');
    const result = await pool.query(`
      SELECT 
        l.id as location_id,
        l.name as location_name,
        ST_X(l.geom) as longitude,
        ST_Y(l.geom) as latitude,
        rp.hazard_type,
        rp.risk_score,
        rp.risk_level,
        rp.prediction_time,
        rp.confidence,
        rp.model_version
      FROM locations l
      JOIN risk_predictions rp ON l.id = rp.location_id
    `);

    // Group by location
    const locationsMap = new Map();
    
    result.rows.forEach(row => {
      if (!locationsMap.has(row.location_id)) {
        locationsMap.set(row.location_id, {
          id: row.location_id,
          name: row.location_name,
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude),
          risks: []
        });
      }
      
      locationsMap.get(row.location_id).risks.push({
        hazard_type: row.hazard_type,
        risk_score: parseFloat(row.risk_score),
        risk_level: row.risk_level,
        prediction_time: row.prediction_time,
        confidence: row.confidence ? parseFloat(row.confidence) : null,
        model_version: row.model_version
      });
    });

    res.status(200).json({
      success: true,
      data: {
        locations: Array.from(locationsMap.values())
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
