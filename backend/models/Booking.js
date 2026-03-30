const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      default: 1,
      min: 1,
    },
    nights: {
      type: Number,
      required: true,
    },
    pricePerNight: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },

    razorpay_order_id: {
      type: String,
      default: null,
    },
    razorpay_payment_id: {
      type: String,
      default: null,
    },
    razorpay_signature: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "confirmed",
        "failed",
        "cancelled",
        "cancelled_by_owner",
        "completed",
      ],
      default: "pending",
    },

    cancellationReason: {
      type: String,
    },
    isCancelledLastMinute: {
      type: Boolean,
      default: false,
    },
    cancellationDate: {
      type: Date,
    },

    isAlternativeBooking: {
      type: Boolean,
      default: false,
    },
    originalBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    priceDifferenceCovered: {
      type: Number,
      default: 0,
    },

    confirmationNumber: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
