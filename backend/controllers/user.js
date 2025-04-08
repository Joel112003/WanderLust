const User = require("../models/user");
const passport = require("passport");
const { generateToken } = require("../middleware");

// Signup Controller
exports.Signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username, email, and password"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists"
      });
    }

    const newUser = new User({ username, email });
    try {
      const registeredUser = await User.register(newUser, password);
      
      // Generate JWT token
      const token = generateToken(registeredUser);
      
      // Auto-login after registration
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
      return res.status(500).json({
        success: false,
        message: "Error registering user",
        error: err.message
      });
    }
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: err.message
    });
  }
};

// Login Controller
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
        message: info.message || "Invalid credentials"
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

      // Generate JWT token
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

// Logout Controller
exports.Logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error logging out",
        error: err.message
      });
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
};

// Get Profile Controller
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

// Update Profile Controller
exports.UpdateProfile = async (req, res) => {
  try {
    const { username, phoneNumber } = req.body;
    console.log('Update data received:', { username, phoneNumber }); // Debug log

    const updates = {};
    if (username) updates.username = username;
    if (phoneNumber) updates.phoneNumber = phoneNumber;

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

    console.log('Updated user:', user); // Debug log

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