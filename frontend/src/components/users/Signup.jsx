import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../../AuthContext";

const Signup = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

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

  const strength = isPasswordValid ? 100 : Math.min(password.length * 10, 80);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-white px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(194,65,12,0.16),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(225,29,72,0.12),transparent_32%),radial-gradient(circle_at_75%_85%,rgba(217,119,6,0.13),transparent_30%)]" />
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-rose-300/25 blur-3xl" />

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-amber-200/80 bg-white/90 p-8 shadow-[0_24px_64px_rgba(124,45,18,0.18)] backdrop-blur">
        <div className="mb-7 text-center">
          <p className="mb-3 inline-flex items-center rounded-full border border-amber-200 bg-amber-100/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800">
            New Account
          </p>
          <h1 className="bg-gradient-to-r from-rose-700 to-amber-700 bg-clip-text text-4xl font-extrabold text-transparent">
            Join WanderLust
          </h1>
          <p className="mt-2 text-sm text-stone-500">Create your profile and start exploring stays</p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 border-l-4 border-l-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">Username</label>
            <input
              type="text"
              name="username"
              value={username}
              placeholder="Choose a username"
              onChange={handleOnChange}
              disabled={loading}
              required
              className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-[15px] text-stone-900 outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              placeholder="you@example.com"
              onChange={handleOnChange}
              disabled={loading}
              required
              className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-[15px] text-stone-900 outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                placeholder="At least 8 chars, A-Z, a-z, 0-9"
                onChange={handleOnChange}
                disabled={loading}
                required
                className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 pr-11 text-[15px] text-stone-900 outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
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

            {password && (
              <>
                <ul className="mt-2 grid gap-1 text-xs">
                  <li className={passwordChecks.length ? "text-emerald-600" : "text-red-600"}>• At least 8 characters</li>
                  <li className={passwordChecks.uppercase ? "text-emerald-600" : "text-red-600"}>• At least one uppercase letter</li>
                  <li className={passwordChecks.lowercase ? "text-emerald-600" : "text-red-600"}>• At least one lowercase letter</li>
                  <li className={passwordChecks.number ? "text-emerald-600" : "text-red-600"}>• At least one number</li>
                </ul>

                <div className="mt-2">
                  <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
                    <div
                      className={`h-full rounded-full transition-all ${isPasswordValid ? "bg-emerald-500" : strength > 45 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${strength}%` }}
                    />
                  </div>
                  <span className={`mt-1 block text-[11px] ${isPasswordValid ? "text-emerald-600" : strength > 45 ? "text-amber-600" : "text-red-600"}`}>
                    {isPasswordValid ? "Strong password" : strength > 45 ? "Moderate password" : "Weak password"}
                  </span>
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-rose-700 to-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(190,24,93,0.3)] transition hover:-translate-y-0.5 hover:from-rose-800 hover:to-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link to="/auth/login" className="font-semibold text-rose-700 hover:text-rose-800">
            Log in
          </Link>
        </p>

        <p className="mt-3 text-center text-xs text-stone-400">
          By signing up, you agree to our{" "}
          <Link to="/terms" className="text-rose-700 hover:text-rose-800">Terms</Link>
          {" "}and{" "}
          <Link to="/privacy" className="text-rose-700 hover:text-rose-800">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
};

export default Signup;
