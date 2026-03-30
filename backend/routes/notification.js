const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification');
const { isAuthenticated } = require('../middleware');

router.use(isAuthenticated);

router.get('/', notificationController.getUserNotifications);

router.get('/unread-count', notificationController.getUnreadCount);

router.put('/mark-all-read', notificationController.markAllAsRead);

router.put('/:id/read', notificationController.markAsRead);

router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
