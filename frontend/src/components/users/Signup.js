import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../AuthContext";
import { motion } from "framer-motion";
import "../../utilis/css/Signup.css";

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
    });

  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "top-right",
      autoClose: 2000,
    });

  // Password validation checks
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

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
    if (!isPasswordValid) {
      setError("Password doesn't meet all requirements.");
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

  // Animation variants
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

  return (
    <motion.div
      className="signup-page-container"
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Animated background patterns */}
      <motion.div
        variants={bgPatternVariants}
        className="signup-bg-patterns"
      >
        <motion.div
          className="signup-bg-pattern-1"
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
          className="signup-bg-pattern-2"
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
          className="signup-bg-pattern-3"
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
        className="signup-form-container"
        whileHover={cardVariants.hover}
      >
        <motion.h1 variants={titleVariants} className="signup-title">
          Sign Up
        </motion.h1>

        {error && (
          <motion.div
            variants={errorVariants}
            className="signup-error-box"
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
          className="signup-form"
          variants={containerVariants}
        >
          <motion.div variants={formItemVariants} className="signup-form-group">
            <label className="signup-form-label">Username</label>
            <motion.div
              initial="initial"
              whileFocus="focus"
              variants={inputFocusVariants}
            >
              <input
                type="text"
                name="username"
                value={username}
                placeholder="Choose a unique username"
                onChange={handleOnChange}
                className="signup-form-input"
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
                className="signup-progress-bar"
                style={{
                  transform: `scaleX(${Math.min(username.length / 10, 1)})`,
                }}
              />
            )}
          </motion.div>

          <motion.div variants={formItemVariants} className="signup-form-group">
            <label className="signup-form-label">Email</label>
            <motion.div
              initial="initial"
              whileFocus="focus"
              variants={inputFocusVariants}
            >
              <input
                type="email"
                name="email"
                value={email}
                placeholder="your.email@example.com"
                onChange={handleOnChange}
                className="signup-form-input"
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
                className="signup-progress-bar"
                style={{
                  transform: `scaleX(${/\S+@\S+\.\S+/.test(email) ? 1 : 0.5})`,
                }}
              />
            )}
          </motion.div>

          <motion.div variants={formItemVariants} className="signup-form-group">
            <label className="signup-form-label">Password</label>
            <div className="signup-password-container">
              <motion.div
                initial="initial"
                whileFocus="focus"
                variants={inputFocusVariants}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  placeholder="Min. 8 characters with A-Z, a-z, 0-9"
                  onChange={handleOnChange}
                  className="signup-form-input"
                  required
                  disabled={loading}
                />
              </motion.div>
              <motion.button
                type="button"
                variants={passwordToggleVariants}
                whileHover="hover"
                onClick={() => setShowPassword(!showPassword)}
                className="signup-password-toggle"
              >
                {showPassword ? (
                  <svg
                    className="signup-icon"
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
                    className="signup-icon"
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
             {/* Password requirements checklist */}
             {password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  transition: { duration: 0.3 },
                }}
                className="signup-password-requirements"
              >
                <motion.ul>
                  <motion.li
                    className={passwordChecks.length ? "valid" : "invalid"}
                    animate={{
                      x: passwordChecks.length ? 0 : [-5, 5, -3, 3, 0],
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {passwordChecks.length ? "✓" : "✗"} At least 8 characters
                  </motion.li>
                  <motion.li
                    className={passwordChecks.uppercase ? "valid" : "invalid"}
                    animate={{
                      x: passwordChecks.uppercase ? 0 : [-5, 5, -3, 3, 0],
                    }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    {passwordChecks.uppercase ? "✓" : "✗"} At least one uppercase letter
                  </motion.li>
                  <motion.li
                    className={passwordChecks.lowercase ? "valid" : "invalid"}
                    animate={{
                      x: passwordChecks.lowercase ? 0 : [-5, 5, -3, 3, 0],
                    }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {passwordChecks.lowercase ? "✓" : "✗"} At least one lowercase letter
                  </motion.li>
                  <motion.li
                    className={passwordChecks.number ? "valid" : "invalid"}
                    animate={{
                      x: passwordChecks.number ? 0 : [-5, 5, -3, 3, 0],
                    }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {passwordChecks.number ? "✓" : "✗"} At least one number
                  </motion.li>
                </motion.ul>
              </motion.div>
            )}

            {/* Password strength indicator */}
            {password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  transition: { duration: 0.3 },
                }}
                className="signup-password-strength"
              >
                <div className="signup-strength-bar-container">
                  <motion.div
                    className={`signup-strength-bar ${
                      isPasswordValid ? "strong" : password.length > 0 ? "weak" : ""
                    }`}
                    initial={{ scaleX: 0 }}
                    animate={{
                      scaleX: isPasswordValid ? 1 : Math.min(password.length / 8, 1),
                      backgroundColor: isPasswordValid
                        ? "#10B981" // green
                        : password.length > 5
                        ? "#F59E0B" // yellow
                        : "#EF4444", // red
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                </div>
                <motion.span
                  className="signup-strength-text"
                  animate={{
                    color: isPasswordValid
                      ? "#10B981"
                      : password.length > 5
                      ? "#F59E0B"
                      : "#EF4444",
                  }}
                >
                  {isPasswordValid
                    ? "Strong password"
                    : password.length > 5
                    ? "Moderate password"
                    : "Weak password"}
                </motion.span>
              </motion.div>
            )}
          </motion.div>

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            type="submit"
            disabled={loading}
            className="signup-submit-button"
          >
            {loading ? (
              <motion.div
                className="signup-loading-container"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <svg
                  className="signup-spinner"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="signup-spinner-track"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="signup-spinner-path"
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

        <motion.div variants={formItemVariants} className="signup-login-link">
          <p>
            Already have an account?{" "}
            <motion.span variants={linkVariants} whileHover="hover">
              <Link to="/auth/login" className="signup-link">
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
          className="signup-footer"
        >
          By signing up, you agree to our{" "}
          <motion.span variants={linkVariants} whileHover="hover">
            <Link to="/terms" className="signup-link">
              Terms of Service
            </Link>
          </motion.span>{" "}
          and{" "}
          <motion.span variants={linkVariants} whileHover="hover">
            <Link to="/privacy" className="signup-link">
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