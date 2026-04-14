import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  X,
  MapPin,
  Star,
  Users,
  Wifi,
  Home,
  TrendingUp,
  AlertCircle,
  Check,
  Loader2
} from 'lucide-react';
import { formatPrice, getListingImage } from '../../utilis/js/formatters';
import {
  respondToAlternative,
  calculateSimilarityScore
} from '../../utilis/js/rebookingService';
import toast from 'react-hot-toast';

const AlternativeAccommodationModal = ({
  isOpen,
  onClose,
  originalBooking,
  alternatives = [],
  reason,
  onAccept
}) => {
  const [selectedAlternative, setSelectedAlternative] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedAlternative(null);
      setAccepting(false);
      setRejecting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && alternatives.length > 0 && !selectedAlternative) {
      setSelectedAlternative(alternatives[0]);
    }
  }, [isOpen, alternatives.length]);

  const handleAccept = async () => {
    if (!selectedAlternative) return;

    setAccepting(true);

    try {
      await respondToAlternative(selectedAlternative._id, true);

      toast.success(
        '🎉 Great! Your new accommodation has been confirmed.',
        { duration: 5000 }
      );

      onAccept?.(selectedAlternative);
      onClose();
    } catch (error) {
      toast.error('Failed to confirm alternative. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);

    try {
      if (selectedAlternative) {
        await respondToAlternative(
          selectedAlternative._id,
          false,
          'User requested different options'
        );
      }

      toast('Our support team will contact you with more options.', {
        icon: '📞',
        duration: 5000
      });

      onClose();
    } catch (error) {
      toast.error('Failed to process request. Please contact support.');
    } finally {
      setRejecting(false);
    }
  };

  if (!isOpen || alternatives.length === 0) return null;

  const priceDifference = selectedAlternative
    ? selectedAlternative.price - (originalBooking.totalPrice || originalBooking.price)
    : 0;

  const similarityScore = selectedAlternative && originalBooking.listing
    ? calculateSimilarityScore(originalBooking.listing, selectedAlternative)
    : 0;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="alternative-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-5"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-[900px] max-h-[90vh] overflow-hidden rounded-[20px] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.4)]"
          >
            <div className="bg-gradient-to-br from-teal-600 to-teal-500 p-7.5 text-white">
              <div className="flex items-start justify-between gap-4">
              <div>
                  <div className="mb-2 flex items-center gap-3">
                  <CheckCircle size={32} />
                    <h2 className="m-0 text-2xl font-bold">
                    We've Found You Alternative Accommodation
                  </h2>
                </div>
                  <p className="m-0 text-[15px] opacity-90">
                  Your original booking was cancelled: "{reason}"
                </p>
              </div>
              <button
                onClick={onClose}
                  className="flex rounded-[10px] bg-white/20 p-2.5 text-white transition-colors hover:bg-white/30"
              >
                <X size={22} />
              </button>
            </div>
          </div>

            <div className="grid h-[calc(90vh-220px)] max-h-[600px] grid-cols-[300px_1fr]">
            {/* Alternatives List */}
              <div className="overflow-y-auto border-r border-gray-200 p-4">
                <h3 className="mb-3 mt-0 text-sm font-semibold uppercase tracking-[0.5px] text-gray-500">
                Available Options ({alternatives.length})
              </h3>

              {alternatives.map((alt, index) => {
                const score = calculateSimilarityScore(originalBooking.listing, alt);
                const isSelected = selectedAlternative?._id === alt._id;

                return (
                  <motion.div
                    key={alt._id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedAlternative(alt)}
                    className={`mb-3 cursor-pointer rounded-xl border-2 p-3 transition-all ${isSelected ? 'border-teal-600 bg-teal-50' : 'border-gray-200 bg-white'}`}
                  >
                      <div className="flex gap-2.5">
                      <img
                        src={getListingImage(alt)}
                        alt={alt.title}
                          className="h-[60px] w-[60px] rounded-lg object-cover"
                      />
                        <div className="min-w-0 flex-1">
                          <h4 className="mb-1 mt-0 truncate text-[13px] font-semibold">
                          {alt.title}
                        </h4>
                          <div className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-500">
                            <Star size={12} fill="#fbbf24" color="#fbbf24" />
                          <span>{alt.rating?.toFixed(1) || '4.5'}</span>
                            <span className="opacity-50">•</span>
                          <span>{formatPrice(alt.price)}</span>
                        </div>
                          <div
                            className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ${score >= 80 ? 'bg-green-100 text-green-800' : score >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}
                          >
                            {score}% Match
                          </div>
                        </div>
                      </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Selected Alternative Details */}
            {selectedAlternative && (
                <div className="overflow-y-auto p-6">
                  <div className="relative mb-5 h-[250px] w-full overflow-hidden rounded-2xl">
                  <img
                    src={getListingImage(selectedAlternative)}
                    alt={selectedAlternative.title}
                      className="h-full w-full object-cover"
                  />
                    <div
                      className={`absolute right-4 top-4 flex items-center gap-1.5 rounded-[10px] px-4 py-2 text-sm font-bold text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)] ${similarityScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    >
                    <TrendingUp size={16} />
                    {similarityScore}% Match
                  </div>
                </div>

                  <h2 className="mb-2 mt-0 text-[22px] font-bold">
                  {selectedAlternative.title}
                </h2>

                  <div className="mb-5 flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                    <MapPin size={16} color="#6b7280" />
                      <span className="text-sm text-gray-500">
                      {selectedAlternative.location || selectedAlternative.city}
                    </span>
                  </div>
                    <div className="flex items-center gap-1.5">
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                      <span className="text-sm font-semibold">
                      {selectedAlternative.rating?.toFixed(1) || '4.5'}
                    </span>
                      <span className="text-sm text-gray-500">
                      ({selectedAlternative.reviewCount || 0} reviews)
                    </span>
                  </div>
                </div>

                {/* Price Comparison */}
                  <div
                    className={`mb-5 rounded-xl p-4 ${priceDifference > 0 ? 'bg-amber-100' : priceDifference < 0 ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    <div className="flex items-center justify-between">
                    <div>
                        <p className="mb-1 mt-0 text-[13px] text-gray-500">
                        Original Price
                      </p>
                        <p className="m-0 text-lg font-semibold opacity-60 line-through">
                        {formatPrice(originalBooking.totalPrice || originalBooking.price)}
                      </p>
                    </div>
                      <div className="text-right">
                        <p className="mb-1 mt-0 text-[13px] text-gray-500">
                        New Price
                      </p>
                        <p className="m-0 text-[22px] font-bold text-teal-600">
                        {formatPrice(selectedAlternative.price)}
                      </p>
                    </div>
                  </div>
                  {priceDifference !== 0 && (
                      <div
                        className={`mt-3 border-t border-black/10 pt-3 text-[13px] font-semibold ${priceDifference > 0 ? 'text-amber-800' : 'text-green-800'}`}
                      >
                      {priceDifference > 0 ? '💰 ' : '🎉 '}
                      {priceDifference > 0
                        ? `Price difference of ${formatPrice(Math.abs(priceDifference))} will be covered by us`
                        : `You save ${formatPrice(Math.abs(priceDifference))} - refund will be processed`
                      }
                    </div>
                  )}
                </div>

                {/* Amenities */}
                {selectedAlternative.amenities && selectedAlternative.amenities.length > 0 && (
                    <div className="mb-5">
                      <h4 className="mb-3 mt-0 text-sm font-semibold">
                      Amenities
                    </h4>
                      <div className="flex flex-wrap gap-2">
                      {selectedAlternative.amenities.slice(0, 6).map((amenity, i) => (
                        <div
                          key={i}
                            className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium"
                        >
                          <Check size={14} color="#10b981" />
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                  <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleReject}
                    disabled={rejecting || accepting}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3.5 text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {rejecting ? (
                      <>
                          <Loader2 size={18} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <AlertCircle size={18} />
                        Show More Options
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleAccept}
                    disabled={accepting || rejecting}
                      className={`flex flex-[2] items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-bold text-white shadow-[0_4px_16px_rgba(13,148,136,0.4)] ${accepting || rejecting ? 'cursor-not-allowed bg-gray-300' : 'bg-gradient-to-br from-teal-600 to-teal-500'}`}
                  >
                    {accepting ? (
                      <>
                          <Loader2 size={20} className="animate-spin" />
                        Confirming Booking...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Confirm This Accommodation
                      </>
                    )}
                  </button>
                </div>

                  <p className="mb-0 mt-4 text-center text-xs text-gray-500">
                  ✨ Same dates • Same guests • Premium support included
                </p>
              </div>
            )}
          </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlternativeAccommodationModal;
