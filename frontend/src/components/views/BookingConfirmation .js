import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaMapMarkerAlt,
  FaPrint,
  FaCalendarAlt,
  FaUserFriends,
  FaHome,
} from "react-icons/fa";
import { MdErrorOutline } from "react-icons/md";
import { RiMoneyRupeeCircleFill } from "react-icons/ri";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const BookingConfirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const loadingToastId = toast.loading("Loading booking details...");

        if (state?.bookingId) {
          const token = localStorage.getItem("token");
          if (!token) {
            toast.dismiss(loadingToastId);
            throw new Error("Authentication required");
          }

          try {
            const response = await axios.get(
              `${API_URL}/bookings/${state.bookingId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            toast.dismiss(loadingToastId);

            if (response.data) {
              setBookingData(response.data);
              toast.success("Booking confirmed successfully!");
            } else {
              throw new Error("No booking data returned");
            }
          } catch (apiError) {
            console.error("API Error:", apiError);
            toast.dismiss(loadingToastId);

            if (state.listing) {
              setBookingData({
                listing: state.listing,
                ...state.bookingDetails,
                status: "confirmed",
                bookingId: state.bookingId,
              });
              toast.success("Booking confirmed successfully!");
            } else {
              throw apiError;
            }
          }
        } else if (state?.listing && state?.bookingDetails) {
          toast.dismiss(loadingToastId);
          setBookingData({
            listing: state.listing,
            ...state.bookingDetails,
            status: "confirmed",
            bookingId: `temp-${Date.now()}`,
          });
          toast.success("Booking confirmed successfully!");
        } else {
          toast.dismiss(loadingToastId);
          throw new Error("Incomplete booking data");
        }
      } catch (err) {
        console.error("Error:", err);
        setError(err.response?.data?.message || err.message);
        toast.error(
          err.response?.data?.message ||
            err.message ||
            "Failed to confirm booking"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [state]);

  const calculateBookingDetails = () => {
    if (!bookingData) return null;

    const { checkIn, checkOut, listing } = bookingData;
    const nights = Math.ceil(
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
    );
    const subtotal = listing.price * nights;
    const taxes = Math.round(subtotal * 0.18);
    const total = subtotal + taxes;

    return { nights, subtotal, taxes, total };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{
            scale: 1,
            y: 0,
            transition: { type: "spring", damping: 10, stiffness: 100 },
          }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-gray-100"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              transition: { delay: 0.2 },
            }}
          >
            <MdErrorOutline className="w-16 h-16 text-red-500 mx-auto mb-4" />
          </motion.div>
          <motion.h2
            initial={{ y: -10, opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
              transition: { delay: 0.3 },
            }}
            className="text-2xl font-bold text-gray-800 mb-4"
          >
            Booking Error
          </motion.h2>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
              transition: { delay: 0.4 },
            }}
            className="text-gray-600 mb-6"
          >
            {error || "We couldn't retrieve your booking details."}
          </motion.p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              }}
              whileTap={{
                scale: 0.95,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
              onClick={() => navigate(-1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-all flex items-center justify-center"
            >
              Go Back
            </motion.button>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.6 } }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 4px 8px rgba(59,130,246,0.3)",
              }}
              whileTap={{
                scale: 0.95,
                boxShadow: "0 2px 4px rgba(59,130,246,0.3)",
              }}
              onClick={() => navigate("/listings")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-all flex items-center justify-center"
            >
              <FaHome className="mr-2" /> Browse Listings
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  const { listing, checkIn, checkOut, guests, status } = bookingData;
  const { nights, subtotal, taxes, total } = calculateBookingDetails();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const cardVariants = {
    offscreen: { y: 50, opacity: 0 },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8,
      },
    },
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} />
      <div
        className={`min-h-screen mt-20 bg-white from-blue-50 to-green-50 p-4 md:p-8 flex justify-center items-start ${
          isPrinting ? "print:p-0" : ""
        }`}
      >
        <motion.div
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.2 }}
          variants={cardVariants}
          className={`w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden ${
            isPrinting
              ? "print:shadow-none print:rounded-none print:w-full print:max-w-full"
              : ""
          }`}
        >
          {/* Header */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50 print:bg-transparent"
          >
            <div className="flex items-center justify-between">
              <motion.div variants={itemVariants}>
                <motion.h1 className="text-3xl font-bold text-gray-800">
                  Booking Confirmed
                </motion.h1>
                <motion.p className="text-green-600 mt-1 flex items-center">
                  <FaCheckCircle className="mr-2" />
                  Your reservation is complete!
                </motion.p>
              </motion.div>
              <motion.span
                variants={itemVariants}
                className={`bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                  status === "cancelled" ? "bg-red-100 text-red-800" : ""
                }`}
              >
                {status === "cancelled" ? "Cancelled" : "Confirmed"}
              </motion.span>
            </div>
            {bookingData.bookingId && (
              <motion.p
                variants={itemVariants}
                className="text-sm text-gray-500 mt-2"
              >
                Booking ID:{" "}
                <span className="font-mono">{bookingData.bookingId}</span>
              </motion.p>
            )}
          </motion.div>

          {/* Property Info */}
          <motion.div
            variants={containerVariants}
            className="p-6 border-b border-gray-200"
          >
            <motion.div
              className="flex items-start gap-4"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm"
              >
                <img
                  src={listing.image.url}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/150?text=No+Image";
                  }}
                />
              </motion.div>
              <div>
                <motion.h3
                  whileHover={{ x: 5 }}
                  className="font-medium text-xl text-gray-800"
                >
                  {listing.title}
                </motion.h3>
                <motion.p
                  whileHover={{ x: 5 }}
                  className="text-gray-500 text-sm"
                >
                  {listing.category}
                </motion.p>
                <motion.p
                  whileHover={{ x: 5 }}
                  className="text-sm mt-1 flex items-center"
                >
                  <RiMoneyRupeeCircleFill className="text-green-500 mr-1" />
                  <span className="font-medium">
                    {listing.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-gray-500 ml-2">
                    ({listing.reviews?.length || 0} reviews)
                  </span>
                </motion.p>
              </div>
            </motion.div>
          </motion.div>

          {/* Trip Details */}
          <motion.div
            variants={containerVariants}
            className="p-6 border-b border-gray-200"
          >
            <motion.h2
              variants={itemVariants}
              className="text-lg font-semibold text-gray-800 mb-4 flex items-center"
            >
              <motion.span
                animate={{
                  rotate: [0, 10, -10, 0],
                  transition: { duration: 1, repeat: Infinity },
                }}
              >
                <FaCalendarAlt className="mr-2 text-blue-500" />
              </motion.span>
              Trip Details
            </motion.h2>

            <motion.div variants={containerVariants} className="space-y-4">
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-2 gap-4"
              >
                <motion.div
                  whileHover={{ x: 5, backgroundColor: "#eff6ff" }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-blue-50 p-3 rounded-lg"
                >
                  <p className="text-sm text-gray-500">Check-in</p>
                  <p className="font-medium text-gray-800">
                    {formatDate(checkIn)}
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5, backgroundColor: "#eff6ff" }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-blue-50 p-3 rounded-lg"
                >
                  <p className="text-sm text-gray-500">Check-out</p>
                  <p className="font-medium text-gray-800">
                    {formatDate(checkOut)}
                  </p>
                </motion.div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ x: 5, backgroundColor: "#eff6ff" }}
                whileTap={{ scale: 0.98 }}
                className="bg-blue-50 p-3 rounded-lg"
              >
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium text-gray-800">
                  {nights} night{nights !== 1 ? "s" : ""}
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ x: 5, backgroundColor: "#eff6ff" }}
                whileTap={{ scale: 0.98 }}
                className="bg-blue-50 p-3 rounded-lg"
              >
                <p className="text-sm text-gray-500">Guests</p>
                <p className="font-medium text-gray-800 flex items-center">
                  <motion.span
                    animate={{
                      scale: [1, 1.1, 1],
                      transition: { repeat: Infinity, duration: 2 },
                    }}
                  >
                    <FaUserFriends className="mr-2 text-blue-500" />
                  </motion.span>
                  {guests} {guests > 1 ? "guests" : "guest"}
                </p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Price Breakdown */}
          <motion.div variants={containerVariants} className="p-6">
            <motion.h2
              variants={itemVariants}
              className="text-lg font-semibold text-gray-800 mb-4"
            >
              Price Breakdown
            </motion.h2>

            <motion.div variants={containerVariants} className="space-y-3">
              <motion.div
                variants={itemVariants}
                whileHover={{ x: 5, backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.98 }}
                className="flex justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-gray-600 flex items-center">
                  <RiMoneyRupeeCircleFill className="mr-1 text-green-500" />
                  {listing.price.toLocaleString("en-IN")} × {nights} nights
                </span>
                <span className="text-gray-900 font-medium">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ x: 5, backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.98 }}
                className="flex justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-gray-600">Taxes and fees (18%)</span>
                <span className="text-gray-900 font-medium">
                  ₹{taxes.toLocaleString("en-IN")}
                </span>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{
                  scale: 1.01,
                  backgroundColor: "#eff6ff",
                  boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.2)",
                }}
                whileTap={{ scale: 0.99 }}
                className="flex justify-between pt-3 mt-3 border-t border-gray-200 font-bold text-lg bg-blue-50 p-3 rounded-lg"
              >
                <span className="text-gray-900">Total</span>
                <motion.span
                  animate={{
                    color: ["#3b82f6", "#10b981", "#3b82f6"],
                    transition: { duration: 3, repeat: Infinity },
                  }}
                >
                  ₹{total.toLocaleString("en-IN")}
                </motion.span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Actions */}
          <motion.div
            variants={containerVariants}
            className="p-6 bg-gray-50 border-t border-gray-200 print:hidden"
          >
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3"
            >
              <motion.button
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "#f3f4f6",
                }}
                whileTap={{
                  scale: 0.98,
                  boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.1)",
                }}
                onClick={() => navigate("/listings")}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all flex items-center justify-center font-medium"
              >
                <FaHome className="mr-2" /> Browse More Listings
              </motion.button>
              <motion.button
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3)",
                  backgroundColor: "#1d4ed8",
                }}
                whileTap={{
                  scale: 0.98,
                  boxShadow: "0 2px 4px -1px rgba(59, 130, 246, 0.3)",
                }}
                onClick={() => navigate("/profile")}
                className="flex-1 py-3 px-4 bg-blue-600 border border-blue-700 rounded-lg text-white hover:bg-blue-700 transition-all flex items-center justify-center font-medium"
              >
                <FaCheckCircle className="mr-2" /> View My Bookings
              </motion.button>
              <motion.button
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "#f9fafb",
                }}
                whileTap={{
                  scale: 0.98,
                  boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.1)",
                }}
                onClick={handlePrint}
                className="flex-1 py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center font-medium"
              >
                <motion.span
                  animate={{
                    rotate: [0, 10, -10, 0],
                    transition: { duration: 1, repeat: Infinity },
                  }}
                >
                  <FaPrint className="mr-2" />
                </motion.span>
                Print Confirmation
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Print-only footer */}
          <div className="hidden print:block p-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>
              Thank you for your booking! For any questions, please contact
              support@example.com
            </p>
            <p className="mt-2">Printed on {new Date().toLocaleDateString()}</p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default BookingConfirmation;
