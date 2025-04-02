import React, { useState } from "react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css"; // Default theme

const Calendar = ({ onDateChange }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  // Handle date change
  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
    onDateChange(ranges.selection);
  };

  return (
    <div className="relative w-full max-w-sm">
      {/* Button to Toggle Calendar */}
      <button
        onClick={() => setShowCalendar(!showCalendar)}
        className="w-full p-3 border border-gray-300 rounded-lg flex justify-between items-center bg-white shadow-md hover:shadow-lg transition"
      >
        <span className="text-gray-700">
          {format(dateRange[0].startDate, "dd MMM yyyy")} -{" "}
          {format(dateRange[0].endDate, "dd MMM yyyy")}
        </span>
        <span className="text-gray-500">📅</span>
      </button>

      {/* Animated Calendar Dropdown */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          >
            <DateRange
              editableDateInputs={true}
              moveRangeOnFirstSelection={false}
              ranges={dateRange}
              onChange={handleSelect}
              rangeColors={["#ff385c"]} // Airbnb Red
              className="p-2"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Calendar;
