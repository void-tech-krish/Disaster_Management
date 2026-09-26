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

const getStates = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM states ORDER BY name ASC');
    res.status(200).json({ status: 'success', data: { states: result.rows } });
  } catch (err) { next(err); }
};

const getCitiesByState = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM cities WHERE state_id = $1 ORDER BY name ASC', [req.params.stateId]);
    res.status(200).json({ status: 'success', data: { cities: result.rows } });
  } catch (err) { next(err); }
};

const getCity = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM cities WHERE id = $1', [req.params.cityId]);
    if (!result.rows.length) return res.status(404).json({ status: 'error', message: 'City not found' });
    res.status(200).json({ status: 'success', data: { city: result.rows[0] } });
  } catch (err) { next(err); }
};

const getReliefCampsByCity = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM relief_camps WHERE city_id = $1 ORDER BY name ASC', [req.params.cityId]);
    res.status(200).json({ status: 'success', data: { relief_camps: result.rows } });
  } catch (err) { next(err); }
};

const getReliefCamp = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM relief_camps WHERE id = $1', [req.params.campId]);
    if (!result.rows.length) return res.status(404).json({ status: 'error', message: 'Camp not found' });
    res.status(200).json({ status: 'success', data: { relief_camp: result.rows[0] } });
  } catch (err) { next(err); }
};

const getNearbyReliefCamps = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ status: 'error', message: 'lat and lng required' });
    
    // Distance calculation using Haversine formula directly in SQL or PostGIS.
    // We'll use simple math for distance in km since it's just lat/lng columns.
    const result = await pool.query(`
      SELECT *, 
      ( 6371 * acos( cos( radians($1) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians($2) ) + sin( radians($1) ) * sin( radians( latitude ) ) ) ) AS distance 
      FROM relief_camps 
      ORDER BY distance ASC LIMIT 10
    `, [lat, lng]);
    
    res.status(200).json({ status: 'success', data: { relief_camps: result.rows } });
  } catch (err) { next(err); }
};

module.exports = {
  getAllLocations,
  getLocationProfile,
  getStates,
  getCitiesByState,
  getCity,
  getReliefCampsByCity,
  getReliefCamp,
  getNearbyReliefCamps
};
