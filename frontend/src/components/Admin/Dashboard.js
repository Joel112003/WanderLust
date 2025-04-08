import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaList, FaComments, FaClock, FaArrowUp, FaArrowDown, FaChartLine, FaEye, FaStar, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalReviews: 0,
    pendingListings: 0,
    recentUsers: [],
    recentListings: [],
    userGrowth: 15,
    listingGrowth: 8,
    chartData: [
      { name: 'Jan', users: 400, listings: 240 },
      { name: 'Feb', users: 300, listings: 139 },
      { name: 'Mar', users: 200, listings: 980 },
      { name: 'Apr', users: 278, listings: 390 },
      { name: 'May', users: 189, listings: 480 },
    ]
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    
    // Simulate API delay for demo purposes
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        damping: 15, 
        stiffness: 200 
      }
    }
  };
  
  const statColors = {
    users: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-500",
      gradient: "from-blue-500 to-blue-600",
      light: "bg-blue-100"
    },
    listings: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-500",
      gradient: "from-emerald-500 to-emerald-600",
      light: "bg-emerald-100"
    },
    reviews: {
      bg: "bg-violet-50",
      text: "text-violet-600",
      border: "border-violet-500",
      gradient: "from-violet-500 to-violet-600",
      light: "bg-violet-100"
    },
    pending: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-500",
      gradient: "from-amber-500 to-amber-600",
      light: "bg-amber-100"
    }
  };

  const StatCard = ({ icon, title, value, growth, colors, isLoading }) => (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
      className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100`}
    >
      <div className="flex h-full">
        <div className={`w-2 ${colors.border}`}></div>
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-gray-500 text-sm font-medium">{title}</p>
              {isLoading ? (
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-800">{value.toLocaleString()}</p>
              )}
            </div>
            <div className={`p-3 rounded-xl ${colors.bg}`}>
              <div className={`text-2xl ${colors.text}`}>{icon}</div>
            </div>
          </div>
          
          {growth !== undefined && (
            <div className="mt-6 flex items-center space-x-1">
              {isLoading ? (
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <>
                  {growth > 0 ? (
                    <FaArrowUp className="text-emerald-500" />
                  ) : (
                    <FaArrowDown className="text-rose-500" />
                  )}
                  <span className={`font-medium ${growth > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {Math.abs(growth)}%
                  </span>
                  <span className="text-gray-500 text-sm">from last month</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const ChartCard = ({ title, isLoading }) => (
    <motion.div
      variants={cardVariants}
      className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center space-x-2">
          <span className="inline-block w-3 h-3 rounded-full bg-indigo-500"></span>
          <span className="text-sm text-gray-500">Users</span>
          <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 ml-2"></span>
          <span className="text-sm text-gray-500">Listings</span>
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-[320px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
          <FaChartLine className="text-gray-300 text-4xl" />
        </div>
      ) : (
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorListings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ padding: '5px 0' }}
              />
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="#6366F1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorUsers)" 
                dot={{ r: 4 }}
                activeDot={{ r: 7, strokeWidth: 0 }}
              />
              <Area 
                type="monotone" 
                dataKey="listings" 
                stroke="#10B981" 
                strokeWidth={3} 
                fillOpacity={1}
                fill="url(#colorListings)" 
                dot={{ r: 4 }}
                activeDot={{ r: 7, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );

  const RecentActivity = ({ title, items, type, isLoading }) => (
    <motion.div
      variants={cardVariants}
      className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-full"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center space-x-2 px-3 py-1 bg-indigo-50 rounded-full">
          <FaCalendarAlt className="text-indigo-500 text-xs" />
          <span className="text-xs text-indigo-600 font-medium">Last 7 days</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
              <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          ))
        ) : items && items.length > 0 ? (
          items.map((item, index) => (
            <motion.div
              key={item._id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-all duration-300 border border-transparent hover:border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${type === 'users' ? statColors.users.light : statColors.listings.light} flex items-center justify-center`}>
                  {type === 'users' ? (
                    <FaUsers className={statColors.users.text} />
                  ) : (
                    <FaList className={statColors.listings.text} />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {type === 'users' ? item.username || item.email : item.title}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FaCalendarAlt className="text-xs" />
                    {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors duration-300 text-sm font-medium flex items-center space-x-1"
              >
                <FaEye className="text-xs" />
                <span>View</span>
              </motion.button>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">No recent data available</div>
        )}
        
        {!isLoading && items && items.length > 0 && (
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            className="w-full py-3 mt-2 text-indigo-600 font-medium text-sm rounded-xl hover:bg-indigo-50 transition-colors duration-300"
          >
            View All {title}
          </motion.button>
        )}
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      <motion.div 
        variants={cardVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2"
      >
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-500">Welcome back to your admin overview</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center space-x-2"
        >
          <FaChartLine />
          <span>Generate Report</span>
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<FaUsers />}
          title="Total Users"
          value={stats.totalUsers}
          growth={stats.userGrowth}
          colors={statColors.users}
          isLoading={isLoading}
        />
        <StatCard
          icon={<FaList />}
          title="Total Listings"
          value={stats.totalListings}
          growth={stats.listingGrowth}
          colors={statColors.listings}
          isLoading={isLoading}
        />
        <StatCard
          icon={<FaComments />}
          title="Total Reviews"
          value={stats.totalReviews}
          growth={3}
          colors={statColors.reviews}
          isLoading={isLoading}
        />
        <StatCard
          icon={<FaClock />}
          title="Pending Listings"
          value={stats.pendingListings}
          colors={statColors.pending}
          isLoading={isLoading}
        />
      </div>

      <ChartCard 
        title="Growth Overview" 
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity
          title="Recent Users"
          items={stats.recentUsers}
          type="users"
          isLoading={isLoading}
        />
        <RecentActivity
          title="Recent Listings"
          items={stats.recentListings}
          type="listings"
          isLoading={isLoading}
        />
      </div>
    </motion.div>
  );
};

export default Dashboard;