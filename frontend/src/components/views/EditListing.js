import React, { useEffect, useState, useRef } from "react"; // Add useRef here
import axios from "axios";
import mapboxgl from "mapbox-gl"; // Add this import
import "mapbox-gl/dist/mapbox-gl.css"; // Optional but recommended for map stylingimport axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
// This should be in your environment configuration
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

function EditListing() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    location: "",
    country: "",
    category: "",
    guests: 1,
    bedrooms: 1,
    beds: 1,
    baths: 1,
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const mapRef = useRef();
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  const categories = [
    "Mansion",
    "Farm",
    "Lake",
    "Beach",
    "Apartment",
    "Ski Resort",
    "Camping",
    "Cottage",
    "Luxury",
  ];

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/listings/${id}`);
        const listing = response.data.data;
  
        // Set form data
        setFormData({
          title: listing.title,
          description: listing.description,
          price: listing.price,
          location: listing.location,
          country: listing.country,
          category: listing.category,
          guests: listing.guests,
          bedrooms: listing.bedrooms,
          beds: listing.beds,
          baths: listing.baths,
        });
  
        // Set preview image
        if (listing.image?.url) {
          setPreviewImage(listing.image.url);
        }
  
        // Process listing for map and geocode location
        const processedListing = processListingForMap(listing);
        
        // Add marker to map if location exists
        if (processedListing.location && processedListing.country) {
          handleGeocodeLocation(processedListing.location, processedListing.country);
        }
      } catch (err) {
        toast.error("Failed to load listing data");
        console.error("Fetch error:", err);
      }
    };
  
    fetchListing();
  }, [id]);
  const processListingForMap = (listing) => {
    // If listing already has coordinates, return as-is
    if (listing.geometry?.coordinates) {
      return listing;
    }
  
    // If no coordinates but has location/country, add default coordinates
    if (listing.location && listing.country) {
      return {
        ...listing,
        geometry: {
          type: "Point",
          coordinates: getDefaultCoordinates(listing.location, listing.country)
        }
      };
    }
  
    return listing;
  };
  
  const getDefaultCoordinates = (location, country) => {
    // Simple fallback coordinates (center of India)
    return [78.9629, 20.5937];
  };
  
  const handleGeocodeLocation = async (location, country) => {
    if (!mapRef.current) return null;
    
    try {
      const address = `${location}, ${country}`;
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      
      if (data.features?.length > 0) {
        const coordinates = data.features[0].center;
        
        // Clear existing markers
        document.querySelectorAll('.mapboxgl-marker').forEach(marker => marker.remove());
        
        // Add new marker
        new mapboxgl.Marker()
          .setLngLat(coordinates)
          .addTo(mapRef.current);
        
        // Center map on marker
        mapRef.current.flyTo({
          center: coordinates,
          zoom: 14
        });
  
        return coordinates;
      }
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formPayload = new FormData();

      // Create properly structured listing data
      const listing = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        location: formData.location,
        country: formData.country,
        category: formData.category,
        guests: formData.guests || 1,
        bedrooms: formData.bedrooms || 1,
        beds: formData.beds || 1,
        baths: formData.baths || 1,
      };

      // Append as JSON string
      formPayload.append("listing", JSON.stringify(listing));

      // Add image if exists
      if (imageFile) {
        formPayload.append("image", imageFile);
      }

      const response = await axios.put(
        `${API_BASE_URL}/listings/${id}`,
        formPayload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          transformRequest: (data, headers) => {
            delete headers["Content-Type"];
            return data;
          },
        }
      );

      if (response.data.success) {
        toast.success("Listing updated successfully!");
        setTimeout(() => navigate(`/listings/${id}`), 1500);
      }
    } catch (err) {
      console.error("Update error:", err.response?.data || err);
      const errorDetails = err.response?.data?.details || [];
      toast.error(
        `Update failed: ${err.response?.data?.error || "Unknown error"}`,
        {
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8 mt-16"
    >
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <motion.h1
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-8 text-center"
          >
            Update Your Listing
          </motion.h1>

            
          {/* Important Note About Images */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md"
          >
            <p className="text-yellow-700 font-medium">
              <span className="font-bold">⚠️ Important:</span> When updating your listing, please re-upload your images even if you don't want to change them. Otherwise, your listing images will be lost.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <motion.div whileHover={{ scale: 1.01 }} className="group">
              <label className="block text-sm font-medium text-gray-700 group-hover:text-purple-600">
                Title
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                placeholder="Leave empty to keep current"
              />
            </motion.div>

            {/* Description */}
            <motion.div whileHover={{ scale: 1.01 }} className="group">
              <label className="block text-sm font-medium text-gray-700 group-hover:text-purple-600">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                placeholder="Leave empty to keep current"
              />
            </motion.div>

            {/* Price */}
            <motion.div whileHover={{ scale: 1.01 }} className="group">
              <label className="block text-sm font-medium text-gray-700 group-hover:text-purple-600">
                Price per night
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Leave empty to keep current"
                  min="0"
                />
              </div>
            </motion.div>

            {/* Category */}
            <motion.div whileHover={{ scale: 1.01 }} className="group">
              <label className="block text-sm font-medium text-gray-700 group-hover:text-purple-600">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Keep current category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </motion.div>
            {/* Capacity Fields */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div whileHover={{ scale: 1.01 }} className="group">
                <label className="block text-sm font-medium text-gray-700 group-hover:text-purple-600">
                  Guests
                </label>
                <input
                  type="number"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  min="1"
                  className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                />
              </motion.div>

              <motion.div whileHover={{ scale: 1.01 }} className="group">
                <label className="block text-sm font-medium text-gray-700 group-hover:text-purple-600">
                  Bedrooms
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  min="1"
                  className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                />
              </motion.div>

              <motion.div whileHover={{ scale: 1.01 }} className="group">
                <label className="block text-sm font-medium text-gray-700 group-hover:text-purple-600">
                  Beds
                </label>
                <input
                  type="number"
                  name="beds"
                  value={formData.beds}
                  onChange={handleChange}
                  min="1"
                  className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                />
              </motion.div>

              <motion.div whileHover={{ scale: 1.01 }} className="group">
                <label className="block text-sm font-medium text-gray-700 group-hover:text-purple-600">
                  Baths
                </label>
                <input
                  type="number"
                  name="baths"
                  value={formData.baths}
                  onChange={handleChange}
                  min="1"
                  className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                />
              </motion.div>
            </div>
            {/* Image Upload */}
            <motion.div whileHover={{ scale: 1.01 }} className="group">
              <label className="block text-sm font-medium text-gray-700 group-hover:text-purple-600">
                Update Image
              </label>
              <input
                type="file"
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                accept="image/*"
              />
              {previewImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 rounded-lg overflow-hidden shadow-md"
                >
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                </motion.div>
              )}
            </motion.div>

            {/* Location */}
            <motion.div whileHover={{ scale: 1.01 }} className="group">
              <label className="block text-sm font-medium text-gray-700 group-hover:text-purple-600">
                Location
              </label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                placeholder="Leave empty to keep current"
              />
            </motion.div>

            {/* Country */}
            <motion.div whileHover={{ scale: 1.01 }} className="group">
              <label className="block text-sm font-medium text-gray-700 group-hover:text-purple-600">
                Country
              </label>
              <input
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                placeholder="Leave empty to keep current"
              />
            </motion.div>

            {/* Submit Button */}
            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow hover:from-purple-700 hover:to-pink-700 disabled:opacity-70"
              >
                {isLoading ? "Updating..." : "Update Listing"}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default EditListing;
