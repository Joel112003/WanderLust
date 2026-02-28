import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CalendarDays, Users, ShieldCheck,
  CreditCard, Loader2, AlertTriangle, ChevronDown, ChevronUp,
} from "lucide-react";
import { AuthContext } from "../../AuthContext";
import "../../utilis/css/BookingPage.css";

const API_URL = import.meta?.env?.VITE_APP_API_URL || "http://localhost:8000";

/* ── Load Razorpay script once ── */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const s = document.createElement("script");
    s.id      = "razorpay-script";
    s.src     = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const fmt = (n) =>
  (n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

/* ── Price row helper ── */
const PriceRow = ({ label, value, bold, muted }) => (
  <div className={`bp-price-row ${bold ? "bp-price-row--bold" : ""} ${muted ? "bp-price-row--muted" : ""}`}>
    <span>{label}</span>
    <span>₹{fmt(value)}</span>
  </div>
);

/* ── Main component ── */
const BookingPage = () => {
  const { id }      = useParams();
  const { state }   = useLocation();
  const navigate    = useNavigate();
  const { user }    = useContext(AuthContext) || {};

  // Pull booking data passed via navigate() state from ListingDetail
  const {
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
  } = state || {};

  const [status,       setStatus]       = useState("idle"); // idle | loading | success | error
  const [errorMsg,     setErrorMsg]     = useState("");
  const [showBreakdown,setShowBreakdown]= useState(true);

  // Guard: if navigated directly without state, go back
  useEffect(() => {
    if (!state || !listing) {
      navigate(`/listings/${id}`, { replace: true });
    }
  }, []);

  if (!state || !listing) return null;

  const checkInDate  = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  /* ── Razorpay payment flow ── */
  const handlePay = async () => {
    setStatus("loading");
    setErrorMsg("");

    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/auth/login");
      return;
    }

    // 1. Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setStatus("error");
      setErrorMsg("Razorpay failed to load. Check your internet connection.");
      return;
    }

    try {
      // 2. Create order on backend
      const orderRes = await fetch(`${API_URL}/api/payment/create-order`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingId: listing._id,
          checkIn,
          checkOut,
          guests,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        // Special handling for booking conflicts
        if (orderData.message && orderData.message.includes("already booked")) {
          setStatus("error");
          setErrorMsg("❌ These dates are already booked! Someone else just booked them. Please go back and select different dates.");
          // Auto-redirect back to listing after 3 seconds
          setTimeout(() => {
            navigate(`/listings/${id}`, { replace: true });
          }, 3000);
          return;
        }
        throw new Error(orderData.message || "Could not create order");
      }

      const { order, bookingId } = orderData;

      // 3. Open Razorpay modal
      const options = {
        key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount:      order.amount,
        currency:    order.currency,
        name:        "WanderLust",
        description: `${nights} night${nights > 1 ? "s" : ""} at ${listing.title}`,
        order_id:    order.id,
        prefill: {
          name:    user?.name  || user?.username || "",
          email:   user?.email || "",
          contact: user?.phone || "",
        },
        notes: { bookingId: bookingId.toString() },
        theme: { color: "#E11D48" },

        handler: async (response) => {
          // 4. Verify payment on backend
          try {
            const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
              method:  "POST",
              headers: {
                "Content-Type":  "application/json",
                "Authorization": `Bearer ${token}`,
              },
              body: JSON.stringify({ ...response, bookingId }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              // 5. Navigate to confirmation page
              navigate("/booking-confirmation", {
                replace: true,
                state: {
                  booking:     verifyData.booking,
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
                  paymentId:   response.razorpay_payment_id,
                },
              });
            } else {
              setStatus("error");
              setErrorMsg(verifyData.message || "Payment verification failed. Contact support.");
            }
          } catch {
            setStatus("error");
            setErrorMsg("Network error during verification. Please contact support.");
          }
        },

        modal: {
          ondismiss: () => {
            setStatus("idle"); // user closed modal — reset
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r) => {
        setStatus("error");
        setErrorMsg(r.error.description || "Payment failed. Please try again.");
      });
      rzp.open();

    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  };

  /* ── render ── */
  return (
    <div className="bp-page">

      {/* Back link */}
      <motion.div
        className="bp-back"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link to={`/listings/${id}`} className="bp-back__btn">
          <ArrowLeft size={17} />
          Back to listing
        </Link>
      </motion.div>

      <div className="bp-layout">

        {/* ── LEFT: Booking summary + pay button ── */}
        <motion.div
          className="bp-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h1 className="bp-title">Confirm and pay</h1>
          <p className="bp-subtitle">Review your booking details before payment</p>

          {/* Trip info */}
          <div className="bp-card">
            <h3 className="bp-card__title">Your trip</h3>

            <div className="bp-trip-row">
              <div className="bp-trip-row__icon"><CalendarDays size={18} /></div>
              <div className="bp-trip-row__body">
                <span className="bp-trip-row__label">Dates</span>
                <span className="bp-trip-row__val">
                  {format(checkInDate, "d MMM yyyy")} → {format(checkOutDate, "d MMM yyyy")}
                </span>
                <span className="bp-trip-row__sub">{nights} night{nights > 1 ? "s" : ""}</span>
              </div>
            </div>

            <div className="bp-trip-row">
              <div className="bp-trip-row__icon"><Users size={18} /></div>
              <div className="bp-trip-row__body">
                <span className="bp-trip-row__label">Guests</span>
                <span className="bp-trip-row__val">{guests} guest{guests > 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="bp-card">
            <button
              className="bp-card__title bp-card__title--toggle"
              onClick={() => setShowBreakdown((s) => !s)}
            >
              Price breakdown
              {showBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence initial={false}>
              {showBreakdown && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: "hidden" }}
                >
                  <PriceRow
                    label={`₹${fmt(basePrice)} × ${nights} night${nights > 1 ? "s" : ""}`}
                    value={basePrice * nights}
                  />
                  <PriceRow label="Cleaning fee" value={cleaningFee} />
                  <PriceRow label="Service fee"  value={serviceFee} />
                  <PriceRow label="Tax (12%)"    value={tax} muted />
                  <div className="bp-divider" />
                  <PriceRow label="Total (INR)"  value={totalPrice} bold />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cancellation policy */}
          <div className="bp-card bp-card--policy">
            <ShieldCheck size={18} className="bp-policy-icon" />
            <div>
              <p className="bp-policy-title">Free cancellation before check-in</p>
              <p className="bp-policy-desc">
                Cancel within 5 days of booking for a full refund. After that, the first night is non-refundable.
              </p>
            </div>
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {status === "error" && (
              <motion.div
                className="bp-error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", width: "100%" }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div style={{ flex: 1 }}>
                    <div>{errorMsg}</div>
                    {errorMsg.includes("already booked") && (
                      <button
                        onClick={() => navigate(`/listings/${id}`, { replace: true })}
                        style={{
                          marginTop: "12px",
                          padding: "8px 16px",
                          background: "#fff",
                          color: "#dc2626",
                          border: "2px solid #dc2626",
                          borderRadius: "8px",
                          fontWeight: 600,
                          fontSize: "13px",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#dc2626";
                          e.target.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "#fff";
                          e.target.style.color = "#dc2626";
                        }}
                      >
                        ← Go back and select new dates
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pay button */}
          <motion.button
            className={`bp-pay-btn ${status === "loading" ? "bp-pay-btn--loading" : ""}`}
            onClick={handlePay}
            disabled={status === "loading"}
            whileHover={status !== "loading" ? { scale: 1.015 } : {}}
            whileTap={status !== "loading" ? { scale: 0.985 } : {}}
          >
            {status === "loading" ? (
              <>
                <Loader2 size={18} className="bp-spin" />
                Opening payment…
              </>
            ) : (
              <>
                <CreditCard size={18} />
                Pay ₹{fmt(totalPrice)}
              </>
            )}
          </motion.button>

          <p className="bp-pay-note">
            Secured by Razorpay · UPI, Cards, Netbanking & Wallets accepted
          </p>
        </motion.div>

        {/* ── RIGHT: Listing summary card ── */}
        <motion.div
          className="bp-right"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="bp-listing-card">
            <div className="bp-listing-card__img-wrap">
              {listing.image?.url
                ? <img src={listing.image.url} alt={listing.title} className="bp-listing-card__img" />
                : <div className="bp-listing-card__img-placeholder">🏠</div>
              }
            </div>
            <div className="bp-listing-card__body">
              <p className="bp-listing-card__category">{listing.category || "Entire home"}</p>
              <h3 className="bp-listing-card__title">{listing.title}</h3>
              <p className="bp-listing-card__location">
                📍 {listing.location}{listing.country ? `, ${listing.country}` : ""}
              </p>
              <div className="bp-listing-card__divider" />
              <div className="bp-listing-card__price-row">
                <span className="bp-listing-card__price">₹{fmt(listing.price)}</span>
                <span className="bp-listing-card__per">/ night</span>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="bp-trust">
            <div className="bp-trust__item">
              <span className="bp-trust__icon">🔒</span>
              <span>256-bit SSL secured</span>
            </div>
            <div className="bp-trust__item">
              <span className="bp-trust__icon">✅</span>
              <span>Verified Razorpay gateway</span>
            </div>
            <div className="bp-trust__item">
              <span className="bp-trust__icon">💳</span>
              <span>UPI · Cards · Wallets</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingPage;