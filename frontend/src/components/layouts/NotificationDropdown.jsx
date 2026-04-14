import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, Loader2, X, MessageCircle, Calendar, Star, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import userApi, { getAuthToken } from "../lib/userApi";

const TYPE_COLOR_CLASSES = {
  booking_confirmed: {
    iconWrap: "bg-emerald-50",
    iconColor: "text-emerald-700",
  },
  booking_cancelled: {
    iconWrap: "bg-red-50",
    iconColor: "text-red-700",
  },
  message: {
    iconWrap: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  review: {
    iconWrap: "bg-amber-50",
    iconColor: "text-amber-700",
  },
  default: {
    iconWrap: "bg-stone-100",
    iconColor: "text-stone-500",
  },
};

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
    return TYPE_COLOR_CLASSES[type] || TYPE_COLOR_CLASSES.default;
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
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setLoading(true);
          fetchNotifications().finally(() => setLoading(false));
        }}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full border-none text-stone-900 transition-all hover:bg-stone-100 ${isOpen ? "bg-stone-100" : "bg-transparent"}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-[0_2px_6px_rgba(194,99,58,0.4)]">
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
            className="absolute right-0 top-[50px] z-[1000] w-[380px] max-h-[500px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
          >
            <div className="flex items-center justify-between border-b border-black/10 bg-stone-50 px-5 py-4">
              <div className="flex items-center gap-2">
                <h3 className="m-0 text-base font-semibold text-stone-900">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="rounded-lg border-none bg-transparent px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center gap-3 p-10 text-stone-500">
                  <Loader2 size={32} className="animate-spin" />
                  <p className="m-0 text-sm">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-10 text-center text-stone-500">
                  <Bell size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="m-0 text-sm font-medium">All caught up!</p>
                  <p className="mt-2 text-[13px] opacity-70">You have no new notifications</p>
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
                      className={`flex cursor-pointer gap-3 border-b border-black/5 px-5 py-3.5 transition-colors hover:bg-stone-50 ${notification.isRead ? "bg-white" : "bg-amber-50/40"}`}
                    >
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${colors.iconWrap}`}>
                        <Icon size={16} className={colors.iconColor} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <h4 className="m-0 text-sm font-semibold text-stone-900">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-red-600" />
                          )}
                        </div>
                        <p className="mb-1.5 text-[13px] leading-[1.4] text-stone-500">
                          {notification.message}
                        </p>
                        <span className="text-[11px] text-stone-400">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
            {notifications.length > 0 && (
              <div className="border-t border-black/10 bg-stone-50 px-5 py-3 text-center">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setIsOpen(false);
                  }}
                  className="rounded-lg border-none bg-transparent px-4 py-2 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
