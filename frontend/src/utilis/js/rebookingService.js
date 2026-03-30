import axios from 'axios';
import { safeGetItem } from './storage';

const API_URL = import.meta?.env?.VITE_APP_API_URL || 'http://localhost:8000';

export const findAlternativeListings = async (originalBooking, options = {}) => {
  try {
    const token = safeGetItem('authToken');

    const response = await axios.post(
      `${API_URL}/bookings/find-alternatives`,
      {
        originalBooking: {
          listingId: originalBooking.listing._id || originalBooking.listing,
          checkIn: originalBooking.checkIn,
          checkOut: originalBooking.checkOut,
          guests: originalBooking.guests,
          price: originalBooking.totalPrice || originalBooking.price,
          location: originalBooking.listing?.location || originalBooking.listing?.city,
          coordinates: originalBooking.listing?.geometry?.coordinates,
          amenities: originalBooking.listing?.amenities || []
        },
        searchCriteria: {
          priceRange: {
            min: (originalBooking.totalPrice || originalBooking.price) * 0.8,
            max: (originalBooking.totalPrice || originalBooking.price) * 1.2
          },
          radiusKm: options.radiusKm || 10,
          minRating: options.minRating || 4.0,
          matchAmenities: options.matchAmenities !== false,
          sortBy: options.sortBy || 'similarity',
          limit: options.limit || 10
        }
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return response.data.data || [];
  } catch (error) {
    console.error('Failed to find alternative listings:', error);
    throw error;
  }
};

export const autoRebookAlternative = async ({
  originalBookingId,
  alternativeListingId,
  reason,
  coverPriceDifference = true
}) => {
  try {
    const token = safeGetItem('authToken');

    const response = await axios.post(
      `${API_URL}/bookings/auto-rebook`,
      {
        originalBookingId,
        alternativeListingId,
        reason,
        coverPriceDifference,
        notifyGuest: true,
        notifyHost: true
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('Failed to auto-rebook:', error);
    throw error;
  }
};

export const calculateSimilarityScore = (original, alternative) => {
  let score = 0;
  let maxScore = 100;

  const priceDiff = Math.abs(
    (alternative.price - original.price) / original.price
  );
  score += Math.max(0, 30 - (priceDiff * 100));

  if (original.geometry?.coordinates && alternative.geometry?.coordinates) {
    const distance = calculateDistance(
      original.geometry.coordinates,
      alternative.geometry.coordinates
    );
    score += Math.max(0, 25 - (distance / 0.4));
  } else {
    score += 10;
  }

  const originalAmenities = new Set(original.amenities || []);
  const alternativeAmenities = new Set(alternative.amenities || []);
  const matchingAmenities = [...originalAmenities].filter(a =>
    alternativeAmenities.has(a)
  ).length;
  const amenityScore = originalAmenities.size > 0
    ? (matchingAmenities / originalAmenities.size) * 20
    : 10;
  score += amenityScore;

  const ratingScore = (alternative.rating || 3.5) / 5 * 15;
  score += ratingScore;

  if (original.category === alternative.category) {
    score += 10;
  }

  return Math.min(100, Math.round(score));
};

const calculateDistance = (coord1, coord2) => {
  const R = 6371;
  const dLat = toRad(coord2[1] - coord1[1]);
  const dLon = toRad(coord2[0] - coord1[0]);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1[1])) * Math.cos(toRad(coord2[1])) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees) => degrees * (Math.PI / 180);

export const checkRebookingEligibility = async (bookingId) => {
  try {
    const token = safeGetItem('authToken');

    const response = await axios.get(
      `${API_URL}/bookings/${bookingId}/rebooking-eligibility`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('Failed to check rebooking eligibility:', error);
    return {
      eligible: false,
      reason: 'Unable to verify eligibility'
    };
  }
};

export const processMassRebooking = async ({
  cancelledListingId,
  affectedBookingIds,
  reason,
  priorityOrder = 'check_in_date'
}) => {
  try {
    const token = safeGetItem('authToken');

    const response = await axios.post(
      `${API_URL}/bookings/mass-rebook`,
      {
        cancelledListingId,
        affectedBookingIds,
        reason,
        priorityOrder,
        autoAssign: true,
        coverPriceDifference: true
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('Failed to process mass rebooking:', error);
    throw error;
  }
};

export const submitAlternativeForApproval = async ({
  bookingId,
  alternativeListingId,
  message
}) => {
  try {
    const token = safeGetItem('authToken');

    const response = await axios.post(
      `${API_URL}/bookings/submit-alternative`,
      {
        bookingId,
        alternativeListingId,
        message,
        expiresIn: 24 * 60 * 60 * 1000
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('Failed to submit alternative:', error);
    throw error;
  }
};

export const respondToAlternative = async (alternativeId, accept, feedback = '') => {
  try {
    const token = safeGetItem('authToken');

    const response = await axios.post(
      `${API_URL}/bookings/alternatives/${alternativeId}/respond`,
      {
        accept,
        feedback
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('Failed to respond to alternative:', error);
    throw error;
  }
};

export const getRebookingHistory = async (userId) => {
  try {
    const token = safeGetItem('authToken');

    const response = await axios.get(
      `${API_URL}/bookings/rebooking-history${userId ? `?userId=${userId}` : ''}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return response.data.data || [];
  } catch (error) {
    console.error('Failed to get rebooking history:', error);
    return [];
  }
};

export default {
  findAlternativeListings,
  autoRebookAlternative,
  calculateSimilarityScore,
  checkRebookingEligibility,
  processMassRebooking,
  submitAlternativeForApproval,
  respondToAlternative,
  getRebookingHistory
};
