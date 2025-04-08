import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheck, FaTrash, FaSearch, FaStar, FaFilter, FaRegSadTear } from 'react-icons/fa';
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
    const matchesSearch = review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.author?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ? true : 
                         filterStatus === 'approved' ? review.approved : !review.approved;
    return matchesSearch && matchesFilter;
  });

  const StarRating = ({ rating }) => {
    return (
      <div className="flex space-x-1">
        {[...Array(5)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <FaStar
              className={`${
                index < rating ? 'text-yellow-400' : 'text-gray-200'
              } text-lg`}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  const reviewCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 500
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  const ReviewCard = ({ review, index }) => (
    <motion.div
      layout
      variants={reviewCardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl shadow-md p-6 space-y-4 border border-gray-100 hover:shadow-lg transition-shadow duration-300"
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
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
          review.approved
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-amber-100 text-amber-800'
        }`}>
          {review.approved ? 'Approved' : 'Pending'}
        </span>
      </div>

      <div className="space-y-3">
        <StarRating rating={review.rating} />
        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Posted on {new Date(review.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
        {!review.approved && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={() => approveReview(review._id)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 transition-colors duration-200 text-sm font-medium"
          >
            <FaCheck />
            Approve
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          onClick={() => deleteReview(review._id)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors duration-200 text-sm font-medium"
        >
          <FaTrash />
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
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: {
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            },
            scale: {
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const emptyStateAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 500
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <motion.h2 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-gray-800"
        >
          Review Management
        </motion.h2>
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4 w-full sm:w-auto"
        >
          <div className="relative flex-1 sm:flex-initial">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200"
            />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <motion.select
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm appearance-none bg-white transition-all duration-200"
            >
              <option value="all">All Reviews</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </motion.select>
          </div>
        </motion.div>
      </div>

      {filteredReviews.length === 0 ? (
        <motion.div 
          variants={emptyStateAnimation}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="text-gray-400 mb-4">
            <FaRegSadTear className="mx-auto h-16 w-16" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No reviews found</h3>
          <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredReviews.map((review, index) => (
              <ReviewCard key={review._id} review={review} index={index} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default ReviewList;