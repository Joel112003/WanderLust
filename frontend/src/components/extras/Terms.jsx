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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-white text-stone-900">
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-700 px-6 pb-16 pt-28 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">
            📄 Legal
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl font-serif text-[clamp(2.1rem,5vw,3.6rem)] font-semibold leading-tight text-white">
            Terms & Conditions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
            By accessing or using WanderLust, you agree to be bound by these terms. Please read them carefully.
          </p>
          <span className="mt-3 inline-block text-xs text-white/45">Last Updated: June 2023</span>
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
              </div>
            </motion.div>
          ))}

          <motion.div variants={fadeUp} className="rounded-2xl bg-gradient-to-r from-rose-700 to-amber-600 p-8 text-white">
            <h2 className="font-serif text-3xl font-semibold">Contact Information</h2>
            <p className="mt-3 text-sm leading-7 text-white/85">Questions about these Terms? Reach our legal team:</p>
            <div className="my-5 h-px bg-white/25" />
            <p className="text-sm">
              📧{" "}
              <a href="mailto:support@wanderlust.com" className="underline decoration-white/70 underline-offset-4">
                support@wanderlust.com
              </a>
            </p>
            <p className="mt-2 text-xs leading-6 text-white/75">
              Legal Department · WanderLust Inc. · 123 Travel Street, Suite 100 · San Francisco, CA 94107
            </p>
            <p className="mt-4 text-xs italic text-white/70">
              These terms may be updated periodically. Continued use after changes constitutes acceptance.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
