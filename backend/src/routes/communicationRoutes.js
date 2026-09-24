const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get active communications
router.get('/', protect, authorize('Authority', 'Admin'), async (req, res, next) => {
  try {
    const query = `SELECT * FROM emergency_communications ORDER BY created_at DESC LIMIT 50`;
    const result = await pool.query(query);
    res.status(200).json({ status: 'success', data: result.rows });
  } catch (error) {
    next(error);
  }
});

// Preview Communication
router.post('/preview', protect, authorize('Authority', 'Admin'), async (req, res, next) => {
  try {
    const { title, message, target_audience } = req.body;
    // Format preview exactly as it will appear
    const preview = `[${target_audience || 'ALL'}] ${title}\n\n${message}\n\n-- Authority Decision`;
    res.status(200).json({ status: 'success', data: { preview } });
  } catch (error) {
    next(error);
  }
});

// Send Communication
router.post('/send', protect, authorize('Authority', 'Admin'), async (req, res, next) => {
  try {
    const { response_case_id, title, message, hazard_type, location_id, severity, target_audience } = req.body;

    const query = `
      INSERT INTO emergency_communications 
        (response_case_id, title, message, hazard_type, location_id, severity, target_audience, created_by, sent_at, delivery_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), 'SENT')
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      response_case_id || null, title, message, hazard_type, location_id || null, severity, target_audience, req.user.id
    ]);

    const communication = result.rows[0];

    // Emit to dashboard
    const io = req.app.get('io');
    if (io) io.emit('communication:sent', communication);

    res.status(201).json({ status: 'success', data: communication });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
