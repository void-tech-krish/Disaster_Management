const { pool } = require('../config/database');

class ResponseIntelligenceService {
  /**
   * Generates intelligence payload for a response case
   */
  async getIntelligence(caseId) {
    const rcQuery = `SELECT * FROM response_cases WHERE id = $1`;
    const rcResult = await pool.query(rcQuery, [caseId]);
    if (rcResult.rows.length === 0) throw new Error("Response case not found");
    const responseCase = rcResult.rows[0];

    // Simulated Intelligence Data (In a real system, this queries ML / GIS / PostGIS)
    const riskContext = {
      level: responseCase.severity,
      factors: [
        `${responseCase.severity} ${responseCase.hazard_type} RISK`,
        "HIGH POPULATION EXPOSURE",
        "LIMITED SHELTER CAPACITY"
      ],
      dataFreshness: 'FRESH'
    };

    const impact = {
      populationAtRisk: "18,500 ESTIMATED",
      nearestShelterDistance: "2.1 km",
      shelterCapacity: "LIMITED"
    };

    // Evaluate information gaps
    const informationGaps = [
      { type: "DATA_STALE", description: "Shelter capacity not updated in 24h", severity: "MODERATE" },
      { type: "DATA_UNKNOWN", description: "Road status unknown in affected zone", severity: "HIGH" }
    ];

    // Evaluate resource gaps
    const resourceGaps = [
      { resource: "RESCUE TEAM", required: 5, available: 3, assigned: 2, remaining: 3, source: "ESTIMATED" },
      { resource: "AMBULANCE", required: 10, available: 4, assigned: 0, remaining: 10, source: "ESTIMATED" }
    ];

    // Generate response recommendations
    let recommendations = [];
    const recQuery = `SELECT * FROM response_recommendations WHERE response_case_id = $1 ORDER BY created_at DESC`;
    const recResult = await pool.query(recQuery, [caseId]);
    
    if (recResult.rows.length === 0) {
      // Create initial recommendations if none exist
      const insertRec = `
        INSERT INTO response_recommendations (response_case_id, type, title, description, reason, priority)
        VALUES 
        ($1, 'ACTION', 'Check shelter capacity', 'Contact City High School Relief Center to verify capacity', 'Population exposure is high and current shelter capacity data is stale.', 'HIGH'),
        ($1, 'RESOURCE', 'Assign 2 Ambulances', 'Deploy 2 ambulances to the affected zone', 'Medical support requested due to critical severity.', 'CRITICAL')
        RETURNING *
      `;
      const inserted = await pool.query(insertRec, [caseId]);
      recommendations = inserted.rows;
    } else {
      recommendations = recResult.rows;
    }

    return {
      responseStatus: responseCase.status,
      riskContext,
      impact,
      informationGaps,
      resourceGaps,
      recommendations
    };
  }

  /**
   * Approves a recommendation
   */
  async approveRecommendation(caseId, recId, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const updateRec = `
        UPDATE response_recommendations 
        SET status = 'APPROVED', updated_at = NOW() 
        WHERE id = $1 AND response_case_id = $2
        RETURNING *
      `;
      const rec = await client.query(updateRec, [recId, caseId]);
      if (rec.rows.length === 0) throw new Error("Recommendation not found");

      const insertApp = `
        INSERT INTO response_approvals (recommendation_id, approved_by, status, reason)
        VALUES ($1, $2, 'APPROVED', 'Authority Decision')
        RETURNING *
      `;
      await client.query(insertApp, [recId, userId]);

      await client.query('COMMIT');
      return rec.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * Rejects a recommendation
   */
  async rejectRecommendation(caseId, recId, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const updateRec = `
        UPDATE response_recommendations 
        SET status = 'REJECTED', updated_at = NOW() 
        WHERE id = $1 AND response_case_id = $2
        RETURNING *
      `;
      const rec = await client.query(updateRec, [recId, caseId]);
      if (rec.rows.length === 0) throw new Error("Recommendation not found");

      const insertApp = `
        INSERT INTO response_approvals (recommendation_id, approved_by, status, reason)
        VALUES ($1, $2, 'REJECTED', 'Authority Decision')
        RETURNING *
      `;
      await client.query(insertApp, [recId, userId]);

      await client.query('COMMIT');
      return rec.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

module.exports = new ResponseIntelligenceService();
