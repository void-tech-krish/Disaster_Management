const { pool } = require('../config/database');

const getAllIncidents = async (filters) => {
  let query = 'SELECT * FROM incidents WHERE 1=1';
  const values = [];
  
  if (filters.status) {
    values.push(filters.status);
    query += ` AND status = $${values.length}`;
  }
  if (filters.severity) {
    values.push(filters.severity);
    query += ` AND severity = $${values.length}`;
  }
  
  query += ' ORDER BY created_at DESC';
  const res = await pool.query(query, values);
  return res.rows;
};

const getIncidentById = async (id) => {
  const res = await pool.query('SELECT * FROM incidents WHERE id = $1', [id]);
  return res.rows[0];
};

const createIncident = async (data, userId) => {
  const query = `
    INSERT INTO incidents (
      incident_code, title, description, hazard_type, severity, status, location_id,
      affected_population, estimated_damage, source_type, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *;
  `;
  const values = [
    data.incident_code || `INC-${Date.now()}`,
    data.title,
    data.description || null,
    data.hazard_type,
    data.severity,
    data.status || 'OPEN',
    data.location_id || null,
    data.affected_population || 0,
    data.estimated_damage || 0.0,
    data.source_type || 'OFFICIAL_REPORT',
    userId
  ];
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const res = await client.query(query, values);
    const incident = res.rows[0];
    
    // Auto-create timeline event
    await client.query(`
      INSERT INTO incident_timeline (incident_id, event_type, title, created_by)
      VALUES ($1, 'INCIDENT_REPORTED', 'Incident Created', $2)
    `, [incident.id, userId]);
    
    await client.query('COMMIT');
    return incident;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const updateIncidentStatus = async (id, status, userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const res = await client.query('UPDATE incidents SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [status, id]);
    
    // Auto-timeline
    await client.query(`
      INSERT INTO incident_timeline (incident_id, event_type, title, description, created_by)
      VALUES ($1, 'STATUS_CHANGED', 'Status updated', $2, $3)
    `, [id, `Status changed to ${status}`, userId]);
    
    await client.query('COMMIT');
    return res.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getTimeline = async (incidentId) => {
  const res = await pool.query('SELECT * FROM incident_timeline WHERE incident_id = $1 ORDER BY event_time ASC', [incidentId]);
  return res.rows;
};

const addTimelineEvent = async (incidentId, data, userId) => {
  const res = await pool.query(`
    INSERT INTO incident_timeline (incident_id, event_type, title, description, source_type, created_by)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
  `, [incidentId, data.event_type, data.title, data.description || null, data.source_type || 'SYSTEM', userId]);
  return res.rows[0];
};

const updateImpact = async (incidentId, data) => {
  const query = `
    UPDATE incidents SET 
      affected_population = $1, injured_count = $2, fatality_count = $3, 
      shelters_used = $4, resources_deployed = $5, estimated_damage = $6, updated_at = NOW()
    WHERE id = $7 RETURNING *
  `;
  const values = [
    data.affected_population || 0,
    data.injured_count || 0,
    data.fatality_count || 0,
    data.shelters_used || 0,
    data.resources_deployed || 0,
    data.estimated_damage || 0.0,
    incidentId
  ];
  const res = await pool.query(query, values);
  return res.rows[0];
};

module.exports = {
  getAllIncidents,
  getIncidentById,
  createIncident,
  updateIncidentStatus,
  getTimeline,
  addTimelineEvent,
  updateImpact
};
