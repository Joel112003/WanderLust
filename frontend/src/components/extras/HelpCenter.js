import React, { useState } from "react";
import { motion } from "framer-motion";

const HelpCenter = () => {
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (newValue) => {
    setTabValue(newValue);
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-3xl mx-auto  p-6 text-center shadow-2xl rounded-2xl bg-white mb-5 " 
      style={{marginTop: "150px" , marginBottom: "150px"}}
    >
      <motion.h1 
        variants={itemVariants}
        className="text-2xl md:text-3xl font-bold mb-4"
      >
        Hi, how can we help?
      </motion.h1>
      
      <motion.div 
        variants={itemVariants}
        className="flex flex-col md:flex-row justify-center mb-8"
      >
        <input
          type="text"
          placeholder="Search how-tos and more"
          className="w-full md:w-3/4 p-3 mr-0 md:mr-2 mb-2 md:mb-0 border rounded-full focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all duration-300"
        />
        <button
          className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-full transform transition-all duration-300 hover:scale-105 focus:outline-none flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search
        </button>
      </motion.div>
      
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex flex-wrap justify-center border-b">
          {["Guest", "Host", "Experience Host", "Travel Admin"].map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabChange(index)}
              className={`px-4 py-2 mx-1 mb-2 text-sm md:text-base transition-all duration-300 border-b-2 ${
                tabValue === index 
                  ? "border-rose-500 text-rose-500 font-medium" 
                  : "border-transparent hover:text-rose-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </motion.div>
      
      <motion.hr variants={itemVariants} className="mb-6" />
      
      <motion.div 
        variants={itemVariants}
        className="overflow-hidden"
      >
        {tabValue === 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-md mb-4 p-4 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <h2 className="text-lg font-semibold">Guides for Guests</h2>
            <p className="text-gray-600 mt-1">Learn how to make the most of your stay.</p>
          </motion.div>
        )}
        
        {tabValue === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-md mb-4 p-4 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <h2 className="text-lg font-semibold">Host Resources</h2>
            <p className="text-gray-600 mt-1">Manage your listings and engage with guests.</p>
          </motion.div>
        )}
        
        {tabValue === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-md mb-4 p-4 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <h2 className="text-lg font-semibold">Experience Host Guides</h2>
            <p className="text-gray-600 mt-1">Create unique experiences for your guests.</p>
          </motion.div>
        )}
        
        {tabValue === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-md mb-4 p-4 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <h2 className="text-lg font-semibold">Travel Admin Tools</h2>
            <p className="text-gray-600 mt-1">Manage bookings and support your team.</p>
          </motion.div>
        )}
      </motion.div>
      
      <motion.hr variants={itemVariants} className="mt-6 mb-4" />
      
      <motion.p 
        variants={itemVariants}
        className="text-gray-500"
      >
        We're here for you
      </motion.p>
      
      <motion.button
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-4 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-full transition-all duration-300 "
      >
        Log in or sign up
      </motion.button>
    </motion.div>
  );
};

export default HelpCenter;