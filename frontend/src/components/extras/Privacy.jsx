import React from "react";
import { motion } from "framer-motion";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-white text-stone-900">
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-700 px-6 pb-16 pt-28 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">
            🔐 Privacy
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl font-serif text-[clamp(2.1rem,5vw,3.6rem)] font-semibold leading-tight text-white">
            Privacy Policy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
            We're committed to protecting your privacy and being transparent about how your data is used.
          </p>
          <span className="mt-3 inline-block text-xs text-white/45">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </span>
        </motion.div>
      </div>

      <div className="mx-auto max-w-4xl px-6 pb-20 pt-12">
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-5">
          {sections.map((s) => (
            <motion.div
              key={s.id}
              variants={fadeUp}
              className={`overflow-hidden rounded-2xl border ${s.highlight ? "border-stone-800 bg-gradient-to-br from-stone-900 to-stone-800 text-white" : "border-amber-200 bg-white"}`}
            >
              <div className="p-7 md:p-8">
                <div className="mb-5 flex items-start gap-4">
                  <span className="text-3xl">{s.icon}</span>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-[0.1em] ${s.highlight ? "text-white/50" : "text-stone-400"}`}>
                      {s.number}
                    </p>
                    <h2 className="font-serif text-2xl font-semibold">{s.title}</h2>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {s.items.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${s.highlight ? "bg-amber-300" : "bg-amber-600"}`} />
                      <div>
                        <p className={`text-sm font-semibold ${s.highlight ? "text-white/90" : "text-stone-900"}`}>{item.label}</p>
                        <p className={`text-sm leading-6 ${s.highlight ? "text-white/70" : "text-stone-600"}`}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {s.note && (
                  <p className={`mt-4 rounded-lg px-4 py-3 text-xs leading-6 ${s.highlight ? "bg-white/10 text-white/80" : "bg-amber-50 text-stone-600"}`}>
                    ℹ️ {s.note}
                  </p>
                )}
              </div>
            </motion.div>
          ))}

          <motion.div variants={fadeUp} className="rounded-2xl bg-gradient-to-r from-rose-700 to-amber-600 p-8 text-white">
            <h2 className="font-serif text-3xl font-semibold">Contact Us</h2>
            <p className="mt-3 text-sm leading-7 text-white/85">Questions about this Privacy Policy? Reach our Data Protection Officer:</p>
            <div className="my-5 h-px bg-white/25" />
            <p className="text-sm">
              📧{" "}
              <a href="mailto:privacy@wanderlust.com" className="underline decoration-white/70 underline-offset-4">
                privacy@wanderlust.com
              </a>
            </p>
            <p className="mt-2 text-xs leading-6 text-white/75">
              WanderLust Inc. · 123 Travel Street, Suite 100 · San Francisco, CA 94107
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
