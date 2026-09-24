require('dotenv').config();
const { pool } = require('./database');

const migrateSystemHealth = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log('Dropping old system_health table...');
    await client.query(`DROP TABLE IF EXISTS system_health CASCADE;`);
    
    console.log('Creating system_health_checks table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_health_checks (
        id SERIAL PRIMARY KEY,
        service_name VARCHAR(100) UNIQUE NOT NULL,
        status VARCHAR(20) NOT NULL,
        checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_success_at TIMESTAMP,
        response_time_ms INTEGER,
        error_message TEXT,
        version VARCHAR(50),
        metadata JSONB
      )
    `);

    console.log('Creating system_health_events table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_health_events (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        service_name VARCHAR(100) NOT NULL,
        severity VARCHAR(20) DEFAULT 'WARNING',
        message TEXT NOT NULL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'ACTIVE',
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Creating data_source_status table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS data_source_status (
        id SERIAL PRIMARY KEY,
        source_name VARCHAR(100) UNIQUE NOT NULL,
        hazard_type VARCHAR(50),
        source_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'HEALTHY',
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_success TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        freshness_status VARCHAR(20) DEFAULT 'FRESH',
        record_count INTEGER,
        error_message TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_health_events_service ON system_health_events(service_name)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_health_events_type ON system_health_events(event_type)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_health_events_status ON system_health_events(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_data_sources_status ON data_source_status(status)');

    await client.query('COMMIT');
    console.log('Step 16 System Health Migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in Step 16 System Health Migration:', err);
  } finally {
    client.release();
    process.exit();
  }
};

migrateSystemHealth();
