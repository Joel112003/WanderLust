const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {  // Added next as parameter
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);  // Error handling with next
      }
      req.flash("success", "Welcome to WanderLust");
      res.redirect("/listings");
    });
  } catch (error) {
    req.flash("error", error.message); // Handle error message correctly
    res.redirect("/signup"); // Redirect back to signup page
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome to Wanderlust!!"); // Flash a welcome message
  let redirectUrl = res.locals.redirectUrl || "/listings"; // Check for redirect URL or default to /listings
  res.redirect(redirectUrl); // Redirect to the specified URL
};

module.exports.logout = (req, res, next) => {
  req.logout();  // Correct logout without callback
  req.flash("success", "You are logged out!");
  res.redirect("/listings");
};
