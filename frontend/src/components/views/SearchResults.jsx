import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Users, ArrowLeft, Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const fmtPrice = (price) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
    .format(price ?? 0)
    .replace("₹", "₹ ");

const Chip = ({ icon: Icon, label }) => (
  <div className="sr-chip">
    <Icon size={14} className="sr-chip__icon" />
    <span>{label}</span>
  </div>
);

const ListingCard = ({ listing, index }) => {
  const navigate   = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const src = listing.image?.url || "/default-image.jpg";

  return (
    <motion.article
      className="sr-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -7, boxShadow: "0 22px 44px rgba(0,0,0,0.11)" }}
    >
<div className="sr-card__img-wrap">
        {!loaded && <div className="sr-card__skeleton" />}
        <img
          src={src}
          alt={listing.title || "Property"}
          className={`sr-card__img${loaded ? " loaded" : ""}`}
          onLoad={() => setLoaded(true)}
          onError={(e) => { e.target.src = "/default-image.jpg"; setLoaded(true); }}
          loading="lazy"
        />
        <div className="sr-card__overlay" />
        <div className="sr-card__price-badge">{fmtPrice(listing.price)}<span className="sr-card__per">/night</span></div>
      </div>
<div className="sr-card__body">
        <h3 className="sr-card__title">{listing.title || "Untitled property"}</h3>

        <p className="sr-card__location">
          <MapPin size={12} />
          {[listing.location, listing.country].filter(Boolean).join(", ")}
        </p>

        {listing.description && (
          <p className="sr-card__desc">{listing.description}</p>
        )}

        <button
          className="sr-card__cta"
          onClick={() => navigate(`/listings/${listing._id}`)}
        >
          View details →
        </button>
      </div>
<div className="sr-card__accent" />
    </motion.article>
  );
};

const EmptyState = ({ onReset }) => (
  <motion.div
    className="sr-empty"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45 }}
  >
    <div className="sr-empty__icon">
      <Search size={36} strokeWidth={1.2} />
    </div>
    <h3 className="sr-empty__title">No stays found</h3>
    <p className="sr-empty__text">Try adjusting your destination, dates, or guest count.</p>
    <button className="sr-empty__btn" onClick={onReset}>Modify search</button>
  </motion.div>
);

const LoadingState = () => (
  <div className="sr-loading">
    <Loader2 size={34} strokeWidth={1.5} className="sr-spin" />
    <p>Finding your perfect stay…</p>
  </div>
);

const SearchResults = () => {
  const navigate = useNavigate();
  const [listings,       setListings]       = useState([]);
  const [searchCriteria, setSearchCriteria] = useState(null);
  const [isLoading,      setIsLoading]      = useState(true);

  useEffect(() => {
    const raw         = localStorage.getItem("searchResults");
    const rawCriteria = localStorage.getItem("searchCriteria");

    if (!raw || !rawCriteria) {
      toast("No search criteria found — redirecting home…", { icon: "ℹ️" });
      const t = setTimeout(() => navigate("/"), 2000);
      setIsLoading(false);
      return () => clearTimeout(t);
    }

    try {
      setListings(JSON.parse(raw));
      setSearchCriteria(JSON.parse(rawCriteria));
    } catch {
      toast.error("Couldn't load search results. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  if (isLoading) return (
    <>
      <style>{CSS}</style>
      <LoadingState />
    </>
  );

  return (
    <>
      <style>{CSS}</style>

      <div className="sr-page">
<AnimatePresence>
          {searchCriteria && (
            <motion.div
              className="sr-summary"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="sr-summary__top">
                <h2 className="sr-summary__heading">Search results</h2>
                <button className="sr-back-btn" onClick={() => navigate("/")}>
                  <ArrowLeft size={14} />
                  Modify search
                </button>
              </div>

              <div className="sr-chips">
                {searchCriteria.destination && (
                  <Chip icon={MapPin} label={searchCriteria.destination} />
                )}
                {searchCriteria.checkIn && searchCriteria.checkOut && (
                  <Chip icon={Calendar} label={`${searchCriteria.checkIn} → ${searchCriteria.checkOut}`} />
                )}
                {searchCriteria.totalGuests != null && (
                  <Chip
                    icon={Users}
                    label={`${searchCriteria.totalGuests} ${searchCriteria.totalGuests === 1 ? "guest" : "guests"}`}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
{listings.length > 0 && (
          <motion.p
            className="sr-count"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <span className="sr-count__num">{listings.length}</span>
            {" "}{listings.length === 1 ? "stay" : "stays"} found
          </motion.p>
        )}
{listings.length === 0 ? (
          <EmptyState onReset={() => navigate("/")} />
        ) : (
          <div className="sr-grid">
            {listings.map((listing, i) => (
              <ListingCard key={listing._id} listing={listing} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

const CSS = `

  @keyframes sr-fadeUp  { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
  @keyframes sr-shimmer { from{background-position:-400px 0;}to{background-position:400px 0;} }
  @keyframes sr-spin    { to{transform:rotate(360deg);} }

  /* ── Page ── */
  .sr-page {
    max-width: 1280px;
    margin: 0 auto;
    padding: clamp(80px,10vw,100px) clamp(14px,3vw,40px) 72px;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Loading ── */
  .sr-loading {
    display: flex; flex-direction:column; align-items:center; justify-content:center;
    min-height: 60vh; gap:16px;
    font-family:'DM Sans',sans-serif; font-size:14px; color:#999;
  }
  .sr-spin { color:#e03030; animation:sr-spin 0.85s linear infinite; }

  /* ── Summary bar ── */
  .sr-summary {
    background:#fff;
    border:1px solid #ede8e8;
    border-radius:18px;
    padding:22px 26px;
    margin-bottom:28px;
    box-shadow:0 2px 12px rgba(0,0,0,0.05);
  }
  .sr-summary__top {
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom:18px; flex-wrap:wrap; gap:10px;
  }
  .sr-summary__heading {
    font-family:'Lora',serif; font-size:1.2rem; font-weight:700;
    color:#111; margin:0;
  }
  .sr-back-btn {
    display:flex; align-items:center; gap:5px;
    background:none; border:1px solid #e0dada; cursor:pointer;
    font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500;
    color:#555; padding:7px 14px; border-radius:8px;
    transition:border-color .2s, color .2s, background .2s;
  }
  .sr-back-btn:hover { border-color:#e03030; color:#e03030; background:#fff7f7; }

  /* Chips */
  .sr-chips { display:flex; flex-wrap:wrap; gap:10px; }
  .sr-chip {
    display:flex; align-items:center; gap:7px;
    background:#faf7f7; border:1px solid #ede8e8;
    border-radius:30px; padding:7px 14px;
    font-size:13px; color:#444;
  }
  .sr-chip__icon { color:#e03030; flex-shrink:0; }

  /* ── Count ── */
  .sr-count {
    font-size:14px; color:#888; margin:0 0 22px;
  }
  .sr-count__num { font-weight:700; color:#111; font-size:16px; }

  /* ── Grid ── */
  .sr-grid {
    display:grid;
    grid-template-columns:repeat(auto-fill, minmax(290px, 1fr));
    gap:26px;
  }

  /* ── Card ── */
  .sr-card {
    position:relative;
    background:#fff;
    border-radius:18px;
    overflow:hidden;
    border:1px solid rgba(0,0,0,0.07);
    box-shadow:0 2px 10px rgba(0,0,0,0.05);
    transition:box-shadow .35s ease;
    cursor:pointer;
  }
  .sr-card__img-wrap {
    position:relative;
    aspect-ratio:4/3;
    overflow:hidden;
    background:#f0eaea;
  }
  .sr-card__skeleton {
    position:absolute;inset:0;
    background:linear-gradient(90deg,#f0e8e8 25%,#e6dcdc 50%,#f0e8e8 75%);
    background-size:400px 100%;
    animation:sr-shimmer 1.5s linear infinite;
  }
  .sr-card__img {
    position:absolute;inset:0;
    width:100%;height:100%;
    object-fit:cover; opacity:0;
    transition:opacity .35s ease, transform .45s ease;
    display:block;
  }
  .sr-card__img.loaded  { opacity:1; }
  .sr-card:hover .sr-card__img { transform:scale(1.07); }

  .sr-card__overlay {
    position:absolute;inset:0;
    background:linear-gradient(to top,rgba(0,0,0,0.4) 0%,transparent 55%);
    pointer-events:none;
  }
  .sr-card__price-badge {
    position:absolute; bottom:12px; left:12px;
    background:rgba(255,255,255,0.92);
    backdrop-filter:blur(8px);
    -webkit-backdrop-filter:blur(8px);
    border-radius:20px; padding:5px 12px;
    font-family:'DM Sans',sans-serif;
    font-size:13px; font-weight:600; color:#111;
    box-shadow:0 2px 10px rgba(0,0,0,0.12);
  }
  .sr-card__per { font-weight:400; font-size:11px; color:#888; margin-left:2px; }

  /* Card body */
  .sr-card__body { padding:18px 20px 20px; }
  .sr-card__title {
    font-family:'Lora',serif; font-size:1.05rem; font-weight:600;
    color:#1a1a1a; margin:0 0 8px;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    transition:color .2s ease;
  }
  .sr-card:hover .sr-card__title { color:#e03030; }

  .sr-card__location {
    display:flex; align-items:center; gap:5px;
    font-size:12.5px; color:#999; margin:0 0 10px;
  }
  .sr-card__desc {
    font-size:13px; color:#777; line-height:1.65;
    margin:0 0 16px;
    display:-webkit-box; -webkit-line-clamp:2;
    -webkit-box-orient:vertical; overflow:hidden;
  }
  .sr-card__cta {
    width:100%; padding:10px;
    background:linear-gradient(135deg,#e03030,#c91a1a);
    color:#fff; border:none; border-radius:10px;
    font-family:'DM Sans',sans-serif; font-size:13.5px; font-weight:600;
    cursor:pointer; letter-spacing:.02em;
    box-shadow:0 4px 14px rgba(201,26,26,0.25);
    transition:box-shadow .25s, transform .2s;
  }
  .sr-card__cta:hover {
    box-shadow:0 8px 22px rgba(201,26,26,0.35);
    transform:translateY(-1px);
  }

  /* Accent bar */
  .sr-card__accent {
    position:absolute;top:0;left:0;right:0;height:3px;
    background:linear-gradient(90deg,#e03030,#ff8f6b);
    transform:scaleX(0); transform-origin:left;
    transition:transform .35s cubic-bezier(0.34,1.2,0.64,1);
    border-radius:2px 2px 0 0;
  }
  .sr-card:hover .sr-card__accent { transform:scaleX(1); }

  /* ── Empty state ── */
  .sr-empty {
    display:flex; flex-direction:column; align-items:center;
    text-align:center; padding:80px 24px;
  }
  .sr-empty__icon {
    width:72px;height:72px; border-radius:50%;
    background:#fff3f3; border:1px solid #f5dada;
    display:flex;align-items:center;justify-content:center;
    color:#e03030; margin-bottom:20px;
  }
  .sr-empty__title {
    font-family:'Lora',serif; font-size:1.35rem; font-weight:700;
    color:#1a1a1a; margin:0 0 10px;
  }
  .sr-empty__text {
    font-size:14px; color:#999; margin:0 0 26px; max-width:320px;
  }
  .sr-empty__btn {
    padding:11px 28px; border-radius:30px;
    background:linear-gradient(135deg,#e03030,#c91a1a);
    color:#fff; border:none; cursor:pointer;
    font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600;
    box-shadow:0 6px 18px rgba(201,26,26,0.28);
    transition:transform .25s cubic-bezier(0.34,1.5,0.64,1), box-shadow .25s;
  }
  .sr-empty__btn:hover {
    transform:translateY(-3px) scale(1.04);
    box-shadow:0 10px 26px rgba(201,26,26,0.38);
  }

  /* ── Responsive ── */
  @media (max-width:640px) {
    .sr-grid { grid-template-columns:1fr; gap:18px; }
    .sr-chips { gap:8px; }
  }
  @media (min-width:641px) and (max-width:1024px) {
    .sr-grid { grid-template-columns:repeat(2,1fr); }
  }
`;

export default SearchResults;