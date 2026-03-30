import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const TABS = ["Guest", "Host", "Experience Host", "Travel Admin"];

const FAQ_DATA = {
  0: [
    { id: 1, question: "How do I book a stay?", answer: "Search for your destination, select dates, choose a property, and complete the payment process. Make sure to read the cancellation policy before confirming." },
    { id: 2, question: "What is the cancellation policy?", answer: "Policies vary by host — Flexible, Moderate, and Strict. You'll find the specific policy on each listing page before you book." },
    { id: 3, question: "How do I contact my host?", answer: "Once your booking is confirmed, message your host directly through our platform. Go to your Trips section and tap the property to access messaging." },
    { id: 4, question: "What if I need to modify my booking?", answer: "Modifications can be made through your account dashboard. Changes are subject to availability and the host's modification policy." },
  ],
  1: [
    { id: 1, question: "How do I list my property?", answer: "Create a host account, complete the listing process with photos, description, amenities, and pricing. Your listing is reviewed before going live." },
    { id: 2, question: "How do I set my pricing?", answer: "Use our Smart Pricing tool or set custom rates. Consider seasonal demand, local events, and competitor pricing for the best results." },
    { id: 3, question: "When do I get paid?", answer: "Payments are released 24 hours after guest check-in. Track your earnings any time in the host dashboard." },
  ],
  2: [
    { id: 1, question: "How do I create an experience?", answer: "Submit a proposal including activity details, duration, group size, and pricing. Our team reviews and approves each experience." },
    { id: 2, question: "What equipment do I need to provide?", answer: "List all equipment and materials you'll supply in your experience description so guests know exactly what to expect and bring." },
  ],
  3: [
    { id: 1, question: "How do I manage team bookings?", answer: "Use the admin dashboard to oversee multiple bookings, manage traveller profiles, and track expenses across your organisation." },
    { id: 2, question: "How do I set travel policies?", answer: "Configure booking limits, approval workflows, and expense guidelines in the admin panel under Travel Policies." },
  ],
};

const QUICK_LINKS = [
  { icon: "🏠", title: "Property Guidelines", desc: "Platform standards" },
  { icon: "💰", title: "Pricing Tips", desc: "Optimise earnings" },
  { icon: "📅", title: "Manage Bookings", desc: "Handle reservations" },
  { icon: "🛡️", title: "Safety & Security", desc: "Stay protected" },
  { icon: "📞", title: "24/7 Support", desc: "Immediate help" },
  { icon: "📋", title: "Host Resources", desc: "Tools & guides" },
];

export default function HelpCenter() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  const faqs = useMemo(() => {
    const list = FAQ_DATA[activeTab] || [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(f => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
  }, [activeTab, search]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .hlp-root { font-family: 'DM Sans', sans-serif; background: #f9f7f4; min-height: 100vh; color: #1c1a17; }
        .hlp-hero { background: linear-gradient(160deg, #1c1a17 0%, #2e2820 60%, #3d3228 100%); padding: 100px 24px 64px; text-align: center; }
        .hlp-search { width: 100%; max-width: 540px; padding: 14px 20px 14px 50px; border-radius: 100px; border: 2px solid transparent; background: rgba(255,255,255,0.1); color: #fff; font-family: 'DM Sans', sans-serif; font-size: 15px; transition: all .2s; outline: none; }
        .hlp-search::placeholder { color: rgba(255,255,255,0.4); }
        .hlp-search:focus { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.25); }
        .hlp-search-wrap { position: relative; display: inline-flex; align-items: center; width: 100%; max-width: 540px; }
        .hlp-search-icon { position: absolute; left: 18px; color: rgba(255,255,255,0.45); pointer-events: none; }
        .hlp-ql-card { background: #fff; border: 1.5px solid #ebe8e2; border-radius: 16px; padding: 20px 16px; text-align: center; cursor: pointer; transition: all .2s; }
        .hlp-ql-card:hover { border-color: #c2633a; transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
        .hlp-tab { padding: 10px 22px; border-radius: 100px; border: none; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all .2s; background: transparent; color: #7a7265; }
        .hlp-tab:hover { background: #f0ece6; color: #1c1a17; }
        .hlp-tab.active { background: #1c1a17; color: #fff; }
        .hlp-faq { border: 1.5px solid #ebe8e2; border-radius: 14px; overflow: hidden; background: #fff; transition: border-color .2s; }
        .hlp-faq:hover { border-color: #d4cfc6; }
        .hlp-faq-btn { width: 100%; text-align: left; padding: 18px 20px; background: none; border: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 12px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; color: #1c1a17; transition: background .15s; }
        .hlp-faq-btn:hover { background: #faf8f5; }
        .hlp-faq-answer { padding: 0 20px 18px; font-size: 14px; color: #7a7265; line-height: 1.7; border-top: 1px solid #f0ece6; padding-top: 16px; }
        .hlp-contact { background: linear-gradient(135deg, #c2633a 0%, #d4832a 50%, #e8a430 100%); border-radius: 24px; padding: 48px 40px; color: #fff; text-align: center; }
        .hlp-contact-btn { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(8px); border-radius: 16px; padding: 20px; color: #fff; cursor: pointer; transition: all .2s; font-family: 'DM Sans', sans-serif; }
        .hlp-contact-btn:hover { background: rgba(255,255,255,0.25); transform: translateY(-2px); }
        .hlp-signup-btn { background: #fff; color: #c2633a; border: none; padding: 14px 36px; border-radius: 100px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s; }
        .hlp-signup-btn:hover { transform: scale(1.04); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
        .hlp-chevron { transition: transform .25s; }
        .hlp-chevron.open { transform: rotate(180deg); }
      `}</style>

      <div className="hlp-root">
<div className="hlp-hero">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 style={{ fontFamily: "'Lora', serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 600, color: "#fff", margin: "0 0 12px", lineHeight: 1.15 }}>
              Hi, how can we help?
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", margin: "0 0 32px" }}>
              Search our help centre or browse categories below
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div className="hlp-search-wrap">
                <svg className="hlp-search-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  className="hlp-search"
                  placeholder="Search how-tos, FAQs and more…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        </div>

        <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" }}>
<motion.div variants={stagger} initial="hidden" animate="visible" style={{ marginBottom: 48 }}>
            <motion.h2 variants={fadeUp} style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 600, marginBottom: 20, color: "#1c1a17" }}>
              Quick Links
            </motion.h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
              {QUICK_LINKS.map((l, i) => (
                <motion.div key={i} variants={fadeUp} className="hlp-ql-card">
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{l.icon}</div>
                  <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 600, color: "#1c1a17" }}>{l.title}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#9e9488" }}>{l.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
            style={{ background: "#fff", border: "1.5px solid #ebe8e2", borderRadius: 24, overflow: "hidden" }}>
<div style={{ padding: "16px 20px", borderBottom: "1px solid #f0ece6", display: "flex", flexWrap: "wrap", gap: 6 }}>
              {TABS.map((tab, i) => (
                <button key={i} className={`hlp-tab${activeTab === i ? " active" : ""}`}
                  onClick={() => { setActiveTab(i); setExpanded(null); }}>
                  {tab}
                </button>
              ))}
            </div>
<div style={{ padding: "28px 24px" }}>
              <h3 style={{ fontFamily: "'Lora', serif", fontSize: 18, fontWeight: 600, margin: "0 0 20px", color: "#1c1a17" }}>
                Frequently Asked Questions
              </h3>
              <AnimatePresence mode="wait">
                <motion.div key={activeTab}
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {faqs.length > 0 ? faqs.map((faq, i) => (
                    <motion.div key={faq.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }} className="hlp-faq">
                      <button className="hlp-faq-btn" onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}>
                        <span>{faq.question}</span>
                        <svg className={`hlp-chevron${expanded === faq.id ? " open" : ""}`} width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ flexShrink: 0 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <AnimatePresence>
                        {expanded === faq.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                            style={{ overflow: "hidden" }}>
                            <p className="hlp-faq-answer">{faq.answer}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )) : (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <p style={{ fontSize: 16, color: "#9e9488", margin: "0 0 8px" }}>No results for "{search}"</p>
                      <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#c2633a", fontWeight: 500, cursor: "pointer", fontSize: 14 }}>
                        Clear search
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
            className="hlp-contact" style={{ marginTop: 32 }}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 28, fontWeight: 600, margin: "0 0 8px" }}>Still need help?</h2>
            <p style={{ margin: "0 0 32px", opacity: .75, fontSize: 15 }}>We're here for you around the clock</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
              {[
                { icon: "💬", label: "Live Chat", sub: "Avg response: 2 min" },
                { icon: "📞", label: "Call Us", sub: "+1 (555) 123-4567" },
                { icon: "✉️", label: "Email Support", sub: "Response within 24hrs" },
              ].map((c, i) => (
                <motion.button key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="hlp-contact-btn">
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{c.icon}</div>
                  <p style={{ margin: "0 0 3px", fontWeight: 600, fontSize: 14 }}>{c.label}</p>
                  <p style={{ margin: 0, fontSize: 12, opacity: .7 }}>{c.sub}</p>
                </motion.button>
              ))}
            </div>

            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 16, padding: "20px", border: "1px solid rgba(255,255,255,0.15)" }}>
              <p style={{ margin: "0 0 12px", opacity: .7, fontSize: 14 }}>Don't have an account yet?</p>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="hlp-signup-btn">
                Sign up for free
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
