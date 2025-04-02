import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../../utilis/css/Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useContext(AuthContext) || {};

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".user-menu") &&
        !event.target.closest(".dropdown-menu")
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (logout) {
      logout();
      navigate("/auth/login");

      toast.success("👋 See you soon! Come back to WanderLust", {
        position: "top-end",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        style: {
          backgroundColor: "#4F46E5",
          borderRadius: "10px",
          fontWeight: "500",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
      });
    } else {
      console.error("Logout function not available.");
      toast.error("Logout failed. Please try again.", {
        position: "top-end",
        autoClose: 3000,
        theme: "colored",
        style: {
          backgroundColor: "#EF4444",
          borderRadius: "10px",
          fontWeight: "500",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
      });
    }
  };

  return (
    <nav className="navbar">
      <ToastContainer
        position="top-end"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        limit={3}
      />

      {/* Brand Logo */}
      <div className="navbar-logo mr-auto">
        <Link
          to="/listings"
          className="brand-text text-2xl font-bold relative group"
          style={{
            background: "linear-gradient(90deg, #e11d48, #f59e0b, #e11d48)",
            backgroundSize: "200% auto",
            color: "transparent",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            animation: "shimmer 3s linear infinite",
          }}
        >
          WanderLust
          <span
            className="absolute left-0 bottom-0 w-full h-0.5 bg-red-400 
      transform scale-x-0 group-hover:scale-x-100 
      transition-transform duration-300 origin-left"
          ></span>
        </Link>

        <style jsx>{`
          @keyframes shimmer {
            0% {
              background-position: 0% center;
            }
            100% {
              background-position: 200% center;
            }
          }
        `}</style>
      </div>

      {/* User Menu */}
      <div className="navbar-user">
        <div className="user-menu" onClick={() => setMenuOpen(!menuOpen)}>
          <i className="fa-solid fa-bars"></i>
          <div className="user-icon">
            <i className="fa-solid fa-user fa-shake"></i>
          </div>
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className={`dropdown-menu ${menuOpen ? "show" : ""}`}>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="dropdown-item">
                  <i className="fa-solid fa-user-circle mr-2"></i>Account
                </Link>
                <Link to="/listings/new" className="dropdown-item">
                  <i className="fa-solid fa-home mr-2"></i>WanderLust Your Home
                </Link>
                <Link to="/help-center" className="dropdown-item">
                  <i className="fa-solid fa-question-circle mr-2"></i>Help
                  Center
                </Link>
                <button
                  onClick={handleLogout}
                  className="dropdown-item logout-button"
                >
                  <i className="fa-solid fa-sign-out-alt mr-2"></i>Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/auth/login" className="dropdown-item">
                  <i className="fa-solid fa-sign-in-alt mr-2"></i>Login
                </Link>
                <Link to="/auth/signup" className="dropdown-item">
                  <i className="fa-solid fa-user-plus mr-2"></i>Sign Up
                </Link>
                <hr />
                <Link to="/listings/new" className="dropdown-item">
                  <i className="fa-solid fa-home mr-2"></i>WanderLust Your Home
                </Link>
                <Link to="/help-center" className="dropdown-item">
                  <i className="fa-solid fa-question-circle mr-2"></i>Help
                  Center
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
