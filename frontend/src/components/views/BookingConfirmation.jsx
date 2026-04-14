import { useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  CheckCircle2, CalendarDays, Users, MapPin,
  CreditCard, Download, ArrowRight, Home,
} from "lucide-react";

const fmt = (n) =>
  (n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const CONFETTI_POSITIONS = [
  "left-[3%]", "left-[7%]", "left-[11%]", "left-[15%]", "left-[19%]", "left-[23%]", "left-[27%]",
  "left-[31%]", "left-[35%]", "left-[39%]", "left-[43%]", "left-[47%]", "left-[51%]", "left-[55%]",
  "left-[59%]", "left-[63%]", "left-[67%]", "left-[71%]", "left-[75%]", "left-[79%]", "left-[83%]",
  "left-[87%]", "left-[91%]", "left-[95%]", "left-[9%]", "left-[29%]", "left-[49%]", "left-[69%]",
];
const CONFETTI_COLORS = ["bg-red-600", "bg-red-300", "bg-gray-200", "bg-red-50"];
const CONFETTI_SIZES = ["h-2 w-2", "h-2.5 w-2.5", "h-3 w-3"];
const CONFETTI_DELAYS = [0.02, 0.06, 0.1, 0.14, 0.18, 0.22, 0.26, 0.3];
const CONFETTI_DURATIONS = [0.95, 1.05, 1.15, 1.25, 1.35];

const Confetti = () => {
  const pieces  = Array.from({ length: 28 }, (_, i) => i);
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {pieces.map((i) => (
        <motion.div
          key={i}
          className={`absolute -top-5 opacity-85 ${CONFETTI_POSITIONS[i]} ${CONFETTI_COLORS[i % CONFETTI_COLORS.length]} ${CONFETTI_SIZES[i % CONFETTI_SIZES.length]} ${i % 2 === 0 ? "rounded-full" : "rounded-sm"}`}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: "110vh", rotate: 540, opacity: 0 }}
          transition={{
            duration: CONFETTI_DURATIONS[i % CONFETTI_DURATIONS.length],
            delay: CONFETTI_DELAYS[i % CONFETTI_DELAYS.length],
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

const DetailRow = ({ icon: Icon, label, value, sub }) => (
  <div className="flex items-start gap-3.5 border-b border-[#f3f4f6] py-[13px] last:border-b-0">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#fef2f2] text-[#e11d48]">
      <Icon size={17} />
    </div>
    <div className="flex flex-1 flex-col gap-0.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#9ca3af]">{label}</span>
      <span className="text-[15px] font-semibold text-[#111827]">{value}</span>
      {sub && <span className="text-xs text-[#9ca3af]">{sub}</span>}
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
    <div className="relative min-h-screen overflow-hidden bg-white px-5 pb-20 pt-10 font-sans max-[480px]:px-3 max-[480px]:pb-14" ref={printRef}>
      <Confetti />

      <div className="relative z-[1] mx-auto max-w-[680px]">
<motion.div
          className="px-5 pb-7 pt-8 text-center"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="mb-5 inline-flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#dcfce7] text-[#16a34a] shadow-[0_8px_32px_rgba(22,163,74,0.2)]"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
          >
            <CheckCircle2 size={52} strokeWidth={1.8} />
          </motion.div>

          <motion.h1
            className="mb-2.5 font-sans text-[34px] font-extrabold tracking-[-0.8px] text-[#111827] max-[480px]:text-[26px]"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            Booking Confirmed!
          </motion.h1>

          <motion.p
            className="m-0 text-[15px] leading-relaxed text-[#6b7280]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
          >
            Your stay at <strong className="text-[#111827]">{listing.title}</strong> is all set.
            {paymentId && (
              <span className="mt-1.5 block font-mono text-xs text-[#9ca3af]"> · Payment ID: {paymentId}</span>
            )}
          </motion.p>
        </motion.div>
<motion.div
          className="relative mb-6 overflow-hidden rounded-3xl border border-[#f3f4f6] bg-white shadow-[0_8px_48px_rgba(0,0,0,0.1)]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.45 }}
        >
          <div className="relative h-[200px] overflow-hidden">
            {listing.image?.url
              ? <img src={listing.image.url} alt={listing.title} className="block h-full w-full object-cover" />
              : <div className="flex h-full w-full items-center justify-center bg-[#fef2f2] text-[56px]">🏠</div>
            }
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent px-[22px] py-5">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#fca5a5]">{listing.category || "Entire home"}</p>
              <h2 className="mb-1 font-sans text-xl font-bold leading-tight text-white">{listing.title}</h2>
              <p className="m-0 flex items-center gap-1 text-[13px] text-white/75">
                <MapPin size={13} />
                {listing.location}{listing.country ? `, ${listing.country}` : ""}
              </p>
            </div>
          </div>
          <div className="px-6 pb-0 pt-6">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.08em] text-[#9ca3af]">Booking details</h3>

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
          <div className="mt-5 border-t border-[#f3f4f6] bg-[#f9fafb] px-6 pb-6 pt-5">
            <h3 className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#9ca3af]">Price breakdown</h3>
            <div className="flex flex-col gap-0">
              <div className="flex justify-between py-1.5 text-sm text-[#374151]">
                <span>₹{fmt(basePrice)} × {nights} night{nights > 1 ? "s" : ""}</span>
                <span>₹{fmt(basePrice * nights)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-sm text-[#374151]">
                <span>Cleaning fee</span>
                <span>₹{fmt(cleaningFee)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-sm text-[#374151]">
                <span>Service fee</span>
                <span>₹{fmt(serviceFee)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-sm text-[#9ca3af]">
                <span>Tax (12%)</span>
                <span>₹{fmt(tax)}</span>
              </div>
              <div className="my-2 h-px bg-[#e5e7eb]" />
              <div className="flex justify-between py-1.5 text-base font-bold text-[#111827]">
                <span>Total paid</span>
                <span>₹{fmt(totalPrice)}</span>
              </div>
            </div>
          </div>
        </motion.div>
<motion.div
          className="relative z-[1] mb-8 flex flex-wrap gap-3 max-[480px]:flex-col"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.4 }}
        >
          <button
            className="bc-print-btn inline-flex items-center gap-1.5 rounded-xl border border-[#e5e7eb] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition-all hover:-translate-y-px hover:opacity-90 max-[480px]:w-full max-[480px]:justify-center"
            onClick={handlePrint}
          >
            <Download size={16} />
            Save / Print
          </button>

          <Link
            to="/listings"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#dc2626] px-5 py-3 text-sm font-semibold text-white no-underline shadow-[0_3px_14px_rgba(225,29,72,0.3)] transition-all hover:-translate-y-px hover:bg-[#b91c1c] max-[480px]:w-full"
          >
            <Home size={16} />
            Explore more
            <ArrowRight size={15} />
          </Link>
        </motion.div>
<motion.div
          className="relative z-[1] rounded-[20px] border border-[#e5e7eb] bg-white p-6 print:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
        >
          <h3 className="mb-[18px] font-sans text-base font-bold text-[#111827]">What's next?</h3>
          <div className="flex flex-col gap-3.5">
            {[
              { n: "1", text: "Check your email — a confirmation has been sent to you." },
              { n: "2", text: "Contact the host if you have any questions before your stay." },
              { n: "3", text: "Arrive after 2:00 PM on your check-in date. Self check-in via smart lock." },
            ].map(({ n, text }) => (
              <div key={n} className="flex items-start gap-3.5">
                <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[#dc2626] font-sans text-xs font-bold text-white">
                  {n}
                </span>
                <p className="m-0 pt-[3px] text-sm leading-[1.55] text-[#4b5563]">{text}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default BookingConfirmation;
