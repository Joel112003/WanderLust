import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./AuthContext"; // Correct import path
import App from "./App";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";

import { Analytics } from "@vercel/analytics/react"

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <App /> {/* Wrap your App component with BrowserRouter and AuthProvider */}
      <Analytics/>
    </AuthProvider>
  </BrowserRouter>
);