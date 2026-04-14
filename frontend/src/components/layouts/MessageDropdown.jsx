import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { getCurrentUserId, safeGetItem } from "../../utilis/js/storage";
import userApi from "../lib/userApi";

const MessageDropdown = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const {
    isConnected,
    connect,
    disconnect,
    getUnreadCount,
    onMessageNotification,
    onUnreadCount,
    onMessagesRead
  } = useSocket();

  const getCurrentUser = () => getCurrentUserId();

  useEffect(() => {
    const userId = getCurrentUser();
    if (userId) {
      connect(userId);
      return () => disconnect();
    } else {

      setUnreadCount(0);
      disconnect();
    }
  }, [connect, disconnect]);

  useEffect(() => {
    const token = safeGetItem("authToken");
    if (token) {
      fetchUnreadCount();
      if (isConnected) {
        getUnreadCount();
      }
    }
  }, [isConnected, getUnreadCount]);

  useEffect(() => {
    if (!isConnected) return;
    const userId = getCurrentUser();

    const unsubscribe = onMessageNotification((data) => {

      const recipientId = data?.message?.recipient?._id || data?.message?.recipient;
      if (recipientId === userId) {

        fetchUnreadCount();
      }
    });
    return unsubscribe;
  }, [isConnected, onMessageNotification]);

  useEffect(() => {
    if (!isConnected) return;
    const unsubscribe = onUnreadCount((data) => {
      setUnreadCount(data.count || 0);
    });
    return unsubscribe;
  }, [isConnected, onUnreadCount]);

  useEffect(() => {
    if (!isConnected) return;
    const unsubscribe = onMessagesRead(() => {

      fetchUnreadCount();
      getUnreadCount();
    });
    return unsubscribe;
  }, [isConnected, onMessagesRead, getUnreadCount]);

  const fetchUnreadCount = async () => {
    try {
      const token = safeGetItem("authToken");
      if (!token) return;

      const response = await userApi.get("/messages/unread/count");

      const count = response.data.data?.unreadCount || response.data.count || 0;
      setUnreadCount(count);
    } catch (err) {

    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => navigate('/conversations')}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border-none bg-transparent text-teal-600 transition-all hover:bg-teal-50"
        title="Messages"
      >
        <MessageCircle size={20} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-teal-600 px-1 text-[10px] font-bold text-white shadow-[0_2px_6px_rgba(13,148,136,0.4)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default MessageDropdown;
