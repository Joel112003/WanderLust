const User = require("../models/user");
const passport = require("passport");
const { generateToken } = require("../middleware");

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isStrongPassword = (password) => {
  if (typeof password !== "string" || password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

exports.Signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username, email, and password"
      });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters with uppercase, lowercase, and a number"
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists"
      });
    }

    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);

    const token = generateToken(registeredUser);

    req.login(registeredUser, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Signup successful but auto-login failed"
        });
      }
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          id: registeredUser._id,
          username: registeredUser.username,
          email: registeredUser.email
        },
        token
      });
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: err.message
    });
  }
};

exports.Login = async (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Login error",
        error: err.message
      });
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || "Invalid credentials"
      });
    }
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Login error",
          error: err.message
        });
      }

      const token = generateToken(user);
      res.json({
        success: true,
        message: "Login successful",
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        },
        token
      });
    });
  })(req, res, next);
};

exports.Logout = (req, res) => {
  req.logout(function(err) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error logging out",
        error: err.message
      });
    }

    if (req.session) req.session.destroy(() => {});
    res.json({ success: true, message: "Logged out successfully" });
  });
};

exports.Profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: err.message
    });
  }
};

exports.UpdateProfile = async (req, res) => {
  try {
    const {
      username,
      phoneNumber,
      bio,
      location,
      languages,
      responseTime,
      preferredContact,
      profilePic
    } = req.body;

    const updates = {};

    if (username) updates.username = username;
    if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;

    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;
    if (languages !== undefined) updates.languages = languages;
    if (responseTime !== undefined) updates.responseTime = responseTime;
    if (preferredContact !== undefined) updates.preferredContact = preferredContact;
    if (profilePic !== undefined) updates.profilePic = profilePic;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: err.message
    });
  }
};

exports.UpdateHostStats = async (userId, guestsCount) => {
  try {
    await User.findByIdAndUpdate(
      userId,
      { $inc: { totalGuests: guestsCount } },
      { new: true }
    );
  } catch (err) {
    console.error("Error updating host stats:", err);
  }
};

exports.GetHostProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select(
      'username email profilePic bio location languages responseRate responseTime totalGuests superHost preferredContact verified createdAt'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Host not found"
      });
    }

    res.json({
      success: true,
      host: user
    });
  } catch (err) {
    console.error("Get Host Profile Error:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching host profile",
      error: err.message
    });
  }
};
