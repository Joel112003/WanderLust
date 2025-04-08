import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserShield, FaUserTimes, FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setUsers(response.data);
    } catch (error) {
      toast.error('Error fetching users', {
        className: 'bg-red-100 text-red-900'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId, currentStatus) => {
    try {
      await axios.patch(
        `${API_URL}/admin/users/${userId}/role`,
        { isAdmin: !currentStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }}
      );
      fetchUsers();
      toast.success('User role updated successfully', {
        className: 'bg-green-100 text-green-900'
      });
    } catch (error) {
      toast.error('Error updating user role', {
        className: 'bg-red-100 text-red-900'
      });
    }
  };

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.username.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' ? true : 
                         filterRole === 'admin' ? user.isAdmin : !user.isAdmin;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      const compareValue = a.username.localeCompare(b.username);
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 500
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

  const getRandomColor = (username) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-pink-100 text-pink-600',
      'bg-indigo-100 text-indigo-600',
      'bg-yellow-100 text-yellow-600',
      'bg-teal-100 text-teal-600',
      'bg-red-100 text-red-600',
    ];
    
    // Generate a consistent index based on the username
    const charSum = username.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: {
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            },
            scale: {
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const emptyStateAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 500
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <motion.h2 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-gray-800"
        >
          User Management
        </motion.h2>
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4 w-full sm:w-auto"
        >
          <div className="relative flex-1 sm:flex-initial">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200"
            />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <motion.select
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm appearance-none bg-white transition-all duration-200"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="user">Users</option>
            </motion.select>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-3 rounded-xl bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors duration-200 shadow-sm"
            aria-label={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
          >
            {sortOrder === 'asc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
          </motion.button>
        </motion.div>
      </div>

      {filteredUsers.length === 0 ? (
        <motion.div 
          variants={emptyStateAnimation}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="text-gray-400 mb-4">
            <FaUser className="mx-auto h-16 w-16" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No users found</h3>
          <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria</p>
        </motion.div>
      ) : (
        <motion.div
          variants={tableVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                <AnimatePresence mode="popLayout">
                  {filteredUsers.map((user, index) => {
                    const avatarColor = getRandomColor(user.username);
                    
                    return (
                      <motion.tr
                        key={user._id}
                        custom={index}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <motion.div 
                              whileHover={{ scale: 1.1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 17 }}
                              className={`h-10 w-10 rounded-full ${avatarColor} flex items-center justify-center shadow-sm`}
                            >
                              <span className="font-medium text-sm">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </motion.div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.username}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                Joined {new Date(user.createdAt).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isAdmin 
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            onClick={() => toggleAdminStatus(user._id, user.isAdmin)}
                            className={`inline-flex items-center px-3 py-2 rounded-lg text-sm ${
                              user.isAdmin
                                ? 'text-red-700 bg-red-100 hover:bg-red-200'
                                : 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200'
                            } transition-colors duration-200`}
                          >
                            {user.isAdmin ? (
                              <>
                                <FaUserTimes className="mr-2" />
                                Remove Admin
                              </>
                            ) : (
                              <>
                                <FaUserShield className="mr-2" />
                                Make Admin
                              </>
                            )}
                          </motion.button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default UserList;