import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Search,
  X,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReactDOM from "react-dom";
import "../../utilis/css/HeroSearch.css";

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

const HeroSearch = () => {
  const [destination, setDestination] = useState("");
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 1))
  );
  const [activeField, setActiveField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateSelectionPhase, setDateSelectionPhase] = useState("none");
  const dropdownRef = useRef(null);
  const destinationRef = useRef(null);
  const datesRef = useRef(null);
  const guestsRef = useRef(null);
  const navigate = useNavigate();

  const [guestCategories, setGuestCategories] = useState({
    adults: 2,
    children: 0,
    infants: 0,
    pets: 0,
  });

  const guestCategoryDetails = [
    {
      key: "adults",
      label: "Adults",
      description: "13+ years",
      icon: "👤",
      maxLimit: 16,
    },
    {
      key: "children",
      label: "Children",
      description: "2-12 years",
      icon: "🧒",
      maxLimit: 8,
    },
    {
      key: "infants",
      label: "Infants",
      description: "0-2 years",
      icon: "👶",
      maxLimit: 5,
    },
    {
      key: "pets",
      label: "Pets",
      description: "Service animals",
      icon: "🐾",
      maxLimit: 3,
    },
  ];

  const destinations = [
    {
      name: "Nearby",
      description: "Discover local gems",
      emoji: "📍",
      tags: ["Cozy", "Local"],
    },
    {
      name: "Udaipur, Rajasthan",
      description: "City of Lakes",
      emoji: "🏰",
      tags: ["Romantic", "Historical"],
    },
    {
      name: "North Goa, Goa",
      description: "Beach Paradise",
      emoji: "🏖️",
      tags: ["Relaxing", "Coastal"],
    },
    {
      name: "Mumbai, Maharashtra",
      description: "City of Dreams",
      emoji: "🌃",
      tags: ["Urban", "Vibrant"],
    },
    {
      name: "Jaipur, Rajasthan",
      description: "Pink City",
      emoji: "🏯",
      tags: ["Cultural", "Architectural"],
    },
    {
      name: "Lonavala, Maharashtra",
      description: "Hill Station Retreat",
      emoji: "⛰️",
      tags: ["Scenic", "Peaceful"],
    },
  ];

  const formatDate = (date) => {
    if (!date) return "Select date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const clearDates = (e) => {
    e?.stopPropagation();
    setCheckInDate(new Date());
    setCheckOutDate(new Date(new Date().setDate(new Date().getDate() + 1)));
    setDateSelectionPhase("none");
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateClick = (date) => {
    // Don't allow selection of past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return;

    if (dateSelectionPhase === "none" || dateSelectionPhase === "complete") {
      setCheckInDate(date);
      setCheckOutDate(null);
      setDateSelectionPhase("start");
    } else if (dateSelectionPhase === "start") {
      if (date < checkInDate) {
        setCheckOutDate(checkInDate);
        setCheckInDate(date);
      } else {
        setCheckOutDate(date);
      }
      setDateSelectionPhase("complete");
    }
  };

  const renderCalendar = () => {
    if (!checkInDate) {
      const today = new Date();
      setCheckInDate(today);
      return [];
    }

    const daysInMonth = getDaysInMonth(
      checkInDate.getFullYear(),
      checkInDate.getMonth()
    );
    const firstDayOfMonth = getFirstDayOfMonth(
      checkInDate.getFullYear(),
      checkInDate.getMonth()
    );
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    // Actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        checkInDate.getFullYear(),
        checkInDate.getMonth(),
        day
      );
      const isToday = date.toDateString() === new Date().toDateString();
      const isCheckIn = checkInDate && checkInDate.toDateString() === date.toDateString();
      const isCheckOut = checkOutDate && checkOutDate.toDateString() === date.toDateString();
      const isInRange =
        checkInDate &&
        checkOutDate &&
        date > checkInDate &&
        date < checkOutDate;
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

      days.push(
        <button
          key={`day-${day}`}
          onClick={() => !isPast && handleDateClick(date)}
          disabled={isPast}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm
            ${isToday ? "border border-red-500" : ""}
            ${isCheckIn || isCheckOut ? "bg-red-500 text-white font-bold" : ""}
            ${isInRange ? "bg-red-100" : ""}
            ${isPast ? "text-gray-300 cursor-not-allowed" : "hover:bg-red-100"}
            transition-colors`}
          style={{
            backgroundColor: isCheckIn || isCheckOut ? "#ef4444" : isInRange ? "#fee2e2" : isToday ? "transparent" : "transparent",
            position: "relative"
          }}
        >
          {day}
          {isCheckIn && (
            <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-red-500 whitespace-nowrap">
              Check in
            </span>
          )}
          {isCheckOut && (
            <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-red-500 whitespace-nowrap">
              Check out
            </span>
          )}
        </button>
      );
    }

    return days;
  };

  const nextMonth = () => {
    const newDate = new Date(checkInDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCheckInDate(newDate);
  };

  const prevMonth = () => {
    const newDate = new Date(checkInDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCheckInDate(newDate);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeField && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Check if the click was on a date in the calendar
        const isDateClick = event.target.closest('.calendar-date');
        
        // Check if the click was on a guest control button
        const isGuestControlClick = event.target.closest('.guest-control');
        
        if (!isDateClick && !isGuestControlClick) {
          setActiveField(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeField]);

  const handleFieldFocus = (field, e) => {
    e.stopPropagation();
    setActiveField(activeField === field ? null : field);
  };

  const handleGuestChange = (category, operation, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setGuestCategories(prev => {
      const currentValue = prev[category];
      const maxLimit = guestCategoryDetails.find(cat => cat.key === category).maxLimit;
      
      let newValue = currentValue;
      if (operation === "increase" && currentValue < maxLimit) {
        newValue = currentValue + 1;
      } else if (operation === "decrease" && currentValue > 0) {
        newValue = currentValue - 1;
      }
      
      return {
        ...prev,
        [category]: newValue
      };
    });
  };

  const calculateTotalGuests = () => {
    return Object.values(guestCategories).reduce((a, b) => a + b, 0);
  };

  const filteredDestinations = destinations.filter(
    (dest) =>
      dest.name.toLowerCase().includes(destination.toLowerCase()) ||
      dest.tags.some((tag) =>
        tag.toLowerCase().includes(destination.toLowerCase())
      )
  );

  const handleSearch = async () => {
    if (!destination) {
      toast.error("Please select a destination", {
        autoClose: 1500,
      });
      return;
    }

    if (calculateTotalGuests() === 0) {
      toast.error("Please add at least one guest", {
        autoClose: 1500,
      });
      return;
    }

    if (checkInDate && checkOutDate && checkInDate >= checkOutDate) {
      toast.error("Check-out date must be after check-in date", {
        autoClose: 1500,
      });
      return;
    }

    const searchCriteria = {
      destination,
      checkIn: checkInDate ? checkInDate.toISOString() : new Date().toISOString(),
      checkOut: checkOutDate ? checkOutDate.toISOString() : new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
      guests: JSON.stringify(guestCategories),
    };

    setIsLoading(true);

    try {
      toast.info("Searching for your perfect stay...", {
        autoClose: 1000,
      });

      const response = await axios.get(`${API_BASE_URL}/listings/search`, {
        params: searchCriteria,
      });

      if (response.data.success) {
        localStorage.setItem(
          "searchResults",
          JSON.stringify(response.data.data)
        );
        localStorage.setItem(
          "searchCriteria",
          JSON.stringify({
            destination,
            checkIn: formatDate(checkInDate),
            checkOut: formatDate(checkOutDate),
            totalGuests: calculateTotalGuests(),
          })
        );

        navigate("/search-results");

        toast.success(`Found ${response.data.count} listings for you!`, {
          autoClose: 1500,
        });
      } else {
        toast.warning("No listings found matching your criteria", {
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Error searching for listings. Please try again.", {
        autoClose: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 mt-20 relative z-50">
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />
      <div
        ref={dropdownRef}
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-visible"
      >
        <div
          className={`relative ${
            activeField === "destination" ? "z-50" : "z-10"
          }`}
          ref={destinationRef}
        >
          <motion.div
            className={`p-3 border rounded-xl cursor-pointer transition-all duration-300 ${
              activeField === "destination"
                ? "border-red-500 ring-2 ring-red-200"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={(e) => handleFieldFocus("destination", e)}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <MapPin className="w-6 h-6 text-gray-500" />
              <div className="flex-grow">
                <div className="text-xs text-gray-500">Where</div>
                <input
                  type="text"
                  placeholder="Search destinations"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full text-sm font-medium outline-none bg-white"
                  onFocus={(e) => handleFieldFocus("destination", e)}
                />
              </div>
              {activeField === "destination" ? (
                <X
                  className="w-5 h-5 text-gray-500 hover:text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDestination("");
                  }}
                />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </motion.div>

          {activeField === "destination" && ReactDOM.createPortal(
            <motion.div
              key="destination-dropdown"
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="dropdown-portal"
              style={{ 
                zIndex: 9999,
                position: "absolute",
                width: destinationRef.current ? destinationRef.current.offsetWidth : "100%",
                left: destinationRef.current ? destinationRef.current.getBoundingClientRect().left : 0,
                top: destinationRef.current ? destinationRef.current.getBoundingClientRect().bottom + 8 : 0
              }}
            >
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-visible"
                   style={{ backgroundColor: "white", borderRadius: "0.75rem", boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)" }}>
                <div className="p-4 bg-white">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search destinations..."
                      className="w-full pl-10 pr-8 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 bg-white"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                    {destination && (
                      <X
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDestination("");
                        }}
                      />
                    )}
                  </div>
                  <div className="max-h-[32rem] overflow-y-auto overflow-x-hidden bg-white mt-5">
                    {filteredDestinations.length > 0 ? (
                      <div className="space-y-3 bg-white">
                        {filteredDestinations.map((dest) => (
                          <motion.div
                            key={dest.name}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-start p-3 hover:bg-red-50 rounded-lg cursor-pointer border border-transparent hover:border-red-100 transition-colors duration-200 bg-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDestination(dest.name);
                              setActiveField(null);
                            }}
                            style={{ backgroundColor: "white" }}
                          >
                            <div className="text-3xl mr-4">{dest.emoji}</div>
                            <div className="flex-grow">
                              <h3 className="font-semibold text-gray-800">
                                {dest.name}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {dest.description}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {dest.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="bg-red-50 text-red-600 text-xs px-2 py-1 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8 bg-white">
                        <p className="text-sm">No destinations found</p>
                        <p className="text-xs mt-1">
                          Try a different search term
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>,
            document.body
          )}
        </div>

        <div
          className={`relative ${activeField === "dates" ? "z-50" : "z-10"}`}
          ref={datesRef}
        >
          <motion.div
            className={`p-3 border rounded-xl cursor-pointer transition-all duration-300 ${
              activeField === "dates"
                ? "border-red-500 ring-2 ring-red-200"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={(e) => handleFieldFocus("dates", e)}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-gray-500" />
              <div className="flex-grow">
                <div className="text-xs text-gray-500">When</div>
                <div className="text-sm font-medium">
                  {formatDate(checkInDate)} - {formatDate(checkOutDate)}
                </div>
              </div>
              {activeField === "dates" ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </motion.div>

          {activeField === "dates" && ReactDOM.createPortal(
            <motion.div
              key="dates-dropdown"
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="dropdown-portal calendar-date"
              style={{ 
                zIndex: 9999,
                position: "absolute",
                width: datesRef.current ? datesRef.current.offsetWidth : "100%",
                left: datesRef.current ? datesRef.current.getBoundingClientRect().left : 0,
                top: datesRef.current ? datesRef.current.getBoundingClientRect().bottom + 8 : 0
              }}
            >
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4" 
                   style={{ backgroundColor: "white", borderRadius: "0.75rem", boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)" }}>
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={prevMonth}
                    className="p-1 rounded-full hover:bg-gray-100 calendar-date"
                  >
                    <ChevronDown className="w-5 h-5 rotate-90 text-gray-500 calendar-date" />
                  </button>
                  <h3 className="font-medium calendar-date">
                    {new Date(
                      checkInDate.getFullYear(),
                      checkInDate.getMonth()
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <div className="flex items-center gap-2 calendar-date">
                    <button
                      onClick={clearDates}
                      className="text-xs text-red-500 hover:underline calendar-date"
                    >
                      Clear
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-1 rounded-full hover:bg-gray-100 calendar-date"
                    >
                      <ChevronDown className="w-5 h-5 -rotate-90 text-gray-500 calendar-date" />
                    </button>
                  </div>
                </div>
                
                <div className="mb-2 text-center calendar-date">
                  <div className="text-sm text-gray-600">
                    {dateSelectionPhase === "none" ? "Select check-in date" : 
                     dateSelectionPhase === "start" ? "Select check-out date" : 
                     "Date range selected"}
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mt-4 mb-8 calendar-date" style={{ backgroundColor: "white" }}>
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div
                      key={day}
                      className="h-8 w-8 flex items-center justify-center text-xs text-gray-500 font-medium calendar-date"
                      style={{ backgroundColor: "white" }}
                    >
                      {day}
                    </div>
                  ))}
                  {renderCalendar()}
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-100 calendar-date">
                  <div className="text-sm">
                    <span className="font-medium">Selected: </span>
                    {formatDate(checkInDate)} 
                    {checkOutDate ? ` - ${formatDate(checkOutDate)}` : ""}
                  </div>
                  <button 
                    onClick={() => setActiveField(null)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 calendar-date"
                    disabled={dateSelectionPhase !== "complete" && checkInDate && !checkOutDate}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </motion.div>,
            document.body
          )}
        </div>

        <div
          className={`relative ${activeField === "guests" ? "z-50" : "z-10"}`}
          ref={guestsRef}
        >
          <motion.div
            className={`p-3 border rounded-xl cursor-pointer transition-all duration-300 ${
              activeField === "guests"
                ? "border-red-500 ring-2 ring-red-200"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={(e) => handleFieldFocus("guests", e)}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-gray-500" />
              <div className="flex-grow">
                <div className="text-xs text-gray-500">Who</div>
                <div className="text-sm font-medium">
                  {calculateTotalGuests()}{" "}
                  {calculateTotalGuests() === 1 ? "Guest" : "Guests"}
                </div>
              </div>
              {activeField === "guests" ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </motion.div>

          {activeField === "guests" && ReactDOM.createPortal(
            <motion.div
              key="guests-dropdown"
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="dropdown-portal"
              style={{ 
                zIndex: 9999,
                position: "absolute",
                width: guestsRef.current ? guestsRef.current.offsetWidth : "100%",
                left: guestsRef.current ? guestsRef.current.getBoundingClientRect().left : 0,
                top: guestsRef.current ? guestsRef.current.getBoundingClientRect().bottom + 8 : 0,
                backgroundColor: "transparent"
              }}
            >
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4"
                   style={{ backgroundColor: "white", borderRadius: "0.75rem", boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)" }}>
                <div className="space-y-4 bg-white" style={{ backgroundColor: "white" }}>
                  {guestCategoryDetails.map((category) => (
                    <div
                      key={category.key}
                      className="flex items-center justify-between bg-white guest-control"
                      style={{ backgroundColor: "white" }}
                    >
                      <div className="flex items-center space-x-3 guest-control">
                        <span className="text-2xl guest-control">{category.icon}</span>
                        <div className="guest-control">
                          <div className="font-medium text-sm guest-control">
                            {category.label}
                          </div>
                          <div className="text-xs text-gray-500 guest-control">
                            {category.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 guest-control">
                        <motion.button
                          type="button"
                          onClick={(e) => handleGuestChange(category.key, "decrease", e)}
                          disabled={guestCategories[category.key] === 0}
                          className={`w-8 h-8 flex items-center justify-center rounded-full border transition-colors guest-control ${
                            guestCategories[category.key] === 0
                              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                              : "bg-white text-gray-600 hover:bg-red-50 hover:border-red-200"
                          }`}
                          whileTap={{ scale: 0.9 }}
                          style={{ backgroundColor: guestCategories[category.key] === 0 ? "#f3f4f6" : "white" }}
                        >
                          <Minus className="w-4 h-4 guest-control" />
                        </motion.button>
                        <span className="w-8 text-center guest-control">
                          {guestCategories[category.key]}
                        </span>
                        <motion.button
                          type="button"
                          onClick={(e) => handleGuestChange(category.key, "increase", e)}
                          disabled={
                            guestCategories[category.key] >=
                            category.maxLimit
                          }
                          className={`w-8 h-8 flex items-center justify-center rounded-full border transition-colors guest-control ${
                            guestCategories[category.key] >= category.maxLimit
                              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                              : "bg-white text-gray-600 hover:bg-red-50 hover:border-red-200"
                          }`}
                          whileTap={{ scale: 0.9 }}
                          style={{ backgroundColor: guestCategories[category.key] >= category.maxLimit ? "#f3f4f6" : "white" }}
                        >
                          <Plus className="w-4 h-4 guest-control" />
                        </motion.button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end pt-4 border-t border-gray-100 guest-control">
                    <button 
                      onClick={() => setActiveField(null)}
                      className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors guest-control"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>,
            document.body
          )}
        </div>

        <div className="p-4 bg-gradient-to-r from-rose-500 to-red-600">
          <motion.button
            onClick={handleSearch}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full text-white py-3 rounded-lg font-bold flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Searching...
              </span>
            ) : (
              <>
                <Search className="mr-2" />
                Search
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;