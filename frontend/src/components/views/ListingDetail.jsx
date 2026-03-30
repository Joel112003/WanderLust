import React, { useEffect, useState, useRef , useCallback  } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { DayPicker } from "react-day-picker";
import { isBefore, addDays, differenceInCalendarDays, format } from "date-fns";
import "react-day-picker/dist/style.css";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Star, Heart, Share2, Wifi, ShieldCheck, Briefcase,
  CalendarCheck, Tag, Sparkles, ChevronDown, Users,
  MapPin, Eye, ImageOff, Loader2, AlertTriangle,
} from "lucide-react";

import Review      from "./Review";
import Map         from "./Map";
import HostSection from "./HostSection";
import RealTimeMessagingWidget from "./RealTimeMessagingWidget";
import ShareButton from "./ShareButton";
import "../../utilis/css/ListingDetail.css";

const API_URL = import.meta?.env?.VITE_APP_API_URL || "http://localhost:8000";

const HIGHLIGHTS = [
  { icon: Briefcase,     title: "Dedicated workspace", desc: "Private room with fast wifi for focused work" },
  { icon: CalendarCheck, title: "Self check-in",       desc: "Easy access with smart lock entry" },
  { icon: Tag,           title: "Free cancellation",   desc: "Full refund if canceled 5+ days before check-in" },
  { icon: Sparkles,      title: "Special offers",      desc: "10 % discount for weekly stays" },
  { icon: ShieldCheck,   title: "Enhanced cleaning",   desc: "Professional cleaning between each stay" },
  { icon: Wifi,          title: "High-speed WiFi",     desc: "100+ Mbps for streaming and video calls" },
];

const fmt = (n) =>
  (n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const hasValidGeometry = (listing) => {
  const c = listing?.geometry?.coordinates;
  return Array.isArray(c) && c.length === 2 && !isNaN(c[0]) && !isNaN(c[1])
    && !(c[0] === 0 && c[1] === 0);
};

const resolveListingCoords = async (listing) => {
  if (hasValidGeometry(listing)) return listing;
  try {
    const q     = encodeURIComponent(`${listing.location ?? ""}, ${listing.country ?? ""}`);
    const token = import.meta.env.VITE_APP_MAPBOX_TOKEN;
    const res   = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?access_token=${token}&limit=1`
    );
    const json  = await res.json();
    const coords = json.features?.[0]?.center;
    if (coords) return { ...listing, geometry: { type: "Point", coordinates: coords } };
  } catch {  }
  return { ...listing, geometry: { type: "Point", coordinates: [78.9629, 20.5937] } };
};

const FullSpinner = () => (
  <div className="ld-center">
    <Loader2 className="ld-spinner" size={36} strokeWidth={1.5} />
  </div>
);

const Banner = ({ variant = "error", children }) => (
  <div className={`ld-banner ld-banner--${variant}`} role="alert">
    <AlertTriangle size={18} />
    <span>{children}</span>
  </div>
);

const Gallery = ({ src, title }) => (
  <div className="ld-gallery">
    <div className="ld-gallery__main">
      {src
        ? <img src={src} alt={title} className="ld-gallery__img" />
        : <div className="ld-gallery__placeholder"><ImageOff size={48} /></div>}
    </div>
    <div className="ld-gallery__side">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="ld-gallery__thumb">
          {src
            ? <img src={src} alt={`View ${i + 1}`} className="ld-gallery__img" />
            : <div className="ld-gallery__placeholder"><ImageOff size={28} /></div>}
        </div>
      ))}
    </div>
  </div>
);

const HighlightCard = ({ Icon, title, desc, delay }) => (
  <motion.div
    className="ld-highlight"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: "easeOut" }}
    whileHover={{ y: -4, boxShadow: "0 10px 28px rgba(0,0,0,0.08)" }}
  >
    <div className="ld-highlight__icon"><Icon size={20} strokeWidth={1.8} /></div>
    <div>
      <p className="ld-highlight__title">{title}</p>
      <p className="ld-highlight__desc">{desc}</p>
    </div>
  </motion.div>
);

const DateField = ({ label, value, onChange, disabledDays, minDate, existingBookings = [], ownerBlockedDates = [] }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const normalizeDate = (dateInput) => {
    const d = new Date(dateInput);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const bookedDatesOnly = disabledDays || [];

  const bookedStartDates = existingBookings.map(b => normalizeDate(b.checkIn));

  const bookedEndDates = existingBookings.map(b => normalizeDate(b.checkOut));

  const bookedMiddleDates = [];
  existingBookings.forEach(booking => {
    const start = normalizeDate(booking.checkIn);
    const end = normalizeDate(booking.checkOut);
    let current = addDays(start, 1);
    while (current < end) {
      bookedMiddleDates.push(normalizeDate(current));
      current = addDays(current, 1);
    }
  });

  const ownerBlockedStartDates = ownerBlockedDates.map(b => normalizeDate(b.from));
  const ownerBlockedEndDates = ownerBlockedDates.map(b => normalizeDate(b.to));
  const ownerBlockedMiddleDates = [];
  ownerBlockedDates.forEach(range => {
    const start = normalizeDate(range.from);
    const end = normalizeDate(range.to);
    let current = addDays(start, 1);
    while (current < end) {
      ownerBlockedMiddleDates.push(normalizeDate(current));
      current = addDays(current, 1);
    }
  });

  const allStartDates = [...bookedStartDates, ...ownerBlockedStartDates];
  const allEndDates = [...bookedEndDates, ...ownerBlockedEndDates];
  const allMiddleDates = [...bookedMiddleDates, ...ownerBlockedMiddleDates];

  const allBookedDates = [...allStartDates, ...allMiddleDates, ...allEndDates];

  console.log('📅 Calendar Debug:', {
    existingBookings: existingBookings.length,
    ownerBlockedRanges: ownerBlockedDates.length,
    totalBookedDates: allBookedDates.length,
    allStartDates: allStartDates.map(d => format(d, 'yyyy-MM-dd')),
    allEndDates: allEndDates.map(d => format(d, 'yyyy-MM-dd')),
    allMiddleDates: allMiddleDates.map(d => format(d, 'yyyy-MM-dd'))
  });

  return (
    <div className="ld-datefield" ref={ref}>
      <button type="button" className="ld-datefield__btn" onClick={() => setOpen((o) => !o)}>
        <span className="ld-datefield__label">{label}</span>
        <span className="ld-datefield__value">
          {value ? format(value, "d MMM yyyy") : "Add date"}
        </span>
        <CalendarCheck size={15} className="ld-datefield__icon" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="ld-datefield__popover"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
          >
            {(existingBookings.length > 0 || ownerBlockedDates.length > 0) && (
              <div style={{ padding: "10px 14px", fontSize: "12.5px", background: "linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)", borderBottom: "2px solid #dc2626", borderRadius: "8px 8px 0 0" }}>
                <div style={{ fontWeight: 700, color: "#dc2626", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "16px" }}>🔴</span> Unavailable Date Ranges:
                </div>
                {existingBookings.map((booking, idx) => (
                  <div key={`booking-${idx}`} style={{ fontSize: "11.5px", color: "#991b1b", fontWeight: 600, padding: "4px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ background: "#dc2626", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "10px" }}>BOOKED</span>
                    <span>{format(new Date(booking.checkIn), "d MMM")} → {format(new Date(booking.checkOut), "d MMM yyyy")}</span>
                  </div>
                ))}
                {ownerBlockedDates.map((range, idx) => (
                  <div key={`blocked-${idx}`} style={{ fontSize: "11.5px", color: "#991b1b", fontWeight: 600, padding: "4px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ background: "#ea580c", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "10px" }}>BLOCKED</span>
                    <span>{format(new Date(range.from), "d MMM")} → {format(new Date(range.to), "d MMM yyyy")}</span>
                  </div>
                ))}
              </div>
            )}
            <DayPicker
              mode="single"
              selected={value}
              onSelect={(d) => { onChange(d); setOpen(false); }}
              disabled={[{ before: minDate || new Date() }, ...bookedDatesOnly]}
              modifiers={{
                booked: allBookedDates,
                bookedStart: allStartDates,
                bookedEnd: allEndDates,
                bookedMiddle: allMiddleDates
              }}
              showOutsideDays
              fixedWeeks
              modifiersClassNames={{
                selected: "rdp-sel",
                today: "rdp-tod",
                booked: "rdp-day-booked",
                bookedStart: "rdp-day-booked-start",
                bookedEnd: "rdp-day-booked-end",
                bookedMiddle: "rdp-day-booked-middle"
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PriceRow = ({ label, value, bold }) => (
  <div className={`ld-price-row${bold ? " ld-price-row--bold" : ""}`}>
    <span>{label}</span>
    <span>₹{fmt(value)}</span>
  </div>
);

const ListingDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [listing,          setListing]          = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);
  const [isWishlisted,     setIsWishlisted]     = useState(false);
  const [checkIn,          setCheckIn]          = useState(null);
  const [checkOut,         setCheckOut]         = useState(null);
  const [guestCount,       setGuestCount]       = useState(1);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [isOwner,          setIsOwner]          = useState(false);
  const [existingBookings, setExistingBookings] = useState([]);
  const [loadingBookings,  setLoadingBookings]  = useState(false);
  const [showBlockDates,   setShowBlockDates]   = useState(false);
  const [blockFrom,        setBlockFrom]        = useState(null);
  const [blockTo,          setBlockTo]          = useState(null);
  const [savingBlock,      setSavingBlock]      = useState(false);

  const { scrollY }    = useScroll();
  const bookingOpacity = useTransform(scrollY, [0, 900, 1400], [1, 1, 0]);

  useEffect(() => {
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      setError("Invalid listing ID");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res    = await fetch(`${API_URL}/listings/${id}`);
        if (!res.ok) throw new Error(`Server error (${res.status})`);
        const result = await res.json();
        if (!result.success || !result.data) throw new Error("Failed to load listing");
        if (!cancelled) {
          const processed = await resolveListingCoords(result.data);
          setListing(processed);
          fetchBookings(processed._id);
          checkIfWishlisted(processed._id);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const checkIfWishlisted = async (listingId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const res = await fetch(`${API_URL}/wishlist/check/${listingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setIsWishlisted(data.isWishlisted || false);
      }
    } catch (err) {
      console.error("Error checking wishlist:", err);
    }
  };

  const toggleWishlist = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please login to save favorites");
        navigate("/auth/login");
        return;
      }

      if (isWishlisted) {
        const res = await fetch(`${API_URL}/wishlist/${listing._id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          setIsWishlisted(false);
          toast.success("Removed from favorites!");
        } else {
          const errorData = await res.json();
          toast.error(errorData.message || "Failed to remove from favorites");
        }
      } else {
        const res = await fetch(`${API_URL}/wishlist`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ listingId: listing._id })
        });

        if (res.ok) {
          setIsWishlisted(true);
          toast.success("Added to favorites!");
        } else {
          const errorData = await res.json();
          toast.error(errorData.message || "Failed to add to favorites");
        }
      }
    } catch (err) {
      console.error("Wishlist error:", err);
      toast.error("Network error. Please check if backend is running.");
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && listing?._id) {
        fetchBookings(listing._id);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [listing?._id]);

  const fetchBookings = async (listingId) => {
    setLoadingBookings(true);
    try {

      const timestamp = Date.now();
      const res  = await fetch(`${API_URL}/bookings/listing/${listingId}?t=${timestamp}`);
      const data = await res.json();

      const allBookings = Array.isArray(data) ? data : [];
      const active = allBookings.filter(
        (b) => ["pending", "paid", "confirmed"].includes(b?.status) && b.checkIn && b.checkOut
      );

      console.log('✅ Found active bookings:', active.length);
      setExistingBookings(active);
    } catch (err) {
      console.error('❌ Error fetching bookings:', err);
      setExistingBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (!listing) return;
    const token = localStorage.getItem("authToken");
    if (!token) return;
    (async () => {
      try {
        const res    = await fetch(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
        const result = await res.json();
        if (result.success && result.data && listing.owner)
          setIsOwner(result.data._id === listing.owner._id);
      } catch {  }
    })();
  }, [listing]);

  const bookingRanges = existingBookings
    .filter((b) => b.checkIn && b.checkOut)
    .map((b) => ({ from: new Date(b.checkIn), to: new Date(b.checkOut), type: 'booking' }));

  const ownerBlockedRanges = (listing?.unavailableDates || [])
    .map((range) => ({ from: new Date(range.from), to: new Date(range.to), type: 'owner-blocked' }));

  const disabledRanges = [...bookingRanges, ...ownerBlockedRanges];

  const isDateBooked = useCallback((date) => {
    const d = new Date(date); d.setHours(12, 0, 0, 0);
    return existingBookings.some((b) => {
      if (!b.checkIn || !b.checkOut) return false;
      const s = new Date(b.checkIn); s.setHours(12);
      const e = new Date(b.checkOut); e.setHours(12);
      return d >= s && d <= e;
    });
  }, [existingBookings]);

  const hasConflict = (start, end) => {
    let cur = new Date(start);
    while (cur <= end) {
      if (isDateBooked(cur)) return true;
      cur = addDays(cur, 1);
    }
    return false;
  };

  const handleBlockDates = async () => {

    if (!blockFrom || !blockTo) {
      return toast.error("⚠️ Please select both start and end dates");
    }
    if (blockTo <= blockFrom) {
      return toast.error("⚠️ End date must be after start date");
    }

    const hasOverlap = existingBookings.some(booking => {
      const bookingStart = new Date(booking.checkIn);
      const bookingEnd = new Date(booking.checkOut);
      return (
        (blockFrom >= bookingStart && blockFrom < bookingEnd) ||
        (blockTo > bookingStart && blockTo <= bookingEnd) ||
        (blockFrom <= bookingStart && blockTo >= bookingEnd)
      );
    });

    if (hasOverlap) {
      return toast.error("⚠️ Cannot block dates that overlap with existing bookings. Cancel those bookings first.", { duration: 5000 });
    }

    setSavingBlock(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Please log in to manage your listing");
      }

      const res = await fetch(`${API_URL}/listings/${listing._id}/unavailable-dates`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          unavailableDates: [
            ...(listing.unavailableDates || []),
            {
              from: blockFrom.toISOString(),
              to: blockTo.toISOString(),
              reason: "maintenance"
            },
          ],
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to block dates");
      }

      const result = await res.json();
      setListing(result.data || result);
      setBlockFrom(null);
      setBlockTo(null);
      setShowBlockDates(false);

      const nights = Math.ceil((blockTo - blockFrom) / (1000 * 60 * 60 * 24));
      toast.success(`✅ Successfully blocked ${nights} day${nights > 1 ? 's' : ''} for maintenance!`, { duration: 4000 });
    } catch (err) {
      console.error('Block dates error:', err);
      toast.error(`❌ ${err.message}`, { duration: 4000 });
    } finally {
      setSavingBlock(false);
    }
  };

  const handleUnblockDate = async (index) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return toast.error("⚠️ Please log in to manage your listing");
    }

    const dateRange = listing.unavailableDates[index];
    if (!dateRange) {
      return toast.error("⚠️ Date range not found");
    }

    const fromDate = format(new Date(dateRange.from), "d MMM yyyy");
    const toDate = format(new Date(dateRange.to), "d MMM yyyy");

    try {
      const updatedDates = listing.unavailableDates.filter((_, i) => i !== index);
      const res = await fetch(`${API_URL}/listings/${listing._id}/unavailable-dates`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ unavailableDates: updatedDates }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to unblock dates");
      }

      const result = await res.json();
      setListing(result.data || result);
      toast.success(`✅ Unblocked dates: ${fromDate} - ${toDate}`, { duration: 3000 });
    } catch (err) {
      console.error('Unblock dates error:', err);
      toast.error(`❌ ${err.message}`, { duration: 4000 });
    }
  };

  const nights      = checkIn && checkOut ? Math.max(0, differenceInCalendarDays(checkOut, checkIn)) : 0;
  const basePrice   = listing?.price || 0;
  const subtotal    = basePrice * nights;
  const cleaningFee = Math.round(basePrice * 0.1);
  const serviceFee  = Math.round(subtotal * 0.15);
  const tax         = Math.round(subtotal * 0.12);
  const totalPrice  = subtotal + cleaningFee + serviceFee + tax;

  const handleReserve = () => {
    if (!checkIn || !checkOut)
      return toast.error("Select check-in and check-out dates");
    if (checkOut <= checkIn)
      return toast.error("Check-out must be after check-in");
    if (hasConflict(checkIn, checkOut))
      return toast.error("❌ These dates are already booked! Please select different dates.", { duration: 4000 });

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Please log in to book");
      setTimeout(() => navigate("/auth/login"), 900);
      return;
    }

    navigate(`/book/${id}`, {
      state: {
        listing,
        checkIn:  checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guests:   guestCount,
        nights,
        basePrice,
        cleaningFee,
        serviceFee,
        tax,
        totalPrice,
      },
    });
  };

  if (loading)  return <FullSpinner />;
  if (error)    return <Banner variant="error">{error}</Banner>;
  if (!listing) return <Banner variant="warn">Listing not found</Banner>;

  const visibleHighlights = showAllAmenities ? HIGHLIGHTS : HIGHLIGHTS.slice(0, 3);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{ style: { fontFamily: "'DM Sans', sans-serif", fontSize: 14 } }}
      />

      <div className="ld-page">

        {}
        <motion.header
          className="ld-header"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <h1 className="ld-title">{listing.title || "Untitled property"}</h1>
          <div className="ld-meta">
            <div className="ld-meta__left">
              <Star size={14} className="ld-star-icon" />
              <span className="ld-meta__val">{listing.reviews?.length || 0}</span>
              <span className="ld-meta__dot">·</span>
              <a href="#reviews" className="ld-meta__link">
                {listing.reviews?.length || 0} reviews
              </a>
              <span className="ld-meta__dot">·</span>
              <MapPin size={13} className="ld-pin-icon" />
              <span>{listing.location}{listing.country ? `, ${listing.country}` : ""}</span>
            </div>
            <div className="ld-meta__actions">
              <ShareButton listing={listing} buttonStyle="button" />
              <button
                className={`ld-action-btn${isWishlisted ? " ld-action-btn--active" : ""}`}
                onClick={toggleWishlist}
              >
                <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} /> Save
              </button>
              {isOwner && (
                <span className="ld-views">
                  <Eye size={14} /> {listing.views || 0} views
                </span>
              )}
            </div>
          </div>
        </motion.header>

        {}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <Gallery src={listing.image?.url} title={listing.title} />
        </motion.div>

        {}
        <div className="ld-body">

          {}
          <div className="ld-main">

            <motion.div
              className="ld-hostbar"
              initial={{ x: -18, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div>
                <h2 className="ld-hostbar__title">
                  Entire {listing.category || "home"} in {listing.location}
                  {listing.country ? `, ${listing.country}` : ""}
                </h2>
                <p className="ld-hostbar__sub">
                  {listing.guests || 1} guests · {listing.bedrooms || 1} bedrooms ·{" "}
                  {listing.beds || 1} beds · {listing.baths || 1} baths
                </p>
              </div>
            </motion.div>

            <section className="ld-section">
              <h3 className="ld-section__title">What this place offers</h3>
              <div className="ld-highlights">
                {visibleHighlights.map(({ icon: Icon, title, desc }, i) => (
                  <HighlightCard key={title} Icon={Icon} title={title} desc={desc} delay={0.05 * i} />
                ))}
              </div>
              {HIGHLIGHTS.length > 3 && (
                <button className="ld-toggle-btn" onClick={() => setShowAllAmenities((s) => !s)}>
                  {showAllAmenities ? "Show fewer" : "Show all amenities"}
                  <ChevronDown
                    size={15}
                    style={{ transform: showAllAmenities ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .25s ease" }}
                  />
                </button>
              )}
            </section>

            <section className="ld-section">
              <h3 className="ld-section__title">About this place</h3>
              <p className="ld-description">{listing.description || "No description available."}</p>
            </section>

            <section id="reviews" className="ld-section">
              <h3 className="ld-section__title">
                Reviews<span className="ld-section__title-line" />
              </h3>
              <Review
                listingId={listing._id}
                onReviewSubmit={() => toast.success("✅ Review submitted!")}
              />
            </section>
          </div>

          {}
          <motion.aside
            className="ld-aside"
            style={{ opacity: bookingOpacity }}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="ld-booking-card">

              <div className="ld-booking-card__header">
                <p className="ld-booking-card__price">
                  ₹{fmt(listing.price)} <span className="ld-booking-card__per">/ night</span>
                </p>
                <div className="ld-booking-card__rating">
                  <Star size={13} className="ld-star-icon" />
                  <span>{listing.reviews?.length || 0} reviews</span>
                </div>
              </div>

              {}
              <div className="ld-dates">
                <DateField
                  label="CHECK-IN"
                  value={checkIn}
                  onChange={setCheckIn}
                  disabledDays={disabledRanges}
                  minDate={new Date()}
                  existingBookings={existingBookings}
                  ownerBlockedDates={listing?.unavailableDates || []}
                />
                <div className="ld-dates__divider" />
                <DateField
                  label="CHECK-OUT"
                  value={checkOut}
                  onChange={setCheckOut}
                  disabledDays={disabledRanges}
                  minDate={checkIn ? addDays(checkIn, 1) : new Date()}
                  existingBookings={existingBookings}
                  ownerBlockedDates={listing?.unavailableDates || []}
                />
              </div>

              {}
              <div className="ld-guests">
                <div className="ld-guests__label">
                  <Users size={14} /><span>GUESTS</span>
                </div>
                <select
                  className="ld-guests__select"
                  value={guestCount}
                  onChange={(e) => setGuestCount(+e.target.value)}
                >
                  {Array.from({ length: listing.maxGuests || 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
                  ))}
                </select>
              </div>

              {}
              {listing?.unavailableDates && listing.unavailableDates.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: "linear-gradient(135deg, #fff5f0 0%, #ffe8dc 100%)",
                    border: "1.5px solid #fdb98e",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    marginTop: "12px",
                    marginBottom: "12px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                    <div style={{
                      background: "#ea580c",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "1px"
                    }}>
                      <span style={{ fontSize: "11px" }}>🔒</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "12px", fontWeight: 700, color: "#9a3412", margin: "0 0 6px" }}>
                        Blocked Dates - Maintenance Period
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {listing.unavailableDates.map((range, idx) => (
                          <div key={idx} style={{
                            fontSize: "11px",
                            color: "#7c2d12",
                            background: "rgba(255,255,255,0.6)",
                            padding: "6px 8px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            <span style={{ fontWeight: 600 }}>📅</span>
                            <span>
                              <strong>From:</strong> {format(new Date(range.from), "d MMM yyyy")}
                              <span style={{ margin: "0 4px" }}>→</span>
                              <strong>To:</strong> {format(new Date(range.to), "d MMM yyyy")}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: "10px", color: "#9a3412", margin: "8px 0 0", fontStyle: "italic" }}>
                        ⚠️ The listing is unavailable during these dates
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {}
              {isOwner && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginBottom: "12px" }}
                >
                  <button
                    className="ld-toggle-btn"
                    onClick={() => setShowBlockDates(!showBlockDates)}
                    style={{ width: "100%", background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)", color: "#fff", border: "none", padding: "10px", fontSize: "13px", fontWeight: 600, marginBottom: showBlockDates ? "12px" : "0" }}
                  >
                    🔒 {showBlockDates ? "Hide" : "Block Dates (Owner)"}
                  </button>

                  {showBlockDates && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      style={{ background: "#fff7ed", border: "2px solid #ea580c", borderRadius: "8px", padding: "12px", marginBottom: "12px" }}
                    >
                      <p style={{ fontSize: "12px", fontWeight: 600, color: "#ea580c", marginBottom: "10px" }}>Block dates when your property is unavailable:</p>

                      <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                        <div style={{ flex: 1 }}>
                          <DateField
                            label="FROM"
                            value={blockFrom}
                            onChange={setBlockFrom}
                            disabledDays={[]}
                            minDate={new Date()}
                            existingBookings={[]}
                            ownerBlockedDates={[]}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <DateField
                            label="TO"
                            value={blockTo}
                            onChange={setBlockTo}
                            disabledDays={[]}
                            minDate={blockFrom ? addDays(blockFrom, 1) : new Date()}
                            existingBookings={[]}
                            ownerBlockedDates={[]}
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleBlockDates}
                        disabled={!blockFrom || !blockTo || savingBlock}
                        style={{
                          width: "100%",
                          background: blockFrom && blockTo ? "#ea580c" : "#d1d5db",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "8px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: blockFrom && blockTo ? "pointer" : "not-allowed",
                        }}
                      >
                        {savingBlock ? "Blocking..." : "🔒 Block These Dates"}
                      </button>

                      {listing?.unavailableDates?.length > 0 && (
                        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #fed7aa" }}>
                          <p style={{ fontSize: "11px", fontWeight: 700, color: "#9a3412", marginBottom: "6px" }}>Currently Blocked:</p>
                          {listing.unavailableDates.map((range, idx) => (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", background: "#ffedd5", borderRadius: "4px", marginBottom: "4px", fontSize: "11px" }}>
                              <span style={{ fontWeight: 600, color: "#9a3412" }}>
                                {format(new Date(range.from), "d MMM yyyy")} → {format(new Date(range.to), "d MMM yyyy")}
                              </span>
                              <button
                                onClick={() => handleUnblockDate(idx)}
                                style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: "4px", padding: "3px 8px", fontSize: "10px", fontWeight: 600, cursor: "pointer" }}
                              >
                                Unblock
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {}
              {loadingBookings ? (
                <div className="ld-avail ld-avail--loading">
                  <Loader2 size={14} className="ld-spin" />
                  Checking availability…
                </div>
              ) : existingBookings.length > 0 ? (
                <div className="ld-avail ld-avail--warn">
                  <AlertTriangle size={14} />
                  <div>
                    <p className="ld-avail__head">⚠️ Already Booked Dates</p>
                    <div className="ld-avail__list">
                      {existingBookings.map((b, i) => (
                        <span key={i} style={{ display: "inline-block", padding: "4px 8px", margin: "2px", background: "#fee2e2", color: "#dc2626", borderRadius: "6px", fontSize: "11px", fontWeight: 600 }}>
                          {format(new Date(b.checkIn), "d MMM")} – {format(new Date(b.checkOut), "d MMM yyyy")}
                        </span>
                      ))}
                    </div>
                    <p className="ld-avail__ok" style={{ marginTop: "8px", color: "#059669", fontWeight: 600 }}>✓ All other dates are available!</p>
                  </div>
                </div>
              ) : (
                <div className="ld-avail ld-avail--ok" style={{ color: "#059669", fontWeight: 600 }}>✓ All dates available for booking</div>
              )}

              {}
              <div className="ld-price-breakdown">
                <AnimatePresence>
                  {checkIn && checkOut && nights > 0 ? (
                    <motion.div
                      key="breakdown"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28 }}
                      style={{ overflow: "hidden" }}
                    >
                      <PriceRow label={`₹${fmt(basePrice)} × ${nights} night${nights > 1 ? "s" : ""}`} value={subtotal} />
                      <PriceRow label="Cleaning fee" value={cleaningFee} />
                      <PriceRow label="Service fee"  value={serviceFee} />
                      <PriceRow label="Tax (12%)"    value={tax} />
                      <div className="ld-price-divider" />
                      <PriceRow label="Total"        value={totalPrice} bold />
                    </motion.div>
                  ) : (
                    <motion.div key="starting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <PriceRow label="Starting from" value={basePrice} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {}
              {checkIn && checkOut && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="ld-booking-summary"
                  style={{
                    background: "linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%)",
                    border: "1px solid #fecaca",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    marginBottom: "12px",
                    fontSize: "13px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <CalendarCheck size={16} style={{ color: "#dc2626", flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, color: "#111" }}>Your Booking Details</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 10px", fontSize: "12.5px" }}>
                    <span style={{ color: "#666", fontWeight: 500 }}>Check-in:</span>
                    <span style={{ color: "#111", fontWeight: 600 }}>{format(checkIn, "EEE, d MMM yyyy")}</span>
                    <span style={{ color: "#666", fontWeight: 500 }}>Check-out:</span>
                    <span style={{ color: "#111", fontWeight: 600 }}>{format(checkOut, "EEE, d MMM yyyy")}</span>
                    <span style={{ color: "#666", fontWeight: 500 }}>Guests:</span>
                    <span style={{ color: "#111", fontWeight: 600 }}>{guestCount} {guestCount === 1 ? "guest" : "guests"}</span>
                    <span style={{ color: "#666", fontWeight: 500 }}>Duration:</span>
                    <span style={{ color: "#dc2626", fontWeight: 700 }}>{nights} {nights === 1 ? "night" : "nights"}</span>
                  </div>
                </motion.div>
              )}

              {}
              <motion.button
                className="ld-reserve-btn"
                onClick={handleReserve}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                disabled={!checkIn || !checkOut}
                style={{
                  opacity: (!checkIn || !checkOut) ? 0.6 : 1,
                  cursor: (!checkIn || !checkOut) ? "not-allowed" : "pointer"
                }}
              >
                {checkIn && checkOut ? "Reserve Now" : "Select Dates to Reserve"}
              </motion.button>

              <p className="ld-booking-card__note">You won't be charged yet</p>
            </div>
          </motion.aside>
        </div>

        {/* ── Map ── */}
        <section className="ld-section ld-map-section">
          <h2 className="ld-section__title ld-section__title--lg">Where you'll be</h2>
          <div className="ld-map-wrap">
            <Map
              listings={[listing]}
              height="420px"
              singleListing
              enableClustering={false}
              defaultZoom={14}
            />
          </div>
        </section>

        {}
        <section className="ld-section">
          <HostSection owner={listing.owner} />
        </section>
      </div>

      {}
      {!isOwner && listing.owner?._id && (
        <RealTimeMessagingWidget
          listingId={listing._id}
          hostId={listing.owner._id}
          hostName={listing.owner.username || listing.owner.name || "Host"}
          currentUserId={getCurrentUserId()}
        />
      )}
    </>
  );
};

function getCurrentUserId() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || payload._id || payload.userId;
  } catch (error) {
    return null;
  }
}

export default ListingDetail;
