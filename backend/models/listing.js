const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const Review = require("./review.js");

const validCategories = [
  "Mansion",
  "Farm",
  "Lake",
  "Beach",
  "Apartment",
  "Ski Resort",
  "Camping",
  "Cottage",
  "Luxury",
];

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  image: {
    url: { type: String, required: true },
    filename: { type: String, required: true }
  },
  price: { type: Number, required: true, min: 0 },
  location: { type: String, required: true },
  country: { type: String, required: true },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  views: { type: Number, default: 0 },
  
  uniqueViews: [{ type: String }], // Store unique viewer IPs
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],
      validate: {
        validator: function (value) {
          return !value || value.length === 0 || value.length === 2;
        },
        message: "Coordinates must have exactly 2 values (longitude, latitude)"
      }
      
    }
  },
  category: {
    type: String,
    enum: validCategories,
    required: true,
  },
  guests: { type: Number, required: true, min: 1 },
  bedrooms: { type: Number, required: true, min: 1 },
  beds: { type: Number, required: true, min: 1 },
  baths: { type: Number, required: true, min: 1 },
  
}, { timestamps: true });

// Middleware to delete reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async function (listing) {
  if (listing && listing.reviews) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

listingSchema.plugin(mongoosePaginate);

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;