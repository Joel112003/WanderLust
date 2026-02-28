const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto"); // built-in Node.js module, no install needed
const Booking = require("../models/Booking");
const Listing = require("../models/listing");
const { verifyToken } = require("../middleware");
const router = express.Router();

// Initialize Razorpay with your keys from .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/create-order
// Called before opening the Razorpay modal.
// Creates an order in Razorpay and a pending booking in your DB.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/create-order", verifyToken, async (req, res) => {
  const { listingId, checkIn, checkOut, guests } = req.body;

  // Basic validation
  if (!listingId || !checkIn || !checkOut) {
    return res.status(400).json({ success: false, message: "listingId, checkIn, checkOut are required" });
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkInDate >= checkOutDate) {
    return res.status(400).json({ success: false, message: "checkOut must be after checkIn" });
  }

  try {
    // Fetch listing to get the price
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    // ✅ CHECK FOR BOOKING CONFLICTS BEFORE CREATING ORDER
    const conflictingBookings = await Booking.find({
      listing: listingId,
      status: { $in: ['pending', 'paid', 'confirmed'] },
      $or: [
        // Check if an existing booking overlaps with the new booking dates
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

    // Calculate nights and total
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const pricePerNight = listing.price;
    const totalAmount = nights * pricePerNight;

    // Create order in Razorpay (amount must be in paise = INR × 100)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `booking_${Date.now()}`,
      notes: {
        listingId: listingId.toString(),
        userId: req.user._id.toString(),
      },
    });

    // Save a pending booking so we have a record before payment
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
      order: razorpayOrder,   // send full order object to frontend
      bookingId: booking._id, // needed for the verify step
      breakdown: { nights, pricePerNight, totalAmount },
    });
  } catch (err) {
    console.error("create-order error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/verify
// Called after Razorpay's handler() fires on the frontend.
// Verifies the HMAC-SHA256 signature — NEVER skip this step.
// ─────────────────────────────────────────────────────────────────────────────
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

  // Recompute the expected signature using your key_secret
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  // Timing-safe comparison to prevent timing attacks
  const signaturesMatch = crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(razorpay_signature)
  );

  if (!signaturesMatch) {
    // Mark booking as failed
    await Booking.findByIdAndUpdate(bookingId, { status: "failed" });
    return res.status(400).json({ success: false, message: "Invalid payment signature" });
  }

  try {
    // Update booking to paid
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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payment/bookings
// Returns all bookings for the logged-in user
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payment/bookings/:id
// Returns a single booking by ID (must belong to logged-in user)
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/cancel/:id
// Cancels a pending booking
// ─────────────────────────────────────────────────────────────────────────────
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