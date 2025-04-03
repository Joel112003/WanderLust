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

  // Animation variants
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

  // Inline styles
  const styles = {
    pageContainer: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #e0e7ff 0%, #e0f2fe 50%, #ede9fe 100%)",
      backgroundSize: "200% 200%"
    },
    formContainer: {
      backgroundColor: "white",
      padding: "32px",
      borderRadius: "12px",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      width: "100%",
      maxWidth: "448px",
      border: "1px solid #c7d2fe",
      position: "relative",
      overflow: "hidden"
    },
    decorativeElement1: {
      position: "absolute",
      top: 0,
      right: 0,
      width: "128px",
      height: "128px",
      background: "linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 100%)",
      borderRadius: "0 0 0 100%",
      opacity: 0.6,
      zIndex: -10
    },
    decorativeElement2: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "96px",
      height: "96px",
      background: "linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)",
      borderRadius: "0 100% 0 0",
      opacity: 0.6,
      zIndex: -10
    },
    title: {
      fontSize: "36px",
      fontWeight: 800,
      textAlign: "center",
      background: "linear-gradient(90deg, #4f46e5 0%, #2563eb 100%)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      marginBottom: "24px"
    },
    errorBox: {
      backgroundColor: "#fee2e2",
      borderLeft: "4px solid #ef4444",
      color: "#b91c1c",
      padding: "12px 16px",
      borderRadius: "8px",
      marginBottom: "24px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
    },
    formGroup: {
      marginBottom: "24px",
      position: "relative"
    },
    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: 500,
      color: "#374151",
      marginBottom: "4px"
    },
    input: {
      marginTop: "4px",
      display: "block",
      width: "100%",
      padding: "12px 16px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      outline: "none",
      transition: "all 0.3s ease",
      fontSize: "16px"
    },
    inputFocus: {
      borderColor: "#818cf8",
      boxShadow: "0 0 0 3px rgba(129, 140, 248, 0.3)",
      ring: "2px solid #818cf8"
    },
    passwordToggle: {
      position: "absolute",
      top: "50%",
      right: "12px",
      transform: "translateY(-50%)",
      backgroundColor: "transparent",
      border: "none",
      cursor: "pointer",
      color: "#4b5563",
      padding: "8px"
    },
    submitButton: {
      width: "100%",
      background: "linear-gradient(90deg, #4f46e5 0%, #2563eb 100%)",
      color: "white",
      padding: "12px 16px",
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s ease",
      border: "none",
      fontSize: "16px",
      fontWeight: 500,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden"
    },
    submitButtonHover: {
      boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)"
    },
    spinner: {
      width: "24px",
      height: "24px",
      border: "2px solid white",
      borderTopColor: "transparent",
      borderRadius: "50%",
      animation: "spin 1s linear infinite"
    },
    linkText: {
      marginTop: "12px",
      textAlign: "center",
      color: "#4b5563",
      fontSize: "14px"
    },
    link: {
      color: "#4f46e5",
      fontWeight: 500,
      textDecoration: "none",
      transition: "all 0.3s ease",
      position: "relative",
      display: "inline-block"
    },
    linkHover: {
      color: "#4338ca",
      textDecoration: "underline"
    },
    linkUnderline: {
      backgroundImage: "linear-gradient(90deg, #4338ca 0%, #6366f1 100%)",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "0 100%",
      backgroundSize: "0% 2px",
      transition: "background-size 0.3s ease, color 0.3s ease"
    },
    linkUnderlineHover: {
      backgroundSize: "100% 2px",
      color: "#4338ca"
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={bgVariants}
      style={styles.pageContainer}
    >
      <motion.div 
        variants={containerVariants}
        style={styles.formContainer}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Decorative elements */}
        <motion.div 
          style={styles.decorativeElement1}
          initial={{ x: 20, y: -20, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 0.6 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
        <motion.div 
          style={styles.decorativeElement2}
          initial={{ x: -20, y: 20, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 0.6 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        />
        
        <motion.div
          variants={logoVariants}
          style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            variants={floatAnimation}
            initial="initial"
            animate="animate"
            style={styles.title}
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
            style={styles.errorBox}
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
          style={{ marginTop: "24px" }}
        >
          <motion.div 
            variants={itemVariants}
            style={styles.formGroup}
          >
            <label style={styles.label}>Email</label>
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
                style={styles.input}
                required
                disabled={loading}
              />
            </motion.div>
            {email && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                style={{ position: "absolute", right: "12px", top: "40px", color: "#10b981" }}
              >
                ✓
              </motion.div>
            )}
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            style={styles.formGroup}
          >
            <label style={styles.label}>Password</label>
            <motion.div
              initial="initial"
              whileFocus="focus"
              variants={inputFocusVariants}
              style={{ position: "relative" }}
            >
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                placeholder="Enter your password"
                onChange={handleOnChange}
                style={styles.input}
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
                style={styles.passwordToggle}
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
              style={styles.submitButton}
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
                  style={styles.spinner}
                />
              ) : (
                <>
                  <motion.span 
                    style={{ position: "relative", zIndex: 10 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Login
                  </motion.span>
                  <motion.div 
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(90deg, #2563eb 0%, #4f46e5 100%)",
                      opacity: 0
                    }}
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
          style={styles.linkText}
        >
          Don't have an account?{" "}
          <motion.span 
            whileHover={{ scale: 1.05 }}
            style={{ display: "inline-block" }}
          >
            <Link
              to="/auth/signup"
              style={styles.link}
            >
              <motion.span
                initial={{ backgroundSize: "0% 2px" }}
                whileHover={{ 
                  backgroundSize: "100% 2px",
                  color: "#4338ca" 
                }}
                style={styles.linkUnderline}
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