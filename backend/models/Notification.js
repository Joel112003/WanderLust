const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['booking_made', 'booking_received', 'booking_cancelled', 'booking_confirmed'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedBooking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking'
  },
  relatedListing: {
    type: Schema.Types.ObjectId,
    ref: 'Listing'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
