require('dotenv').config();
const { pool } = require('./database');

const migrateIncidents = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log('Dropping old incident_reports table...');
    await client.query(`DROP TABLE IF EXISTS incident_reports CASCADE;`);
    
    console.log('Creating incidents table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS incidents (
        id SERIAL PRIMARY KEY,
        incident_code VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        hazard_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        status VARCHAR(50) DEFAULT 'OPEN',
        location_id INTEGER REFERENCES locations(id),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        started_at TIMESTAMP,
        ended_at TIMESTAMP,
        reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users(id),
        affected_population INTEGER CHECK (affected_population >= 0),
        estimated_population INTEGER CHECK (estimated_population >= 0),
        injured_count INTEGER CHECK (injured_count >= 0),
        fatality_count INTEGER CHECK (fatality_count >= 0),
        displaced_population INTEGER CHECK (displaced_population >= 0),
        shelters_used INTEGER CHECK (shelters_used >= 0),
        resources_deployed INTEGER CHECK (resources_deployed >= 0),
        response_start_time TIMESTAMP,
        response_end_time TIMESTAMP,
        estimated_damage DECIMAL(15, 2) CHECK (estimated_damage >= 0),
        damage_currency VARCHAR(10) DEFAULT 'USD',
        source_type VARCHAR(50) DEFAULT 'OFFICIAL_REPORT',
        data_confidence DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CHECK (response_end_time IS NULL OR response_start_time IS NULL OR response_end_time >= response_start_time),
        CHECK (ended_at IS NULL OR started_at IS NULL OR ended_at >= started_at)
      )
    `);

    console.log('Creating incident_timeline table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS incident_timeline (
        id SERIAL PRIMARY KEY,
        incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users(id),
        source_type VARCHAR(50) DEFAULT 'SYSTEM',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Creating incident_lessons table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS incident_lessons (
        id SERIAL PRIMARY KEY,
        incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
        observation TEXT NOT NULL,
        what_worked TEXT,
        what_failed TEXT,
        recommendation TEXT,
        priority VARCHAR(20) DEFAULT 'NORMAL',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Creating incident_evidence table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS incident_evidence (
        id SERIAL PRIMARY KEY,
        incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
        source_url VARCHAR(255),
        report_reference VARCHAR(150),
        note TEXT,
        source_type VARCHAR(50),
        uploaded_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_incidents_code ON incidents(incident_code)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_incidents_hazard ON incidents(hazard_type)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_incidents_started ON incidents(started_at)');

    await client.query('COMMIT');
    console.log('Step 15 Incident Migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in Step 15 Incident Migration:', err);
  } finally {
    client.release();
    process.exit();
  }
};

migrateIncidents();
