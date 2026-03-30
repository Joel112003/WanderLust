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
      {}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "11px 20px",
          background: "#fff",
          border: "1.5px solid #e0d8cc",
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 500,
          color: "#1a1207",
          cursor: "pointer",
          transition: "all .2s",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#c2633a";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#e0d8cc";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
        }}
      >
        <SlidersHorizontal size={16} />
        Filters
        {activeFilterCount > 0 && (
          <span style={{
            position: "absolute",
            top: -6,
            right: -6,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#c2633a",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {activeFilterCount}
          </span>
        )}
      </button>

      {}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(26,18,7,0.4)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
              backdropFilter: "blur(4px)",
            }}
            onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              style={{
                background: "#fff",
                borderRadius: 20,
                width: "100%",
                maxWidth: 700,
                maxHeight: "85vh",
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              }}
            >
              {}
              <div style={{
                padding: "20px 24px",
                borderBottom: "1px solid rgba(0,0,0,0.07)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #fff0ea 0%, #fff 100%)",
              }}>
                <h2 style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 24,
                  fontWeight: 400,
                  margin: 0,
                  color: "#1a1207",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}>
                  <SlidersHorizontal size={24} style={{ color: "#c2633a" }} />
                  Advanced Filters
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "none",
                    background: "#f3f0ea",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#7c7060",
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {}
              <div style={{ padding: "24px", maxHeight: "calc(85vh - 160px)", overflowY: "auto" }}>
                {}
                <div style={{ marginBottom: 24 }}>
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1a1207",
                    marginBottom: 12,
                  }}>
                    <DollarSign size={16} style={{ color: "#c2633a" }} />
                    Price Range (per night)
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <input
                      type="number"
                      placeholder="Min ₹"
                      value={filters.priceMin}
                      onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                      style={{
                        padding: "11px 14px",
                        border: "1.5px solid #e0d8cc",
                        borderRadius: 10,
                        fontSize: 14,
                        color: "#1a1207",
                        background: "#faf8f4",
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Max ₹"
                      value={filters.priceMax}
                      onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                      style={{
                        padding: "11px 14px",
                        border: "1.5px solid #e0d8cc",
                        borderRadius: 10,
                        fontSize: 14,
                        color: "#1a1207",
                        background: "#faf8f4",
                      }}
                    />
                  </div>
                </div>

                {}
                <div style={{ marginBottom: 24 }}>
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1a1207",
                    marginBottom: 12,
                  }}>
                    <Home size={16} style={{ color: "#c2633a" }} />
                    Property Type
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    {propertyTypes.map(type => (
                      <button
                        key={type.value}
                        onClick={() => setFilters({
                          ...filters,
                          propertyType: filters.propertyType === type.value ? "" : type.value
                        })}
                        style={{
                          padding: "12px",
                          border: `1.5px solid ${filters.propertyType === type.value ? "#c2633a" : "#e0d8cc"}`,
                          borderRadius: 10,
                          background: filters.propertyType === type.value ? "#fff0ea" : "#fff",
                          fontSize: 13,
                          fontWeight: 500,
                          color: filters.propertyType === type.value ? "#c2633a" : "#7c7060",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 6,
                          transition: "all .15s",
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{type.icon}</span>
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                  <div>
                    <label style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1a1207",
                      marginBottom: 12,
                    }}>
                      <Users size={16} style={{ color: "#c2633a" }} />
                      Min Guests
                    </label>
                    <select
                      value={filters.minGuests}
                      onChange={(e) => setFilters({ ...filters, minGuests: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        border: "1.5px solid #e0d8cc",
                        borderRadius: 10,
                        fontSize: 14,
                        color: "#1a1207",
                        background: "#faf8f4",
                        cursor: "pointer",
                      }}
                    >
                      <option value="">Any</option>
                      {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                        <option key={n} value={n}>{n}+ guests</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1a1207",
                      marginBottom: 12,
                    }}>
                      <Star size={16} style={{ color: "#c2633a" }} />
                      Min Rating
                    </label>
                    <select
                      value={filters.minRating}
                      onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        border: "1.5px solid #e0d8cc",
                        borderRadius: 10,
                        fontSize: 14,
                        color: "#1a1207",
                        background: "#faf8f4",
                        cursor: "pointer",
                      }}
                    >
                      <option value="">Any</option>
                      <option value="3">3+ stars</option>
                      <option value="4">4+ stars</option>
                      <option value="4.5">4.5+ stars</option>
                    </select>
                  </div>
                </div>

                {}
                <div style={{ marginBottom: 24 }}>
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1a1207",
                    marginBottom: 12,
                  }}>
                    <MapPin size={16} style={{ color: "#c2633a" }} />
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City, Country..."
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      border: "1.5px solid #e0d8cc",
                      borderRadius: 10,
                      fontSize: 14,
                      color: "#1a1207",
                      background: "#faf8f4",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1a1207",
                    marginBottom: 12,
                  }}>
                    Amenities
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    {amenitiesList.map(amenity => {
                      const Icon = amenity.icon;
                      const isSelected = filters.amenities.includes(amenity.value);
                      return (
                        <button
                          key={amenity.value}
                          onClick={() => handleAmenityToggle(amenity.value)}
                          style={{
                            padding: "10px",
                            border: `1.5px solid ${isSelected ? "#c2633a" : "#e0d8cc"}`,
                            borderRadius: 10,
                            background: isSelected ? "#fff0ea" : "#fff",
                            fontSize: 13,
                            fontWeight: 500,
                            color: isSelected ? "#c2633a" : "#7c7060",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 6,
                            transition: "all .15s",
                          }}
                        >
                          <Icon size={18} />
                          {amenity.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {}
              <div style={{
                padding: "16px 24px",
                borderTop: "1px solid rgba(0,0,0,0.07)",
                display: "flex",
                gap: 12,
                background: "#faf8f4",
              }}>
                <button
                  onClick={handleReset}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "1.5px solid #e0d8cc",
                    borderRadius: 12,
                    background: "#fff",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#7c7060",
                    cursor: "pointer",
                  }}
                >
                  Clear All
                </button>
                <button
                  onClick={handleApply}
                  style={{
                    flex: 2,
                    padding: "12px",
                    border: "none",
                    borderRadius: 12,
                    background: "#c2633a",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#fff",
                    cursor: "pointer",
                  }}
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
