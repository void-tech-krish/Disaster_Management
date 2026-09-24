const db = require('../config/database');

exports.getSummary = async (req, res) => {
    try {
        const [
            incidents,
            alerts,
            shelters,
            requests,
            riskPredictions
        ] = await Promise.all([
            db.query('SELECT COUNT(*) FROM incidents WHERE status = $1', ['OPEN']),
            db.query('SELECT COUNT(*) FROM alerts'),
            db.query('SELECT COUNT(*) FROM shelters WHERE accessibility_status = $1', ['OPEN']),
            db.query('SELECT COUNT(*) FROM resource_requests WHERE status = $1', ['SUBMITTED']),
            db.query('SELECT COUNT(*) FROM risk_predictions WHERE risk_level = $1', ['HIGH'])
        ]);

        res.json({
            activeIncidents: parseInt(incidents.rows[0].count),
            activeAlerts: parseInt(alerts.rows[0].count),
            openShelters: parseInt(shelters.rows[0].count),
            pendingLogisticsRequests: parseInt(requests.rows[0].count),
            criticalRiskLocations: parseInt(riskPredictions.rows[0].count)
        });
    } catch (err) {
        console.error('Command Center Error:', err);
        res.status(500).json({ error: 'Failed to fetch command center summary' });
    }
};
