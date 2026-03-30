const Message = require('../models/Message');
const User = require('../models/user');
const Listing = require('../models/listing');

const activeUsers = new Map();

const userRooms = new Map();

const getRoomId = (listingId, userId1, userId2) => {
  const sortedUsers = [userId1, userId2].sort();
  return `listing-${listingId}-${sortedUsers[0]}-${sortedUsers[1]}`;
};

const initializeMessageSocket = (io) => {

  const messageNamespace = io.of('/messages');

  messageNamespace.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    socket.on('register', async (data) => {
      try {
        const { userId } = data;

        if (!userId) {
          socket.emit('error', { message: 'User ID is required' });
          return;
        }

        activeUsers.set(userId, socket.id);
        socket.userId = userId;

        socket.join(`user-${userId}`);

        console.log(`[Socket] User registered: ${userId} with socket ${socket.id}`);

        const messages = await Message.find({
          $or: [
            { sender: userId },
            { recipient: userId }
          ]
        }).distinct('listing');

        const rooms = new Set();
        for (const listingId of messages) {
          const listing = await Listing.findById(listingId);
          if (listing) {

            const userMessages = await Message.findOne({
              listing: listingId,
              $or: [
                { sender: userId, recipient: { $ne: userId } },
                { recipient: userId, sender: { $ne: userId } }
              ]
            });

            if (userMessages) {
              const otherUserId = userMessages.sender.toString() === userId
                ? userMessages.recipient.toString()
                : userMessages.sender.toString();

              const roomId = getRoomId(listingId, userId, otherUserId);
              socket.join(roomId);
              rooms.add(roomId);
              console.log(`[Socket] User ${userId} joined room: ${roomId}`);
            }
          }
        }

        userRooms.set(userId, rooms);

        rooms.forEach(roomId => {
          messageNamespace.to(roomId).emit('user:online', { userId });
        });

        socket.emit('registered', {
          userId,
          socketId: socket.id,
          rooms: Array.from(rooms)
        });

      } catch (error) {
        console.error('[Socket] Registration error:', error);
        socket.emit('error', { message: 'Registration failed', error: error.message });
      }
    });

    socket.on('join:room', async (data) => {
      try {
        const { listingId, otherUserId } = data;
        const userId = socket.userId;

        if (!userId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        if (!listingId || !otherUserId) {
          socket.emit('error', { message: 'Listing ID and other user ID are required' });
          return;
        }

        const roomId = getRoomId(listingId, userId, otherUserId);
        socket.join(roomId);

        const rooms = userRooms.get(userId) || new Set();
        rooms.add(roomId);
        userRooms.set(userId, rooms);

        console.log(`[Socket] User ${userId} joined room: ${roomId}`);

        const messages = await Message.find({
          listing: listingId,
          $or: [
            { sender: userId, recipient: otherUserId },
            { sender: otherUserId, recipient: userId }
          ]
        })
          .populate('sender', 'username email')
          .populate('recipient', 'username email')
          .populate('listing', 'title image location')
          .sort({ createdAt: 1 })
          .limit(50);

        socket.emit('room:joined', {
          roomId,
          listingId,
          messages,
          otherUserId
        });

        const otherSocketId = activeUsers.get(otherUserId);
        if (otherSocketId) {
          messageNamespace.to(otherSocketId).emit('user:joined', {
            userId,
            roomId
          });
        }

      } catch (error) {
        console.error('[Socket] Join room error:', error);
        socket.emit('error', { message: 'Failed to join room', error: error.message });
      }
    });

    socket.on('message:send', async (data) => {
      try {
        const { listingId, recipientId, message } = data;
        const senderId = socket.userId;

        if (!senderId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        if (!listingId || !recipientId || !message) {
          socket.emit('error', {
            message: 'Listing ID, recipient ID, and message are required'
          });
          return;
        }

        const listing = await Listing.findById(listingId);
        if (!listing) {
          socket.emit('error', { message: 'Listing not found' });
          return;
        }

        const recipient = await User.findById(recipientId);
        if (!recipient) {
          socket.emit('error', { message: 'Recipient not found' });
          return;
        }

        if (senderId === recipientId) {
          socket.emit('error', { message: 'Cannot send message to yourself' });
          return;
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

        const roomId = getRoomId(listingId, senderId, recipientId);

        messageNamespace.to(roomId).emit('message:new', {
          message: newMessage,
          roomId
        });

        console.log(`[Socket] Message sent in room ${roomId}`);

        const recipientSocketId = activeUsers.get(recipientId);
        if (recipientSocketId) {
          const recipientRooms = userRooms.get(recipientId) || new Set();
          if (!recipientRooms.has(roomId)) {
            messageNamespace.to(recipientSocketId).emit('message:notification', {
              message: newMessage,
              roomId,
              listingId
            });
          }
        }

        socket.emit('message:sent', {
          success: true,
          message: newMessage,
          roomId
        });

      } catch (error) {
        console.error('[Socket] Send message error:', error);
        socket.emit('error', {
          message: 'Failed to send message',
          error: error.message
        });
      }
    });

    socket.on('typing:start', (data) => {
      const { listingId, recipientId } = data;
      const userId = socket.userId;

      if (!userId || !listingId || !recipientId) return;

      const roomId = getRoomId(listingId, userId, recipientId);
      socket.to(roomId).emit('typing:user', { userId, typing: true });
    });

    socket.on('typing:stop', (data) => {
      const { listingId, recipientId } = data;
      const userId = socket.userId;

      if (!userId || !listingId || !recipientId) return;

      const roomId = getRoomId(listingId, userId, recipientId);
      socket.to(roomId).emit('typing:user', { userId, typing: false });
    });

    socket.on('messages:read', async (data) => {
      try {
        const { listingId, senderId } = data;
        const userId = socket.userId;

        if (!userId || !listingId || !senderId) {
          socket.emit('error', { message: 'Invalid read request' });
          return;
        }

        const result = await Message.updateMany(
          {
            listing: listingId,
            sender: senderId,
            recipient: userId,
            isRead: false
          },
          { isRead: true }
        );

        const roomId = getRoomId(listingId, userId, senderId);

        messageNamespace.to(roomId).emit('messages:read:confirm', {
          listingId,
          recipientId: userId,
          count: result.modifiedCount
        });

        console.log(`[Socket] ${result.modifiedCount} messages marked as read in room ${roomId}`);

      } catch (error) {
        console.error('[Socket] Mark as read error:', error);
        socket.emit('error', {
          message: 'Failed to mark messages as read',
          error: error.message
        });
      }
    });

    socket.on('unread:count', async () => {
      try {
        const userId = socket.userId;

        if (!userId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        const unreadCount = await Message.countDocuments({
          recipient: userId,
          isRead: false
        });

        socket.emit('unread:count:result', { count: unreadCount });

      } catch (error) {
        console.error('[Socket] Unread count error:', error);
        socket.emit('error', {
          message: 'Failed to get unread count',
          error: error.message
        });
      }
    });

    socket.on('disconnect', () => {
      const userId = socket.userId;

      if (userId) {
        activeUsers.delete(userId);

        const rooms = userRooms.get(userId);
        if (rooms) {

          rooms.forEach(roomId => {
            messageNamespace.to(roomId).emit('user:offline', { userId });
          });
          userRooms.delete(userId);
        }

        console.log(`[Socket] User ${userId} disconnected`);
      } else {
        console.log(`[Socket] Unknown user disconnected: ${socket.id}`);
      }
    });
  });

  return messageNamespace;
};

module.exports = {
  initializeMessageSocket,
  activeUsers,
  userRooms
};
