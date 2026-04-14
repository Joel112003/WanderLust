import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Search,
  Loader2,
  ArrowLeft,
  Send,
  ExternalLink,
  CheckCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSocket } from "../hooks/useSocket";
import { getCurrentUserId } from "../../utilis/js/storage";
import userApi, { getAuthToken } from "../lib/userApi";

const ConversationsPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const navigate = useNavigate();

  const {
    isConnected,
    connect,
    disconnect,
    joinRoom,
    sendMessage: socketSendMessage,
    markAsRead,
    onNewMessage,
    onRoomJoined,
    onMessagesRead,
    getUnreadCount,
  } = useSocket();

  const currentUserId = getCurrentUserId();

  const avatarClassPalette = [
    "bg-rose-700",
    "bg-red-700",
    "bg-stone-700",
    "bg-orange-700",
    "bg-white-700",
    "bg-rose-800",
  ];

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
  };

  useEffect(() => {
    if (currentUserId) {
      connect(currentUserId);
    } else {
      setConversations([]);
      setSelectedConversation(null);
      setMessages([]);
      setNewMessage("");
      disconnect();
    }

    return () => {
      setConversations([]);
      setSelectedConversation(null);
      setMessages([]);
      disconnect();
    };
  }, [currentUserId, connect, disconnect]);

  const fetchConversations = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        navigate("/login");
        return;
      }
      setLoading(true);
      const response = await userApi.get("/messages/conversations");
      setConversations(response.data.data || []);
    } catch {
      toast.error("Failed to fetch conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!isConnected) return;
    const unsubscribe = onNewMessage((data) => {
      if (!data?.message || !selectedConversation?.listing?._id) return;

      if (data.message.listing === selectedConversation.listing._id) {
        setMessages((prev) => {
          const exists = prev.some(
            (m) => m._id === data.message._id || (m.tempId && m.tempId === data.message.tempId)
          );
          if (exists) {
            return prev.map((m) =>
              m.tempId && m.tempId === data.message.tempId ? data.message : m
            );
          }
          return [...prev, data.message];
        });

        scrollToBottom();

        const senderId = data.message.sender?._id || data.message.sender;
        if (senderId && senderId !== currentUserId) {
          setTimeout(() => {
            markAsRead(selectedConversation.listing._id, selectedConversation.otherUser._id);
          }, 500);
        }
      }
      fetchConversations();
    });

    return unsubscribe;
  }, [isConnected, selectedConversation, onNewMessage, currentUserId, markAsRead]);

  useEffect(() => {
    if (!isConnected) return;
    const unsubscribe = onRoomJoined((data) => {
      setMessages(data.messages || []);
      scrollToBottom();
    });
    return unsubscribe;
  }, [isConnected, onRoomJoined]);

  useEffect(() => {
    if (!isConnected) return;
    const unsubscribe = onMessagesRead(() => {
      fetchConversations();
      getUnreadCount();
    });
    return unsubscribe;
  }, [isConnected, onMessagesRead, getUnreadCount]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!selectedConversation || isConnected) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await userApi.get(`/messages/listing/${selectedConversation.listing._id}`);
        const newMessages = response.data.data || [];
        if (newMessages.length !== messages.length) {
          setMessages(newMessages);
          scrollToBottom();
        }
      } catch {
        // best effort polling fallback
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [selectedConversation, isConnected, messages.length]);

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);

    if (isConnected) {
      joinRoom(conversation.listing._id, conversation.otherUser._id);
      markAsRead(conversation.listing._id, conversation.otherUser._id);
    }

    try {
      const response = await userApi.get(`/messages/listing/${conversation.listing._id}`);
      setMessages(response.data.data || []);

      if (!isConnected) {
        await userApi.post("/messages/read", {
          listingId: conversation.listing._id,
          senderId: conversation.otherUser._id,
        });
      }

      fetchConversations();
      setTimeout(() => inputRef.current?.focus(), 200);
    } catch {
      toast.error("Could not load messages");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedConversation || sending) return;
    if (!selectedConversation.listing?._id || !selectedConversation.otherUser?._id) {
      toast.error("Conversation details are missing");
      return;
    }

    const messageText = newMessage.trim();
    const tempId = `temp_${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      tempId,
      message: messageText,
      sender: { _id: currentUserId },
      recipient: { _id: selectedConversation.otherUser._id },
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");
    scrollToBottom();

    try {
      setSending(true);

      if (isConnected) {
        try {
          await socketSendMessage(
            selectedConversation.listing._id,
            selectedConversation.otherUser._id,
            messageText
          );
          fetchConversations();
          return;
        } catch {
        }
      }

      const response = await userApi.post("/messages", {
        listingId: selectedConversation.listing._id,
        recipientId: selectedConversation.otherUser._id,
        message: messageText,
      });

      if (response.data.success) {
        setMessages((prev) => prev.map((m) => (m.tempId === tempId ? response.data.data : m)));
        toast.success("Message sent");
      } else {
        throw new Error(response.data.message || "Failed to send message");
      }

      fetchConversations();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Unknown error";
      toast.error(`Failed to send: ${errorMsg}`);
      setMessages((prev) => prev.filter((m) => m.tempId !== tempId));
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const s = searchQuery.toLowerCase();
    return (
      conv.otherUser.username?.toLowerCase().includes(s) ||
      conv.otherUser.email?.toLowerCase().includes(s) ||
      conv.listing.title?.toLowerCase().includes(s)
    );
  });

  const formatTime = (date) => {
    const msgDate = new Date(date);
    const now = new Date();
    const diffMs = now - msgDate;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return msgDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatFullTime = (date) =>
    new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const isOwnMessage = (message) =>
    message.sender?._id === currentUserId || message.sender === currentUserId;

  const getInitials = (user) => {
    if (user?.username) return user.username.slice(0, 2).toUpperCase();
    if (user?.email) return user.email.slice(0, 2).toUpperCase();
    return "U";
  };

  const getAvatarClass = (str) => {
    const idx = (str?.charCodeAt(0) || 0) % avatarClassPalette.length;
    return avatarClassPalette[idx];
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white-50 via-white-50 to-white px-5 pb-10 pt-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex items-center gap-4">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-orawhitenge-300 bg-white text-stone-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={17} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">Messages</h1>
            <p className="flex items-center gap-2 text-sm text-stone-500">
              {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
              {totalUnread > 0 && (
                <span className="rounded-full bg-rose-700 px-2 py-0.5 text-[11px] font-semibold text-white">
                  {totalUnread} new
                </span>
              )}
            </p>
          </div>
        </div>

        <div className={`grid gap-4 ${selectedConversation ? "grid-cols-[350px_1fr]" : "max-w-[440px]"}`}>
          <div className="overflow-hidden rounded-2xl border border-white-200 bg-white">
            <div className="border-b border-white-100 p-4">
              <div className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  className="w-full rounded-xl border border-white-200 bg-white-50 px-10 py-2.5 text-sm text-stone-900 outline-none transition focus:border-rose-500 focus:bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                />
              </div>
            </div>

            <div className="max-h-[65vh] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-14">
                  <Loader2 size={26} className="animate-spin text-rose-700" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-14 text-center">
                  <MessageCircle size={36} className="text-stone-300" />
                  <p className="text-sm font-semibold text-stone-500">{searchQuery ? "No results" : "No conversations"}</p>
                  <p className="text-xs text-stone-400">{searchQuery ? "Try different keywords" : "Messages will appear here"}</p>
                </div>
              ) : (
                filteredConversations.map((conv, i) => (
                  <motion.div
                    key={conv._id || i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`cursor-pointer border-b border-white-50 p-3 transition hover:bg-white-50 ${
                      selectedConversation?.listing._id === conv.listing._id ? "bg-rose-50" : ""
                    }`}
                    onClick={() => handleSelectConversation(conv)}
                  >
                    <div className="flex gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white ${getAvatarClass(conv.otherUser.username || conv.otherUser.email)}`}>
                        {getInitials(conv.otherUser)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-stone-900">{conv.otherUser.username || conv.otherUser.email}</p>
                          <div className="flex items-center gap-1.5">
                            {conv.lastMessage?.createdAt && <span className="text-[11px] text-stone-400">{formatTime(conv.lastMessage.createdAt)}</span>}
                            {conv.unreadCount > 0 && (
                              <span className="rounded-full bg-rose-700 px-1.5 py-0.5 text-[10px] font-bold text-white">{conv.unreadCount}</span>
                            )}
                          </div>
                        </div>
                        <p className="truncate text-[11.5px] font-medium text-rose-700">{conv.listing.title}</p>
                        <p className={`truncate text-[12.5px] ${conv.unreadCount > 0 ? "font-medium text-stone-700" : "text-stone-400"}`}>
                          {conv.lastMessage?.message || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {selectedConversation ? (
              <motion.div
                key={selectedConversation.listing._id}
                className="flex h-[65vh] flex-col overflow-hidden rounded-2xl border border-ambewhiter-200 bg-white"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between border-b border-white-100 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white ${getAvatarClass(selectedConversation.otherUser.username || selectedConversation.otherUser.email)}`}>
                      {getInitials(selectedConversation.otherUser)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900">{selectedConversation.otherUser.username || selectedConversation.otherUser.email}</p>
                      <p className="text-xs text-stone-400">{selectedConversation.listing.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] text-stone-500">
                      <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-stone-300"}`} />
                      {isConnected ? "Live" : "Offline"}
                    </span>
                    <button
                      className="inline-flex items-center gap-1 rounded-lg border border-white-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-600 transition hover:border-rose-300 hover:text-rose-700"
                      onClick={() => navigate(`/listings/${selectedConversation.listing._id}`)}
                    >
                      <ExternalLink size={12} /> View listing
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-stone-50 px-4 py-4">
                  {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                      <MessageCircle size={38} className="text-stone-300" />
                      <p className="text-sm font-semibold text-stone-500">Start the conversation</p>
                      <p className="text-xs text-stone-400">Send a message below</p>
                    </div>
                  ) : (
                    (() => {
                      let lastDate = null;
                      return messages.map((msg, index) => {
                        const isOwn = isOwnMessage(msg);
                        const msgDateStr = new Date(msg.createdAt).toDateString();
                        const showDate = msgDateStr !== lastDate;
                        if (showDate) lastDate = msgDateStr;

                        const isToday = msgDateStr === new Date().toDateString();
                        const dateLabel = isToday
                          ? "Today"
                          : new Date(msg.createdAt).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            });

                        return (
                          <React.Fragment key={msg._id || index}>
                            {showDate && (
                              <div className="my-3 flex items-center gap-3">
                                <div className="h-px flex-1 bg-stone-200" />
                                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-400">{dateLabel}</span>
                                <div className="h-px flex-1 bg-stone-200" />
                              </div>
                            )}

                            <div className={`mb-1 flex ${isOwn ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[72%] ${isOwn ? "text-right" : "text-left"}`}>
                                <div
                                  className={`inline-block rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                                    isOwn
                                      ? "rounded-br-md bg-rose-700 text-white"
                                      : "rounded-bl-md bg-white text-stone-900 border border-white-100"
                                  }`}
                                >
                                  {msg.message}
                                </div>
                                <div className={`mt-1 flex items-center gap-1 text-[10px] ${isOwn ? "justify-end text-rose-200" : "text-stone-400"}`}>
                                  {formatFullTime(msg.createdAt)}
                                  {isOwn && <CheckCheck size={10} />}
                                </div>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      });
                    })()
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form className="flex items-center gap-2 border-t border-white-100 p-3" onSubmit={handleSendMessage}>
                  <input
                    ref={inputRef}
                    className="flex-1 rounded-xl border border-white-200 bg-ambewhiter-50 px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-rose-500 focus:bg-white"
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isConnected ? "Write a message..." : "Write a message (offline mode)..."}
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-700 text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:bg-stone-300"
                    disabled={!newMessage.trim() || sending}
                  >
                    {sending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-[65vh] items-center justify-center rounded-2xl border border-white-200 bg-white"
              >
                <div className="text-center">
                  <MessageCircle size={44} className="mx-auto mb-3 text-stone-300" />
                  <p className="text-sm font-semibold text-stone-500">Select a conversation</p>
                  <p className="text-xs text-stone-400">Choose one from the list</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ConversationsPage;
