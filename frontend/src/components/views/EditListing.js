import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  MenuItem,
  Paper,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    country: "",
    category: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Fetch listing details
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/listings/${id}`);
        // Make sure we're setting the state with the correct data
        setListing(response.data);
        toast.info("Listing details loaded successfully");
      } catch (error) {
        setError("Failed to fetch listing details.");
        toast.error("Failed to fetch listing details");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  // This function handles input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Make sure we're updating the state correctly
    setListing((prev) => ({ ...prev, [name]: value }));
    console.log(`Updated ${name} to: ${value}`); // Add logging for debugging
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `http://localhost:8000/listings/${id}`,
        listing
      );
      if (response.status === 200) {
        toast.success("Listing updated successfully!");
        setTimeout(() => {
          navigate(`/listings/${id}`);
        }, 1500);
      }
    } catch (error) {
      setError("Failed to update listing. Please try again.");
      toast.error("Failed to update listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <CircularProgress color="error" />
        </motion.div>
        <Typography className="ml-4 text-gray-600">
          Loading listing details...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" className="mt-25 mb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <Paper 
          elevation={3} 
          className="p-8 rounded-xl shadow-xl bg-gradient-to-br from-white to-gray-50 border border-gray-100"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Typography 
              variant="h4" 
              className="mb-6 text-center font-bold"
              style={{
                color: "#e53e3e",
                fontWeight: 700,
                marginBottom: "24px",
                letterSpacing: "0.5px"
              }}
            >
              Update Your Listing
            </Typography>
          </motion.div>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <Alert 
                severity="error" 
                className="shadow-lg border-l-4 border-red-500 rounded-lg"
                style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}
              >
                <div className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  <span className="font-medium">{error}</span>
                </div>
              </Alert>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <motion.div whileHover={{ scale: 1.01 }}>
                  <TextField
                    fullWidth
                    label="Title"
                    name="title"
                    value={listing.title || ""}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    className="transition-all duration-300 hover:shadow-md"
                    InputProps={{
                      className: "rounded-lg bg-gray-50"
                    }}
                  />
                </motion.div>
              </Grid>
              
              <Grid item xs={12}>
                <motion.div whileHover={{ scale: 1.01 }}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={listing.description || ""}
                    onChange={handleChange}
                    variant="outlined"
                    multiline
                    rows={4}
                    required
                    className="transition-all duration-300 hover:shadow-md"
                    InputProps={{
                      className: "rounded-lg bg-gray-50"
                    }}
                  />
                </motion.div>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <motion.div whileHover={{ scale: 1.01 }}>
                  <TextField
                    fullWidth
                    label="Price"
                    name="price"
                    type="number"
                    value={listing.price || ""}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    InputProps={{ 
                      className: "rounded-lg bg-gray-50"
                    }}
                    className="transition-all duration-300 hover:shadow-md"
                  />
                </motion.div>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <motion.div whileHover={{ scale: 1.01 }}>
                  <TextField
                    fullWidth
                    select
                    label="Category"
                    name="category"
                    value={listing.category || ""}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    className="transition-all duration-300 hover:shadow-md"
                    InputProps={{
                      className: "rounded-lg bg-gray-50"
                    }}
                  >
                    <MenuItem value="" className="text-gray-400">Select a category</MenuItem>
                    {categories.map((category) => (
                      <MenuItem 
                        key={category} 
                        value={category}
                        className="hover:bg-indigo-50 transition-colors"
                      >
                        {category}
                      </MenuItem>
                    ))}
                  </TextField>
                </motion.div>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <motion.div whileHover={{ scale: 1.01 }}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={listing.location || ""}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    className="transition-all duration-300 hover:shadow-md"
                    InputProps={{
                      className: "rounded-lg bg-gray-50"
                    }}
                  />
                </motion.div>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <motion.div whileHover={{ scale: 1.01 }}>
                  <TextField
                    fullWidth
                    label="Country"
                    name="country"
                    value={listing.country || ""}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    className="transition-all duration-300 hover:shadow-md"
                    InputProps={{
                      className: "rounded-lg bg-gray-50"
                    }}
                  />
                </motion.div>
              </Grid>
              
              <Grid item xs={12} className="mt-2">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-lg text-white font-medium shadow-lg transition-all duration-300 ${
                      isSubmitting 
                        ? 'bg-indigo-400' 
                        : 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <CircularProgress size={20} color="inherit" />
                        </motion.div>
                        Updating...
                      </div>
                    ) : (
                      "Update Listing"
                    )}
                  </Button>
                </motion.div>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </motion.div>
      
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="shadow-lg rounded-xl"
        progressClassName="bg-gradient-to-r from-indigo-500 to-blue-500"
      />
    </Container>
  );
};

export default EditListing;