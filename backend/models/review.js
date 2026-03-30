const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  createdAt: { type: Date, default: Date.now },
  authorName: String,

  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },

  verification: {
    isVerified: { type: Boolean, default: false },
    stayDuration: { type: Number },
    checkInDate: { type: Date },
    checkOutDate: { type: Date },
    blockchainHash: { type: String },
    verifiedAt: { type: Date },
  },

  authenticity: {
    score: { type: Number, default: 0, min: 0, max: 100 },
    timingScore: { type: Number, default: 0 },
    detailScore: { type: Number, default: 0 },
    photoScore: { type: Number, default: 0 },
    userHistoryScore: { type: Number, default: 0 },
    noIncentiveScore: { type: Number, default: 0 },
  },

  photos: [{
    url: { type: String },
    filename: { type: String },
    metadata: {
      takenAt: { type: Date },
      gpsVerified: { type: Boolean, default: false },
      deviceType: { type: String },
      originalDate: { type: Date },
    }
  }],

  aspects: {
    cleanliness: { type: Number, min: 0, max: 5 },
    accuracy: { type: Number, min: 0, max: 5 },
    communication: { type: Number, min: 0, max: 5 },
    location: { type: Number, min: 0, max: 5 },
    valueForMoney: { type: Number, min: 0, max: 5 },
  },

  flags: {
    reportedCount: { type: Number, default: 0 },
    suspectedFake: { type: Boolean, default: false },
    incentiveDetected: { type: Boolean, default: false },
    edited: { type: Boolean, default: false },
    editedAt: { type: Date },
  },

  helpful: {
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },

  response: {
    hostResponse: { type: String },
    respondedAt: { type: Date },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },

  immutable: { type: Boolean, default: false },
  editableUntil: { type: Date },

});

reviewSchema.index({ listing: 1, createdAt: -1 });
reviewSchema.index({ author: 1, createdAt: -1 });
reviewSchema.index({ 'verification.isVerified': 1, 'authenticity.score': -1 });

module.exports = mongoose.model("Review", reviewSchema);
