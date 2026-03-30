export const formatPrice = (price, compact = false) => {
  const num = Number(price) || 0;

  if (compact && num >= 100000) {
    return `₹${(num / 100000).toFixed(1)}L`;
  }

  return `₹${num.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
};

export const formatDate = (date, includeTime = false) => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return d.toLocaleDateString('en-IN', options);
};

export const formatTimeAgo = (date) => {
  if (!date) return '';

  const d = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now - d) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
};

export const formatMessageTime = (date) => {
  if (!date) return '';

  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = (now - d) / 1000;

  if (diffInSeconds < 86400) {
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  if (diffInSeconds < 172800) {
    return 'Yesterday';
  }

  if (diffInSeconds < 604800) {
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const getListingImage = (listing) => {
  if (!listing) return '/default-listing.jpg';

  return (
    listing?.image?.url ||
    listing?.images?.[0]?.url ||
    listing?.image ||
    '/default-listing.jpg'
  );
};

export const normalizeListing = (listing) => {
  if (!listing) return null;

  return {
    ...listing,
    price: listing.price ?? 0,
    image: listing.image ?? { url: '/default-listing.jpg' },
    title: listing.title || 'Untitled Listing',
    location: listing.location || 'Location not specified',
  };
};
