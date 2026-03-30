const express = require('express');
const router = express.Router();
const trustController = require('../controllers/trust');
const { isAuthenticated } = require('../middleware');

router.get('/host-reliability/:hostId', trustController.getHostReliability);

router.put('/host-reliability/:hostId', isAuthenticated, trustController.updateHostReliability);

router.get('/review-authenticity/:reviewId', isAuthenticated, trustController.calculateReviewAuthenticity);

router.get('/transparent-pricing/:listingId', trustController.getTransparentPricing);

router.post('/verified-review', isAuthenticated, trustController.submitVerifiedReview);

router.get('/listing-trust/:listingId', trustController.getListingTrustMetrics);

module.exports = router;
