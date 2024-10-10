const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to WanderLust");
      res.redirect("/listings");
    });
  } catch (error) {
    req.flash("error", error.message); // Handling any potential errors
    res.redirect("/signup"); // Redirect back to signup page on failure
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
  req.logout((err) => {
    if (err) {
      next(err);
    }
    req.flash("success", "You are Logged Out!");
    res.redirect("/listings");
  });
};
