const express = require("express");
const router = express.Router({ mergeParams: true });
const { isAuthenticated } = require("../middleware");
const { getAllReviews, addReview, deleteReview } = require("../controllers/review");

// Middleware to validate review input
const validateReviewInput = (req, res, next) => {
  const { rating, comment } = req.body;
  
  if (!rating || !comment) {
    return res.status(400).json({
      success: false,
      message: "Please provide both rating and comment"
    });
  }
  
  if (rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: "Rating must be between 1 and 5"
    });
  }
  
  if (comment.length < 3) {
    return res.status(400).json({
      success: false,
      message: "Comment must be at least 3 characters long"
    });
  }
  
  next();
};

router.route("/")
  .get(getAllReviews)
  .post(isAuthenticated, validateReviewInput, addReview);

router.route("/:reviewId")
  .delete(isAuthenticated, deleteReview);

module.exports = router;
