const Listing = require("../models/listing");
const Review = require("../models/review");
module.exports.createReview = async (req, res) => {
    if (!req.isAuthenticated()) { // Check if the user is authenticated
      req.flash("error", "You must be logged in to add a review.");
      return res.redirect("/login"); // Redirect to login if not authenticated
    }
  
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }
  
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id; // Associate the review with the logged-in user
    listing.reviews.push(newReview); // Add the new review to the listing's reviews
  
    await newReview.save(); // Save the new review
    await listing.save(); // Save the updated listing
    req.flash("success", "Successfully created review");
    res.redirect(`/listings/${listing._id}`);
  };
  

module.exports.destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted review");
  res.redirect(`/listings/${id}`);
};
