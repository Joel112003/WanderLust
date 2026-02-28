import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { AuthContext } from "../../AuthContext";
import { motion } from "framer-motion";

const Signup = () => {
  const { register } = useContext(AuthContext);
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
    setError("");
  };

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

    if (!username || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!isPasswordValid) {
      setError("Password doesn't meet all requirements.");
      return;
    }

    setLoading(true);

    try {
      // ✅ Use AuthContext register — passes full userData object
      const result = await register({ username, email, password });

      if (result.success) {
        toast.success("Account created successfully!");
        const from = location.state?.from || "/listings";
        navigate(from);
      } else {
        const msg = result.error || "Signup failed. Please try again.";
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = err.message || "Network error. Please try again.";
      setError(msg);
      toast.error(msg);
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
    exit: { opacity: 0, y: -50, transition: { duration: 0.3 } },
  };

  const formItemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delay: 0.5, type: "spring", stiffness: 200, damping: 15 },
    },
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 20px rgba(139,92,246,0.3)",
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
    tap: { scale: 0.97 },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 200, damping: 20, delay: 0.2 },
    },
  };

  const bgPatternVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5, transition: { delay: 1, duration: 1.5 } },
  };

  const linkVariants = {
    hover: {
      color: "#6D28D9",
      scale: 1.05,
      transition: { type: "spring", stiffness: 300, damping: 10 },
    },
  };

  return (
    <motion.div
      className="signup-page-container"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background:
          "linear-gradient(135deg, #eff6ff 0%, #f5f3ff 50%, #fdf2f8 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated background patterns */}
      <motion.div
        variants={bgPatternVariants}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
          style={{
            position: "absolute",
            top: "-10%",
            right: "-10%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, -3, 0] }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1,
          }}
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "-10%",
            width: 350,
            height: 350,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
          }}
        />
        <motion.div
          animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 2,
          }}
          style={{
            position: "absolute",
            top: "40%",
            left: "5%",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      <motion.div
        variants={containerVariants}
        whileHover={{
          y: -4,
          boxShadow:
            "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
          transition: { type: "spring", stiffness: 70, damping: 15 },
        }}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          borderRadius: 24,
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          padding: "2rem",
          position: "relative",
          zIndex: 10,
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <motion.h1
          variants={titleVariants}
          style={{
            textAlign: "center",
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            background: "linear-gradient(to right, #4f46e5, #7c3aed)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Create Account
        </motion.h1>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: "#fee2e2",
              borderLeft: "4px solid #ef4444",
              color: "#b91c1c",
              padding: "0.75rem 1rem",
              borderRadius: 8,
              marginBottom: "1rem",
              fontSize: 14,
            }}
          >
            <motion.div
              animate={{ x: [0, -3, 3, -2, 2, 0] }}
              transition={{ duration: 0.5 }}
            >
              {error}
            </motion.div>
          </motion.div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          variants={containerVariants}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {/* Username */}
          <motion.div
            variants={formItemVariants}
            style={{ display: "flex", flexDirection: "column", gap: 6 }}
          >
            <label style={{ fontWeight: 500, color: "#374151", fontSize: 14 }}>
              Username
            </label>
            <input
              type="text"
              name="username"
              value={username}
              placeholder="Choose a unique username"
              onChange={handleOnChange}
              disabled={loading}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                fontSize: 15,
                background: "rgba(255,255,255,0.8)",
                transition: "border-color 0.2s, box-shadow 0.2s",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#6366f1";
                e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.2)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            />
            {username && (
              <div
                style={{
                  height: 3,
                  borderRadius: 2,
                  background: "#e5e7eb",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  animate={{ scaleX: Math.min(username.length / 10, 1) }}
                  style={{
                    height: "100%",
                    background: "linear-gradient(to right, #6366f1, #8b5cf6)",
                    transformOrigin: "left",
                    borderRadius: 2,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              </div>
            )}
          </motion.div>

          {/* Email */}
          <motion.div
            variants={formItemVariants}
            style={{ display: "flex", flexDirection: "column", gap: 6 }}
          >
            <label style={{ fontWeight: 500, color: "#374151", fontSize: 14 }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              placeholder="your.email@example.com"
              onChange={handleOnChange}
              disabled={loading}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                fontSize: 15,
                background: "rgba(255,255,255,0.8)",
                transition: "border-color 0.2s, box-shadow 0.2s",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#6366f1";
                e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.2)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            />
            {email && (
              <div
                style={{
                  height: 3,
                  borderRadius: 2,
                  background: "#e5e7eb",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  animate={{ scaleX: /\S+@\S+\.\S+/.test(email) ? 1 : 0.5 }}
                  style={{
                    height: "100%",
                    background: /\S+@\S+\.\S+/.test(email)
                      ? "linear-gradient(to right, #10b981, #059669)"
                      : "linear-gradient(to right, #f59e0b, #d97706)",
                    transformOrigin: "left",
                    borderRadius: 2,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              </div>
            )}
          </motion.div>

          {/* Password */}
          <motion.div
            variants={formItemVariants}
            style={{ display: "flex", flexDirection: "column", gap: 6 }}
          >
            <label style={{ fontWeight: 500, color: "#374151", fontSize: 14 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                placeholder="Min. 8 characters with A-Z, a-z, 0-9"
                onChange={handleOnChange}
                disabled={loading}
                required
                style={{
                  width: "100%",
                  padding: "12px 48px 12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 15,
                  background: "rgba(255,255,255,0.8)",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#6366f1";
                  e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
              />
              <motion.button
                type="button"
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? (
                  <svg
                    style={{
                      width: 20,
                      height: 20,
                      stroke: "currentColor",
                      strokeWidth: 2,
                      fill: "none",
                    }}
                    viewBox="0 0 24 24"
                  >
                    <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg
                    style={{
                      width: 20,
                      height: 20,
                      stroke: "currentColor",
                      strokeWidth: 2,
                      fill: "none",
                    }}
                    viewBox="0 0 24 24"
                  >
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </motion.button>
            </div>

            {/* Password checklist */}
            {password && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                style={{
                  listStyle: "none",
                  margin: "6px 0 0",
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                {[
                  { key: "length", label: "At least 8 characters" },
                  { key: "uppercase", label: "At least one uppercase letter" },
                  { key: "lowercase", label: "At least one lowercase letter" },
                  { key: "number", label: "At least one number" },
                ].map(({ key, label }, i) => (
                  <motion.li
                    key={key}
                    animate={{ x: passwordChecks[key] ? 0 : [-5, 5, -3, 3, 0] }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    style={{
                      fontSize: 12,
                      color: passwordChecks[key] ? "#10b981" : "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    {passwordChecks[key] ? "✓" : "✗"} {label}
                  </motion.li>
                ))}
              </motion.ul>
            )}

            {/* Password strength bar */}
            {password && (
              <div style={{ marginTop: 8 }}>
                <div
                  style={{
                    height: 4,
                    borderRadius: 2,
                    background: "#e5e7eb",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    animate={{
                      scaleX: isPasswordValid
                        ? 1
                        : Math.min(password.length / 8, 1),
                      backgroundColor: isPasswordValid
                        ? "#10b981"
                        : password.length > 5
                          ? "#f59e0b"
                          : "#ef4444",
                    }}
                    style={{
                      height: "100%",
                      transformOrigin: "left",
                      borderRadius: 2,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                </div>
                <motion.span
                  animate={{
                    color: isPasswordValid
                      ? "#10b981"
                      : password.length > 5
                        ? "#f59e0b"
                        : "#ef4444",
                  }}
                  style={{ fontSize: 11, marginTop: 3, display: "block" }}
                >
                  {isPasswordValid
                    ? "Strong password"
                    : password.length > 5
                      ? "Moderate password"
                      : "Weak password"}
                </motion.span>
              </div>
            )}
          </motion.div>

          {/* Submit */}
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 10,
              background: "linear-gradient(to right, #4f46e5, #7c3aed)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 15,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <motion.svg
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ width: 20, height: 20, fill: "none" }}
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="4"
                  />
                  <path
                    fill="white"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </motion.svg>
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </motion.button>
        </motion.form>

        <motion.p
          variants={formItemVariants}
          style={{
            textAlign: "center",
            marginTop: "1.25rem",
            fontSize: 14,
            color: "#6b7280",
          }}
        >
          Already have an account?{" "}
          <motion.span
            variants={linkVariants}
            whileHover="hover"
            style={{ display: "inline-block" }}
          >
            <Link
              to="/auth/login"
              style={{
                color: "#4f46e5",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Log In
            </Link>
          </motion.span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 1, duration: 0.5 } }}
          style={{
            textAlign: "center",
            marginTop: "0.75rem",
            fontSize: 12,
            color: "#9ca3af",
          }}
        >
          By signing up, you agree to our{" "}
          <Link
            to="/terms"
            style={{ color: "#4f46e5", textDecoration: "none" }}
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            to="/privacy"
            style={{ color: "#4f46e5", textDecoration: "none" }}
          >
            Privacy Policy
          </Link>
        </motion.p>
      </motion.div>

      <Toaster position="top-right" />
    </motion.div>
  );
};

export default Signup;
