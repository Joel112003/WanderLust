import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FaChartBar, FaUsers, FaList, FaComments, FaSignOutAlt, FaBars, FaTimes, FaBell, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState(3); // Example notification count
  const [user, setUser] = useState(null); // Example user state
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
      className: 'bg-indigo-100 text-indigo-900 font-medium'
    });
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin', icon: <FaChartBar className="text-xl" />, label: 'Dashboard' },
    { path: '/admin/users', icon: <FaUsers className="text-xl" />, label: 'Users' },
    { path: '/admin/listings', icon: <FaList className="text-xl" />, label: 'Listings' },
    { path: '/admin/reviews', icon: <FaComments className="text-xl" />, label: 'Reviews' }
  ];

  // Enhanced animation variants
  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 250,
        damping: 25,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    closed: {
      x: "-100%",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 250,
        damping: 25,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const menuItemVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    closed: {
      x: -30,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const pageTransitionVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  const activeMenuGradient = "bg-gradient-to-r from-indigo-600 to-violet-600";

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-slate-900 md:hidden z-20 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={isSidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className="bg-gradient-to-br from-slate-900 to-indigo-900 text-white w-72 py-7 px-3 absolute inset-y-0 left-0 transform md:relative md:translate-x-0 z-30 shadow-2xl shadow-indigo-900/20 overflow-y-auto"
      >
        <div className="flex items-center justify-between px-4 mb-8">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <span className="font-bold">W</span>
            </div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
              Wanderlust
            </span>
          </motion.div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden hover:bg-indigo-700/50 p-2 rounded-lg transition-colors duration-200"
          >
            {isSidebarOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
          </button>
        </div>

        <div className="px-4 mb-8">
          <div className="flex items-center space-x-3 bg-indigo-800/30 p-4 rounded-xl">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center shadow-md">
              <FaUser className="text-white text-sm" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user.username}</p>
              <p className="text-xs text-indigo-200">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="px-3 mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-indigo-300 mb-2 pl-3">Main Menu</p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <motion.div
                  key={item.path}
                  variants={menuItemVariants}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="overflow-hidden"
                >
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? `${activeMenuGradient} text-white shadow-lg shadow-indigo-600/30`
                        : 'hover:bg-white/10 text-slate-200'
                    }`}
                  >
                    <span className={`${isActive ? 'text-white' : 'text-indigo-300'}`}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                    
                    {isActive && (
                      <motion.div 
                        layoutId="activeIndicator"
                        className="ml-auto h-2 w-2 rounded-full bg-white"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>
        
        <div className="px-3 mt-auto">
          <p className="text-xs font-medium uppercase tracking-wider text-indigo-300 mb-2 pl-3">Account</p>
          <motion.div
            variants={menuItemVariants}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3.5 rounded-xl hover:bg-white/10 w-full text-left text-slate-200 transition-all duration-200"
            >
              <span className="text-rose-400">
                <FaSignOutAlt className="text-xl" />
              </span>
              <span className="font-medium">Logout</span>
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-md z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
              >
                <FaBars className="h-6 w-6 text-slate-600" />
              </button>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-2"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <h1 className="text-xl font-semibold text-slate-800">
                  Admin Portal
                </h1>
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-6">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative cursor-pointer"
              >
                <FaBell className="h-6 w-6 text-slate-600" />
                {notifications > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-md shadow-rose-500/30"
                  >
                    {notifications}
                  </motion.span>
                )}
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-3 border-l pl-4 border-slate-200"
                whileHover={{ x: 2 }}
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md">
                  <FaUser className="text-white text-xs" />
                </div>
                <span className="text-slate-700 font-medium text-sm hidden sm:block">Admin User</span>
              </motion.div>
            </div>
          </div>
          
          {/* Page Path Indicator */}
          <div className="px-6 py-2 bg-gradient-to-r from-slate-50 to-indigo-50 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              {location.pathname.split('/').filter(Boolean).map((path, index, arr) => (
                <span key={index}>
                  <span className="capitalize">{path}</span>
                  {index < arr.length - 1 && <span className="mx-2 text-slate-400">/</span>}
                </span>
              ))}
            </p>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageTransitionVariants}
              className="container mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;