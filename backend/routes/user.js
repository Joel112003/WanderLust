const express = require("express");
const router = express.Router();
const { Signup, Login, Logout, Profile, UpdateProfile } = require("../controllers/user");
const { isAuthenticated } = require("../middleware");

// Public routes
router.post('/signup', Signup);
router.post('/login', Login);

// Protected routes (Require authentication)
router.post('/logout', isAuthenticated, Logout);
router.get('/profile', isAuthenticated, Profile);
router.put('/profile-update', isAuthenticated, UpdateProfile);

module.exports = router;