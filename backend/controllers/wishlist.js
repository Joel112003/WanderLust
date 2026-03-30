const Wishlist = require('../models/Wishlist');
const Listing = require('../models/listing');

exports.addToWishlist = async (req, res) => {
  try {
    const { listingId } = req.body;
    const userId = req.user._id;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    const existingWishlist = await Wishlist.findOne({
      user: userId,
      listing: listingId
    });

    if (existingWishlist) {
      return res.status(400).json({
        success: false,
        message: 'Listing already in wishlist'
      });
    }

    const wishlistItem = new Wishlist({
      user: userId,
      listing: listingId
    });

    await wishlistItem.save();

    res.status(201).json({
      success: true,
      message: 'Added to wishlist',
      data: wishlistItem
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to wishlist',
      error: error.message
    });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user._id;

    const wishlistItem = await Wishlist.findOneAndDelete({
      user: userId,
      listing: listingId
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found in wishlist'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Removed from wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist',
      error: error.message
    });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlist = await Wishlist.find({ user: userId })
      .populate({
        path: 'listing',
        populate: {
          path: 'owner',
          select: 'username email'
        }
      })
      .sort({ createdAt: -1 });

    const validWishlist = wishlist.filter(item => item.listing !== null);

    res.status(200).json({
      success: true,
      count: validWishlist.length,
      data: validWishlist.map(item => item.listing)
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: error.message
    });
  }
};

exports.checkWishlist = async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user._id;

    const wishlistItem = await Wishlist.findOne({
      user: userId,
      listing: listingId
    });

    res.status(200).json({
      success: true,
      isWishlisted: !!wishlistItem
    });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist',
      error: error.message
    });
  }
};
