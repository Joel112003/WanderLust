import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7H10V9h4v1.765A4.5 4.5 0 0116 8zM2 9h4v12H2z"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5M5 12l7-7 7 7"/>
  </svg>
);

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/airbnb/",
    icon: <InstagramIcon />,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/airbnb/",
    icon: <FacebookIcon />,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/joelkunjumon",
    icon: <LinkedInIcon />,
  },
];

const LINKS = [
  { label: "Privacy Policy",   to: "/privacy"  },
  { label: "Terms of Service", to: "/terms"    },
  { label: "Contact Us",       to: "/contact"  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 14 } },
};

export default function Footer() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <footer className="relative mt-auto w-full border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto max-w-2xl px-6 py-8 flex flex-col items-center gap-5"
        >
<motion.p variants={item}
            className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Follow us on social media
          </motion.p>
<motion.div variants={item} className="flex items-center gap-3">
            {SOCIALS.map(({ label, href, icon }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.92 }}
                className={`flex h-[42px] w-[42px] items-center justify-center rounded-xl transition-colors duration-200 ${
                  label === "Instagram"
                    ? "bg-rose-100 text-rose-600 hover:bg-rose-200"
                    : label === "Facebook"
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "bg-sky-100 text-sky-700 hover:bg-sky-200"
                }`}
              >
                {icon}
              </motion.a>
            ))}
          </motion.div>
<motion.div variants={item}
            className="w-3/4 border-t border-gray-100" />
<motion.nav variants={item} className="flex items-center gap-6 flex-wrap justify-center">
            {LINKS.map(({ label, to }) => (
              <motion.div key={to} whileHover={{ scale: 1.04 }}>
                <Link
                  to={to}
                  className="text-sm font-medium text-indigo-500 hover:text-indigo-700 transition-colors duration-150"
                >
                  {label}
                </Link>
              </motion.div>
            ))}
          </motion.nav>
<motion.p variants={item} className="text-xs text-gray-400 text-center">
            &copy; {new Date().getFullYear()} WanderLust Private Limited. All rights reserved.
          </motion.p>

        </motion.div>
      </footer>
<AnimatePresence>
        {showTop && (
          <motion.button
            key="back-to-top"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            whileHover={{ scale: 1.12, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll back to top"
            className="fixed bottom-8 right-8 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-shadow hover:shadow-xl"
          >
            <ArrowUpIcon />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
