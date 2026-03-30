const User = require('../models/user');
const Listing = require('../models/listing');
const Review = require('../models/review');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const emailService = require('../services/emailService');

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

const updateListingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!["approved", "rejected", "pending"].includes(status))
      return res.status(400).json({ success: false, error: "Invalid status value" });

    const updateData = { status };

    if (status === "rejected") {
      updateData.rejectionReason = reason || "Your listing did not meet our guidelines.";
    } else {
      updateData.rejectionReason = null;
    }

    const listing = await Listing.findByIdAndUpdate(id, updateData, { new: true })
      .populate('owner', 'email username');

    if (!listing)
      return res.status(404).json({ success: false, error: "Listing not found" });

    if (listing.owner?.email) {
      if (status === "approved") {
        await emailService.sendListingApproved({
          ownerEmail:   listing.owner.email,
          ownerName:    listing.owner.username || listing.owner.email,
          listingTitle: listing.title,
          listingId:    listing._id,
        });
      } else if (status === "rejected") {
        await emailService.sendListingRejected({
          ownerEmail:   listing.owner.email,
          ownerName:    listing.owner.username || listing.owner.email,
          listingTitle: listing.title,
          reason:       updateData.rejectionReason,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Listing ${status}`,
      data: listing,
    });
  } catch (error) {
    console.error("updateListingStatus error:", error);
    res.status(500).json({ success: false, error: "Failed to update listing status" });
  }
};

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

const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    await Review.deleteMany({ listing: req.params.id });
    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    console.error('Delete listing error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Listing.deleteMany({ owner: req.params.id });
    await Review.deleteMany({ author: req.params.id });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        message: "Email, username, and password are required"
      });
    }

    const user = await User.findOne({
      email,
      username
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }

    const isValid = await user.authenticate(password);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({
        success: false,
        message: "Server configuration error"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

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
    deleteListing,
    deleteUser,
    deleteReview,
    adminLogin
  };
