import React from "react";
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
    id: "use",
    number: "01",
    icon: "📋",
    title: "Use of the Platform",
    items: [
      { label: "Eligibility", desc: "You must be at least 18 years old to use our services. By using WanderLust, you confirm you meet this requirement." },
      { label: "Prohibited Activities", desc: "You agree not to violate laws, post false information, use the service fraudulently, attempt unauthorized system access, or interfere with other users' experience." },
      { label: "Account Security", desc: "You are responsible for maintaining the confidentiality of your credentials and all activities under your account." },
    ],
  },
  {
    id: "booking",
    number: "02",
    icon: "🗓️",
    title: "Booking Policies",
    items: [
      { label: "Payment Terms", desc: "Full payment may be required at booking or per the property's specific payment policy. We accept major credit cards and other listed methods." },
      { label: "Standard Cancellation", desc: "Free cancellation up to 48 hours before check-in." },
      { label: "Moderate Cancellation", desc: "Free cancellation up to 5 days before check-in." },
      { label: "Strict Cancellation", desc: "50% refund available up to 1 week before check-in." },
      { label: "Changes", desc: "Modifications are subject to availability and may incur additional charges." },
      { label: "Taxes & Fees", desc: "All prices exclude applicable taxes and fees, which are displayed before confirmation." },
    ],
  },
  {
    id: "refunds",
    number: "03",
    icon: "💳",
    title: "Cancellations & Refunds",
    highlight: true,
    items: [
      { label: "Processing Time", desc: "Refunds are processed within 7–10 business days to the original payment method." },
      { label: "No-shows", desc: "No-shows are charged the full reservation amount." },
      { label: "Early Departures", desc: "Early departures do not qualify for refunds." },
      { label: "Extenuating Circumstances", desc: "Considered on a case-by-case basis — contact support promptly." },
      { label: "COVID-19", desc: "Refer to our special policy published in the Help Center for pandemic-related cancellations." },
    ],
  },
  {
    id: "liability",
    number: "04",
    icon: "⚖️",
    title: "Liability & Disputes",
    items: [
      { label: "Property Conditions", desc: "WanderLust acts as an intermediary. We're not responsible for property conditions but will assist in resolving legitimate complaints." },
      { label: "Dispute Window", desc: "Disputes must be reported within 24 hours of check-in. We mediate in good faith but cannot guarantee resolutions." },
      { label: "Limitation", desc: "Our maximum liability for any claim is limited to the amount you paid for the booking in question." },
    ],
  },
  {
    id: "ip",
    number: "05",
    icon: "©️",
    title: "Intellectual Property",
    items: [
      { label: "Copyright", desc: "All platform content — text, graphics, logos, and software — is our property or licensed to us. Reproduction requires express permission." },
      { label: "User Content", desc: "By posting content, you grant us a worldwide licence to use it for platform operations and marketing." },
      { label: "Trademarks", desc: "WanderLust's name and logo are registered trademarks and may not be used without permission." },
    ],
  },
];

export default function Terms() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .trm-root { font-family: 'DM Sans', sans-serif; background: #f9f7f4; min-height: 100vh; color: #1c1a17; }
        .trm-hero { background: linear-gradient(160deg, #1a2332 0%, #1e2d42 60%, #243451 100%); }
        .trm-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.7); font-size: 12px; letter-spacing: .1em; text-transform: uppercase; padding: 6px 14px; border-radius: 100px; }
        .trm-section { border: 1.5px solid #ebe8e2; border-radius: 20px; background: #fff; overflow: hidden; transition: border-color .2s, box-shadow .2s; }
        .trm-section:hover { border-color: #d4cfc6; box-shadow: 0 8px 32px rgba(0,0,0,0.07); }
        .trm-section.highlight { background: linear-gradient(135deg, #1a2332 0%, #243451 100%); border-color: #1a2332; }
        .trm-num { font-family: 'Lora', serif; font-size: 13px; color: #b5afa5; letter-spacing: .06em; }
        .trm-section.highlight .trm-num { color: rgba(255,255,255,0.35); }
        .trm-title { font-family: 'Lora', serif; font-size: 22px; font-weight: 600; margin: 0; color: #1c1a17; }
        .trm-section.highlight .trm-title { color: #fff; }
        .trm-item-label { font-size: 13px; font-weight: 500; color: #1c1a17; margin: 0 0 2px; }
        .trm-section.highlight .trm-item-label { color: rgba(255,255,255,0.9); }
        .trm-item-desc { font-size: 13px; color: #7a7265; line-height: 1.6; margin: 0; }
        .trm-section.highlight .trm-item-desc { color: rgba(255,255,255,0.5); }
        .trm-dot { width: 6px; height: 6px; border-radius: 50%; background: #3b7dd8; flex-shrink: 0; margin-top: 6px; }
        .trm-section.highlight .trm-dot { background: #7ab3f0; }
        .trm-contact { background: linear-gradient(135deg, #1a2332 0%, #2a4a7a 100%); border-radius: 20px; padding: 40px; color: #fff; }
        .trm-contact-title { font-family: 'Lora', serif; font-size: 28px; font-weight: 600; margin: 0 0 8px; }
        .trm-link { color: #7ab3f0; text-decoration: underline; text-underline-offset: 3px; }
        .trm-divider { height: 1px; background: rgba(255,255,255,0.15); margin: 20px 0; }
        .trm-chip { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 100px; background: rgba(59,125,216,0.12); border: 1px solid rgba(59,125,216,0.2); color: #3b7dd8; font-size: 12px; font-weight: 500; }
      `}</style>

      <div className="trm-root">
        {/* Hero */}
        <div className="trm-hero" style={{ padding: "100px 24px 64px", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="trm-badge">📄 Legal</span>
            <h1 style={{ fontFamily: "'Lora', serif", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 600, color: "#fff", margin: "20px 0 16px", lineHeight: 1.15 }}>
              Terms & Conditions
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", maxWidth: 520, margin: "0 auto 24px", lineHeight: 1.7 }}>
              By accessing or using WanderLust, you agree to be bound by these terms. Please read them carefully.
            </p>
            <span className="trm-chip">Last Updated: June 2023</span>
          </motion.div>
        </div>

        {/* Sections */}
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px 80px" }}>
          <motion.div variants={stagger} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {sections.map((s) => (
              <motion.div key={s.id} variants={fadeUp} className={`trm-section${s.highlight ? " highlight" : ""}`}>
                <div style={{ padding: "28px 32px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
                    <span style={{ fontSize: 28, flexShrink: 0 }}>{s.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p className="trm-num">{s.number}</p>
                      <h2 className="trm-title">{s.title}</h2>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {s.items.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 12 }}>
                        <div className="trm-dot" />
                        <div>
                          <p className="trm-item-label">{item.label}</p>
                          <p className="trm-item-desc">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Contact */}
            <motion.div variants={fadeUp} className="trm-contact">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 28 }}>💬</span>
                <h2 className="trm-contact-title">Contact Information</h2>
              </div>
              <p style={{ margin: "0 0 6px", fontSize: 14, opacity: .75, lineHeight: 1.7 }}>
                Questions about these Terms? Reach our legal team:
              </p>
              <div className="trm-divider" />
              <p style={{ margin: "0 0 4px", fontSize: 14, opacity: .9 }}>
                📧 <a href="mailto:support@wanderlust.com" className="trm-link">support@wanderlust.com</a>
              </p>
              <p style={{ margin: "0 0 16px", fontSize: 13, opacity: .55, lineHeight: 1.6 }}>
                Legal Department · WanderLust Inc. · 123 Travel Street, Suite 100 · San Francisco, CA 94107
              </p>
              <p style={{ margin: 0, fontSize: 12.5, opacity: .45, fontStyle: "italic" }}>
                These terms may be updated periodically. Continued use after changes constitutes acceptance.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}