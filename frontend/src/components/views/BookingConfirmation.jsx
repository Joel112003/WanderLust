import { useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  CheckCircle2, CalendarDays, Users, MapPin,
  CreditCard, Download, ArrowRight, Home,
} from "lucide-react";
import "../../utilis/css/BookingConfirmation.css";

const fmt = (n) =>
  (n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const Confetti = () => {
  const colors  = ["#e11d48", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#f97316"];
  const pieces  = Array.from({ length: 48 }, (_, i) => i);
  return (
    <div className="bc-confetti" aria-hidden>
      {pieces.map((i) => (
        <div
          key={i}
          className="bc-confetti__piece"
          style={{
            left:            `${Math.random() * 100}%`,
            background:      colors[i % colors.length],
            animationDelay:  `${Math.random() * 0.8}s`,
            animationDuration:`${0.8 + Math.random() * 0.8}s`,
            width:           `${6 + Math.random() * 6}px`,
            height:          `${6 + Math.random() * 6}px`,
            borderRadius:    Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
};

const DetailRow = ({ icon: Icon, label, value, sub }) => (
  <div className="bc-detail-row">
    <div className="bc-detail-row__icon"><Icon size={17} /></div>
    <div className="bc-detail-row__body">
      <span className="bc-detail-row__label">{label}</span>
      <span className="bc-detail-row__val">{value}</span>
      {sub && <span className="bc-detail-row__sub">{sub}</span>}
    </div>
  </div>
);

const BookingConfirmation = () => {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const printRef   = useRef(null);

  const {
    booking,
    listing,
    checkIn,
    checkOut,
    guests,
    nights,
    basePrice,
    cleaningFee,
    serviceFee,
    tax,
    totalPrice,
    paymentId,
  } = state || {};

  useEffect(() => {
    if (!state || !listing) navigate("/listings", { replace: true });
  }, []);

  if (!state || !listing) return null;

  const checkInDate  = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const handlePrint = () => window.print();

  return (
    <div className="bc-page" ref={printRef}>
      <Confetti />

      <div className="bc-container">
<motion.div
          className="bc-hero"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="bc-check-ring"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
          >
            <CheckCircle2 size={52} strokeWidth={1.8} />
          </motion.div>

          <motion.h1
            className="bc-hero__title"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            Booking Confirmed!
          </motion.h1>

          <motion.p
            className="bc-hero__sub"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
          >
            Your stay at <strong>{listing.title}</strong> is all set.
            {paymentId && (
              <span className="bc-payment-id"> · Payment ID: {paymentId}</span>
            )}
          </motion.p>
        </motion.div>
<motion.div
          className="bc-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.45 }}
        >
<div className="bc-listing-strip">
            {listing.image?.url
              ? <img src={listing.image.url} alt={listing.title} className="bc-listing-strip__img" />
              : <div className="bc-listing-strip__placeholder">🏠</div>
            }
            <div className="bc-listing-strip__overlay">
              <p className="bc-listing-strip__category">{listing.category || "Entire home"}</p>
              <h2 className="bc-listing-strip__title">{listing.title}</h2>
              <p className="bc-listing-strip__loc">
                <MapPin size={13} />
                {listing.location}{listing.country ? `, ${listing.country}` : ""}
              </p>
            </div>
          </div>
<div className="bc-details">
            <h3 className="bc-details__title">Booking details</h3>

            <DetailRow
              icon={CalendarDays}
              label="Check-in"
              value={format(checkInDate, "EEEE, d MMMM yyyy")}
              sub="After 2:00 PM"
            />
            <DetailRow
              icon={CalendarDays}
              label="Check-out"
              value={format(checkOutDate, "EEEE, d MMMM yyyy")}
              sub="Before 11:00 AM"
            />
            <DetailRow
              icon={Users}
              label="Guests"
              value={`${guests} guest${guests > 1 ? "s" : ""}`}
              sub={`${nights} night${nights > 1 ? "s" : ""}`}
            />
            <DetailRow
              icon={CreditCard}
              label="Payment"
              value={`₹${fmt(totalPrice)}`}
              sub="Paid via Razorpay"
            />
          </div>
<div className="bc-breakdown">
            <h3 className="bc-breakdown__title">Price breakdown</h3>
            <div className="bc-breakdown__rows">
              <div className="bc-breakdown__row">
                <span>₹{fmt(basePrice)} × {nights} night{nights > 1 ? "s" : ""}</span>
                <span>₹{fmt(basePrice * nights)}</span>
              </div>
              <div className="bc-breakdown__row">
                <span>Cleaning fee</span>
                <span>₹{fmt(cleaningFee)}</span>
              </div>
              <div className="bc-breakdown__row">
                <span>Service fee</span>
                <span>₹{fmt(serviceFee)}</span>
              </div>
              <div className="bc-breakdown__row bc-breakdown__row--muted">
                <span>Tax (12%)</span>
                <span>₹{fmt(tax)}</span>
              </div>
              <div className="bc-breakdown__divider" />
              <div className="bc-breakdown__row bc-breakdown__row--total">
                <span>Total paid</span>
                <span>₹{fmt(totalPrice)}</span>
              </div>
            </div>
          </div>
        </motion.div>
<motion.div
          className="bc-actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.4 }}
        >
          <button className="bc-btn bc-btn--outline bc-print-btn" onClick={handlePrint}>
            <Download size={16} />
            Save / Print
          </button>

          <Link to="/listings" className="bc-btn bc-btn--primary">
            <Home size={16} />
            Explore more
            <ArrowRight size={15} />
          </Link>
        </motion.div>
<motion.div
          className="bc-next"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
        >
          <h3 className="bc-next__title">What's next?</h3>
          <div className="bc-next__steps">
            {[
              { n: "1", text: "Check your email — a confirmation has been sent to you." },
              { n: "2", text: "Contact the host if you have any questions before your stay." },
              { n: "3", text: "Arrive after 2:00 PM on your check-in date. Self check-in via smart lock." },
            ].map(({ n, text }) => (
              <div key={n} className="bc-next__step">
                <span className="bc-next__num">{n}</span>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default BookingConfirmation;
