import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import BookingDetailModal from "./BookingDetailModal";

const API_URL = "http://localhost:8000";

// ─── Fonts + Global Styles ────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

    .acc-root {
      --bg: #faf8f4;
      --card: #ffffff;
      --border: rgba(0,0,0,0.07);
      --text: #1a1207;
      --muted: #7c7060;
      --accent: #c2633a;
      --accent-light: #fff0ea;
      --accent2: #e8a430;
      --green: #2d7a4f;
      --green-light: #edf7f1;
      --red: #c0392b;
      --red-light: #fdf0ef;
      --shadow: 0 2px 12px rgba(0,0,0,0.06);
      --shadow-lg: 0 12px 40px rgba(0,0,0,0.10);
      font-family: 'DM Sans', sans-serif;
      color: var(--text);
      background: var(--bg);
    }
    .acc-serif { font-family: 'Fraunces', serif; }
    .acc-tab { position: relative; transition: color .2s; }
    .acc-tab.active { color: var(--accent); }
    .acc-tab::after {
      content: '';
      position: absolute;
      bottom: -1px; left: 0; right: 0;
      height: 2px;
      background: var(--accent);
      transform: scaleX(0);
      transition: transform .25s ease;
    }
    .acc-tab.active::after { transform: scaleX(1); }
    .hover-lift { transition: transform .22s ease, box-shadow .22s ease; }
    .hover-lift:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #d4c9b8; border-radius: 10px; }
    .acc-input:focus { outline: none; border-color: var(--accent) !important; box-shadow: 0 0 0 3px rgba(194,99,58,0.12); }
    .avatar-ring { box-shadow: 0 0 0 3px var(--bg), 0 0 0 5px var(--accent); }
    @keyframes pulse-dot { 0%,100%{transform:scale(1)} 50%{transform:scale(1.3)} }
    .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
    @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
    .shimmer {
      background: linear-gradient(90deg, #f0ece4 25%, #e8e2d6 50%, #f0ece4 75%);
      background-size: 800px 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 8px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `}</style>
);

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icon = {
  Home: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>),
  Bell: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>),
  Receipt: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>),
  Card: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>),
  User: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>),
  Edit: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>),
  Trash: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>),
  Eye: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>),
  Pin: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
  Check: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>),
  X: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>),
  Clock: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  Download: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>),
  Mail: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>),
  Phone: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>),
  Star: (p) => (<svg {...p} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>),
  Logout: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>),
  Shield: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>),
  Calendar: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>),
  Users: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>),
  ArrowRight: (p) => (<svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => (n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
const getListingImg = (listing) =>
  listing?.image?.url ||
  listing?.images?.[0]?.url ||
  listing?.images?.[0] ||
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400";

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase();
  const styles = {
    paid:      { bg: "#edf7f1", color: "#2d7a4f", border: "#a7d9ba" },
    confirmed: { bg: "#edf7f1", color: "#2d7a4f", border: "#a7d9ba" },
    active:    { bg: "#edf7f1", color: "#2d7a4f", border: "#a7d9ba" },
    pending:   { bg: "#fef9ec", color: "#b07d10", border: "#f5d98b" },
    failed:    { bg: "#fdf0ef", color: "#c0392b", border: "#f5b8b4" },
    cancelled: { bg: "#fdf0ef", color: "#c0392b", border: "#f5b8b4" },
    refunded:  { bg: "#eff6ff", color: "#2563eb", border: "#93c5fd" },
  };
  const st = styles[s] || { bg: "#f3f0ea", color: "#7c7060", border: "#d4c9b8" };
  return (
    <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600, letterSpacing: ".04em", textTransform: "capitalize" }}>
      {status}
    </span>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ icon: IconComp, title, subtitle }) => (
  <div style={{ textAlign: "center", padding: "60px 20px" }}>
    <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f3f0ea", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
      <IconComp style={{ width: 28, height: 28, color: "#b0a090" }} />
    </div>
    <p style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: "#1a1207", margin: "0 0 6px" }}>{title}</p>
    <p style={{ fontSize: 14, color: "#7c7060", margin: 0 }}>{subtitle}</p>
  </div>
);

// ─── Bookings Tab ─────────────────────────────────────────────────────────────
const BookingsTab = ({ bookings, onViewBooking }) => {
  if (!bookings.length)
    return <EmptyState icon={Icon.Receipt} title="No bookings yet" subtitle="Your upcoming stays will appear here" />;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
      {bookings.map((b, i) => (
        <motion.div
          key={b._id}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
          className="hover-lift"
          style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
        >
          <div style={{ position: "relative", height: 180 }}>
            <img src={getListingImg(b.listing)} alt={b.listing?.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)" }} />
            <div style={{ position: "absolute", top: 12, right: 12 }}><StatusBadge status={b.status} /></div>
            <div style={{ position: "absolute", bottom: 12, left: 14 }}>
              <p style={{ color: "#fff", fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 400, margin: 0, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                {b.listing?.title || "Unnamed Listing"}
              </p>
            </div>
          </div>
          <div style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#7c7060", fontSize: 12, marginBottom: 12 }}>
              <Icon.Pin style={{ width: 13, height: 13 }} />
              {b.listing?.location || "Location unavailable"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, background: "#faf8f4", borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
              {[["Check-in", b.checkIn], ["Check-out", b.checkOut]].map(([label, date]) => (
                <div key={label}>
                  <p style={{ fontSize: 10, color: "#b0a090", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 3px" }}>{label}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1207", margin: 0 }}>{fmtDate(date)}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: "#c2633a", margin: 0 }}>₹{fmt(b.totalAmount || b.total)}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => onViewBooking(b)}
                  style={{ padding: "7px 14px", border: "1.5px solid #e0d8cc", borderRadius: 10, background: "#fff", fontSize: 12, fontWeight: 500, color: "#7c7060", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all .15s", fontFamily: "inherit" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c2633a"; e.currentTarget.style.color = "#c2633a"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0d8cc"; e.currentTarget.style.color = "#7c7060"; }}
                >
                  <Icon.Eye style={{ width: 13, height: 13 }} /> View
                </button>
                {(b.status === "paid" || b.status === "confirmed") && (
                  <button
                    onClick={() => onViewBooking(b)}
                    style={{ padding: "7px 14px", border: "1.5px solid #c2633a", borderRadius: 10, background: "#c2633a", fontSize: 12, fontWeight: 500, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit" }}
                  >
                    <Icon.Download style={{ width: 13, height: 13 }} /> Receipt
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ─── Transactions Tab ─────────────────────────────────────────────────────────
const TransactionsTab = ({ bookings, onViewBooking }) => {
  const transactions = bookings.filter(b => b.razorpay_order_id || b.razorpay_payment_id || b.totalAmount);

  if (!transactions.length)
    return <EmptyState icon={Icon.Card} title="No transactions" subtitle="Your payment history will appear here" />;

  const statusMap = {
    paid:      { label: "Paid",      color: "#2d7a4f", bg: "#edf7f1" },
    confirmed: { label: "Paid",      color: "#2d7a4f", bg: "#edf7f1" },
    pending:   { label: "Pending",   color: "#b07d10", bg: "#fef9ec" },
    failed:    { label: "Failed",    color: "#c0392b", bg: "#fdf0ef" },
    cancelled: { label: "Cancelled", color: "#c0392b", bg: "#fdf0ef" },
    refunded:  { label: "Refunded",  color: "#2563eb", bg: "#eff6ff" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {transactions.map((t, i) => {
        const st = statusMap[t.status?.toLowerCase()] || statusMap.pending;
        const nights = t.nights || Math.ceil((new Date(t.checkOut) - new Date(t.checkIn)) / 86400000) || 1;
        return (
          <motion.div
            key={t._id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="hover-lift"
            style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", background: "#fff", border: "1.5px solid rgba(0,0,0,0.07)", borderRadius: 14 }}
          >
            <div style={{ width: 46, height: 46, borderRadius: 13, background: st.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {t.status === "paid" || t.status === "confirmed"
                ? <Icon.Check style={{ width: 18, height: 18, color: st.color }} />
                : <Icon.Receipt style={{ width: 18, height: 18, color: st.color }} />
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: "0 0 2px", fontWeight: 600, color: "#1a1207", fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {t.listing?.title || "Booking"}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#7c7060" }}>
                {fmtDate(t.createdAt)} · {nights} night{nights > 1 ? "s" : ""}
                {t.razorpay_payment_id && (
                  <span style={{ marginLeft: 6, fontFamily: "monospace", fontSize: 11, color: "#b0a090" }}>
                    · {t.razorpay_payment_id.slice(0, 16)}…
                  </span>
                )}
              </p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: "#1a1207", margin: "0 0 5px" }}>₹{fmt(t.totalAmount || t.total)}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                <span style={{ background: st.bg, color: st.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100 }}>{st.label}</span>
                <button
                  onClick={() => onViewBooking(t)}
                  style={{ fontSize: 12, color: "#c2633a", background: "none", border: "none", cursor: "pointer", fontWeight: 500, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 3 }}
                >
                  Details <Icon.ArrowRight style={{ width: 11, height: 11 }} />
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
      <div style={{ marginTop: 8, padding: "14px 18px", background: "#faf8f4", border: "1.5px solid #e0d8cc", borderRadius: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#7c7060" }}>{transactions.length} transaction{transactions.length !== 1 ? "s" : ""}</span>
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: "#c2633a" }}>
          ₹{fmt(transactions.filter(t => t.status === "paid" || t.status === "confirmed").reduce((sum, t) => sum + (t.totalAmount || t.total || 0), 0))} paid
        </span>
      </div>
    </div>
  );
};

// ─── Listings Tab ─────────────────────────────────────────────────────────────
const ListingsTab = ({ listings, onEdit, onDelete, onBlockDates }) => {
  if (!listings.length)
    return <EmptyState icon={Icon.Home} title="No listings yet" subtitle="Start hosting and add your first listing" />;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
      {listings.map((l, i) => (
        <motion.div
          key={l._id || l.id}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
          className="hover-lift"
          style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
        >
          <div style={{ position: "relative", height: 180 }}>
            <img src={getListingImg(l)} alt={l.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)" }} />
            <div style={{ position: "absolute", top: 12, right: 12 }}><StatusBadge status={l.status || "Active"} /></div>
            {(l.unavailableDates?.length > 0) && (
              <div style={{ position: "absolute", top: 12, left: 12, background: "#ea580c", color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 100, display: "flex", alignItems: "center", gap: 4 }}>
                <Icon.Calendar style={{ width: 11, height: 11 }} /> {l.unavailableDates.length} Blocked
              </div>
            )}
          </div>
          <div style={{ padding: "16px 18px" }}>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 400, margin: "0 0 6px", color: "#1a1207" }}>{l.title}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#7c7060" }}>
                <Icon.Eye style={{ width: 13, height: 13 }} /> {l.views || 0} views
              </span>
              {l.price && (
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 16, color: "#c2633a" }}>
                  ₹{l.price?.toLocaleString()}<span style={{ fontFamily: "DM Sans", fontSize: 11, color: "#b0a090" }}>/night</span>
                </span>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <button onClick={() => onEdit(l._id || l.id)} style={{ padding: "9px", border: "1.5px solid #e0d8cc", borderRadius: 10, background: "#fff", fontSize: 13, fontWeight: 500, color: "#1a1207", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all .15s", fontFamily: "inherit" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c2633a"; e.currentTarget.style.color = "#c2633a"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0d8cc"; e.currentTarget.style.color = "#1a1207"; }}>
                <Icon.Edit style={{ width: 14, height: 14 }} /> Edit
              </button>
              <button onClick={() => onDelete(l._id || l.id)} style={{ padding: "9px", border: "1.5px solid #f5b8b4", borderRadius: 10, background: "#fdf0ef", fontSize: 13, fontWeight: 500, color: "#c0392b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all .15s", fontFamily: "inherit" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#fce4e2")} onMouseLeave={(e) => (e.currentTarget.style.background = "#fdf0ef")}>
                <Icon.Trash style={{ width: 14, height: 14 }} /> Delete
              </button>
            </div>
            <button onClick={() => onBlockDates(l)} style={{ width: "100%", padding: "9px", border: "1.5px solid #ea580c", borderRadius: 10, background: "#fff0ea", fontSize: 13, fontWeight: 600, color: "#ea580c", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all .15s", fontFamily: "inherit" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#fde4d7"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#fff0ea"; }}>
              <Icon.Calendar style={{ width: 14, height: 14 }} /> Block Dates
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ─── Notifications Tab ────────────────────────────────────────────────────────
const NotificationsTab = ({ notifications, markAsRead, markAllAsRead }) => {
  if (!notifications.length)
    return <EmptyState icon={Icon.Bell} title="All clear!" subtitle="You have no notifications right now" />;

  const unread = notifications.filter((n) => !n.isRead).length;
  const typeConfig = {
    booking_confirmed: { icon: Icon.Check, color: "#2d7a4f", bg: "#edf7f1" },
    booking_cancelled: { icon: Icon.X,     color: "#c0392b", bg: "#fdf0ef" },
    review:            { icon: Icon.Star,  color: "#b07d10", bg: "#fef9ec" },
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 400, margin: 0 }}>Notifications</h3>
          {unread > 0 && <span style={{ background: "#c2633a", color: "#fff", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100 }}>{unread} new</span>}
        </div>
        {unread > 0 && (
          <button onClick={markAllAsRead} style={{ fontSize: 13, color: "#c2633a", fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: "6px 12px", borderRadius: 8, transition: "background .15s", fontFamily: "inherit" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#fff0ea")} onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
            Mark all as read
          </button>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {notifications.map((n, i) => {
          const cfg = typeConfig[n.type] || { icon: Icon.Bell, color: "#7c7060", bg: "#f3f0ea" };
          const NIcon = cfg.icon;
          return (
            <motion.div key={n._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              style={{ display: "flex", gap: 14, padding: "16px 18px", border: "1.5px solid", borderColor: n.isRead ? "rgba(0,0,0,0.07)" : "#e8c4aa", borderRadius: 14, background: n.isRead ? "#fff" : "#fff8f4" }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <NIcon style={{ width: 16, height: 16, color: cfg.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1a1207" }}>{n.title}</h4>
                  <span style={{ fontSize: 11, color: "#b0a090", whiteSpace: "nowrap" }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#7c7060", lineHeight: 1.5 }}>{n.message}</p>
                {!n.isRead && <button onClick={() => markAsRead(n._id)} style={{ marginTop: 8, fontSize: 12, color: "#c2633a", fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>Mark as read →</button>}
              </div>
              {!n.isRead && <div className="pulse-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#c2633a", flexShrink: 0, marginTop: 5 }} />}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Profile Tab ──────────────────────────────────────────────────────────────
const ProfileTab = ({ user, onEdit, onLogout }) => {
  if (!user) return null;
  const fields = [
    { label: "Username",     value: user.username,                                                                                            icon: Icon.User  },
    { label: "Email",        value: user.email,                                                                                               icon: Icon.Mail  },
    { label: "Phone",        value: user.phoneNumber || "Not provided",                                                                       icon: Icon.Phone },
    { label: "Member Since", value: user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : user.joined_date, icon: Icon.Clock },
  ];
  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #faf8f4 0%, #f5ede2 100%)", border: "1.5px solid rgba(0,0,0,0.07)", borderRadius: 20, padding: "28px 28px", marginBottom: 24, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div className="avatar-ring" style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #c2633a, #e8a430)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 36, color: "#fff", fontWeight: 400 }}>{user.username?.charAt(0).toUpperCase()}</span>
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 400, margin: 0, color: "#1a1207" }}>{user.username}</h2>
            {user.verified && <span style={{ display: "flex", alignItems: "center", gap: 4, background: "#edf7f1", color: "#2d7a4f", border: "1px solid #a7d9ba", padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600 }}><Icon.Shield style={{ width: 11, height: 11 }} /> Verified</span>}
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 14, color: "#7c7060" }}>{user.email}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={onEdit} style={{ padding: "9px 20px", background: "#c2633a", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, transition: "background .15s", fontFamily: "inherit" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#a8522e")} onMouseLeave={(e) => (e.currentTarget.style.background = "#c2633a")}>
              <Icon.Edit style={{ width: 14, height: 14 }} /> Edit Profile
            </button>
            <button onClick={onLogout} style={{ padding: "9px 20px", background: "#fff", border: "1.5px solid #e0d8cc", borderRadius: 10, color: "#7c7060", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, transition: "all .15s", fontFamily: "inherit" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c0392b"; e.currentTarget.style.color = "#c0392b"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0d8cc"; e.currentTarget.style.color = "#7c7060"; }}>
              <Icon.Logout style={{ width: 14, height: 14 }} /> Log Out
            </button>
          </div>
        </div>
      </div>
      <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 400, margin: "0 0 16px", color: "#1a1207" }}>Personal Information</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
        {fields.map(({ label, value, icon: FieldIcon }) => (
          <div key={label} className="hover-lift" style={{ background: "#fff", border: "1.5px solid rgba(0,0,0,0.07)", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff0ea", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FieldIcon style={{ width: 17, height: 17, color: "#c2633a" }} />
            </div>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: 10, color: "#b0a090", textTransform: "uppercase", letterSpacing: ".07em" }}>{label}</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#1a1207" }}>{value}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, padding: "16px 20px", background: "#fff", border: "1.5px solid rgba(0,0,0,0.07)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ margin: "0 0 3px", fontWeight: 500, fontSize: 14, color: "#1a1207" }}>Email Notifications</p>
          <p style={{ margin: 0, fontSize: 12, color: "#7c7060" }}>Receive updates about your bookings and listings</p>
        </div>
        <div style={{ width: 44, height: 24, borderRadius: 12, background: user.notification_preferences ? "#c2633a" : "#d4c9b8", position: "relative", transition: "background .2s" }}>
          <div style={{ position: "absolute", top: 3, left: user.notification_preferences ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
        </div>
      </div>
    </div>
  );
};

// ─── Block Dates Modal ────────────────────────────────────────────────────────
const BlockDatesModal = ({ open, onClose, listing, onBlock, onUnblock }) => {
  const [blockFrom, setBlockFrom] = React.useState("");
  const [blockTo, setBlockTo] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleBlock = async () => {
    if (!blockFrom || !blockTo) {
      toast.error("⚠️ Please select both start and end dates");
      return;
    }
    if (new Date(blockTo) <= new Date(blockFrom)) {
      toast.error("⚠️ End date must be after start date");
      return;
    }
    setLoading(true);
    await onBlock(listing._id || listing.id, blockFrom, blockTo);
    setBlockFrom("");
    setBlockTo("");
    setLoading(false);
  };

  const handleUnblock = async (index) => {
    setLoading(true);
    await onUnblock(listing._id || listing.id, index);
    setLoading(false);
  };

  if (!listing) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(26,18,7,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(6px)" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div initial={{ scale: 0.93, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.93, y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 28 }} style={{ background: "#fff", borderRadius: 22, width: "100%", maxWidth: 560, maxHeight: "85vh", overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.18)" }}>
            <div style={{ padding: "22px 26px 18px", borderBottom: "1px solid rgba(0,0,0,0.07)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", background: "linear-gradient(135deg, #fff0ea 0%, #fff 100%)" }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, margin: "0 0 4px", color: "#1a1207", display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon.Calendar style={{ width: 22, height: 22, color: "#ea580c" }} />
                  Block Dates
                </h2>
                <p style={{ margin: 0, fontSize: 13, color: "#7c7060" }}>{listing.title}</p>
              </div>
              <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "#f3f0ea", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c7060", flexShrink: 0, marginLeft: 12 }}>
                <Icon.X style={{ width: 15, height: 15 }} />
              </button>
            </div>
            <div style={{ padding: "24px 26px", maxHeight: "calc(85vh - 120px)", overflowY: "auto" }}>
              {/* Add new block */}
              <div style={{ background: "#faf8f4", border: "1.5px solid #e0d8cc", borderRadius: 14, padding: "18px", marginBottom: 24 }}>
                <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 600, color: "#1a1207" }}>Block New Dates</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#7c7060", marginBottom: 6 }}>From Date</label>
                    <input type="date" value={blockFrom} onChange={(e) => setBlockFrom(e.target.value)} min={new Date().toISOString().split('T')[0]} className="acc-input" style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0d8cc", borderRadius: 10, fontSize: 13, color: "#1a1207", background: "#fff", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#7c7060", marginBottom: 6 }}>To Date</label>
                    <input type="date" value={blockTo} onChange={(e) => setBlockTo(e.target.value)} min={blockFrom || new Date().toISOString().split('T')[0]} className="acc-input" style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0d8cc", borderRadius: 10, fontSize: 13, color: "#1a1207", background: "#fff", boxSizing: "border-box" }} />
                  </div>
                </div>
                <button onClick={handleBlock} disabled={loading || !blockFrom || !blockTo} style={{ width: "100%", padding: "11px", border: "none", borderRadius: 10, background: loading || !blockFrom || !blockTo ? "#d4c9b8" : "#ea580c", color: "#fff", fontSize: 14, fontWeight: 600, cursor: loading || !blockFrom || !blockTo ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {loading ? "Blocking..." : "🔒 Block These Dates"}
                </button>
              </div>

              {/* Existing blocks */}
              <div>
                <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "#1a1207" }}>Blocked Date Ranges ({listing.unavailableDates?.length || 0})</p>
                {(!listing.unavailableDates || listing.unavailableDates.length === 0) ? (
                  <div style={{ textAlign: "center", padding: "32px 20px", background: "#faf8f4", borderRadius: 14, border: "1.5px dashed #e0d8cc" }}>
                    <Icon.Calendar style={{ width: 32, height: 32, color: "#d4c9b8", margin: "0 auto 8px" }} />
                    <p style={{ fontSize: 13, color: "#b0a090", margin: 0 }}>No blocked dates yet</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {listing.unavailableDates.map((range, index) => (
                      <div key={index} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#fff", border: "1.5px solid #fde4d7", borderRadius: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#fff0ea", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon.Calendar style={{ width: 14, height: 14, color: "#ea580c" }} />
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1a1207" }}>
                              {fmtDate(range.from)} → {fmtDate(range.to)}
                            </p>
                            <p style={{ margin: 0, fontSize: 11, color: "#b0a090" }}>
                              {Math.ceil((new Date(range.to) - new Date(range.from)) / 86400000)} days blocked
                            </p>
                          </div>
                        </div>
                        <button onClick={() => handleUnblock(index)} disabled={loading} style={{ padding: "6px 12px", border: "1.5px solid #f5b8b4", borderRadius: 8, background: "#fdf0ef", fontSize: 12, fontWeight: 500, color: "#c0392b", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────
const EditModal = ({ open, onClose, editForm, setEditForm, onSubmit, loading }) => (
  <AnimatePresence>
    {open && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(26,18,7,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <motion.div initial={{ scale: 0.93, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.93, y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 28 }} style={{ background: "#fff", borderRadius: 22, width: "100%", maxWidth: 460, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.18)" }}>
          <div style={{ padding: "22px 26px 18px", borderBottom: "1px solid rgba(0,0,0,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, margin: "0 0 3px", color: "#1a1207" }}>Edit Profile</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#7c7060" }}>Update your personal information</p>
            </div>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "#f3f0ea", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c7060" }}>
              <Icon.X style={{ width: 15, height: 15 }} />
            </button>
          </div>
          <form onSubmit={onSubmit} style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: 18 }}>
            {[
              { label: "Username",     key: "username",    type: "text", placeholder: "Your username" },
              { label: "Phone Number", key: "phoneNumber", type: "tel",  placeholder: "+91 1234567890" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#1a1207", marginBottom: 7 }}>{label}</label>
                <input type={type} value={editForm[key] || ""} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} placeholder={placeholder} className="acc-input" style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e0d8cc", borderRadius: 12, fontSize: 14, color: "#1a1207", background: "#faf8f4", boxSizing: "border-box", transition: "border-color .2s, box-shadow .2s" }} required={key === "username"} />
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#faf8f4", borderRadius: 12, border: "1.5px solid #e0d8cc" }}>
              <label style={{ fontSize: 14, color: "#1a1207", fontWeight: 500 }}>Email notifications</label>
              <div onClick={() => setEditForm({ ...editForm, notification_preferences: !editForm.notification_preferences })} style={{ width: 44, height: 24, borderRadius: 12, background: editForm.notification_preferences ? "#c2633a" : "#d4c9b8", position: "relative", cursor: "pointer", transition: "background .2s" }}>
                <div style={{ position: "absolute", top: 3, left: editForm.notification_preferences ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: "12px", border: "1.5px solid #e0d8cc", borderRadius: 12, background: "#fff", color: "#7c7060", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button type="submit" disabled={loading} style={{ flex: 1, padding: "12px", border: "none", borderRadius: 12, background: loading ? "#d4c9b8" : "#c2633a", color: "#fff", fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Main Account Component ───────────────────────────────────────────────────
const Account = () => {
  const navigate = useNavigate();
  const [user,                setUser]                = useState(null);
  const [loading,             setLoading]             = useState(true);
  const [activeTab,           setActiveTab]           = useState("bookings");
  const [bookings,            setBookings]            = useState([]);
  const [listings,            setListings]            = useState([]);
  const [notifications,       setNotifications]       = useState([]);
  const [editDialogOpen,      setEditDialogOpen]      = useState(false);
  const [editForm,            setEditForm]            = useState({ username: "", phoneNumber: "", notification_preferences: true });
  const [updateLoading,       setUpdateLoading]       = useState(false);
  const [viewingBooking,      setViewingBooking]      = useState(null);
  const [blockDatesDialog,    setBlockDatesDialog]    = useState(false);
  const [selectedListing,     setSelectedListing]     = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) { setLoading(false); return; }

      try {
        // 1. Profile
        const profileRes = await axios.get(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (profileRes.data?.user) {
          const u = profileRes.data.user;
          setUser({
            email: u.email,
            username: u.username,
            phoneNumber: u.phoneNumber || "",
            notification_preferences: u.notification_preferences !== false,
            verified: u.verified || false,
            createdAt: u.createdAt || u.created_at,
            joined_date: u.created_at ? new Date(u.created_at).toLocaleDateString() : "Unknown",
            role: u.role || "User"
          });
          setEditForm({
            username: u.username,
            phoneNumber: u.phoneNumber || "",
            notification_preferences: u.notification_preferences !== false
          });
        }

        // 2. Listings
        try {
          const lr = await axios.get(`${API_URL}/listings/user`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setListings(lr.data.data || []);
        } catch (err) {
          console.error("Error fetching listings:", err);
        }

        // 3. Bookings
        try {
          const br = await axios.get(`${API_URL}/bookings/my-bookings`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setBookings(Array.isArray(br.data) ? br.data : []);
        } catch (err) {
          console.error("Error fetching bookings:", err);
        }

        // 4. Notifications
        try {
          const nr = await axios.get(`${API_URL}/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setNotifications(nr.data.data || (Array.isArray(nr.data) ? nr.data : []));
        } catch (err) {
          console.error("Error fetching notifications:", err);
        }

      } catch (err) {
        console.error("Fatal fetch error:", err);
        toast.error("Failed to load account data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/auth/login";
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.put(`${API_URL}/auth/profile-update`, editForm, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      });
      if (res.data?.user) {
        setUser((prev) => ({
          ...prev,
          username: res.data.user.username,
          phoneNumber: res.data.user.phoneNumber,
          notification_preferences: res.data.user.notification_preferences
        }));
        toast.success("Profile updated!");
        setEditDialogOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating profile");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteListing = async (id) => {
    toast((t) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "8px 4px", minWidth: 280, textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fdf0ef", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
          <Icon.Trash style={{ width: 22, height: 22, color: "#c0392b" }} />
        </div>
        <div>
          <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 16, color: "#1a1207" }}>Delete this listing?</p>
          <p style={{ margin: 0, fontSize: 13, color: "#7c7060", lineHeight: 1.5 }}>This action is permanent and cannot be undone.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => toast.dismiss(t.id)} style={{ flex: 1, padding: "11px", border: "1.5px solid #e0d8cc", borderRadius: 10, background: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer", color: "#7c7060", fontFamily: "inherit" }}>Cancel</button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const token = localStorage.getItem("authToken");
                await axios.delete(`${API_URL}/listings/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                setListings((prev) => prev.filter((l) => (l._id || l.id) !== id));
                toast.success("Listing deleted.");
              } catch {
                toast.error("Failed to delete listing.");
              }
            }}
            style={{ flex: 1, padding: "11px", border: "none", borderRadius: 10, background: "#c0392b", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >Delete</button>
        </div>
      </div>
    ), { duration: Infinity, position: "top-center", style: { maxWidth: 380, padding: "24px 20px", borderRadius: 18, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" } });
  };

  const markNotificationAsRead = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(`${API_URL}/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(`${API_URL}/notifications/mark-all-read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Could not mark notifications as read");
    }
  };

  const handleBlockDates = async (listingId, from, to) => {
    try {
      const token = localStorage.getItem("authToken");
      
      // Convert string dates to Date objects and then to ISO strings
      const fromDate = new Date(from);
      const toDate = new Date(to);
      
      // Get current listing to access existing unavailable dates
      const currentListing = listings.find(l => (l._id || l.id) === listingId);
      
      const response = await axios.patch(
        `${API_URL}/listings/${listingId}/unavailable-dates`,
        { 
          unavailableDates: [
            ...(currentListing?.unavailableDates || []),
            { 
              from: fromDate.toISOString(), 
              to: toDate.toISOString(),
              reason: "maintenance"
            }
          ]
        },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      
      // Get updated listing from response
      const updatedListing = response.data.data;
      const newUnavailableDates = updatedListing?.unavailableDates || [];
      
      console.log("Block dates response:", response.data);
      console.log("Updated unavailable dates:", newUnavailableDates);
      
      // Update the listing in state with the response data
      setListings((prev) => {
        const updated = prev.map((l) => {
          if ((l._id || l.id) === listingId) {
            return {
              ...l,
              unavailableDates: newUnavailableDates
            };
          }
          return l;
        });
        
        // Also update selectedListing to reflect changes immediately in modal
        const updatedSelected = updated.find(l => (l._id || l.id) === listingId);
        if (updatedSelected) {
          setSelectedListing(updatedSelected);
        }
        
        return updated;
      });
      
      toast.success("✅ Dates blocked successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "❌ Failed to block dates");
    }
  };

  const handleUnblockDate = async (listingId, index) => {
    try {
      const token = localStorage.getItem("authToken");
      
      // Get current listing to access existing unavailable dates
      const currentListing = listings.find(l => (l._id || l.id) === listingId);
      const updatedDates = (currentListing?.unavailableDates || []).filter((_, i) => i !== index);
      
      const response = await axios.patch(
        `${API_URL}/listings/${listingId}/unavailable-dates`,
        { unavailableDates: updatedDates },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      
      // Get updated listing from response
      const updatedListing = response.data.data;
      const newUnavailableDates = updatedListing?.unavailableDates || updatedDates;
      
      console.log("Unblock dates response:", response.data);
      console.log("Updated unavailable dates:", newUnavailableDates);
      
      // Update the listing in state with the response data
      setListings((prev) => {
        const updated = prev.map((l) => {
          if ((l._id || l.id) === listingId) {
            return {
              ...l,
              unavailableDates: newUnavailableDates
            };
          }
          return l;
        });
        
        // Also update selectedListing to reflect changes immediately in modal
        const updatedSelected = updated.find(l => (l._id || l.id) === listingId);
        if (updatedSelected) {
          setSelectedListing(updatedSelected);
        }
        
        return updated;
      });
      
      toast.success("✅ Date range unblocked!");
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "❌ Failed to unblock dates");
    }
  };

  const handleOpenBlockDates = (listing) => {
    setSelectedListing(listing);
    setBlockDatesDialog(true);
  };

  const unreadCount  = notifications.filter((n) => !n.isRead).length;
  const paidBookings = bookings.filter(b => b.status === "paid" || b.status === "confirmed");

  const tabs = [
    { id: "bookings",      label: "Bookings",      icon: Icon.Receipt, count: bookings.length },
    { id: "listings",      label: "Listings",      icon: Icon.Home,    count: listings.length },
    { id: "notifications", label: "Notifications", icon: Icon.Bell,    count: unreadCount },
    { id: "transactions",  label: "Transactions",  icon: Icon.Card,    count: bookings.length },
    { id: "profile",       label: "Profile",       icon: Icon.User },
  ];

  if (loading) return (
    <div className="acc-root" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <GlobalStyles />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid #e0d8cc", borderTopColor: "#c2633a", animation: "spin 0.8s linear infinite" }} />
        <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: "#7c7060", margin: 0 }}>Loading your account…</p>
      </div>
    </div>
  );

  return (
    <div className="acc-root" style={{ minHeight: "100vh", paddingTop: 80, paddingBottom: 60 }}>
      <GlobalStyles />
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: "DM Sans, sans-serif", fontSize: 14 } }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", marginTop: 40, alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 14, color: "#b0a090", textTransform: "uppercase", letterSpacing: ".1em" }}>Dashboard</p>
              <h1 className="acc-serif" style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 300, margin: 0, color: "#1a1207" }}>
                {user ? `Welcome back, ${user.username.split(" ")[0]}` : "My Account"}
              </h1>
            </div>
            <a href="/" style={{ fontSize: 13, color: "#7c7060", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 5, padding: "8px 16px", border: "1.5px solid #e0d8cc", borderRadius: 10, transition: "all .15s" }} onMouseEnter={(e) => { e.currentTarget.style.color = "#c2633a"; e.currentTarget.style.borderColor = "#c2633a"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "#7c7060"; e.currentTarget.style.borderColor = "#e0d8cc"; }}>
              ← Back to Home
            </a>
          </div>
        </motion.div>

        {/* Stats Row */}
        {user && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
            {[
              { label: "Total Bookings", value: bookings.length, color: "#c2633a", bg: "#fff0ea" },
              { label: "My Listings",    value: listings.length, color: "#2d7a4f", bg: "#edf7f1" },
              { label: "Unread Alerts",  value: unreadCount,     color: "#b07d10", bg: "#fef9ec" },
              { label: "Total Spent",    value: `₹${fmt(paidBookings.reduce((s, b) => s + (b.totalAmount || b.total || 0), 0))}`, color: "#7c7060", bg: "#f3f0ea", isText: true },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06 }} className="hover-lift"
                style={{ background: "#fff", border: "1.5px solid rgba(0,0,0,0.07)", borderRadius: 16, padding: "18px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.color }} />
                </div>
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: s.isText ? 20 : 28, fontWeight: 400, color: s.color, margin: "0 0 4px" }}>{s.value}</p>
                <p style={{ fontSize: 12, color: "#7c7060", margin: 0 }}>{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Main Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          style={{ background: "#fff", border: "1.5px solid rgba(0,0,0,0.07)", borderRadius: 22, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>

          {/* Tabs */}
          <div style={{ borderBottom: "1px solid rgba(0,0,0,0.07)", padding: "0 8px", display: "flex", overflowX: "auto" }}>
            {tabs.map(({ id, label, icon: TabIcon, count }) => (
              <button key={id} onClick={() => setActiveTab(id)} className={`acc-tab ${activeTab === id ? "active" : ""}`}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "16px 20px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: activeTab === id ? 600 : 400, color: activeTab === id ? "#c2633a" : "#7c7060", whiteSpace: "nowrap", transition: "color .2s", fontFamily: "inherit" }}>
                <TabIcon style={{ width: 16, height: 16 }} />
                {label}
                {count !== undefined && count > 0 && (
                  <span style={{ background: activeTab === id ? "#c2633a" : "#e0d8cc", color: activeTab === id ? "#fff" : "#7c7060", fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 100, transition: "all .2s" }}>{count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: "28px 28px" }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                {activeTab === "bookings"      && <BookingsTab      bookings={bookings} onViewBooking={setViewingBooking} />}
                {activeTab === "listings"      && <ListingsTab      listings={listings} onEdit={(id) => navigate(`/listings/${id}/edit`)} onDelete={handleDeleteListing} onBlockDates={handleOpenBlockDates} />}
                {activeTab === "notifications" && <NotificationsTab notifications={notifications} markAsRead={markNotificationAsRead} markAllAsRead={markAllAsRead} />}
                {activeTab === "transactions"  && <TransactionsTab  bookings={bookings} onViewBooking={setViewingBooking} />}
                {activeTab === "profile"       && <ProfileTab       user={user} onEdit={() => setEditDialogOpen(true)} onLogout={handleLogout} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <EditModal open={editDialogOpen} onClose={() => setEditDialogOpen(false)} editForm={editForm} setEditForm={setEditForm} onSubmit={handleUpdateProfile} loading={updateLoading} />

      <BlockDatesModal
        open={blockDatesDialog}
        onClose={() => {
          setBlockDatesDialog(false);
          setSelectedListing(null);
        }}
        listing={selectedListing}
        onBlock={handleBlockDates}
        onUnblock={handleUnblockDate}
      />

      {/* BookingDetailModal is now imported from ./BookingDetailModal */}
      {viewingBooking && (
        
        <BookingDetailModal
          booking={viewingBooking}
          user={user}
          onClose={() => setViewingBooking(null)}
        />
      )}
    </div>
  );
};

export default Account;