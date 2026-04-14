import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  MapPin,
  Calendar,
  Users,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Loader2,
  X,
} from "lucide-react";

const API = import.meta.env.VITE_APP_API_URL || "http://localhost:8000";

const DESTINATIONS = [
  { name: "Udaipur, Rajasthan", desc: "City of Lakes", emoji: "🏰", tags: ["Romantic", "Historical"] },
  { name: "North Goa, Goa", desc: "Beach Paradise", emoji: "🏖️", tags: ["Relaxing", "Coastal"] },
  { name: "Mumbai, Maharashtra", desc: "City of Dreams", emoji: "🌃", tags: ["Urban", "Vibrant"] },
  { name: "Jaipur, Rajasthan", desc: "Pink City", emoji: "🏯", tags: ["Cultural", "Heritage"] },
  { name: "Lonavala, Maharashtra", desc: "Hill Station Retreat", emoji: "⛰️", tags: ["Scenic", "Peaceful"] },
  { name: "Manali, Himachal", desc: "Snow & Serenity", emoji: "🏔️", tags: ["Adventure", "Nature"] },
];

const GUEST_TYPES = [
  { key: "adults", label: "Adults", desc: "Ages 13+", emoji: "👤", max: 16 },
  { key: "children", label: "Children", desc: "Ages 2–12", emoji: "🧒", max: 8 },
  { key: "infants", label: "Infants", desc: "Under 2", emoji: "👶", max: 5 },
  { key: "pets", label: "Pets", desc: "Service animals", emoji: "🐾", max: 3 },
];

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const sod = (d) => {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
};
const today = () => sod(new Date());
const fmtD = (d) =>
  d ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : null;
const sameD = (a, b) => a && b && sod(a).getTime() === sod(b).getTime();

const MiniCalendar = ({ checkIn, checkOut, onChange }) => {
  const now = new Date();
  const [view, setView] = useState(new Date(now.getFullYear(), now.getMonth(), 1));

  const yr = view.getFullYear();
  const mo = view.getMonth();
  const dim = new Date(yr, mo + 1, 0).getDate();
  const fdw = new Date(yr, mo, 1).getDay();

  const phase = !checkIn ? "pickIn" : !checkOut ? "pickOut" : "done";

  const handleDay = (d) => {
    if (sod(d) < today()) return;
    if (phase === "pickIn" || phase === "done") {
      onChange(sod(d), null);
    } else if (sod(d) < sod(checkIn)) {
      onChange(sod(d), sod(checkIn));
    } else {
      onChange(checkIn, sod(d));
    }
  };

  const monthLabel = view.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="min-w-[300px] max-[420px]:min-w-0">
      <div className="mb-3 flex items-center justify-between">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-[#ede8e8] text-[#666] transition-colors hover:border-[#e03030] hover:text-[#e03030]"
          onClick={() => setView(new Date(yr, mo - 1, 1))}
        >
          <ChevronLeft size={15} />
        </button>
        <span className="font-serif text-[14.5px] font-semibold text-[#111]">{monthLabel}</span>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-[#ede8e8] text-[#666] transition-colors hover:border-[#e03030] hover:text-[#e03030]"
          onClick={() => setView(new Date(yr, mo + 1, 1))}
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <p className="mb-3 text-center text-[11.5px] text-[#bbb]">
        {phase === "pickIn"
          ? "Select check-in date"
          : phase === "pickOut"
            ? "Now select check-out"
            : `${fmtD(checkIn)} → ${fmtD(checkOut)}`}
      </p>

      <div className="grid grid-cols-7 gap-1">
        {WD.map((w) => (
          <div key={w} className="py-1 text-center text-[11px] font-bold tracking-[0.03em] text-[#ccc]">
            {w}
          </div>
        ))}

        {Array.from({ length: fdw }, (_, i) => (
          <div key={`e${i}`} />
        ))}

        {Array.from({ length: dim }, (_, i) => {
          const d = sod(new Date(yr, mo, i + 1));
          const isPast = d < today();
          const isCIn = sameD(d, checkIn);
          const isCOut = sameD(d, checkOut);
          const inRng = checkIn && checkOut && d > checkIn && d < checkOut;
          const isToday = sameD(d, today());

          return (
            <button
              key={i}
              disabled={isPast}
              onClick={() => handleDay(d)}
              className={[
                "aspect-square w-full border-none p-0 text-[12.5px] transition-colors",
                isPast ? "cursor-not-allowed text-[#ddd]" : "cursor-pointer text-[#222]",
                !isPast && !isCIn && !isCOut ? "hover:bg-[#ffe8e8] hover:text-[#e03030]" : "",
                inRng ? "rounded-none bg-[#fff0ef] text-[#e03030]" : "rounded-full",
                isToday && !isCIn && !isCOut ? "font-semibold outline outline-[1.5px] outline-[#e03030]" : "",
                isCIn || isCOut ? "bg-[#e03030] font-bold text-white" : "",
                isCIn && checkOut ? "rounded-l-full rounded-r-none" : "",
                isCOut && checkIn ? "rounded-l-none rounded-r-full" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#f5f0f0] pt-3">
        <button
          className="text-[12.5px] font-medium text-[#bbb] underline transition-colors hover:text-[#e03030]"
          onClick={() => onChange(null, null)}
        >
          Clear dates
        </button>
        {checkIn && checkOut && (
          <span className="text-[12.5px] font-semibold text-[#555]">
            {fmtD(checkIn)} → {fmtD(checkOut)}
          </span>
        )}
      </div>
    </div>
  );
};

const GuestsPanel = ({ guests, onChange }) => {
  const total = Object.values(guests).reduce((a, b) => a + b, 0);

  const step = (key, delta) => {
    const cfg = GUEST_TYPES.find((g) => g.key === key);
    onChange({
      ...guests,
      [key]: Math.max(0, Math.min(cfg.max, guests[key] + delta)),
    });
  };

  return (
    <div className="flex flex-col gap-1">
      {GUEST_TYPES.map(({ key, label, desc, emoji, max }) => (
        <div key={key} className="flex items-center justify-between border-b border-[#f5f0f0] px-1 py-3 last:border-b-0">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#fdf4f4] text-[22px]">{emoji}</span>
            <div>
              <p className="text-[13.5px] font-semibold leading-tight text-[#1a1a1a]">{label}</p>
              <p className="text-[11.5px] text-[#bbb]">{desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-[#ddd] bg-white text-[#555] transition-colors hover:border-[#e03030] hover:bg-[#fff5f5] hover:text-[#e03030] disabled:cursor-not-allowed disabled:opacity-30"
              disabled={guests[key] === 0}
              onClick={() => step(key, -1)}
            >
              <Minus size={13} />
            </button>
            <span className="min-w-[22px] text-center text-[15px] font-semibold text-[#111]">{guests[key]}</span>
            <button
              className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-[#ddd] bg-white text-[#555] transition-colors hover:border-[#e03030] hover:bg-[#fff5f5] hover:text-[#e03030] disabled:cursor-not-allowed disabled:opacity-30"
              disabled={guests[key] >= max}
              onClick={() => step(key, 1)}
            >
              <Plus size={13} />
            </button>
          </div>
        </div>
      ))}
      <p className="mt-2 border-t border-[#f5f0f0] pt-2 text-right text-[12px] text-[#bbb]">
        {total} {total === 1 ? "guest" : "guests"} selected
      </p>
    </div>
  );
};

const DD_ANIM = {
  hidden: { opacity: 0, y: -10, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.14 } },
};

const Dropdown = ({ children, className = "" }) => (
  <motion.div
    variants={DD_ANIM}
    initial="hidden"
    animate="show"
    exit="exit"
    className={`absolute left-0 top-[calc(100%+10px)] z-[9999] min-w-[300px] rounded-[22px] border border-[#ede8e8] bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.12),0_6px_16px_rgba(0,0,0,0.06)] max-[680px]:fixed max-[680px]:left-3 max-[680px]:right-3 max-[680px]:w-auto max-[680px]:min-w-0 max-[420px]:left-2 max-[420px]:right-2 max-[420px]:rounded-[14px] max-[420px]:p-3 ${className}`}
  >
    {children}
  </motion.div>
);

const HeroSearch = () => {
  const navigate = useNavigate();

  const [dest, setDest] = useState("");
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState({ adults: 2, children: 0, infants: 0, pets: 0 });
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);

  const wrapRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (!wrapRef.current?.contains(e.target)) setActive(null);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggle = (f) => setActive((a) => (a === f ? null : f));
  const totalGuests = Object.values(guests).reduce((a, b) => a + b, 0);

  const filtered = DESTINATIONS.filter(
    (d) =>
      d.name.toLowerCase().includes(dest.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(dest.toLowerCase()))
  );

  const dateLabel =
    checkIn && checkOut
      ? `${fmtD(checkIn)} → ${fmtD(checkOut)}`
      : checkIn
        ? `${fmtD(checkIn)} → …`
        : "Add dates";

  const handleSearch = async () => {
    if (!dest.trim()) return toast.error("Please enter a destination");

    const qs = new URLSearchParams({ destination: dest });

    setLoading(true);
    const tid = toast.loading("Searching…");
    try {
      const r = await fetch(`${API}/listings/search?${qs}`);
      const d = await r.json();
      toast.dismiss(tid);
      if (!r.ok || !d.success) {
        toast("No listings matched your criteria.", { icon: "🔍" });
        return;
      }
      localStorage.setItem("searchResults", JSON.stringify(d.data));
      localStorage.setItem("searchCriteria", JSON.stringify({ destination: dest }));
      toast.success(`Found ${d.data.length} stay${d.data.length !== 1 ? "s" : ""}!`);
      navigate("/search-results");
    } catch {
      toast.dismiss(tid);
      toast.error("Search failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-[100] flex w-full justify-center px-4 pb-5 pt-20 max-[420px]:px-2.5 max-[420px]:pb-3.5 max-[420px]:pt-[74px]" ref={wrapRef}>
      <div className="flex w-full max-w-[820px] items-center gap-0 rounded-[60px] border border-[#e5e0e0] bg-white p-1.5 shadow-[0_4px_28px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] max-[680px]:flex-col max-[680px]:rounded-[22px] max-[680px]:p-2">
        <div className="relative min-w-0 flex-1">
          <button
            className={`flex w-full items-center gap-2.5 rounded-[52px] border-2 px-[18px] py-2.5 text-left transition-all max-[680px]:rounded-[14px] max-[420px]:gap-2 max-[420px]:px-2.5 max-[420px]:py-[9px] ${
              active === "dest"
                ? "border-[#e03030] bg-[#fff8f8] shadow-[0_0_0_3px_rgba(224,48,48,0.1)]"
                : "border-transparent hover:bg-[#fdf6f6]"
            }`}
            onClick={() => toggle("dest")}
          >
            <MapPin size={15} className="shrink-0 text-[#e03030]" />
            <div className="flex min-w-0 flex-1 flex-col gap-px">
              <span className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-[#bbb] max-[420px]:text-[9px]">WHERE</span>
              <span className={`truncate text-[13.5px] max-[420px]:text-xs ${!dest ? "font-normal text-[#aaa]" : "font-medium text-[#111]"}`}>
                {dest || "Search destinations"}
              </span>
            </div>
            <ChevronDown size={13} className={`shrink-0 text-[#bbb] transition-all duration-200 ${active === "dest" ? "rotate-180 text-[#e03030]" : ""}`} />
          </button>

          <AnimatePresence>
            {active === "dest" && (
              <Dropdown>
                <div className="mb-3.5 flex items-center gap-2 rounded-xl border border-[#ede8e8] bg-[#faf8f8] px-3.5 py-2.5 transition-colors focus-within:border-[#e03030]">
                  <Search size={14} className="shrink-0 text-[#ccc]" />
                  <input
                    autoFocus
                    className="flex-1 border-none bg-transparent text-[13.5px] text-[#111] outline-none placeholder:text-[#bbb]"
                    placeholder="Search a city or region…"
                    value={dest}
                    onChange={(e) => setDest(e.target.value)}
                  />
                  {dest && (
                    <button className="p-0.5 text-[#ccc] transition-colors hover:text-[#e03030]" onClick={() => setDest("")}>
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className="flex max-h-[280px] flex-col gap-0.5 overflow-y-auto [scrollbar-color:#f0e8e8_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-[#f0e8e8] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent">
                  {filtered.length === 0 ? (
                    <p className="py-7 text-center text-[13px] text-[#bbb]">No destinations found</p>
                  ) : (
                    filtered.map((d) => (
                      <button
                        key={d.name}
                        className="flex w-full items-center gap-3.5 rounded-[14px] bg-transparent px-3.5 py-3 text-left transition-colors hover:bg-[#fff4f4] max-[420px]:gap-2.5 max-[420px]:px-2.5 max-[420px]:py-2.5"
                        onClick={() => {
                          setDest(d.name);
                          setActive(null);
                        }}
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fdf4f4] text-[28px] leading-none max-[420px]:h-9 max-[420px]:w-9 max-[420px]:text-xl">
                          {d.emoji}
                        </span>
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <span className="text-sm font-semibold text-[#1a1a1a]">{d.name}</span>
                          <span className="text-xs text-[#aaa]">{d.desc}</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {d.tags.map((t) => (
                              <span key={t} className="rounded-[20px] bg-[#fff0ef] px-2 py-0.5 text-[11px] font-medium text-[#e03030]">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </Dropdown>
            )}
          </AnimatePresence>
        </div>

        <div className="h-[30px] w-px shrink-0 bg-[#e5e0e0] max-[680px]:h-px max-[680px]:w-full" />

        <div className="relative min-w-0 flex-1">
          <button
            className={`flex w-full items-center gap-2.5 rounded-[52px] border-2 px-[18px] py-2.5 text-left transition-all max-[680px]:rounded-[14px] max-[420px]:gap-2 max-[420px]:px-2.5 max-[420px]:py-[9px] ${
              active === "dates"
                ? "border-[#e03030] bg-[#fff8f8] shadow-[0_0_0_3px_rgba(224,48,48,0.1)]"
                : "border-transparent hover:bg-[#fdf6f6]"
            }`}
            onClick={() => toggle("dates")}
          >
            <Calendar size={15} className="shrink-0 text-[#e03030]" />
            <div className="flex min-w-0 flex-1 flex-col gap-px">
              <span className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-[#bbb] max-[420px]:text-[9px]">WHEN</span>
              <span className={`truncate text-[13.5px] max-[420px]:text-xs ${!checkIn ? "font-normal text-[#aaa]" : "font-medium text-[#111]"}`}>
                {dateLabel}
              </span>
            </div>
            <ChevronDown size={13} className={`shrink-0 text-[#bbb] transition-all duration-200 ${active === "dates" ? "rotate-180 text-[#e03030]" : ""}`} />
          </button>

          <AnimatePresence>
            {active === "dates" && (
              <Dropdown className="min-w-[340px]">
                <MiniCalendar
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onChange={(ci, co) => {
                    setCheckIn(ci);
                    setCheckOut(co);
                    if (ci && co) setActive(null);
                  }}
                />
              </Dropdown>
            )}
          </AnimatePresence>
        </div>

        <div className="h-[30px] w-px shrink-0 bg-[#e5e0e0] max-[680px]:h-px max-[680px]:w-full" />

        <div className="relative min-w-0 flex-1">
          <button
            className={`flex w-full items-center gap-2.5 rounded-[52px] border-2 px-[18px] py-2.5 text-left transition-all max-[680px]:rounded-[14px] max-[420px]:gap-2 max-[420px]:px-2.5 max-[420px]:py-[9px] ${
              active === "guests"
                ? "border-[#e03030] bg-[#fff8f8] shadow-[0_0_0_3px_rgba(224,48,48,0.1)]"
                : "border-transparent hover:bg-[#fdf6f6]"
            }`}
            onClick={() => toggle("guests")}
          >
            <Users size={15} className="shrink-0 text-[#e03030]" />
            <div className="flex min-w-0 flex-1 flex-col gap-px">
              <span className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-[#bbb] max-[420px]:text-[9px]">WHO</span>
              <span className={`truncate text-[13.5px] max-[420px]:text-xs ${totalGuests === 0 ? "font-normal text-[#aaa]" : "font-medium text-[#111]"}`}>
                {totalGuests > 0 ? `${totalGuests} guest${totalGuests !== 1 ? "s" : ""}` : "Add guests"}
              </span>
            </div>
            <ChevronDown size={13} className={`shrink-0 text-[#bbb] transition-all duration-200 ${active === "guests" ? "rotate-180 text-[#e03030]" : ""}`} />
          </button>

          <AnimatePresence>
            {active === "guests" && (
              <Dropdown className="left-auto right-0 min-w-[320px]">
                <GuestsPanel guests={guests} onChange={setGuests} />
              </Dropdown>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          className="ml-0.5 flex shrink-0 items-center gap-1.5 rounded-[52px] border-none bg-gradient-to-br from-[#e03030] to-[#c91a1a] px-[26px] py-[13px] text-sm font-semibold tracking-[0.02em] text-white shadow-[0_6px_22px_rgba(201,26,26,0.32)] transition-shadow hover:shadow-[0_10px_30px_rgba(201,26,26,0.44)] disabled:cursor-not-allowed disabled:opacity-70 max-[680px]:mt-1.5 max-[680px]:w-full max-[680px]:justify-center max-[680px]:rounded-[14px]"
          onClick={handleSearch}
          disabled={loading}
          whileHover={!loading ? { scale: 1.05 } : {}}
          whileTap={!loading ? { scale: 0.95 } : {}}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          <span>{loading ? "Searching…" : "Search"}</span>
        </motion.button>
      </div>
    </div>
  );
};

export default HeroSearch;