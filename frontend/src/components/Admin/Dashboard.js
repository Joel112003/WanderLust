import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaList, FaComments, FaClock, FaArrowUp, FaArrowDown, FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const StatCard = ({ icon, title, value, growth, color }) => (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white p-6 rounded-xl shadow-lg border-l-4 ${color} hover:shadow-xl transition-shadow duration-300`}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`text-2xl ${color.replace('border', 'text')}`}>{icon}</div>
      </div>
      {growth && (
        <div className="mt-4 flex items-center">
          {growth > 0 ? (
            <FaArrowUp className="text-green-500 mr-1" />
          ) : (
            <FaArrowDown className="text-red-500 mr-1" />
          )}
          <span className={growth > 0 ? "text-green-500" : "text-red-500"}>
            {Math.abs(growth)}% from last month
          </span>
        </div>
      )}
    </motion.div>
  );

  const RecentActivity = ({ title, items, type }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white p-6 rounded-xl shadow-lg"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        {title}
        <span className="ml-2 text-sm text-purple-600 font-normal">
          Last 7 days
        </span>
      </h3>
      <div className="space-y-4">
        {items?.map((item, index) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                {type === 'users' ? (
                  <FaUsers className="text-purple-600" />
                ) : (
                  <FaList className="text-purple-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {type === 'users' ? item.username || item.email : item.title}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-purple-600 hover:text-purple-700"
            >
              View Details
            </motion.button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          Generate Report
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<FaUsers />}
          title="Total Users"
          value={stats.totalUsers}
          growth={stats.userGrowth}
          color="border-blue-500"
        />
        <StatCard
          icon={<FaList />}
          title="Total Listings"
          value={stats.totalListings}
          growth={stats.listingGrowth}
          color="border-green-500"
        />
        <StatCard
          icon={<FaComments />}
          title="Total Reviews"
          value={stats.totalReviews}
          color="border-purple-500"
        />
        <StatCard
          icon={<FaClock />}
          title="Pending Listings"
          value={stats.pendingListings}
          color="border-yellow-500"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Growth Overview</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
              <Line 
                type="monotone" 
                dataKey="listings" 
                stroke="#82ca9d" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity
          title="Recent Users"
          items={stats.recentUsers}
          type="users"
        />
        <RecentActivity
          title="Recent Listings"
          items={stats.recentListings}
          type="listings"
        />
      </div>
    </motion.div>
  );
};

export default Dashboard;