import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../../utilis/css/ListingDetails.css";
import "../../utilis/css/Review.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
const profileEndpoint = `${API_URL}/auth/profile`;

const Review = ({ listingId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [overallRating, setOverallRating] = useState(0);
  const [loadingStates, setLoadingStates] = useState({
    reviews: false,
    submit: false,
    delete: false,
  });

  // Get token from localStorage
  const getToken = useCallback(() => localStorage.getItem("token"), []);

  // Check authentication
  const checkAuth = useCallback(() => {
    const token = getToken();
    if (!token) {
      setError("You must be logged in to perform this action.");
      return false;
    }
    return true;
  }, [getToken]);

  // Fetch user details from backend
  const fetchUserDetails = useCallback(
    async (token) => {
      try {
        const response = await axios.get(profileEndpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedUser = response.data.user || response.data;
        setUser(fetchedUser);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      }
    },
    [profileEndpoint]
  );

  // Fetch reviews for the listing
  const fetchReviews = useCallback(async () => {
    try {
      setLoadingStates((prev) => ({ ...prev, reviews: true }));
      setError("");
      const response = await axios.get(`${API_URL}/listings/${listingId}/reviews`, {
        params: {
          page: 1,
          limit: 10,
        },
      });

      if (response.data.success) {
        setReviews(response.data.reviews);
        // Calculate average rating
        const avg =
          response.data.reviews.length > 0
            ? response.data.reviews.reduce((sum, r) => sum + r.rating, 0) /
              response.data.reviews.length
            : 0;
        setOverallRating(avg);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Error loading reviews. Please try again later."
      );
      setReviews([]);
      setOverallRating(0);
    } finally {
      setLoadingStates((prev) => ({ ...prev, reviews: false }));
    }
  }, [listingId]);

  // Fetch user details if token exists
  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchUserDetails(token);
    }
  }, [getToken, fetchUserDetails]);

  // Fetch reviews whenever listingId changes
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Submit a new review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!checkAuth()) return;
    
    if (!rating) {
      setError("Please select a rating.");
      return;
    }
    
    if (!comment || comment.length < 10) {
      setError("Please provide a comment with at least 10 characters.");
      return;
    }
  
    try {
      setLoadingStates((prev) => ({ ...prev, submit: true }));
      const response = await axios.post(
        `${API_URL}/listings/${listingId}/reviews`,
        { rating, comment },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      
      let newReview = response.data.review;
      if (!newReview.author && user) {
        newReview.author = user;
      }
      
      const updatedReviews = [newReview, ...reviews];
      setReviews(updatedReviews);
      setRating(0);
      setComment("");
      setError("");
      
      // Recalculate overall rating
      const avgRating =
        updatedReviews.length > 0
          ? updatedReviews.reduce((sum, review) => sum + review.rating, 0) /
            updatedReviews.length
          : 0;
      setOverallRating(avgRating);
    } catch (err) {
      console.error("Submit review error:", err);
      
      // More comprehensive error handling
      const errorMsg = 
        err.response?.data?.errors?.comment ||
        err.response?.data?.errors?.rating ||
        err.response?.data?.message ||
        err.response?.data?.error ||  // Added to catch the specific error we saw
        "Failed to submit review. Please try again later.";
      
      setError(errorMsg);
    } finally {
      setLoadingStates((prev) => ({ ...prev, submit: false }));
    }
  };

  // Delete a review
  const handleDeleteReview = async (reviewId) => {
    if (!checkAuth()) return;

    try {
      setLoadingStates((prev) => ({ ...prev, delete: true }));
      await axios.delete(`${API_URL}/listings/${listingId}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const updatedReviews = reviews.filter((r) => r._id !== reviewId);
      setReviews(updatedReviews);

      const avgRating =
        updatedReviews.length > 0
          ? updatedReviews.reduce((sum, review) => sum + review.rating, 0) /
            updatedReviews.length
          : 0;
      setOverallRating(avgRating);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete review. Please try again later."
      );
      console.error("Delete review error:", err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, delete: false }));
    }
  };

  // Render rating summary
  const renderRatingSummary = () => {
    return (
      <div className="flex items-center justify-between border-b pb-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="text-5xl font-bold text-gray-900">
            {overallRating.toFixed(1)}
          </div>
          <div className="text-yellow-500 text-3xl">
            {"★".repeat(Math.round(overallRating))}
            {"☆".repeat(5 - Math.round(overallRating))}
          </div>
        </div>
        <div className="text-gray-600">
          {reviews.length} Review{reviews.length !== 1 && "s"}
        </div>
      </div>
    );
  };

  return (
    <div className="reviews-section">
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      {/* Rating Summary Section */}
      {renderRatingSummary()}

      {/* Review Submission Form */}
      {getToken() && (
        <div className="card mb-4">
          <div className="card-body">
            <h3 className="card-title h4">Leave a Review</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-3">
                <div className="rating">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <React.Fragment key={star}>
                      <input
                        type="radio"
                        id={`star${star}`}
                        name="rating"
                        value={star}
                        checked={rating === star}
                        onChange={(e) => setRating(parseInt(e.target.value))}
                        aria-required="true"
                      />
                      <label htmlFor={`star${star}`} aria-label={`${star} stars`}></label>
                    </React.Fragment>
                  ))}
                </div>
                {rating > 0 && (
                  <div className="rating-result">
                    Your rating: {rating} {rating === 1 ? "star" : "stars"}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="comment" className="form-label">
                  Comment (minimum 10 characters)
                </label>
                <textarea
                  id="comment"
                  className="form-control"
                  rows="4"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  minLength="10"
                  aria-describedby="commentHelp"
                />
                <small id="commentHelp" className="text-muted">
                  Please share your detailed experience
                </small>
              </div>
              <button
                type="submit"
                className="btn btn-danger"
                disabled={loadingStates.submit}
                aria-busy={loadingStates.submit}
              >
                {loadingStates.submit ? "Submitting..." : "Submit Review"}
              </button>
            </form>
            
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="card">
        <div className="card-body">
          <h3 className="card-title h4 relative pb-2 inline-block">
            All Reviews
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500 to-red-500"></span>
          </h3>
          {loadingStates.reviews ? (
            <p>Just Wait A Minute Buddy!!!</p>
          ) : reviews && reviews.length > 0 ? (
            <div className="space-y-4 mt-10">
              {reviews.map((review) => (
                <div key={review._id} className="border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-semibold">
                        {review.author?.username || "Anonymous"}
                      </h5>
                      <div className="text-yellow-500 mb-2">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </div>
                    </div>
                    <small className="text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <p className="text-gray-700 mt-2">{review.comment}</p>

                  {user &&
                    review.author &&
                    review.author?.username === user.username && (
                      <div className="mt-2">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteReview(review._id)}
                          disabled={loadingStates.delete}
                          aria-label="Delete review"
                        >
                          {loadingStates.delete ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-md">
              No reviews yet. Be the first to review!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Review;