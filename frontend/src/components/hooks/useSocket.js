import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const API_URL = import.meta?.env?.VITE_APP_API_URL || 'http://localhost:8000';

let socket = null;
let isConnecting = false;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [activeRooms, setActiveRooms] = useState(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback((userId) => {
    if (socket?.connected) {
      return socket;
    }

    if (isConnecting) {
      console.warn('[Socket] Connection already in progress');
      return socket;
    }

    isConnecting = true;
    console.log('[Socket] Attempting to connect to:', `${API_URL}/messages`);
    console.log('[Socket] User ID:', userId);

    socket = io(`${API_URL}/messages`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: maxReconnectAttempts,
      timeout: 20000
    });

    console.log('[Socket] Socket instance created, waiting for connection...');

    socket.on('connect', () => {
      isConnecting = false;
      setIsConnected(true);
      reconnectAttempts.current = 0;
      console.log('[Socket] ✅ Connected successfully! Socket ID:', socket.id);

      if (userId) {
        console.log('[Socket] Emitting register event for user:', userId);
        socket.emit('register', { userId });
      }
    });

    socket.on('registered', (data) => {
      console.log('[Socket] ✅ User registered successfully:', data);
      setActiveRooms(new Set(data.rooms));
    });

    socket.on('connect_error', (error) => {
      isConnecting = false;
      console.error('[Socket] ❌ Connection error:', error.message);
      console.error('[Socket] Error details:', {
        type: error.type,
        description: error.description,
        context: error.context
      });
      console.error('[Socket] Reconnect attempt:', reconnectAttempts.current + 1, '/', maxReconnectAttempts);
      setIsConnected(false);
      reconnectAttempts.current++;
    });

    socket.on('disconnect', (reason) => {
      isConnecting = false;
      setIsConnected(false);
      console.warn('[Socket] Disconnected. Reason:', reason);

      if (reason === 'io server disconnect') {

        console.log('[Socket] Server disconnected us, attempting to reconnect...');
        socket.connect();
      }
    });

    socket.on('error', (error) => {
      console.error('[Socket] Error:', error);
    });

    return socket;
  }, []);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      socket = null;
      setIsConnected(false);
      setActiveRooms(new Set());
    }
  }, []);

  const joinRoom = useCallback((listingId, otherUserId) => {
    if (!socket || !socket.connected) {
      console.error('[Socket] Not connected');
      return;
    }

    socket.emit('join:room', { listingId, otherUserId });
  }, []);

  const sendMessage = useCallback((listingId, recipientId, message) => {
    return new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        reject(new Error('Not connected to messaging server'));
        return;
      }

      let timeoutId;
      let resolved = false;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        socket.off('message:sent', handleSuccess);
      };

      const handleSuccess = (data) => {
        if (resolved) return;
        resolved = true;
        cleanup();

        if (data.success) {
          resolve(data.message);
        } else {
          reject(new Error(data.error || 'Failed to send message'));
        }
      };

      socket.once('message:sent', handleSuccess);

      timeoutId = setTimeout(() => {
        if (resolved) return;
        resolved = true;
        cleanup();
        reject(new Error('Message send timeout'));
      }, 10000);

      socket.emit('message:send', { listingId, recipientId, message });
    });
  }, []);

  const markAsRead = useCallback((listingId, senderId) => {
    if (!socket || !socket.connected) return;
    socket.emit('messages:read', { listingId, senderId });
  }, []);

  const sendTyping = useCallback((listingId, recipientId, isTyping) => {
    if (!socket || !socket.connected) return;

    if (isTyping) {
      socket.emit('typing:start', { listingId, recipientId });
    } else {
      socket.emit('typing:stop', { listingId, recipientId });
    }
  }, []);

  const getUnreadCount = useCallback(() => {
    if (!socket || !socket.connected) return;
    socket.emit('unread:count');
  }, []);

  const onNewMessage = useCallback((callback) => {
    if (!socket) return () => {};
    socket.on('message:new', callback);
    return () => {
      if (socket) socket.off('message:new', callback);
    };
  }, []);

  const onMessageNotification = useCallback((callback) => {
    if (!socket) return () => {};
    socket.on('message:notification', callback);
    return () => {
      if (socket) socket.off('message:notification', callback);
    };
  }, []);

  const onTyping = useCallback((callback) => {
    if (!socket) return () => {};
    socket.on('typing:user', callback);
    return () => {
      if (socket) socket.off('typing:user', callback);
    };
  }, []);

  const onUserStatus = useCallback((callback) => {
    if (!socket) return () => {};
    socket.on('user:online', (data) => callback({ ...data, online: true }));
    socket.on('user:offline', (data) => callback({ ...data, online: false }));
    return () => {
      if (socket) {
        socket.off('user:online');
        socket.off('user:offline');
      }
    };
  }, []);

  const onRoomJoined = useCallback((callback) => {
    if (!socket) return () => {};
    socket.on('room:joined', callback);
    return () => {
      if (socket) socket.off('room:joined', callback);
    };
  }, []);

  const onUnreadCount = useCallback((callback) => {
    if (!socket) return () => {};
    socket.on('unread:count:result', callback);
    return () => {
      if (socket) socket.off('unread:count:result', callback);
    };
  }, []);

  const onMessagesRead = useCallback((callback) => {
    if (!socket) return () => {};
    socket.on('messages:read:confirm', callback);
    return () => {
      if (socket) socket.off('messages:read:confirm', callback);
    };
  }, []);

  return {
    socket,
    isConnected,
    activeRooms,
    unreadCount,
    connect,
    disconnect,
    joinRoom,
    sendMessage,
    markAsRead,
    sendTyping,
    getUnreadCount,
    onNewMessage,
    onMessageNotification,
    onTyping,
    onUserStatus,
    onRoomJoined,
    onUnreadCount,
    onMessagesRead
  };
};

export default useSocket;
