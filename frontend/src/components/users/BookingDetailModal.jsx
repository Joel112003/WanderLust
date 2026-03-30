import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ReportListingModal from "../views/ReportListingModal";

const fmt = (n) => (n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const getListingImg = (listing) => {
  if (!listing) return null;

  if (listing.image?.url) return listing.image.url;

  if (listing.images?.[0]?.url) return listing.images[0].url;

  if (typeof listing.images?.[0] === "string") return listing.images[0];

  if (typeof listing.image === "string") return listing.image;
  return null;
};

const Icon = {
  X: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>),
  Download: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>),
  Alert: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>),
  Pin: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
  Calendar: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>),
  Users: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>),
};

const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase();
  const styles = {
    paid:      { bg: "#edf7f1", color: "#2d7a4f", border: "#a7d9ba" },
    confirmed: { bg: "#edf7f1", color: "#2d7a4f", border: "#a7d9ba" },
    pending:   { bg: "#fef9ec", color: "#b07d10", border: "#f5d98b" },
    failed:    { bg: "#fdf0ef", color: "#c0392b", border: "#f5b8b4" },
    cancelled: { bg: "#fdf0ef", color: "#c0392b", border: "#f5b8b4" },
  };
  const st = styles[s] || { bg: "#f3f0ea", color: "#7c7060", border: "#d4c9b8" };
  return (
    <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600, letterSpacing: ".04em", textTransform: "capitalize" }}>
      {status}
    </span>
  );
};

const ReceiptForPDF = React.forwardRef(({ booking, user }, ref) => {
  const listing = booking.listing || {};
  const nights = booking.nights || Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / 86400000) || 1;
  const total = booking.totalAmount || booking.total || 0;
  const pricePerNight = booking.pricePerNight || (nights ? Math.round(total / nights) : 0);
  const cleaningFee = booking.cleaningFee || Math.round(pricePerNight * 0.1);
  const serviceFee  = booking.serviceFee  || Math.round((pricePerNight * nights) * 0.15);
  const tax         = booking.tax         || Math.round((pricePerNight * nights) * 0.12);
  const imgSrc      = getListingImg(listing);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: "-9999px",
        left: "-9999px",
        width: 600,
        background: "#ffffff",
        fontFamily: "Arial, sans-serif",
        color: "#1a1207",
        padding: 40,
        boxSizing: "border-box",
      }}
    >
      {}
      {imgSrc && (
        <div style={{ marginBottom: 24, borderRadius: 12, overflow: "hidden", height: 180 }}>
          <img
            src={imgSrc}
            alt={listing.title}
            crossOrigin="anonymous"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      {}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, paddingBottom: 18, borderBottom: "2px solid #c2633a" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#c2633a", margin: "0 0 4px" }}>WanderLust</h1>
          <p style={{ margin: 0, fontSize: 12, color: "#7c7060" }}>Booking Receipt</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: "0 0 3px", fontSize: 11, color: "#7c7060" }}>Receipt No.</p>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 13, fontFamily: "monospace" }}>
            {booking.razorpay_payment_id || booking._id?.slice(-8).toUpperCase() || "—"}
          </p>
          <p style={{ margin: "5px 0 0", fontSize: 11, color: "#7c7060" }}>
            {fmtDate(booking.createdAt || booking.updatedAt)}
          </p>
        </div>
      </div>

      {}
      <div style={{ display: "flex", gap: 40, marginBottom: 22 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".07em", color: "#b0a090", margin: "0 0 8px", fontWeight: 600 }}>Booked By</p>
          <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: 14 }}>{user?.username || "Guest"}</p>
          <p style={{ margin: "0 0 3px", fontSize: 12, color: "#7c7060" }}>{user?.email || ""}</p>
          {user?.phoneNumber && <p style={{ margin: 0, fontSize: 12, color: "#7c7060" }}>{user.phoneNumber}</p>}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".07em", color: "#b0a090", margin: "0 0 8px", fontWeight: 600 }}>Property</p>
          <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: 14 }}>{listing.title || "—"}</p>
          <p style={{ margin: "0 0 6px", fontSize: 12, color: "#7c7060" }}>
            {listing.location || ""}{listing.country ? `, ${listing.country}` : ""}
          </p>
          <span style={{ background: "#edf7f1", color: "#2d7a4f", border: "1px solid #a7d9ba", padding: "2px 8px", borderRadius: 100, fontSize: 10, fontWeight: 600 }}>
            {booking.status?.toUpperCase()}
          </span>
        </div>
      </div>

      {}
      <div style={{ background: "#faf8f4", borderRadius: 10, padding: "14px 18px", marginBottom: 22, display: "flex", gap: 0 }}>
        {[
          ["Check-in",  fmtDate(booking.checkIn)],
          ["Check-out", fmtDate(booking.checkOut)],
          ["Guests",    `${booking.guests || 1} guest${(booking.guests || 1) > 1 ? "s" : ""} · ${nights} night${nights > 1 ? "s" : ""}`],
        ].map(([label, val], i) => (
          <div key={label} style={{ flex: 1, paddingLeft: i > 0 ? 16 : 0, borderLeft: i > 0 ? "1px solid #e0d8cc" : "none", marginLeft: i > 0 ? 16 : 0 }}>
            <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", color: "#b0a090", margin: "0 0 4px", fontWeight: 600 }}>{label}</p>
            <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>{val}</p>
          </div>
        ))}
      </div>

      {}
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".07em", color: "#b0a090", margin: "0 0 10px", fontWeight: 600 }}>Price Breakdown</p>
        {[
          [`₹${fmt(pricePerNight)} × ${nights} night${nights > 1 ? "s" : ""}`, pricePerNight * nights],
          ["Cleaning fee", cleaningFee],
          ["Service fee",  serviceFee],
          ["Tax (12%)",    tax],
        ].map(([label, val]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f3f0ea", fontSize: 13, color: "#374151" }}>
            <span>{label}</span><span>₹{fmt(val)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", fontSize: 16, fontWeight: 700 }}>
          <span>Total Paid</span>
          <span style={{ color: "#c2633a", fontSize: 20 }}>₹{fmt(total)}</span>
        </div>
      </div>

      {}
      {booking.razorpay_payment_id && (
        <div style={{ background: "#edf7f1", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
          <p style={{ margin: "0 0 3px", fontSize: 11, color: "#2d7a4f", fontWeight: 700 }}>✓ Payment Verified via Razorpay</p>
          <p style={{ margin: 0, fontSize: 11, color: "#4b7c58", fontFamily: "monospace" }}>ID: {booking.razorpay_payment_id}</p>
        </div>
      )}

      {}
      <div style={{ borderTop: "1px solid #e0d8cc", paddingTop: 14, display: "flex", justifyContent: "space-between", fontSize: 10, color: "#b0a090" }}>
        <span>WanderLust · wanderlust.com</span>
        <span>Computer-generated receipt</span>
      </div>
    </div>
  );
});

const BookingDetailModal = ({ booking, onClose, user }) => {
  if (!booking) return null;

  const receiptRef = useRef(null);
  const [downloading, setDownloading] = React.useState(false);
  const [reportModalOpen, setReportModalOpen] = React.useState(false);

  const nights = booking.nights || Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / 86400000) || 1;
  const total = booking.totalAmount || booking.total || 0;
  const listing = booking.listing || {};

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`receipt-${booking._id?.slice(-6) || "wanderlust"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Could not generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const imgSrc = getListingImg(listing) || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600";

  return (
    <>
      {}
      <ReceiptForPDF ref={receiptRef} booking={booking} user={user} />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: "fixed", inset: 0, background: "rgba(26,18,7,0.55)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(6px)" }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.93, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.93, y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 580, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 30px 80px rgba(0,0,0,0.22)" }}
          >
            {}
            <div style={{ position: "relative", height: 220, flexShrink: 0 }}>
              <img
                src={imgSrc}
                alt={listing.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "24px 24px 0 0" }}
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600"; }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)", borderRadius: "24px 24px 0 0" }} />
              <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.9)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a1207" }}>
                <Icon.X style={{ width: 15, height: 15 }} />
              </button>
              <div style={{ position: "absolute", top: 14, left: 14 }}><StatusBadge status={booking.status} /></div>
              <div style={{ position: "absolute", bottom: 16, left: 20 }}>
                <p style={{ margin: "0 0 3px", fontSize: 11, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: ".07em" }}>{listing.category || "Entire home"}</p>
                <h2 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, color: "#fff" }}>{listing.title || "—"}</h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Icon.Pin style={{ width: 12, height: 12 }} />
                  {listing.location || ""}{listing.country ? `, ${listing.country}` : ""}
                </p>
              </div>
            </div>

            {}
            <div style={{ padding: "24px 26px" }}>

              {}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 22 }}>
                {[
                  { icon: Icon.Calendar, label: "Check-in",  val: fmtDate(booking.checkIn) },
                  { icon: Icon.Calendar, label: "Check-out", val: fmtDate(booking.checkOut) },
                  { icon: Icon.Users,    label: "Guests",    val: `${booking.guests || 1} · ${nights} night${nights > 1 ? "s" : ""}` },
                ].map(({ icon: Ic, label, val }) => (
                  <div key={label} style={{ background: "#faf8f4", borderRadius: 12, padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <Ic style={{ width: 13, height: 13, color: "#c2633a" }} />
                      <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".07em", color: "#b0a090" }}>{label}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1a1207" }}>{val}</p>
                  </div>
                ))}
              </div>

              {}
              <div style={{ background: "#faf8f4", borderRadius: 14, padding: "16px 18px", marginBottom: 20 }}>
                <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 600, color: "#7c7060", textTransform: "uppercase", letterSpacing: ".06em" }}>Price Breakdown</p>
                {(() => {
                  const ppn = booking.pricePerNight || Math.round(total / (nights || 1));
                  return [
                    [`₹${fmt(ppn)} × ${nights} night${nights > 1 ? "s" : ""}`, ppn * nights],
                    ["Cleaning fee", booking.cleaningFee || Math.round(ppn * 0.1)],
                    ["Service fee",  booking.serviceFee  || Math.round(total * 0.15 / 1.27)],
                    ["Tax (12%)",    booking.tax         || Math.round(total * 0.12 / 1.27)],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#7c7060", padding: "4px 0", borderBottom: "1px solid #f0ece4" }}>
                      <span>{label}</span><span>₹{fmt(val)}</span>
                    </div>
                  ));
                })()}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: "#1a1207", paddingTop: 10 }}>
                  <span>Total Paid</span>
                  <span style={{ fontFamily: "'Fraunces', serif", color: "#c2633a", fontSize: 20 }}>₹{fmt(total)}</span>
                </div>
              </div>

              {}
              {booking.razorpay_payment_id && (
                <div style={{ background: "#edf7f1", border: "1px solid #a7d9ba", borderRadius: 10, padding: "10px 14px", marginBottom: 20 }}>
                  <p style={{ margin: "0 0 3px", fontSize: 11, fontWeight: 700, color: "#2d7a4f", textTransform: "uppercase", letterSpacing: ".06em" }}>✓ Payment Confirmed</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#4b7c58", fontFamily: "monospace" }}>Razorpay ID: {booking.razorpay_payment_id}</p>
                </div>
              )}

              {}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={handleDownloadReceipt}
                    disabled={downloading}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "12px", background: downloading ? "#d4c9b8" : "#c2633a", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 600, cursor: downloading ? "not-allowed" : "pointer", transition: "background .15s", fontFamily: "inherit" }}
                    onMouseEnter={(e) => { if (!downloading) e.currentTarget.style.background = "#a8522e"; }}
                    onMouseLeave={(e) => { if (!downloading) e.currentTarget.style.background = "#c2633a"; }}
                  >
                    <Icon.Download style={{ width: 15, height: 15 }} />
                    {downloading ? "Generating PDF…" : "Download Receipt"}
                  </button>
                  <button
                    onClick={onClose}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "12px", background: "#fff", border: "1.5px solid #e0d8cc", borderRadius: 12, color: "#7c7060", fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "all .15s", fontFamily: "inherit" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#faf8f4")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  >
                    Close
                  </button>
                </div>

                {}
                <button
                  onClick={() => setReportModalOpen(true)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px", background: "#fdf0ef", border: "1.5px solid #f5b8b4", borderRadius: 12, color: "#c0392b", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .15s", fontFamily: "inherit" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fce4e2")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fdf0ef")}
                >
                  <Icon.Alert style={{ width: 15, height: 15 }} />
                  Report an Issue with this Listing
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {}
      <ReportListingModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        booking={booking}
        listing={booking.listing}
      />
    </>
  );
};

export default BookingDetailModal;
