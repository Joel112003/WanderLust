const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "not_exist",
        "not_match",
        "unsafe",
        "unclean",
        "no_amenities",
        "wrong_location",
        "other",
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ["critical", "high", "medium"],
      required: true,
    },
    photos: [
      {
        type: String,
      },
    ],
    ticketNumber: {
      type: String,
      unique: true,
      required: true,
    },
    status: {
      type: String,
      enum: ["under_investigation", "resolved", "dismissed", "action_taken"],
      default: "under_investigation",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolution: {
      type: String,
    },
    requestAutoRebook: {
      type: Boolean,
      default: false,
    },
    autoRebookProcessed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

reportSchema.pre("save", async function (next) {
  if (!this.ticketNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model("Report").countDocuments();
    this.ticketNumber = `WDL-${year}-${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

reportSchema.index({ ticketNumber: 1 });
reportSchema.index({ reporter: 1, createdAt: -1 });
reportSchema.index({ booking: 1 });
reportSchema.index({ listing: 1 });
reportSchema.index({ status: 1, severity: -1 });

module.exports = mongoose.model("Report", reportSchema);
