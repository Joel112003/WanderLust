const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const Listing = require("./models/listing");

// Generate JWT token for a user
exports.generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Unified authentication middleware (improved error handling)
exports.isAuthenticated = async (req, res, next) => {
  try {
    // Check if authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: "No authorization token found" 
      });
    }

    // Extract token from header
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found or token is invalid" 
      });
    }
    
    // Set user in request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired, please login again" 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: "Authentication error", 
      error: error.message 
    });
  }
};

// Check if user is logged in
exports.isLoggedIn = async (req, res, next) => {
  try {
    // Check if authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: "Please login first" 
      });
    }

    // Extract token from header
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found or session expired" 
      });
    }
    
    // Set user in request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: "Session expired, please login again" 
      });
    }

    return res.status(401).json({ 
      success: false, 
      message: "Authentication failed" 
    });
  }
};

// Kept other existing middleware methods
exports.isOwner = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to perform this action" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Role-based authorization middleware (if needed)
exports.authorize = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Forbidden: Access denied" });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  next();
};

exports.authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    
    // Check if user is admin
    const user = await User.findById(decoded.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

exports.adminAuth = async (req, res, next) => {
  try {
      // Check for token in both formats
      const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
          return res.status(401).json({ message: 'No token, authorization denied' });
      }

      // Verify token using JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find admin user
      const user = await User.findOne({ 
          _id: decoded.id, 
          isAdmin: true 
      });

      if (!user) {
          return res.status(403).json({ message: 'Admin access required' });
      }

      // Attach user and token to request
      req.user = user;
      req.token = token;
      next();
  } catch (error) {
      res.status(401).json({ message: 'Invalid token, authorization denied' });
  }
};

