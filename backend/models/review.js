const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },  // ✅ Ensure this exists
  createdAt: { type: Date, default: Date.now },
  authorName: String // Store the username when review is created

});

module.exports = mongoose.model("Review", reviewSchema);
