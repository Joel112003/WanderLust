import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FaChartBar, FaUsers, FaList, FaComments, FaSignOutAlt, FaBars, FaTimes, FaBell } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState(3); // Example notification count
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast.success('Logged out successfully', {
      position: 'top-right',
      className: 'bg-purple-100 text-purple-900'
    });
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin', icon: <FaChartBar className="text-xl" />, label: 'Dashboard' },
    { path: '/admin/users', icon: <FaUsers className="text-xl" />, label: 'Users' },
    { path: '/admin/listings', icon: <FaList className="text-xl" />, label: 'Listings' },
    { path: '/admin/reviews', icon: <FaComments className="text-xl" />, label: 'Reviews' }
  ];

  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1
      }
    },
    closed: {
      x: "-100%",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1
      }
    }
  };

  const menuItemVariants = {
    open: {
      x: 0,
      opacity: 1
    },
    closed: {
      x: -20,
      opacity: 0
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black md:hidden z-20"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={isSidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className="bg-gradient-to-br from-purple-800 to-purple-900 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform md:relative md:translate-x-0 z-30 shadow-xl"
      >
        <div className="flex items-center justify-between px-4">
          <motion.span 
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200"
            whileHover={{ scale: 1.05 }}
          >
            Admin Panel
          </motion.span>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden hover:bg-purple-700 p-2 rounded-full transition-colors duration-200"
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <motion.div
              key={item.path}
              variants={menuItemVariants}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-purple-700 text-white shadow-lg'
                    : 'hover:bg-purple-700/50 text-purple-100'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            </motion.div>
          ))}

          <motion.button
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-purple-700/50 w-full text-left text-purple-100"
          >
            <FaSignOutAlt className="text-xl" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-md">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
              >
                <FaBars className="h-6 w-6 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800">
                Wanderlust Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="relative"
              >
                <FaBell className="h-6 w-6 text-gray-600 cursor-pointer" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </motion.div>
              <span className="text-gray-600 font-medium">Admin</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;