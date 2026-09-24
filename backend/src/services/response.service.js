const { pool } = require('../config/database');

class ResponseService {
  /**
   * Creates a new Emergency Response Case
   */
  async createResponseCase(data, userId) {
    const { incident_id, alert_id, hazard_type, severity, location_id, priority } = data;
    const response_code = `RESP-${Date.now().toString().slice(-6)}`;
    
    const query = `
      INSERT INTO response_cases 
        (response_code, incident_id, alert_id, hazard_type, severity, location_id, priority, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;
    const result = await pool.query(query, [
      response_code, incident_id, alert_id, hazard_type, severity, location_id, priority || 'NORMAL'
    ]);
    return result.rows[0];
  }

  /**
   * Activates a PENDING_REVIEW response case
   */
  async activateResponse(id, authorityId) {
    const query = `
      UPDATE response_cases 
      SET status = 'ACTIVATED', assigned_authority_id = $1, activated_at = NOW(), updated_at = NOW()
      WHERE id = $2 AND status = 'PENDING_REVIEW'
      RETURNING *
    `;
    const result = await pool.query(query, [authorityId, id]);
    if (result.rows.length === 0) throw new Error("Response case not found or already activated");
    return result.rows[0];
  }

  /**
   * Closes a response case
   */
  async closeResponse(id) {
    const query = `
      UPDATE response_cases 
      SET status = 'CLOSED', closed_at = NOW(), updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Gets all active response cases
   */
  async getActiveResponses() {
    const query = `
      SELECT rc.*, l.name as location_name 
      FROM response_cases rc
      LEFT JOIN locations l ON rc.location_id = l.id
      WHERE rc.status NOT IN ('CLOSED', 'CANCELLED')
      ORDER BY rc.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Creates a response action
   */
  async createAction(caseId, data, userId) {
    const { action_type, description, priority, assigned_to } = data;
    const query = `
      INSERT INTO response_actions 
        (response_case_id, action_type, description, priority, assigned_to, created_by, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    const result = await pool.query(query, [caseId, action_type, description, priority, assigned_to, userId]);
    return result.rows[0];
  }

  /**
   * Transactional Resource Assignment (Safe Quantity Update)
   */
  async assignResource(caseId, resourceId, quantity, authorityId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Lock the row to prevent concurrent negative updates
      const checkRes = await client.query('SELECT available_quantity FROM resources WHERE id = $1 FOR UPDATE', [resourceId]);
      if (checkRes.rows.length === 0) throw new Error("Resource not found");
      
      const available = checkRes.rows[0].available_quantity;
      if (available < quantity) {
        throw new Error(`Insufficient resources. Available: ${available}`);
      }

      // Update quantity
      await client.query(
        'UPDATE resources SET available_quantity = available_quantity - $1, updated_at = NOW() WHERE id = $2', 
        [quantity, resourceId]
      );

      // Create Assignment record (linking to response case incident if available)
      const rc = await client.query('SELECT incident_id, location_id FROM response_cases WHERE id = $1', [caseId]);
      const incidentId = rc.rows[0]?.incident_id || null;
      const locationId = rc.rows[0]?.location_id || null;

      const assignQuery = `
        INSERT INTO resource_assignments 
          (resource_id, location_id, incident_id, assigned_quantity, assigned_by, status, notes)
        VALUES ($1, $2, $3, $4, $5, 'ASSIGNED', 'Assigned via Response Case')
        RETURNING *
      `;
      const assignment = await client.query(assignQuery, [resourceId, locationId, incidentId, quantity, authorityId]);

      await client.query('COMMIT');
      return assignment.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * Recommendations for Response Case
   */
  async getRecommendations(caseId) {
    // Simulated Rule-based AI Recommendation
    return [
      { type: 'RESOURCE', description: '2 ambulances are available nearby', reason: 'Medical support requested', source: 'RULE_BASED' },
      { type: 'SHELTER', description: 'Activate City High School Relief Center', reason: 'High population exposure', source: 'RULE_BASED' }
    ];
  }
}

module.exports = new ResponseService();
