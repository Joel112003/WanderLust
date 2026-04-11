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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-16">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl w-full text-center"
      >
<motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <motion.h1
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-9xl font-bold text-red-600 md:text-[12rem]"
          >
            404
          </motion.h1>
        </motion.div>
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
            <FaCompass className="mx-auto text-6xl text-gray-700" />
          </motion.div>
        </motion.div>
<motion.div variants={itemVariants} className="mb-8">
          <h2 className="mb-4 text-3xl font-bold text-stone-900 md:text-4xl">
            Oops! You've Lost Your Way
          </h2>
          <p className="mx-auto mb-2 max-w-2xl text-lg text-stone-600">
            The page you're looking for seems to have wandered off the map.
            Don't worry, even the best explorers get lost sometimes!
          </p>
          <p className="text-md text-stone-500">
            Let's get you back on track to discover amazing destinations.
          </p>
        </motion.div>
<motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border-2 border-gray-200 bg-white px-8 py-3 font-semibold text-gray-700 shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            <FaArrowLeft />
            Go Back
          </motion.button>

          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:bg-red-700 hover:shadow-xl"
            >
              <FaHome />
              Go to Homepage
            </motion.button>
          </Link>

          <Link to="/listings">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 rounded-full border-2 border-red-200 bg-white px-8 py-3 font-semibold text-red-600 shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <FaSearch />
              Browse Listings
            </motion.button>
          </Link>
        </motion.div>
<motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
        >
</motion.div>
      </motion.div>
    </div>
  );
}

export default NotFound;
