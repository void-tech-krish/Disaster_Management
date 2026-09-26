const { pool } = require('../config/database');

const seedRiskZones = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Seeding DEMO Risk Zones...');
    
    // Clear existing risk zones to prevent duplicates during testing
    await client.query('DELETE FROM risk_zones WHERE source_type = $1', ['DEMO']);

    const riskZones = [
      {
        hazard_type: 'Flood',
        risk_level: 'CRITICAL',
        risk_score: 82,
        source_type: 'DEMO',
        confidence: 0.92,
        model_version: 'v1.0.demo',
        // Vijayawada
        lon: 80.6480,
        lat: 16.5062,
        radius: 0.1 // degrees
      },
      {
        hazard_type: 'Flood',
        risk_level: 'HIGH',
        risk_score: 75,
        source_type: 'DEMO',
        confidence: 0.88,
        model_version: 'v1.0.demo',
        // Mumbai
        lon: 72.8777,
        lat: 19.0760,
        radius: 0.15
      },
      {
        hazard_type: 'Landslide',
        risk_level: 'HIGH',
        risk_score: 78,
        source_type: 'DEMO',
        confidence: 0.85,
        model_version: 'v1.0.demo',
        // Dehradun
        lon: 78.0322,
        lat: 30.3165,
        radius: 0.08
      },
      {
        hazard_type: 'Earthquake',
        risk_level: 'MODERATE',
        risk_score: 60,
        source_type: 'DEMO',
        confidence: 0.70,
        model_version: 'v1.0.demo',
        // Delhi
        lon: 77.2090,
        lat: 28.6139,
        radius: 0.2
      },
      {
        hazard_type: 'Cyclone',
        risk_level: 'HIGH',
        risk_score: 72,
        source_type: 'DEMO',
        confidence: 0.82,
        model_version: 'v1.0.demo',
        // Chennai (Adding Chennai for Cyclone)
        lon: 80.2707,
        lat: 13.0827,
        radius: 0.12
      }
    ];

    for (const zone of riskZones) {
      await client.query(`
        INSERT INTO risk_zones (hazard_type, risk_level, risk_score, source_type, confidence, model_version, geometry)
        VALUES ($1, $2, $3, $4, $5, $6, ST_Buffer(ST_SetSRID(ST_MakePoint($7, $8), 4326), $9))
      `, [
        zone.hazard_type,
        zone.risk_level,
        zone.risk_score,
        zone.source_type,
        zone.confidence,
        zone.model_version,
        zone.lon,
        zone.lat,
        zone.radius
      ]);
    }

    await client.query('COMMIT');
    console.log('DEMO Risk zones seeded successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding demo risk zones:', err);
  } finally {
    client.release();
    process.exit(0);
  }
};

seedRiskZones();
