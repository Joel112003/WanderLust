import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowBackIos,
  ArrowForwardIos,
  Favorite,
  FavoriteBorder,
  Share,
  Work,
  CalendarToday,
  Cancel,
  LocalOffer,
  Security,
  Wifi,
  AcUnit,
  Pool,
  Kitchen,
  Tv,
  LocalParking,
  Pets,
  Visibility,
} from "@mui/icons-material";
import { Image as ImageIcon } from "@mui/icons-material";
import { Star } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { TextField, Box } from "@mui/material";
import Review from "./Review";
import { locationCoordinates, getCoordinates } from './locations';
import Map from "./Map";
import HostSection from "./HostSection";
import "../../utilis/css/ListingDetail.css";

const highlightItems = [
  {
    icon: <Work fontSize="medium" />,
    title: "Dedicated workspace",
    description: "Private room with fast wifi for focused work",
    animation: { scale: [1, 1.05, 1], transition: { duration: 0.5 } },
  },
  {
    icon: <CalendarToday fontSize="medium" />,
    title: "Self check-in",
    description: "Easy access with smart lock entry",
    animation: { y: [0, -5, 0], transition: { duration: 0.5 } },
  },
  {
    icon: <Cancel fontSize="medium" />,
    title: "Free cancellation",
    description: "Full refund if canceled at least 5 days before check-in",
    animation: { rotate: [0, 5, -5, 0], transition: { duration: 0.7 } },
  },
  {
    icon: <LocalOffer fontSize="medium" />,
    title: "Special offers",
    description: "10% discount for weekly stays",
    animation: { x: [0, 5, -5, 0], transition: { duration: 0.6 } },
  },
  {
    icon: <Security fontSize="medium" />,
    title: "Enhanced cleaning",
    description: "Professional cleaning between each stay",
    animation: { scale: [1, 1.1, 1], transition: { duration: 0.4 } },
  },
  {
    icon: <Wifi fontSize="medium" />,
    title: "High-speed WiFi",
    description: "100+ Mbps for streaming and video calls",
    animation: { opacity: [1, 0.8, 1], transition: { duration: 0.5 } },
  },
];

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishListed, setIsWishListed] = useState(false);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [guestCount, setGuestCount] = useState(1);
  const [showAllHighlights, setShowAllHighlights] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [existingBookings, setExistingBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const mainContentRef = useRef(null);
  const bookingCardRef = useRef(null);

  const formatPrice = (price) => {
    return (
      price?.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) || "0.00"
    );
  };

  const { scrollY } = useScroll();
  const bookingOpacity = useTransform(
    scrollY,
    [0, 800, 1200, 1600],
    [1, 1, 1, 0]
  );

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
          throw new Error("Invalid listing ID format");
        }

        const response = await fetch(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8000"
          }/listings/${id}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success || !result.data) {
          throw new Error("Failed to fetch listing data");
        }

        const processedListing = processListingForMaps(result.data);
        setListing(processedListing);
        
        fetchExistingBookings(processedListing._id);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching listing:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  

  const processListingForMap = (listing) => {
    if (
      (listing.latitude &&
        listing.longitude &&
        !isNaN(listing.latitude) &&
        !isNaN(listing.longitude)) ||
      (listing.geometry?.coordinates?.length === 2 &&
        !isNaN(listing.geometry.coordinates[0]) &&
        !isNaN(listing.geometry.coordinates[1]))
    ) {
      return listing;
    }

    if (listing.location && !listing.latitude && !listing.longitude) {
      try {
        const locationCoordinates = getDefaultCoordinates(
          listing.location,
          listing.country
        );
        return {
          ...listing,
          latitude: locationCoordinates[1],
          longitude: locationCoordinates[0],
          geometry: {
            type: "Point",
            coordinates: locationCoordinates,
          },
        };
      } catch (error) {
        console.error("Error geocoding location:", error);
        return listing;
      }
    }

    return listing;
  };

// Then replace your existing getDefaultCoordinates function with:
const getDefaultCoordinates = (location, country) => {
  // Try to get by location name first
  const locationCoords = getCoordinates(location);
  if (locationCoords !== locationCoordinates.default) {
    return locationCoords;
  }
  
  // Fall back to country if location not found
  return getCoordinates(country);
};

const processListingForMaps = (listing) => {
  // If listing already has valid coordinates, return as-is
  if (listing.geometry?.coordinates?.length === 2) {
    return listing;
  }

  // Get coordinates based on location and country
  const coordinates = getDefaultCoordinates(listing.location, listing.country);
  
  return {
    ...listing,
    geometry: {
      type: "Point",
      coordinates: coordinates
    }
  };
};

  const fetchExistingBookings = async (listingId) => {
    setLoadingBookings(true);
    try {
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:8000"
        }/bookings/listing/${listingId}`
      );

      if (!response.ok) {
        console.error("Failed to fetch bookings");
        setLoadingBookings(false);
        return;
      }

      const bookingsData = await response.json();
      console.log("Raw booking data:", bookingsData);

      let activeBookings = [];

      if (Array.isArray(bookingsData)) {
        activeBookings = bookingsData.filter(
          (booking) =>
            booking &&
            booking.status !== "cancelled" &&
            booking.checkIn &&
            booking.checkOut
        );
      }

      console.log("Processed bookings:", activeBookings);
      setExistingBookings(activeBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setExistingBookings([]); // Set to empty array on error
    } finally {
      setLoadingBookings(false);
    }
  };

  const isDateBooked = (date) => {
    if (!date || !existingBookings || existingBookings.length === 0)
      return false;

    const checkDate = new Date(date);
    checkDate.setHours(12, 0, 0, 0);

    const formattedCheckDate = checkDate.toISOString().split("T")[0];

    for (const booking of existingBookings) {
      if (!booking.checkIn || !booking.checkOut) continue;

      const bookingStart = new Date(booking.checkIn);
      const bookingEnd = new Date(booking.checkOut);

      bookingStart.setHours(12, 0, 0, 0);
      bookingEnd.setHours(12, 0, 0, 0);

      const formattedStart = bookingStart.toISOString().split("T")[0];
      const formattedEnd = bookingEnd.toISOString().split("T")[0];

      if (
        (formattedCheckDate >= formattedStart &&
          formattedCheckDate < formattedEnd) ||
        formattedCheckDate === formattedStart ||
        formattedCheckDate === formattedEnd
      ) {
        return true;
      }
    }

    return false;
  };

  const getBookedDateRanges = () => {
    if (!existingBookings || existingBookings.length === 0) return [];

    return existingBookings
      .filter((booking) => booking.checkIn && booking.checkOut)
      .map((booking) => {
        const start = new Date(booking.checkIn);
        const end = new Date(booking.checkOut);
        start.setHours(12, 0, 0, 0);
        end.setHours(12, 0, 0, 0);
        return { start, end };
      });
  };

  const shouldDisableDate = (date) => {
    return isDateBooked(date);
  };

  const renderBookingCalendar = () => {
    const bookedRanges = getBookedDateRanges();
    console.log("Booked ranges for display:", bookedRanges);

    return (
      <div className="mb-4">
        <div className="flex flex-col space-y-2">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Check-in"
              value={checkInDate}
              onChange={(newValue) => setCheckInDate(newValue)}
              shouldDisableDate={shouldDisableDate}
              renderInput={(params) => (
                <TextField {...params} fullWidth size="small" />
              )}
              minDate={new Date()}
            />
          </LocalizationProvider>
        </div>
        <div className="flex flex-col space-y-2 mt-4">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Check-out"
              value={checkOutDate}
              onChange={(newValue) => setCheckOutDate(newValue)}
              shouldDisableDate={shouldDisableDate}
              renderInput={(params) => (
                <TextField {...params} fullWidth size="small" />
              )}
              minDate={
                checkInDate
                  ? new Date(checkInDate.getTime() + 86400000)
                  : new Date()
              } // Add 1 day to check-in date
            />
          </LocalizationProvider>
        </div>

        {bookedRanges.length > 0 ? (
          <div className="mt-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-xs font-semibold text-gray-700 mb-1">
              Unavailable Dates:
            </h4>
            <div className="max-h-28 overflow-y-auto text-xs">
              {bookedRanges.map((range, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-600 mb-1 flex items-center"
                >
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                  {range.start.toLocaleDateString()} to{" "}
                  {range.end.toLocaleDateString()}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">
              All dates are currently available
            </p>
          </div>
        )}
      </div>
    );
  };

  const hasDateRangeConflict = (startDate, endDate) => {
    if (!startDate || !endDate || existingBookings.length === 0) return false;

    const formattedStartDate = startDate.toISOString().split("T")[0];
    const formattedEndDate = endDate.toISOString().split("T")[0];

    for (const booking of existingBookings) {
      if (!booking.checkIn || !booking.checkOut) continue;

      const bookingStartDate = new Date(booking.checkIn)
        .toISOString()
        .split("T")[0];
      const bookingEndDate = new Date(booking.checkOut)
        .toISOString()
        .split("T")[0];

      if (
        formattedStartDate === bookingStartDate &&
        formattedEndDate === bookingEndDate
      ) {
        return true;
      }
    }

    let currentDate = new Date(startDate);
    while (currentDate < endDate) {
      if (isDateBooked(currentDate)) {
        return true;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (isDateBooked(endDate)) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    const checkOwner = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsOwner(false);
          return;
        }

        const response = await fetch(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8000"
          }/users/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          setIsOwner(false);
          return;
        }

        const result = await response.json();
        if (result.success && result.data && listing?.owner) {
          setIsOwner(result.data._id === listing.owner._id);
        }
      } catch (error) {
        console.error("Error checking owner:", error);
        setIsOwner(false);
      }
    };

    if (listing) {
      checkOwner();
    }
  }, [listing]);

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const diffTime = Math.abs(checkOutDate - checkInDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateFees = () => {
    const basePrice = listing?.price || 0;
    const nights = calculateNights();
    const subtotal = basePrice * nights;
    const serviceCharge = Math.round(subtotal * 0.15);
    const cleaningFee = Math.round(basePrice * 0.1);
    const tax = Math.round(subtotal * 0.12);
    const totalPrice = subtotal + serviceCharge + cleaningFee + tax;

    return {
      subtotal,
      serviceCharge,
      cleaningFee,
      tax,
      totalPrice,
      nights,
    };
  };

  const { subtotal, serviceCharge, cleaningFee, tax, totalPrice, nights } =
    calculateFees();

  const handleReserve = async () => {
    if (!checkInDate || !checkOutDate) {
      toast.error("Please select both check-in and check-out dates", {
        autoClose: 1500,
      });
      return;
    }

    if (checkOutDate <= checkInDate) {
      toast.error("Check-out date must be after check-in date", {
        autoClose: 1500,
      });
      return;
    }

    if (hasDateRangeConflict(checkInDate, checkOutDate)) {
      toast.error(
        "This listing is already booked for some of your selected dates. Please choose different dates.",
        {
          autoClose: 2000,
        }
      );
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to book this listing", {
        autoClose: 1500,
      });
      setTimeout(() => navigate("/auth/login"), 1000);
      return;
    }

    try {
      const loadingToastId = toast.loading("Creating your booking...");

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:8000"}/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            listingId: id,
            checkIn: checkInDate.toISOString(),
            checkOut: checkOutDate.toISOString(),
            guests: guestCount,
          }),
        }
      );

      const data = await response.json();

      toast.dismiss(loadingToastId);

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      toast.success("🎉 Booking confirmed! Redirecting...", {
        autoClose: 1500,
      });

      setTimeout(() => {
        navigate("/booking-confirmation", {
          state: {
            bookingId: data.data._id,
            listing: listing,
            bookingDetails: {
              checkIn: checkInDate.toISOString().split("T")[0],
              checkOut: checkOutDate.toISOString().split("T")[0],
              guests: guestCount,
              nights: nights,
              totalPrice: totalPrice,
            },
          },
        });
      }, 1500);
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(
        error.message || "Failed to create booking. Please try again.",
        {
          autoClose: 2000,
        }
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 m-5"
        role="alert"
      >
        <p className="font-semibold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div
        className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 m-5"
        role="alert"
      >
        <p className="font-semibold">Warning</p>
        <p>Listing not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl mt-30">
      {/* Title Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          {listing.title || "No title available"}
        </h1>
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-rose-500" />
              <span className="ml-1 font-medium">
                {listing.reviews?.length || 0}
              </span>
            </div>
            <span className="text-gray-500">•</span>
            <a
              href="#reviews"
              className="font-medium underline"
              style={{ textDecoration: "none" }}
            >
              {listing.reviews?.length || 0} reviews
            </a>
            <span className="text-gray-500">•</span>
            <span className="font-medium">
              {listing.location}, {listing.country}
            </span>
          </div>
          <div className="flex space-x-3 mt-2 sm:mt-0 gap-4">
            <button className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
              <Share className="h-4 w-4 mr-1" /> Share
            </button>
            <button
              className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
              onClick={() => setIsWishListed(!isWishListed)}
            >
              {isWishListed ? (
                <Favorite className="h-4 w-4 mr-1 text-rose-500" />
              ) : (
                <FavoriteBorder className="h-4 w-4 mr-1" />
              )}
              Save
            </button>
            {isOwner && (
              <div className="view-stats">
                <Visibility sx={{ color: "#666", marginRight: "4px" }} />
                <span>{listing.views || 0} views</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      {/* Photo Gallery */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-8 relative overflow-hidden rounded-xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-72 md:h-96">
          {/* Main image */}
          <motion.div className="col-span-2 row-span-2 relative">
            {listing?.image?.url ? (
              <img
                src={listing.image.url}
                alt={listing.title || "Main listing image"}
                className="h-full w-full object-cover hover:opacity-90 transition-opacity duration-300"
              />
            ) : (
              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                <ImageIcon style={{ fontSize: 48, color: "#9CA3AF" }} />
              </div>
            )}
          </motion.div>

          {/* Additional images grid - showing main image in all positions */}
          <div className="col-span-2 grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, index) => (
              <motion.div key={index} className="relative bg-gray-200 h-full">
                {listing?.image?.url ? (
                  <img
                    src={listing.image.url}
                    alt={`Listing view ${index + 1}`}
                    className="h-full w-full object-cover hover:opacity-90 transition-opacity duration-300"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <ImageIcon style={{ fontSize: 32, color: "#9CA3AF" }} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute bottom-4 right-4 py-2 px-4 bg-white rounded-lg shadow-md text-sm font-medium hover:bg-gray-100 transition-colors duration-200"
          onClick={() => setShowAllPhotos(true)}
        >
          Show all photos
        </motion.button>
      </motion.div>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <div className="lg:w-7/12">
          {/* Host info */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-between items-start pb-6 border-b border-gray-200 mb-6"
          >
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                Entire {listing.category || "home"} in {listing.location},{" "}
                {listing.country}
              </h2>
              <p className="text-gray-600">
                {listing.guests || 1} guests • {listing.bedrooms || 1} bedrooms
                •{listing.beds || 1} beds • {listing.baths || 1} baths
              </p>
            </div>
          </motion.div>

          {/* Highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="pb-6 border-b border-gray-200 mb-6"
          >
            <h3 className="text-xl font-semibold mb-4">
              What this place offers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {highlightItems
                .slice(0, showAllHighlights ? highlightItems.length : 3)
                .map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover="animation"
                    variants={item.animation}
                    className="flex items-start p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="mt-1 mr-4 text-rose-500">{item.icon}</div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
            </div>
            {highlightItems.length > 3 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAllHighlights(!showAllHighlights)}
                className="mt-4 text-rose-500 font-medium flex items-center"
              >
                {showAllHighlights ? "Show less" : "Show all amenities"}
                <motion.span
                  animate={{ rotate: showAllHighlights ? 180 : 0 }}
                  className="ml-1"
                >
                  ↓
                </motion.span>
              </motion.button>
            )}
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pb-6 border-b border-gray-200 mb-6"
          >
            <h3 className="text-xl font-semibold mb-4">About this place</h3>
            <p className="text-gray-700 whitespace-pre-line mb-4">
              {listing.description || "No description available."}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="font-semibold underline text-gray-900 hover:text-gray-700"
            >
              Show more
            </motion.button>
          </motion.div>

          {/* Reviews */}
          <div id="reviews" className="pb-6 border-b border-gray-200 mb-6">
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 relative pb-2 inline-block">
                Reviews
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500 to-orange-500"></span>
              </h2>
            </div>{" "}
            <Review
              listingId={listing._id}
              onReviewSubmit={() =>
                toast.success("✅ Review submitted successfully!")
              }
            />
          </div>
        </div>

        {/* Booking widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="lg:w-4/12 lg:sticky lg:top-24 lg:self-start"
          style={{ opacity: bookingOpacity }}
          ref={bookingCardRef}
        >
          <div className="rounded-xl border border-gray-200 shadow-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                ₹{formatPrice(listing.price)} / night
              </h2>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-rose-500" />
                <span className="ml-1 font-medium">
                  {listing.reviews?.length || 0}&nbsp;Review
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {renderBookingCalendar()}

              <div className="flex items-center border border-gray-300 rounded-lg mb-4">
                <div className="flex-1 p-2 border-r border-gray-300">
                  <label className="block text-xs text-gray-500">Guests</label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value))}
                    className="w-full bg-transparent text-sm font-medium focus:outline-none"
                  >
                    {[...Array(listing?.maxGuests || 10).keys()].map((num) => (
                      <option key={num + 1} value={num + 1}>
                        {num + 1} {num === 0 ? "guest" : "guests"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <AnimatePresence>
                {isProcessing ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <motion.button
                      disabled
                      className="w-full bg-rose-500 text-white py-3 rounded-lg font-medium flex items-center justify-center"
                      style={{ cursor: "not-allowed" }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="h-5 w-5 border-2 border-white rounded-full border-t-transparent mr-2"
                      />
                      Creating your booking...
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="reserve-button"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    type="button"
                    onClick={async () => {
                      setIsProcessing(true);
                      try {
                        // Simulate API call or processing
                        await new Promise((resolve) =>
                          setTimeout(resolve, 1500)
                        );
                        handleReserve();
                      } catch (error) {
                        setIsProcessing(false);
                      }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    Reserve
                  </motion.button>
                )}
              </AnimatePresence>

              <motion.p
                className="text-center text-gray-500 text-sm mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                You won't be charged yet
              </motion.p>
            </div>

            <div className="mt-6 space-y-3">
              {loadingBookings ? (
                <div className="text-center py-2">
                  <div className="animate-spin h-5 w-5 border-2 border-rose-500 rounded-full border-t-transparent mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-1">
                    Checking availability...
                  </p>
                </div>
              ) : existingBookings && existingBookings.length > 0 ? (
                <div className="bg-yellow-50 p-3 rounded-md mb-4">
                  <p className="text-sm text-yellow-800 font-medium flex items-center">
                    <span className="mr-2">⚠️</span> This listing is booked for
                    the following dates:
                  </p>
                  <div className="mt-2 max-h-24 overflow-y-auto text-xs">
                    {existingBookings.map((booking, idx) => (
                      <div
                        key={idx}
                        className="mb-1 pb-1 border-b border-yellow-100 last:border-0"
                      >
                        <span className="font-medium">
                          {new Date(booking.checkIn).toLocaleDateString()} -{" "}
                          {new Date(booking.checkOut).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-green-800 mt-2 font-medium">
                    ✓ You can still book this listing for other dates!
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 p-3 rounded-md mb-4">
                  <p className="text-sm text-green-800 flex items-center">
                    <span className="mr-1">✓</span> No current bookings - All
                    dates available!
                  </p>
                </div>
              )}
              {checkInDate && checkOutDate ? (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <motion.div className="flex justify-between p-2 hover:bg-gray-50 rounded transition-colors">
                      <span className="text-gray-700">
                        ₹{formatPrice(listing.price)} × {nights} nights
                      </span>
                      <span className="text-gray-900 font-medium">
                        ₹{formatPrice(subtotal)}
                      </span>
                    </motion.div>
                    <motion.div className="flex justify-between p-2 hover:bg-gray-50 rounded transition-colors">
                      <span className="text-gray-700">Cleaning fee</span>
                      <span className="text-gray-900 font-medium">
                        ₹{formatPrice(cleaningFee)}
                      </span>
                    </motion.div>
                    <motion.div className="flex justify-between p-2 hover:bg-gray-50 rounded transition-colors">
                      <span className="text-gray-700">Service fee</span>
                      <span className="text-gray-900 font-medium">
                        ₹{formatPrice(serviceCharge)}
                      </span>
                    </motion.div>
                    <motion.div className="flex justify-between p-2 hover:bg-gray-50 rounded transition-colors">
                      <span className="text-gray-700">Tax (12%)</span>
                      <span className="text-gray-900 font-medium">
                        ₹{formatPrice(tax)}
                      </span>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <motion.div className="flex justify-between p-2">
                  <span className="text-gray-700">Starting from</span>
                  <span className="text-gray-900 font-medium">
                    ₹{formatPrice(listing.price)}
                  </span>
                </motion.div>
              )}

              <div className="pt-3 mt-3 border-t border-gray-200">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="flex justify-between font-semibold text-lg p-2 bg-white-50 rounded-lg"
                >
                  <span className="text-gray-900">
                    {checkInDate && checkOutDate ? "Total" : "Starting from"}
                  </span>
                  <span className="text-black-600">
                    ₹
                    {formatPrice(
                      checkInDate && checkOutDate ? totalPrice : listing.price
                    )}
                  </span>
                </motion.div>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>No hidden charges. Taxes included in the final price.</p>
            </div>
          </div>
        </motion.div>
      </div>
      {/* Location Section */}
      <div className="space-y-6 mb-5">
        <div className="pb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Where you'll be
          </h2>
          <div className="h-80 rounded-lg overflow-hidden">
            <Map
               center={listing.geometry?.coordinates || getDefaultCoordinates(listing.location, listing.country)}
              zoom={15}
        
              listings={[listing]}
              height="600px"
              singleListing={true}
            />
          </div>
        </div>
      </div>
      {/* Host Section */}
      <div className="pb-6 border-b border-white-200 mt-5">
        <HostSection owner={listing.owner} />
      </div>
    </div>
  );
};

export default ListingDetail;
