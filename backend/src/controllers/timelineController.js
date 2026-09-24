const { pool } = require('../config/database');

const getTimeline = async (req, res, next) => {
  try {
    const { locationId } = req.params;
    
    // We'll mock the timeline for Phase 2 if table is empty
    let result;
    if (locationId) {
      result = await pool.query('SELECT * FROM event_timeline WHERE location_id = $1 ORDER BY timestamp DESC LIMIT 20', [locationId]);
    } else {
      result = await pool.query('SELECT * FROM event_timeline ORDER BY timestamp DESC LIMIT 20');
    }

    let timeline = result.rows;

    // Fallback mock data if table is empty
    if (timeline.length === 0) {
      timeline = [
        {
          id: 1,
          event_type: 'RISK_UPDATE',
          hazard_type: 'Flood',
          message: 'Risk reached 82 (CRITICAL)',
          risk_score: 82,
          severity: 'CRITICAL',
          source: 'AI Model',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          event_type: 'ALERT_GENERATED',
          hazard_type: 'Flood',
          message: 'HIGH RISK alert generated for Vijayawada',
          risk_score: 75,
          severity: 'HIGH',
          source: 'System',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 3,
          event_type: 'DATA_INGESTION',
          hazard_type: 'Flood',
          message: 'Heavy rainfall detected (180mm)',
          risk_score: 62,
          severity: 'MODERATE',
          source: 'Weather API',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ];
    }

    res.status(200).json({
      status: 'success',
      data: {
        timeline
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTimeline
};
