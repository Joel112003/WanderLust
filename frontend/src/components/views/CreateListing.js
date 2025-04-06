import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Snackbar,
  Card,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import { gsap } from "gsap";
import { Add, Image as ImageIcon, Close } from "@mui/icons-material";
import Confetti from "react-confetti";
import axios from "axios";



const CreateListing = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const titleRef = useRef(null);
  const formFieldsRef = useRef([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    country: "",
    location: "",
    category: "",
    guests: 1,
    bedrooms: 1,
    beds: 1,
    baths: 1,
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Animation effects
  useEffect(() => {
    gsap.from(formRef.current, {
      opacity: 0,
      y: 60,
      duration: 1,
      ease: "power3.out",
    });
    gsap.from(titleRef.current, {
      opacity: 0,
      y: -30,
      duration: 0.8,
      delay: 0.4,
      ease: "elastic.out(1, 0.5)",
    });

    formFieldsRef.current.forEach((ref, index) => {
      gsap.from(ref.el, {
        opacity: 0,
        x: -20,
        duration: 0.5,
        delay: 0.6 + index * 0.15,
        ease: "power2.out",
      });
    });
  }, []);

  useEffect(() => {
    gsap.to(".drag-area", {
      scale: isDragging ? 1.03 : 1,
      backgroundColor: isDragging
        ? "rgba(219, 234, 254, 0.8)"
        : "rgba(243, 244, 246, 0.7)",
      borderColor: isDragging ? "#3b82f6" : "#d1d5db",
      duration: 0.3,
      ease: "power2.out",
    });
  }, [isDragging]);

  const handleFileUpload = (files) => {
    if (!files?.length) return;

    const file = files[0];
    const validTypes = ["image/jpeg", "image/png", "image/gif"];

    if (!validTypes.includes(file.type)) {
      setFormErrors((prev) => ({
        ...prev,
        image: "Please upload a valid image file (JPEG, PNG, or GIF)",
      }));
      gsap.to(".drag-area", {
        x: [-5, 5, -5, 5, 0],
        duration: 0.4,
        ease: "power1.inOut",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        image: "Image size exceeds 5MB limit",
      }));
      gsap.to(".drag-area", {
        x: [-5, 5, -5, 5, 0],
        duration: 0.4,
        ease: "power1.inOut",
      });
      return;
    }

    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
    setFormErrors((prev) => ({ ...prev, image: "" }));
    gsap.from(".image-preview", {
      scale: 0.7,
      opacity: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.5)",
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));

    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      gsap.to(e.target, {
        scale: 1.02,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    if (!selectedImage) errors.image = "An image is required";
    if (!formData.price || isNaN(Number(formData.price)))
      errors.price = "Valid price is required";
    if (!formData.country.trim()) errors.country = "Country is required";
    if (!formData.location.trim()) errors.location = "Location is required";
    if (!formData.category) errors.category = "Category is required";
    if (!formData.guests || formData.guests < 1)
      errors.guests = "Must accommodate at least 1 guest";
    if (!formData.bedrooms || formData.bedrooms < 1)
      errors.bedrooms = "Must have at least 1 bedroom";
    if (!formData.beds || formData.beds < 1)
      errors.beds = "Must have at least 1 bed";
    if (!formData.baths || formData.baths < 1)
      errors.baths = "Must have at least 1 bath";
    return errors;
  };

  // New function to geocode address to coordinates
  const geocodeAddress = async (location, country) => {
    try {
      const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;
      const query = encodeURIComponent(`${location}, ${country}`);
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${mapboxToken}&limit=1`
      );
  
      if (response.data.features && response.data.features.length > 0) {
        const [longitude, latitude] = response.data.features[0].center;
        return {
          latitude,
          longitude,
          geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
        };
      }
      throw new Error("Location not found");
    } catch (error) {
      console.error("Geocoding error:", error);
      throw new Error("Failed to convert address to coordinates");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate price is a number
    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue)) {
      setFormErrors({ ...formErrors, price: "Please enter a valid price" });
      return;
    }

    // Format price to 2 decimal places
    const formattedPrice = priceValue.toFixed(2);

    // Validate all required fields
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // First get coordinates from the location and country
      const geoData = await geocodeAddress(
        formData.location,
        formData.country
      ).catch((error) => {
        // If geocoding fails, set default coordinates (you can adjust these)
        console.warn(
          "Geocoding failed, using default coordinates:",
          error.message
        );
        return {
          latitude: 20.5937,
          longitude: 78.9629,
          geometry: {
            type: "Point",
            coordinates: [78.9629, 20.5937], // Default to center of India
          },
        };
      });

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formattedPrice);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("guests", formData.guests);
      formDataToSend.append("bedrooms", formData.bedrooms);
      formDataToSend.append("beds", formData.beds);
      formDataToSend.append("baths", formData.baths);
      // Add coordinates
    formDataToSend.append("longitude", geoData.longitude);
    formDataToSend.append("latitude", geoData.latitude);
    // Add geometry as JSON string
    formDataToSend.append("geometry", JSON.stringify(geoData.geometry));

      // Add geometry as JSON string
      formDataToSend.append("geometry", JSON.stringify(geoData.geometry));

      if (selectedImage) {
        formDataToSend.append("image", selectedImage);
      }

      const token = localStorage.getItem("token");
      console.log("Token available:", !!token);

      // Use axios instead of fetch for better FormData handling
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/listings`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type for FormData
          },
        }
      );
      console.log(`API URL: ${process.env.REACT_APP_API_URL}/listings`);
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(response.data.error || "Failed to create listing");
      }

      const data = response.data;
      console.log("Listing created:", data);

      setSnackbarMessage("Listing created successfully!");
      setIsSnackbarOpen(true);
      setShowConfetti(true);

      setTimeout(() => {
        navigate("/listings");
      }, 2000);
    } catch (error) {
      console.error(
        "Error details:",
        error.response?.data || error.message || error
      );
      setSnackbarMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to create listing"
      );
      setIsSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);

  const addToRefs = (el, name) => {
    if (el && !formFieldsRef.current.some((ref) => ref.name === name)) {
      formFieldsRef.current.push({ el, name });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12  mt-20">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          gravity={0.2}
          colors={["#3b82f6", "#4f46e5", "#8b5cf6", "#ec4899", "#06b6d4"]}
        />
      )}

      <Card
        ref={formRef}
        className={`w-full max-w-2xl shadow-2xl rounded-2xl bg-white backdrop-blur-sm bg-opacity-95 transition-all duration-300 ${
          isDragging
            ? "border-2 border-blue-500 border-dashed"
            : "border border-gray-200"
        }`}
        onDragOver={handleDrag}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <div className="bg-gradient-to-r from-white-600 to-white-600 px-8 py-6 rounded-t-2xl">
          <Typography
            ref={titleRef}
            variant="h4"
            className="text-center text-black font-bold"
          >
            Create New Listing
          </Typography>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="mb-10">
            <TextField
              ref={(el) => addToRefs(el, "title")}
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.title}
              helperText={formErrors.title}
              sx={{ marginBottom: "5px" }}
            />
          </div>

          <div className="mb-12">
            <TextField
              ref={(el) => addToRefs(el, "description")}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              error={!!formErrors.description}
              helperText={formErrors.description}
              className="mb-6"
              sx={{
                marginBottom: "5px",
              }}
            />
          </div>

          <div
            className={`drag-area p-6 border-2 rounded-xl transition-all duration-300 mb-8 ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-dashed border-gray-300 bg-gray-50"
            }`}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif"
              name="image"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="image-upload"
              ref={fileInputRef}
            />

            <div className="flex flex-col items-center justify-center space-y-4">
              {!previewImage ? (
                <>
                  <div className="text-blue-500 text-5xl mb-2">
                    <ImageIcon style={{ fontSize: 48 }} />
                  </div>
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center space-x-2 cursor-pointer bg-white px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200"
                  >
                    <span className="font-medium text-gray-700">
                      Upload Image
                    </span>
                  </label>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Drag and drop an image here, or click to select a file (max
                    5MB)
                  </p>
                </>
              ) : (
                <Box
                  mt={2}
                  position="relative"
                  display="flex"
                  justifyContent="center"
                  className="image-preview"
                >
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="h-48 w-auto object-cover rounded-xl shadow-md border border-gray-200"
                    />
                    <IconButton
                      size="small"
                      style={{
                        position: "absolute",
                        top: -12,
                        right: -12,
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                      onClick={() => {
                        setSelectedImage(null);
                        setPreviewImage(null);
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </div>
                </Box>
              )}
            </div>

            {formErrors.image && (
              <p className="text-red-500 text-sm mt-4 text-center">
                {formErrors.image}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <TextField
              ref={(el) => addToRefs(el, "price")}
              label="Price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              type="number"
              fullWidth
              error={!!formErrors.price}
              helperText={formErrors.price}
            />

            <TextField
              ref={(el) => addToRefs(el, "country")}
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.country}
              helperText={formErrors.country}
            />
          </div>

          <div className="mb-8">
            <TextField
              ref={(el) => addToRefs(el, "location")}
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.location}
              helperText={formErrors.location}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <TextField
              label="Guests"
              name="guests"
              type="number"
              value={formData.guests}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.guests}
              helperText={formErrors.guests}
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Bedrooms"
              name="bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.bedrooms}
              helperText={formErrors.bedrooms}
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Beds"
              name="beds"
              type="number"
              value={formData.beds}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.beds}
              helperText={formErrors.beds}
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Baths"
              name="baths"
              type="number"
              value={formData.baths}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.baths}
              helperText={formErrors.baths}
              inputProps={{ min: 1 }}
            />
          </div>

          <div className="mb-10">
            <Select
              ref={(el) => addToRefs(el, "category")}
              name="category"
              value={formData.category}
              onChange={handleChange}
              fullWidth
              displayEmpty
              error={!!formErrors.category}
              renderValue={(value) => value || "Select a category"}
              className="bg-white"
            >
              <MenuItem value="" disabled>
                Select a category
              </MenuItem>
              {[
                "Mansion",
                "Farm",
                "Lake",
                "Beach",
                "Apartment",
                "Ski Resort",
                "Camping",
                "Cottage",
                "Luxury",
              ].map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
            {formErrors.category && (
              <p className="text-red-500 text-sm mt-2">{formErrors.category}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={
              isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Add />
              )
            }
            fullWidth
            disabled={isSubmitting}
            className="py-4 mt-6 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            sx={{
              background: "linear-gradient(90deg, #3b82f6 0%, #4f46e5 100%)",
              "&:hover": {
                background: "linear-gradient(90deg, #2563eb 0%, #4338ca 100%)",
              },
            }}
          >
            {isSubmitting ? "Creating..." : "Create Listing"}
          </Button>
        </form>
      </Card>

      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={4000}
        message={snackbarMessage}
        onClose={() => setIsSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setIsSnackbarOpen(false)}
          >
            <Close fontSize="small" />
          </IconButton>
        }
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: snackbarMessage.includes("successfully")
              ? "#10b981"
              : "#ef4444",
          },
        }}
      />
    </div>
  );
};

export default CreateListing;
