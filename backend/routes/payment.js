const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Booking = require("../models/Booking");
const Listing = require("../models/listing");
const { verifyToken } = require("../middleware");
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/create-order", verifyToken, async (req, res) => {
  const { listingId, checkIn, checkOut, guests } = req.body;

  if (!listingId || !checkIn || !checkOut) {
    return res.status(400).json({ success: false, message: "listingId, checkIn, checkOut are required" });
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkInDate >= checkOutDate) {
    return res.status(400).json({ success: false, message: "checkOut must be after checkIn" });
  }

  try {

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const conflictingBookings = await Booking.find({
      listing: listingId,
      status: { $in: ['pending', 'paid', 'confirmed'] },
      $or: [

        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate }
        }
      ]
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'These dates are already booked. Please select different dates.',
        conflictingDates: conflictingBookings.map(booking => ({
          checkIn: booking.checkIn,
          checkOut: booking.checkOut
        }))
      });
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const pricePerNight = listing.price;
    const totalAmount = nights * pricePerNight;

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `booking_${Date.now()}`,
      notes: {
        listingId: listingId.toString(),
        userId: req.user._id.toString(),
      },
    });

    const booking = await Booking.create({
      listing: listingId,
      user: req.user._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guests || 1,
      nights,
      pricePerNight,
      totalAmount,
      razorpay_order_id: razorpayOrder.id,
      status: "pending",
    });

    res.json({
      success: true,
      order: razorpayOrder,
      bookingId: booking._id,
      breakdown: { nights, pricePerNight, totalAmount },
    });
  } catch (err) {
    console.error("create-order error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/verify", verifyToken, async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingId,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  const signaturesMatch = crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(razorpay_signature)
  );

  if (!signaturesMatch) {

    await Booking.findByIdAndUpdate(bookingId, { status: "failed" });
    return res.status(400).json({ success: false, message: "Invalid payment signature" });
  }

  try {

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        status: "paid",
        razorpay_payment_id,
        razorpay_signature,
      },
      { new: true }
    ).populate("listing", "title location country image price");

    res.json({
      success: true,
      message: "Payment verified and booking confirmed",
      booking,
    });
  } catch (err) {
    console.error("verify error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/bookings", verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("listing", "title location country images price")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/bookings/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("listing");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/cancel/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status === "paid") {
      return res.status(400).json({ success: false, message: "Paid bookings cannot be cancelled here. Contact support for refunds." });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ success: true, message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
