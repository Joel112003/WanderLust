import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, MapPin, Users, Bed, Bath, Wifi, Shield, Award, CheckCircle } from 'lucide-react';
import TrustBadge from '../trust/TrustBadge';
import axios from 'axios';

const API_URL = import.meta?.env?.VITE_APP_API_URL || 'http://localhost:8000';

const EnhancedListingCard = ({ listing }) => {
  const navigate = useNavigate();
  const [trustMetrics, setTrustMetrics] = useState(null);
  const [pricingData, setPricingData] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrustMetrics();
    fetchPricing();
  }, [listing._id]);

  const fetchTrustMetrics = async () => {
    try {
      const response = await axios.get(`${API_URL}/trust/listing-trust/${listing._id}`);
      setTrustMetrics(response.data.data);
    } catch (err) {
      console.error('Error fetching trust metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPricing = async () => {
    try {
      const response = await axios.get(`${API_URL}/trust/transparent-pricing/${listing._id}?nights=1`);
      setPricingData(response.data.data.pricing);
    } catch (err) {
      console.error('Error fetching pricing:', err);
    }
  };

  const toggleWishlist = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/auth/login');
      return;
    }

    try {
      if (isWishlisted) {
        await axios.delete(`${API_URL}/wishlist/${listing._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsWishlisted(false);
      } else {
        await axios.post(
          `${API_URL}/wishlist`,
          { listingId: listing._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  const calculateAverageRating = () => {
    if (!listing.reviews || listing.reviews.length === 0) return 0;

    return 4.6;
  };

  const avgRating = calculateAverageRating();
  const reviewCount = listing.reviews?.length || 0;

  return (
    <div
      onClick={() => navigate(`/listings/${listing._id}`)}
      style={{
        background: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
      }}
    >
      {}
      <div style={{ position: 'relative', paddingTop: '66.67%', background: '#f3f0ea' }}>
        <img
          src={listing.image?.url || '/placeholder.jpg'}
          alt={listing.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {}
        <button
          onClick={toggleWishlist}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: isWishlisted ? '#FF6B6B' : 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <Heart
            size={18}
            fill={isWishlisted ? '#fff' : 'none'}
            stroke={isWishlisted ? '#fff' : '#FF6B6B'}
            strokeWidth={2}
          />
        </button>

        {}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {trustMetrics?.host?.reliability?.overallScore >= 90 && (
            <TrustBadge type="host-reliability" value={trustMetrics.host.reliability.overallScore} size="sm" showLabel={false} />
          )}
          {listing.verifications?.wifiSpeed?.verified && (
            <TrustBadge type="wifi-verified" value={listing.verifications.wifiSpeed.speedMbps} size="sm" showLabel={false} />
          )}
          {listing.verifications?.identity?.hostIdentityVerified && (
            <TrustBadge type="identity-verified" size="sm" showLabel={false} />
          )}
        </div>
      </div>

      {}
      <div style={{ padding: '16px' }}>
        {}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <MapPin size={14} style={{ color: '#c2633a', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: '#7c7060', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {listing.location}, {listing.country}
              </span>
            </div>
            <h3
              style={{
                margin: '0 0 8px 0',
                fontSize: '16px',
                fontWeight: 700,
                color: '#1a1207',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {listing.title}
            </h3>
          </div>
          {avgRating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, marginLeft: '8px' }}>
              <Star size={14} fill="#FFD43B" stroke="#FFD43B" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#1a1207' }}>
                {avgRating.toFixed(1)}
              </span>
              <span style={{ fontSize: '12px', color: '#7c7060' }}>
                ({reviewCount})
              </span>
            </div>
          )}
        </div>

        {}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#7c7060' }}>
            <Users size={14} />
            <span>{listing.guests} guests</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#7c7060' }}>
            <Bed size={14} />
            <span>{listing.bedrooms} beds</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#7c7060' }}>
            <Bath size={14} />
            <span>{listing.baths} baths</span>
          </div>
        </div>

        {}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
          {trustMetrics?.reviews?.verificationRate >= 80 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: '#D3F9D8', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: '#51CF66' }}>
              <CheckCircle size={12} />
              <span>{trustMetrics.reviews.verificationRate}% Verified Reviews</span>
            </div>
          )}
          {listing.locationSafety?.safetyScore >= 80 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: '#D0EBFF', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: '#339AF0' }}>
              <Shield size={12} />
              <span>Safe Area</span>
            </div>
          )}
        </div>

        {}
        <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#1a1207' }}>
                ₹{pricingData ? pricingData.finalPrice.toLocaleString() : listing.price?.toLocaleString()}
              </span>
              <span style={{ fontSize: '14px', color: '#7c7060', marginLeft: '4px' }}>/ night</span>
            </div>
            {pricingData && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: '#D3F9D8', borderRadius: '6px' }}>
                <CheckCircle size={12} style={{ color: '#51CF66' }} />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#51CF66' }}>All-inclusive</span>
              </div>
            )}
          </div>
          {pricingData && (
            <div style={{ fontSize: '11px', color: '#7c7060', marginTop: '4px' }}>
              No hidden fees · No service charges
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedListingCard;
