import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CircularProgress, Alert, Snackbar } from "@mui/material";
import "../../utilis/css/Listing.css";
import HeroSearch from "./HeroSearch";

function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/listings`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("API Response:", result); // Debugging
        
        if (result.success && Array.isArray(result.data)) {
          setListings(result.data.map(listing => ({
            ...listing,
            price: listing.price || 0, // Ensure price has a default value
            image: listing.image || { url: "/default-image.jpg" }
          })));
        } else {
          console.error("Unexpected API response structure:", result);
          throw new Error("Invalid data format received from the API.");
        }
      } catch (err) {
        console.error("Error fetching listings:", err);
        setError(err.message);
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price).replace('₹', '₹ ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
    </div>
    );
  }

  return (
    <>
      <div className="hero-section mb-8 pt-4 bg-gradient-to-r from-rose-50 to-indigo-50">
        <HeroSearch />
      </div>
      
      <div className="listings-container">
        {error && (
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert severity="error" onClose={() => setSnackbarOpen(false)}>
              {error}
            </Alert>
          </Snackbar>
        )}

        {!loading && listings.length === 0 ? (
          <div className="no-listings">
            <p>No listings found. Try adjusting your search criteria.</p>
            <Link to="/listings/new" className="create-listing-link">
              Create a new listing
            </Link>
          </div>
        ) : (
          listings.map((listing) => (
            <Link
              to={`/listings/${listing._id}`}
              key={listing._id}
              className="listing-link"
              style={{ textDecoration: "none" }}
            >
              <div className="listing-item">
                <img
                  src={listing.image?.url || "/default-image.jpg"}
                  alt={listing.title || "Property listing"}
                  className="listing-image"
                  onError={(e) => {
                    e.target.src = "/default-image.jpg";
                  }}
                />
                <div className="listing-details">
                  <div className="listing-info">
                    <h3 className="listing-title">
                      {listing.title || "Untitled Property"}
                    </h3>
                    <p className="listing-location">
                      {listing.location || "Location not specified"}
                      {listing.country ? `, ${listing.country}` : ""}
                    </p>
                    <p className="listing-price">
                      {formatPrice(listing.price)} / night
                    </p>
                  </div>
                  <div className="listing-rating">
                    <span className="rating-star">★</span>
                    <span className="rating-value">
                      {listing.reviews?.length || 0} reviews
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}

export default Listings;