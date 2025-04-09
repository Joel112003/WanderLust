const User = require('../models/user');
const Listing = require('../models/listing');
const Review = require('../models/review');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');


// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      totalListings: await Listing.countDocuments(),
      totalReviews: await Review.countDocuments(),
      pendingListings: await Listing.countDocuments({ status: 'pending' }),
      recentUsers: await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('-password'),
      recentListings: await Listing.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('owner', 'username')
    };
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all listings with filters
const getAllListings = async (req, res) => {
  try {
    const { status, featured, search } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (featured) query.featured = featured === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const listings = await Listing.find(query)
      .populate('owner', 'username email')
      .sort({ createdAt: -1 });
      
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update listing status (approve/reject)
const updateListingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle featured status
const toggleFeatured = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    listing.featured = !listing.featured;
    await listing.save();
    
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
      
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { isAdmin } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isAdmin },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('author', 'username')
      .populate('listing', 'title')
      .sort({ createdAt: -1 });
      
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve review
const approveReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a listing
const deleteListing = async (req, res) => {
    try {
      const listing = await Listing.findByIdAndDelete(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
      // Also delete associated reviews
      await Review.deleteMany({ listing: req.params.id });
      res.json({ message: 'Listing deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Delete a user
  const deleteUser = async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      // Delete user's listings and reviews
      await Listing.deleteMany({ owner: req.params.id });
      await Review.deleteMany({ author: req.params.id });
      res.json({ message: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Delete a review
  const deleteReview = async (req, res) => {
    try {
      const review = await Review.findByIdAndDelete(req.params.id);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      res.json({ message: 'Review deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  };

  
  const adminLogin = async (req, res) => {
    try {
        const { email, password, username } = req.body;
        
        if (!username) {
            return res.status(400).json({ message: "Username is required" });
        }

        // Check if user exists and is admin
        const user = await User.findOne({ 
            email,
            username 
        });
        
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!user.isAdmin) {
            return res.status(403).json({ message: "Not authorized as admin" });
        }

        // Verify password using the authenticate method
        const isValid = await user.authenticate(password);
        
        if (!isValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send response with token and user info
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                isAdmin: user.isAdmin
            }
        });

    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).json({ 
            success: false,
            message: "Server error during login" 
        });
    }
};
  
  module.exports = {
    getDashboardStats,
    getAllListings,
    updateListingStatus,
    toggleFeatured,
    getAllUsers,
    updateUserRole,
    getAllReviews,
    approveReview,
    deleteListing,  // Add these new functions
    deleteUser,
    deleteReview,
    adminLogin
  };