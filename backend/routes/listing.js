const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listing');
const multer = require('multer');
const { storage } = require('../cloudConfig');
const { isLoggedIn } = require('../middleware');
const upload = multer({ storage });

// Listing Endpoints

// Get all listings
router.get('/', listingController.getAllListings);

// Search listings - Must be placed before /:id routes
router.get('/search', listingController.searchListings);

// Get listings by user - MOVED UP before /:id routes
router.get('/user', isLoggedIn, listingController.getUserListings);

// Get listing by ID
router.get('/:id', listingController.getListingById);

// Get listing for editing
router.get('/:id/edit', listingController.getListingForEdit);

// Create new listing with image upload
router.post('/', isLoggedIn, upload.single('image'), listingController.createListing);
// Update listing
router.put('/:id', isLoggedIn, upload.single('image'), listingController.updateListing);

// Delete listing
router.delete('/:id', isLoggedIn, listingController.deleteListing);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Error:', err);

  // Determine appropriate status code
  const statusCode = err instanceof multer.MulterError 
    ? 400 // Bad request for Multer errors
    : err.message.includes('required') || err.message.includes('allowed')
      ? 400 // Bad request for validation errors
      : 500; // Internal server error for other cases

  // Standardized error response
  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal server error",
    type: err instanceof multer.MulterError ? 'FILE_UPLOAD_ERROR' : 'VALIDATION_ERROR',
    ...(err.details && { details: err.details }) // Include validation details if available
  });
});

module.exports = router;