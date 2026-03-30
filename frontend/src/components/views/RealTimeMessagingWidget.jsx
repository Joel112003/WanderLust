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
      {}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #C0392B 0%, #E74C3C 100%)',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(192, 57, 43, 0.4), 0 0 0 0 rgba(192, 57, 43, 0.4)',
          zIndex: 1000,
          animation: 'pulse 2s infinite'
        }}
        whileHover={{ scale: 1.1, boxShadow: '0 8px 24px rgba(192, 57, 43, 0.5)' }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <MessageCircle size={26} strokeWidth={2} />

        {}
        {isConnected ? (
          <Circle
            size={12}
            fill="#22c55e"
            color="#22c55e"
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
            }}
          />
        ) : (
          <Circle
            size={12}
            fill="#ef4444"
            color="#ef4444"
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
            }}
          />
        )}
      </motion.button>

      {}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
              position: 'fixed',
              bottom: 100,
              right: 24,
              width: 340,
              maxHeight: 480,
              background: 'white',
              borderRadius: 20,
              boxShadow: '0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 1000
            }}
          >
            {}
            <div style={{
              background: 'linear-gradient(135deg, #C0392B 0%, #E74C3C 100%)',
              color: 'white',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}>
                  <User size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em' }}>
                    {recipientName}
                  </div>
                  <div style={{
                    fontSize: 11,
                    opacity: 0.9,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 2
                  }}>
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
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              >
                <X size={16} />
              </button>
            </div>

            {}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '16px 14px',
              background: 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)',
              maxHeight: 360,
              scrollBehavior: 'smooth'
            }}>
              {loading ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  minHeight: 200
                }}>
                  <Loader2 size={28} className="animate-spin" color="#C0392B" />
                </div>
              ) : messages.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  color: '#6b7280',
                  padding: '50px 20px',
                  minHeight: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <MessageCircle size={42} style={{ margin: '0 auto 14px', opacity: 0.25 }} />
                  <p style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: 6
                  }}>
                    No messages yet
                  </p>
                  <p style={{
                    fontSize: 13,
                    margin: 0,
                    color: '#9ca3af',
                    lineHeight: 1.5
                  }}>
                    Say hi to {recipientName}!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {messages.map((msg, index) => {
                    const isOwn = isOwnMessage(msg);
                    return (
                      <motion.div
                        key={msg._id || index}
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        style={{
                          display: 'flex',
                          justifyContent: isOwn ? 'flex-end' : 'flex-start',
                          paddingLeft: isOwn ? 30 : 0,
                          paddingRight: isOwn ? 0 : 30
                        }}
                      >
                        <div style={{
                          maxWidth: '85%',
                          background: isOwn
                            ? 'linear-gradient(135deg, #C0392B 0%, #E74C3C 100%)'
                            : '#ffffff',
                          color: isOwn ? '#ffffff' : '#1f2937',
                          padding: '10px 13px',
                          borderRadius: 18,
                          borderTopRightRadius: isOwn ? 4 : 18,
                          borderTopLeftRadius: isOwn ? 18 : 4,
                          boxShadow: isOwn
                            ? '0 2px 8px rgba(192, 57, 43, 0.25)'
                            : '0 1px 3px rgba(0,0,0,0.08)',
                          border: isOwn ? 'none' : '1px solid #f3f4f6'
                        }}>
                          <div style={{
                            wordWrap: 'break-word',
                            fontSize: 14,
                            lineHeight: 1.5,
                            letterSpacing: '-0.01em'
                          }}>
                            {msg.message}
                          </div>
                          <div style={{
                            fontSize: 10,
                            marginTop: 5,
                            opacity: isOwn ? 0.85 : 0.6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: 4,
                            letterSpacing: '0.01em'
                          }}>
                            {formatTime(msg.createdAt)}
                            {isOwn && msg.isRead && <CheckCheck size={12} />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      style={{
                        display: 'flex',
                        gap: 3,
                        padding: '10px 12px',
                        background: '#ffffff',
                        border: '1px solid #f3f4f6',
                        borderRadius: 18,
                        borderTopLeftRadius: 4,
                        width: 'fit-content',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        alignItems: 'center',
                        height: 36
                      }}
                    >
                      <span className="typing-dot" />
                      <span className="typing-dot" style={{ animationDelay: '0.2s' }} />
                      <span className="typing-dot" style={{ animationDelay: '0.4s' }} />
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '12px 14px',
                background: '#ffffff',
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                gap: 8,
                alignItems: 'center'
              }}
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
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 20,
                  outline: 'none',
                  fontSize: 13,
                  transition: 'all 0.2s',
                  background: '#fafafa',
                  letterSpacing: '-0.01em'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#C0392B';
                  e.target.style.background = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.background = '#fafafa';
                }}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: 'none',
                  background: (!newMessage.trim() || sending)
                    ? '#e5e7eb'
                    : 'linear-gradient(135deg, #C0392B 0%, #E74C3C 100%)',
                  color: 'white',
                  cursor: (!newMessage.trim() || sending) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: (!newMessage.trim() || sending)
                    ? 'none'
                    : '0 2px 8px rgba(192, 57, 43, 0.3)',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  if (newMessage.trim() && !sending) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
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

      {}
      <style>{`
        .typing-dot {
          width: 7px;
          height: 7px;
          borderRadius: 50%;
          background: #9ca3af;
          animation: typing 1.4s ease-in-out infinite;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.6;
          }
          30% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 6px 20px rgba(192, 57, 43, 0.4), 0 0 0 0 rgba(192, 57, 43, 0.4);
          }
          50% {
            box-shadow: 0 6px 20px rgba(192, 57, 43, 0.4), 0 0 0 8px rgba(192, 57, 43, 0);
          }
          100% {
            box-shadow: 0 6px 20px rgba(192, 57, 43, 0.4), 0 0 0 0 rgba(192, 57, 43, 0);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

export default RealTimeMessagingWidget;
