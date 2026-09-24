const { pool } = require('./database');

const runMigration = async () => {
  try {
    await pool.query(`
      ALTER TABLE notifications 
      ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS hazard_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS severity VARCHAR(20),
      ADD COLUMN IF NOT EXISTS location_id INTEGER REFERENCES locations(id),
      ADD COLUMN IF NOT EXISTS source_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS notification_type VARCHAR(50)
    `);
    console.log('Migration successful: Added missing notification columns.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
};

runMigration();
