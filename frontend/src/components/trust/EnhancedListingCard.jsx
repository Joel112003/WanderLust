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
      className="cursor-pointer overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)]"
    >
      <div className="relative bg-[#f3f0ea] pt-[66.67%]">
        <img
          src={listing.image?.url || '/placeholder.jpg'}
          alt={listing.title}
          className="absolute left-0 top-0 h-full w-full object-cover"
        />
        <button
          onClick={toggleWishlist}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border-none shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all ${isWishlisted ? 'bg-[#FF6B6B]' : 'bg-white/90'}`}
        >
          <Heart
            size={18}
            fill={isWishlisted ? '#fff' : 'none'}
            stroke={isWishlisted ? '#fff' : '#FF6B6B'}
            strokeWidth={2}
          />
        </button>
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
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
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-1.5">
              <MapPin size={14} className="shrink-0 text-[#c2633a]" />
              <span className="truncate text-[13px] font-medium text-[#7c7060]">
                {listing.location}, {listing.country}
              </span>
            </div>
            <h3
              className="mb-2 truncate text-base font-bold text-[#1a1207]"
            >
              {listing.title}
            </h3>
          </div>
          {avgRating > 0 && (
            <div className="ml-2 flex shrink-0 items-center gap-1">
              <Star size={14} fill="#FFD43B" stroke="#FFD43B" />
              <span className="text-sm font-bold text-[#1a1207]">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-xs text-[#7c7060]">
                ({reviewCount})
              </span>
            </div>
          )}
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-[13px] text-[#7c7060]">
            <Users size={14} />
            <span>{listing.guests} guests</span>
          </div>
          <div className="flex items-center gap-1 text-[13px] text-[#7c7060]">
            <Bed size={14} />
            <span>{listing.bedrooms} beds</span>
          </div>
          <div className="flex items-center gap-1 text-[13px] text-[#7c7060]">
            <Bath size={14} />
            <span>{listing.baths} baths</span>
          </div>
        </div>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {trustMetrics?.reviews?.verificationRate >= 80 && (
            <div className="flex items-center gap-1 rounded-md bg-[#D3F9D8] px-2 py-1 text-[11px] font-semibold text-[#51CF66]">
              <CheckCircle size={12} />
              <span>{trustMetrics.reviews.verificationRate}% Verified Reviews</span>
            </div>
          )}
          {listing.locationSafety?.safetyScore >= 80 && (
            <div className="flex items-center gap-1 rounded-md bg-[#D0EBFF] px-2 py-1 text-[11px] font-semibold text-[#339AF0]">
              <Shield size={12} />
              <span>Safe Area</span>
            </div>
          )}
        </div>
        <div className="border-t border-black/10 pt-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xl font-extrabold text-[#1a1207]">
                ₹{pricingData ? pricingData.finalPrice.toLocaleString() : listing.price?.toLocaleString()}
              </span>
              <span className="ml-1 text-sm text-[#7c7060]">/ night</span>
            </div>
            {pricingData && (
              <div className="flex items-center gap-1 rounded-md bg-[#D3F9D8] px-2 py-1">
                <CheckCircle size={12} className="text-[#51CF66]" />
                <span className="text-[11px] font-semibold text-[#51CF66]">All-inclusive</span>
              </div>
            )}
          </div>
          {pricingData && (
            <div className="mt-1 text-[11px] text-[#7c7060]">
              No hidden fees · No service charges
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedListingCard;
