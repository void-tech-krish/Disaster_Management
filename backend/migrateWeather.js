require('dotenv').config();
const { pool } = require('./src/config/database');

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS location_city VARCHAR(255),
      ADD COLUMN IF NOT EXISTS location_state VARCHAR(255),
      ADD COLUMN IF NOT EXISTS location_country VARCHAR(255),
      ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
    `);
    console.log('Migration successful: added location fields to users table.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    pool.end();
  }
}

migrate();
