import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../hooks/useSocket";
import { getCurrentUserId, safeGetItem } from "../../utilis/js/storage";

const API_URL = import.meta?.env?.VITE_APP_API_URL || "http://localhost:8000";

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

      const response = await axios.get(`${API_URL}/messages/unread/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const count = response.data.data?.unreadCount || response.data.count || 0;
      setUnreadCount(count);
    } catch (err) {

    }
  };

  return (
    <div style={{ position: "relative" }}>
<button
        onClick={() => navigate('/conversations')}
        style={{
          position: "relative",
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "none",
          background: "transparent",
          color: "#0d9488",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all .2s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "#f0fdfa"}
        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        title="Messages"
      >
        <MessageCircle size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: 6,
            right: 6,
            minWidth: 18,
            height: 18,
            borderRadius: "50%",
            background: "#0d9488",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
            boxShadow: "0 2px 6px rgba(13, 148, 136, 0.4)",
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default MessageDropdown;
