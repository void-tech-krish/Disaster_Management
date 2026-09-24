const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

const seedData = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Seeding Users...');
    const hashedAdminPw = await bcrypt.hash('admin123', 10);
    const hashedAuthPw = await bcrypt.hash('auth123', 10);
    const hashedCitPw = await bcrypt.hash('cit123', 10);
    
    await client.query(`
      INSERT INTO users (name, email, password, role)
      VALUES 
        ('Admin User', 'admin@disasterguard.in', $1, 'Admin'),
        ('Authority Officer', 'auth@disasterguard.in', $2, 'Authority'),
        ('Citizen John', 'citizen@example.com', $3, 'Citizen')
      ON CONFLICT (email) DO NOTHING;
    `, [hashedAdminPw, hashedAuthPw, hashedCitPw]);

    console.log('Seeding Locations...');
    // Note: ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
    const locations = [
      { name: 'Vijayawada', lat: 16.5062, lon: 80.6480, region: 'Andhra Pradesh', type: 'City' },
      { name: 'Mumbai', lat: 19.0760, lon: 72.8777, region: 'Maharashtra', type: 'City' },
      { name: 'Dehradun', lat: 30.3165, lon: 78.0322, region: 'Uttarakhand', type: 'City' }
    ];

    for (const loc of locations) {
      await client.query(`
        INSERT INTO locations (name, region, type, geom)
        VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326))
      `, [loc.name, loc.region, loc.type, loc.lon, loc.lat]);
    }

    // Add some sample Hazards
    await client.query(`
      INSERT INTO hazards (type, description)
      VALUES 
        ('Flood', 'Overflow of water that submerges land that is usually dry.'),
        ('Landslide', 'The movement of a mass of rock, debris, or earth down a slope.')
      ON CONFLICT DO NOTHING;
    `);

    await client.query('COMMIT');
    console.log('Database seeded successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', err);
  } finally {
    client.release();
    process.exit(0);
  }
};

seedData();
