import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaList, FaComments, FaClock, FaDownload, FaSpinner } from 'react-icons/fa';
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
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportType, setReportType] = useState('all');
  const [dateRange, setDateRange] = useState('week');

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

  const generateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const response = await axios.get(`${API_URL}/admin/reports/generate`, {
        params: { type: reportType, dateRange },
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        responseType: 'blob' // Important for handling file downloads
      });

      // Create a download link for the report
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const fileName = `wanderlust_${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

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
        <div className="flex items-center gap-4">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Data</option>
            <option value="users">Users</option>
            <option value="listings">Listings</option>
            <option value="reviews">Reviews</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
          <button
            onClick={generateReport}
            disabled={isGeneratingReport}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition duration-200 disabled:bg-purple-400"
          >
            {isGeneratingReport ? (
              <>
                <FaSpinner className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FaDownload />
                Generate Report
              </>
            )}
          </button>
        </div>
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