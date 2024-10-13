const express = require("express");
const router = express.Router();
const wrapAsync = require("../utilis/WrapAsync.js");
const expressError = require("../utilis/expressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Validate listing input
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new expressError(400, errMsg);
  } else {
    next();
  }
};

// Index Route
router
  .route("/")
  .get(wrapAsync(listingController.index)) // Get all listings
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListings)
  ); // Create a new listing

// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm); // Render new listing form

// Show Route
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing)) // Show a specific listing
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListings)
  ) // Update a specific listing
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListings)); // Delete a specific listing

// Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.editListings)
); // Render edit form for a specific listing

module.exports = router;
