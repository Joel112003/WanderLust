const crypto = require('crypto');

const calculateReviewAuthenticity = (reviewData, booking, user) => {
  const scores = {
    timing: 0,
    photo: 0,
    detail: 0,
    userHistory: 0,
    noIncentive: 0,
  };

  if (booking && booking.checkOut) {
    const hoursAfterCheckout = (Date.now() - new Date(booking.checkOut)) / 3600000;

    if (hoursAfterCheckout >= 2 && hoursAfterCheckout <= 168) {
      scores.timing = 35;
    } else if (hoursAfterCheckout > 168 && hoursAfterCheckout <= 720) {
      scores.timing = 25;
    } else if (hoursAfterCheckout > 720) {
      scores.timing = 10;
    } else {
      scores.timing = 5;
    }
  } else {
    scores.timing = 0;
  }

  if (reviewData.photos && reviewData.photos.length > 0) {
    const hasMetadata = reviewData.photos.some(p => p.metadata && p.metadata.takenAt);
    const hasGpsVerification = reviewData.photos.some(p => p.metadata && p.metadata.gpsVerified);

    if (hasGpsVerification) {
      scores.photo = 25;
    } else if (hasMetadata) {
      scores.photo = 20;
    } else {
      scores.photo = 10;
    }
  } else {
    scores.photo = 5;
  }

  const wordCount = reviewData.comment ? reviewData.comment.split(' ').length : 0;
  if (wordCount >= 50 && wordCount <= 500) {
    scores.detail = 15;
  } else if (wordCount >= 20 && wordCount < 50) {
    scores.detail = 10;
  } else if (wordCount > 500) {
    scores.detail = 5;
  } else {
    scores.detail = 3;
  }

  if (user) {
    const reviewCount = user.reviewCount || 0;
    const accountAge = (Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24);

    if (reviewCount === 0 || reviewCount === 1) {
      scores.userHistory = 15;
    } else if (reviewCount <= 10) {
      scores.userHistory = 12;
    } else if (reviewCount > 50 && accountAge < 180) {
      scores.userHistory = 3;
    } else {
      scores.userHistory = 10;
    }
  } else {
    scores.userHistory = 5;
  }

  const text = (reviewData.comment || '').toLowerCase();
  const incentiveKeywords = ['discount', 'given', 'offered', 'promo', 'code', 'coupon', 'free', 'refund for review'];
  const hasIncentiveMention = incentiveKeywords.some(keyword => text.includes(keyword));
  const isPerfectRating = reviewData.rating === 5;

  if (!hasIncentiveMention) {
    if (isPerfectRating && wordCount < 20) {
      scores.noIncentive = 5;
    } else {
      scores.noIncentive = 10;
    }
  } else {
    scores.noIncentive = 0;
  }

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

  return {
    totalScore: Math.min(totalScore, 100),
    breakdown: scores,
    isVerified: booking !== null,
    isHighQuality: totalScore >= 75,
  };
};

const calculateHostReliability = (hostData) => {
  const scores = {
    response: 0,
    cancellation: 0,
    accuracy: 0,
    reviews: 0,
    resolution: 0,
    maintenance: 0,
  };

  const avgResponseHours = hostData.avgResponseTime || 24;
  const responseRate = hostData.responseRate || 50;

  if (avgResponseHours <= 4 && responseRate >= 95) {
    scores.response = 15;
  } else if (avgResponseHours <= 8 && responseRate >= 90) {
    scores.response = 12;
  } else if (avgResponseHours <= 24 &&responseRate >= 80) {
    scores.response = 8;
  } else {
    scores.response = 5;
  }

  const cancellationRate = hostData.cancellationRate || 0;
  const totalBookings = hostData.totalBookings || 0;

  if (totalBookings === 0) {
    scores.cancellation = 15;
  } else if (cancellationRate < 1) {
    scores.cancellation = 25;
  } else if (cancellationRate < 3) {
    scores.cancellation = 18;
  } else if (cancellationRate < 5) {
    scores.cancellation = 10;
  } else {
    scores.cancellation = 0;
  }

  const photoAccuracy = hostData.photoAccuracy || 5;
  const amenityAccuracy = hostData.amenityAccuracy || 5;
  const descriptionAccuracy = hostData.descriptionAccuracy || 5;
  const avgAccuracy = (photoAccuracy + amenityAccuracy + descriptionAccuracy) / 3;

  if (avgAccuracy >= 9) {
    scores.accuracy = 20;
  } else if (avgAccuracy >= 8) {
    scores.accuracy = 15;
  } else if (avgAccuracy >= 7) {
    scores.accuracy = 10;
  } else {
    scores.accuracy = 5;
  }

  const avgRating = hostData.avgRating || 0;
  const totalReviews = hostData.totalReviews || 0;
  const verifiedReviews = hostData.verifiedReviews || 0;
  const verificationRate = totalReviews > 0 ? (verifiedReviews / totalReviews) * 100 : 0;

  let reviewScore = 0;
  if (avgRating >= 4.5 && totalReviews >= 20 && verificationRate >= 80) {
    reviewScore = 20;
  } else if (avgRating >= 4.0 && totalReviews >= 10) {
    reviewScore = 15;
  } else if (avgRating >= 3.5 && totalReviews >= 5) {
    reviewScore = 10;
  } else if (totalReviews > 0) {
    reviewScore = 5;
  }
  scores.reviews = reviewScore;

  const complaintsReceived = hostData.complaintsReceived || 0;
  const complaintsResolved = hostData.complaintsResolved || 0;
  const resolutionRate = complaintsReceived > 0 ? (complaintsResolved / complaintsReceived) * 100 : 100;

  if (complaintsReceived === 0) {
    scores.resolution = 10;
  } else if (resolutionRate === 100) {
    scores.resolution = 10;
  } else if (resolutionRate >= 80) {
    scores.resolution = 7;
  } else if (resolutionRate >= 50) {
    scores.resolution = 4;
  } else {
    scores.resolution = 0;
  }

  const inspectionScore = hostData.inspectionScore || 0;
  const cleanlinessRating = hostData.cleanlinessRating || 0;
  const maintenanceIssues = hostData.maintenanceIssues || 0;

  let maintenanceScore = 0;
  if (inspectionScore >= 8 && cleanlinessRating >= 9 && maintenanceIssues === 0) {
    maintenanceScore = 10;
  } else if (inspectionScore >= 7 && cleanlinessRating >= 8 && maintenanceIssues <= 1) {
    maintenanceScore = 7;
  } else if (inspectionScore >= 6) {
    maintenanceScore = 5;
  } else {
    maintenanceScore = 3;
  }
  scores.maintenance = maintenanceScore;

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

  let tier = 'new';
  if (totalScore >= 90) tier = 'superhero';
  else if (totalScore >= 75) tier = 'trusted';
  else if (totalScore >= 60) tier = 'good';
  else if (totalScore >= 40) tier = 'average';

  return {
    overallScore: Math.min(totalScore, 100),
    breakdown: scores,
    tier,
    badges: getBadges(totalScore, hostData),
  };
};

const generateBlockchainHash = (reviewData) => {
  const data = JSON.stringify({
    bookingId: reviewData.bookingId,
    userId: reviewData.userId,
    listingId: reviewData.listingId,
    rating: reviewData.rating,
    comment: reviewData.comment,
    timestamp: Date.now(),
  });

  return crypto.createHash('sha256').update(data).digest('hex');
};

const calculateTransparentPricing = (basePrice, nights = 1) => {
  const platformFeeRate = 0.10;
  const taxRate = 0.00;

  const hostEarnings = basePrice * nights;
  const platformFee = hostEarnings * platformFeeRate;
  const finalPrice = hostEarnings + platformFee;

  return {
    basePrice,
    nights,
    hostEarnings: Math.round(hostEarnings),
    platformFee: Math.round(platformFee),
    taxAmount: 0,
    finalPrice: Math.round(finalPrice),
    breakdown: {
      perNight: Math.round(finalPrice / nights),
      total: Math.round(finalPrice),
      savings: 0,
    },
    transparency: {
      hiddenFees: 0,
      surpriseCharges: 0,
      isAllInclusive: true,
    }
  };
};

const getBadges = (score, hostData) => {
  const badges = [];

  if (score >= 95) {
    badges.push({ name: 'Superhero Host', icon: '🏆', color: '#FFD700' });
  }
  if (hostData.responseRate >= 98 && hostData.avgResponseTime <= 2) {
    badges.push({ name: 'Lightning Responder', icon: '⚡', color: '#FF6B6B' });
  }
  if (hostData.cancellationRate < 0.5) {
    badges.push({ name: 'Ultra Reliable', icon: '✅', color: '#51CF66' });
  }
  if (hostData.totalReviews >= 50 && hostData.avgRating >= 4.7) {
    badges.push({ name: 'Guest Favorite', icon: '❤️', color: '#FF6B9D' });
  }
  if (hostData.verifiedReviews >= 30) {
    badges.push({ name: 'Verified Excellence', icon: '🔒', color: '#339AF0' });
  }

  return badges;
};

const calculateSafetyScore = (locationData) => {
  let score = 50;

  if (locationData.crimeRate === 'low') score += 30;
  else if (locationData.crimeRate === 'medium') score += 15;
  else score -= 10;

  if (locationData.nearbyPolice && locationData.nearbyPolice < 2000) score += 10;
  if (locationData.nearbyHospital && locationData.nearbyHospital < 3000) score += 10;

  return Math.max(0, Math.min(100, score));
};

module.exports = {
  calculateReviewAuthenticity,
  calculateHostReliability,
  generateBlockchainHash,
  calculateTransparentPricing,
  calculateSafetyScore,
  getBadges,
};
