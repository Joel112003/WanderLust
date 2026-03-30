import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  MapPin, Calendar, Users, Search,
  ChevronDown, ChevronLeft, ChevronRight,
  Plus, Minus, Loader2, X,
} from "lucide-react";
import "../../utilis/css/HeroSearch.css";

const API = import.meta.env.VITE_APP_API_URL || "http://localhost:8000";

const DESTINATIONS = [
  { name: "Udaipur, Rajasthan",    desc: "City of Lakes",        emoji: "🏰", tags: ["Romantic", "Historical"] },
  { name: "North Goa, Goa",        desc: "Beach Paradise",       emoji: "🏖️", tags: ["Relaxing", "Coastal"]   },
  { name: "Mumbai, Maharashtra",   desc: "City of Dreams",       emoji: "🌃", tags: ["Urban", "Vibrant"]      },
  { name: "Jaipur, Rajasthan",     desc: "Pink City",            emoji: "🏯", tags: ["Cultural", "Heritage"]  },
  { name: "Lonavala, Maharashtra", desc: "Hill Station Retreat", emoji: "⛰️", tags: ["Scenic", "Peaceful"]    },
  { name: "Manali, Himachal",      desc: "Snow & Serenity",      emoji: "🏔️", tags: ["Adventure", "Nature"]  },
];

const GUEST_TYPES = [
  { key: "adults",   label: "Adults",   desc: "Ages 13+",        emoji: "👤", max: 16 },
  { key: "children", label: "Children", desc: "Ages 2–12",       emoji: "🧒", max: 8  },
  { key: "infants",  label: "Infants",  desc: "Under 2",         emoji: "👶", max: 5  },
  { key: "pets",     label: "Pets",     desc: "Service animals", emoji: "🐾", max: 3  },
];

const WD = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const sod   = d => { const c = new Date(d); c.setHours(0,0,0,0); return c; };
const today = () => sod(new Date());
const fmtD  = d => d ? d.toLocaleDateString("en-IN",{day:"numeric",month:"short"}) : null;
const sameD = (a,b) => a && b && sod(a).getTime() === sod(b).getTime();

const MiniCalendar = ({ checkIn, checkOut, onChange }) => {
  const now   = new Date();
  const [view, setView] = useState(new Date(now.getFullYear(), now.getMonth(), 1));

  const yr  = view.getFullYear();
  const mo  = view.getMonth();
  const dim = new Date(yr, mo + 1, 0).getDate();
  const fdw = new Date(yr, mo, 1).getDay();

  const phase = !checkIn ? "pickIn" : !checkOut ? "pickOut" : "done";

  const handleDay = d => {
    if (sod(d) < today()) return;
    if (phase === "pickIn" || phase === "done") {
      onChange(sod(d), null);
    } else {
      if (sod(d) < sod(checkIn)) onChange(sod(d), sod(checkIn));
      else                        onChange(checkIn, sod(d));
    }
  };

  const monthLabel = view.toLocaleDateString("en-IN",{month:"long",year:"numeric"});

  return (
    <div className="hs-cal">
<div className="hs-cal-nav">
        <button className="hs-cal-nav-btn" onClick={() => setView(new Date(yr, mo-1, 1))}>
          <ChevronLeft size={15}/>
        </button>
        <span className="hs-cal-month">{monthLabel}</span>
        <button className="hs-cal-nav-btn" onClick={() => setView(new Date(yr, mo+1, 1))}>
          <ChevronRight size={15}/>
        </button>
      </div>
<p className="hs-cal-hint">
        {phase === "pickIn"  ? "Select check-in date"  :
         phase === "pickOut" ? "Now select check-out"  :
         `${fmtD(checkIn)} → ${fmtD(checkOut)}`}
      </p>
<div className="hs-cal-grid">
        {WD.map(w => <div key={w} className="hs-cal-wh">{w}</div>)}
{Array.from({length: fdw}, (_,i) => <div key={`e${i}`}/>)}
{Array.from({length: dim}, (_,i) => {
          const d      = sod(new Date(yr, mo, i+1));
          const isPast = d < today();
          const isCIn  = sameD(d, checkIn);
          const isCOut = sameD(d, checkOut);
          const inRng  = checkIn && checkOut && d > checkIn && d < checkOut;
          const isToday= sameD(d, today());

          return (
            <button
              key={i}
              disabled={isPast}
              onClick={() => handleDay(d)}
              className={[
                "hs-cal-day",
                isPast  ? "past"  : "",
                isCIn   ? "sel-in"  : "",
                isCOut  ? "sel-out" : "",
                inRng   ? "range"   : "",
                isToday && !isCIn && !isCOut ? "tod" : "",
              ].filter(Boolean).join(" ")}
            >
              {i+1}
            </button>
          );
        })}
      </div>
<div className="hs-cal-footer">
        <button className="hs-cal-clear" onClick={() => onChange(null, null)}>
          Clear dates
        </button>
        {checkIn && checkOut && (
          <span className="hs-cal-sel-label">
            {fmtD(checkIn)} → {fmtD(checkOut)}
          </span>
        )}
      </div>
    </div>
  );
};

const GuestsPanel = ({ guests, onChange }) => {
  const total = Object.values(guests).reduce((a,b)=>a+b,0);
  const step = (key, delta) => {
    const cfg = GUEST_TYPES.find(g=>g.key===key);
    onChange({ ...guests, [key]: Math.max(0, Math.min(cfg.max, guests[key]+delta)) });
  };
  return (
    <div className="hs-guests-panel">
      {GUEST_TYPES.map(({key,label,desc,emoji,max})=>(
        <div key={key} className="hs-guest-row">
          <div className="hs-guest-left">
            <span className="hs-guest-emoji">{emoji}</span>
            <div>
              <p className="hs-guest-label">{label}</p>
              <p className="hs-guest-desc">{desc}</p>
            </div>
          </div>
          <div className="hs-guest-ctrl">
            <button
              className="hs-step-btn"
              disabled={guests[key]===0}
              onClick={()=>step(key,-1)}
            ><Minus size={13}/></button>
            <span className="hs-step-val">{guests[key]}</span>
            <button
              className="hs-step-btn"
              disabled={guests[key]>=max}
              onClick={()=>step(key,1)}
            ><Plus size={13}/></button>
          </div>
        </div>
      ))}
      <p className="hs-guest-total">
        {total} {total===1?"guest":"guests"} selected
      </p>
    </div>
  );
};

const DD_ANIM = {
  hidden: { opacity:0, y:-10, scale:0.97 },
  show:   { opacity:1, y:0,   scale:1,    transition:{duration:0.18,ease:"easeOut"} },
  exit:   { opacity:0, y:-8,  scale:0.97, transition:{duration:0.14} },
};

const Dropdown = ({ children, style={} }) => (
  <motion.div
    variants={DD_ANIM} initial="hidden" animate="show" exit="exit"
    className="hs-dropdown" style={style}
  >
    {children}
  </motion.div>
);

const HeroSearch = () => {
  const navigate = useNavigate();

  const [dest,      setDest]      = useState("");
  const [checkIn,   setCheckIn]   = useState(null);
  const [checkOut,  setCheckOut]  = useState(null);
  const [guests,    setGuests]    = useState({adults:2,children:0,infants:0,pets:0});
  const [active,    setActive]    = useState(null);
  const [loading,   setLoading]   = useState(false);

  const wrapRef = useRef(null);

  useEffect(() => {
    const h = e => {
      if (!wrapRef.current?.contains(e.target)) setActive(null);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggle = f => setActive(a => a===f ? null : f);

  const totalGuests = Object.values(guests).reduce((a,b)=>a+b,0);

  const filtered = DESTINATIONS.filter(d =>
    d.name.toLowerCase().includes(dest.toLowerCase()) ||
    d.tags.some(t => t.toLowerCase().includes(dest.toLowerCase()))
  );

  const dateLabel = checkIn && checkOut
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
        toast("No listings matched your criteria.", {icon:"🔍"});
        return;
      }
      localStorage.setItem("searchResults",  JSON.stringify(d.data));
      localStorage.setItem("searchCriteria", JSON.stringify({
        destination: dest,
      }));
      toast.success(`Found ${d.data.length} stay${d.data.length!==1?"s":""}!`);
      navigate("/search-results");
    } catch {
      toast.dismiss(tid);
      toast.error("Search failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <div className="hs-outer" ref={wrapRef}>
        <div className="hs-bar">
<div className={`hs-segment${active==="dest"?" hs-segment--active":""}`}>
            <button className="hs-segment-btn" onClick={()=>toggle("dest")}>
              <MapPin size={15} className="hs-seg-icon"/>
              <div className="hs-seg-text">
                <span className="hs-seg-label">WHERE</span>
                <span className={`hs-seg-val${!dest?" hs-seg-val--placeholder":""}`}>
                  {dest || "Search destinations"}
                </span>
              </div>
              <ChevronDown size={13} className={`hs-chevron${active==="dest"?" open":""}`}/>
            </button>

            <AnimatePresence>
              {active==="dest" && (
                <Dropdown>
<div className="hs-dest-search">
                    <Search size={14} className="hs-dest-search-ico"/>
                    <input
                      autoFocus
                      className="hs-dest-input"
                      placeholder="Search a city or region…"
                      value={dest}
                      onChange={e=>setDest(e.target.value)}
                    />
                    {dest && (
                      <button className="hs-dest-x" onClick={()=>setDest("")}>
                        <X size={13}/>
                      </button>
                    )}
                  </div>
<div className="hs-dest-list">
                    {filtered.length===0
                      ? <p className="hs-dest-empty">No destinations found</p>
                      : filtered.map(d => (
                          <button
                            key={d.name}
                            className="hs-dest-item"
                            onClick={()=>{ setDest(d.name); setActive(null); }}
                          >
                            <span className="hs-dest-emoji">{d.emoji}</span>
                            <div className="hs-dest-info">
                              <span className="hs-dest-name">{d.name}</span>
                              <span className="hs-dest-desc">{d.desc}</span>
                              <div className="hs-dest-tags">
                                {d.tags.map(t=>(
                                  <span key={t} className="hs-dest-tag">{t}</span>
                                ))}
                              </div>
                            </div>
                          </button>
                        ))
                    }
                  </div>
                </Dropdown>
              )}
            </AnimatePresence>
          </div>

          <div className="hs-sep"/>
<div className={`hs-segment${active==="dates"?" hs-segment--active":""}`}>
            <button className="hs-segment-btn" onClick={()=>toggle("dates")}>
              <Calendar size={15} className="hs-seg-icon"/>
              <div className="hs-seg-text">
                <span className="hs-seg-label">WHEN</span>
                <span className={`hs-seg-val${!checkIn?" hs-seg-val--placeholder":""}`}>
                  {dateLabel}
                </span>
              </div>
              <ChevronDown size={13} className={`hs-chevron${active==="dates"?" open":""}`}/>
            </button>

            <AnimatePresence>
              {active==="dates" && (
                <Dropdown style={{minWidth:340}}>
                  <MiniCalendar
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onChange={(ci,co)=>{ setCheckIn(ci); setCheckOut(co); if(ci&&co) setActive(null); }}
                  />
                </Dropdown>
              )}
            </AnimatePresence>
          </div>

          <div className="hs-sep"/>
<div className={`hs-segment${active==="guests"?" hs-segment--active":""}`}>
            <button className="hs-segment-btn" onClick={()=>toggle("guests")}>
              <Users size={15} className="hs-seg-icon"/>
              <div className="hs-seg-text">
                <span className="hs-seg-label">WHO</span>
                <span className={`hs-seg-val${totalGuests===0?" hs-seg-val--placeholder":""}`}>
                  {totalGuests>0 ? `${totalGuests} guest${totalGuests!==1?"s":""}` : "Add guests"}
                </span>
              </div>
              <ChevronDown size={13} className={`hs-chevron${active==="guests"?" open":""}`}/>
            </button>

            <AnimatePresence>
              {active==="guests" && (
                <Dropdown style={{minWidth:320, right:0, left:"auto"}}>
                  <GuestsPanel guests={guests} onChange={setGuests}/>
                </Dropdown>
              )}
            </AnimatePresence>
          </div>
<motion.button
            className="hs-search-btn"
            onClick={handleSearch}
            disabled={loading}
            whileHover={!loading?{scale:1.05}:{}}
            whileTap={!loading?{scale:0.95}:{}}
          >
            {loading
              ? <Loader2 size={18} className="hs-spin"/>
              : <Search  size={18}/>}
            <span>{loading?"Searching…":"Search"}</span>
          </motion.button>
        </div>
      </div>
    </>
  );
};

export default HeroSearch;