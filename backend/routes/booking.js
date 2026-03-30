const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Listing = require('../models/listing');
const notificationController = require('../controllers/notification');
const { isLoggedIn } = require('../middleware');

router.get('/listing/:listingId', async (req, res, next) => {
  try {
    const { listingId } = req.params;

    const bookings = await Booking.find({
      listing: listingId,
      status: { $in: ['pending', 'paid', 'confirmed'] }
    })
    .select('checkIn checkOut status')
    .sort({ checkIn: 1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching listing bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings for this listing' });
  }
});

router.use(isLoggedIn);

router.post('/', async (req, res, next) => {
  try {
    const { listingId, checkIn, checkOut, guests } = req.body;
    const userId = req.user._id;

    if (new Date(checkIn) >= new Date(checkOut)) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

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
        error: 'This listing is already booked for the selected dates',
        conflictingDates: conflictingBookings.map(booking => ({
          checkIn: booking.checkIn,
          checkOut: booking.checkOut
        }))
      });
    }

    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const subtotal = listing.price * nights;
    const taxes = Math.round(subtotal * 0.18);
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

    const listingWithOwner = await Listing.findById(listingId).populate('owner', 'username');

    const bookingUser = await require('../models/user').findById(userId);
    const bookingUsername = bookingUser ? bookingUser.username : 'A user';

    await notificationController.createNotification({
      recipient: listing.owner,
      type: 'booking_received',
      title: 'New Booking Received',
      message: `${bookingUsername} has booked your listing "${listingWithOwner.title}" from ${new Date(checkIn).toLocaleDateString()} to ${new Date(checkOut).toLocaleDateString()}!`,
      relatedBooking: savedBooking._id,
      relatedListing: listingId
    });

    await notificationController.createNotification({
      recipient: req.user._id,
      type: 'booking_made',
      message: `Your booking for ${listingWithOwner.title} has been confirmed!`,
      relatedBooking: savedBooking._id,
      relatedListing: listingId
    });

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

router.get('/:id', async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('listing')
      .populate('user', 'username email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (!booking.user._id.equals(req.user._id) && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/confirm', async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: 'listing',
      populate: { path: 'owner' }
    }).populate('user');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (!booking.listing.owner._id.equals(req.user._id) && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized - only the listing owner can confirm bookings' });
    }

    if (booking.status !== 'confirmed') {
      booking.status = 'confirmed';
      await booking.save();

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

router.put('/:id/cancel', async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (!booking.user.equals(req.user._id) && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

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

router.get('/owner/listings', async (req, res, next) => {
  try {
    const userId = req.user._id;

    const ownerListings = await Listing.find({ owner: userId }).select('_id');
    const listingIds = ownerListings.map(listing => listing._id);

    if (listingIds.length === 0) {
      return res.json({ success: true, bookings: [] });
    }

    const bookings = await Booking.find({
      listing: { $in: listingIds }
    })
      .populate('listing', 'title images location price')
      .populate('user', 'username email phoneNumber')
      .sort({ checkIn: -1 });

    res.json({
      success: true,
      bookings: bookings
    });
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    next(error);
  }
});

router.post('/:id/cancel-by-owner', async (req, res, next) => {
  try {
    const { reason, autoRebook = true, notifications = { email: true, sms: false, push: false } } = req.body;
    const bookingId = req.params.id;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId)
      .populate({ path: 'listing', populate: { path: 'owner' } })
      .populate('user', 'username email phoneNumber');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (!booking.listing.owner._id.equals(userId) && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized - only the listing owner can cancel this booking'
      });
    }

    if (['cancelled', 'cancelled_by_owner'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    const checkInDate = new Date(booking.checkIn);
    const today = new Date();
    const daysUntilCheckIn = Math.ceil((checkInDate - today) / (1000 * 60 * 60 * 24));
    const isLastMinute = daysUntilCheckIn <= 7;

    booking.status = 'cancelled_by_owner';
    booking.cancellationReason = reason;
    booking.cancellationDate = new Date();
    booking.isCancelledLastMinute = isLastMinute;

    await booking.save();

    await notificationController.createNotification({
      recipient: booking.user._id,
      type: 'booking_cancelled_by_owner',
      title: 'Booking Cancelled by Host',
      message: `Your booking for "${booking.listing.title}" has been cancelled by the host. Reason: ${reason}`,
      relatedBooking: booking._id,
      relatedListing: booking.listing._id
    });

    let rebookingResult = null;

    if (autoRebook) {
      try {
        const rebookingHelper = require('../util/rebookingHelper');

        const alternatives = await rebookingHelper.findAlternativeListings(booking._id);

        rebookingResult = {
          alternativesFound: alternatives.length,
          autoRebooked: false
        };

        if (alternatives.length > 0) {

          const AlternativeBooking = require('../models/AlternativeBooking');

          const alternativeBooking = new AlternativeBooking({
            originalBooking: booking._id,
            suggestedListings: alternatives.map(alt => ({
              listing: alt._id,
              similarityScore: alt.similarityScore
            })),
            status: 'pending_user_response',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
          });

          await alternativeBooking.save();

          await notificationController.createNotification({
            recipient: booking.user._id,
            type: 'alternative_accommodation',
            title: 'Alternative Accommodations Available',
            message: `We found ${alternatives.length} similar listing${alternatives.length > 1 ? 's' : ''} for your cancelled booking. View alternatives now!`,
            relatedBooking: booking._id
          });

          rebookingResult.alternativeBookingId = alternativeBooking._id;
        }
      } catch (rebookError) {
        console.error('Error during auto-rebooking:', rebookError);

      }
    }

    try {
      const emailService = require('../services/emailService');
      if (notifications.email && emailService.sendCancellationNotification) {
        await emailService.sendCancellationNotification({
          guestEmail: booking.user.email,
          guestName: booking.user.name || booking.user.username,
          listingTitle: booking.listing.title,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          reason: reason,
          isLastMinute: isLastMinute
        });
      }
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);

    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: booking,
      rebookingResult: rebookingResult
    });

  } catch (error) {
    console.error('Error cancelling booking by owner:', error);
    next(error);
  }
});

module.exports = router;
