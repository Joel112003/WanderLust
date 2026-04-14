import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const fmt = (n) =>
  (n ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

const BookingDetailModal = ({ booking, onClose, user }) => {
  if (!booking) return null;

  const listing = booking.listing || {};
  const total = booking.totalAmount || booking.total || 0;
  const guests = booking.guests || booking.numberOfGuests || 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
            <button
              onClick={onClose}
              className="rounded-md px-2 py-1 text-sm font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            >
              Close
            </button>
          </div>

          <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Listing:</span>{" "}
              {listing.title || "Unknown listing"}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Guest:</span>{" "}
              {user?.username || user?.email || "Guest"}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Check-in:</span>{" "}
              {fmtDate(booking.checkIn)}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Check-out:</span>{" "}
              {fmtDate(booking.checkOut)}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Guests:</span> {guests}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Status:</span>{" "}
              {booking.status || "N/A"}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Total:</span> Rs {fmt(total)}
            </p>
            {booking.confirmationNumber && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Confirmation:</span>{" "}
                {booking.confirmationNumber}
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookingDetailModal;
