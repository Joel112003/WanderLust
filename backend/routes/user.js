const express = require("express");
const router = express.Router();
const { Signup, Login, Logout, Profile, UpdateProfile, GetHostProfile } = require("../controllers/user");
const { isAuthenticated } = require("../middleware");

router.post('/signup', Signup);
router.post('/login', Login);
router.get('/host/:id', GetHostProfile);

router.post('/logout', isAuthenticated, Logout);
router.get('/profile', isAuthenticated, Profile);
router.put('/profile-update', isAuthenticated, UpdateProfile);

module.exports = router;
