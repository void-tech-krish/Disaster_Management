const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// In a real app, these would be protected by authenticateToken middleware
router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.post('/read/:id', notificationController.markAsRead);
router.get('/preferences', notificationController.getPreferences);
router.post('/preferences', notificationController.updatePreferences);

module.exports = router;
