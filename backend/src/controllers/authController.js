const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const { createAuditLog } = require('../services/audit.service');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'your_jwt_secret_key',
    { expiresIn: '24h' }
  );
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'User already exists' });
    }

    const user = await User.createUser(name, email, password, role || 'Citizen');
    const token = generateToken(user);
    
    await createAuditLog({
      actor: { id: user.id, role: user.role },
      action: 'AUTH_REGISTER',
      entityType: 'USER',
      entityId: user.id.toString(),
      description: 'User registered successfully',
      req
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        token,
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findUserByEmail(email);
    
    if (!user) {
      await createAuditLog({ action: 'AUTH_LOGIN_FAILED', description: 'Invalid email or password (user not found)', req, status: 'FAILED' });
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await createAuditLog({ actor: { id: user.id, role: user.role }, action: 'AUTH_LOGIN_FAILED', description: 'Invalid email or password (password mismatch)', req, status: 'FAILED' });
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const { password: _, ...userData } = user; // Exclude password from response

    await createAuditLog({
      actor: { id: user.id, role: user.role },
      action: 'AUTH_LOGIN',
      description: 'User logged in successfully',
      req
    });

    res.status(200).json({
      status: 'success',
      data: {
        token,
        user: userData
      }
    });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
};

const getUserLanguage = async (req, res, next) => {
  try {
    const user = await User.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.status(200).json({ success: true, language: user.preferred_language || 'en' });
  } catch (err) {
    next(err);
  }
};

const updateUserLanguage = async (req, res, next) => {
  try {
    const { language } = req.body;
    const supportedLanguages = ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'or', 'as'];
    
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({ success: false, message: 'Invalid language code' });
    }

    const updatedUser = await User.updateUserLanguage(req.user.id, language);
    if (!updatedUser) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.status(200).json({ success: true, language: updatedUser.preferred_language });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getUserLanguage,
  updateUserLanguage
};
