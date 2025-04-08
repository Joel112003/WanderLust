import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheck, FaTrash, FaSearch, FaStar, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/reviews`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setReviews(response.data);
    } catch (error) {
      toast.error('Error fetching reviews', {
        className: 'bg-red-100 text-red-900'
      });
    } finally {
      setLoading(false);
    }
  };

  const approveReview = async (reviewId) => {
    try {
      await axios.patch(
        `${API_URL}/admin/reviews/${reviewId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }}
      );
      fetchReviews();
      toast.success('Review approved successfully', {
        className: 'bg-green-100 text-green-900'
      });
    } catch (error) {
      toast.error('Error approving review');
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      await axios.delete(
        `${API_URL}/admin/reviews/${reviewId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }}
      );
      fetchReviews();
      toast.success('Review deleted successfully', {
        className: 'bg-red-100 text-red-900'
      });
    } catch (error) {
      toast.error('Error deleting review');
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.author?.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ? true : 
                         filterStatus === 'approved' ? review.approved : !review.approved;
    return matchesSearch && matchesFilter;
  });

  const StarRating = ({ rating }) => {
    return (
      <div className="flex space-x-1">
        {[...Array(5)].map((_, index) => (
          <FaStar
            key={index}
            className={`${
              index < rating ? 'text-yellow-400' : 'text-gray-300'
            } text-lg`}
          />
        ))}
      </div>
    );
  };

  const ReviewCard = ({ review }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg p-6 space-y-4"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900">
            {review.listing?.title || 'Deleted Listing'}
          </h3>
          <p className="text-sm text-gray-500">
            by {review.author?.username || 'Unknown User'}
          </p>
        </div>
        <span className={`px-3 py-1 text-xs rounded-full ${
          review.approved
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {review.approved ? 'Approved' : 'Pending'}
        </span>
      </div>

      <div className="space-y-2">
        <StarRating rating={review.rating} />
        <p className="text-gray-700">{review.comment}</p>
        <p className="text-sm text-gray-500">
          Posted on {new Date(review.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        {!review.approved && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => approveReview(review._id)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <FaCheck className="mr-2" />
            Approve
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => deleteReview(review._id)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
        >
          <FaTrash className="mr-2" />
          Delete
        </motion.button>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Review Management</h2>
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <motion.select
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Reviews</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </motion.select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {filteredReviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </AnimatePresence>
      </div>

      {filteredReviews.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-gray-500"
        >
          No reviews found matching your criteria
        </motion.div>
      )}
    </motion.div>
  );
};

export default ReviewList;