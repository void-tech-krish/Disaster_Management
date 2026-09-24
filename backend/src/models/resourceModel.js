const { pool } = require('../config/database');

const getResources = async (filters = {}) => {
  let query = 'SELECT * FROM resources WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (filters.status) {
    query += ` AND status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }
  
  if (filters.resource_type) {
    query += ` AND resource_type = $${paramIndex}`;
    params.push(filters.resource_type);
    paramIndex++;
  }

  query += ' ORDER BY updated_at DESC';
  
  const result = await pool.query(query, params);
  return result.rows;
};

const getResourceById = async (id) => {
  const result = await pool.query('SELECT * FROM resources WHERE id = $1', [id]);
  return result.rows[0];
};

const createResource = async (data) => {
  const { resource_type, name, description, quantity, unit, latitude, longitude, location_id, organization, contact_name, contact_phone, priority } = data;
  const result = await pool.query(
    `INSERT INTO resources (resource_type, name, description, quantity, available_quantity, unit, latitude, longitude, location_id, organization, contact_name, contact_phone, priority) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
    [resource_type, name || resource_type, description, quantity, quantity, unit, latitude, longitude, location_id, organization, contact_name, contact_phone, priority || 'NORMAL']
  );
  return result.rows[0];
};

const updateResource = async (id, data, userId) => {
  const current = await getResourceById(id);
  if (!current) return null;

  const { quantity, available_quantity, status, priority, latitude, longitude, location_id, description, organization, contact_name, contact_phone } = data;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const result = await client.query(
      `UPDATE resources 
       SET quantity = COALESCE($1, quantity), 
           available_quantity = COALESCE($2, available_quantity), 
           status = COALESCE($3, status), 
           priority = COALESCE($4, priority), 
           latitude = COALESCE($5, latitude), 
           longitude = COALESCE($6, longitude), 
           location_id = COALESCE($7, location_id), 
           description = COALESCE($8, description), 
           organization = COALESCE($9, organization), 
           contact_name = COALESCE($10, contact_name), 
           contact_phone = COALESCE($11, contact_phone), 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12 RETURNING *`,
      [quantity, available_quantity, status, priority, latitude, longitude, location_id, description, organization, contact_name, contact_phone, id]
    );
    const updated = result.rows[0];

    // Log history if status or quantity changed
    if (status && status !== current.status || quantity !== undefined && quantity !== current.quantity || available_quantity !== undefined && available_quantity !== current.available_quantity) {
      await client.query(
        `INSERT INTO resource_history (resource_id, action, previous_status, new_status, previous_quantity, new_quantity, changed_by, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, 'RESOURCE_UPDATED', current.status, updated.status, current.available_quantity, updated.available_quantity, userId, 'Updated via API']
      );
    }
    
    await client.query('COMMIT');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const deleteResource = async (id, userId) => {
  const current = await getResourceById(id);
  if (!current) return null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Soft delete / unavailable
    const result = await client.query(
      `UPDATE resources SET status = 'UNAVAILABLE', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    await client.query(
      `INSERT INTO resource_history (resource_id, action, previous_status, new_status, changed_by, notes) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, 'RESOURCE_DELETED', current.status, 'UNAVAILABLE', userId, 'Soft deleted / marked unavailable']
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const assignResource = async (resourceId, assignmentData, userId) => {
  const { location_id, incident_id, assigned_quantity, notes } = assignmentData;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock the row to prevent concurrent assignment issues
    const resResult = await client.query('SELECT * FROM resources WHERE id = $1 FOR UPDATE', [resourceId]);
    const resource = resResult.rows[0];

    if (!resource) {
      throw new Error('Resource not found');
    }

    if (resource.available_quantity < assigned_quantity) {
      throw new Error(`Insufficient available quantity. Requested: ${assigned_quantity}, Available: ${resource.available_quantity}`);
    }

    // Deduct quantity and maybe update status
    const newAvailable = resource.available_quantity - assigned_quantity;
    const newStatus = newAvailable === 0 ? 'ASSIGNED' : resource.status; // partial assignments keep status

    const updatedRes = await client.query(
      `UPDATE resources SET available_quantity = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
      [newAvailable, newStatus, resourceId]
    );

    // Record assignment
    const assignment = await client.query(
      `INSERT INTO resource_assignments (resource_id, location_id, incident_id, assigned_quantity, assigned_by, notes) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [resourceId, location_id, incident_id, assigned_quantity, userId, notes]
    );

    // Record history
    await client.query(
      `INSERT INTO resource_history (resource_id, action, previous_status, new_status, previous_quantity, new_quantity, changed_by, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [resourceId, 'RESOURCE_ASSIGNED', resource.status, newStatus, resource.available_quantity, newAvailable, userId, `Assigned ${assigned_quantity} units`]
    );

    await client.query('COMMIT');
    return { resource: updatedRes.rows[0], assignment: assignment.rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getNearbyResources = async (lat, lon, radiusKm = 25) => {
  // We check if current_location (geometry) exists, or fall back to lat/lon basic distance if geometry is null
  // In PostGIS, geography distance is in meters
  const radiusMeters = radiusKm * 1000;
  
  const query = `
    SELECT *,
    ST_Distance(
      COALESCE(current_location, ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography),
      ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
    ) / 1000 AS distance_km
    FROM resources
    WHERE status = 'AVAILABLE' AND available_quantity > 0
    AND (
      current_location IS NOT NULL 
      AND ST_DWithin(current_location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
      OR 
      (latitude IS NOT NULL AND longitude IS NOT NULL 
       AND ST_DWithin(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3))
    )
    ORDER BY distance_km ASC;
  `;
  
  try {
    const result = await pool.query(query, [lon, lat, radiusMeters]);
    return result.rows;
  } catch (e) {
    console.error('PostGIS Error on getNearbyResources, falling back to simple mock if needed:', e.message);
    return [];
  }
};

const getResourceHistory = async (id) => {
  const result = await pool.query('SELECT * FROM resource_history WHERE resource_id = $1 ORDER BY changed_at DESC', [id]);
  return result.rows;
};

module.exports = {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  assignResource,
  getNearbyResources,
  getResourceHistory
};
