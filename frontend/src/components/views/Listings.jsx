import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import HeroSearch from "./HeroSearch";
import AdvancedFilters from "./AdvancedFilters";
import "../../utilis/css/Listing.css";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  })
    .format(price ?? 0)
    .replace("₹", "₹ ");

const normalise = (listing) => ({
  ...listing,
  price: listing.price ?? 0,
  image: listing.image ?? { url: "/default-image.jpg" },
});

const Toast = ({ message, onClose }) => (
  <div className="toast" role="alert">
    <span className="toast-icon">⚠</span>
    <span className="toast-msg">{message}</span>
    <button onClick={onClose} className="toast-close" aria-label="Dismiss">✕</button>
  </div>
);

const Skeleton = ({ index }) => (
  <div className="skeleton-card" style={{ animationDelay: `${index * 50}ms` }}>
    <div className="skeleton-img" />
    <div className="skeleton-body">
      <div className="skeleton-line" style={{ width: "72%" }} />
      <div className="skeleton-line" style={{ width: "48%", height: 11 }} />
      <div className="skeleton-line" style={{ width: "36%", height: 11 }} />
    </div>
  </div>
);

const ListingCard = ({ listing, index }) => {
  const [loaded, setLoaded] = useState(false);
  const src = listing.image?.url || "/default-image.jpg";
  const reviewCount = listing.reviews?.length ?? 0;
  const location = [listing.location, listing.country].filter(Boolean).join(", ");

  return (
    <Link
      to={`/listings/${listing._id}`}
      className="listing-link"
      aria-label={listing.title || "View listing"}
    >
      <article
        className="listing-card"
        style={{ animationDelay: `${index * 55}ms` }}
      >
        {}
        <div className="listing-img-wrap">
          {!loaded && <div className="listing-img-skeleton" />}
          <img
            src={src}
            alt={listing.title || "Property"}
            className={`listing-img${loaded ? " loaded" : ""}`}
            onLoad={() => setLoaded(true)}
            onError={(e) => { e.target.src = "/default-image.jpg"; setLoaded(true); }}
            loading="lazy"
          />
          <div className="listing-img-gradient" />

          <div className="review-pill">
            <span className="review-star">★</span>
            <span className="review-count">
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>

        {}
        <div className="listing-body">
          <h3 className="listing-title">{listing.title || "Untitled Property"}</h3>

          {location && (
            <p className="listing-location">
              <svg className="pin-icon" viewBox="0 0 12 16" fill="currentColor" aria-hidden="true">
                <path d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 11 5 11s5-7.25 5-11c0-2.76-2.24-5-5-5zm0 7.5A2.5 2.5 0 116 2.5 2.5 2.5 0 016 7.5z" />
              </svg>
              {location}
            </p>
          )}

          <div className="listing-footer">
            <p className="listing-price">
              {formatPrice(listing.price)}
              <span className="per-night"> / night</span>
            </p>
            <span className="view-btn">View →</span>
          </div>
        </div>

        <div className="accent-bar" />
      </article>
    </Link>
  );
};

const EmptyState = () => (
  <div className="empty-state">
    <div className="empty-icon">🏡</div>
    <h3 className="empty-title">No listings found</h3>
    <p className="empty-text">Try adjusting your search or be the first to add one.</p>
    <Link to="/listings/new" className="empty-cta">+ Create a listing</Link>
  </div>
);

function Listings() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  const dismissError = useCallback(() => setError(null), []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/listings`);
        if (!res.ok) throw new Error(`Server error (${res.status})`);

        const result = await res.json();
        if (!result.success || !Array.isArray(result.data))
          throw new Error("Unexpected response format.");

        if (!cancelled) {
          const normalized = result.data.map(normalise);
          setListings(normalized);
          setFilteredListings(normalized);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters);

    let filtered = [...listings];

    if (newFilters.priceMin) {
      filtered = filtered.filter(l => l.price >= Number(newFilters.priceMin));
    }
    if (newFilters.priceMax) {
      filtered = filtered.filter(l => l.price <= Number(newFilters.priceMax));
    }

    if (newFilters.propertyType) {
      filtered = filtered.filter(l =>
        l.propertyType?.toLowerCase() === newFilters.propertyType.toLowerCase()
      );
    }

    if (newFilters.minGuests) {
      filtered = filtered.filter(l =>
        (l.guests || l.maxGuests || 0) >= Number(newFilters.minGuests)
      );
    }

    if (newFilters.minRating) {
      filtered = filtered.filter(l => {
        const avgRating = l.reviews?.length > 0
          ? l.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / l.reviews.length
          : 0;
        return avgRating >= Number(newFilters.minRating);
      });
    }

    if (newFilters.location) {
      const searchTerm = newFilters.location.toLowerCase();
      filtered = filtered.filter(l =>
        l.location?.toLowerCase().includes(searchTerm) ||
        l.country?.toLowerCase().includes(searchTerm)
      );
    }

    if (newFilters.amenities?.length > 0) {
      filtered = filtered.filter(l => {
        const listingAmenities = (l.amenities || []).map(a =>
          typeof a === 'string' ? a.toLowerCase() : a.name?.toLowerCase()
        );
        return newFilters.amenities.every(amenity =>
          listingAmenities.some(la => la.includes(amenity.toLowerCase()))
        );
      });
    }

    setFilteredListings(filtered);
  }, [listings]);

  return (
    <>
      <section className="hero-section">
        <HeroSearch />
      </section>

      <main className="listings-main">
        {error && <Toast message={error} onClose={dismissError} />}

        <div style={{ maxWidth: 1200, margin: "0 auto 20px", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1a1207", margin: 0 }}>
            {filteredListings.length} {filteredListings.length === 1 ? "Property" : "Properties"}
          </h2>
          <AdvancedFilters onApply={applyFilters} initialFilters={filters} />
        </div>

        <div className="listings-grid">
          {loading
            ? Array.from({ length: 8 }, (_, i) => <Skeleton key={i} index={i} />)
            : filteredListings.length === 0
            ? <EmptyState />
            : filteredListings.map((l, i) => (
                <ListingCard key={l._id} listing={l} index={i} />
              ))}
        </div>
      </main>
    </>
  );
}

export default Listings;
