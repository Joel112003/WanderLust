import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Compass, ShieldCheck } from 'lucide-react';
import api from '../lib/api';

const InputField = ({ name, type: baseType, label, placeholder, value, onChange }) => {
  const [show, setShow] = useState(false);
  const type = name === 'password' ? (show ? 'text' : 'password') : baseType;
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-600 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <input
          name={name} type={type} required value={value} onChange={onChange}
          autoComplete="off" placeholder={placeholder}
          className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200
                     text-gray-900 placeholder:text-gray-400 text-base
                     focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all duration-150"
        />
        {name === 'password' && (
          <button type="button" onClick={() => setShow(v => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

const AdminLogin = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/admin/login', form);
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminData', JSON.stringify({ username: data.user.username, email: data.user.email }));
      toast.success('Welcome back, admin');
      navigate('/admin');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials';
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-50 p-6 md:p-10 lg:p-14">
      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-gray-200 bg-white p-8 text-stone-900 shadow-[0_20px_50px_rgba(17,24,39,0.10)] md:p-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-700">
            <ShieldCheck size={14} />
            Secure Operations Panel
          </div>
          <h1 className="mt-7 text-4xl md:text-5xl font-black leading-tight tracking-tight">
            Command center for
            <span className="block text-red-600">
              WanderLust Admins
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-700 md:text-lg">
            Review host activity, moderate listings, and protect trust signals from one focused dashboard built for fast decisions.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Live moderation</p>
              <p className="mt-2 text-2xl font-bold text-stone-900">24/7</p>
              <p className="mt-1 text-sm text-stone-600">Keep quality and safety in check</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Trusted access</p>
              <p className="mt-2 text-2xl font-bold text-stone-900">JWT secured</p>
              <p className="mt-1 text-sm text-stone-600">Authenticated sessions only</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-7 shadow-[0_20px_50px_rgba(17,24,39,0.08)] md:p-9">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-white">
                <Compass size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">WanderLust</p>
                <h2 className="text-xl font-extrabold text-stone-900">Admin Sign In</h2>
              </div>
            </div>
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-600">Secure</span>
          </div>

          <div className="mt-7">
            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField name="username" type="text" label="Username" placeholder="Enter username" value={form.username} onChange={onChange} />
              <InputField name="email" type="email" label="Email" placeholder="Enter email" value={form.email} onChange={onChange} />
              <InputField name="password" type="password" label="Password" placeholder="Enter password" value={form.password} onChange={onChange} />
              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-red-700 disabled:opacity-60"
              >
                {loading
                  ? <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : 'Access Dashboard'}
              </button>
            </form>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-stone-500">
            This portal is restricted to authorized administrators. All activities are logged for security auditing.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AdminLogin;
