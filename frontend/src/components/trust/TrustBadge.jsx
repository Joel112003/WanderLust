import React from 'react';
import { Shield, Wifi, CheckCircle, Star, Award, Zap, Heart, Lock } from 'lucide-react';

const PALETTE = {
  neutral: { color: '#6b7280', bgColor: '#f3f4f6', border: '#d1d5db' },
  success: { color: '#16a34a', bgColor: '#dcfce7', border: '#86efac' },
  warning: { color: '#f59e0b', bgColor: '#fef3c7', border: '#fcd34d' },
  error: { color: '#dc2626', bgColor: '#fee2e2', border: '#fecaca' },
  accent: { color: '#dc2626', bgColor: '#fee2e2', border: '#fecaca' },
};

const TrustBadge = ({ type, value, label, size = 'md', showLabel = true }) => {
  const getBadgeConfig = () => {
    switch (type) {
      case 'host-reliability': {
        const tone = value >= 90 ? PALETTE.success : value >= 75 ? PALETTE.warning : PALETTE.neutral;
        return {
          icon: Award,
          ...tone,
          text: value >= 90 ? 'Superhost' : value >= 75 ? 'Trusted Host' : 'Good Host',
          score: `${value}/100`,
        };
      }

      case 'review-authenticity': {
        const tone = value >= 80 ? PALETTE.success : value >= 60 ? PALETTE.warning : PALETTE.error;
        return {
          icon: Lock,
          ...tone,
          text: 'Verified Review',
          score: `${value}% Authentic`,
        };
      }

      case 'wifi-verified':
        return {
          icon: Wifi,
          ...PALETTE.neutral,
          text: 'WiFi Verified',
          score: `${value} Mbps`,
        };

      case 'safety-score': {
        const tone = value >= 80 ? PALETTE.success : value >= 60 ? PALETTE.warning : PALETTE.error;
        return {
          icon: Shield,
          ...tone,
          text: 'Safety Score',
          score: `${value}/100`,
        };
      }

      case 'quick-responder':
        return {
          icon: Zap,
          ...PALETTE.accent,
          text: 'Quick Responder',
          score: `< ${value}hr`,
        };

      case 'guest-favorite':
        return {
          icon: Heart,
          ...PALETTE.accent,
          text: 'Guest Favorite',
          score: `${value}★`,
        };

      case 'identity-verified':
        return {
          icon: CheckCircle,
          ...PALETTE.success,
          text: 'Identity Verified',
          score: '✓',
        };

      default:
        return {
          icon: Star,
          ...PALETTE.neutral,
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
        border: `1px solid ${config.border}`,
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
      superhero: { icon: '★', ...PALETTE.success, label: 'Superhost' },
      trusted: { icon: '✓', ...PALETTE.warning, label: 'Trusted Host' },
      good: { icon: '•', ...PALETTE.neutral, label: 'Good Host' },
      average: { icon: '•', ...PALETTE.neutral, label: 'Average Host' },
      new: { icon: '•', ...PALETTE.neutral, label: 'New Host' },
    };
    return tiers[tier] || tiers.new;
  };

  const tierBadge = getTierBadge(reliability.tier);

  const overallColor =
    reliability.overallScore >= 90
      ? PALETTE.success.color
      : reliability.overallScore >= 75
      ? PALETTE.warning.color
      : PALETTE.neutral.color;

  return (
    <div
      style={{
        padding: '20px',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 12px rgba(17,24,39,0.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: '#111827' }}>
            Host: {hostName}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                padding: '4px 12px',
                borderRadius: '20px',
                background: tierBadge.bgColor,
                color: tierBadge.color,
                border: `1px solid ${tierBadge.border}`,
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              {tierBadge.icon} {tierBadge.label}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 800, color: overallColor }}>{reliability.overallScore}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '-4px' }}>out of 100</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Response Rate</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
            {reliability.responseMetrics?.responseRate?.toFixed(0) || 0}%
          </div>
          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
            Avg: {reliability.responseMetrics?.avgResponseTime?.toFixed(1) || 0}hrs
          </div>
        </div>

        <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Cancellation Rate</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
            {reliability.cancellationMetrics?.cancellationRate?.toFixed(1) || 0}%
          </div>
          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
            {reliability.cancellationMetrics?.totalBookings || 0} total bookings
          </div>
        </div>

        <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Accuracy</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
            {reliability.accuracyMetrics?.avgAccuracy?.toFixed(1) || 0}/10
          </div>
          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>Photos and description</div>
        </div>

        <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Rating</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
            ★ {reliability.reviewMetrics?.avgRating?.toFixed(1) || 0}
          </div>
          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
            {reliability.reviewMetrics?.totalReviews || 0} reviews
          </div>
        </div>
      </div>

      {reliability.badges && reliability.badges.length > 0 && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: 600 }}>Achievements</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {reliability.badges.map((badge, index) => (
              <span
                key={index}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
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
        background: '#ffffff',
        borderRadius: '16px',
        border: '2px solid #16a34a',
        boxShadow: '0 4px 16px rgba(22,163,74,0.12)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <CheckCircle size={20} style={{ color: '#16a34a' }} />
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#16a34a' }}>
          100% Transparent Pricing
        </h3>
      </div>

      <div style={{ fontSize: '36px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
        ₹{pricing.finalPrice?.toLocaleString()}
      </div>
      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
        Total for {nights} {nights === 1 ? 'night' : 'nights'} · All-inclusive
      </div>

      <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '12px', marginBottom: '16px', border: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>Price Breakdown</div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>Base price ({nights} {nights === 1 ? 'night' : 'nights'})</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
            ₹{pricing.hostEarnings?.toLocaleString()}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>Platform fee (from host)</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
            ₹{pricing.platformFee?.toLocaleString()}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>You pay</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
            ₹{pricing.finalPrice?.toLocaleString()}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#16a34a' }}>
          <CheckCircle size={14} />
          <span>No hidden fees</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#16a34a' }}>
          <CheckCircle size={14} />
          <span>No service charges</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#16a34a' }}>
          <CheckCircle size={14} />
          <span>No cleaning fees</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#16a34a' }}>
          <CheckCircle size={14} />
          <span>Free cancellation until 48hrs before</span>
        </div>
      </div>
    </div>
  );
};

export default TrustBadge;
