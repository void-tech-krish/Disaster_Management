const { pool } = require('./database');

const runMigration = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Rename type to resource_type if it hasn't been renamed yet
    try {
      await client.query(`ALTER TABLE resources RENAME COLUMN type TO resource_type;`);
    } catch (e) {
      // Column might already be renamed or doesn't exist
      console.log('Column type might already be renamed or does not exist.', e.message);
    }

    // Add new columns to resources
    await client.query(`
      ALTER TABLE resources 
      ADD COLUMN IF NOT EXISTS name VARCHAR(150),
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS available_quantity INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS unit VARCHAR(50),
      ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
      ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
      ADD COLUMN IF NOT EXISTS location_id INTEGER REFERENCES locations(id),
      ADD COLUMN IF NOT EXISTS organization VARCHAR(150),
      ADD COLUMN IF NOT EXISTS contact_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'NORMAL',
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    // Backfill available_quantity if null
    await client.query(`UPDATE resources SET available_quantity = quantity WHERE available_quantity IS NULL OR available_quantity = 0;`);
    await client.query(`UPDATE resources SET name = resource_type WHERE name IS NULL;`);
    
    // Create resource_assignments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS resource_assignments (
        id SERIAL PRIMARY KEY,
        resource_id INTEGER REFERENCES resources(id),
        location_id INTEGER REFERENCES locations(id),
        incident_id INTEGER,
        assigned_quantity INTEGER NOT NULL,
        assigned_by INTEGER REFERENCES users(id),
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'ASSIGNED',
        notes TEXT
      )
    `);

    // Create resource_history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS resource_history (
        id SERIAL PRIMARY KEY,
        resource_id INTEGER REFERENCES resources(id),
        action VARCHAR(100) NOT NULL,
        previous_status VARCHAR(50),
        new_status VARCHAR(50),
        previous_quantity INTEGER,
        new_quantity INTEGER,
        changed_by INTEGER REFERENCES users(id),
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT
      )
    `);

    await client.query('COMMIT');
    console.log('Migration successful: Resources architecture initialized.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    client.release();
    process.exit(0);
  }
};

runMigration();
