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
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: 20
          }}
        >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          style={{
            background: '#fff',
            borderRadius: 20,
            width: '100%',
            maxWidth: 900,
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 25px 80px rgba(0,0,0,0.4)'
          }}
        >
          {}
          <div style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
            padding: 30,
            color: '#fff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <CheckCircle size={32} />
                  <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
                    We've Found You Alternative Accommodation
                  </h2>
                </div>
                <p style={{ margin: 0, fontSize: 15, opacity: 0.9 }}>
                  Your original booking was cancelled: "{reason}"
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  padding: 10,
                  borderRadius: 10,
                  cursor: 'pointer',
                  display: 'flex',
                  color: '#fff'
                }}
              >
                <X size={22} />
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
            height: 'calc(90vh - 220px)',
            maxHeight: 600
          }}>
            {/* Alternatives List */}
            <div style={{
              borderRight: '1px solid #e5e7eb',
              overflowY: 'auto',
              padding: 16
            }}>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: 14,
                fontWeight: 600,
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
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
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      border: `2px solid ${isSelected ? '#0d9488' : '#e5e7eb'}`,
                      background: isSelected ? '#f0fdfa' : '#fff',
                      marginBottom: 12,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', gap: 10 }}>
                      <img
                        src={getListingImage(alt)}
                        alt={alt.title}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          objectFit: 'cover'
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{
                          margin: '0 0 4px 0',
                          fontSize: 13,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {alt.title}
                        </h4>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12,
                          color: '#6b7280',
                          marginBottom: 6
                        }}>
                          <Star size={12} fill="#fbbf24" color="#fbbf24" />
                          <span>{alt.rating?.toFixed(1) || '4.5'}</span>
                          <span style={{ opacity: 0.5 }}>•</span>
                          <span>{formatPrice(alt.price)}</span>
                        </div>
                        <div style={{
                          background: score >= 80 ? '#dcfce7' : score >= 60 ? '#fef3c7' : '#fee2e2',
                          color: score >= 80 ? '#166534' : score >= 60 ? '#92400e' : '#991b1b',
                          padding: '2px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          display: 'inline-block'
                        }}>
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
              <div style={{ overflowY: 'auto', padding: 24 }}>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: 250,
                  borderRadius: 16,
                  overflow: 'hidden',
                  marginBottom: 20
                }}>
                  <img
                    src={getListingImage(selectedAlternative)}
                    alt={selectedAlternative.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: similarityScore >= 80 ? '#10b981' : '#f59e0b',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}>
                    <TrendingUp size={16} />
                    {similarityScore}% Match
                  </div>
                </div>

                <h2 style={{ margin: '0 0 8px 0', fontSize: 22, fontWeight: 700 }}>
                  {selectedAlternative.title}
                </h2>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  marginBottom: 20
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={16} color="#6b7280" />
                    <span style={{ fontSize: 14, color: '#6b7280' }}>
                      {selectedAlternative.location || selectedAlternative.city}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                      {selectedAlternative.rating?.toFixed(1) || '4.5'}
                    </span>
                    <span style={{ fontSize: 14, color: '#6b7280' }}>
                      ({selectedAlternative.reviewCount || 0} reviews)
                    </span>
                  </div>
                </div>

                {/* Price Comparison */}
                <div style={{
                  background: priceDifference > 0 ? '#fef3c7' : priceDifference < 0 ? '#dcfce7' : '#f3f4f6',
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 20
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontSize: 13, color: '#6b7280' }}>
                        Original Price
                      </p>
                      <p style={{ margin: 0, fontSize: 18, fontWeight: 600, textDecoration: 'line-through', opacity: 0.6 }}>
                        {formatPrice(originalBooking.totalPrice || originalBooking.price)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: 13, color: '#6b7280' }}>
                        New Price
                      </p>
                      <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0d9488' }}>
                        {formatPrice(selectedAlternative.price)}
                      </p>
                    </div>
                  </div>
                  {priceDifference !== 0 && (
                    <div style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: '1px solid rgba(0,0,0,0.1)',
                      fontSize: 13,
                      fontWeight: 600,
                      color: priceDifference > 0 ? '#92400e' : '#166534'
                    }}>
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
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600 }}>
                      Amenities
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {selectedAlternative.amenities.slice(0, 6).map((amenity, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '6px 12px',
                            background: '#f3f4f6',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <Check size={14} color="#10b981" />
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button
                    onClick={handleReject}
                    disabled={rejecting || accepting}
                    style={{
                      flex: 1,
                      padding: '14px 24px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 12,
                      background: '#fff',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: rejecting || accepting ? 'not-allowed' : 'pointer',
                      opacity: rejecting || accepting ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    {rejecting ? (
                      <>
                        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
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
                    style={{
                      flex: 2,
                      padding: '14px 24px',
                      border: 'none',
                      borderRadius: 12,
                      background: accepting || rejecting
                        ? '#d1d5db'
                        : 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                      color: '#fff',
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: accepting || rejecting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 16px rgba(13, 148, 136, 0.4)'
                    }}
                  >
                    {accepting ? (
                      <>
                        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
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

                <p style={{
                  margin: '16px 0 0 0',
                  fontSize: 12,
                  color: '#6b7280',
                  textAlign: 'center'
                }}>
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
