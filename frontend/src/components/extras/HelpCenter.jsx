import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
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
    return list.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
    );
  }, [activeTab, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-white text-stone-900">
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-700 px-6 pb-16 pt-28 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="mx-auto max-w-3xl font-serif text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-tight text-white">
            Hi, how can we help?
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 md:text-base">
            Search our help center or browse categories below
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <input
              className="w-full rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-white/35 focus:bg-white/15"
              placeholder="Search how-tos, FAQs and more..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </motion.div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-20 pt-12">
        <motion.div variants={stagger} initial="hidden" animate="visible" className="mb-10">
          <motion.h2 variants={fadeUp} className="mb-5 font-serif text-2xl font-semibold text-stone-900">
            Quick Links
          </motion.h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {QUICK_LINKS.map((l, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="rounded-xl border border-amber-200 bg-white p-4 text-center transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
              >
                <div className="mb-2 text-2xl">{l.icon}</div>
                <p className="text-xs font-semibold text-stone-900">{l.title}</p>
                <p className="text-[11px] text-stone-500">{l.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="overflow-hidden rounded-2xl border border-amber-200 bg-white"
        >
          <div className="flex flex-wrap gap-2 border-b border-amber-100 p-4">
            {TABS.map((tab, i) => (
              <button
                key={i}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === i
                    ? "bg-stone-900 text-white"
                    : "bg-amber-50 text-stone-600 hover:bg-amber-100"
                }`}
                onClick={() => {
                  setActiveTab(i);
                  setExpanded(null);
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            <h3 className="mb-4 font-serif text-xl font-semibold">Frequently Asked Questions</h3>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-2.5"
              >
                {faqs.length > 0 ? (
                  faqs.map((faq, i) => (
                    <motion.div
                      key={faq.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="overflow-hidden rounded-xl border border-amber-200"
                    >
                      <button
                        className="flex w-full items-center justify-between gap-3 bg-white px-4 py-4 text-left text-sm font-medium text-stone-900 transition hover:bg-amber-50"
                        onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
                      >
                        <span>{faq.question}</span>
                        <span className={`text-stone-400 transition ${expanded === faq.id ? "rotate-180" : ""}`}>
                          ▾
                        </span>
                      </button>

                      <AnimatePresence>
                        {expanded === faq.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="border-t border-amber-100 px-4 py-4 text-sm leading-7 text-stone-600">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-sm text-stone-500">No results for "{search}"</p>
                    <button className="mt-2 text-sm font-medium text-rose-700" onClick={() => setSearch("")}>
                      Clear search
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 rounded-2xl bg-gradient-to-r from-rose-700 to-amber-600 p-8 text-center text-white"
        >
          <h2 className="font-serif text-3xl font-semibold">Still need help?</h2>
          <p className="mt-2 text-sm text-white/80">We're here for you around the clock</p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              { icon: "💬", label: "Live Chat", sub: "Avg response: 2 min" },
              { icon: "📞", label: "Call Us", sub: "+1 (555) 123-4567" },
              { icon: "✉️", label: "Email Support", sub: "Response within 24hrs" },
            ].map((c, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-4 text-center transition hover:-translate-y-1 hover:bg-white/20"
              >
                <div className="mb-1 text-2xl">{c.icon}</div>
                <p className="text-sm font-semibold">{c.label}</p>
                <p className="text-xs text-white/80">{c.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
