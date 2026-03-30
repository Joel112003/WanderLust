const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message');
const { isAuthenticated } = require('../middleware');

router.use(isAuthenticated);

router.post('/', messageController.sendMessage);

router.get('/conversations', messageController.getConversations);

router.get('/unread/count', messageController.getUnreadCount);

router.get('/unread/recent', messageController.getRecentUnreadMessages);

router.get('/listing/:listingId', messageController.getListingMessages);

router.post('/read', messageController.markMessagesAsRead);

router.put('/:messageId/read', messageController.markAsRead);

router.put('/conversation/:senderId/read', messageController.markConversationAsRead);

router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;
