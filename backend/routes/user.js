const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utilis/WrapAsync.js"); // Adjust the path if necessary
const passport = require("passport");
const { saveRedirectUrl } = require("../../middleware.js");
const userController = require("../controllers/user.js");

// Signup Routes
router
  .route("/signup")
  .get(userController.renderSignupForm) // Render signup form
  .post(wrapAsync(userController.signup)); // Handle signup form submission

// Login Routes
router
  .route("/login")
  .get(userController.renderLoginForm) // Render login form
  .post(
    saveRedirectUrl, // Save redirect URL before authentication
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    wrapAsync(userController.login) // Handle login form submission
  );

// Logout Route
router.get("/logout", userController.logout);  // Handle logout
module.exports = router;
