const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const WrapAsync = require("../utilis/WrapAsync.js");

router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post("/signup", WrapAsync(async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email , username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.flash("success", "Welcome to WanderLust");
    res.redirect("/listings");
  } catch (error) {
    req.flash("error", error.message); // Handling any potential errors
    res.redirect("/signup"); // Redirect back to signup page on failure
  }
}));

module.exports = router;
