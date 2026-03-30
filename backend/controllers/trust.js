const HostReliability = require('../models/HostReliability');
const Listing = require('../models/listing');
const Review = require('../models/review');
const Booking = require('../models/Booking');
const Message = require('../models/Message');
const {
  calculateReviewAuthenticity,
  calculateHostReliability,
  generateBlockchainHash,
  calculateTransparentPricing,
  calculateSafetyScore,
} = require('../util/trustScoring');

exports.getHostReliability = async (req, res) => {
  try {
    const { hostId } = req.params;

    let reliability = await HostReliability.findOne({ host: hostId });

    if (!reliability) {

      reliability = await calculateAndSaveHostReliability(hostId);
    }

    res.status(200).json({
      success: true,
      data: reliability,
    });
  } catch (error) {
    console.error('Error fetching host reliability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch host reliability',
      error: error.message,
    });
  }
};

exports.updateHostReliability = async (req, res) => {
  try {
    const { hostId } = req.params;

    const reliability = await calculateAndSaveHostReliability(hostId);

    res.status(200).json({
      success: true,
      message: 'Host reliability score updated',
      data: reliability,
    });
  } catch (error) {
    console.error('Error updating host reliability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update host reliability',
      error: error.message,
    });
  }
};

const calculateAndSaveHostReliability = async (hostId) => {

  const listings = await Listing.find({ owner: hostId });
  const bookings = await Booking.find({ listing: { $in: listings.map(l => l._id) } });
  const reviews = await Review.find({ listing: { $in: listings.map(l => l._id) } });
  const messages = await Message.find({ recipient: hostId });

  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'paid').length;
  const cancelledByHost = bookings.filter(b => b.status === 'cancelled' && b.cancelledBy === hostId).length;

  const totalReviews = reviews.length;
  const verifiedReviews = reviews.filter(r => r.verification && r.verification.isVerified).length;
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const photoAccuracy = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.aspects?.accuracy || 5), 0) / reviews.length
    : 5;

  const cleanlinessRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.aspects?.cleanliness || 5), 0) / reviews.length
    : 5;

  const respondedMessages = messages.filter(m => m.isRead).length;
  const responseRate = messages.length > 0 ? (respondedMessages / messages.length) * 100 : 0;

  const hostData = {
    avgResponseTime: 4,
    responseRate,
    totalBookings: completedBookings,
    cancellationRate: totalBookings > 0 ? (cancelledByHost / totalBookings) * 100 : 0,
    photoAccuracy,
    amenityAccuracy: 8.5,
    descriptionAccuracy: 8.7,
    avgRating,
    totalReviews,
    verifiedReviews,
    cleanlinessRating,
    complaintsReceived: 0,
    complaintsResolved: 0,
    inspectionScore: 8,
    maintenanceIssues: 0,
  };

  const reliabilityScore = calculateHostReliability(hostData);

  let reliability = await HostReliability.findOne({ host: hostId });

  if (!reliability) {
    reliability = new HostReliability({ host: hostId });
  }

  reliability.overallScore = reliabilityScore.overallScore;
  reliability.tier = reliabilityScore.tier;

  reliability.responseMetrics = {
    avgResponseTime: hostData.avgResponseTime,
    responseRate: hostData.responseRate,
    totalMessages: messages.length,
    respondedMessages,
    score: reliabilityScore.breakdown.response,
  };

  reliability.cancellationMetrics = {
    hostCancellations: cancelledByHost,
    totalBookings: completedBookings,
    cancellationRate: hostData.cancellationRate,
    score: reliabilityScore.breakdown.cancellation,
  };

  reliability.accuracyMetrics = {
    photoAccuracy: hostData.photoAccuracy,
    amenityAccuracy: hostData.amenityAccuracy,
    descriptionAccuracy: hostData.descriptionAccuracy,
    avgAccuracy: (hostData.photoAccuracy + hostData.amenityAccuracy + hostData.descriptionAccuracy) / 3,
    score: reliabilityScore.breakdown.accuracy,
  };

  reliability.reviewMetrics = {
    avgRating,
    totalReviews,
    recentReviews: reviews.filter(r => {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return new Date(r.createdAt) > threeMonthsAgo;
    }).length,
    verifiedReviews,
    reviewFreshness: totalReviews > 0 ? 'high' : 'low',
    score: reliabilityScore.breakdown.reviews,
  };

  reliability.resolutionMetrics = {
    complaintsReceived: 0,
    complaintsResolved: 0,
    avgResolutionTime: 0,
    resolutionRate: 100,
    score: reliabilityScore.breakdown.resolution,
  };

  reliability.maintenanceMetrics = {
    inspectionScore: hostData.inspectionScore,
    cleanlinessRating: hostData.cleanlinessRating,
    maintenanceIssues: 0,
    score: reliabilityScore.breakdown.maintenance,
  };

  reliability.hostingMetrics = {
    hostingSince: listings.length > 0 ? listings[0].createdAt : new Date(),
    totalListings: listings.length,
    activeListings: listings.filter(l => l.status === 'approved').length,
    completedStays: completedBookings,
  };

  reliability.badges = reliabilityScore.badges;
  reliability.lastCalculated = new Date();

  await reliability.save();

  return reliability;
};

exports.calculateReviewAuthenticity = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId)
      .populate('author')
      .populate('booking');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    const authenticity = calculateReviewAuthenticity(
      {
        comment: review.comment,
        rating: review.rating,
        photos: review.photos || [],
      },
      review.booking,
      review.author
    );

    review.authenticity = {
      score: authenticity.totalScore,
      timingScore: authenticity.breakdown.timing,
      detailScore: authenticity.breakdown.detail,
      photoScore: authenticity.breakdown.photo,
      userHistoryScore: authenticity.breakdown.userHistory,
      noIncentiveScore: authenticity.breakdown.noIncentive,
    };

    await review.save();

    res.status(200).json({
      success: true,
      data: {
        reviewId: review._id,
        authenticityScore: authenticity.totalScore,
        breakdown: authenticity.breakdown,
        isVerified: authenticity.isVerified,
        isHighQuality: authenticity.isHighQuality,
      },
    });
  } catch (error) {
    console.error('Error calculating review authenticity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate review authenticity',
      error: error.message,
    });
  }
};

exports.getTransparentPricing = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { nights = 1 } = req.query;

    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    const pricing = calculateTransparentPricing(listing.price, parseInt(nights));

    res.status(200).json({
      success: true,
      data: {
        listingId: listing._id,
        title: listing.title,
        pricing,
      },
    });
  } catch (error) {
    console.error('Error calculating transparent pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate pricing',
      error: error.message,
    });
  }
};

exports.submitVerifiedReview = async (req, res) => {
  try {
    const { bookingId, rating, comment, aspects, photos } = req.body;
    const userId = req.user._id;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
      status: { $in: ['confirmed', 'paid'] },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not eligible for review',
      });
    }

    if (new Date() < booking.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Cannot review before checkout date',
      });
    }

    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already submitted for this booking',
      });
    }

    const blockchainHash = generateBlockchainHash({
      bookingId,
      userId,
      listingId: booking.listing,
      rating,
      comment,
    });

    const user = req.user;
    const authenticity = calculateReviewAuthenticity(
      { comment, rating, photos: photos || [] },
      booking,
      user
    );

    const stayDuration = Math.ceil(
      (new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24)
    );

    const review = new Review({
      rating,
      comment,
      author: userId,
      authorName: user.username,
      listing: booking.listing,
      booking: bookingId,
      verification: {
        isVerified: true,
        stayDuration,
        checkInDate: booking.checkIn,
        checkOutDate: booking.checkOut,
        blockchainHash,
        verifiedAt: new Date(),
      },
      authenticity: {
        score: authenticity.totalScore,
        timingScore: authenticity.breakdown.timing,
        detailScore: authenticity.breakdown.detail,
        photoScore: authenticity.breakdown.photo,
        userHistoryScore: authenticity.breakdown.userHistory,
        noIncentiveScore: authenticity.breakdown.noIncentive,
      },
      aspects: aspects || {},
      photos: photos || [],
      immutable: true,
      editableUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await review.save();

    await Listing.findByIdAndUpdate(booking.listing, {
      $push: { reviews: review._id },
    });

    res.status(201).json({
      success: true,
      message: 'Verified review submitted successfully',
      data: {
        review,
        authenticityScore: authenticity.totalScore,
        blockchainHash,
      },
    });
  } catch (error) {
    console.error('Error submitting verified review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message,
    });
  }
};

exports.getListingTrustMetrics = async (req, res) => {
  try {
    const { listingId } = req.params;

    const listing = await Listing.findById(listingId).populate('owner');

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    const hostReliability = await HostReliability.findOne({ host: listing.owner._id });

    const reviews = await Review.find({ listing: listingId });
    const avgAuthenticityScore = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.authenticity?.score || 0), 0) / reviews.length
      : 0;

    const verifiedReviews = reviews.filter(r => r.verification?.isVerified).length;

    res.status(200).json({
      success: true,
      data: {
        listing: {
          id: listing._id,
          title: listing.title,
          verifications: listing.verifications,
          trustMetrics: listing.trustMetrics,
        },
        host: {
          id: listing.owner._id,
          username: listing.owner.username,
          reliability: hostReliability,
        },
        reviews: {
          total: reviews.length,
          verified: verifiedReviews,
          avgAuthenticityScore: Math.round(avgAuthenticityScore),
          verificationRate: reviews.length > 0 ? Math.round((verifiedReviews / reviews.length) * 100) : 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching trust metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trust metrics',
      error: error.message,
    });
  }
};

module.exports = exports;
