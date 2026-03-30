const Cancellation = require("../models/Cancellation");
const Booking = require("../models/Booking");
const Listing = require("../models/listing");
const AlternativeBooking = require("../models/AlternativeBooking");
const User = require("../models/user");
const {
  findAlternativeListings,
  createAlternativeBooking,
  daysUntilCheckIn,
} = require("../util/rebookingHelper");
const {
  sendCancellationEmail,
  sendAlternativeAccommodationEmail,
} = require("../services/emailService");

exports.cancelListing = async (req, res) => {
  try {
    const { id: listingId } = req.params;
    const {
      reason,
      cancelType,
      startDate,
      endDate,
      autoRebook = true,
      notifications = { email: true, sms: false, push: false },
    } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized to cancel this listing" });
    }

    if (cancelType === "temporary" && (!startDate || !endDate)) {
      return res
        .status(400)
        .json({ error: "Start and end dates required for temporary cancellation" });
    }

    const query = {
      listing: listingId,
      status: { $in: ["confirmed", "paid"] },
    };

    if (cancelType === "temporary") {
      query.checkIn = { $gte: new Date(startDate) };
      query.checkOut = { $lte: new Date(endDate) };
    } else {
      query.checkIn = { $gte: new Date() };
    }

    const affectedBookings = await Booking.find(query).populate("user");

    const cancellation = new Cancellation({
      listing: listingId,
      owner: req.user._id,
      reason,
      cancelType,
      startDate: cancelType === "temporary" ? startDate : undefined,
      endDate: cancelType === "temporary" ? endDate : undefined,
      affectedBookings: affectedBookings.map((b) => b._id),
      autoRebookEnabled: autoRebook,
      notificationsSent: notifications,
    });

    await cancellation.save();

    const cancelledBookings = [];
    const rebookingResults = [];

    for (const booking of affectedBookings) {
      const daysUntil = daysUntilCheckIn(booking.checkIn);
      const isLastMinute = daysUntil <= 7;

      booking.status = "cancelled_by_owner";
      booking.cancellationReason = reason;
      booking.isCancelledLastMinute = isLastMinute;
      booking.cancellationDate = new Date();
      await booking.save();

      cancelledBookings.push({
        bookingId: booking._id,
        guestId: booking.user._id,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        isLastMinute,
        alternativeFound: false,
      });

      if (notifications.email) {
        await sendCancellationEmail(booking.user.email, {
          guestName: booking.user.username || booking.user.email,
          listingTitle: listing.title,
          reason,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          refundAmount: booking.totalAmount,
          isLastMinute,
        });
      }

      if (autoRebook && isLastMinute) {
        try {
          const alternatives = await findAlternativeListings(booking._id);

          if (alternatives.length > 0) {

            const alternativeBooking = new AlternativeBooking({
              originalBooking: booking._id,
              suggestedListings: alternatives.map((alt) => ({
                listing: alt._id,
                similarityScore: alt.similarityScore,
              })),
              status: "pending_user_response",
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            });

            await alternativeBooking.save();

            await sendAlternativeAccommodationEmail(booking.user.email, {
              guestName: booking.user.username || booking.user.email,
              originalListing: listing.title,
              alternatives,
              alternativeBookingId: alternativeBooking._id,
            });

            cancelledBookings[cancelledBookings.length - 1].alternativeFound = true;

            rebookingResults.push({
              originalBookingId: booking._id,
              alternativeBookingId: alternativeBooking._id,
              alternativesCount: alternatives.length,
              status: "pending_user_response",
            });
          }
        } catch (error) {
          console.error("Error processing auto-rebook:", error);
        }
      }
    }

    if (cancelType === "temporary") {
      if (!listing.unavailableDates) {
        listing.unavailableDates = [];
      }
      listing.unavailableDates.push({
        from: new Date(startDate),
        to: new Date(endDate),
      });
      await listing.save();
    }

    res.json({
      success: true,
      message: "Listing cancelled successfully",
      cancellation: {
        id: cancellation._id,
        type: cancelType,
        affectedBookingsCount: affectedBookings.length,
      },
      cancelledBookings,
      rebookingResults,
    });
  } catch (error) {
    console.error("Error cancelling listing:", error);
    res.status(500).json({ error: "Failed to cancel listing" });
  }
};

exports.getCancellationHistory = async (req, res) => {
  try {
    const { id: listingId } = req.params;

    const cancellations = await Cancellation.find({ listing: listingId })
      .populate("owner", "username email")
      .populate("affectedBookings")
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      cancellations,
    });
  } catch (error) {
    console.error("Error fetching cancellation history:", error);
    res.status(500).json({ error: "Failed to fetch cancellation history" });
  }
};

exports.getCancelledBookings = async (req, res) => {
  try {
    const cancelledBookings = await Booking.find({
      user: req.user._id,
      status: { $in: ["cancelled_by_owner", "cancelled"] },
    })
      .populate("listing")
      .sort({ cancellationDate: -1 });

    res.json({
      success: true,
      bookings: cancelledBookings,
    });
  } catch (error) {
    console.error("Error fetching cancelled bookings:", error);
    res.status(500).json({ error: "Failed to fetch cancelled bookings" });
  }
};

module.exports = exports;
