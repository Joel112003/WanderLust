import axios from 'axios';
import { safeGetItem } from './storage';

const API_URL = import.meta?.env?.VITE_APP_API_URL || 'http://localhost:8000';

export const sendCancellationNotification = async ({
  bookingIds,
  reason,
  cancelType,
  listingTitle,
  alternativeOffered = false
}) => {
  try {
    const token = safeGetItem('authToken');

    const response = await axios.post(
      `${API_URL}/notifications/cancellation`,
      {
        bookingIds,
        reason,
        cancelType,
        listingTitle,
        alternativeOffered,
        channels: ['email', 'sms', 'push']
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to send cancellation notification:', error);
    throw error;
  }
};

export const sendReportAcknowledgment = async ({
  userId,
  reportId,
  reportType,
  listingTitle,
  rebookingRequested
}) => {
  try {
    const token = safeGetItem('authToken');

    const response = await axios.post(
      `${API_URL}/notifications/report-acknowledgment`,
      {
        userId,
        reportId,
        reportType,
        listingTitle,
        rebookingRequested,
        channels: ['email', 'sms']
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to send report acknowledgment:', error);
    throw error;
  }
};

export const sendAlternativeAccommodationNotification = async ({
  userId,
  originalBooking,
  newListing,
  priceDifference
}) => {
  try {
    const token = safeGetItem('authToken');

    const response = await axios.post(
      `${API_URL}/notifications/alternative-accommodation`,
      {
        userId,
        originalBooking,
        newListing,
        priceDifference,
        channels: ['email', 'sms', 'push']
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to send alternative accommodation notification:', error);
    throw error;
  }
};

export const sendSMSVerification = async (phone, code) => {
  try {
    const response = await axios.post(
      `${API_URL}/notifications/sms/verify`,
      { phone, code }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to send SMS verification:', error);
    throw error;
  }
};

export const sendBookingConfirmation = async (booking) => {
  try {
    const token = safeGetItem('authToken');

    const response = await axios.post(
      `${API_URL}/notifications/booking-confirmation`,
      {
        bookingId: booking._id,
        channels: ['email', 'sms']
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to send booking confirmation:', error);
    throw error;
  }
};

export const sendReminder = async ({
  userId,
  type,
  booking,
  hoursBeforeEvent
}) => {
  try {
    const token = safeGetItem('authToken');

    const response = await axios.post(
      `${API_URL}/notifications/reminder`,
      {
        userId,
        type,
        bookingId: booking._id,
        hoursBeforeEvent,
        channels: ['email', 'sms', 'push']
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to send reminder:', error);
    throw error;
  }
};

export const sendEmergencyAlert = async ({
  reportId,
  reportType,
  severity,
  bookingId,
  userId
}) => {
  try {
    const token = safeGetItem('authToken');

    const response = await axios.post(
      `${API_URL}/notifications/emergency-alert`,
      {
        reportId,
        reportType,
        severity,
        bookingId,
        userId,
        channels: ['email', 'sms', 'slack']
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to send emergency alert:', error);
    throw error;
  }
};

export const getNotificationPreferences = async () => {
  try {
    const token = safeGetItem('authToken');

    const response = await axios.get(
      `${API_URL}/notifications/preferences`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('Failed to get notification preferences:', error);
    return {
      email: true,
      sms: true,
      push: true
    };
  }
};

export const updateNotificationPreferences = async (preferences) => {
  try {
    const token = safeGetItem('authToken');

    const response = await axios.put(
      `${API_URL}/notifications/preferences`,
      preferences,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to update notification preferences:', error);
    throw error;
  }
};

export default {
  sendCancellationNotification,
  sendReportAcknowledgment,
  sendAlternativeAccommodationNotification,
  sendSMSVerification,
  sendBookingConfirmation,
  sendReminder,
  sendEmergencyAlert,
  getNotificationPreferences,
  updateNotificationPreferences
};
