import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CalendarDays, Users, ShieldCheck,
  CreditCard, Loader2, AlertTriangle, ChevronDown, ChevronUp,
} from "lucide-react";
import { AuthContext } from "../../AuthContext";

const API_URL = import.meta?.env?.VITE_APP_API_URL || "http://localhost:8000";

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

const PriceRow = ({ label, value, bold, muted }) => (
  <div
    className={`flex justify-between py-1.5 text-sm ${
      bold ? "text-base font-bold text-[#111827]" : muted ? "text-[#9ca3af]" : "text-[#374151]"
    }`}
  >
    <span>{label}</span>
    <span>₹{fmt(value)}</span>
  </div>
);

const BookingPage = () => {
  const { id }      = useParams();
  const { state }   = useLocation();
  const navigate    = useNavigate();
  const { user }    = useContext(AuthContext) || {};

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

  const [status,       setStatus]       = useState("idle");
  const [errorMsg,     setErrorMsg]     = useState("");
  const [showBreakdown,setShowBreakdown]= useState(true);

  useEffect(() => {
    if (!state || !listing) {
      navigate(`/listings/${id}`, { replace: true });
    }
  }, []);

  if (!state || !listing) return null;

  const checkInDate  = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const handlePay = async () => {
    setStatus("loading");
    setErrorMsg("");

    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/auth/login");
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setStatus("error");
      setErrorMsg("Razorpay failed to load. Check your internet connection.");
      return;
    }

    try {

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

        if (orderData.message && orderData.message.includes("already booked")) {
          setStatus("error");
          setErrorMsg("❌ These dates are already booked! Someone else just booked them. Please go back and select different dates.");

          setTimeout(() => {
            navigate(`/listings/${id}`, { replace: true });
          }, 3000);
          return;
        }
        throw new Error(orderData.message || "Could not create order");
      }

      const { order, bookingId } = orderData;

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
            setStatus("idle");
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

  return (
    <div className="min-h-screen bg-[#fafaf9] px-6 pb-20 pt-8 font-sans max-[640px]:px-3 max-[640px]:pb-14 max-[640px]:pt-[18px]">
<motion.div
        className="mx-auto mb-7 max-w-[1100px] max-[640px]:mb-3.5"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          to={`/listings/${id}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-white px-3.5 py-[7px] text-sm font-semibold text-[#374151] no-underline transition-colors hover:border-[#d1d5db] hover:bg-[#f3f4f6]"
        >
          <ArrowLeft size={17} />
          Back to listing
        </Link>
      </motion.div>

      <div className="mx-auto grid max-w-[1100px] grid-cols-[1fr_400px] items-start gap-12 max-[860px]:grid-cols-1 max-[860px]:gap-7">
<motion.div
          className=""
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h1 className="m-0 font-sans text-[28px] font-extrabold tracking-[-0.5px] text-[#111827] max-[640px]:text-[22px]">
            Confirm and pay
          </h1>
          <p className="mb-7 mt-1.5 text-sm text-[#6b7280] max-[640px]:mb-[18px]">Review your booking details before payment</p>
          <div className="mb-[18px] rounded-2xl border border-[#e5e7eb] bg-white px-6 py-[22px] max-[640px]:px-3.5 max-[640px]:py-3.5">
            <h3 className="mb-4 block font-sans text-base font-bold text-[#111827]">Your trip</h3>

            <div className="flex items-start gap-3.5 border-t border-[#f3f4f6] py-3 first:border-t-0 first:pt-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#fef2f2] text-[#e11d48]"><CalendarDays size={18} /></div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#9ca3af]">Dates</span>
                <span className="text-[15px] font-semibold text-[#111827]">
                  {format(checkInDate, "d MMM yyyy")} → {format(checkOutDate, "d MMM yyyy")}
                </span>
                <span className="text-xs text-[#9ca3af]">{nights} night{nights > 1 ? "s" : ""}</span>
              </div>
            </div>

            <div className="flex items-start gap-3.5 border-t border-[#f3f4f6] py-3 first:border-t-0 first:pt-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#fef2f2] text-[#e11d48]"><Users size={18} /></div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#9ca3af]">Guests</span>
                <span className="text-[15px] font-semibold text-[#111827]">{guests} guest{guests > 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
          <div className="mb-[18px] rounded-2xl border border-[#e5e7eb] bg-white px-6 py-[22px] max-[640px]:px-3.5 max-[640px]:py-3.5">
            <button
              className="mb-3.5 flex w-full items-center justify-between rounded-lg border border-[#f3f4f6] bg-[#fafafa] px-3 py-2 text-left font-sans text-base font-bold text-[#111827]"
              onClick={() => setShowBreakdown((s) => !s)}
            >
              <span>Price breakdown</span>
              <span className="text-[#6b7280]">{showBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
            </button>

            <AnimatePresence initial={false}>
              {showBreakdown && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden rounded-lg border border-[#f3f4f6] px-3 py-2"
                >
                  <PriceRow
                    label={`₹${fmt(basePrice)} × ${nights} night${nights > 1 ? "s" : ""}`}
                    value={basePrice * nights}
                  />
                  <PriceRow label="Cleaning fee" value={cleaningFee} />
                  <PriceRow label="Service fee"  value={serviceFee} />
                  <PriceRow label="Tax (12%)"    value={tax} muted />
                  <div className="my-2.5 h-px bg-[#f3f4f6]" />
                  <PriceRow label="Total (INR)"  value={totalPrice} bold />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="mb-4 flex items-start gap-3.5 rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] px-6 py-[22px] max-[640px]:px-3.5 max-[640px]:py-3.5">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#16a34a]" />
            <div>
              <p className="mb-1 text-sm font-semibold text-[#15803d]">Free cancellation before check-in</p>
              <p className="m-0 text-[13px] leading-relaxed text-[#4b7c58]">
                Cancel within 5 days of booking for a full refund. After that, the first night is non-refundable.
              </p>
            </div>
          </div>
<AnimatePresence>
            {status === "error" && (
              <motion.div
                className="mb-4 flex items-center gap-2.5 rounded-xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#dc2626]"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex w-full items-start gap-2">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div>{errorMsg}</div>
                    {errorMsg.includes("already booked") && (
                      <button
                        onClick={() => navigate(`/listings/${id}`, { replace: true })}
                        className="mt-3 rounded-lg border-2 border-[#dc2626] bg-white px-4 py-2 text-[13px] font-semibold text-[#dc2626] transition-all hover:bg-[#dc2626] hover:text-white"
                      >
                        ← Go back and select new dates
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
<motion.button
            className={`flex w-full items-center justify-center gap-2.5 rounded-[14px] border-none px-4 py-4 font-sans text-base font-bold tracking-[-0.2px] text-white shadow-[0_4px_18px_rgba(225,29,72,0.35)] transition-all disabled:cursor-not-allowed disabled:opacity-75 disabled:shadow-none max-[640px]:py-3.5 max-[640px]:text-[15px] ${
              status === "loading"
                ? "bg-[#991b1b]"
                : "bg-[#dc2626] hover:bg-[#b91c1c]"
            }`}
            onClick={handlePay}
            disabled={status === "loading"}
            whileHover={status !== "loading" ? { scale: 1.015 } : {}}
            whileTap={status !== "loading" ? { scale: 0.985 } : {}}
          >
            {status === "loading" ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Opening payment…
              </>
            ) : (
              <>
                <CreditCard size={18} />
                Pay ₹{fmt(totalPrice)}
              </>
            )}
          </motion.button>

          <p className="mt-2.5 text-center text-xs text-[#9ca3af]">
            Secured by Razorpay · UPI, Cards, Netbanking & Wallets accepted
          </p>
        </motion.div>
<motion.div
          className="max-[860px]:order-[-1]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="sticky top-[100px] overflow-hidden rounded-[20px] border border-[#e5e7eb] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.07)] max-[640px]:static">
            <div className="h-[220px] overflow-hidden max-[640px]:h-[180px]">
              {listing.image?.url
                ? <img src={listing.image.url} alt={listing.title} className="block h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]" />
                : <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#fef2f2] to-[#ffe4e6] text-5xl">🏠</div>
              }
            </div>
            <div className="px-[22px] pb-[22px] pt-5 max-[640px]:p-3.5">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#e11d48]">{listing.category || "Entire home"}</p>
              <h3 className="mb-[5px] font-sans text-[17px] font-bold leading-[1.3] text-[#111827]">{listing.title}</h3>
              <p className="m-0 text-[13px] text-[#6b7280]">
                📍 {listing.location}{listing.country ? `, ${listing.country}` : ""}
              </p>
              <div className="my-3.5 h-px bg-[#f3f4f6]" />
              <div className="flex items-baseline gap-1.5">
                <span className="font-sans text-xl font-extrabold text-[#111827]">₹{fmt(listing.price)}</span>
                <span className="text-[13px] text-[#9ca3af]">/ night</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2.5 px-1">
            <div className="flex items-center gap-2.5 text-[13px] text-[#4b5563]">
              <span className="text-base">🔒</span>
              <span>256-bit SSL secured</span>
            </div>
            <div className="flex items-center gap-2.5 text-[13px] text-[#4b5563]">
              <span className="text-base">✅</span>
              <span>Verified Razorpay gateway</span>
            </div>
            <div className="flex items-center gap-2.5 text-[13px] text-[#4b5563]">
              <span className="text-base">💳</span>
              <span>UPI · Cards · Wallets</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingPage;
