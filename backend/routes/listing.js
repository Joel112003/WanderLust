const express = require("express");
const router = express.Router();
const listingController = require("../controllers/listing");
const multer = require("multer");
const { storage } = require("../cloudConfig");
const { isLoggedIn, isAdmin } = require("../middleware");
const upload = multer({ storage });
const Listing = require("../models/listing");

router.get("/",        listingController.getAllListings);
router.get("/search",  listingController.searchListings);
router.get("/user",    isLoggedIn, listingController.getUserListings);
router.get("/:id",     listingController.getListingById);
router.get("/:id/edit", listingController.getListingForEdit);

router.post("/", isLoggedIn, upload.single("image"), listingController.createListing);

router.put("/:id", isLoggedIn, upload.single("image"), async (req, res, next) => {
  try {
    let listingData = {};
    if (req.body.listing && typeof req.body.listing === 'string') {
      listingData = JSON.parse(req.body.listing);
    } else {
      listingData = { title: req.body.title, description: req.body.description, price: req.body.price, location: req.body.location, country: req.body.country, category: req.body.category };
    }
    if (req.file) listingData.image = { url: req.file.path, filename: req.file.filename };
    req.listingData = { listing: listingData };
    next();
  } catch (error) {
    return res.status(400).json({ success: false, error: "Invalid data format" });
  }
}, listingController.updateListing);

router.delete("/:id", isLoggedIn, listingController.deleteListing);

router.patch("/:id/unavailable-dates", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const { unavailableDates } = req.body;

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ success: false, error: "Listing not found" });
    }

    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: "You are not authorized to modify this listing" });
    }

    if (!Array.isArray(unavailableDates)) {
      return res.status(400).json({ success: false, error: "unavailableDates must be an array" });
    }

    listing.unavailableDates = unavailableDates;
    await listing.save();

    res.status(200).json({ success: true, message: "Unavailable dates updated", data: listing });
  } catch (error) {
    console.error("Unavailable dates update error:", error);
    res.status(500).json({ success: false, error: "Failed to update unavailable dates" });
  }
});

router.patch("/:id/status", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status value" });
    }

    const listing = await Listing.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!listing) return res.status(404).json({ success: false, error: "Listing not found" });

    res.status(200).json({ success: true, message: `Listing ${status}`, data: listing });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({ success: false, error: "Failed to update listing status" });
  }
});

router.use((err, req, res, next) => {
  console.error("Router error:", err);
  const statusCode = err instanceof multer.MulterError ? 400 : 500;
  res.status(statusCode).json({ success: false, error: err.message || "Internal server error" });
});

module.exports = router;
