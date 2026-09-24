const { pool } = require('../config/database');

const getNearbyShelters = async (req, res, next) => {
  try {
    const { lat, lon, radius = 50000 } = req.query; // default 50km radius

    let query = `
      SELECT 
        id, 
        name, 
        capacity, 
        occupancy,
        (capacity - occupancy) as available,
        type,
        medical_support,
        accessibility_status,
        ST_X(geom) as lon, 
        ST_Y(geom) as lat
    `;
    
    const params = [];

    if (lat && lon) {
      // Calculate distance in meters using PostGIS ST_DistanceSphere
      query += `, ST_DistanceSphere(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) as distance_meters
        FROM shelters
        WHERE ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
        ORDER BY distance_meters ASC
      `;
      params.push(lon, lat, radius);
    } else {
      query += ` FROM shelters `;
    }

    const result = await pool.query(query, params);

    res.status(200).json({
      status: 'success',
      data: {
        shelters: result.rows
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNearbyShelters
};
