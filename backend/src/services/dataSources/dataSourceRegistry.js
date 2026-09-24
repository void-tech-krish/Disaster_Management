const { pool } = require('../../config/database');

class DataSourceRegistry {
  async getAllSources() {
    try {
      const result = await pool.query('SELECT * FROM data_sources ORDER BY id ASC');
      return result.rows;
    } catch (e) {
      console.error('Error fetching data sources', e);
      return [];
    }
  }

  async getSourceById(id) {
    try {
      const result = await pool.query('SELECT * FROM data_sources WHERE id = $1', [id]);
      return result.rows[0];
    } catch (e) {
      return null;
    }
  }

  async getSourceByName(name) {
    try {
      const result = await pool.query('SELECT * FROM data_sources WHERE name = $1', [name]);
      return result.rows[0];
    } catch (e) {
      return null;
    }
  }

  async updateSourceStatus(id, status, isSuccess, errorMsg = null, recordCount = 0) {
    try {
      let query = `
        UPDATE data_sources 
        SET status = $1, 
            last_attempt_at = NOW(), 
            last_error = $2,
            updated_at = NOW()
      `;
      let params = [status, errorMsg];
      
      if (isSuccess) {
        query += `, last_success_at = NOW(), record_count = $3`;
        params.push(recordCount);
      }
      
      query += ` WHERE id = $${params.length + 1}`;
      params.push(id);
      
      await pool.query(query, params);
    } catch (e) {
      console.error('Failed to update source status', e);
    }
  }

  async logIngestion(sourceId, status, received, valid, rejected, errorMsg) {
    try {
      await pool.query(`
        INSERT INTO data_ingestion_logs 
        (data_source_id, status, records_received, records_valid, records_rejected, error_message, completed_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `, [sourceId, status, received, valid, rejected, errorMsg]);
    } catch (e) {
      console.error('Failed to log ingestion', e);
    }
  }
}

module.exports = new DataSourceRegistry();
