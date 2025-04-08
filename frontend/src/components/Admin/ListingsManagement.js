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
      setListings(response.data);
    } catch (error) {
      toast.error('Error fetching listings', {
        className: 'bg-red-100 text-red-900'
      });
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
      toast.error('Error updating featured status');
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ? true : listing.status === filter;
    return matchesSearch && matchesFilter;
  });

  const ListingModal = ({ listing, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-gray-900">{listing.title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{listing.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-medium">${listing.price}/night</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Owner</p>
              <p className="font-medium">{listing.owner?.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`px-2 py-1 text-sm rounded-full ${
                listing.status === 'approved' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {listing.status}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="mt-1">{listing.description}</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                toggleFeatured(listing._id);
                onClose();
              }}
              className={`px-4 py-2 rounded-lg ${
                listing.featured
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <FaStar className="inline-block mr-2" />
              {listing.featured ? 'Unfeature' : 'Feature'}
            </motion.button>
            
            {listing.status === 'pending' && (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    updateListingStatus(listing._id, 'approved');
                    onClose();
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    updateListingStatus(listing._id, 'rejected');
                    onClose();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Listings Management</h2>
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <motion.select
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </motion.select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredListings.map((listing) => (
            <motion.div
              key={listing._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="relative aspect-w-16 aspect-h-9">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="object-cover w-full h-full"
                />
                {listing.featured && (
                  <div className="absolute top-2 right-2">
                    <FaStar className="text-yellow-400 text-xl" />
                  </div>
                )}
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {listing.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    listing.status === 'approved' 
                      ? 'bg-green-100 text-green-800'
                      : listing.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {listing.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 truncate">
                  {listing.location}
                </p>
                
                <div className="flex justify-between items-center pt-3 border-t">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedListing(listing)}
                    className="text-purple-600 hover:text-purple-700 flex items-center"
                  >
                    <FaEye className="mr-1" />
                    View Details
                  </motion.button>
                  
                  {listing.status === 'pending' && (
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateListingStatus(listing._id, 'approved')}
                        className="p-1 rounded-full text-green-600 hover:bg-green-100"
                      >
                        <FaCheck />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateListingStatus(listing._id, 'rejected')}
                        className="p-1 rounded-full text-red-600 hover:bg-red-100"
                      >
                        <FaTimes />
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

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