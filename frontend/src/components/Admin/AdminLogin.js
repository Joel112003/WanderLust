import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaLock, FaUser, FaEnvelope, FaKey } from 'react-icons/fa';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function AdminLogin() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.post(`${API_URL}/admin/login`, formData);
      localStorage.setItem('adminToken', res.data.token);
      toast.success('Admin login successful!', {
        className: 'bg-green-100 text-green-900'
      });
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed', {
        className: 'bg-red-100 text-red-900'
      });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const InputField = ({ icon, name, type, placeholder }) => (
    <motion.div
      variants={itemVariants}
      className="relative group"
    >
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300 group-hover:text-purple-500">
        {icon}
      </div>
      <input
        id={name}
        name={name}
        type={type}
        required
        value={formData[name]}
        onChange={handleChange}
        className="pl-10 block w-full py-3 border border-gray-300 rounded-lg 
                 focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                 transition-all duration-300 ease-in-out
                 hover:border-purple-400 hover:shadow-md
                 bg-white bg-opacity-80 backdrop-blur-sm"
        placeholder={placeholder}
      />
      <motion.div
        className="absolute inset-0 border border-purple-500 rounded-lg pointer-events-none opacity-0"
        animate={{
          scale: [1, 1.02, 1],
          opacity: [0, 0.2, 0],
        }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </motion.div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md p-8 space-y-8"
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-lg bg-opacity-90"
          whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="text-center space-y-2"
            variants={itemVariants}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center"
            >
              <FaKey className="text-3xl text-white" />
            </motion.div>
            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              Admin Login
            </h2>
            <p className="text-sm text-gray-600">
              Access the Wanderlust admin panel
            </p>
          </motion.div>

          <motion.form
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
            variants={containerVariants}
          >
            <div className="space-y-4">
              <InputField
                icon={<FaUser className="h-5 w-5" />}
                name="username"
                type="text"
                placeholder="Username"
              />
              <InputField
                icon={<FaEnvelope className="h-5 w-5" />}
                name="email"
                type="email"
                placeholder="Email address"
              />
              <InputField
                icon={<FaLock className="h-5 w-5" />}
                name="password"
                type="password"
                placeholder="Password"
              />
            </div>

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 
                           border border-transparent text-sm font-medium rounded-lg
                           text-white bg-gradient-to-r from-purple-600 to-indigo-600
                           hover:from-purple-700 hover:to-indigo-700
                           focus:outline-none focus:ring-2 focus:ring-offset-2 
                           focus:ring-purple-500 transition-all duration-300
                           ${loading ? 'opacity-70' : ''}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <motion.span
                    className="flex items-center"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </motion.span>
                ) : 'Sign in'}
              </motion.button>
            </motion.div>
          </motion.form>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default AdminLogin;