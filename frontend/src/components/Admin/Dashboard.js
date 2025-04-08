import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaList, FaComments, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalReviews: 0,
    pendingListings: 0,
    recentUsers: [],
    recentListings: [],
    chartData: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        });

        // Create chart data based on recent activities
        const today = new Date();
        const chartData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
          
          const usersForDay = response.data.recentUsers.filter(user => 
            new Date(user.createdAt).toDateString() === date.toDateString()
          ).length;

          const listingsForDay = response.data.recentListings.filter(listing => 
            new Date(listing.createdAt).toDateString() === date.toDateString()
          ).length;

          return {
            name: dayStr,
            users: usersForDay,
            listings: listingsForDay
          };
        }).reverse();

        setStats({
          ...response.data,
          chartData
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-white p-6 rounded-xl shadow-lg border-l-4 ${color}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`text-2xl ${color.replace('border', 'text')}`}>{icon}</div>
      </div>
    </motion.div>
  );

  const RecentActivity = ({ title, items, type }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl shadow-lg"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="space-y-4">
        {items.slice(0, 5).map((item, index) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                {type === 'users' ? (
                  <FaUsers className="text-purple-600" />
                ) : (
                  <FaList className="text-purple-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {type === 'users' ? item.username : item.title}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<FaUsers />}
          color="border-blue-500"
        />
        <StatCard
          title="Total Listings"
          value={stats.totalListings}
          icon={<FaList />}
          color="border-green-500"
        />
        <StatCard
          title="Total Reviews"
          value={stats.totalReviews}
          icon={<FaComments />}
          color="border-purple-500"
        />
        <StatCard
          title="Pending Listings"
          value={stats.pendingListings}
          icon={<FaClock />}
          color="border-yellow-500"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Overview (Last 7 Days)</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                stroke="#6B7280"
                tick={{ fill: '#6B7280' }}
              />
              <YAxis 
                stroke="#6B7280"
                tick={{ fill: '#6B7280' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="users"
                name="New Users"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ r: 4, fill: '#8B5CF6' }}
                activeDot={{ r: 8, fill: '#8B5CF6' }}
              />
              <Line
                type="monotone"
                dataKey="listings"
                name="New Listings"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 4, fill: '#10B981' }}
                activeDot={{ r: 8, fill: '#10B981' }}
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