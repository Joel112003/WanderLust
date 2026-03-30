const Booking = require("../models/Booking");
const Listing = require("../models/listing");

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateSimilarityScore(original, alternative) {
  let score = 0;

  const originalPrice = original.price || original.pricing?.finalPrice || 0;
  const alternativePrice =
    alternative.price || alternative.pricing?.finalPrice || 0;

  if (originalPrice > 0) {
    const priceDiff = Math.abs(alternativePrice - originalPrice) / originalPrice;
    score += Math.max(0, 30 * (1 - priceDiff));
  } else {
    score += 15;
  }

  if (
    original.geometry?.coordinates?.length === 2 &&
    alternative.geometry?.coordinates?.length === 2
  ) {
    const [origLon, origLat] = original.geometry.coordinates;
    const [altLon, altLat] = alternative.geometry.coordinates;
    const distance = calculateDistance(origLat, origLon, altLat, altLon);
    score += Math.max(0, 25 * (1 - distance / 10));
  } else {
    score += 12.5;
  }

  if (alternative.guests >= original.guests) {
    const diff = Math.abs(alternative.guests - original.guests);
    score += Math.max(0, 15 * (1 - diff / 10));
  }

  const bedroomMatch =
    original.bedrooms && alternative.bedrooms
      ? 1 - Math.abs(alternative.bedrooms - original.bedrooms) / 5
      : 0.5;
  const bedMatch =
    original.beds && alternative.beds
      ? 1 - Math.abs(alternative.beds - original.beds) / 5
      : 0.5;
  const bathMatch =
    original.baths && alternative.baths
      ? 1 - Math.abs(alternative.baths - original.baths) / 3
      : 0.5;
  score += 10 * ((bedroomMatch + bedMatch + bathMatch) / 3);

  if (alternative.reviews?.length > 0 && original.reviews?.length > 0) {

    score += 10;
  } else if (alternative.reviews?.length > 0 || original.reviews?.length > 0) {
    score += 5;
  }

  if (alternative.category === original.category) {
    score += 10;
  }

  return Math.round(score);
}

async function findAlternativeListings(bookingId) {
  try {
    const booking = await Booking.findById(bookingId).populate("listing");

    if (!booking || !booking.listing) {
      throw new Error("Booking or listing not found");
    }

    const { listing, checkIn, checkOut, guests } = booking;

    const basePrice = listing.price || listing.pricing?.finalPrice || 0;
    const priceMin = basePrice * 0.7;
    const priceMax = basePrice * 1.3;

    const query = {
      _id: { $ne: listing._id },
      status: "approved",
      guests: { $gte: guests || 1 },
    };

    if (basePrice > 0) {
      query.$or = [
        { price: { $gte: priceMin, $lte: priceMax } },
        {
          "pricing.finalPrice": { $gte: priceMin, $lte: priceMax },
        },
      ];
    }

    let alternatives = await Listing.find(query).limit(50);

    if (listing.geometry?.coordinates?.length === 2) {
      const [origLon, origLat] = listing.geometry.coordinates;
      alternatives = alternatives.filter((alt) => {
        if (alt.geometry?.coordinates?.length === 2) {
          const [altLon, altLat] = alt.geometry.coordinates;
          const distance = calculateDistance(origLat, origLon, altLat, altLon);
          return distance <= 15;
        }
        return true;
      });
    }

    const available = [];
    for (const alt of alternatives) {
      const conflictingBookings = await Booking.countDocuments({
        listing: alt._id,
        status: { $in: ["confirmed", "paid"] },
        $or: [
          { checkIn: { $lte: checkIn }, checkOut: { $gt: checkIn } },
          { checkIn: { $lt: checkOut }, checkOut: { $gte: checkOut } },
          { checkIn: { $gte: checkIn }, checkOut: { $lte: checkOut } },
        ],
      });

      if (conflictingBookings === 0) {
        available.push(alt);
      }
    }

    const scored = available.map((alt) => {
      const altObj = alt.toObject ? alt.toObject() : alt;
      return {
        ...altObj,
        similarityScore: calculateSimilarityScore(listing, alt),
      };
    });

    scored.sort((a, b) => b.similarityScore - a.similarityScore);

    return scored.slice(0, 5);
  } catch (error) {
    console.error("Error finding alternative listings:", error);
    throw error;
  }
}

async function createAlternativeBooking(originalBooking, alternativeListing) {
  try {
    const nights =
      Math.ceil(
        (new Date(originalBooking.checkOut) - new Date(originalBooking.checkIn)) /
          (1000 * 60 * 60 * 24)
      ) || 1;

    const newPrice =
      alternativeListing.price || alternativeListing.pricing?.finalPrice || 0;
    const originalPrice = originalBooking.totalAmount || 0;
    const priceDifference = Math.max(0, newPrice * nights - originalPrice);

    const confirmationNumber = `WDL-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`;

    const newBooking = new Booking({
      listing: alternativeListing._id,
      user: originalBooking.user,
      checkIn: originalBooking.checkIn,
      checkOut: originalBooking.checkOut,
      guests: originalBooking.guests,
      nights,
      pricePerNight: newPrice,
      totalAmount: newPrice * nights,
      status: "confirmed",
      confirmationNumber,
      isAlternativeBooking: true,
      originalBooking: originalBooking._id,
      priceDifferenceCovered: priceDifference,

      razorpay_order_id: `ALT-${Date.now()}`,
    });

    await newBooking.save();
    return newBooking;
  } catch (error) {
    console.error("Error creating alternative booking:", error);
    throw error;
  }
}

function daysUntilCheckIn(checkInDate) {
  const now = new Date();
  const checkIn = new Date(checkInDate);
  const diffTime = checkIn - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

module.exports = {
  calculateDistance,
  calculateSimilarityScore,
  findAlternativeListings,
  createAlternativeBooking,
  daysUntilCheckIn,
};
