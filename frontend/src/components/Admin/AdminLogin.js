import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  
  // Create refs for each input field
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update state with functional form to ensure we're using the latest state
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Force the field to maintain focus after state update
    // This is the key fix - we're ensuring the input stays focused
    if (name === 'username' && usernameRef.current) {
      setTimeout(() => {
        usernameRef.current.focus();
      }, 0);
    } else if (name === 'email' && emailRef.current) {
      setTimeout(() => {
        emailRef.current.focus();
      }, 0);
    } else if (name === 'password' && passwordRef.current) {
      setTimeout(() => {
        passwordRef.current.focus();
      }, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.post(`${API_URL}/admin/login`, formData);
      localStorage.setItem('adminToken', res.data.token);
      // Store admin data
      localStorage.setItem('adminData', JSON.stringify({
        username: res.data.username,
        email: res.data.email
      }));
      toast.success('Admin login successful!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const IconBadge = ({ children }) => (
    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-500 
              rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
      {children}
    </div>
  );

  // Simplified InputField component - removed most animations
  const InputField = ({ icon, name, type, placeholder, inputRef }) => (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none 
                  text-gray-400 group-hover:text-indigo-500 transition-colors duration-300">
        {icon}
      </div>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type={type}
        required
        value={formData[name]}
        onChange={handleChange}
        className="pl-12 block w-full py-4 px-4 border-2 border-gray-200 rounded-xl 
                text-gray-700 bg-gray-50 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500
                transition-colors duration-300 ease-out
                hover:border-indigo-300
                placeholder:text-gray-400"
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50">
      {/* Simplified background - no animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply opacity-20"></div>
      </div>
      
      <div className="w-full max-w-md p-4 z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-10 backdrop-blur-lg bg-opacity-95">
          <div className="text-center space-y-4 mb-10">
            <IconBadge>
              <FaKey className="text-4xl text-white" />
            </IconBadge>
            <h2 className="text-4xl font-bold mt-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600">
              Admin Login
            </h2>
            <p className="text-gray-500 font-medium">
              Access the Wanderlust admin panel
            </p>
          </div>

          <form
            className="mt-10 space-y-8"
            onSubmit={handleSubmit}
          >
            <div className="space-y-6">
              <InputField
                icon={<FaUser className="h-5 w-5" />}
                name="username"
                type="text"
                placeholder="Username"
                inputRef={usernameRef}
              />
              <InputField
                icon={<FaEnvelope className="h-5 w-5" />}
                name="email"
                type="email"
                placeholder="Email address"
                inputRef={emailRef}
              />
              <InputField
                icon={<FaLock className="h-5 w-5" />}
                name="password"
                type="password"
                placeholder="Password"
                inputRef={passwordRef}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-4 px-6 
                         text-base font-semibold rounded-xl
                         text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600
                         hover:from-indigo-700 hover:via-purple-700 hover:to-violet-700
                         shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-600/30
                         focus:outline-none focus:ring-4 focus:ring-indigo-500/20
                         transition-colors duration-300 ease-out
                         ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Sign in
                    <span className="ml-2">→</span>
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;