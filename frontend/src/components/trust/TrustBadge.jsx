import React from 'react';
import { Shield, Wifi, CheckCircle, Star, Award, Zap, Heart, Lock } from 'lucide-react';

const TONE = {
  neutral: { text: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-300' },
  success: { text: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300' },
  warning: { text: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-300' },
  error: { text: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
  accent: { text: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
};

const SIZE = {
  sm: { pad: 'px-2 py-1', text: 'text-[11px]', icon: 12 },
  md: { pad: 'px-3 py-1.5', text: 'text-[13px]', icon: 16 },
  lg: { pad: 'px-4 py-2', text: 'text-sm', icon: 18 },
};

const TrustBadge = ({ type, value, label, size = 'md', showLabel = true }) => {
  const getBadgeConfig = () => {
    switch (type) {
      case 'host-reliability': {
        const tone = value >= 90 ? TONE.success : value >= 75 ? TONE.warning : TONE.neutral;
        return {
          icon: Award,
          ...tone,
          text: value >= 90 ? 'Superhost' : value >= 75 ? 'Trusted Host' : 'Good Host',
          score: `${value}/100`,
        };
      }

      case 'review-authenticity': {
        const tone = value >= 80 ? TONE.success : value >= 60 ? TONE.warning : TONE.error;
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
          ...TONE.neutral,
          text: 'WiFi Verified',
          score: `${value} Mbps`,
        };

      case 'safety-score': {
        const tone = value >= 80 ? TONE.success : value >= 60 ? TONE.warning : TONE.error;
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
          ...TONE.accent,
          text: 'Quick Responder',
          score: `< ${value}hr`,
        };

      case 'guest-favorite':
        return {
          icon: Heart,
          ...TONE.accent,
          text: 'Guest Favorite',
          score: `${value}★`,
        };

      case 'identity-verified':
        return {
          icon: CheckCircle,
          ...TONE.success,
          text: 'Identity Verified',
          score: '✓',
        };

      default:
        return {
          icon: Star,
          ...TONE.neutral,
          text: label || 'Verified',
          score: value,
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const styles = SIZE[size] || SIZE.md;

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-lg border font-semibold ${styles.pad} ${styles.text} ${config.bg} ${config.border} ${config.text}`}>
      <Icon size={styles.icon} />
      {showLabel && (
        <span>
          {config.text} {config.score && <span className="font-bold">· {config.score}</span>}
        </span>
      )}
    </div>
  );
};

export const HostReliabilityCard = ({ reliability, hostName }) => {
  if (!reliability) return null;

  const getTierBadge = (tier) => {
    const tiers = {
      superhero: { icon: '★', ...TONE.success, label: 'Superhost' },
      trusted: { icon: '✓', ...TONE.warning, label: 'Trusted Host' },
      good: { icon: '•', ...TONE.neutral, label: 'Good Host' },
      average: { icon: '•', ...TONE.neutral, label: 'Average Host' },
      new: { icon: '•', ...TONE.neutral, label: 'New Host' },
    };
    return tiers[tier] || tiers.new;
  };

  const tierBadge = getTierBadge(reliability.tier);

  const overallColor =
    reliability.overallScore >= 90
      ? 'text-green-600'
      : reliability.overallScore >= 75
      ? 'text-amber-600'
      : 'text-gray-500';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_4px_12px_rgba(17,24,39,0.08)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="mb-1 text-lg font-bold text-gray-900">
            Host: {hostName}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-[13px] font-semibold ${tierBadge.bg} ${tierBadge.border} ${tierBadge.text}`}>
              {tierBadge.icon} {tierBadge.label}
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className={`text-[32px] font-extrabold ${overallColor}`}>{reliability.overallScore}</div>
          <div className="-mt-1 text-xs text-gray-500">out of 100</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="mb-1 text-[11px] text-gray-500">Response Rate</div>
          <div className="text-lg font-bold text-gray-900">
            {reliability.responseMetrics?.responseRate?.toFixed(0) || 0}%
          </div>
          <div className="mt-0.5 text-[10px] text-gray-400">
            Avg: {reliability.responseMetrics?.avgResponseTime?.toFixed(1) || 0}hrs
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="mb-1 text-[11px] text-gray-500">Cancellation Rate</div>
          <div className="text-lg font-bold text-gray-900">
            {reliability.cancellationMetrics?.cancellationRate?.toFixed(1) || 0}%
          </div>
          <div className="mt-0.5 text-[10px] text-gray-400">
            {reliability.cancellationMetrics?.totalBookings || 0} total bookings
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="mb-1 text-[11px] text-gray-500">Accuracy</div>
          <div className="text-lg font-bold text-gray-900">
            {reliability.accuracyMetrics?.avgAccuracy?.toFixed(1) || 0}/10
          </div>
          <div className="mt-0.5 text-[10px] text-gray-400">Photos and description</div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="mb-1 text-[11px] text-gray-500">Rating</div>
          <div className="text-lg font-bold text-gray-900">
            ★ {reliability.reviewMetrics?.avgRating?.toFixed(1) || 0}
          </div>
          <div className="mt-0.5 text-[10px] text-gray-400">
            {reliability.reviewMetrics?.totalReviews || 0} reviews
          </div>
        </div>
      </div>

      {reliability.badges && reliability.badges.length > 0 && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="mb-2 text-xs font-semibold text-gray-500">Achievements</div>
          <div className="flex flex-wrap gap-2">
            {reliability.badges.map((badge, index) => (
              <span key={index} className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
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
    <div className="rounded-2xl border-2 border-green-600 bg-white p-5 shadow-[0_4px_16px_rgba(22,163,74,0.12)]">
      <div className="mb-4 flex items-center gap-2">
        <CheckCircle size={20} className="text-green-600" />
        <h3 className="m-0 text-base font-bold text-green-600">
          100% Transparent Pricing
        </h3>
      </div>

      <div className="mb-2 text-4xl font-extrabold text-gray-900">
        ₹{pricing.finalPrice?.toLocaleString()}
      </div>
      <div className="mb-5 text-sm text-gray-500">
        Total for {nights} {nights === 1 ? 'night' : 'nights'} · All-inclusive
      </div>

      <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="mb-3 text-[13px] font-semibold text-gray-900">Price Breakdown</div>

        <div className="mb-2 flex justify-between">
          <span className="text-[13px] text-gray-500">Base price ({nights} {nights === 1 ? 'night' : 'nights'})</span>
          <span className="text-[13px] font-semibold text-gray-900">
            ₹{pricing.hostEarnings?.toLocaleString()}
          </span>
        </div>

        <div className="mb-2 flex justify-between">
          <span className="text-[13px] text-gray-500">Platform fee (from host)</span>
          <span className="text-[13px] font-semibold text-gray-900">
            ₹{pricing.platformFee?.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between border-t border-gray-200 pt-3">
          <span className="text-sm font-bold text-gray-900">You pay</span>
          <span className="text-sm font-bold text-gray-900">
            ₹{pricing.finalPrice?.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-green-600">
          <CheckCircle size={14} />
          <span>No hidden fees</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-green-600">
          <CheckCircle size={14} />
          <span>No service charges</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-green-600">
          <CheckCircle size={14} />
          <span>No cleaning fees</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-green-600">
          <CheckCircle size={14} />
          <span>Free cancellation until 48hrs before</span>
        </div>
      </div>
    </div>
  );
};

export default TrustBadge;
