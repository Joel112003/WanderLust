const mongoose = require("mongoose");

const alternativeBookingSchema = new mongoose.Schema(
  {
    originalBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    suggestedListings: [
      {
        listing: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Listing",
        },
        similarityScore: {
          type: Number,
          min: 0,
          max: 100,
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending_user_response", "accepted", "rejected", "expired"],
      default: "pending_user_response",
    },
    selectedListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
    },
    newBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    rejectionReason: {
      type: String,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
    },
    notificationsSent: {
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

alternativeBookingSchema.pre("save", function (next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  next();
});

alternativeBookingSchema.index({ originalBooking: 1 });
alternativeBookingSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model("AlternativeBooking", alternativeBookingSchema);
