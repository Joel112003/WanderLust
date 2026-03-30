const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const validCategories = [
  "Apartment", "House", "Cottage", "Cabin", "Mansion", "Farm",
  "Lake house", "Beach house", "Ski chalet", "Camping",
  "Treehouse", "Boat", "Luxury villa", "Castle",
];

const listingSchema = new Schema({
  title:       { type: String, required: true },
  description: String,
  image: {
    url:      { type: String, required: true },
    filename: { type: String, required: true },
  },
  price:    { type: Number, required: true, min: 0 },
  location: { type: String, required: true },
  country:  { type: String, required: true },
  reviews:  [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  owner:    { type: Schema.Types.ObjectId, ref: "User" },
  views:    { type: Number, default: 0 },
  uniqueViews: [{ type: String }],

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  rejectionReason: {
    type: String,
    default: null,
  },

  unavailableDates: [
    {
      from:  { type: Date, required: true },
      to:    { type: Date, required: true },
    }
  ],

  geometry: {
    type: { type: String, enum: ["Point"] },
    coordinates: {
      type: [Number],
      validate: {
        validator: (v) => !v || v.length === 0 || v.length === 2,
        message: "Coordinates must have exactly 2 values",
      },
    },
  },

  category: { type: String, enum: validCategories, required: true },
  guests:   { type: Number, required: true, min: 1 },
  bedrooms: { type: Number, required: true, min: 1 },
  beds:     { type: Number, required: true, min: 1 },
  baths:    { type: Number, required: true, min: 1 },

  pricing: {
    basePrice: { type: Number, required: true },
    finalPrice: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    cleaningFee: { type: Number, default: 0 },
    isAllInclusive: { type: Boolean, default: true },
  },

  verifications: {
    wifiSpeed: {
      verified: { type: Boolean, default: false },
      speedMbps: { type: Number, default: 0 },
      lastTested: { type: Date },
      testResults: [{
        date: Date,
        downloadSpeed: Number,
        uploadSpeed: Number,
        latency: Number,
      }]
    },
    photos: {
      verified: { type: Boolean, default: false },
      metadataChecked: { type: Boolean, default: false },
      lastVerified: { type: Date },
    },
    safety: {
      verified: { type: Boolean, default: false },
      fireExtinguisher: { type: Boolean, default: false },
      firstAidKit: { type: Boolean, default: false },
      emergencyExit: { type: Boolean, default: false },
      carbonMonoxideDetector: { type: Boolean, default: false },
      smokeDetector: { type: Boolean, default: false },
    },
    identity: {
      hostIdentityVerified: { type: Boolean, default: false },
      govtIdVerified: { type: Boolean, default: false },
      addressVerified: { type: Boolean, default: false },
    },
    inspection: {
      lastInspected: { type: Date },
      inspectionScore: { type: Number, min: 0, max: 10 },
      inspector: String,
      notes: String,
    }
  },

  amenityVerification: {
    workStayCertified: { type: Boolean, default: false },
    familySafe: { type: Boolean, default: false },
    petFriendly: { type: Boolean, default: false },
    hasKitchen: { type: Boolean, default: false },
    hasParking: { type: Boolean, default: false },
    hasPool: { type: Boolean, default: false },
  },

  locationSafety: {
    safetyScore: { type: Number, min: 0, max: 100 },
    crimeRate: { type: String, enum: ['low', 'medium', 'high'] },
    neighborhoodRating: { type: Number, min: 0, max: 5 },
    nearbyAmenities: [{
      type: { type: String },
      distance: Number,
      name: String,
    }],
    emergencyContacts: [{
      type: { type: String },
      phone: String,
      distance: Number,
    }]
  },

  trustMetrics: {
    reliabilityScore: { type: Number, default: 0, min: 0, max: 100 },
    accuracyScore: { type: Number, default: 0, min: 0, max: 10 },
    responseRate: { type: Number, default: 0, min: 0, max: 100 },
    avgResponseTime: { type: Number, default: 0 },
    cancellationRate: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },

  instantBooking: {
    enabled: { type: Boolean, default: false },
    requiresApproval: { type: Boolean, default: true },
    maxGuests: { type: Number },
  },

}, { timestamps: true });

listingSchema.post("findOneAndDelete", async function (listing) {
  if (listing?.reviews) await Review.deleteMany({ _id: { $in: listing.reviews } });
});

module.exports = mongoose.model("Listing", listingSchema);
