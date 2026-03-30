import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Search, Loader2,
  ArrowLeft, Send, ExternalLink, CheckCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useSocket } from '../hooks/useSocket';
import { getCurrentUserId } from '../../utilis/js/storage';

const API_URL = import.meta?.env?.VITE_APP_API_URL || 'http://localhost:8000';

const ConversationsPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const messagesEndRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const navigate = useNavigate();

  const {
    isConnected, connect, disconnect, joinRoom,
    sendMessage: socketSendMessage, markAsRead,
    onNewMessage, onRoomJoined, onMessagesRead, getUnreadCount
  } = useSocket();

  const currentUserId = getCurrentUserId();

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  useEffect(() => {
    if (currentUserId) {
      console.log('[Connection] Attempting to connect socket for user:', currentUserId);
      connect(currentUserId);

      setTimeout(() => {
        if (!isConnected) {
          console.warn('[Connection] Socket not connected - using REST API fallback mode');
        } else {
          console.log('[Connection] Socket connected successfully');
        }
      }, 2000);
    } else {
      setConversations([]); setSelectedConversation(null);
      setMessages([]); setNewMessage(''); disconnect();
    }
    return () => {
      console.log('[Connection] Cleaning up');
      setConversations([]); setSelectedConversation(null); setMessages([]); disconnect();
    };
  }, [currentUserId, connect, disconnect]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) { navigate('/login'); return; }
      setLoading(true);
      const response = await axios.get(`${API_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    if (!isConnected) return;
    const unsubscribe = onNewMessage((data) => {
      if (!data?.message || !selectedConversation?.listing?._id) return;
      if (data.message.listing === selectedConversation.listing._id) {
        setMessages(prev => {
          const exists = prev.some(m => m._id === data.message._id || (m.tempId && m.tempId === data.message.tempId));
          if (exists) return prev.map(m => (m.tempId && m.tempId === data.message.tempId) ? data.message : m);
          return [...prev, data.message];
        });
        scrollToBottom();
        const senderId = data.message.sender?._id || data.message.sender;
        if (senderId && senderId !== currentUserId) {
          setTimeout(() => markAsRead(selectedConversation.listing._id, selectedConversation.otherUser._id), 500);
        }
      }
      fetchConversations();
    });
    return unsubscribe;
  }, [isConnected, selectedConversation, onNewMessage, currentUserId, markAsRead]);

  useEffect(() => {
    if (!isConnected) return;
    const unsubscribe = onRoomJoined((data) => { setMessages(data.messages || []); scrollToBottom(); });
    return unsubscribe;
  }, [isConnected, onRoomJoined]);

  useEffect(() => {
    if (!isConnected) return;
    const unsubscribe = onMessagesRead(() => { fetchConversations(); getUnreadCount(); });
    return unsubscribe;
  }, [isConnected, onMessagesRead, getUnreadCount]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (!selectedConversation || isConnected) return;

    console.log('[Polling] Setting up message polling (socket disconnected)');
    const pollInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `${API_URL}/messages/listing/${selectedConversation.listing._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const newMessages = response.data.data || [];
        if (newMessages.length !== messages.length) {
          console.log('[Polling] Found new messages:', newMessages.length);
          setMessages(newMessages);
          scrollToBottom();
        }
      } catch (error) {
        console.error('[Polling] Error fetching messages:', error);
      }
    }, 3000);

    return () => {
      console.log('[Polling] Clearing message polling');
      clearInterval(pollInterval);
    };
  }, [selectedConversation, isConnected, messages.length]);

  const handleSelectConversation = async (conversation) => {
    console.log('[SelectConv] Selected conversation:', conversation.listing._id);
    setSelectedConversation(conversation);

    if (isConnected) {
      console.log('[SelectConv] Joining room via socket');
      joinRoom(conversation.listing._id, conversation.otherUser._id);
      markAsRead(conversation.listing._id, conversation.otherUser._id);
    } else {
      console.log('[SelectConv] Socket not connected, using REST API only');
    }

    try {
      const token = localStorage.getItem('authToken');
      console.log('[SelectConv] Fetching messages via REST');
      const response = await axios.get(`${API_URL}/messages/listing/${conversation.listing._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedMessages = response.data.data || [];
      console.log('[SelectConv] Loaded', fetchedMessages.length, 'messages');
      setMessages(fetchedMessages);

      if (!isConnected) {
        await axios.post(`${API_URL}/messages/read`,
          { listingId: conversation.listing._id, senderId: conversation.otherUser._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error('[SelectConv] Error loading messages:', error);
      toast.error('Could not load messages');
    }
    fetchConversations();
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    console.log('[SendMsg] Triggered, isConnected:', isConnected, 'sending:', sending);
    if (!newMessage.trim() || !selectedConversation || sending) return;

    if (!selectedConversation.listing?._id) {
      toast.error('Listing information is missing');
      console.error('[SendMsg] Missing listing ID');
      return;
    }

    if (!selectedConversation.otherUser?._id) {
      toast.error('Recipient information is missing');
      console.error('[SendMsg] Missing recipient ID');
      return;
    }

    const messageText = newMessage.trim();
    const tempId = `temp_${Date.now()}`;
    console.log('[SendMsg] Sending message:', messageText);

    const optimisticMessage = {
      _id: tempId, tempId,
      message: messageText,
      sender: { _id: currentUserId },
      recipient: { _id: selectedConversation.otherUser._id },
      createdAt: new Date().toISOString(),
      isRead: false
    };

    console.log('[SendMsg] Adding optimistic message to UI');
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    scrollToBottom();

    try {
      setSending(true);

      if (isConnected) {

        console.log('[SendMsg] Using socket connection');
        await socketSendMessage(selectedConversation.listing._id, selectedConversation.otherUser._id, messageText);
        console.log('[SendMsg] Socket send successful');
      } else {

        console.log('[SendMsg] Socket offline, using REST API fallback');
        const token = localStorage.getItem('authToken');
        console.log('[SendMsg] Sending to:', `${API_URL}/messages`);
        console.log('[SendMsg] Request data:', {
          listingId: selectedConversation.listing._id,
          recipientId: selectedConversation.otherUser._id,
          message: messageText
        });
        console.log('[SendMsg] All values defined:', {
          listingId: !!selectedConversation.listing._id,
          recipientId: !!selectedConversation.otherUser._id,
          message: !!messageText
        });

        const response = await axios.post(
          `${API_URL}/messages`,
          {
            listingId: selectedConversation.listing._id,
            recipientId: selectedConversation.otherUser._id,
            message: messageText
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          console.log('[SendMsg] REST API send successful');

          setMessages(prev => prev.map(m =>
            m.tempId === tempId ? response.data.data : m
          ));
        } else {
          throw new Error(response.data.message || 'Failed to send message');
        }
      }

      fetchConversations();
    } catch (error) {
      console.error('[SendMsg] Error sending message:', error);
      console.error('[SendMsg] Error response:', error.response?.data);

      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';

      if (isConnected) {
        toast.error(`Could not send message: ${errorMsg}`);
      } else {
        toast.error(`Failed to send (offline): ${errorMsg}`);
      }

      setMessages(prev => prev.filter(m => m.tempId !== tempId));
    } finally {
      setSending(false);
      console.log('[SendMsg] Send complete');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const s = searchQuery.toLowerCase();
    return conv.otherUser.username?.toLowerCase().includes(s) ||
      conv.otherUser.email?.toLowerCase().includes(s) ||
      conv.listing.title?.toLowerCase().includes(s);
  });

  const formatTime = (date) => {
    const msgDate = new Date(date);
    const now = new Date();
    const diffMs = now - msgDate;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatFullTime = (date) =>
    new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const isOwnMessage = (message) =>
    message.sender?._id === currentUserId || message.sender === currentUserId;

  const getInitials = (user) => {
    if (user?.username) return user.username.slice(0, 2).toUpperCase();
    if (user?.email) return user.email.slice(0, 2).toUpperCase();
    return 'U';
  };

  const avatarHues = ['#dc2626','#b91c1c','#7f1d1d','#991b1b','#c0392b','#e74c3c'];
  const getAvatarColor = (str) => avatarHues[(str?.charCodeAt(0) || 0) % avatarHues.length];

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .cp-root {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          background: #f4f4f5;
          color: #111;
          padding-top: 80px;
        }
        .cp-wrap { max-width: 1280px; margin: 0 auto; padding: 0 20px 40px; }

        .cp-header { display:flex; align-items:center; gap:16px; margin-bottom:28px; }
        .cp-back {
          width:40px; height:40px; border-radius:10px;
          border:1.5px solid #e4e4e7; background:#fff;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; color:#71717a; transition:all .15s; flex-shrink:0;
        }
        .cp-back:hover { background:#fef2f2; border-color:#fca5a5; color:#dc2626; }
        .cp-title { font-size:24px; font-weight:700; color:#111; margin:0; letter-spacing:-.03em; }
        .cp-sub { font-size:13px; color:#a1a1aa; margin:2px 0 0; display:flex; align-items:center; gap:8px; }
        .cp-badge { background:#dc2626; color:#fff; font-size:11px; font-weight:600; padding:1px 7px; border-radius:20px; }

        .cp-layout { display:grid; gap:14px; height:calc(100vh - 190px); min-height:520px; }
        .cp-layout.split { grid-template-columns:340px 1fr; }
        .cp-layout.solo { grid-template-columns:1fr; max-width:440px; }

        .cp-sidebar {
          background:#fff; border-radius:16px;
          border:1.5px solid #e4e4e7;
          display:flex; flex-direction:column; overflow:hidden;
        }
        .cp-search-wrap { padding:14px; border-bottom:1.5px solid #f4f4f5; }
        .cp-search-inner { position:relative; display:flex; align-items:center; }
        .cp-search-icon { position:absolute; left:12px; pointer-events:none; }
        .cp-search-input {
          width:100%; padding:10px 12px 10px 38px;
          background:#f9f9f9; border:1.5px solid #e4e4e7;
          border-radius:10px; color:#111; font-size:13.5px;
          font-family:'Inter',sans-serif; outline:none; transition:all .2s;
        }
        .cp-search-input::placeholder { color:#c4c4c8; }
        .cp-search-input:focus { background:#fff; border-color:#dc2626; }

        .cp-list { flex:1; overflow-y:auto; scrollbar-width:thin; scrollbar-color:#e4e4e7 transparent; }
        .cp-list::-webkit-scrollbar { width:4px; }
        .cp-list::-webkit-scrollbar-thumb { background:#e4e4e7; border-radius:4px; }

        .cp-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:50px 24px; text-align:center; gap:10px; }
        .cp-empty-title { font-size:14px; font-weight:600; color:#a1a1aa; margin:0; }
        .cp-empty-sub { font-size:13px; color:#d4d4d8; margin:0; }

        .cp-item {
          padding:13px 14px; display:flex; gap:11px; align-items:flex-start;
          cursor:pointer; transition:background .12s;
          border-bottom:1.5px solid #f9f9f9; position:relative;
        }
        .cp-item:hover { background:#fef2f2; }
        .cp-item.active { background:#fef2f2; }
        .cp-item.active::before {
          content:''; position:absolute; left:0; top:10px; bottom:10px;
          width:3px; border-radius:0 3px 3px 0; background:#dc2626;
        }

        .cp-avatar {
          width:42px; height:42px; border-radius:12px;
          display:flex; align-items:center; justify-content:center;
          font-size:13px; font-weight:700; color:#fff;
          flex-shrink:0; letter-spacing:-.01em;
        }

        .cp-info { flex:1; min-width:0; }
        .cp-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:2px; }
        .cp-name { font-size:14px; font-weight:600; color:#111; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .cp-time { font-size:11px; color:#a1a1aa; flex-shrink:0; margin-left:6px; }
        .cp-listing { font-size:11.5px; color:#dc2626; font-weight:500; margin:0 0 3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .cp-preview { font-size:12.5px; color:#a1a1aa; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .cp-preview.unread { color:#52525b; font-weight:500; }
        .cp-unread {
          min-width:18px; height:18px; background:#dc2626; color:#fff;
          font-size:10px; font-weight:700; border-radius:9px; padding:0 5px;
          display:flex; align-items:center; justify-content:center;
        }

        .cp-chat {
          background:#fff; border-radius:16px;
          border:1.5px solid #e4e4e7;
          display:flex; flex-direction:column; overflow:hidden;
        }

        .cp-chat-header {
          padding:14px 18px; border-bottom:1.5px solid #f4f4f5;
          display:flex; align-items:center; justify-content:space-between;
          background:#fff; flex-shrink:0;
        }
        .cp-chat-hl { display:flex; align-items:center; gap:11px; }
        .cp-chat-name { font-size:15px; font-weight:600; color:#111; margin:0 0 2px; }
        .cp-chat-listing { font-size:12px; color:#a1a1aa; }

        .cp-status { display:flex; align-items:center; gap:5px; font-size:11px; color:#a1a1aa; }
        .cp-sdot { width:6px; height:6px; border-radius:50%; background:#22c55e; }
        .cp-sdot.off { background:#d4d4d8; }

        .cp-view-btn {
          display:flex; align-items:center; gap:5px; padding:7px 12px;
          border:1.5px solid #e4e4e7; border-radius:9px; background:#fff;
          color:#71717a; font-size:12px; font-weight:500;
          font-family:'Inter',sans-serif; cursor:pointer; transition:all .15s;
        }
        .cp-view-btn:hover { border-color:#fca5a5; color:#dc2626; background:#fef2f2; }

        .cp-messages {
          flex:1; overflow-y:auto; padding:20px 18px;
          display:flex; flex-direction:column; gap:2px;
          scrollbar-width:thin; scrollbar-color:#e4e4e7 transparent;
          background:#fafafa;
        }
        .cp-messages::-webkit-scrollbar { width:4px; }
        .cp-messages::-webkit-scrollbar-thumb { background:#e4e4e7; border-radius:4px; }

        .cp-msg-empty {
          flex:1; display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          text-align:center; gap:8px; padding:40px;
        }

        /* ── BUBBLE FIX: inline-block so short text stays compact ── */
        .cp-msg-row { display:flex; align-items:flex-end; gap:6px; margin-bottom:2px; }
        .cp-msg-row.own { justify-content:flex-end; }
        .cp-msg-row.other { justify-content:flex-start; }

        .cp-bwrap { display:flex; flex-direction:column; max-width:72%; }
        .cp-bwrap.own { align-items:flex-end; }
        .cp-bwrap.other { align-items:flex-start; }

        .cp-bubble {
          display:inline-block;          /* KEY: shrinks to content width */
          max-width:100%;
          padding:9px 13px;
          border-radius:16px;
          font-size:14px;
          line-height:1.5;
          word-break:break-word;
          white-space:pre-wrap;
        }
        .cp-bubble.own {
          background:#dc2626; color:#fff;
          border-bottom-right-radius:4px;
        }
        .cp-bubble.other {
          background:#f0f0f0; color:#111;
          border-bottom-left-radius:4px;
        }

        .cp-meta {
          display:flex; align-items:center; gap:3px;
          font-size:10.5px; margin-top:3px; color:#a1a1aa;
        }
        .cp-meta.own { justify-content:flex-end; color:#fca5a5; }

        .cp-date-div { display:flex; align-items:center; gap:10px; margin:14px 0 6px; }
        .cp-date-line { flex:1; height:1px; background:#ebebeb; }
        .cp-date-lbl { font-size:11px; color:#c4c4c8; text-transform:uppercase; letter-spacing:.06em; }

        .cp-input-area {
          padding:12px 14px; border-top:1.5px solid #f4f4f5;
          display:flex; gap:9px; align-items:center;
          background:#fff; flex-shrink:0;
        }
        .cp-input {
          flex:1; padding:11px 15px;
          background:#f9f9f9; border:1.5px solid #e4e4e7;
          border-radius:12px; color:#111; font-size:14px;
          font-family:'Inter',sans-serif; outline:none; transition:all .2s;
        }
        .cp-input::placeholder { color:#c4c4c8; }
        .cp-input:focus { background:#fff; border-color:#dc2626; }
        .cp-input:disabled { opacity:.4; cursor:not-allowed; }

        .cp-send {
          width:44px; height:44px; border-radius:12px; border:none;
          background:#dc2626; color:#fff; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:all .2s; flex-shrink:0;
        }
        .cp-send:hover:not(:disabled) { background:#b91c1c; transform:scale(1.05); }
        .cp-send:disabled { background:#e4e4e7; color:#a1a1aa; cursor:not-allowed; transform:none; }

        @keyframes cp-spin { to { transform:rotate(360deg); } }
        .cp-spin { animation:cp-spin 1s linear infinite; }
      `}</style>

      <div className="cp-root">
        <div className="cp-wrap">

          {}
          <div className="cp-header">
            <button className="cp-back" onClick={() => navigate(-1)}>
              <ArrowLeft size={17} />
            </button>
            <div>
              <h1 className="cp-title">Messages</h1>
              <p className="cp-sub">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                {totalUnread > 0 && <span className="cp-badge">{totalUnread} new</span>}
              </p>
            </div>
          </div>

          {}
          <div className={`cp-layout ${selectedConversation ? 'split' : 'solo'}`}>

            {}
            <div className="cp-sidebar">
              <div className="cp-search-wrap">
                <div className="cp-search-inner">
                  <Search size={15} className="cp-search-icon" color={searchFocused ? '#dc2626' : '#c4c4c8'} />
                  <input
                    className="cp-search-input"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search conversations…"
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                  />
                </div>
              </div>

              <div className="cp-list">
                {loading ? (
                  <div className="cp-empty">
                    <Loader2 size={26} color="#dc2626" className="cp-spin" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="cp-empty">
                    <MessageCircle size={36} color="#e4e4e7" />
                    <p className="cp-empty-title">{searchQuery ? 'No results' : 'No conversations'}</p>
                    <p className="cp-empty-sub">{searchQuery ? 'Try different keywords' : 'Messages will appear here'}</p>
                  </div>
                ) : filteredConversations.map((conv, i) => (
                  <motion.div
                    key={conv._id || i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.035 }}
                    className={`cp-item ${selectedConversation?.listing._id === conv.listing._id ? 'active' : ''}`}
                    onClick={() => handleSelectConversation(conv)}
                  >
                    <div className="cp-avatar" style={{ background: getAvatarColor(conv.otherUser.username || conv.otherUser.email) }}>
                      {getInitials(conv.otherUser)}
                    </div>
                    <div className="cp-info">
                      <div className="cp-row">
                        <span className="cp-name">{conv.otherUser.username || conv.otherUser.email}</span>
                        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                          {conv.lastMessage?.createdAt && <span className="cp-time">{formatTime(conv.lastMessage.createdAt)}</span>}
                          {conv.unreadCount > 0 && <span className="cp-unread">{conv.unreadCount}</span>}
                        </div>
                      </div>
                      <p className="cp-listing">{conv.listing.title}</p>
                      <p className={`cp-preview ${conv.unreadCount > 0 ? 'unread' : ''}`}>
                        {conv.lastMessage?.message || 'No messages yet'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {}
            <AnimatePresence mode="wait">
              {selectedConversation ? (
                <motion.div
                  key={selectedConversation.listing._id}
                  className="cp-chat"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="cp-chat-header">
                    <div className="cp-chat-hl">
                      <div className="cp-avatar" style={{ background: getAvatarColor(selectedConversation.otherUser.username || selectedConversation.otherUser.email) }}>
                        {getInitials(selectedConversation.otherUser)}
                      </div>
                      <div>
                        <p className="cp-chat-name">{selectedConversation.otherUser.username || selectedConversation.otherUser.email}</p>
                        <p className="cp-chat-listing">{selectedConversation.listing.title}</p>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div className="cp-status">
                        <div className={`cp-sdot ${isConnected ? '' : 'off'}`} />
                        {isConnected ? 'Live' : 'Offline'}
                      </div>
                      <button className="cp-view-btn" onClick={() => navigate(`/listings/${selectedConversation.listing._id}`)}>
                        <ExternalLink size={12} /> View listing
                      </button>
                    </div>
                  </div>

                  <div className="cp-messages">
                    {messages.length === 0 ? (
                      <div className="cp-msg-empty">
                        <MessageCircle size={38} color="#e4e4e7" />
                        <p style={{ fontSize:14, fontWeight:600, color:'#a1a1aa', margin:0 }}>Start the conversation</p>
                        <p style={{ fontSize:13, color:'#d4d4d8', margin:0 }}>Send a message below</p>
                      </div>
                    ) : (() => {
                      let lastDate = null;
                      return messages.map((msg, index) => {
                        const isOwn = isOwnMessage(msg);
                        const msgDateStr = new Date(msg.createdAt).toDateString();
                        const showDate = msgDateStr !== lastDate;
                        if (showDate) lastDate = msgDateStr;
                        const isToday = msgDateStr === new Date().toDateString();
                        const dateLabel = isToday
                          ? 'Today'
                          : new Date(msg.createdAt).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });

                        return (
                          <React.Fragment key={msg._id || index}>
                            {showDate && (
                              <div className="cp-date-div">
                                <div className="cp-date-line" />
                                <span className="cp-date-lbl">{dateLabel}</span>
                                <div className="cp-date-line" />
                              </div>
                            )}
                            <motion.div
                              className={`cp-msg-row ${isOwn ? 'own' : 'other'}`}
                              initial={{ opacity:0, y:5 }}
                              animate={{ opacity:1, y:0 }}
                              transition={{ duration:0.18 }}
                            >
                              <div className={`cp-bwrap ${isOwn ? 'own' : 'other'}`}>
                                <div className={`cp-bubble ${isOwn ? 'own' : 'other'}`}>
                                  {msg.message}
                                </div>
                                <div className={`cp-meta ${isOwn ? 'own' : ''}`}>
                                  {formatFullTime(msg.createdAt)}
                                  {isOwn && <CheckCheck size={11} />}
                                </div>
                              </div>
                            </motion.div>
                          </React.Fragment>
                        );
                      });
                    })()}
                    <div ref={messagesEndRef} />
                  </div>

                  <form className="cp-input-area" onSubmit={handleSendMessage}>
                    <input
                      ref={inputRef}
                      className="cp-input"
                      type="text"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder={isConnected ? "Write a message…" : "Write a message (offline mode)…"}
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      className="cp-send"
                      disabled={!newMessage.trim() || sending}
                    >
                      {sending ? <Loader2 size={17} className="cp-spin" /> : <Send size={17} />}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity:0 }}
                  animate={{ opacity:1 }}
                  style={{
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background:'#fff', borderRadius:16, border:'1.5px solid #e4e4e7'
                  }}
                >
                  <div style={{ textAlign:'center', padding:40 }}>
                    <MessageCircle size={44} color="#f0f0f0" style={{ margin:'0 auto 14px' }} />
                    <p style={{ fontSize:15, fontWeight:600, color:'#a1a1aa', margin:'0 0 6px' }}>Select a conversation</p>
                    <p style={{ fontSize:13, color:'#d4d4d8', margin:0 }}>Choose from the list on the left</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConversationsPage;
