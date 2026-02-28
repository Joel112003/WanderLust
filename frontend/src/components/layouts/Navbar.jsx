import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import "../../utilis/css/Navbar.css";
import toast, { Toaster } from "react-hot-toast";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext) || {};

  const isAuthenticated = !!localStorage.getItem("authToken");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    localStorage.removeItem("authToken");
    if (logout) logout();
    toast.success("Logged out successfully! See you soon 👋", {
      duration: 2000,
      style: {
        background: "#0F0F0D",
        color: "#fff",
        borderRadius: "12px",
        fontSize: "14px",
      },
      iconTheme: { primary: "#22C55E", secondary: "#fff" },
    });
    setTimeout(() => navigate("/auth/login"), 2000);
  };

  const handleBecomeHost = () => {
    setMenuOpen(false);
    if (isAuthenticated) {
      navigate("/listings/new"); // logged in → go straight to create
    } else {
      navigate("/become-host"); // not logged in → show landing page first
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <div className="navbar-logo">
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
            <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-red-400 to-amber-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
        </div>

        <div className="navbar-user" ref={menuRef}>
          <div
            className="user-menu"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <i
              className={`fa-solid fa-bars menu-icon${menuOpen ? " open" : ""}`}
            />
            <div className="user-icon">
              <b>
                <i className="fa-solid fa-user" />
              </b>
            </div>
          </div>

          <div className={`dropdown-menu${menuOpen ? " show" : ""}`}>
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <i className="fa-solid fa-user-circle mr-2" />
                  Account
                </Link>
                <button className="dropdown-item" onClick={handleBecomeHost}>
                  <i className="fa-solid fa-home mr-2" />
                  WanderLust Your Home
                </button>
                <Link
                  to="/help-center"
                  className="dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <i className="fa-solid fa-question-circle mr-2" />
                  Help Center
                </Link>
                <div className="dropdown-divider" />
                <button
                  onClick={handleLogout}
                  className="dropdown-item logout-button"
                >
                  <i className="fa-solid fa-sign-out-alt mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <i className="fa-solid fa-sign-in-alt mr-2" />
                  Login
                </Link>
                <Link
                  to="/auth/signup"
                  className="dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <i className="fa-solid fa-user-plus mr-2" />
                  Sign Up
                </Link>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={handleBecomeHost}>
                  <i className="fa-solid fa-home mr-2" />
                  WanderLust Your Home
                </button>
                <Link
                  to="/help-center"
                  className="dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <i className="fa-solid fa-question-circle mr-2" />
                  Help Center
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
