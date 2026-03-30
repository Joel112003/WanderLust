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
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#fff',
            borderRadius: 16,
            width: '100%',
            maxWidth: 600,
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
        >
          {}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <AlertTriangle size={24} color="#ef4444" />
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
                Cancel Listing
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                padding: 8,
                cursor: 'pointer',
                borderRadius: 8,
                display: 'flex'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {}
          <div style={{ padding: 24 }}>
            {}
            <div style={{
              background: '#f9fafb',
              padding: 16,
              borderRadius: 12,
              marginBottom: 20
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>
                {listing?.title}
              </h3>
              <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>
                {listing?.location || listing?.city}
              </p>
            </div>

            {}
            {affectedBookings.length > 0 && (
              <div style={{
                background: hasLastMinuteBookings ? '#fef2f2' : '#fffbeb',
                border: `1px solid ${hasLastMinuteBookings ? '#fecaca' : '#fde68a'}`,
                borderRadius: 12,
                padding: 16,
                marginBottom: 20
              }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                  <AlertTriangle
                    size={20}
                    color={hasLastMinuteBookings ? '#ef4444' : '#f59e0b'}
                  />
                  <div>
                    <h4 style={{
                      margin: '0 0 8px 0',
                      fontSize: 14,
                      fontWeight: 600,
                      color: hasLastMinuteBookings ? '#991b1b' : '#92400e'
                    }}>
                      {affectedBookings.length} Active Booking(s) Will Be Affected
                    </h4>

                    {lastMinuteBookings.length > 0 && (
                      <p style={{
                        margin: '0 0 8px 0',
                        fontSize: 13,
                        color: '#991b1b'
                      }}>
                        <Clock size={14} style={{
                          display: 'inline',
                          verticalAlign: 'middle',
                          marginRight: 4
                        }} />
                        {lastMinuteBookings.length} booking(s) within 7 days (Last minute)
                      </p>
                    )}

                    {regularBookings.length > 0 && (
                      <p style={{
                        margin: 0,
                        fontSize: 13,
                        color: '#92400e'
                      }}>
                        <Calendar size={14} style={{
                          display: 'inline',
                          verticalAlign: 'middle',
                          marginRight: 4
                        }} />
                        {regularBookings.length} booking(s) with advance notice
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 8
              }}>
                Cancellation Type
              </label>
              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{
                  flex: 1,
                  padding: 12,
                  border: `2px solid ${cancelType === 'permanent' ? '#0d9488' : '#e5e7eb'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: cancelType === 'permanent' ? '#f0fdfa' : '#fff'
                }}>
                  <input
                    type="radio"
                    value="permanent"
                    checked={cancelType === 'permanent'}
                    onChange={(e) => setCancelType(e.target.value)}
                    style={{ marginRight: 8 }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>
                    Permanent (Remove listing)
                  </span>
                </label>

                <label style={{
                  flex: 1,
                  padding: 12,
                  border: `2px solid ${cancelType === 'temporary' ? '#0d9488' : '#e5e7eb'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: cancelType === 'temporary' ? '#f0fdfa' : '#fff'
                }}>
                  <input
                    type="radio"
                    value="temporary"
                    checked={cancelType === 'temporary'}
                    onChange={(e) => setCancelType(e.target.value)}
                    style={{ marginRight: 8 }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>
                    Temporary (Just bookings)
                  </span>
                </label>
              </div>
            </div>

            {}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 8
              }}>
                Reason for Cancellation *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please explain why you need to cancel. This will be shared with affected guests..."
                style={{
                  width: '100%',
                  minHeight: 100,
                  padding: 12,
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                maxLength={500}
              />
              <p style={{
                margin: '4px 0 0 0',
                fontSize: 12,
                color: '#6b7280',
                textAlign: 'right'
              }}>
                {reason.length}/500
              </p>
            </div>

            {}
            {affectedBookings.length > 0 && (
              <div style={{
                marginBottom: 20,
                padding: 16,
                background: '#f9fafb',
                borderRadius: 8
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={sendNotification}
                    onChange={(e) => setSendNotification(e.target.checked)}
                    style={{ width: 16, height: 16 }}
                  />
                  <span style={{ fontSize: 14 }}>
                    Send email & SMS notifications to affected guests
                  </span>
                </label>

                {hasLastMinuteBookings && (
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={autoRebook}
                      onChange={(e) => setAutoRebook(e.target.checked)}
                      style={{ width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: 14 }}>
                      Automatically find alternative listings for last-minute bookings
                    </span>
                  </label>
                )}
              </div>
            )}

            {}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={onClose}
                disabled={cancelling}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  background: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                  opacity: cancelling ? 0.5 : 1
                }}
              >
                Keep Listing
              </button>

              <button
                onClick={handleCancel}
                disabled={cancelling || !reason.trim()}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: 8,
                  background: cancelling || !reason.trim() ? '#d1d5db' : '#ef4444',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: cancelling || !reason.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {cancelling ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
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
