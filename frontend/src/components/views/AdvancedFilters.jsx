import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, DollarSign, Home, Users, Star, MapPin, Wifi, Car, Droplet, Wind, Coffee, Tv, ChevronDown } from "lucide-react";

const AdvancedFilters = ({ onApply, initialFilters = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    priceMin: initialFilters.priceMin || "",
    priceMax: initialFilters.priceMax || "",
    propertyType: initialFilters.propertyType || "",
    minGuests: initialFilters.minGuests || "",
    minRating: initialFilters.minRating || "",
    amenities: initialFilters.amenities || [],
    location: initialFilters.location || "",
  });

  const propertyTypes = [
    { value: "apartment", label: "Apartment", icon: "🏢" },
    { value: "house", label: "House", icon: "🏠" },
    { value: "villa", label: "Villa", icon: "🏡" },
    { value: "cottage", label: "Cottage", icon: "🏘️" },
    { value: "studio", label: "Studio", icon: "🏙️" },
    { value: "condo", label: "Condo", icon: "🌆" },
  ];

  const amenitiesList = [
    { value: "wifi", label: "WiFi", icon: Wifi },
    { value: "parking", label: "Parking", icon: Car },
    { value: "pool", label: "Pool", icon: Droplet },
    { value: "ac", label: "AC", icon: Wind },
    { value: "kitchen", label: "Kitchen", icon: Coffee },
    { value: "tv", label: "TV", icon: Tv },
  ];

  const handleAmenityToggle = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleApply = () => {
    onApply(filters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters = {
      priceMin: "",
      priceMax: "",
      propertyType: "",
      minGuests: "",
      minRating: "",
      amenities: [],
      location: "",
    };
    setFilters(resetFilters);
    onApply(resetFilters);
  };

  const activeFilterCount = Object.values(filters).filter(v =>
    Array.isArray(v) ? v.length > 0 : v !== ""
  ).length;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex items-center gap-2 rounded-xl border border-[#e0d8cc] bg-white px-5 py-2.5 text-sm font-medium text-[#1a1207] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:border-[#c2633a] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
      >
        <SlidersHorizontal size={16} />
        Filters
        {activeFilterCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#c2633a] text-[11px] font-bold text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(26,18,7,0.4)] p-5 backdrop-blur"
            onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="w-full max-w-[700px] max-h-[85vh] overflow-hidden rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
            >
              <div className="flex items-center justify-between border-b border-black/10 bg-gradient-to-br from-[#fff0ea] to-white px-6 py-5">
                <h2 className="m-0 flex items-center gap-2.5 text-2xl font-normal text-[#1a1207]">
                  <SlidersHorizontal size={24} className="text-[#c2633a]" />
                  Advanced Filters
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f0ea] text-[#7c7060] transition-colors hover:bg-[#e9e3d7]"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-[calc(85vh-160px)] overflow-y-auto p-6">
                <div className="mb-6">
                  <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1a1207]">
                    <DollarSign size={16} className="text-[#c2633a]" />
                    Price Range (per night)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min ₹"
                      value={filters.priceMin}
                      onChange={(e) =>
                        setFilters({ ...filters, priceMin: e.target.value })
                      }
                      className="rounded-[10px] border border-[#e0d8cc] bg-[#faf8f4] px-3.5 py-2.5 text-sm text-[#1a1207]"
                    />
                    <input
                      type="number"
                      placeholder="Max ₹"
                      value={filters.priceMax}
                      onChange={(e) =>
                        setFilters({ ...filters, priceMax: e.target.value })
                      }
                      className="rounded-[10px] border border-[#e0d8cc] bg-[#faf8f4] px-3.5 py-2.5 text-sm text-[#1a1207]"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1a1207]">
                    <Home size={16} className="text-[#c2633a]" />
                    Property Type
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {propertyTypes.map((type) => {
                      const selected = filters.propertyType === type.value;
                      return (
                        <button
                          key={type.value}
                          onClick={() =>
                            setFilters({
                              ...filters,
                              propertyType: selected ? "" : type.value,
                            })
                          }
                          className={`flex flex-col items-center gap-1.5 rounded-[10px] border px-3 py-3 text-[13px] font-medium transition-all ${
                            selected
                              ? "border-[#c2633a] bg-[#fff0ea] text-[#c2633a]"
                              : "border-[#e0d8cc] bg-white text-[#7c7060]"
                          }`}
                        >
                          <span className="text-xl">{type.icon}</span>
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1a1207]">
                      <Users size={16} className="text-[#c2633a]" />
                      Min Guests
                    </label>
                    <div className="relative">
                      <select
                        value={filters.minGuests}
                        onChange={(e) =>
                          setFilters({ ...filters, minGuests: e.target.value })
                        }
                        className="w-full appearance-none rounded-[10px] border border-[#e0d8cc] bg-white px-3.5 py-2.5 pr-10 text-sm text-[#1a1207] shadow-sm"
                      >
                        <option value="">Any</option>
                        {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                          <option key={n} value={n}>{n}+ guests</option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1a1207]">
                      <Star size={16} className="text-[#c2633a]" />
                      Min Rating
                    </label>
                    <div className="relative">
                      <select
                        value={filters.minRating}
                        onChange={(e) =>
                          setFilters({ ...filters, minRating: e.target.value })
                        }
                        className="w-full appearance-none rounded-[10px] border border-[#e0d8cc] bg-white px-3.5 py-2.5 pr-10 text-sm text-[#1a1207] shadow-sm"
                      >
                        <option value="">Any</option>
                        <option value="3">3+ stars</option>
                        <option value="4">4+ stars</option>
                        <option value="4.5">4.5+ stars</option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1a1207]">
                    <MapPin size={16} className="text-[#c2633a]" />
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City, Country..."
                    value={filters.location}
                    onChange={(e) =>
                      setFilters({ ...filters, location: e.target.value })
                    }
                    className="w-full rounded-[10px] border border-[#e0d8cc] bg-[#faf8f4] px-3.5 py-2.5 text-sm text-[#1a1207]"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-[#1a1207]">
                    Amenities
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {amenitiesList.map((amenity) => {
                      const Icon = amenity.icon;
                      const isSelected = filters.amenities.includes(
                        amenity.value,
                      );
                      return (
                        <button
                          key={amenity.value}
                          onClick={() => handleAmenityToggle(amenity.value)}
                          className={`flex flex-col items-center gap-1.5 rounded-[10px] border px-3 py-2.5 text-[13px] font-medium transition-all ${
                            isSelected
                              ? "border-[#c2633a] bg-[#fff0ea] text-[#c2633a]"
                              : "border-[#e0d8cc] bg-white text-[#7c7060]"
                          }`}
                        >
                          <Icon size={18} />
                          {amenity.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 border-t border-black/10 bg-[#faf8f4] px-6 py-4">
                <button
                  onClick={handleReset}
                  className="flex-1 rounded-xl border border-[#e0d8cc] bg-white px-3 py-3 text-sm font-medium text-[#7c7060] transition-colors hover:bg-[#f8f8f8]"
                >
                  Clear All
                </button>
                <button
                  onClick={handleApply}
                  className="flex-[2] rounded-xl border-0 bg-[#c2633a] px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#ab5330]"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdvancedFilters;
