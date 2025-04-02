import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../AuthContext";
import { motion } from "framer-motion";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
const loginEndpoint = `${API_URL}/auth/login`;

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = inputValue;

  const handleOnChange = (e) => {
    setInputValue({ ...inputValue, [e.target.name]: e.target.value });
    setError("");
  };

  const handleError = (err) =>
    toast.error(err, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
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
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      style: {
        backgroundColor: "#4F46E5",
        borderRadius: "10px",
        fontWeight: "500",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      },
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(
        loginEndpoint,
        { email, password },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (data.success) {
        // Call AuthContext.login to store user data and token
        login(data.user, data.token);
        handleSuccess("Login successful!");
        navigate("/listings");
      }
    } catch (err) {
      let errorMessage = "Network error. Please try again.";
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
  const pageTransition = {
    type: "spring",
    stiffness: 100,
    damping: 20
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 14
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 14,
        delay: 0.3
      }
    },
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 15px rgba(79, 70, 229, 0.2)",
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

  const logoVariants = {
    hidden: { opacity: 0, y: -20, rotate: -5 },
    visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.1
      }
    }
  };

  const errorVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.3 }
    }
  };

  const bgVariants = {
    hidden: { backgroundPosition: "0% 0%" },
    visible: { 
      backgroundPosition: "100% 100%",
      transition: { 
        duration: 20, 
        repeat: Infinity, 
        repeatType: "reverse" 
      }
    }
  };

  const floatAnimation = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut"
      }
    }
  };

  const showPasswordVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.2, rotate: 10 },
    tap: { scale: 0.8, rotate: 0 }
  };

  const inputFocusVariants = {
    initial: { boxShadow: "0 0 0 0 rgba(79, 70, 229, 0)" },
    focus: {
      scale: 1.01,
      boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.3)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={bgVariants}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50"
      style={{ backgroundSize: "200% 200%" }}
    >
      <motion.div 
        variants={containerVariants}
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-indigo-100 relative overflow-hidden"
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Decorative elements */}
        <motion.div 
          className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200 to-indigo-100 rounded-bl-full opacity-60 -z-10"
          initial={{ x: 20, y: -20, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 0.6 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200 to-blue-100 rounded-tr-full opacity-60 -z-10"
          initial={{ x: -20, y: 20, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 0.6 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        />
        
        <motion.div
          variants={logoVariants}
          className="flex justify-center mb-6"
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            variants={floatAnimation}
            initial="initial"
            animate="animate"
            className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600"
          >
            Welcome Back!
          </motion.div>
        </motion.div>
        
        {error && (
          <motion.div 
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm"
          >
            <motion.div 
              animate={{ x: [0, -5, 5, -5, 5, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {error}
            </motion.div>
          </motion.div>
        )}
        
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
        >
          <motion.div 
            variants={itemVariants}
            className="relative"
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300"
                required
                disabled={loading}
              />
            </motion.div>
            {/* Animated indicator icon */}
            {email && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="absolute right-3 top-10 text-green-500"
              >
                ✓
              </motion.div>
            )}
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="relative"
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <motion.div
              initial="initial"
              whileFocus="focus"
              variants={inputFocusVariants}
              className="relative"
            >
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                placeholder="Enter your password"
                onChange={handleOnChange}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300"
                required
                disabled={loading}
              />
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                variants={showPasswordVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 cursor-pointer hover:text-indigo-600 transition-all duration-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </motion.button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            whileTap="tap"
          >
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 px-4 rounded-lg shadow-md transition duration-300 flex items-center justify-center relative overflow-hidden"
            >
              {loading ? (
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="h-6 w-6 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <motion.span 
                    className="font-medium relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Login
                  </motion.span>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  />
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.form>
        
        <motion.p 
          variants={itemVariants}
          className="mt-3 text-center text-gray-600"
        >
          Don't have an account?{" "}
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="inline-block"
          >
            <Link
              to="/auth/signup"
              className="text-indigo-600 hover:text-indigo-800 font-medium transition duration-300 hover:underline"
            >
              <motion.span
                initial={{ backgroundSize: "0% 2px" }}
                whileHover={{ 
                  backgroundSize: "100% 2px",
                  color: "#4338ca" 
                }}
                style={{ 
                  backgroundImage: "linear-gradient(to right, #4338ca, #6366f1)",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "0 100%",
                  transition: "background-size 0.3s, color 0.3s"
                }}
              >
                Sign Up
              </motion.span>
            </Link>
          </motion.span>
        </motion.p>
      </motion.div>
      
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        limit={3}
      />
    </motion.div>
  );
};

export default Login;