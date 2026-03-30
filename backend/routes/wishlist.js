const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist');
const { isAuthenticated } = require('../middleware');

router.use(isAuthenticated);

router.post('/', wishlistController.addToWishlist);

router.get('/', wishlistController.getWishlist);

router.get('/check/:listingId', wishlistController.checkWishlist);

router.delete('/:listingId', wishlistController.removeFromWishlist);

module.exports = router;
