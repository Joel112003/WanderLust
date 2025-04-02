const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification');
const { isLoggedIn } = require('../middleware');

// All notification routes require authentication
router.use(isLoggedIn);

// Get all notifications for the current user
router.get('/', notificationController.getUserNotifications);

// Get unread notification count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark all notifications as read
router.put('/mark-all-read', notificationController.markAllAsRead);

// Mark a specific notification as read
router.put('/:id/read', notificationController.markAsRead);

// Delete a notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
