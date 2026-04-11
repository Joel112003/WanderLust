import React, { useEffect, useState, useRef , useCallback  } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
  <div className="flex min-h-screen items-center justify-center">
    <Loader2 className="h-9 w-9 animate-spin text-red-600" size={36} strokeWidth={1.5} />
  </div>
);

const Banner = ({ variant = "error", children }) => (
  <div
    className={`mx-auto my-6 flex max-w-xl items-center gap-2.5 rounded-xl px-5 py-4 text-sm ${
      variant === "error"
        ? "border-l-4 border-red-600 bg-red-50 text-red-700"
        : "border-l-4 border-amber-600 bg-amber-50 text-amber-700"
    }`}
    role="alert"
  >
    <AlertTriangle size={18} />
    <span>{children}</span>
  </div>
);

const Gallery = ({ src, title }) => (
  <div className="mb-9 grid h-[clamp(260px,40vw,440px)] grid-cols-1 gap-1.5 overflow-hidden rounded-2xl sm:grid-cols-2">
    <div className="overflow-hidden">
      {src
        ? <img src={src} alt={title} className="block h-full w-full object-cover transition duration-500 ease-out hover:scale-105" />
        : <div className="flex h-full w-full items-center justify-center bg-stone-100 text-zinc-400"><ImageOff size={48} /></div>}
    </div>
    <div className="hidden grid-cols-2 grid-rows-2 gap-1.5 sm:grid">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="overflow-hidden">
          {src
            ? <img src={src} alt={`View ${i + 1}`} className="block h-full w-full object-cover transition duration-500 ease-out hover:scale-105" />
            : <div className="flex h-full w-full items-center justify-center bg-stone-100 text-zinc-400"><ImageOff size={28} /></div>}
        </div>
      ))}
    </div>
  </div>
);

const HighlightCard = ({ Icon, title, desc, delay }) => (
  <motion.div
    className="flex cursor-default items-start gap-3 rounded-xl border border-stone-100 bg-stone-50 px-4 py-3.5"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: "easeOut" }}
    whileHover={{ y: -4, boxShadow: "0 10px 28px rgba(0,0,0,0.08)" }}
  >
    <div className="flex rounded-lg bg-red-50 p-1.5 text-red-600"><Icon size={20} strokeWidth={1.8} /></div>
    <div>
      <p className="mb-0.5 text-[13.5px] font-semibold text-zinc-900">{title}</p>
      <p className="text-xs leading-relaxed text-zinc-500">{desc}</p>
    </div>
  </motion.div>
);

const DateField = ({ label, value, onChange, disabledDays, minDate, align = "start", existingBookings = [], ownerBlockedDates = [] }) => {
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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex w-full flex-col items-start gap-0.5 rounded-[inherit] px-3.5 py-3 text-left transition hover:bg-red-50"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-[10px] font-semibold tracking-[0.08em] text-zinc-500">{label}</span>
        <span className="text-[13.5px] font-medium text-zinc-900">
          {value ? format(value, "d MMM yyyy") : "Add date"}
        </span>
        <CalendarCheck size={15} className="mt-0.5 text-zinc-400" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className={`absolute top-[calc(100%+8px)] z-[200] max-h-[min(70vh,520px)] w-[min(92vw,360px)] max-w-[360px] overflow-auto rounded-2xl border border-stone-200 bg-white p-2.5 shadow-2xl ${
              align === "start" ? "left-0" : "right-0"
            } max-sm:fixed max-sm:left-1/2 max-sm:top-1/2 max-sm:z-[1001] max-sm:max-h-[82vh] max-sm:w-[min(94vw,360px)] max-sm:-translate-x-1/2 max-sm:-translate-y-1/2`}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
          >
            {(existingBookings.length > 0 || ownerBlockedDates.length > 0) && (
              <div className="rounded-t-lg border-b-2 border-red-600 bg-gradient-to-br from-red-100 to-red-50 px-3.5 py-2.5 text-xs">
                <div className="mb-1.5 flex items-center gap-1.5 font-bold text-red-600">
                  <span className="text-base">🔴</span> Unavailable Date Ranges:
                </div>
                {existingBookings.map((booking, idx) => (
                  <div key={`booking-${idx}`} className="flex items-center gap-1.5 py-1 text-[11.5px] font-semibold text-red-800">
                    <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] text-white">BOOKED</span>
                    <span>{format(new Date(booking.checkIn), "d MMM")} → {format(new Date(booking.checkOut), "d MMM yyyy")}</span>
                  </div>
                ))}
                {ownerBlockedDates.map((range, idx) => (
                  <div key={`blocked-${idx}`} className="flex items-center gap-1.5 py-1 text-[11.5px] font-semibold text-red-800">
                    <span className="rounded bg-orange-600 px-1.5 py-0.5 text-[10px] text-white">BLOCKED</span>
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
              modifiersStyles={{
                booked: {
                  backgroundColor: "#fee2e2",
                  color: "#991b1b",
                  border: "2px solid #f87171",
                  borderRadius: "6px",
                  fontWeight: 700,
                },
                bookedStart: {
                  background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                  color: "#fff",
                  border: "2px solid #991b1b",
                  borderRadius: "999px 8px 8px 999px",
                  fontWeight: 800,
                },
                bookedEnd: {
                  background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                  color: "#fff",
                  border: "2px solid #991b1b",
                  borderRadius: "8px 999px 999px 8px",
                  fontWeight: 800,
                },
                bookedMiddle: {
                  background: "linear-gradient(90deg, #fecaca 0%, #fca5a5 50%, #fecaca 100%)",
                  color: "#7f1d1d",
                  borderTop: "2px solid #dc2626",
                  borderBottom: "2px solid #dc2626",
                  borderLeft: "1px solid #f87171",
                  borderRight: "1px solid #f87171",
                  borderRadius: "4px",
                  fontWeight: 700,
                },
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PriceRow = ({ label, value, bold }) => (
  <div className={`flex items-center justify-between py-1 text-[13.5px] ${bold ? "pt-2 text-base font-bold text-zinc-900" : "text-zinc-600"}`}>
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

      <div className="mx-auto max-w-[1160px] px-4 pb-20 pt-[clamp(72px,10vw,100px)] font-sans sm:px-6 lg:px-10">
<motion.header
          className="mb-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <h1 className="mb-3.5 font-serif text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-tight text-zinc-950">{listing.title || "Untitled property"}</h1>
          <div className="flex flex-wrap items-start justify-between gap-2.5 max-sm:flex-col">
            <div className="flex flex-wrap items-center gap-1.5 text-[13.5px] text-zinc-700">
              <Star size={14} className="shrink-0 text-red-600" />
              <span className="font-semibold">{listing.reviews?.length || 0}</span>
              <span className="text-zinc-300">·</span>
              <a href="#reviews" className="cursor-pointer font-semibold text-zinc-950 underline transition hover:text-red-600">
                {listing.reviews?.length || 0} reviews
              </a>
              <span className="text-zinc-300">·</span>
              <MapPin size={13} className="shrink-0 text-zinc-400" />
              <span>{listing.location}{listing.country ? `, ${listing.country}` : ""}</span>
            </div>
            <div className="flex items-center gap-3.5">
              <ShareButton listing={listing} buttonStyle="button" />
              <button
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition ${isWishlisted ? "text-red-600" : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"}`}
                onClick={toggleWishlist}
              >
                <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} /> Save
              </button>
              {isOwner && (
                <span className="flex items-center gap-1.5 text-[13px] text-zinc-500">
                  <Eye size={14} /> {listing.views || 0} views
                </span>
              )}
            </div>
          </div>
        </motion.header>
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <Gallery src={listing.image?.url} title={listing.title} />
        </motion.div>
<div className="grid items-start gap-14 lg:grid-cols-[minmax(0,1fr)_380px] max-lg:gap-10">
<div>

            <motion.div
              className="mb-7 border-b border-zinc-200 pb-6"
              initial={{ x: -18, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div>
                <h2 className="mb-1.5 font-serif text-xl font-semibold text-zinc-950">
                  Entire {listing.category || "home"} in {listing.location}
                  {listing.country ? `, ${listing.country}` : ""}
                </h2>
                <p className="text-sm text-zinc-500">
                  {listing.guests || 1} guests · {listing.bedrooms || 1} bedrooms ·{" "}
                  {listing.beds || 1} beds · {listing.baths || 1} baths
                </p>
              </div>
            </motion.div>

            <section className="mb-8 border-b border-zinc-200 pb-8">
              <h3 className="mb-5 inline-block font-serif text-lg font-semibold text-zinc-950">What this place offers</h3>
              <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
                {visibleHighlights.map(({ icon: Icon, title, desc }, i) => (
                  <HighlightCard key={title} Icon={Icon} title={title} desc={desc} delay={0.05 * i} />
                ))}
              </div>
              {HIGHLIGHTS.length > 3 && (
                <button
                  className="mt-1 flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-[13px] font-semibold text-zinc-950 transition hover:border-zinc-400 hover:bg-zinc-50"
                  onClick={() => setShowAllAmenities((s) => !s)}
                >
                  {showAllAmenities ? "Show fewer" : "Show all amenities"}
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${showAllAmenities ? "rotate-180" : "rotate-0"}`}
                  />
                </button>
              )}
            </section>

            <section className="mb-8 border-b border-zinc-200 pb-8">
              <h3 className="mb-5 inline-block font-serif text-lg font-semibold text-zinc-950">About this place</h3>
              <p className="m-0 whitespace-pre-line text-[14.5px] leading-7 text-zinc-600">{listing.description || "No description available."}</p>
            </section>

            <section id="reviews" className="mb-8 border-b border-zinc-200 pb-8">
              <h3 className="relative mb-5 inline-block font-serif text-lg font-semibold text-zinc-950 after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:rounded after:bg-gradient-to-r after:from-red-600 after:to-orange-300 after:content-['']">
                Reviews
              </h3>
              <Review
                listingId={listing._id}
                onReviewSubmit={() => toast.success("✅ Review submitted!")}
              />
            </section>
          </div>
<motion.aside
            className="sticky top-24"
            style={{ opacity: bookingOpacity }}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)] max-sm:rounded-xl max-sm:p-4">

              <div className="mb-5 flex items-center justify-between">
                <p className="m-0 font-serif text-[1.3rem] font-bold text-zinc-950 max-[420px]:text-[1.12rem]">
                  ₹{fmt(listing.price)} <span className="text-[0.85rem] font-normal text-zinc-400">/ night</span>
                </p>
                <div className="flex items-center gap-1 text-[13px] font-medium text-zinc-600">
                  <Star size={13} className="text-red-600" />
                  <span>{listing.reviews?.length || 0} reviews</span>
                </div>
              </div>
<div className="mb-3.5 grid items-stretch overflow-visible rounded-xl border-[1.5px] border-stone-300 sm:grid-cols-[1fr_auto_1fr]">
                <DateField
                  label="CHECK-IN"
                  value={checkIn}
                  onChange={setCheckIn}
                  align="start"
                  disabledDays={disabledRanges}
                  minDate={new Date()}
                  existingBookings={existingBookings}
                  ownerBlockedDates={listing?.unavailableDates || []}
                />
                <div className="h-px w-full bg-stone-300 sm:h-auto sm:w-px" />
                <DateField
                  label="CHECK-OUT"
                  value={checkOut}
                  onChange={setCheckOut}
                  align="end"
                  disabledDays={disabledRanges}
                  minDate={checkIn ? addDays(checkIn, 1) : new Date()}
                  existingBookings={existingBookings}
                  ownerBlockedDates={listing?.unavailableDates || []}
                />
              </div>
<div className="mb-4 flex items-center justify-between rounded-xl border-[1.5px] border-stone-300 px-3.5 py-2.5 max-sm:mb-3">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.08em] text-zinc-500">
                  <Users size={14} /><span>GUESTS</span>
                </div>
                <select
                  className="max-w-full cursor-pointer border-none bg-transparent text-right text-[13.5px] font-medium text-zinc-900 outline-none"
                  value={guestCount}
                  onChange={(e) => setGuestCount(+e.target.value)}
                >
                  {Array.from({ length: listing.maxGuests || 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
                  ))}
                </select>
              </div>
{listing?.unavailableDates && listing.unavailableDates.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="my-3 rounded-[10px] border-[1.5px] border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 px-3.5 py-3"
                >
                  <div className="mb-2 flex items-start gap-2">
                    <div className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-600">
                      <span className="text-[11px]">🔒</span>
                    </div>
                    <div className="flex-1">
                      <p className="mb-1.5 text-xs font-bold text-orange-800">
                        Blocked Dates - Maintenance Period
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {listing.unavailableDates.map((range, idx) => (
                          <div key={idx} className="flex items-center gap-1 rounded-md bg-white/60 px-2 py-1.5 text-[11px] text-orange-900">
                            <span className="font-semibold">📅</span>
                            <span>
                              <strong>From:</strong> {format(new Date(range.from), "d MMM yyyy")}
                              <span className="mx-1">→</span>
                              <strong>To:</strong> {format(new Date(range.to), "d MMM yyyy")}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-[10px] italic text-orange-800">
                        ⚠️ The listing is unavailable during these dates
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
{isOwner && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3"
                >
                  <button
                    onClick={() => setShowBlockDates(!showBlockDates)}
                    className={`w-full rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:brightness-105 ${showBlockDates ? "mb-3" : "mb-0"}`}
                  >
                    🔒 {showBlockDates ? "Hide" : "Block Dates (Owner)"}
                  </button>

                  {showBlockDates && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mb-3 rounded-lg border-2 border-orange-600 bg-orange-50 p-3"
                    >
                      <p className="mb-2.5 text-xs font-semibold text-orange-600">Block dates when your property is unavailable:</p>

                      <div className="mb-2.5 flex gap-2">
                        <div className="flex-1">
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
                        <div className="flex-1">
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
                        className={`w-full rounded-md px-3 py-2 text-[13px] font-semibold text-white ${blockFrom && blockTo ? "cursor-pointer bg-orange-600 hover:bg-orange-700" : "cursor-not-allowed bg-zinc-300"}`}
                      >
                        {savingBlock ? "Blocking..." : "🔒 Block These Dates"}
                      </button>

                      {listing?.unavailableDates?.length > 0 && (
                        <div className="mt-3 border-t border-orange-200 pt-3">
                          <p className="mb-1.5 text-[11px] font-bold text-orange-800">Currently Blocked:</p>
                          {listing.unavailableDates.map((range, idx) => (
                            <div key={idx} className="mb-1 flex items-center justify-between rounded bg-orange-100 px-2 py-1.5 text-[11px]">
                              <span className="font-semibold text-orange-800">
                                {format(new Date(range.from), "d MMM yyyy")} → {format(new Date(range.to), "d MMM yyyy")}
                              </span>
                              <button
                                onClick={() => handleUnblockDate(idx)}
                                className="cursor-pointer rounded bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-red-700"
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
{loadingBookings ? (
                <div className="mb-4 flex items-start gap-2 rounded-[10px] bg-zinc-50 px-3 py-2.5 text-[12.5px] leading-relaxed text-zinc-500">
                  <Loader2 size={14} className="animate-spin" />
                  Checking availability…
                </div>
              ) : existingBookings.length > 0 ? (
                <div className="mb-4 flex items-start gap-2 rounded-[10px] bg-amber-50 px-3 py-2.5 text-[12.5px] leading-relaxed text-amber-800">
                  <AlertTriangle size={14} />
                  <div>
                    <p className="mb-1 font-semibold">⚠️ Already Booked Dates</p>
                    <div className="flex flex-col gap-0.5 text-[11.5px] opacity-80">
                      {existingBookings.map((b, i) => (
                        <span key={i} className="my-0.5 inline-block rounded-md bg-red-100 px-2 py-1 text-[11px] font-semibold text-red-600">
                          {format(new Date(b.checkIn), "d MMM")} – {format(new Date(b.checkOut), "d MMM yyyy")}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-[11.5px] font-semibold text-emerald-600">✓ All other dates are available!</p>
                  </div>
                </div>
              ) : (
                <div className="mb-4 flex items-start gap-2 rounded-[10px] bg-emerald-50 px-3 py-2.5 text-[12.5px] font-semibold leading-relaxed text-emerald-700">✓ All dates available for booking</div>
              )}
<div className="mb-4">
                <AnimatePresence>
                  {checkIn && checkOut && nights > 0 ? (
                    <motion.div
                      key="breakdown"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28 }}
                      className="overflow-hidden"
                    >
                      <PriceRow label={`₹${fmt(basePrice)} × ${nights} night${nights > 1 ? "s" : ""}`} value={subtotal} />
                      <PriceRow label="Cleaning fee" value={cleaningFee} />
                      <PriceRow label="Service fee"  value={serviceFee} />
                      <PriceRow label="Tax (12%)"    value={tax} />
                      <div className="my-2 border-t border-zinc-200" />
                      <PriceRow label="Total"        value={totalPrice} bold />
                    </motion.div>
                  ) : (
                    <motion.div key="starting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <PriceRow label="Starting from" value={basePrice} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
{checkIn && checkOut && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-orange-50 px-3.5 py-3 text-[13px]"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <CalendarCheck size={16} className="shrink-0 text-red-600" />
                    <span className="font-bold text-zinc-950">Your Booking Details</span>
                  </div>
                  <div className="grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-1.5 text-[12.5px]">
                    <span className="font-medium text-zinc-500">Check-in:</span>
                    <span className="font-semibold text-zinc-950">{format(checkIn, "EEE, d MMM yyyy")}</span>
                    <span className="font-medium text-zinc-500">Check-out:</span>
                    <span className="font-semibold text-zinc-950">{format(checkOut, "EEE, d MMM yyyy")}</span>
                    <span className="font-medium text-zinc-500">Guests:</span>
                    <span className="font-semibold text-zinc-950">{guestCount} {guestCount === 1 ? "guest" : "guests"}</span>
                    <span className="font-medium text-zinc-500">Duration:</span>
                    <span className="font-bold text-red-600">{nights} {nights === 1 ? "night" : "nights"}</span>
                  </div>
                </motion.div>
              )}
              <motion.button
                className={`mb-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-red-600 to-red-700 px-3 py-3.5 text-[15px] font-semibold text-white shadow-[0_6px_20px_rgba(201,26,26,0.28)] transition hover:shadow-[0_10px_28px_rgba(201,26,26,0.38)] ${!checkIn || !checkOut ? "cursor-not-allowed opacity-60" : "cursor-pointer opacity-100"}`}
                onClick={handleReserve}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                disabled={!checkIn || !checkOut}
              >
                {checkIn && checkOut ? "Reserve Now" : "Select Dates to Reserve"}
              </motion.button>

              <p className="m-0 text-center text-xs text-zinc-400">You won't be charged yet</p>
            </div>
          </motion.aside>
        </div>

        {/* ── Map ── */}
        <section className="mb-8 border-b-0 pb-8">
          <h2 className="mb-5 inline-block font-serif text-[1.4rem] font-semibold text-zinc-950">Where you'll be</h2>
          <div className="overflow-hidden rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <Map
              listings={[listing]}
              height="420px"
              singleListing
              enableClustering={false}
              defaultZoom={14}
            />
          </div>
        </section>
<section className="mb-8 border-b border-zinc-200 pb-8">
          <HostSection owner={listing.owner} />
        </section>
      </div>
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