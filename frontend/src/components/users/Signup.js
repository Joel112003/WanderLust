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
          typeof err.message === "object"
            ? JSON.stringify(err.message)
            : err.message;
      }
      setError(errorMessage);
      handleError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants (same as before)
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
        staggerChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      y: -50,
      transition: {
        duration: 0.3,
      },
    },
  };

  const formItemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
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
        damping: 15,
      },
    },
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 20px rgba(139, 92, 246, 0.3)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    tap: {
      scale: 0.97,
    },
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
        delay: 0.2,
      },
    },
  };

  const errorVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  const bgPatternVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 0.5,
      transition: {
        delay: 1,
        duration: 1.5,
      },
    },
  };

  const inputFocusVariants = {
    initial: {
      boxShadow: "0 0 0 0 rgba(139, 92, 246, 0)",
      y: 0,
    },
    focus: {
      boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.3)",
      y: -3,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 17,
      },
    },
  };

  const passwordToggleVariants = {
    hover: {
      rotate: [0, -10, 10, -10, 0],
      transition: {
        duration: 0.5,
      },
    },
  };

  const linkVariants = {
    hover: {
      color: "#6D28D9",
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10,
      },
    },
  };

  const cardVariants = {
    hover: {
      rotate: 0,
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 15,
      },
    },
  };

  // Inline styles
  const styles = {
    pageContainer: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background:
        "linear-gradient(135deg, #e0f2fe 0%, #ede9fe 50%, #e0e7ff 100%)",
      position: "relative",
      overflow: "hidden",
    },
    bgPattern1: {
      position: "absolute",
      top: 0,
      right: 0,
      width: "256px",
      height: "256px",
      backgroundColor: "#d8b4fe",
      borderRadius: "50%",
      opacity: 0.2,
      marginRight: "-128px",
      marginTop: "-128px",
    },
    bgPattern2: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "320px",
      height: "320px",
      backgroundColor: "#93c5fd",
      borderRadius: "50%",
      opacity: 0.2,
      marginLeft: "-160px",
      marginBottom: "-160px",
    },
    bgPattern3: {
      position: "absolute",
      top: "25%",
      left: "25%",
      width: "160px",
      height: "160px",
      backgroundColor: "#a5b4fc",
      borderRadius: "50%",
      opacity: 0.1,
    },
    formContainer: {
      backgroundColor: "white",
      padding: "32px",
      borderRadius: "12px",
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      width: "100%",
      maxWidth: "448px",
      transition: "all 0.7s ease",
    },
    title: {
      fontSize: "36px",
      fontWeight: 800,
      textAlign: "center",
      marginBottom: "32px",
      background: "linear-gradient(90deg, #8b5cf6 0%, #4f46e5 100%)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    },
    errorBox: {
      backgroundColor: "#fee2e2",
      borderLeft: "4px solid #ef4444",
      color: "#b91c1c",
      padding: "16px",
      borderRadius: "8px",
      marginBottom: "24px",
    },
    formGroup: {
      marginBottom: "24px",
    },
    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: 600,
      color: "#4b5563",
      marginBottom: "4px",
      transition: "color 0.3s ease",
    },
    input: {
      marginTop: "4px",
      display: "block",
      width: "100%",
      padding: "12px 16px",
      border: "none",
      borderBottom: "2px solid #d1d5db",
      backgroundColor: "#f9fafb",
      borderTopLeftRadius: "6px",
      borderTopRightRadius: "6px",
      outline: "none",
      transition: "all 0.3s ease",
    },
    inputFocus: {
      borderBottomColor: "#8b5cf6",
      boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.3)",
      transform: "translateY(-3px)",
    },
    passwordToggle: {
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#6b7280",
      cursor: "pointer",
      transition: "color 0.3s ease",
    },
    passwordStrength: {
      height: "4px",
      width: "100%",
      background: "linear-gradient(90deg, #8b5cf6 0%, #4f46e5 100%)",
      marginTop: "4px",
      borderRadius: "2px",
      transformOrigin: "left",
    },
    passwordWarning: {
      fontSize: "12px",
      color: "#b45309",
      marginTop: "4px",
      height: "auto",
      overflow: "hidden",
    },
    submitButton: {
      width: "100%",
      background: "linear-gradient(90deg, #4f46e5 0%, #4f46e5 100%)",
      color: "white",
      padding: "12px 16px",
      borderRadius: "8px",
      fontWeight: 500,
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      border: "none",
      outline: "none",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    submitButtonHover: {
      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
      transform: "scale(1.03)",
    },
    linkText: {
      textAlign: "center",
      color: "#4b5563",
      marginTop: "24px",
    },
    link: {
      color: "#8b5cf6",
      fontWeight: 500,
      textDecoration: "none",
      transition: "color 0.3s ease",
      margin: "0 4px",
    },
    linkHover: {
      color: "#6d28d9",
      textDecoration: "underline",
    },
    footer: {
      borderTop: "1px solid #e5e7eb",
      marginTop: "32px",
      paddingTop: "24px",
      textAlign: "center",
      fontSize: "12px",
      color: "#6b7280",
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      style={styles.pageContainer}
    >
      {/* Animated background patterns */}
      <motion.div
        variants={bgPatternVariants}
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <motion.div
          style={styles.bgPattern1}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          style={styles.bgPattern2}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -3, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1,
          }}
        />
        <motion.div
          style={styles.bgPattern3}
          animate={{
            y: [0, 30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 2,
          }}
        />
      </motion.div>

      <motion.div
        variants={containerVariants}
        style={styles.formContainer}
        whileHover={cardVariants.hover}
      >
        <motion.h1 variants={titleVariants} style={styles.title}>
          Sign Up
        </motion.h1>

        {error && (
          <motion.div
            variants={errorVariants}
            style={styles.errorBox}
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
                delay: 0.1,
              }}
            >
              {error}
            </motion.div>
          </motion.div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          style={{ marginTop: "24px" }}
          variants={containerVariants}
        >
          <motion.div variants={formItemVariants} style={styles.formGroup}>
            <label style={styles.label}>Username</label>
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
                style={styles.input}
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
                    damping: 15,
                  },
                }}
                style={{
                  ...styles.passwordStrength,
                  transform: `scaleX(${Math.min(username.length / 10, 1)})`,
                }}
              />
            )}
          </motion.div>

          <motion.div variants={formItemVariants} style={styles.formGroup}>
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
                initial={{ opacity: 0, x: -10 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  transition: {
                    type: "spring",
                    stiffness: 500,
                    damping: 15,
                  },
                }}
                style={{
                  ...styles.passwordStrength,
                  transform: `scaleX(${/\S+@\S+\.\S+/.test(email) ? 1 : 0.5})`,
                }}
              />
            )}
          </motion.div>

          <motion.div variants={formItemVariants} style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <div style={{ position: "relative" }}>
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
                  style={styles.input}
                  required
                  disabled={loading}
                />
              </motion.div>
              <motion.button
                type="button"
                variants={passwordToggleVariants}
                whileHover="hover"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                {showPassword ? (
                  <svg
                    style={{ width: "20px", height: "20px" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    style={{ width: "20px", height: "20px" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
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
                    damping: 15,
                  },
                }}
                style={{
                  ...styles.passwordStrength,
                  transform: `scaleX(${Math.min(password.length / 12, 1)})`,
                }}
              />
            )}
            {password && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: password.length < 8 ? 1 : 0,
                  height: password.length < 8 ? "auto" : 0,
                  transition: { duration: 0.3 },
                }}
                style={styles.passwordWarning}
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
            style={styles.submitButton}
          >
            {loading ? (
              <motion.div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <svg
                  style={{
                    animation: "spin 1s linear infinite",
                    height: "20px",
                    width: "20px",
                    marginRight: "8px",
                  }}
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    style={{ opacity: 0.25 }}
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    style={{ opacity: 0.75 }}
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating account...
              </motion.div>
            ) : (
              "Create Account"
            )}
          </motion.button>
        </motion.form>

        <motion.div variants={formItemVariants} style={styles.linkText}>
          <p>
            Already have an account?{" "}
            <motion.span variants={linkVariants} whileHover="hover">
              <Link to="/auth/login" style={styles.link}>
                Log In
              </Link>
            </motion.span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { delay: 1, duration: 0.5 },
          }}
          style={styles.footer}
        >
          By signing up, you agree to our
          <motion.span variants={linkVariants} whileHover="hover">
            <Link to="/terms" style={styles.link}>
              Terms of Service
            </Link>
          </motion.span>
          and
          <motion.span variants={linkVariants} whileHover="hover">
            <Link to="/privacy" style={styles.link}>
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
