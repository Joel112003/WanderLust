import React, { useState } from "react";
import { motion } from "framer-motion";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const sections = [
  {
    id: "collect",
    number: "01",
    icon: "🗂️",
    title: "Information We Collect",
    items: [
      { label: "Personal Information", desc: "Name, email address, phone number, date of birth, passport details for bookings." },
      { label: "Usage Data", desc: "IP address, browser type, pages visited, time spent on pages, clickstream data." },
      { label: "Payment Information", desc: "Credit card details processed securely through our payment partners, billing address." },
    ],
  },
  {
    id: "use",
    number: "02",
    icon: "⚙️",
    title: "How We Use Your Information",
    items: [
      { label: "Bookings", desc: "Process and manage your reservations and stay confirmations." },
      { label: "Support", desc: "Provide customer support and respond promptly to inquiries." },
      { label: "Improvement", desc: "Improve our services, develop new features, and personalise your experience." },
      { label: "Marketing", desc: "Send promotional offers and travel recommendations — opt out anytime." },
      { label: "Security", desc: "Prevent fraud and ensure platform integrity for all users." },
      { label: "Compliance", desc: "Meet legal obligations and enforce our terms of service." },
    ],
  },
  {
    id: "security",
    number: "03",
    icon: "🔒",
    title: "Data Security Measures",
    highlight: true,
    items: [
      { label: "Encryption", desc: "SSL/TLS encryption across all data transmissions." },
      { label: "Audits", desc: "Regular security audits and penetration testing." },
      { label: "Access Controls", desc: "Strict authentication protocols and role-based access." },
      { label: "Minimisation", desc: "We only collect data we genuinely need." },
      { label: "Breach Notification", desc: "You and relevant authorities are notified within 72 hours of a confirmed breach." },
    ],
  },
  {
    id: "cookies",
    number: "04",
    icon: "🍪",
    title: "Cookies & Tracking",
    items: [
      { label: "Preferences", desc: "Remember your login information and settings across sessions." },
      { label: "Analytics", desc: "Analyse website traffic and usage patterns to improve the platform." },
      { label: "Personalisation", desc: "Deliver personalised content and relevant recommendations." },
    ],
    note: "You can control cookies through your browser settings. Disabling them may affect certain features.",
  },
  {
    id: "rights",
    number: "05",
    icon: "⚖️",
    title: "Your Rights",
    items: [
      { label: "Access", desc: "Request a copy of the personal data we hold about you." },
      { label: "Correction", desc: "Ask us to correct any inaccurate or incomplete data." },
      { label: "Deletion", desc: "Request deletion of your data, subject to legal limitations." },
      { label: "Restriction", desc: "Object to or restrict certain processing activities." },
      { label: "Withdrawal", desc: "Withdraw consent where processing is based on consent." },
      { label: "Complaint", desc: "Lodge a complaint with your local data protection authority." },
    ],
  },
];

export default function Privacy() {
  const [activeSection, setActiveSection] = useState(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .prv-root { font-family: 'DM Sans', sans-serif; background: #f9f7f4; min-height: 100vh; color: #1c1a17; }
        .prv-hero { background: linear-gradient(160deg, #1c1a17 0%, #2e2820 60%, #3d3228 100%); }
        .prv-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.7); font-size: 12px; letter-spacing: .1em; text-transform: uppercase; padding: 6px 14px; border-radius: 100px; }
        .prv-section { border: 1.5px solid #ebe8e2; border-radius: 20px; background: #fff; overflow: hidden; transition: border-color .2s, box-shadow .2s; }
        .prv-section:hover { border-color: #d4cfc6; box-shadow: 0 8px 32px rgba(0,0,0,0.07); }
        .prv-section.highlight { background: linear-gradient(135deg, #1c1a17 0%, #2e2820 100%); border-color: #1c1a17; color: #fff; }
        .prv-num { font-family: 'Lora', serif; font-size: 13px; color: #b5afa5; letter-spacing: .06em; }
        .prv-section.highlight .prv-num { color: rgba(255,255,255,0.4); }
        .prv-title { font-family: 'Lora', serif; font-size: 22px; font-weight: 600; margin: 0; }
        .prv-section.highlight .prv-title { color: #fff; }
        .prv-item-label { font-size: 13px; font-weight: 500; color: #1c1a17; margin: 0 0 2px; }
        .prv-section.highlight .prv-item-label { color: rgba(255,255,255,0.9); }
        .prv-item-desc { font-size: 13px; color: #7a7265; line-height: 1.6; margin: 0; }
        .prv-section.highlight .prv-item-desc { color: rgba(255,255,255,0.55); }
        .prv-dot { width: 6px; height: 6px; border-radius: 50%; background: #c2633a; flex-shrink: 0; margin-top: 6px; }
        .prv-section.highlight .prv-dot { background: #e8a430; }
        .prv-note { font-size: 12.5px; color: #9e9488; margin-top: 16px; padding: 12px 16px; background: #f9f7f4; border-radius: 10px; line-height: 1.6; }
        .prv-contact { background: linear-gradient(135deg, #c2633a 0%, #e8a430 100%); border-radius: 20px; padding: 40px; color: #fff; }
        .prv-contact-title { font-family: 'Lora', serif; font-size: 28px; font-weight: 600; margin: 0 0 8px; }
        .prv-link { color: #fff; text-decoration: underline; text-underline-offset: 3px; }
        .prv-divider { height: 1px; background: rgba(255,255,255,0.2); margin: 20px 0; }
      `}</style>

      <div className="prv-root">
        {/* Hero */}
        <div className="prv-hero" style={{ padding: "100px 24px 64px", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="prv-badge">🔐 Legal</span>
            <h1 style={{ fontFamily: "'Lora', serif", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 600, color: "#fff", margin: "20px 0 16px", lineHeight: 1.15 }}>
              Privacy Policy
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", maxWidth: 520, margin: "0 auto 24px", lineHeight: 1.7 }}>
              We're committed to protecting your privacy and being transparent about how your data is used.
            </p>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </motion.div>
        </div>

        {/* Sections */}
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px 80px" }}>
          <motion.div variants={stagger} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {sections.map((s) => (
              <motion.div key={s.id} variants={fadeUp} className={`prv-section${s.highlight ? " highlight" : ""}`}>
                <div style={{ padding: "28px 32px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
                    <span style={{ fontSize: 28, flexShrink: 0 }}>{s.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p className="prv-num">{s.number}</p>
                      <h2 className="prv-title">{s.title}</h2>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {s.items.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 12 }}>
                        <div className="prv-dot" />
                        <div>
                          <p className="prv-item-label">{item.label}</p>
                          <p className="prv-item-desc">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {s.note && <p className="prv-note">ℹ️ {s.note}</p>}
                </div>
              </motion.div>
            ))}

            {/* Contact */}
            <motion.div variants={fadeUp} className="prv-contact">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 28 }}>✉️</span>
                <h2 className="prv-contact-title">Contact Us</h2>
              </div>
              <p style={{ margin: "0 0 6px", fontSize: 14, opacity: .8, lineHeight: 1.7 }}>
                Questions about this Privacy Policy? Reach our Data Protection Officer:
              </p>
              <div className="prv-divider" />
              <p style={{ margin: "0 0 4px", fontSize: 14, opacity: .9 }}>
                📧 <a href="mailto:privacy@wanderlust.com" className="prv-link">privacy@wanderlust.com</a>
              </p>
              <p style={{ margin: 0, fontSize: 13, opacity: .65, lineHeight: 1.6 }}>
                WanderLust Inc. · 123 Travel Street, Suite 100 · San Francisco, CA 94107
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}