const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hostReliabilitySchema = new Schema({
  host: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  overallScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },

  tier: {
    type: String,
    enum: ["new", "average", "good", "trusted", "superhero"],
    default: "new",
  },

  responseMetrics: {
    avgResponseTime: { type: Number, default: 0 },
    responseRate: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
    respondedMessages: { type: Number, default: 0 },
    score: { type: Number, default: 0, min: 0, max: 15 },
  },

  cancellationMetrics: {
    hostCancellations: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    cancellationRate: { type: Number, default: 0 },
    lastCancellation: { type: Date },
    score: { type: Number, default: 0, min: 0, max: 25 },
  },

  accuracyMetrics: {
    photoAccuracy: { type: Number, default: 0 },
    amenityAccuracy: { type: Number, default: 0 },
    descriptionAccuracy: { type: Number, default: 0 },
    avgAccuracy: { type: Number, default: 0 },
    score: { type: Number, default: 0, min: 0, max: 20 },
  },

  reviewMetrics: {
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    recentReviews: { type: Number, default: 0 },
    verifiedReviews: { type: Number, default: 0 },
    reviewFreshness: { type: String, enum: ["low", "medium", "high"], default: "low" },
    score: { type: Number, default: 0, min: 0, max: 20 },
  },

  resolutionMetrics: {
    complaintsReceived: { type: Number, default: 0 },
    complaintsResolved: { type: Number, default: 0 },
    avgResolutionTime: { type: Number, default: 0 },
    resolutionRate: { type: Number, default: 0 },
    score: { type: Number, default: 0, min: 0, max: 10 },
  },

  maintenanceMetrics: {
    lastInspection: { type: Date },
    inspectionScore: { type: Number, default: 0, min: 0, max: 10 },
    cleanlinessRating: { type: Number, default: 0 },
    maintenanceIssues: { type: Number, default: 0 },
    score: { type: Number, default: 0, min: 0, max: 10 },
  },

  hostingMetrics: {
    hostingSince: { type: Date },
    totalListings: { type: Number, default: 0 },
    activeListings: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    completedStays: { type: Number, default: 0 },
  },

  badges: [{
    name: { type: String },
    earnedAt: { type: Date },
    icon: { type: String },
  }],

  penaltyPoints: { type: Number, default: 0 },

  lastCalculated: { type: Date, default: Date.now },
  calculationHistory: [{
    date: { type: Date },
    score: { type: Number },
    tier: { type: String },
  }],

}, { timestamps: true });

hostReliabilitySchema.index({ host: 1 });
hostReliabilitySchema.index({ overallScore: -1 });
hostReliabilitySchema.index({ tier: 1 });

hostReliabilitySchema.pre('save', function(next) {
  this.overallScore =
    this.responseMetrics.score +
    this.cancellationMetrics.score +
    this.accuracyMetrics.score +
    this.reviewMetrics.score +
    this.resolutionMetrics.score +
    this.maintenanceMetrics.score -
    this.penaltyPoints;

  this.overallScore = Math.max(0, Math.min(100, this.overallScore));

  if (this.overallScore >= 90) this.tier = "superhero";
  else if (this.overallScore >= 75) this.tier = "trusted";
  else if (this.overallScore >= 60) this.tier = "good";
  else if (this.overallScore >= 40) this.tier = "average";
  else this.tier = "new";

  next();
});

module.exports = mongoose.model("HostReliability", hostReliabilitySchema);
