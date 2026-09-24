const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

const createUser = async (name, email, password, role = 'Citizen') => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, preferred_language, created_at',
    [name, email, hashedPassword, role]
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const findUserById = async (id) => {
  const result = await pool.query('SELECT id, name, email, role, preferred_language, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

const updateUserLanguage = async (id, language) => {
  const result = await pool.query(
    'UPDATE users SET preferred_language = $1 WHERE id = $2 RETURNING id, preferred_language',
    [language, id]
  );
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserLanguage,
};
