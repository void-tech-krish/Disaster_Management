require('dotenv').config();
const { pool } = require('./database');

const migrate = async () => {
  const client = await pool.connect();
  try {
    console.log('Starting data sources migration...');
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS data_sources (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        provider VARCHAR(100),
        source_type VARCHAR(50) NOT NULL,
        description TEXT,
        hazard_types JSONB,
        endpoint_reference VARCHAR(255),
        update_interval_minutes INTEGER DEFAULT 60,
        freshness_threshold_minutes INTEGER DEFAULT 120,
        enabled BOOLEAN DEFAULT true,
        status VARCHAR(20) DEFAULT 'UNKNOWN',
        last_success_at TIMESTAMP,
        last_attempt_at TIMESTAMP,
        last_error TEXT,
        record_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS data_ingestion_logs (
        id SERIAL PRIMARY KEY,
        data_source_id INTEGER REFERENCES data_sources(id) ON DELETE CASCADE,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        status VARCHAR(20) NOT NULL,
        records_received INTEGER DEFAULT 0,
        records_valid INTEGER DEFAULT 0,
        records_rejected INTEGER DEFAULT 0,
        error_message TEXT,
        request_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default sources if they don't exist
    await client.query(`
      INSERT INTO data_sources (name, provider, source_type, description, hazard_types, endpoint_reference, update_interval_minutes, freshness_threshold_minutes)
      SELECT 'OpenMeteo Weather API', 'OpenMeteo', 'WEATHER', 'Live weather conditions', '["Flood", "Heatwave", "Drought", "Landslide"]', 'https://api.open-meteo.com/v1/forecast', 60, 180
      WHERE NOT EXISTS (SELECT 1 FROM data_sources WHERE name = 'OpenMeteo Weather API')
    `);

    await client.query(`
      INSERT INTO data_sources (name, provider, source_type, description, hazard_types, endpoint_reference, update_interval_minutes, freshness_threshold_minutes)
      SELECT 'Gov Official Alerts', 'GDACS / NDM', 'OFFICIAL', 'Government issued official warnings', '["Flood", "Heatwave", "Drought", "Landslide", "Cyclone", "Earthquake"]', 'env:OFFICIAL_WARNING_API_URL', 15, 60
      WHERE NOT EXISTS (SELECT 1 FROM data_sources WHERE name = 'Gov Official Alerts')
    `);

    await client.query('COMMIT');
    console.log('Migration successful.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', e);
  } finally {
    client.release();
    pool.end();
  }
};

migrate();
