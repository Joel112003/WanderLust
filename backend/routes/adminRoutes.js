const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const reportController = require('../controllers/adminReportController');
const { adminAuth } = require('../middleware');

router.post('/login', adminController.adminLogin);

router.use(adminAuth);

router.get('/verify', (req, res) => res.sendStatus(200));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/reports/generate', reportController.generateReport);

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

router.get('/listings', adminController.getAllListings);
router.patch('/listings/:id/status', adminController.updateListingStatus);
router.patch('/listings/:id/feature', adminController.toggleFeatured);
router.delete('/listings/:id', adminController.deleteListing);

router.get('/reviews', adminController.getAllReviews);
router.patch('/reviews/:id/approve', adminController.approveReview);
router.delete('/reviews/:id', adminController.deleteReview);

module.exports = router;
