const express = require("express");
const router = express.Router();
const { Signup, Login, Logout, Profile, UpdateProfile } = require("../controllers/user");
const { isAuthenticated } = require("../middleware"); // Using the correct middleware name

// Public routes
router.post('/signup', Signup);
router.post('/login', Login);

// Protected routes (Require authentication)
router.post('/logout', isAuthenticated, Logout);
router.get('/profile', isAuthenticated, Profile);
router.patch('/profile/update', isAuthenticated, UpdateProfile); // Using PATCH for partial updates

module.exports = router;
