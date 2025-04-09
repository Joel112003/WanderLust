const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const reportController = require('../controllers/adminReportController');
const {adminAuth} = require('../middleware');

// Public route - no auth required
router.post('/login', adminController.adminLogin);

// Protected routes - require admin authentication
router.use(adminAuth);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);
router.get('/reports/generate', reportController.generateReport);


// User Management
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Listings Management
router.get('/listings', adminController.getAllListings);
router.patch('/listings/:id/status', adminController.updateListingStatus);
router.patch('/listings/:id/feature', adminController.toggleFeatured);
router.delete('/listings/:id', adminController.deleteListing);

// Reviews Management
router.get('/reviews', adminController.getAllReviews);
router.patch('/reviews/:id/approve', adminController.approveReview);
router.delete('/reviews/:id', adminController.deleteReview);

module.exports = router;