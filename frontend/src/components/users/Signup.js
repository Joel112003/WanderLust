import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../AuthContext";
import { motion } from "framer-motion";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
const signupEndpoint = `${API_URL}/auth/signup`;

const Signup = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { username, email, password } = inputValue;

  const handleOnChange = (e) => {
    setInputValue({ ...inputValue, [e.target.name]: e.target.value });
  };

  const handleError = (err) =>
    toast.error(err, { 
      position: "top-right", 
      autoClose: 3000,
      style: {
        backgroundColor: "#EF4444",
        borderRadius: "10px",
        fontWeight: "500",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      },
    });
    
  const handleSuccess = (msg) =>
    toast.success(msg, { 
      position: "top-right", 
      autoClose: 2000,
      style: {
        backgroundColor: "#8B5CF6",
        borderRadius: "10px",
        fontWeight: "500",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      },
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!username || !email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(
        signupEndpoint,
        { username, email, password },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (data.success) {
        // Use AuthContext.login to store user data and token
        login(data.user, data.token);
        handleSuccess("Signup successful!");
        navigate("/listings");
      } else {
        setError(data.message || "Signup failed!");
        handleError(data.message || "Signup failed!");
      }
    } catch (err) {
      let errorMessage = "Signup failed!";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage =
          typeof err.response.data.message === "object"
            ? JSON.stringify(err.response.data.message)
            : err.response.data.message;
      } else if (err.message) {
        errorMessage =
          typeof err.message === "object" ? JSON.stringify(err.message) : err.message;
      }
      setError(errorMessage);
      handleError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        mass: 1,
        damping: 12,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      y: -50,
      transition: {
        duration: 0.3
      }
    }
  };

  const formItemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.5,
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    },
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 20px rgba(139, 92, 246, 0.3)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.97
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.2
      }
    }
  };

  const errorVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const bgPatternVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 0.5,
      transition: {
        delay: 1,
        duration: 1.5
      }
    }
  };

  const inputFocusVariants = {
    initial: { 
      boxShadow: "0 0 0 0 rgba(139, 92, 246, 0)",
      y: 0
    },
    focus: {
      boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.3)",
      y: -3,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 17
      }
    }
  };

  const passwordToggleVariants = {
    hover: {
      rotate: [0, -10, 10, -10, 0],
      transition: {
        duration: 0.5
      }
    }
  };

  const linkVariants = {
    hover: {
      color: "#6D28D9",
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10
      }
    }
  };

  const cardVariants = {
    hover: {
      rotate: 0,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 relative overflow-hidden"
    >
      {/* Animated background patterns */}
      <motion.div 
        variants={bgPatternVariants}
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <motion.div 
          className="absolute top-0 right-0 w-64 h-64 bg-purple-300 rounded-full opacity-20 -mr-32 -mt-32"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 5, 0],
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-80 h-80 bg-blue-300 rounded-full opacity-20 -ml-40 -mb-40"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -3, 0],
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute top-1/4 left-1/4 w-40 h-40 bg-indigo-300 rounded-full opacity-10"
          animate={{ 
            y: [0, 30, 0],
            x: [0, 20, 0],
          }}
          transition={{ 
            duration: 18, 
            repeat: Infinity,
            repeatType: "reverse",
            delay: 2
          }}
        />
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transition-all duration-700"
        whileHover={cardVariants.hover}
      >
        <motion.h1 
          variants={titleVariants}
          className="text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600"
        >
          Sign Up
        </motion.h1>
        
        {error && (
          <motion.div 
            variants={errorVariants}
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6"
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div 
              animate={{ 
                x: [0, -3, 3, -2, 2, 0],
              }}
              transition={{ 
                duration: 0.5,
                delay: 0.1 
              }}
            >
              {error}
            </motion.div>
          </motion.div>
        )}
        
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          variants={containerVariants}
        >
          <motion.div 
            variants={formItemVariants}
            className="group"
          >
            <label className="block text-sm font-semibold text-gray-600 mb-1 group-hover:text-purple-600 transition-colors duration-300">
              Username
            </label>
            <motion.div
              initial="initial"
              whileFocus="focus"
              variants={inputFocusVariants}
            >
              <input
                type="text"
                name="username"
                value={username}
                placeholder="Enter your username"
                onChange={handleOnChange}
                className="mt-1 block w-full px-4 py-3 border-0 border-b-2 border-gray-300 focus:border-purple-500 focus:ring-0 transition-all duration-300 bg-gray-50 rounded-t-md"
                required
                disabled={loading}
              />
            </motion.div>
            {username && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  transition: {
                    type: "spring",
                    stiffness: 500,
                    damping: 15
                  }
                }}
                className="h-1 w-full bg-gradient-to-r from-purple-500 to-blue-500 mt-1 rounded transform origin-left"
                style={{ 
                  scaleX: username.length > 0 ? Math.min(username.length / 10, 1) : 0
                }}
              />
            )}
          </motion.div>
          
          <motion.div 
            variants={formItemVariants}
            className="group"
          >
            <label className="block text-sm font-semibold text-gray-600 mb-1 group-hover:text-purple-600 transition-colors duration-300">
              Email
            </label>
            <motion.div
              initial="initial"
              whileFocus="focus"
              variants={inputFocusVariants}
            >
              <input
                type="email"
                name="email"
                value={email}
                placeholder="Enter your email"
                onChange={handleOnChange}
                className="mt-1 block w-full px-4 py-3 border-0 border-b-2 border-gray-300 focus:border-purple-500 focus:ring-0 transition-all duration-300 bg-gray-50 rounded-t-md"
                required
                disabled={loading}
              />
            </motion.div>
            {email && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  transition: {
                    type: "spring",
                    stiffness: 500,
                    damping: 15
                  }
                }}
                className="h-1 w-full bg-gradient-to-r from-purple-500 to-blue-500 mt-1 rounded transform origin-left"
                style={{ 
                  scaleX: /\S+@\S+\.\S+/.test(email) ? 1 : 0.5 
                }}
              />
            )}
          </motion.div>
          
          {/* Fixed this section - removed duplicate nested motion.div */}
          <motion.div 
            variants={formItemVariants}
            className="group"
          >
            <label className="block text-sm font-semibold text-gray-600 mb-1 group-hover:text-purple-600 transition-colors duration-300">
              Password
            </label>
            <div className="relative">
              <motion.div
                initial="initial"
                whileFocus="focus"
                variants={inputFocusVariants}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  placeholder="Enter your password"
                  onChange={handleOnChange}
                  className="mt-1 block w-full px-4 py-3 border-0 border-b-2 border-gray-300 focus:border-purple-500 focus:ring-0 transition-all duration-300 bg-gray-50 rounded-t-md"
                  required
                  disabled={loading}
                />
              </motion.div>
              <motion.button
                type="button"
                variants={passwordToggleVariants}
                whileHover="hover"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600 transition-colors duration-300"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </motion.button>
            </div>
            {password && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  transition: {
                    type: "spring",
                    stiffness: 500,
                    damping: 15
                  }
                }}
                className="h-1 w-full bg-gradient-to-r from-purple-500 to-blue-500 mt-1 rounded transform origin-left"
                style={{ 
                  scaleX: Math.min(password.length / 12, 1)
                }}
              />
            )}
            {password && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ 
                  opacity: password.length < 8 ? 1 : 0, 
                  height: password.length < 8 ? "auto" : 0,
                  transition: { duration: 0.3 }
                }}
                className="text-xs text-amber-600 mt-1"
              >
                Password must be at least 8 characters long
              </motion.p>
            )}
          </motion.div>
          
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transform transition-all duration-300"
          >
            {loading ? (
              <motion.div 
                className="flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </motion.div>
            ) : (
              "Create Account"
            )}
          </motion.button>
        </motion.form>
        
        <motion.div 
          variants={formItemVariants}
          className="text-center mt-6"
        >
          <p className="text-gray-600">
            Already have an account?{" "}
            <motion.span variants={linkVariants} whileHover="hover">
              <Link to="/auth/login" className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-300">
                Log In
              </Link>
            </motion.span>
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            transition: { delay: 1, duration: 0.5 }
          }}
          className="border-t border-gray-200 mt-8 pt-6 text-center text-xs text-gray-500"
        >
          By signing up, you agree to our 
          <motion.span variants={linkVariants} whileHover="hover" className="inline-block">
            <Link to="/terms" className="text-purple-600 hover:underline mx-1">
              Terms of Service
            </Link>
          </motion.span>
          and
          <motion.span variants={linkVariants} whileHover="hover" className="inline-block">
            <Link to="/privacy" className="text-purple-600 hover:underline mx-1">
              Privacy Policy
            </Link>
          </motion.span>
        </motion.div>
      </motion.div>
      <ToastContainer />
    </motion.div>
  );
};

export default Signup;