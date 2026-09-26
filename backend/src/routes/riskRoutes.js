const express = require('express');
const router = express.Router();
const mlService = require('../services/ml.service');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const dataSourceService = require('../services/dataSources/dataSourceService');
const weatherService = require('../services/weather.service');

router.post('/assess', async (req, res, next) => {
  try {
    const locationData = req.body;
    
    const lat = locationData.lat;
    const lon = locationData.lon;

    // Fetch real-time weather if coordinates are present
    if (lat && lon) {
      try {
        const weather = await weatherService.getCurrentWeatherByCoordinates(lat, lon);
        if (weather && weather.current) {
          locationData.temperature = weather.current.temperature;
          locationData.humidity = weather.current.humidity;
          // Approximate rainfall for demo/ml if not provided by weather API directly in simple current response
          locationData.rainfall = weather.current.condition.includes('Rain') ? 15.0 : 0.0;
        }
      } catch (weatherErr) {
        console.error('Failed to fetch weather for risk engine:', weatherErr.message);
      }
    }

    // In a real application, you might detect which hazards apply based on location coordinates.
    // For Rajasthan bounds roughly (23.3 to 30.2 Lat, 69.4 to 78.3 Lon)
    let heatwaveRiskPromise;
    const isRajasthan = lat >= 23.0 && lat <= 30.5 && lon >= 69.0 && lon <= 78.5;

    if (!lat || !lon || isRajasthan) {
       heatwaveRiskPromise = mlService.getHeatwaveRisk(locationData);
    } else {
       heatwaveRiskPromise = Promise.resolve({
           hazard: 'heatwave',
           risk_score: 0,
           risk_level: 'UNKNOWN',
           confidence: 0,
           source: 'Dataset unavailable for this location (Rajasthan only)'
       });
    }

    const [
      floodRisk,
      landslideRisk,
      heatwaveRisk,
      droughtRisk,
      forestFireRisk,
      cycloneData
    ] = await Promise.all([
      mlService.getFloodRisk(locationData),
      mlService.getLandslideRisk(locationData),
      heatwaveRiskPromise,
      mlService.getDroughtRisk(locationData),
      mlService.getUnsupportedRisk('forest_fire'),
      mlService.getCycloneData()
    ]);
    
    const risks = [floodRisk, landslideRisk, heatwaveRisk, droughtRisk, forestFireRisk];
    
    try {
        if (pool) {
            for (const r of risks) {
                if (r && r.risk_level !== 'UNKNOWN' && r.source !== 'Dataset unavailable') {
                    // Check if there is an associated source freshness for this risk
                    // Actually, all these risks are from ML Service which uses AI RISK ASSESSMENT
                    r.data_freshness = 'FRESH'; // By default for ML predictions if the service responds
                    r.source_type = 'AI RISK ASSESSMENT';
                    
                    await pool.query(
                        'INSERT INTO risk_predictions (hazard_type, risk_score, risk_level, confidence, source, model_version) VALUES ($1, $2, $3, $4, $5, $6)',
                        [r.hazard, r.risk_score, r.risk_level, r.confidence, r.source || 'AI RISK ASSESSMENT', r.model_version || 'v1.0']
                    );
                }
            }
        }
    } catch(dbErr) {
        console.error("Failed to save to DB", dbErr);
    }

    res.status(200).json({
      status: 'success',
      data: {
        risks: risks,
        cyclone: cycloneData,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/cyclone', async (req, res, next) => {
  try {
    const cycloneData = await mlService.getCycloneData();
    res.status(200).json({
      status: 'success',
      data: cycloneData
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:locationId/explanation', authenticateToken, async (req, res, next) => {
  try {
    const { hazard, features } = req.query; // Could pass current features to ML service
    // For simplicity, we can just call mlService.get[Hazard]Risk with default or passed features
    // and extract the factors.
    let risk = null;
    let featuresObj = {};
    try {
      if (features) featuresObj = JSON.parse(features);
    } catch(e) {}

    const locData = { ...featuresObj, lat: req.query.lat, lon: req.query.lon };

    if (!hazard) return res.status(400).json({ status: 'error', message: 'hazard query param is required' });

    if (hazard === 'flood') risk = await mlService.getFloodRisk(locData);
    else if (hazard === 'landslide') risk = await mlService.getLandslideRisk(locData);
    else if (hazard === 'heatwave') risk = await mlService.getHeatwaveRisk(locData);
    else if (hazard === 'drought') risk = await mlService.getDroughtRisk(locData);

    if (!risk || !risk.factors || risk.factors.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          hazard,
          explanation: 'EXPLANATION_NOT_AVAILABLE',
          source_type: 'N/A'
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        hazard: risk.hazard,
        risk_score: risk.risk_score,
        risk_level: risk.risk_level,
        factors: risk.factors,
        model_version: risk.model_version || "v1.0",
        source_type: risk.source
      }
    });
  } catch(err) {
    next(err);
  }
});

router.get('/:locationId/forecast', authenticateToken, async (req, res, next) => {
  try {
    const { hazard } = req.query;
    
    // As per scientific limitation rule: we DO NOT fabricate forecasts for static models.
    // If the dataset doesn't support forecasting, we return FORECAST_NOT_AVAILABLE.
    
    // We can fetch historical predictions from risk_predictions
    let history = [];
    if (pool && hazard) {
       const result = await pool.query(
          "SELECT risk_score, risk_level, created_at FROM risk_predictions WHERE hazard_type = $1 ORDER BY created_at DESC LIMIT 10",
          [hazard.toLowerCase()]
       );
       history = result.rows;
    }

    res.status(200).json({
      status: 'success',
      data: {
        current: null, 
        historical: history,
        forecast: 'FORECAST_NOT_AVAILABLE', // None of our models currently support valid forecasting
        model_version: 'v1.0',
        source_type: 'AI RISK ASSESSMENT'
      }
    });
  } catch(err) {
    next(err);
  }
});

router.get('/models', async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: [
      { hazard: 'Flood', version: 'v1.0', forecast_supported: false, explainability_supported: true },
      { hazard: 'Landslide', version: 'v1.0', forecast_supported: false, explainability_supported: true },
      { hazard: 'Heatwave', version: 'v1.0', forecast_supported: false, explainability_supported: true },
      { hazard: 'Drought', version: 'v1.0', forecast_supported: false, explainability_supported: true },
      { hazard: 'Cyclone', version: 'v1.0', forecast_supported: false, explainability_supported: false }
    ]
  });
});

module.exports = router;
