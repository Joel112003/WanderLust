import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { ExclamationTriangleIcon, ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline'

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const DeleteListingPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(null)

  // Fetch listing details
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/listings/${id}`)
        setListing(response.data.data)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch listing:', err)
        setError(err.response?.data?.error || 'Failed to load listing details')
      } finally {
        setLoading(false)
      }
    }
    fetchListing()
  }, [id])

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)
    try {
      await axios.delete(`${API_BASE_URL}/listings/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      navigate('/profile', {
        state: { 
          message: 'Listing deleted successfully',
          showToast: true
        }
      })
    } catch (err) {
      console.error('Delete failed:', err)
      setError(err.response?.data?.error || 'Failed to delete listing')
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4 ">
        <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500" />
        <p className="text-gray-600 text-lg">{error || 'Listing not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-16"
    >
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Back
            </button>
            <h2 className="text-xl font-bold text-gray-800">Delete Listing</h2>
          </div>

          <div className="flex flex-col items-center text-center mb-8">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mb-4"
            >
              <ExclamationTriangleIcon className="h-16 w-16 text-red-500" />
            </motion.div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this listing? This action cannot be undone.
            </p>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-gray-900 mb-2">{listing.title}</h4>
            <p className="text-gray-600 text-sm">{listing.location}, {listing.country}</p>
            {listing.image?.url && (
              <img 
                src={listing.image.url} 
                alt={listing.title}
                className="mt-2 rounded-md w-full h-32 object-cover"
              />
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-between space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              disabled={isDeleting}
              className={`flex-1 flex items-center justify-center ${
                isDeleting ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
              } text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200`}
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <TrashIcon className="h-5 w-5 mr-1" />
                  Delete Permanently
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default DeleteListingPage;