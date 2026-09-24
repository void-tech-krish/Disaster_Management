require('dotenv').config();
const { pool } = require('./database');

const migrateGIS = async () => {
  const client = await pool.connect();
  try {
    console.log('Starting GIS migrations...');
    await client.query('BEGIN');

    // Enable PostGIS Extension
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('PostGIS extension verified.');

    // Create risk_zones table
    await client.query(`
      CREATE TABLE IF NOT EXISTS risk_zones (
        id SERIAL PRIMARY KEY,
        hazard_type VARCHAR(50) NOT NULL,
        risk_level VARCHAR(20) NOT NULL,
        risk_score INTEGER,
        geometry GEOMETRY(Polygon, 4326) NOT NULL,
        location_id INTEGER REFERENCES locations(id),
        source_type VARCHAR(50) DEFAULT 'AI RISK ASSESSMENT',
        confidence DECIMAL(3,2),
        model_version VARCHAR(50),
        valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        valid_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create GIST index for risk_zones
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_risk_zones_geom 
      ON risk_zones USING GIST (geometry);
    `);

    // Create official_warning_areas table
    await client.query(`
      CREATE TABLE IF NOT EXISTS official_warning_areas (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        hazard_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        geometry GEOMETRY(Polygon, 4326) NOT NULL,
        source VARCHAR(100) DEFAULT 'OFFICIAL',
        valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        valid_until TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_official_warnings_geom 
      ON official_warning_areas USING GIST (geometry);
    `);

    // Create historical_events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS historical_events (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20),
        event_date TIMESTAMP NOT NULL,
        geometry GEOMETRY(Geometry, 4326) NOT NULL,
        source VARCHAR(100) DEFAULT 'HISTORICAL DATA',
        impact_summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_historical_events_geom 
      ON historical_events USING GIST (geometry);
    `);

    // Create population_zones table for spatial analysis
    await client.query(`
      CREATE TABLE IF NOT EXISTS population_zones (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        population_count INTEGER NOT NULL,
        geometry GEOMETRY(Polygon, 4326) NOT NULL,
        source VARCHAR(100) DEFAULT 'ESTIMATED',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_population_zones_geom 
      ON population_zones USING GIST (geometry);
    `);

    await client.query('COMMIT');
    console.log('GIS migrations completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during GIS migration:', error);
  } finally {
    client.release();
    pool.end();
  }
};

migrateGIS();
