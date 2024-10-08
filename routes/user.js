const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const WrapAsync = require("../utilis/WrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");

router.get("/signup",userController.renderSignupForm );

router.post(
  "/signup",
  WrapAsync(userController.signup)
);

router.get("/login", userController.renderLoginForm);

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  WrapAsync(userController.login)
);

router.get("/logout",userController.logout );

module.exports = router;
