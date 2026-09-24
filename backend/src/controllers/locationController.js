const { pool } = require('../config/database');

const getAllLocations = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        name, 
        region, 
        type, 
        ST_X(geom) as lon, 
        ST_Y(geom) as lat 
      FROM locations
    `);
    
    res.status(200).json({
      status: 'success',
      data: {
        locations: result.rows
      }
    });
  } catch (err) {
    next(err);
  }
};

const getLocationProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Fetch location details
    const result = await pool.query(`
      SELECT 
        id, 
        name, 
        region, 
        type, 
        ST_X(geom) as lon, 
        ST_Y(geom) as lat 
      FROM locations
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Location not found' });
    }

    const location = result.rows[0];

    // Demo geographic factors
    const geographicFactors = {
      elevation: '120m',
      slope: '15 degrees',
      river_distance: '1.2 km',
      coast_distance: '65 km',
      rainfall: 'Average',
      temperature: 'Moderate'
    };

    // Demo hazard profile
    const hazardProfile = {
      Flood: 'HIGH',
      Landslide: 'LOW',
      Earthquake: 'HIGH',
      Heatwave: 'MODERATE'
    };

    res.status(200).json({
      status: 'success',
      data: {
        location,
        geographicFactors,
        hazardProfile
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllLocations,
  getLocationProfile
};
