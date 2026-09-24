const { pool } = require('../config/database');

const updateHealthCheck = async (serviceName, status, responseTime, errorMessage, version = null) => {
  const query = `
    INSERT INTO system_health_checks (service_name, status, response_time_ms, error_message, version, checked_at, last_success_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), CASE WHEN $2 = 'HEALTHY' THEN NOW() ELSE NULL END)
    ON CONFLICT (service_name) DO UPDATE SET
      status = EXCLUDED.status,
      response_time_ms = EXCLUDED.response_time_ms,
      error_message = EXCLUDED.error_message,
      version = COALESCE(EXCLUDED.version, system_health_checks.version),
      checked_at = NOW(),
      last_success_at = CASE WHEN EXCLUDED.status = 'HEALTHY' THEN NOW() ELSE system_health_checks.last_success_at END
    RETURNING *;
  `;
  const res = await pool.query(query, [serviceName, status, responseTime, errorMessage, version]);
  return res.rows[0];
};

const getHealthChecks = async () => {
  const res = await pool.query('SELECT * FROM system_health_checks ORDER BY service_name ASC');
  return res.rows;
};

const logEvent = async (eventType, serviceName, severity, message) => {
  // Prevent duplicate consecutive events of the same type for the same service
  const lastEventRes = await pool.query(`
    SELECT event_type FROM system_health_events 
    WHERE service_name = $1 
    ORDER BY created_at DESC LIMIT 1
  `, [serviceName]);
  
  if (lastEventRes.rows.length > 0 && lastEventRes.rows[0].event_type === eventType) {
    return null; // Skip duplicate
  }

  const res = await pool.query(`
    INSERT INTO system_health_events (event_type, service_name, severity, message)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [eventType, serviceName, severity, message]);
  return res.rows[0];
};

const getEvents = async (limit = 50) => {
  const res = await pool.query('SELECT * FROM system_health_events ORDER BY created_at DESC LIMIT $1', [limit]);
  return res.rows;
};

const updateDataSource = async (sourceName, hazardType, sourceType, status, freshnessStatus, recordCount = null, error = null) => {
  const query = `
    INSERT INTO data_source_status (source_name, hazard_type, source_type, status, freshness_status, record_count, error_message, last_updated, last_success)
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), CASE WHEN $4 = 'HEALTHY' THEN NOW() ELSE NULL END)
    ON CONFLICT (source_name) DO UPDATE SET
      status = EXCLUDED.status,
      freshness_status = EXCLUDED.freshness_status,
      record_count = COALESCE(EXCLUDED.record_count, data_source_status.record_count),
      error_message = EXCLUDED.error_message,
      last_updated = NOW(),
      last_success = CASE WHEN EXCLUDED.status = 'HEALTHY' THEN NOW() ELSE data_source_status.last_success END,
      updated_at = NOW()
    RETURNING *;
  `;
  const res = await pool.query(query, [sourceName, hazardType, sourceType, status, freshnessStatus, recordCount, error]);
  return res.rows[0];
};

const getDataSources = async () => {
  const res = await pool.query('SELECT * FROM data_source_status ORDER BY last_updated DESC');
  return res.rows;
};

module.exports = {
  updateHealthCheck,
  getHealthChecks,
  logEvent,
  getEvents,
  updateDataSource,
  getDataSources
};
