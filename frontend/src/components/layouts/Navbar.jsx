import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import NotificationDropdown from "./NotificationDropdown";
import MessageDropdown from "./MessageDropdown";
import toast from "react-hot-toast";

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

  const handleLogout = async () => {
    setMenuOpen(false);
    if (logout) {
      await logout();
    } else {
      localStorage.removeItem("authToken");
    }
    toast.success("Logged out successfully! See you soon 👋", {
      duration: 2000,
      style: {
        background: "#ffffff",
        color: "#111827",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        fontSize: "14px",
      },
      iconTheme: { primary: "#16a34a", secondary: "#ffffff" },
    });
    setTimeout(() => navigate("/auth/login"), 2000);
  };

  const handleBecomeHost = () => {
    setMenuOpen(false);
    if (isAuthenticated) {
      navigate("/listings/new");
    } else {
      navigate("/become-host");
    }
  };

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-[1000] flex items-center justify-between gap-3 border-b border-gray-200 px-4 md:px-6 backdrop-blur-xl transition-all duration-300 ${
        scrolled
          ? "h-[58px] bg-white/95 shadow-[0_2px_14px_rgba(17,24,39,0.08)]"
          : "h-[68px] bg-white/90 shadow-[0_1px_10px_rgba(17,24,39,0.05)]"
      }`}
    >
      <div className="mr-auto">
        <Link
          to="/listings"
          className="group relative inline-flex items-center gap-1.5 text-xl font-extrabold text-red-600 sm:text-[1.35rem]"
        >
          WanderLust
          <span className="absolute -bottom-0.5 left-0 h-0.5 w-full origin-left scale-x-0 bg-red-600 transition-transform duration-300 group-hover:scale-x-100" />
        </Link>
      </div>

      <div className="flex items-center gap-3">
          {isAuthenticated && (
            <>
              <MessageDropdown />
              <NotificationDropdown />
            </>
          )}

          <div className="relative" ref={menuRef}>
            <div
              className={`flex cursor-pointer items-center gap-2.5 rounded-full border border-stone-300 bg-white px-2 py-1.5 pl-3.5 transition-all duration-200 active:scale-95 ${
                menuOpen
                  ? "border-red-300 shadow-[0_4px_16px_rgba(17,24,39,0.10)] -translate-y-0.5"
                  : "hover:-translate-y-0.5 hover:border-red-300 hover:shadow-[0_4px_16px_rgba(17,24,39,0.10)]"
              }`}
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <i
                className={`fa-solid fa-bars text-sm text-stone-600 transition-transform duration-200 ${menuOpen ? "rotate-90" : ""}`}
              />
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-stone-100 text-[13px] text-stone-600">
                <b>
                  <i className="fa-solid fa-user" />
                </b>
              </div>
            </div>

            <div
              className={`absolute right-0 top-[calc(100%+10px)] z-[1001] w-[min(88vw,280px)] origin-top-right overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_10px_28px_rgba(28,25,23,0.14)] transition-all duration-200 sm:w-[260px] ${
                menuOpen
                  ? "pointer-events-auto visible translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none invisible translate-y-2 scale-[0.98] opacity-0"
              }`}
            >
              {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-[13.5px] text-neutral-800 transition-all duration-150 hover:bg-gray-50 hover:pl-5"
                  onClick={() => setMenuOpen(false)}
                >
                  <i className="fa-solid fa-user-circle mr-2 w-[18px] text-[15px] text-neutral-500" />
                  Account
                </Link>
                <button
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-[13.5px] text-neutral-800 transition-all duration-150 hover:bg-gray-50 hover:pl-5"
                  onClick={handleBecomeHost}
                >
                  <i className="fa-solid fa-home mr-2 w-[18px] text-[15px] text-neutral-500" />
                  WanderLust Your Home
                </button>
                <Link
                  to="/help-center"
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-[13.5px] text-neutral-800 transition-all duration-150 hover:bg-gray-50 hover:pl-5"
                  onClick={() => setMenuOpen(false)}
                >
                  <i className="fa-solid fa-question-circle mr-2 w-[18px] text-[15px] text-neutral-500" />
                  Help Center
                </Link>
                <div className="mx-4 my-1 h-px bg-black/10" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-[13.5px] text-neutral-700 transition-all duration-150 hover:bg-red-50 hover:pl-5 hover:text-red-600"
                >
                  <i className="fa-solid fa-sign-out-alt mr-2 w-[18px] text-[15px] text-neutral-500" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-[13.5px] text-neutral-800 transition-all duration-150 hover:bg-gray-50 hover:pl-5"
                  onClick={() => setMenuOpen(false)}
                >
                  <i className="fa-solid fa-sign-in-alt mr-2 w-[18px] text-[15px] text-neutral-500" />
                  Login
                </Link>
                <Link
                  to="/auth/signup"
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-[13.5px] text-neutral-800 transition-all duration-150 hover:bg-gray-50 hover:pl-5"
                  onClick={() => setMenuOpen(false)}
                >
                  <i className="fa-solid fa-user-plus mr-2 w-[18px] text-[15px] text-neutral-500" />
                  Sign Up
                </Link>
                <div className="mx-4 my-1 h-px bg-black/10" />
                <button
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-[13.5px] text-neutral-800 transition-all duration-150 hover:bg-gray-50 hover:pl-5"
                  onClick={handleBecomeHost}
                >
                  <i className="fa-solid fa-home mr-2 w-[18px] text-[15px] text-neutral-500" />
                  WanderLust Your Home
                </button>
                <Link
                  to="/help-center"
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-[13.5px] text-neutral-800 transition-all duration-150 hover:bg-gray-50 hover:pl-5"
                  onClick={() => setMenuOpen(false)}
                >
                  <i className="fa-solid fa-question-circle mr-2 w-[18px] text-[15px] text-neutral-500" />
                  Help Center
                </Link>
              </>
              )}
            </div>
          </div>
      </div>
    </nav>
  );
};

export default Navbar;
