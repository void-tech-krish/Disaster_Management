const { pool } = require('./database');

const runMigration = async () => {
  try {
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'en'
    `);
    console.log('Migration successful: Added preferred_language to users.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
};

runMigration();
