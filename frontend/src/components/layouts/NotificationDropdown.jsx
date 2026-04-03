import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, Loader2, X, MessageCircle, Calendar, Star, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import userApi, { getAuthToken } from "../lib/userApi";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchNotifications();

      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await userApi.get("/notifications");

      const data = response.data.data || (Array.isArray(response.data) ? response.data : []);
      const notificationList = Array.isArray(data) ? data : [];
      
      setNotifications(notificationList.slice(0, 10));
      
      // Correctly count only unread notifications
      const unreadNotifications = notificationList.filter(n => n.isRead === false);
      setUnreadCount(unreadNotifications.length);
      
      console.log('[Notifications] Fetched:', notificationList.length, 'Total unread:', unreadNotifications.length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await userApi.put(`/notifications/${notificationId}/read`, {});

      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await userApi.put("/notifications/mark-all-read", {});

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error("Failed to mark notifications as read");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "booking_confirmed":
      case "booking_cancelled":
        return Calendar;
      case "message":
        return MessageCircle;
      case "review":
        return Star;
      default:
        return AlertCircle;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "booking_confirmed":
        return { bg: "#edf7f1", color: "#2d7a4f" };
      case "booking_cancelled":
        return { bg: "#fdf0ef", color: "#c0392b" };
      case "message":
        return { bg: "#eff6ff", color: "#2563eb" };
      case "review":
        return { bg: "#fef9ec", color: "#b07d10" };
      default:
        return { bg: "#f3f0ea", color: "#7c7060" };
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    setIsOpen(false);

    if (notification.link) {
      navigate(notification.link);
    } else if (notification.type?.includes("booking")) {
      navigate("/profile");
    } else if (notification.type === "review") {
      navigate("/profile");
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
<button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setLoading(true);
          fetchNotifications().finally(() => setLoading(false));
        }}
        style={{
          position: "relative",
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "none",
          background: isOpen ? "#f3f0ea" : "transparent",
          color: "#1a1207",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all .2s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "#f3f0ea"}
        onMouseLeave={(e) => e.currentTarget.style.background = isOpen ? "#f3f0ea" : "transparent"}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: 6,
            right: 6,
            minWidth: 18,
            height: 18,
            borderRadius: "50%",
            background: "#c2633a",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
            boxShadow: "0 2px 6px rgba(194,99,58,0.4)",
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
<AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: 50,
              right: 0,
              width: 380,
              maxHeight: 500,
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
              border: "1px solid rgba(0,0,0,0.06)",
              overflow: "hidden",
              zIndex: 1000,
            }}
          >
<div style={{
              padding: "16px 20px",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#faf8f4",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3 style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#1a1207",
                }}>
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span style={{
                    padding: "2px 8px",
                    borderRadius: 100,
                    background: "#c2633a",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    padding: "6px 12px",
                    border: "none",
                    borderRadius: 8,
                    background: "transparent",
                    color: "#c2633a",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#fff0ea"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  Mark all read
                </button>
              )}
            </div>
<div style={{
              maxHeight: 400,
              overflowY: "auto",
            }}>
              {loading ? (
                <div style={{
                  padding: 40,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  color: "#7c7060",
                }}>
                  <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} />
                  <p style={{ margin: 0, fontSize: 14 }}>Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div style={{
                  padding: 40,
                  textAlign: "center",
                  color: "#7c7060",
                }}>
                  <Bell size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>All caught up!</p>
                  <p style={{ margin: "8px 0 0", fontSize: 13, opacity: 0.7 }}>You have no new notifications</p>
                </div>
              ) : (
                notifications.map((notification, index) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colors = getNotificationColor(notification.type);
                  return (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNotificationClick(notification)}
                      style={{
                        padding: "14px 20px",
                        borderBottom: "1px solid rgba(0,0,0,0.04)",
                        background: notification.isRead ? "#fff" : "#fff8f4",
                        cursor: "pointer",
                        display: "flex",
                        gap: 12,
                        transition: "background .15s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#faf8f4"}
                      onMouseLeave={(e) => e.currentTarget.style.background = notification.isRead ? "#fff" : "#fff8f4"}
                    >
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: colors.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <Icon size={16} style={{ color: colors.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 8,
                          marginBottom: 4,
                        }}>
                          <h4 style={{
                            margin: 0,
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#1a1207",
                          }}>
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "#c2633a",
                              flexShrink: 0,
                              marginTop: 4,
                            }} />
                          )}
                        </div>
                        <p style={{
                          margin: "0 0 6px",
                          fontSize: 13,
                          color: "#7c7060",
                          lineHeight: 1.4,
                        }}>
                          {notification.message}
                        </p>
                        <span style={{
                          fontSize: 11,
                          color: "#b0a090",
                        }}>
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
{notifications.length > 0 && (
              <div style={{
                padding: "12px 20px",
                borderTop: "1px solid rgba(0,0,0,0.06)",
                textAlign: "center",
                background: "#faf8f4",
              }}>
                <button
                  onClick={() => {
                    navigate("/profile");
                    setIsOpen(false);
                  }}
                  style={{
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: 8,
                    background: "transparent",
                    color: "#c2633a",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#fff0ea"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default NotificationDropdown;
