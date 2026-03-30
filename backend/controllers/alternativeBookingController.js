const AlternativeBooking = require("../models/AlternativeBooking");
const Booking = require("../models/Booking");
const Listing = require("../models/listing");
const User = require("../models/user");
const { createAlternativeBooking } = require("../util/rebookingHelper");
const {
  sendAlternativeBookingConfirmation,
} = require("../services/emailService");

exports.getAlternativeBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const alternativeBooking = await AlternativeBooking.findById(id)
      .populate("originalBooking")
      .populate({
        path: "suggestedListings.listing",
        model: "Listing",
      })
      .populate("selectedListing")
      .populate("newBooking");

    if (!alternativeBooking) {
      return res.status(404).json({ error: "Alternative booking not found" });
    }

    const originalBooking = await Booking.findById(
      alternativeBooking.originalBooking
    ).populate("user");

    if (originalBooking.user._id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized to view this alternative booking" });
    }

    if (
      alternativeBooking.status === "pending_user_response" &&
      new Date() > alternativeBooking.expiresAt
    ) {
      alternativeBooking.status = "expired";
      await alternativeBooking.save();
    }

    res.json({
      success: true,
      alternativeBooking,
      originalBooking,
    });
  } catch (error) {
    console.error("Error fetching alternative booking:", error);
    res.status(500).json({ error: "Failed to fetch alternative booking" });
  }
};

exports.respondToAlternative = async (req, res) => {
  try {
    const { id: alternativeId } = req.params;
    const { accept, selectedListingId, rejectionReason } = req.body;

    const alternativeBooking = await AlternativeBooking.findById(alternativeId)
      .populate("originalBooking")
      .populate({
        path: "suggestedListings.listing",
        model: "Listing",
      });

    if (!alternativeBooking) {
      return res.status(404).json({ error: "Alternative booking not found" });
    }

    const originalBooking = await Booking.findById(
      alternativeBooking.originalBooking
    ).populate("user");

    if (originalBooking.user._id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized to respond to this alternative booking" });
    }

    if (alternativeBooking.status !== "pending_user_response") {
      return res.status(400).json({
        error: "This alternative booking has already been processed",
        status: alternativeBooking.status,
      });
    }

    if (new Date() > alternativeBooking.expiresAt) {
      alternativeBooking.status = "expired";
      await alternativeBooking.save();
      return res
        .status(400)
        .json({ error: "This alternative booking offer has expired" });
    }

    if (accept) {

      const selectedListingData = alternativeBooking.suggestedListings.find(
        (sl) => sl.listing._id.toString() === selectedListingId
      );

      if (!selectedListingData) {
        return res
          .status(400)
          .json({ error: "Selected listing not in suggested alternatives" });
      }

      const selectedListing = await Listing.findById(selectedListingId);

      const newBooking = await createAlternativeBooking(
        originalBooking,
        selectedListing
      );

      alternativeBooking.status = "accepted";
      alternativeBooking.selectedListing = selectedListingId;
      alternativeBooking.newBooking = newBooking._id;
      alternativeBooking.respondedAt = new Date();
      await alternativeBooking.save();

      await sendAlternativeBookingConfirmation(originalBooking.user.email, {
        guestName: originalBooking.user.username || originalBooking.user.email,
        confirmationNumber: newBooking.confirmationNumber,
        listingTitle: selectedListing.title,
        checkIn: newBooking.checkIn,
        checkOut: newBooking.checkOut,
        totalAmount: newBooking.totalAmount,
        listingId: selectedListing._id,
      });

      res.json({
        success: true,
        message: "Alternative booking confirmed",
        booking: {
          id: newBooking._id,
          listing: selectedListing,
          confirmationNumber: newBooking.confirmationNumber,
          status: newBooking.status,
          checkIn: newBooking.checkIn,
          checkOut: newBooking.checkOut,
          totalAmount: newBooking.totalAmount,
          priceDifferenceCovered: newBooking.priceDifferenceCovered,
        },
      });
    } else {

      alternativeBooking.status = "rejected";
      alternativeBooking.rejectionReason = rejectionReason || "User declined";
      alternativeBooking.respondedAt = new Date();
      await alternativeBooking.save();

      console.log(
        `📋 Alternative rejected for booking ${originalBooking._id} - Reason: ${rejectionReason}`
      );

      res.json({
        success: true,
        message: "Alternative booking rejected",
        note: "Our support team will contact you shortly to assist with alternative arrangements",
      });
    }
  } catch (error) {
    console.error("Error responding to alternative booking:", error);
    res.status(500).json({ error: "Failed to process response" });
  }
};

exports.getUserAlternatives = async (req, res) => {
  try {

    const userBookings = await Booking.find({ user: req.user._id }).select("_id");
    const bookingIds = userBookings.map((b) => b._id);

    const alternatives = await AlternativeBooking.find({
      originalBooking: { $in: bookingIds },
    })
      .populate("originalBooking")
      .populate({
        path: "suggestedListings.listing",
        model: "Listing",
      })
      .populate("selectedListing")
      .populate("newBooking")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: alternatives.length,
      data: alternatives,
    });
  } catch (error) {
    console.error("Error fetching user alternatives:", error);
    res.status(500).json({ error: "Failed to fetch alternatives" });
  }
};

module.exports = exports;
