import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Calendar, Clock, Send, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { safeGetItem } from '../../utilis/js/storage';

const API_URL = import.meta?.env?.VITE_APP_API_URL || 'http://localhost:8000';

const CancelListingModal = ({
  isOpen,
  onClose,
  listing,
  affectedBookings = [],
  onCancelSuccess
}) => {
  const [reason, setReason] = useState('');
  const [cancelType, setCancelType] = useState('permanent');
  const [cancelling, setCancelling] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);
  const [autoRebook, setAutoRebook] = useState(true);

  const hasLastMinuteBookings = affectedBookings.some(booking => {
    const checkInDate = new Date(booking.checkIn);
    const daysUntilCheckIn = Math.ceil((checkInDate - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilCheckIn <= 7;
  });

  const lastMinuteBookings = affectedBookings.filter(booking => {
    const checkInDate = new Date(booking.checkIn);
    const daysUntilCheckIn = Math.ceil((checkInDate - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilCheckIn <= 7;
  });

  const regularBookings = affectedBookings.filter(booking => {
    const checkInDate = new Date(booking.checkIn);
    const daysUntilCheckIn = Math.ceil((checkInDate - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilCheckIn > 7;
  });

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    if (affectedBookings.length > 0 && !window.confirm(
      `This will affect ${affectedBookings.length} booking(s). Are you sure you want to continue?`
    )) {
      return;
    }

    setCancelling(true);

    try {
      const token = safeGetItem('authToken');

      const response = await axios.post(
        `${API_URL}/listings/${listing._id}/cancel`,
        {
          reason: reason.trim(),
          cancelType,
          sendNotification,
          autoRebook: autoRebook && hasLastMinuteBookings,
          affectedBookingIds: affectedBookings.map(b => b._id)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success(
          hasLastMinuteBookings && autoRebook
            ? 'Listing cancelled. Alternative accommodations are being arranged for affected guests.'
            : 'Listing cancelled successfully. Guests have been notified.'
        );

        onCancelSuccess?.(response.data.data);
        onClose();
      }
    } catch (error) {
      console.error('Cancellation error:', error);
      toast.error(
        error.response?.data?.message ||
        'Failed to cancel listing. Please try again.'
      );
    } finally {
      setCancelling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-5"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[90vh] w-full max-w-[600px] overflow-auto rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
        >
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle size={24} color="#ef4444" />
              <h2 className="m-0 text-xl font-semibold">
                Cancel Listing
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex rounded-lg p-2 transition-colors hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6">
            <div className="mb-5 rounded-xl bg-gray-50 p-4">
              <h3 className="mb-2 mt-0 text-base">
                {listing?.title}
              </h3>
              <p className="m-0 text-sm text-gray-500">
                {listing?.location || listing?.city}
              </p>
            </div>
{affectedBookings.length > 0 && (
              <div
                className={`mb-5 rounded-xl border p-4 ${hasLastMinuteBookings ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={20}
                    color={hasLastMinuteBookings ? '#ef4444' : '#f59e0b'}
                  />
                  <div>
                    <h4
                      className={`mb-2 mt-0 text-sm font-semibold ${hasLastMinuteBookings ? 'text-red-800' : 'text-amber-800'}`}
                    >
                      {affectedBookings.length} Active Booking(s) Will Be Affected
                    </h4>

                    {lastMinuteBookings.length > 0 && (
                      <p className="mb-2 mt-0 text-[13px] text-red-800">
                        <Clock size={14} className="mr-1 inline align-middle" />
                        {lastMinuteBookings.length} booking(s) within 7 days (Last minute)
                      </p>
                    )}

                    {regularBookings.length > 0 && (
                      <p className="m-0 text-[13px] text-amber-800">
                        <Calendar size={14} className="mr-1 inline align-middle" />
                        {regularBookings.length} booking(s) with advance notice
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold">
                Cancellation Type
              </label>
              <div className="flex gap-3">
                <label
                  className={`flex-1 cursor-pointer rounded-lg border-2 p-3 ${cancelType === 'permanent' ? 'border-teal-600 bg-teal-50' : 'border-gray-200 bg-white'}`}
                >
                  <input
                    type="radio"
                    value="permanent"
                    checked={cancelType === 'permanent'}
                    onChange={(e) => setCancelType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">
                    Permanent (Remove listing)
                  </span>
                </label>

                <label
                  className={`flex-1 cursor-pointer rounded-lg border-2 p-3 ${cancelType === 'temporary' ? 'border-teal-600 bg-teal-50' : 'border-gray-200 bg-white'}`}
                >
                  <input
                    type="radio"
                    value="temporary"
                    checked={cancelType === 'temporary'}
                    onChange={(e) => setCancelType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">
                    Temporary (Just bookings)
                  </span>
                </label>
              </div>
            </div>
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold">
                Reason for Cancellation *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please explain why you need to cancel. This will be shared with affected guests..."
                className="min-h-[100px] w-full resize-y rounded-lg border border-gray-300 p-3 text-sm"
                maxLength={500}
              />
              <p className="mb-0 mt-1 text-right text-xs text-gray-500">
                {reason.length}/500
              </p>
            </div>
{affectedBookings.length > 0 && (
              <div className="mb-5 rounded-lg bg-gray-50 p-4">
                <label className="mb-3 flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sendNotification}
                    onChange={(e) => setSendNotification(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">
                    Send email & SMS notifications to affected guests
                  </span>
                </label>

                {hasLastMinuteBookings && (
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={autoRebook}
                      onChange={(e) => setAutoRebook(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">
                      Automatically find alternative listings for last-minute bookings
                    </span>
                  </label>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={cancelling}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Keep Listing
              </button>

              <button
                onClick={handleCancel}
                disabled={cancelling || !reason.trim()}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white ${cancelling || !reason.trim() ? 'cursor-not-allowed bg-gray-300' : 'bg-red-500 hover:bg-red-600'}`}
              >
                {cancelling ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Confirm Cancellation
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CancelListingModal;
