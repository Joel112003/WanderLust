const Report = require("../models/Report");
const Booking = require("../models/Booking");
const Listing = require("../models/listing");
const AlternativeBooking = require("../models/AlternativeBooking");
const User = require("../models/user");
const {
  findAlternativeListings,
  createAlternativeBooking,
} = require("../util/rebookingHelper");
const {
  sendReportConfirmationEmail,
  sendAlternativeAccommodationEmail,
} = require("../services/emailService");

const SEVERITY_MAP = {
  not_exist: "critical",
  unsafe: "critical",
  not_match: "high",
  unclean: "high",
  wrong_location: "high",
  no_amenities: "medium",
  other: "medium",
};

exports.createReport = async (req, res) => {
  try {
    const { bookingId, listingId, type, description, requestAutoRebook = true } =
      req.body;

    const booking = await Booking.findById(bookingId).populate("user");
    const listing = await Listing.findById(listingId);

    if (!booking || !listing) {
      return res.status(404).json({ error: "Booking or listing not found" });
    }

    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized to report this booking" });
    }

    const severity = SEVERITY_MAP[type] || "medium";

    let photoUrls = [];
    if (req.files && req.files.length > 0) {

      photoUrls = req.files.map((file) => file.path || `/uploads/${file.filename}`);
    }

    const report = new Report({
      booking: bookingId,
      listing: listingId,
      reporter: req.user._id,
      type,
      description,
      severity,
      photos: photoUrls,
      requestAutoRebook,
      status: "under_investigation",
    });

    await report.save();

    await sendReportConfirmationEmail(req.user.email, {
      reporterName: req.user.username || req.user.email,
      ticketNumber: report.ticketNumber,
      reportType: type,
      listingTitle: listing.title,
      severity,
    });

    if (severity === "critical") {

      console.log(
        `🚨 CRITICAL REPORT: ${type} - Ticket #${report.ticketNumber}`
      );

    } else if (severity === "high") {
      console.log(`⚠️ HIGH PRIORITY REPORT: ${type} - Ticket #${report.ticketNumber}`);
    }

    let alternativeBooking = null;
    if (
      requestAutoRebook &&
      (severity === "critical" || severity === "high") &&
      booking.status === "confirmed"
    ) {
      try {
        const alternatives = await findAlternativeListings(bookingId);

        if (alternatives.length > 0) {
          alternativeBooking = new AlternativeBooking({
            originalBooking: bookingId,
            suggestedListings: alternatives.slice(0, 3).map((alt) => ({
              listing: alt._id,
              similarityScore: alt.similarityScore,
            })),
            status: "pending_user_response",
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          });

          await alternativeBooking.save();

          await sendAlternativeAccommodationEmail(req.user.email, {
            guestName: req.user.username || req.user.email,
            originalListing: listing.title,
            alternatives,
            alternativeBookingId: alternativeBooking._id,
          });

          report.autoRebookProcessed = true;
          await report.save();
        }
      } catch (error) {
        console.error("Error processing auto-rebook for report:", error);
      }
    }

    res.json({
      success: true,
      report: {
        id: report._id,
        ticketNumber: report.ticketNumber,
        severity,
        status: report.status,
        estimatedResolution: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      alternativeBooking: alternativeBooking
        ? {
            bookingId: alternativeBooking._id,
            alternativesCount: alternativeBooking.suggestedListings.length,
            status: "pending_confirmation",
          }
        : null,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ error: "Failed to create report" });
  }
};

exports.getUserReports = async (req, res) => {
  try {
    const reports = await Report.find({ reporter: req.user._id })
      .populate("booking")
      .populate("listing", "title image location")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("Error fetching user reports:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};

exports.getReportByTicket = async (req, res) => {
  try {
    const { ticketNumber } = req.params;

    const report = await Report.findOne({ ticketNumber })
      .populate("booking")
      .populate("listing", "title image location")
      .populate("reporter", "username email")
      .populate("assignedTo", "username email");

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    if (
      report.reporter._id.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ error: "Unauthorized to view this report" });
    }

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ error: "Failed to fetch report" });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution, assignedTo } = req.body;

    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    if (status) {
      report.status = status;
    }

    if (resolution) {
      report.resolution = resolution;
    }

    if (assignedTo) {
      report.assignedTo = assignedTo;
    }

    if (status === "resolved" || status === "dismissed") {
      report.resolvedAt = new Date();
    }

    await report.save();

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({ error: "Failed to update report" });
  }
};

exports.getAllReports = async (req, res) => {
  try {

    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { status, severity, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;

    const reports = await Report.find(query)
      .populate("booking")
      .populate("listing", "title image location")
      .populate("reporter", "username email")
      .populate("assignedTo", "username email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalReports = await Report.countDocuments(query);

    res.json({
      success: true,
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalReports,
        pages: Math.ceil(totalReports / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching all reports:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};

module.exports = exports;
