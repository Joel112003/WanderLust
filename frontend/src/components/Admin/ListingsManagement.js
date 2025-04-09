import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheck, FaTimes, FaStar, FaSearch, FaFilter, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const ListingsManagement = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/listings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setListings(response.data || []); // Ensure we always set an array
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Error fetching listings', {
        className: 'bg-red-100 text-red-900'
      });
      setListings([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const updateListingStatus = async (listingId, status) => {
    try {
      await axios.patch(
        `${API_URL}/admin/listings/${listingId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }}
      );
      fetchListings();
      toast.success(`Listing ${status} successfully`, {
        className: 'bg-green-100 text-green-900'
      });
    } catch (error) {
      console.error('Error updating listing status:', error);
      toast.error('Error updating listing status', {
        className: 'bg-red-100 text-red-900'
      });
    }
  };

  const toggleFeatured = async (listingId) => {
    try {
      await axios.patch(
        `${API_URL}/admin/listings/${listingId}/feature`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }}
      );
      fetchListings();
      toast.success('Featured status updated', {
        className: 'bg-purple-100 text-purple-900'
      });
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast.error('Error updating featured status');
    }
  };

  // Ensure filteredListings is an array even if listings is undefined
  const filteredListings = (listings || []).filter(listing => {
    if (!listing) return false; // Skip if listing is undefined
    const matchesSearch = (listing.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (listing.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ? true : listing.status === filter;
    return matchesSearch && matchesFilter;
  });

  const statusColors = {
    pending: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      hover: 'hover:bg-amber-200'
    },
    approved: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      hover: 'hover:bg-emerald-200'
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      hover: 'hover:bg-red-200'
    }
  };

  const ListingModal = ({ listing, onClose }) => {
    if (!listing) return null; // Guard against null listing
    
    const statusColor = statusColors[listing.status] || statusColors.pending;
    
    // Add null checks for all listing properties
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="space-y-5">
            <div className="flex justify-between items-start">
              <h3 className="text-2xl font-bold text-gray-900">{listing.title || 'Untitled Listing'}</h3>
              <motion.button
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 p-1"
              >
                <FaTimes size={18} />
              </motion.button>
            </div>
            
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="rounded-xl overflow-hidden shadow-md"
            >
              <img
                src={listing.image && listing.image.url ? listing.image.url : '/placeholder-image.jpg'}
                alt={listing.title || 'Listing image'}
                className="object-cover w-full h-64"
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{listing.location || 'No location specified'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Price</p>
                <p className="font-medium text-gray-900">${listing.price || '0'}/night</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Owner</p>
                <p className="font-medium text-gray-900">{(listing.owner && listing.owner.username) || 'Unknown'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <span className={`px-3 py-1 text-sm rounded-full inline-block ${statusColor.bg} ${statusColor.text}`}>
                  {(listing.status && listing.status.charAt(0).toUpperCase() + listing.status.slice(1)) || 'Unknown'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Description</p>
              <p className="text-gray-700 leading-relaxed">{listing.description || 'No description available'}</p>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-100">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onClick={() => {
                  toggleFeatured(listing._id);
                  onClose();
                }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  listing.featured
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } transition-colors duration-200`}
              >
                <FaStar className={listing.featured ? "text-amber-500" : "text-gray-400"} />
                {listing.featured ? 'Unfeature' : 'Feature'}
              </motion.button>
              
              {listing.status === 'pending' && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    onClick={() => {
                      updateListingStatus(listing._id, 'approved');
                      onClose();
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    <FaCheck /> Approve
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    onClick={() => {
                      updateListingStatus(listing._id, 'rejected');
                      onClose();
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    <FaTimes /> Reject
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const emptyStateAnimation = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemAnimation = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
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
          Listings Management
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
              placeholder="Search listings..."
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
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm appearance-none bg-white transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </motion.select>
          </div>
        </motion.div>
      </div>

      {filteredListings.length === 0 ? (
        <motion.div 
          variants={emptyStateAnimation}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <motion.div variants={itemAnimation} className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          <motion.h3 variants={itemAnimation} className="text-lg font-medium text-gray-900">No listings found</motion.h3>
          <motion.p variants={itemAnimation} className="mt-2 text-gray-500">Try adjusting your search or filter criteria</motion.p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredListings.map((listing, index) => {
              // Skip rendering if listing is undefined
              if (!listing) return null;
              
              const statusColor = statusColors[listing.status] || statusColors.pending;
              
              return (
                <motion.div
                  key={listing._id || index}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    layout: { type: "spring", damping: 30, stiffness: 500 },
                    delay: index * 0.05
                  }}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative aspect-w-16 aspect-h-9">
                    <img
                      src={listing.image && listing.image.url ? listing.image.url : '/placeholder-image.jpg'}
                      alt={listing.title || 'Listing image'}
                      className="object-cover w-full h-52"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                    {listing.featured && (
                      <motion.div 
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", damping: 10, stiffness: 260 }}
                        className="absolute top-3 right-3 z-10"
                      >
                        <div className="bg-amber-400 rounded-full p-1.5 shadow-md">
                          <FaStar className="text-white text-sm" />
                        </div>
                      </motion.div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {listing.title || 'Untitled Listing'}
                      </h3>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColor.bg} ${statusColor.text}`}>
                        {(listing.status && listing.status.charAt(0).toUpperCase() + listing.status.slice(1)) || 'Unknown'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-500 truncate">
                      {listing.location || 'No location specified'}
                    </p>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        onClick={() => setSelectedListing(listing)}
                        className="text-purple-600 hover:text-purple-800 flex items-center gap-1.5 text-sm font-medium"
                      >
                        <FaEye />
                        View Details
                      </motion.button>
                      
                      {listing.status === 'pending' && (
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            onClick={() => updateListingStatus(listing._id, 'approved')}
                            className="p-1.5 rounded-full text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors duration-200"
                          >
                            <FaCheck size={12} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            onClick={() => updateListingStatus(listing._id, 'rejected')}
                            className="p-1.5 rounded-full text-red-600 bg-red-50 hover:bg-red-100 transition-colors duration-200"
                          >
                            <FaTimes size={12} />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {selectedListing && (
          <ListingModal
            listing={selectedListing}
            onClose={() => setSelectedListing(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ListingsManagement;