import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import * as I from "lucide-react";

const API_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:8000";

const AlternativeBookingsModal = ({ isOpen, onClose, alternatives = [], onAccept }) => {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setSelected(null);
      setLoading(false);
    }
  }, [isOpen]);

  const now = new Date();
  const pendingAlternatives = alternatives.filter(alt =>
    alt.status === 'pending_user_response' &&
    new Date(alt.expiresAt) > now
  );

  useEffect(() => {
    if (!pendingAlternatives.length) return;

    const updateTimer = () => {
      const newTimes = {};
      pendingAlternatives.forEach(alt => {
        const now = new Date().getTime();
        const expiry = new Date(alt.expiresAt).getTime();
        const diff = expiry - now;

        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          newTimes[alt._id] = { hours, minutes, seconds, expired: false };
        } else {
          newTimes[alt._id] = { hours: 0, minutes: 0, seconds: 0, expired: true };
        }
      });
      setTimeRemaining(newTimes);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [pendingAlternatives]);

  const handleAccept = async (alternativeId, listingId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        `${API_URL}/api/alternative-bookings/${alternativeId}/respond`,
        {
          accept: true,
          selectedListingId: listingId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Alternative booking confirmed! 🎉");
      if (onAccept) onAccept(response.data);

      setSelected(null);
      onClose();
    } catch (error) {
      console.error("Error accepting alternative:", error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Failed to accept alternative";

      if (errorMsg.includes("already been processed")) {
        toast.error("This offer has already been processed. Refreshing...");
        setTimeout(() => {
          onClose();
          if (onAccept) onAccept(null);
        }, 1500);
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (alternativeId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      await axios.post(
        `${API_URL}/api/alternative-bookings/${alternativeId}/respond`,
        {
          accept: false,
          rejectionReason: "No suitable alternatives found"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Alternatives declined. Support will contact you.");

      setSelected(null);
      onClose();
    } catch (error) {
      console.error("Error rejecting alternatives:", error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Failed to reject alternatives";

      if (errorMsg.includes("already been processed")) {
        toast.error("This offer has already been processed. Refreshing...");
        setTimeout(() => {
          onClose();
          if (onAccept) onAccept(null);
        }, 1500);
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getImageUrl = (listing) => {
    if (listing?.images && listing.images.length > 0) {
      return listing.images[0]?.url || listing.images[0];
    }
    if (listing?.image?.url) return listing.image.url;
    return "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400";
  };

  if (!isOpen || !pendingAlternatives.length) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
<div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Alternative Accommodations Available
                </h2>
                <p className="text-gray-600 text-sm">
                  Your booking was cancelled. We've found similar properties for you!
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-lg transition">
                <I.X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Alternatives List */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 180px)" }}>
            {pendingAlternatives.map((alt) => {
              const timer = timeRemaining[alt._id];
              const originalListing = alt.originalBooking?.listing;

              return (
                <div key={alt._id} className="mb-6">
                  {/* Timer Warning */}
                  <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
                    <I.Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-orange-800">
                      {timer?.expired ? (
                        <span className="font-semibold">This offer has expired</span>
                      ) : (
                        <>
                          <span className="font-semibold">Time remaining:</span>{" "}
                          {timer?.hours}h {timer?.minutes}m {timer?.seconds}s
                        </>
                      )}
                    </span>
                  </div>

                  {/* Original Booking Info */}
                  {originalListing && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Originally Booked:
                      </h3>
                      <p className="text-sm text-gray-600">{originalListing.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(alt.originalBooking.checkIn).toLocaleDateString()} - {new Date(alt.originalBooking.checkOut).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* Suggested Listings */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Available Alternatives:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {alt.suggestedListings?.map((suggestion) => {
                      const listing = suggestion.listing;
                      if (!listing) return null;

                      const isSelected = selected?._id === listing._id;

                      return (
                        <motion.div
                          key={listing._id}
                          whileHover={{ y: -2 }}
                          className={`border-2 rounded-xl overflow-hidden cursor-pointer transition ${
                            isSelected
                              ? "border-red-500 shadow-lg"
                              : "border-gray-200 hover:border-red-300"
                          }`}
                          onClick={() => setSelected({ ...listing, alternativeId: alt._id })}>

                          {/* Image */}
                          <div className="relative h-48">
                            <img
                              src={getImageUrl(listing)}
                              alt={listing.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400";
                              }}
                            />
                            {suggestion.similarityScore && (
                              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                {suggestion.similarityScore}% Match
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded-full">
                                <I.Check className="w-4 h-4" />
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                              {listing.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                              <I.MapPin className="w-3 h-3" />
                              {listing.location}
                            </p>
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                              <span className="flex items-center gap-1">
                                <I.Users className="w-3 h-3" />
                                {listing.guests} guests
                              </span>
                              <span className="flex items-center gap-1">
                                <I.Bed className="w-3 h-3" />
                                {listing.bedrooms} beds
                              </span>
                              <span className="flex items-center gap-1">
                                <I.Bath className="w-3 h-3" />
                                {listing.baths} baths
                              </span>
                            </div>
                            <div className="text-lg font-bold text-red-600">
                              {formatPrice(listing.price)}/night
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleAccept(alt._id, selected?.listing?._id || selected?._id)}
                      disabled={!selected || loading || timer?.expired}
                      className="flex-1 py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <I.Check className="w-5 h-5" />
                          Accept Selected
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(alt._id)}
                      disabled={loading}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition">
                      Decline All
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AlternativeBookingsModal;
