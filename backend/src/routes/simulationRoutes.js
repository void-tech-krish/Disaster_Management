const express = require('express');
const router = express.Router();
const mlService = require('../services/ml.service');
const pool = require('../config/database');

router.post('/', async (req, res, next) => {
  try {
    const { hazard, locationId, features, baselineFeatures } = req.body;

    if (!hazard || !features) {
      return res.status(400).json({ status: 'error', message: 'Hazard and features are required' });
    }

    let baselineRisk = null;
    let scenarioRisk = null;

    // Fetch risks using mlService dynamically.
    if (hazard.toLowerCase() === 'flood') {
       baselineRisk = await mlService.getFloodRisk(baselineFeatures || {});
       scenarioRisk = await mlService.getFloodRisk(features);
    } else if (hazard.toLowerCase() === 'landslide') {
       baselineRisk = await mlService.getLandslideRisk(baselineFeatures || {});
       scenarioRisk = await mlService.getLandslideRisk(features);
    } else if (hazard.toLowerCase() === 'heatwave') {
       baselineRisk = await mlService.getHeatwaveRisk(baselineFeatures || {});
       scenarioRisk = await mlService.getHeatwaveRisk(features);
    } else if (hazard.toLowerCase() === 'drought') {
       baselineRisk = await mlService.getDroughtRisk(baselineFeatures || {});
       scenarioRisk = await mlService.getDroughtRisk(features);
    } else {
       return res.status(400).json({ status: 'error', message: 'Simulation not supported for this hazard' });
    }

    const difference = scenarioRisk.risk_score - baselineRisk.risk_score;

    res.status(200).json({
      status: 'success',
      data: {
        hazard,
        baseline: {
          risk_score: baselineRisk.risk_score,
          risk_level: baselineRisk.risk_level
        },
        scenario: {
          risk_score: scenarioRisk.risk_score,
          risk_level: scenarioRisk.risk_level
        },
        difference: difference,
        source_type: "DEMO/SIMULATION",
        model_version: scenarioRisk.model_version || "v1.0"
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
