const Listing = require("../models/listing");
const mongoose = require("mongoose");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { listingSchema } = require("../schema.js");
const axios = require('axios');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary upload helper with retry logic
const uploadToCloudinary = async (fileBuffer, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "wanderlust_dev",
            resource_type: "auto",
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif' ,'avif'],
            timeout: 30000 // 30 seconds timeout
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
      });
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
};

// Geocoding helper function to convert location string to coordinates
const geocodeLocation = async (location, country) => {
  try {
    const mapboxToken = process.env.MAPBOX_TOKEN || process.env.REACT_APP_MAPBOX_TOKEN;
    if (!mapboxToken) {
      console.warn('MAPBOX_TOKEN not found in environment variables');
      return null;
    }

    const searchQuery = `${location}, ${country}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${mapboxToken}&limit=1`;
    
    const response = await axios.get(url);
    
    if (response.data && response.data.features && response.data.features.length > 0) {
      const [longitude, latitude] = response.data.features[0].center;
      return {
        type: "Point",
        coordinates: [longitude, latitude]
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Enhanced validation with custom error messages
const validateListingData = (data) => {
  const { error } = listingSchema.validate(data, {
    abortEarly: false,
    allowUnknown: false,
    convert: false
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    throw { 
      name: 'ValidationError',
      message: 'Invalid listing data',
      details: errors
    };
  }
};


// Listing CRUD Operations

exports.getAllListings = async (req, res, next) => {
  try {
    console.log('Fetching all listings...');
    const listings = await Listing.find({})
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`Found ${listings.length} listings`);
    
    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    console.error('Error in getAllListings:', error);
    next(error);
  }
};

exports.getListingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First fetch the listing
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
          select: 'username'
        }
      })
      .populate("owner", 'username email');

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found"
      });
    }

    // Handle view counting
    if (!req.user || req.user._id.toString() !== listing.owner._id.toString()) {
      const clientIP = req.ip || req.connection.remoteAddress;
      
      // Only count unique views
      if (!listing.uniqueViews.includes(clientIP)) {
        // Update views directly using findByIdAndUpdate to avoid race conditions
        await Listing.findByIdAndUpdate(id, {
          $inc: { views: 1 },
          $push: { uniqueViews: clientIP }
        });
        
        // Update the local listing object to reflect the new view count
        listing.views = (listing.views || 0) + 1;
        listing.uniqueViews = [...(listing.uniqueViews || []), clientIP];
      }
    }

    // Format the listing data
    const formattedListing = {
      ...listing.toObject(),
      image: {
        url: listing.image.url,
        filename: listing.image.filename
      }
    };

    res.status(200).json({ success: true, data: formattedListing });
  } catch (error) {
    console.error("Error in getListingById:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching listing",
      error: error.message
    });
  }
};

exports.createListing = async (req, res, next) => {
  try {
    // Extract text fields from form-data
    const { title, description, price, country, location, category } = req.body;

    // Validate required fields
    if (!title || !description || !price || !country || !location || !category) {
      return res.status(400).json({
        success: false,
        error: "All fields are required"
      });
    }

    // Validate image
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Listing image is required"
      });
    }

    // Use the file that multer has already processed and stored
    // The CloudinaryStorage in multer-storage-cloudinary already uploaded the file
    // So we can access the result directly from req.file
    const imageUrl = req.file.path;
    const filename = req.file.filename;

    // Geocode the location to get coordinates
    const geometry = await geocodeLocation(location, country);

    // Create new listing
    const newListing = new Listing({
      title,
      description,
      price: Number(price),
      country,
      location,
      category,
      image: {
        url: imageUrl,
        filename: filename
      },
      owner: req.user._id,
      geometry: geometry // Add the geometry field with coordinates
    });

    await newListing.save();

    res.status(201).json({
      success: true,
      listing: newListing,
      message: "Listing created successfully"
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    next(error);
  }
};


exports.getListingForEdit = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid ID format"
      });
    }
    
    const listing = await Listing.findById(id).lean();
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: "Listing not found"
      });
    }

    res.status(200).json({
      success: true,
      data: listing
    });
  } catch (error) {
    next(error);
  }
};

exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid ID format"
      });
    }
    
    // Check if listing exists
    const existingListing = await Listing.findById(id);
    if (!existingListing) {
      return res.status(404).json({
        success: false,
        error: "Listing not found"
      });
    }
    
    const oldImageId = existingListing.image?.filename;
    let updatedData = { ...req.body };

    // Handle image update if new file provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      updatedData.image = {
        url: result.secure_url,
        filename: result.public_id,
        width: result.width,
        height: result.height
      };
      
      // Delete old image from Cloudinary if exists
      if (oldImageId) {
        try {
          await cloudinary.uploader.destroy(oldImageId);
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
    }

    // Validate updated data
    validateListingData(updatedData);

    // Update listing
    const updatedListing = await Listing.findByIdAndUpdate(
      id, 
      updatedData, 
      { 
        new: true, 
        runValidators: true,
        lean: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: updatedListing,
      message: "Listing updated successfully"
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message,
        details: error.details
      });
    }
    next(error);
  }
};

exports.deleteListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid ID format"
      });
    }

    // Find listing first to get image reference
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: "Listing not found"
      });
    }
    
    // Delete image from Cloudinary if exists
    if (listing.image?.filename) {
      try {
        await cloudinary.uploader.destroy(listing.image.filename);
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }

    // Delete listing from database
    await Listing.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: "Listing deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

// Search listings based on criteria
exports.searchListings = async (req, res, next) => {
  try {
    console.log('Search criteria received:', req.query);
    
    const { destination, checkIn, checkOut, guests } = req.query;
    
    // Build the search query
    const searchQuery = {};
    
    // Search by location or country (case-insensitive)
    if (destination) {
      searchQuery.$or = [
        { location: { $regex: destination, $options: 'i' } },
        { country: { $regex: destination, $options: 'i' } }
      ];
    }
    
    // Additional filters can be added here for dates and guests
    // For example, you might have availability dates in your listing model
    // or a maxGuests field that you can query against
    
    console.log('Executing search with query:', JSON.stringify(searchQuery));
    
    const listings = await Listing.find(searchQuery)
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`Found ${listings.length} listings matching the search criteria`);
    
    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    console.error('Error in searchListings:', error);
    next(error);
  }
};

// Get user's listings
exports.getUserListings = async (req, res) => {
  try {
    const userId = req.user._id;
    const listings = await Listing.find({ owner: userId })
      .select('title status views image')
      .sort({ createdAt: -1 });

    const formattedListings = listings.map(listing => ({
      id: listing._id,
      title: listing.title,
      status: listing.status || 'Active',
      views: listing.views || 0,
      image: listing.image
    }));

    res.status(200).json({
      success: true,
      data: formattedListings
    });
  } catch (error) {
    console.error('Error in getUserListings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user listings',
      error: error.message
    });
  }
};

// Helper method to get all listings (if not already in separate controller)


// Helper method to get single listing
// (if not already in separate controller)