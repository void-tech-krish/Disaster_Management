const { pool } = require('../../config/database');
const dataSourceService = require('../dataSources/dataSourceService');

class OfficialAlertService {
  async getOfficialAlerts(locationId) {
    try {
      // Here we might query a live government API if configured
      if (process.env.OFFICIAL_WARNING_API_URL) {
         // Perform fetch...
         await dataSourceService.processIngestion('Gov Official Alerts', { hazard_type: 'Unknown', message: 'Test' });
      }

      let query = `
        SELECT 
          id, hazard_type, source, severity, message, issued_at, valid_until
        FROM official_alerts 
        WHERE valid_until > NOW()
      `;
      const params = [];
      
      if (locationId) {
        query += ` AND location_id = $1`;
        params.push(locationId);
      }

      const result = await pool.query(query, params);
      
      return result.rows.map(row => ({
        ...row,
        status: 'OFFICIAL WARNING',
        is_live: true
      }));

    } catch (error) {
      console.error('Official Alert Service Error:', error);
      await dataSourceService.processIngestion('Gov Official Alerts', {}); // log failure
      return [];
    }
  }
}

module.exports = new OfficialAlertService();
