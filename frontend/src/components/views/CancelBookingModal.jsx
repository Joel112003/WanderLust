import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:8000";

const CancelBookingModal = ({ isOpen, onClose, booking, onCancelSuccess }) => {
  const [reason, setReason] = useState("");
  const [autoRebook, setAutoRebook] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: false,
  });
  const [loading, setLoading] = useState(false);
  const [isLastMinute, setIsLastMinute] = useState(false);

  useEffect(() => {
    if (booking) {

      const checkInDate = new Date(booking.checkIn);
      const today = new Date();
      const daysUntilCheckIn = Math.ceil(
        (checkInDate - today) / (1000 * 60 * 60 * 24)
      );
      setIsLastMinute(daysUntilCheckIn <= 7);
    }
  }, [booking]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        `${API_URL}/bookings/${booking._id}/cancel-by-owner`,
        {
          reason: reason.trim(),
          autoRebook,
          notifications,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(response.data.message || "Booking cancelled successfully");

      if (autoRebook && response.data.rebookingResult) {
        const { alternativesFound, autoRebooked } = response.data.rebookingResult;
        if (alternativesFound > 0) {
          toast.success(
            `Found ${alternativesFound} alternative listing${
              alternativesFound !== 1 ? "s" : ""
            } for the guest`,
            { duration: 5000 }
          );
        } else {
          toast(
            "No suitable alternatives found. Guest will be notified for manual rebooking.",
            { duration: 5000 }
          );
        }
      }

      onCancelSuccess();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to cancel booking. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationToggle = (channel) => {
    setNotifications((prev) => ({
      ...prev,
      [channel]: !prev[channel],
    }));
  };

  const calculateRefundAmount = () => {
    if (!booking) return 0;

    return isLastMinute
      ? (booking.totalPrice * 0.5).toFixed(2)
      : booking.totalPrice;
  };

  if (!isOpen || !booking) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
<div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-5 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Cancel Booking</h2>
                <p className="text-red-100 text-sm mt-1">
                  Cancel this booking and notify the guest
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
{isLastMinute && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <h4 className="font-bold text-red-900 mb-1">
                      ⚠️ Last-Minute Cancellation
                    </h4>
                    <p className="text-red-800 text-sm">
                      This booking is less than 7 days away. Last-minute
                      cancellations may impact your host rating and may result
                      in penalties. The guest will be offered automatic
                      rebooking to minimize disruption.
                    </p>
                  </div>
                </div>
              </div>
            )}
<div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Booking Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Guest:</span>
                  <span className="font-medium text-gray-900">
                    {booking.user?.name || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Listing:</span>
                  <span className="font-medium text-gray-900">
                    {booking.listing?.title || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(booking.checkIn).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(booking.checkOut).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium text-gray-900">
                    ${booking.totalPrice?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="text-gray-600">Estimated Refund:</span>
                  <span className="font-bold text-green-600">
                    ${calculateRefundAmount()}
                  </span>
                </div>
              </div>
            </div>
<div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Cancellation Reason *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a detailed reason for cancelling this booking. This will be shared with the guest."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={4}
                maxLength={500}
                required
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Be professional and courteous
                </p>
                <p className="text-xs text-gray-500">{reason.length}/500</p>
              </div>
            </div>
<div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="autoRebook"
                  checked={autoRebook}
                  onChange={(e) => setAutoRebook(e.target.checked)}
                  className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <div className="flex-1">
                  <label
                    htmlFor="autoRebook"
                    className="font-medium text-gray-900 cursor-pointer"
                  >
                    Find alternative accommodation for guest
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    We'll automatically search for similar available listings
                    and offer them to the guest. This helps maintain your
                    reputation and ensures guest satisfaction.
                    {isLastMinute && (
                      <span className="block mt-1 font-medium text-teal-800">
                        ✓ Highly recommended for last-minute cancellations
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Notification Channels */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Notify Guest Via
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    id="notifyEmail"
                    checked={notifications.email}
                    onChange={() => handleNotificationToggle("email")}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <label
                    htmlFor="notifyEmail"
                    className="flex-1 cursor-pointer"
                  >
                    <span className="font-medium text-gray-900">
                      📧 Email
                    </span>
                    <span className="text-sm text-gray-600 block">
                      Send cancellation details to guest's email
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    id="notifySms"
                    checked={notifications.sms}
                    onChange={() => handleNotificationToggle("sms")}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <label htmlFor="notifySms" className="flex-1 cursor-pointer">
                    <span className="font-medium text-gray-900">
                      📱 SMS (Optional)
                    </span>
                    <span className="text-sm text-gray-600 block">
                      Send text message to guest's phone
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    id="notifyPush"
                    checked={notifications.push}
                    onChange={() => handleNotificationToggle("push")}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <label
                    htmlFor="notifyPush"
                    className="flex-1 cursor-pointer"
                  >
                    <span className="font-medium text-gray-900">
                      🔔 Push Notification
                    </span>
                    <span className="text-sm text-gray-600 block">
                      Send instant notification to guest's app
                    </span>
                  </label>
                </div>
              </div>
            </div>
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">
                📋 Cancellation Policy Notice
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>
                  • The guest will receive a refund according to the
                  cancellation policy
                </li>
                <li>
                  • This cancellation may affect your host performance rating
                </li>
                <li>
                  • The calendar will be automatically unblocked for new
                  bookings
                </li>
                {isLastMinute && (
                  <li className="font-medium">
                    • Last-minute cancellations may impact future booking
                    visibility
                  </li>
                )}
              </ul>
            </div>
<div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Keep Booking
              </button>
              <button
                type="submit"
                disabled={loading || !reason.trim()}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Cancelling...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Cancel Booking
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CancelBookingModal;
