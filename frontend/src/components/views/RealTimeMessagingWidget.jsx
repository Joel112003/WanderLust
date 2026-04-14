import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Send,
  X,
  User,
  Loader2,
  CheckCheck,
  Wifi,
  WifiOff,
  Circle
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useSocket } from '../hooks/useSocket';
import { safeGetItem } from '../../utilis/js/storage';

const API_URL = import.meta?.env?.VITE_APP_API_URL || 'http://localhost:8000';

const RealTimeMessagingWidget = ({
  listingId,
  hostId,
  hostName = "Host",
  currentUserId,
  otherUserId = null,
  otherUserName = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [recipientId, setRecipientId] = useState(null);
  const [recipientName, setRecipientName] = useState('User');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    console.log('[Widget] Setting recipient. Props:', {
      otherUserId,
      currentUserId,
      hostId,
      hostName
    });

    if (otherUserId && otherUserId !== currentUserId) {
      console.log('[Widget] Using otherUserId as recipient:', otherUserId);
      setRecipientId(otherUserId);
      if (otherUserName) {
        setRecipientName(otherUserName);
      }
    } else if (currentUserId !== hostId) {

      console.log('[Widget] User is guest, setting recipient to hostId:', hostId);
      setRecipientId(hostId);
      setRecipientName(hostName);
    } else {
      console.log('[Widget] User is host, recipient will be determined from messages');

    }
  }, [otherUserId, otherUserName, currentUserId, hostId, hostName]);

  const {
    isConnected,
    connect,
    disconnect,
    joinRoom,
    sendMessage: socketSendMessage,
    markAsRead,
    sendTyping,
    onNewMessage,
    onTyping,
    onUserStatus,
    onRoomJoined
  } = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const token = safeGetItem('authToken');
    if (!token || !currentUserId) {

      setMessages([]);
      setNewMessage('');
      setIsOpen(false);
      disconnect();
      return;
    }

    connect(currentUserId);

    return () => {

      setMessages([]);
      setNewMessage('');
      setIsOpen(false);
      disconnect();
    };
  }, [currentUserId, connect, disconnect]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!isOpen || !listingId) return;

      try {
        setLoading(true);
        const token = safeGetItem('authToken');
        if (!token) return;

        const response = await axios.get(`${API_URL}/messages/listing/${listingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const fetchedMessages = response.data.data || [];
          setMessages(fetchedMessages);

          console.log('[Widget] Loaded', fetchedMessages.length, 'messages');

          if (fetchedMessages.length > 0 && !recipientId) {
            const firstMessage = fetchedMessages[0];
            const otherUserId = firstMessage.sender._id === currentUserId
              ? firstMessage.recipient._id
              : firstMessage.sender._id;
            const otherUserName = firstMessage.sender._id === currentUserId
              ? firstMessage.recipient.username || firstMessage.recipient.email
              : firstMessage.sender.username || firstMessage.sender.email;

            console.log('[Widget] Setting recipient from messages:', otherUserId);
            setRecipientId(otherUserId);
            setRecipientName(otherUserName || 'User');
          } else {
            console.log('[Widget] RecipientId already set:', recipientId);
          }
        }
      } catch (error) {
        console.error('[Widget] Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    if (isOpen && isConnected && listingId && recipientId && recipientId !== currentUserId) {
      joinRoom(listingId, recipientId);
    }
  }, [isOpen, isConnected, listingId, recipientId, currentUserId, joinRoom]);

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onRoomJoined((data) => {
      setMessages(data.messages || []);
      setLoading(false);
      scrollToBottom();
    });

    return unsubscribe;
  }, [isConnected, onRoomJoined]);

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onNewMessage((data) => {

      setMessages(prev => {
        const exists = prev.some(m => m._id === data.message._id ||
          (m.tempId && m.tempId === data.message.tempId));
        if (exists) {

          return prev.map(m =>
            (m.tempId && m.tempId === data.message.tempId) ? data.message : m
          );
        }
        return [...prev, data.message];
      });

      setTimeout(scrollToBottom, 100);

      if (isOpen && data.message.recipient._id === currentUserId) {
        markAsRead(listingId, data.message.sender._id);
      }
    });

    return unsubscribe;
  }, [isConnected, isOpen, currentUserId, listingId, onNewMessage, markAsRead]);

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onTyping((data) => {
      if (data.userId !== currentUserId) {
        setIsTyping(data.typing);

        if (data.typing) {
          setTimeout(() => setIsTyping(false), 3000);
        }
      }
    });

    return unsubscribe;
  }, [isConnected, currentUserId, onTyping]);

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onUserStatus((data) => {
      if (data.userId === recipientId) {
        setOtherUserOnline(data.online);
      }
    });

    return unsubscribe;
  }, [isConnected, recipientId, onUserStatus]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, []);

  const handleTyping = () => {
    if (!isConnected || !recipientId || !listingId) return;

    sendTyping(listingId, recipientId, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isConnected && recipientId) {
        sendTyping(listingId, recipientId, false);
      }
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const token = safeGetItem('authToken');
    if (!token) {
      toast.error('Please login to send messages');
      setIsOpen(false);
      return;
    }

    if (!listingId) {
      toast.error('Listing information is missing');
      console.error('[Widget] Missing listingId');
      return;
    }

    if (!recipientId) {
      toast.error('Unable to determine recipient. Please refresh the page.');
      console.error('[Widget] Missing recipientId. Debug info:', {
        currentUserId,
        hostId,
        otherUserId,
        messagesCount: messages.length,
        isHost: currentUserId === hostId
      });
      return;
    }

    if (recipientId === currentUserId) {
      toast.error('Cannot send message to yourself');
      return;
    }

    const messageText = newMessage.trim();
    const tempId = `temp_${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      tempId: tempId,
      message: messageText,
      sender: { _id: currentUserId },
      recipient: { _id: recipientId },
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50);

    try {
      setSending(true);

      if (isConnected) {

        await socketSendMessage(listingId, recipientId, messageText);

        sendTyping(listingId, recipientId, false);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      } else {

        console.log('[Widget] Socket offline, using REST API fallback');
        console.log('[Widget] Sending to:', `${API_URL}/messages`);
        console.log('[Widget] Request data:', {
          listingId: listingId,
          recipientId: recipientId,
          message: messageText
        });
        console.log('[Widget] Token exists:', !!token);
        console.log('[Widget] All values defined:', {
          listingId: !!listingId,
          recipientId: !!recipientId,
          message: !!messageText
        });

        const response = await axios.post(
          `${API_URL}/messages`,
          {
            listingId: listingId,
            recipientId: recipientId,
            message: messageText
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          console.log('[Widget] REST API send successful');

          setMessages(prev => prev.map(m =>
            m.tempId === tempId ? response.data.data : m
          ));
        } else {
          throw new Error(response.data.message || 'Failed to send message');
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error response:', error.response?.data);

      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';

      if (isConnected) {
        toast.error(`Could not send message: ${errorMsg}`);
      } else {
        toast.error(`Failed to send (offline): ${errorMsg}`);
      }

      setMessages(prev => prev.filter(m => m.tempId !== tempId));
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    const msgDate = new Date(date);
    const now = new Date();
    const diffMs = now - msgDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return msgDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOwnMessage = (message) => {
    return message.sender._id === currentUserId;
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[1000] flex h-14 w-14 items-center justify-center rounded-full border-none bg-gradient-to-br from-[#C0392B] to-[#E74C3C] text-white shadow-[0_6px_20px_rgba(192,57,43,0.4)] transition-transform duration-200"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <MessageCircle size={26} strokeWidth={2} />
        {isConnected ? (
          <Circle
            size={12}
            fill="#22c55e"
            color="#22c55e"
            className="absolute right-1.5 top-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
          />
        ) : (
          <Circle
            size={12}
            fill="#ef4444"
            color="#ef4444"
            className="absolute right-1.5 top-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
          />
        )}
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-[100px] right-6 z-[1000] flex w-[340px] max-h-[480px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.05)]"
          >
            <div className="flex items-center justify-between bg-gradient-to-br from-[#C0392B] to-[#E74C3C] px-4 py-3.5 text-white">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/30 bg-white/25">
                  <User size={18} />
                </div>
                <div>
                  <div className="text-[15px] font-semibold tracking-[-0.01em]">
                    {recipientName}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] opacity-90">
                    {isConnected ? (
                      <>
                        <Circle size={6} fill="#22c55e" color="#22c55e" />
                        <span>{otherUserOnline ? 'Active now' : 'Offline'}</span>
                      </>
                    ) : (
                      <>
                        <WifiOff size={11} />
                        <span>Offline mode</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full border-none bg-white/20 text-white transition-colors hover:bg-white/30"
              >
                <X size={16} />
              </button>
            </div>
            <div className="max-h-[360px] flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-b from-gray-50 to-white px-3.5 py-4">
              {loading ? (
                <div className="flex min-h-[200px] h-full items-center justify-center">
                  <Loader2 size={28} className="animate-spin" color="#C0392B" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex min-h-[200px] flex-col justify-center px-5 py-[50px] text-center text-gray-500">
                  <MessageCircle size={42} className="mx-auto mb-3.5 opacity-25" />
                  <p className="mb-1.5 text-[15px] font-semibold text-gray-700">
                    No messages yet
                  </p>
                  <p className="m-0 text-[13px] leading-[1.5] text-gray-400">
                    Say hi to {recipientName}!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {messages.map((msg, index) => {
                    const isOwn = isOwnMessage(msg);
                    return (
                      <motion.div
                        key={msg._id || index}
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={`flex ${isOwn ? 'justify-end pl-[30px]' : 'justify-start pr-[30px]'}`}
                      >
                        <div
                          className={`max-w-[85%] px-[13px] py-[10px] ${
                            isOwn
                              ? 'rounded-[18px] rounded-tr-[4px] border-none bg-gradient-to-br from-[#C0392B] to-[#E74C3C] text-white shadow-[0_2px_8px_rgba(192,57,43,0.25)]'
                              : 'rounded-[18px] rounded-tl-[4px] border border-gray-100 bg-white text-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                          }`}
                        >
                          <div className="break-words text-sm leading-[1.5] tracking-[-0.01em]">
                            {msg.message}
                          </div>
                          <div className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] tracking-[0.01em] ${isOwn ? 'opacity-85' : 'opacity-60'}`}>
                            {formatTime(msg.createdAt)}
                            {isOwn && msg.isRead && <CheckCheck size={12} />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
{isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex h-9 w-fit items-center gap-1 rounded-[18px] rounded-tl-[4px] border border-gray-100 bg-white px-3 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                    >
                      <motion.span
                        className="h-[7px] w-[7px] rounded-full bg-gray-400"
                        animate={{ y: [0, -6, 0], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <motion.span
                        className="h-[7px] w-[7px] rounded-full bg-gray-400"
                        animate={{ y: [0, -6, 0], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                      />
                      <motion.span
                        className="h-[7px] w-[7px] rounded-full bg-gray-400"
                        animate={{ y: [0, -6, 0], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                      />
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 border-t border-gray-100 bg-white px-3.5 py-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                placeholder={isConnected ? "Message..." : "Message (offline mode)..."}
                disabled={sending}
                className="flex-1 rounded-[20px] border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] tracking-[-0.01em] outline-none transition-all focus:border-[#C0392B]"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-none text-white transition-transform ${
                  !newMessage.trim() || sending
                    ? 'cursor-not-allowed bg-gray-200 shadow-none'
                    : 'cursor-pointer bg-gradient-to-br from-[#C0392B] to-[#E74C3C] shadow-[0_2px_8px_rgba(192,57,43,0.3)] hover:scale-105'
                }`}
              >
                {sending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RealTimeMessagingWidget;
