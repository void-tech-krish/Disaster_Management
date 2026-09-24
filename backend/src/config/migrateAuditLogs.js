require('dotenv').config();
const { pool } = require('./database');

const migrateAuditLogs = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log('Dropping old audit_logs table (if it exists in dummy form)...');
    await client.query(`DROP TABLE IF EXISTS audit_logs CASCADE;`);
    
    console.log('Creating robust audit_logs table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        actor_type VARCHAR(20) NOT NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id VARCHAR(100),
        description TEXT,
        old_values JSONB,
        new_values JSONB,
        metadata JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        request_id VARCHAR(100),
        source VARCHAR(50) DEFAULT 'API',
        status VARCHAR(20) NOT NULL,
        failure_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Indexes for fast paginated and filtered queries
    await client.query('CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at DESC)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_audit_entity_type ON audit_logs(entity_type)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_audit_entity_id ON audit_logs(entity_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_audit_status ON audit_logs(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_audit_request_id ON audit_logs(request_id)');

    await client.query('COMMIT');
    console.log('Step 17 Audit Logs Migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in Step 17 Audit Logs Migration:', err);
  } finally {
    client.release();
    process.exit();
  }
};

migrateAuditLogs();
