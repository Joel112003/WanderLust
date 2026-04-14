import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import CancelBookingModal from "./CancelBookingModal";
import AlternativeAccommodationModal from "./AlternativeAccommodationModal";

const API_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:8000";

const OwnerBookingsManager = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOwnerBookings();
  }, []);

  const fetchOwnerBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/bookings/owner/listings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBookings(response.data.bookings || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setCancelModalOpen(true);
  };

  const handleCancelSuccess = async () => {
    setCancelModalOpen(false);
    setSelectedBooking(null);
    await fetchOwnerBookings();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmed: "bg-blue-100 text-blue-800 border-blue-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
      cancelled_by_owner: "bg-orange-100 text-orange-800 border-orange-300",
      completed: "bg-green-100 text-green-800 border-green-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pending",
      confirmed: "Confirmed",
      cancelled: "Cancelled by Guest",
      cancelled_by_owner: "Cancelled by You",
      completed: "Completed",
    };
    return labels[status] || status;
  };

  const isUpcoming = (checkIn) => {
    return new Date(checkIn) > new Date();
  };

  const isPast = (checkOut) => {
    return new Date(checkOut) < new Date();
  };

  const isCancellable = (booking) => {
    return (
      isUpcoming(booking.checkIn) &&
      !["cancelled", "cancelled_by_owner"].includes(booking.status)
    );
  };

  const filteredBookings = bookings.filter((booking) => {

    if (filter === "upcoming" && !isUpcoming(booking.checkIn)) return false;
    if (filter === "past" && !isPast(booking.checkOut)) return false;
    if (
      filter === "cancelled" &&
      !["cancelled", "cancelled_by_owner"].includes(booking.status)
    )
      return false;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        booking.listing?.title?.toLowerCase().includes(search) ||
        booking.user?.username?.toLowerCase().includes(search) ||
        booking.user?.email?.toLowerCase().includes(search) ||
        booking.confirmationNumber?.toLowerCase().includes(search)
      );
    }

    return true;
  });

  const groupBookingsByListing = (bookings) => {
    const grouped = {};
    bookings.forEach((booking) => {
      const listingId = booking.listing?._id;
      if (!grouped[listingId]) {
        grouped[listingId] = {
          listing: booking.listing,
          bookings: [],
        };
      }
      grouped[listingId].bookings.push(booking);
    });
    return Object.values(grouped);
  };

  const groupedBookings = groupBookingsByListing(filteredBookings);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium">{error}</p>
        <button
          onClick={fetchOwnerBookings}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Manage Your Bookings
          </h2>
          <p className="text-gray-600 mt-1">
            View and manage all bookings for your listings
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-teal-600">{bookings.length}</p>
          <p className="text-sm text-gray-600">Total Bookings</p>
        </div>
      </div>
<div className="bg-white rounded-lg shadow-md p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {["all", "upcoming", "past", "cancelled"].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === filterOption
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by listing, guest name, email, or confirmation number..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
<div className="text-sm text-gray-600 mb-4">
        Showing {filteredBookings.length} of {bookings.length} bookings
      </div>
{filteredBookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-gray-600 text-lg mb-2">No bookings found</p>
          <p className="text-gray-500 text-sm">
            {searchTerm
              ? "Try adjusting your search or filters"
              : "You don't have any bookings yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedBookings.map((group) => (
            <div
              key={group.listing?._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
<div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 border-b border-teal-100">
                <div className="flex items-start gap-4">
                  {group.listing?.images?.[0] && (
                    <img
                      src={group.listing.images[0]}
                      alt={group.listing.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {group.listing?.title || "Unknown Listing"}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {group.listing?.location?.city},{" "}
                      {group.listing?.location?.country}
                    </p>
                    <p className="text-teal-700 font-medium mt-2">
                      {group.bookings.length} booking
                      {group.bookings.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
<div className="divide-y divide-gray-200">
                {group.bookings.map((booking) => (
                  <div key={booking._id} className="p-6 hover:bg-gray-50">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
<div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                            <span className="text-teal-700 font-bold text-lg">
                              {booking.user?.username?.charAt(0).toUpperCase() ||
                                "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {booking.user?.username || "Unknown Guest"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {booking.user?.email || "No email"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase mb-1">
                              Check-in
                            </p>
                            <p className="font-medium text-gray-900">
                              {new Date(booking.checkIn).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase mb-1">
                              Check-out
                            </p>
                            <p className="font-medium text-gray-900">
                              {new Date(booking.checkOut).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase mb-1">
                              Guests
                            </p>
                            <p className="font-medium text-gray-900">
                              {booking.numberOfGuests || 1}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase mb-1">
                              Total Price
                            </p>
                            <p className="font-medium text-gray-900">
                              ${booking.totalPrice?.toLocaleString() || "0"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {getStatusLabel(booking.status)}
                          </span>
                          {booking.confirmationNumber && (
                            <span className="text-xs text-gray-600">
                              Confirmation: {booking.confirmationNumber}
                            </span>
                          )}
                          {booking.isCancelledLastMinute && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                              Last Minute Cancellation
                            </span>
                          )}
                        </div>

                        {booking.cancellationReason && (
                          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-sm text-orange-900">
                              <strong>Cancellation Reason:</strong>{" "}
                              {booking.cancellationReason}
                            </p>
                            {booking.cancellationDate && (
                              <p className="text-xs text-orange-700 mt-1">
                                Cancelled on:{" "}
                                {new Date(
                                  booking.cancellationDate
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
{isCancellable(booking) && (
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => handleCancelBooking(booking)}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            Cancel Booking
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
<AnimatePresence>
        {cancelModalOpen && selectedBooking && (
          <CancelBookingModal
            isOpen={cancelModalOpen}
            onClose={() => {
              setCancelModalOpen(false);
              setSelectedBooking(null);
            }}
            booking={selectedBooking}
            onCancelSuccess={handleCancelSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OwnerBookingsManager;
