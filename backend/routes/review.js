// routes/reviews.js

const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utilis/WrapAsync.js");
const expressError = require("../utilis/expressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/review.js");

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new expressError(400, errMsg);
  } else {
    next();
  }
};

// Review Routes

// Post Review Route
router.post(
  "/",
  isLoggedIn, // Make sure user is logged in before posting review
  validateReview,
  wrapAsync(reviewController.createReview)
);

// Delete Review Route
router.delete(
  "/:reviewId",
  isLoggedIn, // Make sure user is logged in before deleting review
  isReviewAuthor, // Check if the current user is the author of the review
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;
