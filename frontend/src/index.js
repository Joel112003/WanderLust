import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./AuthContext"; // Correct import path
import App from "./App";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
// Import all CSS files
import "./utilis/css/Listing.css";
import "./utilis/css/ListingDetail.css";
import "./utilis/css/ListingDetails.css";
import "./utilis/css/Review.css";
import "./utilis/css/Map.css";
import "./utilis/css/Navbar.css";
import "./utilis/css/CreateListing.css";
import "./utilis/css/ProfileMenu.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <App /> {/* Wrap your App component with BrowserRouter and AuthProvider */}
    </AuthProvider>
  </BrowserRouter>
);