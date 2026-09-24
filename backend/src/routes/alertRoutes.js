const express = require('express');
const router = express.Router();
const officialAlertService = require('../services/data-integration/officialAlert.service');

router.get('/', async (req, res, next) => {
  try {
    const { locationId } = req.query;
    const alerts = await officialAlertService.getOfficialAlerts(locationId);
    
    // Map them slightly if needed to fit the old frontend, but we can also just return them
    const formattedAlerts = alerts.map(a => ({
      id: a.id,
      title: `${a.severity} ${a.hazard_type} WARNING`,
      hazard: a.hazard_type,
      location: 'Local', // Can be enriched via DB if needed
      severity: a.severity,
      timestamp: a.issued_at,
      source_type: a.status, // "OFFICIAL WARNING"
      message: a.message,
      recommended_action: 'Monitor official advisories.',
      expiry_time: a.valid_until,
      status: 'ACTIVE'
    }));

    res.status(200).json({ status: 'success', data: { alerts: formattedAlerts } });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
