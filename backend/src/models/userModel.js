const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

const createUser = async (name, email, password, role = 'Citizen', location = {}) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const { city, state, country, lat, lon } = location;
  const result = await pool.query(
    'INSERT INTO users (name, email, password, role, location_city, location_state, location_country, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, name, email, role, preferred_language, created_at, location_city, location_state, location_country, latitude, longitude',
    [name, email, hashedPassword, role, city, state, country, lat, lon]
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const findUserById = async (id) => {
  const result = await pool.query('SELECT id, name, email, role, preferred_language, created_at, location_city, location_state, location_country, latitude, longitude FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

const updateUserLanguage = async (id, language) => {
  const result = await pool.query(
    'UPDATE users SET preferred_language = $1 WHERE id = $2 RETURNING id, preferred_language',
    [language, id]
  );
  return result.rows[0];
};

const updateUserLocation = async (id, location) => {
  const { city, state, country, lat, lon } = location;
  const result = await pool.query(
    'UPDATE users SET location_city = $1, location_state = $2, location_country = $3, latitude = $4, longitude = $5 WHERE id = $6 RETURNING id, location_city, location_state, location_country, latitude, longitude',
    [city, state, country, lat, lon, id]
  );
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserLanguage,
  updateUserLocation,
};
