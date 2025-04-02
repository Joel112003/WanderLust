import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Star, Calendar, Users, ArrowLeft } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const SearchResults = () => {
  const [listings, setListings] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get search results from localStorage
    const storedResults = localStorage.getItem("searchResults");
    const storedCriteria = localStorage.getItem("searchCriteria");

    if (storedResults && storedCriteria) {
      try {
        setListings(JSON.parse(storedResults));
        setSearchCriteria(JSON.parse(storedCriteria));
      } catch (error) {
        console.error("Error parsing stored search data:", error);
        toast.error("Error loading search results");
      }
    } else {
      // If no results in localStorage, redirect to home
      toast.info("No search criteria found. Please try searching again.");
      setTimeout(() => navigate("/"), 2000);
    }
    
    setIsLoading(false);
  }, [navigate]);

  const handleBackToSearch = () => {
    navigate("/");
  };

  // Function to render listing cards
  const renderListings = () => {
    if (listings.length === 0) {
      return (
        <div className="text-center py-12 h-screen">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No listings found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
          <button
            onClick={handleBackToSearch}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Back to Search
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <motion.div
            key={listing._id}
            whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={listing.image.url}
                alt={listing.title}
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
              <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-lg text-sm font-medium text-gray-800">
                {listing.price}/night
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">
                  {listing.title}
                </h3>
                {/* <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium">
                    {listing?.reviews && listing.reviews?.length  > 0
                      ? (listing.reviews.reduce((acc, review) => acc + review.rating, 0) / listing.reviews?.length ).toFixed(1)
                      : "New"}
                  </span>
                </div> */}
              </div>
              <div className="flex items-center text-gray-600 text-sm mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{listing.location}, {listing.country}</span>
              </div>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {listing.description}
              </p>
              <button
                onClick={() => navigate(`/listings/${listing._id}`)}
                className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <ToastContainer />
      
      {/* Search Summary */}
      {searchCriteria && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Search Results</h2>
            <button
              onClick={handleBackToSearch}
              className="flex items-center text-red-500 hover:text-red-600"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Modify Search
            </button>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
              <MapPin className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-sm">{searchCriteria.destination}</span>
            </div>
            <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
              <Calendar className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-sm">
                {searchCriteria.checkIn} - {searchCriteria.checkOut}
              </span>
            </div>
            <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
              <Users className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-sm">
                {searchCriteria.totalGuests} {searchCriteria.totalGuests === 1 ? "Guest" : "Guests"}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Results Count */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700">
          {listings.length} {listings.length === 1 ? "stay" : "stays"} found
        </h3>
      </div>
      
      {/* Listing Grid */}
      {renderListings()}
    </div>
  );
};

export default SearchResults;
