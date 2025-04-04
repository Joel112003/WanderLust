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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [overallRating, setOverallRating] = useState(4.84);

  // Get token from localStorage
  const getToken = useCallback(() => localStorage.getItem("token"), []);

  // Fetch user details from backend
  const fetchUserDetails = useCallback(async (token) => {
    try {
      const response = await axios.get(profileEndpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedUser = response.data.user || response.data;
      setUser(fetchedUser);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  }, []);

  // Fetch reviews for the listing
const fetchReviews = async () => {
  try {
    setLoading(true);
    const response = await axios.get(
      `${API_URL}/listings/${listingId}/reviews`,
      {
        params: {
          page: 1,
          limit: 10
        }
      }
    );
    
    if (response.data.success) {
      setReviews(response.data.reviews);
      // Calculate average rating if needed
      if (response.data.reviews.length > 0) {
        const avg = response.data.reviews.reduce(
          (sum, r) => sum + r.rating, 0
        ) / response.data.reviews.length;
        setOverallRating(avg);
      }
    }
  } catch (error) {
    if (error.response) {
      // Handle different error statuses
      if (error.response.status === 404) {
        setError("This listing has no reviews yet");
        setReviews([]);
      } else {
        setError(error.response.data.message || "Error loading reviews");
      }
    } else {
      setError("Network error - could not connect to server");
    }
  } finally {
    setLoading(false);
  }
};

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
    const token = getToken();
    if (!token) {
      setError("You must be logged in to submit a review.");
      return;
    }
    if (!rating || !comment) {
      setError("Please provide both rating and comment.");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/listings/${listingId}/reviews`,
        { rating, comment },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      let newReview = response.data.review;
      if (!newReview.author && user) {
        newReview.author = user;
      }
      setReviews((prevReviews) => [newReview, ...prevReviews]);
      setRating(0);
      setComment("");
      setError("");

      // Recalculate overall rating
      const updatedReviews = [newReview, ...reviews];
      const avgRating =
        updatedReviews.reduce((sum, review) => sum + review.rating, 0) /
        updatedReviews.length;
      setOverallRating(avgRating);
    } catch (err) {
      setError(
        err.response?.data?.errors?.comment ||
          err.response?.data?.errors?.rating ||
          err.response?.data?.message ||
          "Failed to submit review."
      );
      console.error("Submit review error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a review
  const handleDeleteReview = async (reviewId) => {
    const token = getToken();
    if (!token) {
      setError("You must be logged in to delete a review.");
      return;
    }
    try {
      setDeleteLoading(true);
      await axios.delete(
        `${API_URL}/listings/${listingId}/reviews/${reviewId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedReviews = reviews.filter((r) => r._id !== reviewId);
      setReviews(updatedReviews);

      if (updatedReviews.length > 0) {
        const avgRating =
          updatedReviews.reduce((sum, review) => sum + review.rating, 0) /
          updatedReviews.length;
        setOverallRating(avgRating);
      } else {
        setOverallRating(0);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        "Failed to delete review. Please try again later."
      );
      console.error("Delete review error:", err);
    } finally {
      setDeleteLoading(false);
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
        <div className="text-gray-600 ">
          {reviews.length} Review{reviews.length !== 1 && "s"}
        </div>
      </div>
    );
  };

  return (
    <div className="reviews-section">
      {error && <div className="alert alert-danger">{error}</div>}

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
                      />
                      <label htmlFor={`star${star}`}></label>
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
                  Comment
                </label>
                <textarea
                  id="comment"
                  className="form-control"
                  rows="4"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-danger"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Review"}
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
          </h3>{" "}
          {loading ? (
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
                          disabled={deleteLoading}
                        >
                          {deleteLoading ? "Deleting..." : "Delete"}
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
