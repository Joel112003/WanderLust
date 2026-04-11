import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import HeroSearch from "./HeroSearch";
import AdvancedFilters from "./AdvancedFilters";

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
  <div
    className="mb-6 flex items-center gap-2.5 rounded-xl border border-[#ffc5c5] border-l-4 border-l-[#e03030] bg-[#fff3f3] px-[18px] py-[14px] text-sm text-[#c12a2a]"
    role="alert"
  >
    <span className="shrink-0 text-base">⚠</span>
    <span className="flex-1">{message}</span>
    <button
      onClick={onClose}
      className="shrink-0 bg-transparent px-1 py-0.5 text-base leading-none text-[#c12a2a] transition-opacity hover:opacity-60"
      aria-label="Dismiss"
    >
      ✕
    </button>
  </div>
);

const Skeleton = ({ index }) => (
  <div className="animate-in fade-in rounded-[18px] border border-black/10 bg-white duration-300" style={{ animationDelay: `${index * 50}ms` }}>
    <div className="aspect-[4/3] w-full animate-pulse bg-gradient-to-r from-[#f0e8e8] via-[#e6dcdc] to-[#f0e8e8]" />
    <div className="px-5 pb-[22px] pt-[18px]">
      <div className="mb-2.5 h-[13px] w-[72%] animate-pulse rounded-md bg-gradient-to-r from-[#f0e8e8] via-[#e6dcdc] to-[#f0e8e8]" />
      <div className="mb-2.5 h-[11px] w-[48%] animate-pulse rounded-md bg-gradient-to-r from-[#f0e8e8] via-[#e6dcdc] to-[#f0e8e8]" />
      <div className="h-[11px] w-[36%] animate-pulse rounded-md bg-gradient-to-r from-[#f0e8e8] via-[#e6dcdc] to-[#f0e8e8]" />
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
      className="block no-underline outline-offset-4"
      aria-label={listing.title || "View listing"}
    >
      <article
        className="group relative cursor-pointer overflow-hidden rounded-[18px] border border-black/10 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(0,0,0,0.11),0_6px_12px_rgba(0,0,0,0.06)]"
        style={{ animationDelay: `${index * 55}ms` }}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f0eaea]">
          {!loaded && <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#f0e8e8] via-[#e6dcdc] to-[#f0e8e8]" />}
          <img
            src={src}
            alt={listing.title || "Property"}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded(true)}
            onError={(e) => { e.target.src = "/default-image.jpg"; setLoaded(true); }}
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-[#333] shadow-[0_2px_8px_rgba(0,0,0,0.12)] backdrop-blur">
            <span className="text-[13px] text-[#ff385c]">★</span>
            <span className="text-[#555]">
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>
        <div className="px-5 pb-5 pt-[18px]">
          <h3 className="mb-1.5 truncate font-serif text-[1.05rem] font-semibold text-[#1a1a2e] transition-colors group-hover:text-[#e03030]">
            {listing.title || "Untitled Property"}
          </h3>

          {location && (
            <p className="mb-3.5 flex items-center gap-1 truncate text-[0.8rem] text-[#999]">
              <svg className="h-[13px] w-[10px] shrink-0 text-[#ccc]" viewBox="0 0 12 16" fill="currentColor" aria-hidden="true">
                <path d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 11 5 11s5-7.25 5-11c0-2.76-2.24-5-5-5zm0 7.5A2.5 2.5 0 116 2.5 2.5 2.5 0 016 7.5z" />
              </svg>
              {location}
            </p>
          )}

          <div className="flex items-center justify-between">
            <p className="m-0 text-[1.05rem] font-semibold text-[#1a1a2e]">
              {formatPrice(listing.price)}
              <span className="ml-0.5 text-[0.78rem] font-normal text-[#aaa]"> / night</span>
            </p>
            <span className="translate-x-[-6px] text-[0.78rem] font-semibold tracking-[0.02em] text-[#ff385c] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
              View →
            </span>
          </div>
        </div>

        <div className="absolute left-0 right-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[#ff385c] to-[#ff7b7b] transition-transform duration-300 group-hover:scale-x-100" />
      </article>
    </Link>
  );
};

const EmptyState = () => (
  <div className="col-span-full animate-in fade-in px-6 py-[90px] text-center duration-300">
    <div className="mb-[18px] text-[3.5rem]">🏡</div>
    <h3 className="mb-2.5 font-serif text-[1.45rem] font-semibold text-[#222]">No listings found</h3>
    <p className="mb-7 text-[0.9rem] text-[#999]">Try adjusting your search or be the first to add one.</p>
    <Link
      to="/listings/new"
      className="inline-block rounded-full bg-gradient-to-br from-[#ff385c] to-[#e02020] px-7 py-3 text-[0.875rem] font-semibold tracking-[0.04em] text-white no-underline shadow-[0_6px_20px_rgba(224,32,32,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-[0_12px_28px_rgba(224,32,32,0.36)]"
    >
      + Create a listing
    </Link>
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
      <section className="mb-10 bg-gradient-to-br from-[#fff5f5] via-[#fef6fb] to-[#f3f6ff] py-4">
        <HeroSearch />
      </section>

      <main className="mx-auto max-w-[1560px] px-[clamp(14px,3vw,40px)] pb-[72px] max-[640px]:pb-12">
        {error && <Toast message={error} onClose={dismissError} />}

        <div className="mx-auto mb-5 flex w-full max-w-[1200px] items-center justify-between gap-3 px-5">
          <h2 className="m-0 text-xl font-semibold text-[#1a1207]">
            {filteredListings.length} {filteredListings.length === 1 ? "Property" : "Properties"}
          </h2>
          <AdvancedFilters onApply={applyFilters} initialFilters={filters} />
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-7 max-[1024px]:grid-cols-2 max-[1024px]:gap-6 max-[640px]:grid-cols-1 max-[640px]:gap-[18px]">
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
