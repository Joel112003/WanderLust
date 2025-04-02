const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking'); 
const Listing = require('../models/listing'); 
const notificationController = require('../controllers/notification');
const { isLoggedIn } = require('../middleware');

// Apply authentication middleware to all booking routes
router.use(isLoggedIn);

// Create new booking
router.post('/', async (req, res, next) => {
  try {
    const { listingId, checkIn, checkOut, guests } = req.body;
    const userId = req.user._id;
    
    // Validate dates
    if (new Date(checkIn) >= new Date(checkOut)) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Convert dates to Date objects for proper comparison
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Check for existing bookings that conflict
    const conflictingBookings = await Booking.find({
      listing: listingId,
      status: { $ne: 'cancelled' },
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
        error: 'This listing is already booked for the selected dates',
        conflictingDates: conflictingBookings.map(booking => ({
          checkIn: booking.checkIn,
          checkOut: booking.checkOut
        }))
      });
    }

    // Calculate pricing
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const subtotal = listing.price * nights;
    const taxes = Math.round(subtotal * 0.18); // 18% tax
    const total = subtotal + taxes;

    const newBooking = new Booking({
      listing: listingId,
      user: userId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      subtotal,
      taxes,
      total,
      status: 'confirmed'
    });

    const savedBooking = await newBooking.save();

    // Get listing with owner info for notification
    const listingWithOwner = await Listing.findById(listingId).populate('owner', 'username');
    
    // Get user info for notification
    const bookingUser = await require('../models/user').findById(userId);
    const bookingUsername = bookingUser ? bookingUser.username : 'A user';

    // Create notification for listing owner
    await notificationController.createNotification({
      recipient: listing.owner,
      type: 'booking_received',
      title: 'New Booking Received',
      message: `${bookingUsername} has booked your listing "${listingWithOwner.title}" from ${new Date(checkIn).toLocaleDateString()} to ${new Date(checkOut).toLocaleDateString()}!`,
      relatedBooking: savedBooking._id,
      relatedListing: listingId
    });

    // Create notification for the guest (booking made)
    await notificationController.createNotification({
      recipient: req.user._id,
      type: 'booking_made',
      message: `Your booking for ${listingWithOwner.title} has been confirmed!`,
      relatedBooking: savedBooking._id,
      relatedListing: listingId
    });

    // Populate listing details for response
    await savedBooking.populate('listing');
    await savedBooking.populate('user', 'username email');
    
    res.status(201).json({
      success: true,
      data: savedBooking
    });
    
  } catch (error) {
    next(error);
  }
});

// Get bookings for a specific listing (no authentication required)
router.get('/listing/:listingId', async (req, res, next) => {
  try {
    const { listingId } = req.params;
    
    const bookings = await Booking.find({ 
      listing: listingId,
      status: { $ne: 'cancelled' }
    })
    .select('checkIn checkOut status')
    .sort({ checkIn: 1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching listing bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings for this listing' });
  }
});

// Get user's bookings
router.get('/my-bookings', async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('listing')
      .sort({ checkIn: -1 });
      
    res.json(bookings);
  } catch (error) {
    next(error);
  }
});

// Get booking details
router.get('/:id', async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('listing')
      .populate('user', 'username email');
      
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Verify user owns this booking
    if (!booking.user._id.equals(req.user._id) && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

// Confirm booking (for hosts)
router.put('/:id/confirm', async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: 'listing',
      populate: { path: 'owner' }
    }).populate('user');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Verify the current user is the listing owner
    if (!booking.listing.owner._id.equals(req.user._id) && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized - only the listing owner can confirm bookings' });
    }
    
    // Update booking status if not already confirmed
    if (booking.status !== 'confirmed') {
      booking.status = 'confirmed';
      await booking.save();
      
      // Create notification for the guest about the confirmation
      await notificationController.createNotification({
        recipient: booking.user._id,
        type: 'booking_confirmed',
        message: `Your booking for ${booking.listing.title} has been confirmed by the host!`,
        relatedBooking: booking._id,
        relatedListing: booking.listing._id
      });
      
      res.json({ 
        success: true,
        message: 'Booking confirmed successfully',
        data: booking
      });
    } else {
      res.json({ 
        success: true,
        message: 'Booking was already confirmed',
        data: booking
      });
    }
  } catch (error) {
    next(error);
  }
});

// Cancel booking
router.put('/:id/cancel', async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    if (!booking.user.equals(req.user._id) && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Can only cancel future bookings
    if (new Date(booking.checkIn) < new Date()) {
      return res.status(400).json({ error: 'Cannot cancel past bookings' });
    }
    
    booking.status = 'cancelled';
    await booking.save();
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;