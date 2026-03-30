import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaSearch, FaCompass, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';

function NotFound() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center px-4 py-16">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl w-full text-center"
      >
        {}
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <motion.h1
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent"
          >
            404
          </motion.h1>
        </motion.div>

        {}
        <motion.div
          variants={itemVariants}
          className="mb-6"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block"
          >
            <FaCompass className="text-6xl text-purple-500 mx-auto" />
          </motion.div>
        </motion.div>

        {}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Oops! You've Lost Your Way
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-2">
            The page you're looking for seems to have wandered off the map.
            Don't worry, even the best explorers get lost sometimes!
          </p>
          <p className="text-md text-gray-500">
            Let's get you back on track to discover amazing destinations.
          </p>
        </motion.div>

        {}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-purple-600 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-200"
          >
            <FaArrowLeft />
            Go Back
          </motion.button>

          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <FaHome />
              Go to Homepage
            </motion.button>
          </Link>

          <Link to="/listings">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-pink-600 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-pink-200"
            >
              <FaSearch />
              Browse Listings
            </motion.button>
          </Link>
        </motion.div>

        {}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
        >
          {}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default NotFound;
