import React from 'react';
import { Shield, Wifi, CheckCircle, Star, Award, Zap, Heart, Lock } from 'lucide-react';

const TrustBadge = ({ type, value, label, size = 'md', showLabel = true }) => {
  const getBadgeConfig = () => {
    switch (type) {
      case 'host-reliability':
        return {
          icon: Award,
          color: value >= 90 ? '#FFD700' : value >= 75 ? '#51CF66' : '#74C0FC',
          bgColor: value >= 90 ? '#FFF9DB' : value >= 75 ? '#D3F9D8' : '#D0EBFF',
          text: value >= 90 ? 'Superhero Host' : value >= 75 ? 'Trusted Host' : 'Good Host',
          score: `${value}/100`,
        };

      case 'review-authenticity':
        return {
          icon: Lock,
          color: value >= 80 ? '#51CF66' : value >= 60 ? '#74C0FC' : '#FFD43B',
          bgColor: value >= 80 ? '#D3F9D8' : value >= 60 ? '#D0EBFF' : '#FFF9DB',
          text: 'Verified Review',
          score: `${value}% Authentic`,
        };

      case 'wifi-verified':
        return {
          icon: Wifi,
          color: '#339AF0',
          bgColor: '#D0EBFF',
          text: 'WiFi Verified',
          score: `${value} Mbps`,
        };

      case 'safety-score':
        return {
          icon: Shield,
          color: value >= 80 ? '#51CF66' : value >= 60 ? '#FFD43B' : '#FF6B6B',
          bgColor: value >= 80 ? '#D3F9D8' : value >= 60 ? '#FFF9DB' : '#FFE3E3',
          text: 'Safety Score',
          score: `${value}/100`,
        };

      case 'quick-responder':
        return {
          icon: Zap,
          color: '#FF6B6B',
          bgColor: '#FFE3E3',
          text: 'Quick Responder',
          score: `< ${value}hr`,
        };

      case 'guest-favorite':
        return {
          icon: Heart,
          color: '#FF6B9D',
          bgColor: '#FFDEEB',
          text: 'Guest Favorite',
          score: `${value}★`,
        };

      case 'identity-verified':
        return {
          icon: CheckCircle,
          color: '#51CF66',
          bgColor: '#D3F9D8',
          text: 'Identity Verified',
          score: '✓',
        };

      default:
        return {
          icon: Star,
          color: '#74C0FC',
          bgColor: '#D0EBFF',
          text: label || 'Verified',
          score: value,
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: { padding: '4px 8px', fontSize: '11px', iconSize: 12 },
    md: { padding: '6px 12px', fontSize: '13px', iconSize: 16 },
    lg: { padding: '8px 16px', fontSize: '14px', iconSize: 18 },
  };

  const styles = sizeClasses[size];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: styles.padding,
        borderRadius: '8px',
        background: config.bgColor,
        border: `1px solid ${config.color}30`,
        fontSize: styles.fontSize,
        fontWeight: 600,
        color: config.color,
      }}
    >
      <Icon size={styles.iconSize} />
      {showLabel && (
        <span>
          {config.text} {config.score && <span style={{ fontWeight: 700 }}>· {config.score}</span>}
        </span>
      )}
    </div>
  );
};

export const HostReliabilityCard = ({ reliability, hostName }) => {
  if (!reliability) return null;

  const getTierBadge = (tier) => {
    const tiers = {
      superhero: { icon: '🏆', color: '#FFD700', bg: '#FFF9DB', label: 'Superhero Host' },
      trusted: { icon: '✅', color: '#51CF66', bg: '#D3F9D8', label: 'Trusted Host' },
      good: { icon: '👍', color: '#74C0FC', bg: '#D0EBFF', label: 'Good Host' },
      average: { icon: '⭐', color: '#FFD43B', bg: '#FFF9DB', label: 'Average Host' },
      new: { icon: '🌱', color: '#B197FC', bg: '#E5DBFF', label: 'New Host' },
    };
    return tiers[tier] || tiers.new;
  };

  const tierBadge = getTierBadge(reliability.tier);

  return (
    <div
      style={{
        padding: '20px',
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      {}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: '#1a1207' }}>
            Host: {hostName}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                padding: '4px 12px',
                borderRadius: '20px',
                background: tierBadge.bg,
                color: tierBadge.color,
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              {tierBadge.icon} {tierBadge.label}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: reliability.overallScore >= 90 ? '#FFD700' : reliability.overallScore >= 75 ? '#51CF66' : '#74C0FC',
            }}
          >
            {reliability.overallScore}
          </div>
          <div style={{ fontSize: '12px', color: '#7c7060', marginTop: '-4px' }}>out of 100</div>
        </div>
      </div>

      {}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {}
        <div style={{ padding: '12px', background: '#faf8f4', borderRadius: '12px' }}>
          <div style={{ fontSize: '11px', color: '#7c7060', marginBottom: '4px' }}>Response Rate</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a1207' }}>
            {reliability.responseMetrics?.responseRate?.toFixed(0) || 0}%
          </div>
          <div style={{ fontSize: '10px', color: '#b0a090', marginTop: '2px' }}>
            Avg: {reliability.responseMetrics?.avgResponseTime?.toFixed(1) || 0}hrs
          </div>
        </div>

        {}
        <div style={{ padding: '12px', background: '#faf8f4', borderRadius: '12px' }}>
          <div style={{ fontSize: '11px', color: '#7c7060', marginBottom: '4px' }}>Cancellation Rate</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a1207' }}>
            {reliability.cancellationMetrics?.cancellationRate?.toFixed(1) || 0}%
          </div>
          <div style={{ fontSize: '10px', color: '#b0a090', marginTop: '2px' }}>
            {reliability.cancellationMetrics?.totalBookings || 0} total bookings
          </div>
        </div>

        {}
        <div style={{ padding: '12px', background: '#faf8f4', borderRadius: '12px' }}>
          <div style={{ fontSize: '11px', color: '#7c7060', marginBottom: '4px' }}>Accuracy</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a1207' }}>
            {reliability.accuracyMetrics?.avgAccuracy?.toFixed(1) || 0}/10
          </div>
          <div style={{ fontSize: '10px', color: '#b0a090', marginTop: '2px' }}>Photos & description</div>
        </div>

        {}
        <div style={{ padding: '12px', background: '#faf8f4', borderRadius: '12px' }}>
          <div style={{ fontSize: '11px', color: '#7c7060', marginBottom: '4px' }}>Rating</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a1207' }}>
            ⭐ {reliability.reviewMetrics?.avgRating?.toFixed(1) || 0}
          </div>
          <div style={{ fontSize: '10px', color: '#b0a090', marginTop: '2px' }}>
            {reliability.reviewMetrics?.totalReviews || 0} reviews
          </div>
        </div>
      </div>

      {}
      {reliability.badges && reliability.badges.length > 0 && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '12px', color: '#7c7060', marginBottom: '8px', fontWeight: 600 }}>Achievements</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {reliability.badges.map((badge, index) => (
              <span
                key={index}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: badge.color ? `${badge.color}20` : '#f3f0ea',
                  color: badge.color || '#7c7060',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {badge.icon} {badge.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const TransparentPricingCard = ({ pricing, nights = 1 }) => {
  if (!pricing) return null;

  return (
    <div
      style={{
        padding: '20px',
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '2px solid #51CF66',
        boxShadow: '0 4px 16px rgba(81, 207, 102, 0.15)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <CheckCircle size={20} style={{ color: '#51CF66' }} />
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#51CF66' }}>
          100% Transparent Pricing
        </h3>
      </div>

      <div style={{ fontSize: '36px', fontWeight: 800, color: '#1a1207', marginBottom: '8px' }}>
        ₹{pricing.finalPrice?.toLocaleString()}
      </div>
      <div style={{ fontSize: '14px', color: '#7c7060', marginBottom: '20px' }}>
        Total for {nights} {nights === 1 ? 'night' : 'nights'} · All-inclusive
      </div>

      <div style={{ padding: '16px', background: '#f3f0ea', borderRadius: '12px', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1207', marginBottom: '12px' }}>Price Breakdown</div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: '#7c7060' }}>Base price ({nights} {nights === 1 ? 'night' : 'nights'})</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1207' }}>
            ₹{pricing.hostEarnings?.toLocaleString()}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: '#7c7060' }}>Platform fee (from host)</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1207' }}>
            ₹{pricing.platformFee?.toLocaleString()}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#1a1207' }}>You pay</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#1a1207' }}>
            ₹{pricing.finalPrice?.toLocaleString()}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#51CF66' }}>
          <CheckCircle size={14} />
          <span>No hidden fees</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#51CF66' }}>
          <CheckCircle size={14} />
          <span>No service charges</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#51CF66' }}>
          <CheckCircle size={14} />
          <span>No cleaning fees</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#51CF66' }}>
          <CheckCircle size={14} />
          <span>Free cancellation until 48hrs before</span>
        </div>
      </div>
    </div>
  );
};

export default TrustBadge;
