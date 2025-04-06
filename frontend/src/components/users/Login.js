import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../AuthContext";

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
    });

    const handleSuccess = (msg) => {
      const toastId = toast.success(msg, {
        position: "top-right",
        autoClose: true, // Disable auto-close initially
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    
      // Close toast after detecting scroll
      const handleScroll = () => {
        toast.dismiss(toastId); // Close the toast when scrolled
        window.removeEventListener("scroll", handleScroll); // Cleanup
      };
    
      window.addEventListener("scroll", handleScroll);
    };

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
        setTimeout(() => navigate("/listings"), 1500);
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden relative">
      {/* Background animation effect */}
      <div className="absolute w-[150%] h-[150%] -top-1/4 -left-1/4 bg-radial-gradient animate-slow-spin z-0"></div>
      
      <div className="w-full max-w-md bg-white/85 backdrop-blur-md rounded-2xl shadow-xl p-8 relative overflow-hidden border border-white/20 z-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-gradient-to-br from-indigo-600 to-purple-500 opacity-15 z-0 animate-float1"></div>
        <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-15 z-0 animate-float2"></div>
        
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent inline-block relative animate-shimmer">Welcome Back</h1>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 shadow-sm animate-error-shake">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 animate-slide-up opacity-0">
            <label className="font-medium text-gray-700 text-sm transition-colors duration-200">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleOnChange}
              className="w-full py-3 px-4 border border-gray-300 rounded-md text-base transition-all duration-300 bg-white/80 hover:border-gray-400 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/20 focus:scale-102"
              placeholder="your.email@example.com"
              required
              disabled={loading}
            />
          </div>
          
          <div className="flex flex-col gap-2 animate-slide-up-delay-1 opacity-0">
            <label className="font-medium text-gray-700 text-sm transition-colors duration-200">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={handleOnChange}
                className="w-full py-3 px-4 border border-gray-300 rounded-md text-base transition-all duration-300 bg-white/80 hover:border-gray-400 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/20 focus:scale-102"
                placeholder="Min. 8 characters"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-all duration-200 hover:scale-110 active:scale-90"
              >
                {showPassword ? (
                  <svg className="w-5 h-5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                    <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="animate-slide-up-delay-2 opacity-0">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-md bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-semibold text-base border-none cursor-pointer transition-all duration-300 relative overflow-hidden shadow-md hover:-translate-y-1 hover:shadow-lg hover:from-indigo-700 hover:to-purple-600 active:translate-y-0 active:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
              ) : (
                "Login"
              )}
              <span className="absolute top-0 left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine"></span>
            </button>
          </div>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-500 animate-fade-in-delay opacity-0">
          Don't have an account!?{" "}
          <Link to="/auth/signup" className="text-indigo-600 font-medium no-underline transition-all duration-300 relative hover:text-indigo-700">
            Sign Up
            <span className="absolute w-full h-0.5 bottom-0 left-0 bg-gradient-to-r from-indigo-600 to-purple-500 scale-x-0 origin-bottom-right transition-transform duration-300 group-hover:scale-x-100 group-hover:origin-bottom-left"></span>
          </Link>
        </p>
      </div>
      
      <ToastContainer
        className="toast-container"
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
      
      {/* CSS for custom animations */}
      <style jsx>{`
        @keyframes slow-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(5px, -15px) rotate(5deg); }
          50% { transform: translate(10px, 5px) rotate(10deg); }
          75% { transform: translate(-5px, 10px) rotate(-5deg); }
        }
        
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-10px, 10px) rotate(-5deg); }
          66% { transform: translate(15px, 5px) rotate(5deg); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes error-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shine {
          to { left: 100%; }
        }
        
        .bg-radial-gradient {
          background: radial-gradient(circle, rgba(79, 70, 229, 0.03) 0%, rgba(168, 85, 247, 0.03) 50%, rgba(236, 72, 153, 0.03) 100%);
        }
        
        .animate-slow-spin {
          animation: slow-spin 30s linear infinite;
        }
        
        .animate-float1 {
          animation: float1 15s ease-in-out infinite;
        }
        
        .animate-float2 {
          animation: float2 18s ease-in-out infinite;
        }
        
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 8s linear infinite;
        }
        
        .animate-error-shake {
          animation: error-shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.6s forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.5s ease-out 0.2s forwards;
        }
        
        .animate-slide-up-delay-1 {
          animation: slide-up 0.5s ease-out 0.3s forwards;
        }
        
        .animate-slide-up-delay-2 {
          animation: slide-up 0.5s ease-out 0.4s forwards;
        }
        
        .animate-shine {
          animation: shine 3s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default Login;