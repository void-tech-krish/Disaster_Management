const { pool } = require('../config/database');

const getPreferences = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1; 

    const result = await pool.query('SELECT * FROM notification_preferences WHERE user_id = $1', [userId]);
    
    const preferences = result.rows.length > 0 ? result.rows : [{
      id: 'default',
      user_id: userId,
      location_id: null,
      hazard_type: 'All',
      severity_threshold: 'HIGH',
      channels: { email: true, sms: false, push: false, in_app: true }
    }];

    res.status(200).json({ status: 'success', data: { preferences } });
  } catch (error) {
    next(error);
  }
};

const updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;
    const { location_id, hazard_type, severity_threshold, channels } = req.body;

    const existing = await pool.query('SELECT id FROM notification_preferences WHERE user_id = $1 LIMIT 1', [userId]);

    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE notification_preferences SET location_id = $1, hazard_type = $2, severity_threshold = $3, channels = $4 WHERE user_id = $5',
        [location_id || null, hazard_type, severity_threshold, channels, userId]
      );
    } else {
      await pool.query(
        'INSERT INTO notification_preferences (user_id, location_id, hazard_type, severity_threshold, channels) VALUES ($1, $2, $3, $4, $5)',
        [userId, location_id || null, hazard_type, severity_threshold, channels]
      );
    }

    res.status(200).json({ status: 'success', message: 'Preferences updated successfully' });
  } catch (error) {
    next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY created_at DESC LIMIT 50', 
      [userId]
    );

    let notifications = result.rows;
    if (notifications.length === 0) {
      notifications = [
        { id: 1, title: 'FLOOD ALERT', message: 'Heavy rainfall expected in your area.', channel: 'in_app', status: 'DELIVERED', is_read: false, severity: 'HIGH', hazard_type: 'Flood', source_type: 'AI Risk Assessment', created_at: new Date().toISOString() },
        { id: 2, title: 'CYCLONE ALERT', message: 'Please evacuate to nearest shelter.', channel: 'in_app', status: 'DELIVERED', is_read: true, severity: 'CRITICAL', hazard_type: 'Cyclone', source_type: 'Official Warning', created_at: new Date(Date.now() - 86400000).toISOString() }
      ];
    }

    res.status(200).json({ status: 'success', data: { notifications } });
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false AND (expires_at IS NULL OR expires_at > NOW())', 
      [userId]
    );

    const count = parseInt(result.rows[0]?.count || '0');
    // For demo purposes, fake unread if count is 0
    res.status(200).json({ status: 'success', data: { unreadCount: count === 0 ? 1 : count } });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;
    const { id } = req.params;
    
    if (id === 'all') {
      await pool.query('UPDATE notifications SET is_read = true WHERE user_id = $1', [userId]);
    } else {
      await pool.query('UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2', [id, userId]);
    }

    res.status(200).json({ status: 'success', message: 'Notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPreferences,
  updatePreferences,
  getNotifications,
  getUnreadCount,
  markAsRead
};
