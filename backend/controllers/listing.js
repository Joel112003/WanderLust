const Listing = require("../models/listing");
const Review = require("../models/review");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const { listingSchema } = require("../schema.js");
const axios = require("axios");
const emailService = require("../services/emailService");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const geocodeLocation = async (location, country) => {
  try {
    const mapboxToken = process.env.MAPBOX_TOKEN;
    if (!mapboxToken) return null;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(`${location}, ${country}`)}.json?access_token=${mapboxToken}&limit=1`;
    const response = await axios.get(url);
    if (response.data?.features?.length > 0) {
      const [longitude, latitude] = response.data.features[0].center;
      return { type: "Point", coordinates: [longitude, latitude] };
    }
    return null;
  } catch (error) {
    return null;
  }
};

// ─── PUBLIC: only approved ────────────────────────────────────────────────────
exports.getAllListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .lean();
    res
      .status(200)
      .json({ success: true, count: listings.length, data: listings });
  } catch (error) {
    next(error);
  }
};

exports.getListingById = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: { path: "author", select: "username phoneNumber email" },
      })
      .populate("owner", "username email phoneNumber");

    if (!listing)
      return res
        .status(404)
        .json({ success: false, message: "Listing not found" });

    if (listing.status !== "approved") {
      const isOwner =
        req.user && req.user._id.toString() === listing.owner._id.toString();
      const isAdmin = req.user && req.user.isAdmin;
      if (!isOwner && !isAdmin)
        return res
          .status(404)
          .json({ success: false, message: "Listing not found" });
    }

    if (!req.user || req.user._id.toString() !== listing.owner._id.toString()) {
      const clientIP = req.ip || req.connection.remoteAddress;
      if (!listing.uniqueViews.includes(clientIP)) {
        await Listing.findByIdAndUpdate(id, {
          $inc: { views: 1 },
          $push: { uniqueViews: clientIP },
        });
        listing.views = (listing.views || 0) + 1;
      }
    }
    res.status(200).json({ success: true, data: { ...listing.toObject() } });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching listing",
        error: error.message,
      });
  }
};

// ─── CREATE: pending + email admin ───────────────────────────────────────────
exports.createListing = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      country,
      location,
      category,
      guests,
      bedrooms,
      beds,
      baths,
    } = req.body;

    if (
      !title ||
      !description ||
      !price ||
      !country ||
      !location ||
      !category ||
      !guests ||
      !bedrooms ||
      !beds ||
      !baths
    )
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, error: "Listing image is required" });

    let geometry = null;
    if (req.body.longitude && req.body.latitude) {
      geometry = {
        type: "Point",
        coordinates: [
          parseFloat(req.body.longitude),
          parseFloat(req.body.latitude),
        ],
      };
    } else {
      geometry = await geocodeLocation(location, country);
      if (!geometry)
        return res
          .status(400)
          .json({
            success: false,
            error: "Could not determine location coordinates",
          });
    }

    const newListing = new Listing({
      title,
      description,
      price: Number(price),
      country,
      location,
      category,
      guests: Number(guests),
      bedrooms: Number(bedrooms),
      beds: Number(beds),
      baths: Number(baths),

      unavailableDates: JSON.parse(req.body.unavailableDates || "[]"),

      image: { url: req.file.path, filename: req.file.filename },
      owner: req.user._id,
      geometry,
      status: "pending",
    });
    await newListing.save();

    // Notify admin
    await emailService.sendNewListingAlert({
      listingTitle: title,
      ownerName: req.user.username || req.user.email,
      ownerEmail: req.user.email,
      listingId: newListing._id,
    });

    res.status(201).json({
      success: true,
      listing: newListing,
      message: "Listing submitted for review.",
    });
  } catch (error) {
    console.error("Error creating listing:", error);
    next(error);
  }
};

exports.getListingForEdit = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ success: false, error: "Invalid ID format" });
    const listing = await Listing.findById(id).lean();
    if (!listing)
      return res
        .status(404)
        .json({ success: false, error: "Listing not found" });
    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    next(error);
  }
};

exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ success: false, error: "Invalid ID format" });
    const { error } = listingSchema.validate(req.listingData, {
      abortEarly: false,
    });
    if (error) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Validation failed",
          details: error.details.map((d) => ({
            field: d.path.join("."),
            message: d.message.replace(/"/g, ""),
          })),
        });
    }
    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      req.listingData.listing,
      { new: true, runValidators: true },
    );
    if (!updatedListing)
      return res
        .status(404)
        .json({ success: false, error: "Listing not found" });
    res.status(200).json({ success: true, data: updatedListing });
  } catch (error) {
    next(error);
  }
};

exports.deleteListing = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, error: "Invalid ID format" });
    }
    const listing = await Listing.findById(id)
      .populate("owner")
      .session(session);
    if (!listing) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, error: "Listing not found" });
    }
    if (
      listing.owner._id.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }
    if (listing.image?.filename) {
      try {
        await cloudinary.uploader.destroy(listing.image.filename, {
          resource_type: "image",
          invalidate: true,
        });
      } catch (err) {
        console.error("Cloudinary error:", err);
      }
    }
    if (listing.reviews?.length > 0)
      await Review.deleteMany({ _id: { $in: listing.reviews } }).session(
        session,
      );
    await Listing.findByIdAndDelete(id).session(session);
    await session.commitTransaction();
    session.endSession();
    return res
      .status(200)
      .json({ success: true, message: "Listing deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

exports.searchListings = async (req, res, next) => {
  try {
    const { destination } = req.query;
    const searchQuery = { status: "approved" };
    if (destination) {
      searchQuery.$or = [
        { location: { $regex: destination, $options: "i" } },
        { country: { $regex: destination, $options: "i" } },
      ];
    }
    const listings = await Listing.find(searchQuery)
      .sort({ createdAt: -1 })
      .lean();
    res
      .status(200)
      .json({ success: true, count: listings.length, data: listings });
  } catch (error) {
    next(error);
  }
};

exports.getUserListings = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id })
      .select("title status views image rejectionReason price unavailableDates")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: listings.map((l) => ({
        _id: l._id,
        id: l._id,
        title: l.title,
        status: l.status ?? "pending",
        views: l.views || 0,
        image: l.image,
        rejectionReason: l.rejectionReason || null,
        price: l.price || 0,
        unavailableDates: l.unavailableDates || [],
      })),
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching user listings",
        error: error.message,
      });
  }
};
