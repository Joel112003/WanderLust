const User = require("../models/user");
const Listing = require("../models/listing");
const Review = require("../models/review");
const jwt = require("jsonwebtoken");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      totalListings: await Listing.countDocuments(),
      totalReviews: await Review.countDocuments(),
      pendingListings: await Listing.countDocuments({ status: "pending" }),
      recentUsers: await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("-password"),
      recentListings: await Listing.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("owner", "username"),
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all listings with filters
const getAllListings = async (req, res) => {
  try {
    const { status, featured, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (featured) query.featured = featured === "true";
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const listings = await Listing.find(query)
      .populate("owner", "username email")
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
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
      return res.status(404).json({ message: "Listing not found" });
    }

    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Toggle featured status
const toggleFeatured = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    listing.featured = !listing.featured;
    await listing.save();

    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
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
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("author", "username")
      .populate("listing", "title")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
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
      return res.status(404).json({ message: "Review not found" });
    }

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a listing
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    // Also delete associated reviews
    await Review.deleteMany({ listing: req.params.id });
    res.json({ message: "Listing deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Delete user's listings and reviews
    await Listing.deleteMany({ owner: req.params.id });
    await Review.deleteMany({ author: req.params.id });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
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
      username,
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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Send response with token and user info
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// Helper function to get date range
const getDateRange = (range) => {
  const endDate = new Date();
  let startDate = new Date();

  switch (range) {
    case "week":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case "quarter":
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case "year":
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    case "all":
      startDate = new Date(0); // Beginning of time
      break;
    default:
      startDate.setDate(startDate.getDate() - 7); // Default to week
  }

  return { startDate, endDate };
};

// Generate report for users, listings, reviews or all
exports.generateReport = async (req, res) => {
  try {
    const { type = "all", dateRange = "week" } = req.query;
    const { startDate, endDate } = getDateRange(dateRange);

    // Create PDF document
    const doc = new PDFDocument();
    const fileName = `wanderlust_${type}_report_${
      new Date().toISOString().split("T")[0]
    }.pdf`;

    // Set response headers for file download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    // Pipe PDF directly to response
    doc.pipe(res);

    // Add report title and meta information
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("WanderLust Admin Report", { align: "center" });
    doc.moveDown();
    doc
      .font("Helvetica")
      .fontSize(12)
      .text(`Report Type: ${type.charAt(0).toUpperCase() + type.slice(1)}`, {
        align: "left",
      })
      .text(
        `Date Range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
        { align: "left" }
      )
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: "left" });

    doc.moveDown().moveDown();

    // Fetch data based on report type
    if (type === "all" || type === "users") {
      await generateUsersReport(doc, startDate, endDate);
    }

    if (type === "all" || type === "listings") {
      await generateListingsReport(doc, startDate, endDate);
    }

    if (type === "all" || type === "reviews") {
      await generateReviewsReport(doc, startDate, endDate);
    }

    // Finalize PDF and end response
    doc.end();
  } catch (error) {
    console.error("Error generating report:", error);
    res
      .status(500)
      .json({ message: "Failed to generate report", error: error.message });
  }
};

// Generate users report section
async function generateUsersReport(doc, startDate, endDate) {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();

    // Get new users in date range
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Get users by registration date (grouped by month)
    const usersByMonth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Write section header
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .text("User Statistics", { underline: true });
    doc.moveDown();

    // Write user statistics
    doc
      .font("Helvetica")
      .fontSize(12)
      .text(`Total Users: ${totalUsers}`)
      .text(
        `New Users (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}): ${newUsers}`
      );

    doc.moveDown();

    // User distribution by month
    if (usersByMonth.length > 0) {
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .text("User Registration by Month");
      doc.moveDown();

      // Create a simple table
      let yPos = doc.y;
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      usersByMonth.forEach((item, index) => {
        const month = monthNames[item._id.month - 1];
        const year = item._id.year;
        doc
          .font("Helvetica")
          .fontSize(12)
          .text(`${month} ${year}: ${item.count} users`, { continued: false });
      });
    }

    // Add a page break
    doc.addPage();
  } catch (error) {
    console.error("Error generating users report:", error);
    doc
      .font("Helvetica")
      .fontSize(12)
      .text("Error generating users report section.", { color: "red" });
  }
}

// Generate listings report section
async function generateListingsReport(doc, startDate, endDate) {
  try {
    // Get total listings
    const totalListings = await Listing.countDocuments();

    // Get new listings in date range
    const newListings = await Listing.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Get listings by category
    const listingsByCategory = await Listing.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get average price
    const priceStats = await Listing.aggregate([
      {
        $group: {
          _id: null,
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);

    // Write section header
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .text("Listing Statistics", { underline: true });
    doc.moveDown();

    // Write listing statistics
    doc
      .font("Helvetica")
      .fontSize(12)
      .text(`Total Listings: ${totalListings}`)
      .text(
        `New Listings (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}): ${newListings}`
      );

    if (priceStats.length > 0) {
      doc
        .moveDown()
        .text(`Average Price: $${priceStats[0].avgPrice.toFixed(2)}`)
        .text(
          `Price Range: $${priceStats[0].minPrice.toFixed(
            2
          )} - $${priceStats[0].maxPrice.toFixed(2)}`
        );
    }

    doc.moveDown();

    // Listings by category
    if (listingsByCategory.length > 0) {
      doc.font("Helvetica-Bold").fontSize(14).text("Listings by Category");
      doc.moveDown();

      listingsByCategory.forEach((item) => {
        const category = item._id || "Uncategorized";
        doc
          .font("Helvetica")
          .fontSize(12)
          .text(`${category}: ${item.count} listings`);
      });
    }

    // Add a page break
    doc.addPage();
  } catch (error) {
    console.error("Error generating listings report:", error);
    doc
      .font("Helvetica")
      .fontSize(12)
      .text("Error generating listings report section.", { color: "red" });
  }
}

// Generate reviews report section
async function generateReviewsReport(doc, startDate, endDate) {
  try {
    // Get total reviews
    const totalReviews = await Review.countDocuments();

    // Get new reviews in date range
    const newReviews = await Review.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Get average rating
    const ratingStats = await Review.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Write section header
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .text("Review Statistics", { underline: true });
    doc.moveDown();

    // Write review statistics
    doc
      .font("Helvetica")
      .fontSize(12)
      .text(`Total Reviews: ${totalReviews}`)
      .text(
        `New Reviews (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}): ${newReviews}`
      );

    if (ratingStats.length > 0) {
      doc
        .moveDown()
        .text(`Average Rating: ${ratingStats[0].avgRating.toFixed(2)} / 5`);
    }

    doc.moveDown();

    // Rating distribution
    if (ratingDistribution.length > 0) {
      doc.font("Helvetica-Bold").fontSize(14).text("Rating Distribution");
      doc.moveDown();

      // Create a simple rating distribution chart
      for (let i = 5; i >= 1; i--) {
        const found = ratingDistribution.find((item) => item._id === i);
        const count = found ? found.count : 0;
        const percentage =
          totalReviews > 0 ? ((count / totalReviews) * 100).toFixed(1) : 0;

        doc
          .font("Helvetica")
          .fontSize(12)
          .text(`${i} Stars: ${count} reviews (${percentage}%)`, {
            continued: false,
          });
      }
    }
  } catch (error) {
    console.error("Error generating reviews report:", error);
    doc
      .font("Helvetica")
      .fontSize(12)
      .text("Error generating reviews report section.", { color: "red" });
  }
}
module.exports = {
  getDashboardStats,
  getAllListings,
  updateListingStatus,
  toggleFeatured,
  getAllUsers,
  updateUserRole,
  getAllReviews,
  approveReview,
  deleteListing, // Add these new functions
  deleteUser,
  deleteReview,
  adminLogin,
};
