import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../../AuthContext";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [inputValue, setInputValue] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = inputValue;

  const handleOnChange = (e) => {
    setInputValue({ ...inputValue, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
      const result = await login(email, password);

      if (result.success) {
        toast.success("Login successful!");
        const from = location.state?.from || "/listings";
        setTimeout(() => navigate(from), 1200);
      } else {
        const msg = result.error || "Login failed. Please try again.";
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

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-white-50 via-white-50 to-white px-4 py-16">
      <div className="pointer-events-none absolute inset-0 " />
      <div className="pointer-events-none absolute -left-24 top-14 h-72 w-72 rounded-full bg-white-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-white-300/25 blur-3xl" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-red-200/80 bg-white/90 p-8 shadow-[0_24px_64px_rgba(124,45,18,0.18)] backdrop-blur">
        <div className="mb-8 text-center">
          <p className="mb-3 inline-flex items-center rounded-full border border-red-200 bg-red-100/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-800">
            Welcome Back
          </p>
          <h1 className="bg-gradient-to-r from-red-700 to-red-700 bg-clip-text text-4xl font-extrabold text-transparent">
            Sign In
          </h1>
          <p className="mt-2 text-sm text-stone-500">Continue your travel planning on WanderLust</p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 border-l-4 border-l-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleOnChange}
              className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-[15px] text-stone-900 outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={handleOnChange}
                className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 pr-11 text-[15px] text-stone-900 outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
                placeholder="Enter password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 transition hover:text-stone-800"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-red-700 to-red-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(190,24,93,0.3)] transition hover:-translate-y-0.5 hover:from-red-800 hover:to-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-stone-500">
          Don&apos;t have an account?{" "}
          <Link to="/auth/signup" className="font-semibold text-rose-700 hover:text-rose-800">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
