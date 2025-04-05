const express = require("express");
const router = express.Router();
const listingController = require("../controllers/listing");
const multer = require("multer");
const { storage } = require("../cloudConfig");
const { isLoggedIn } = require("../middleware");
const upload = multer({ storage });

// Listing Endpoints

// Get all listings
router.get("/", listingController.getAllListings);

// Search listings - Must be placed before /:id routes
router.get("/search", listingController.searchListings);

// Get listings by user - MOVED UP before /:id routes
router.get("/user", isLoggedIn, listingController.getUserListings);

// Get listing by ID
router.get("/:id", listingController.getListingById);

// Get listing for editing
router.get("/:id/edit", listingController.getListingForEdit);

// Create new listing with image upload
router.post(
  "/",
  isLoggedIn,
  upload.single("image"),
  listingController.createListing
);
// Update listing
router.put(
  "/:id",
  isLoggedIn,
  upload.single("image"),
  async (req, res, next) => {
    try {
      // Initialize listing object
      let listingData = {};
      
      // Check if listing data comes as JSON string
      if (req.body.listing && typeof req.body.listing === 'string') {
        listingData = JSON.parse(req.body.listing);
      } 
      // Otherwise use individual fields
      else {
        listingData = {
          title: req.body.title,
          description: req.body.description,
          price: req.body.price,
          location: req.body.location,
          country: req.body.country,
          category: req.body.category
        };
      }

      // Add image data if uploaded
      if (req.file) {
        listingData.image = {
          url: req.file.path,
          filename: req.file.filename
        };
      }

      // Structure data exactly as schema expects
      req.listingData = { listing: listingData };
      next();
    } catch (error) {
      console.error("Data processing error:", error);
      return res.status(400).json({
        success: false,
        error: "Invalid data format",
        details: [{ message: "Could not process listing data" }]
      });
    }
  },
  listingController.updateListing
);
// Delete listing
router.delete("/:id", isLoggedIn, listingController.deleteListing);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error("Error:", err);

  // Determine appropriate status code
  const statusCode =
    err instanceof multer.MulterError
      ? 400 // Bad request for Multer errors
      : err.message.includes("required") || err.message.includes("allowed")
      ? 400 // Bad request for validation errors
      : 500; // Internal server error for other cases

  // Standardized error response
  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal server error",
    type:
      err instanceof multer.MulterError
        ? "FILE_UPLOAD_ERROR"
        : "VALIDATION_ERROR",
    ...(err.details && { details: err.details }), // Include validation details if available
  });
});

module.exports = router;
