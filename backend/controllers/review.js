const Review = require("../models/review");
const Listing = require("../models/listing");
const mongoose = require("mongoose");

// 🚀 Validation helper function for review input
const validateReviewInput = (data) => {
  const errors = {};
  if (
    !data.rating ||
    isNaN(data.rating) ||
    data.rating < 1 ||
    data.rating > 5
  ) {
    errors.rating = "Rating must be a number between 1 and 5";
  }
  if (!data.comment || data.comment.trim().length < 10) {
    errors.comment = "Comment must be at least 10 characters long";
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// 🚀 Get All Reviews

module.exports.getAllReviews = async (req, res) => {
  try {
    const { listingId } = req.params;
    
    // Validate listing ID format
    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid listing ID format" 
      });
    }

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ 
        success: false, 
        message: "Listing not found" 
      });
    }

    // Get reviews with pagination
    const { page = 1, limit = 10 } = req.query;
    const reviews = await Review.find({ listing: listingId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "username");

    const totalReviews = await Review.countDocuments({ listing: listingId });

    res.status(200).json({
      success: true,
      reviews,
      pagination: {
        total: totalReviews,
        pages: Math.ceil(totalReviews / limit),
        page: Number(page),
        limit: Number(limit)
      }
    });

  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching reviews" 
    });
  }
};

// 🚀 Add a Review
// 🚀 Add a Review - FIXED VERSION
module.exports.addReview = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { rating, comment } = req.body;
    
    // Authentication check
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    // Validate listing ID format
    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid listing ID" });
    }
    
    // Validate review input
    const { isValid, errors } = validateReviewInput(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }
    
    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res
        .status(404)
        .json({ success: false, message: "Listing not found" });
    }
    
    // Prevent duplicate review by the same user
    const existingReview = await Review.findOne({
      author: req.user._id,
      listing: listingId,
    });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this listing",
      });
    }
    
    // Create and save new review
    const newReview = new Review({
      comment: req.body.comment,
      rating: req.body.rating,
      author: req.user._id,
      listing: listingId,
      authorName: req.user.username, // Store username as a backup
      
    });
    await newReview.save();
    
    // Update listing without triggering full validation
    await Listing.findByIdAndUpdate(
      listingId,
      { $push: { reviews: newReview._id } },
      { runValidators: false }
    );
    
    // Populate author field so _id and username are available
    await newReview.populate("author", "username");
    
    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: newReview,
    });
  } catch (error) {
    console.error("Add Review Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add review",
      error: error.message,
    });
  }
};


// 🚀 Delete a Review
module.exports.deleteReview = async (req, res) => {
  try {
    const { listingId, reviewId } = req.params;
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (
      !mongoose.Types.ObjectId.isValid(listingId) ||
      !mongoose.Types.ObjectId.isValid(reviewId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid listing or review ID" });
    }
    const review = await Review.findById(reviewId);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }
    // Ensure the logged-in user is the review author
    if (review.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
      });
    }
    await Listing.findByIdAndUpdate(listingId, {
      $pull: { reviews: reviewId },
    });
    await Review.findByIdAndDelete(reviewId);
    res
      .status(200)
      .json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete Review Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message,
    });
  }
};
