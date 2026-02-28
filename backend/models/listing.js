const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");
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

  // ── Approval ──────────────────────────────────────────────────────────────
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  // Reason shown to the user when their listing is rejected
  rejectionReason: {
    type: String,
    default: null,
  },

  // ── Availability ──────────────────────────────────────────────────────────
  // Host sets date ranges when the property is NOT available
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

}, { timestamps: true });

listingSchema.post("findOneAndDelete", async function (listing) {
  if (listing?.reviews) await Review.deleteMany({ _id: { $in: listing.reviews } });
});

listingSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Listing", listingSchema);