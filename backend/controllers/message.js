const Message = require('../models/Message');
const Listing = require('../models/listing');
const User = require('../models/user');

exports.sendMessage = async (req, res) => {
  try {
    const { listingId, recipientId, message } = req.body;
    const senderId = req.user._id;

    if (!listingId || !recipientId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Listing ID, recipient ID, and message are required'
      });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    if (senderId.toString() === recipientId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself'
      });
    }

    const newMessage = new Message({
      sender: senderId,
      recipient: recipientId,
      listing: listingId,
      message: message.trim()
    });

    await newMessage.save();

    await newMessage.populate([
      { path: 'sender', select: 'username email' },
      { path: 'recipient', select: 'username email' },
      { path: 'listing', select: 'title image location' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

exports.getListingMessages = async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user._id;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    const messages = await Message.find({
      listing: listingId,
      $or: [
        { sender: userId },
        { recipient: userId }
      ]
    })
      .populate('sender', 'username email')
      .populate('recipient', 'username email')
      .populate('listing', 'title image location')
      .sort({ createdAt: 1 });

    const updateResult = await Message.updateMany(
      {
        listing: listingId,
        recipient: userId,
        isRead: false
      },
      { isRead: true }
    );

    if (updateResult.modifiedCount > 0) {
      const io = req.app.get('io');
      if (io) {
        const messageNamespace = io.of('/messages');
        messageNamespace.to(`user-${userId}`).emit('messages:read:confirm', {
          userId: userId.toString(),
          listingId,
          modifiedCount: updateResult.modifiedCount
        });
      }
    }

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: userId },
        { recipient: userId }
      ]
    })
      .populate('sender', 'username email')
      .populate('recipient', 'username email')
      .populate('listing', 'title image location owner')
      .sort({ createdAt: -1 });

    const conversationsMap = new Map();

    messages.forEach(msg => {
      if (!msg.listing) return;

      const listingId = msg.listing._id.toString();
      const otherUserId = msg.sender._id.toString() === userId.toString()
        ? msg.recipient._id
        : msg.sender._id;

      const key = `${listingId}-${otherUserId}`;

      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          listing: msg.listing,
          otherUser: msg.sender._id.toString() === userId.toString() ? msg.recipient : msg.sender,
          lastMessage: msg.message,
          lastMessageDate: msg.createdAt,
          isRead: msg.recipient._id.toString() === userId.toString() ? msg.isRead : true,
          unreadCount: 0
        });
      }

      if (msg.recipient._id.toString() === userId.toString() && !msg.isRead) {
        const conv = conversationsMap.get(key);
        conv.unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        recipient: userId
      },
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOneAndDelete({
      _id: messageId,
      sender: userId
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you are not authorized to delete it'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Message.countDocuments({
      recipient: userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
};

exports.getRecentUnreadMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 5;

    const messages = await Message.find({
      recipient: userId,
      isRead: false
    })
      .populate('sender', 'username email')
      .populate('listing', 'title image')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching unread messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread messages',
      error: error.message
    });
  }
};

exports.markConversationAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    const userId = req.user._id;

    const result = await Message.updateMany(
      {
        recipient: userId,
        sender: senderId,
        isRead: false
      },
      { isRead: true }
    );

    const io = req.app.get('io');
    if (io) {
      const messageNamespace = io.of('/messages');
      messageNamespace.to(`user-${userId}`).emit('messages:read:confirm', {
        userId: userId.toString(),
        senderId,
        modifiedCount: result.modifiedCount
      });
    }

    res.status(200).json({
      success: true,
      message: 'Conversation marked as read',
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark conversation as read',
      error: error.message
    });
  }
};

exports.markMessagesAsRead = async (req, res) => {
  try {
    const { messageIds, senderId, listingId } = req.body;
    const userId = req.user._id;

    let query = {
      recipient: userId,
      isRead: false
    };

    if (messageIds && Array.isArray(messageIds) && messageIds.length > 0) {
      query._id = { $in: messageIds };
    }

    else if (senderId) {
      query.sender = senderId;
    }

    else if (listingId) {
      query.listing = listingId;
    }

    const result = await Message.updateMany(query, { isRead: true });

    const io = req.app.get('io');
    if (io) {
      const messageNamespace = io.of('/messages');
      messageNamespace.to(`user-${userId}`).emit('messages:read:confirm', {
        userId: userId.toString(),
        senderId,
        listingId,
        modifiedCount: result.modifiedCount
      });
    }

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
};
