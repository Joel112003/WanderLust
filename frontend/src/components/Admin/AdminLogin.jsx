import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Compass, ShieldCheck, ArrowRight } from 'lucide-react';
import api from '../lib/api';

const InputField = ({ name, type: baseType, label, placeholder, value, onChange }) => {
  const [show, setShow] = useState(false);
  const isPassword = name === 'password';
  const type = isPassword ? (show ? 'text' : 'password') : baseType;

  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
        {label}
      </label>
      <div className="relative">
        <input
          name={name} type={type} required value={value} onChange={onChange}
          autoComplete="off" placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm
                     placeholder:text-gray-400 focus:outline-none focus:border-red-400 focus:ring-4
                     focus:ring-red-100 transition-all duration-200"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
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
    <>
      <style>{`

        .wl-login { font-family: 'DM Sans', sans-serif; }
        .wl-login .display { font-family: 'Sora', sans-serif; }

        .login-panel { animation: panelReveal 0.55s cubic-bezier(.22,1,.36,1) both; }
        .login-left  { animation: panelReveal 0.45s 0.05s cubic-bezier(.22,1,.36,1) both; }
        @keyframes panelReveal {
          from { opacity:0; transform: translateY(18px); }
          to   { opacity:1; transform: translateY(0); }
        }

        .stat-card { animation: statPop 0.4s cubic-bezier(.34,1.56,.64,1) both; }
        .stat-card:nth-child(1) { animation-delay: 0.25s; }
        .stat-card:nth-child(2) { animation-delay: 0.35s; }
        @keyframes statPop {
          from { opacity:0; transform:scale(0.88); }
          to   { opacity:1; transform:scale(1); }
        }

        .logo-spin:hover { animation: spin360 0.5s ease; }
        @keyframes spin360 { to { transform: rotate(360deg); } }

        .btn-login { position: relative; overflow: hidden; transition: all 0.2s ease; }
        .btn-login::after {
          content: '';
          position: absolute; inset: 0;
          background: rgba(255,255,255,0.12);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }
        .btn-login:hover::after { transform: translateX(0); }
        .btn-login:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(220,38,38,0.35); }

        .dot-pattern {
          background-image: radial-gradient(circle, rgba(220,38,38,0.08) 1px, transparent 1px);
          background-size: 22px 22px;
        }
      `}</style>

      <div className="wl-login relative min-h-screen bg-[#f7f7f8] flex items-center justify-center p-6 md:p-10">
       
        <div className="absolute inset-0 dot-pattern pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-red-50 blur-[120px] opacity-60 pointer-events-none" />

        <div className="relative z-10 w-full max-w-5xl grid gap-6 lg:grid-cols-[1.15fr_0.85fr] items-stretch">

      
          <section className="login-left rounded-3xl border border-gray-200 bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.08)] md:p-10 flex flex-col justify-between">
            <div>
            
              <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-red-600">
                <ShieldCheck size={12} />
                Secure Admin Console
              </div>

              <h1 className="display mt-8 text-4xl md:text-5xl font-black leading-[1.08] tracking-tight text-gray-900">
                Command center
                <br />
                <span className="text-red-600">for WanderLust</span>
              </h1>
              <p className="mt-5 text-sm leading-relaxed text-gray-500 max-w-md">
                Review host activity, moderate listings, manage users, and protect trust signals — all from one focused dashboard built for fast decisions.
              </p>
            </div>

          
            <div className="mt-10 grid grid-cols-2 gap-3">
              {[
                { label: 'Live moderation', value: '24/7', sub: 'Quality and safety in check' },
                { label: 'Trusted access', value: 'JWT', sub: 'Authenticated sessions only' },
              ].map((s, i) => (
                <div key={i} className="stat-card rounded-2xl border border-gray-100 bg-gray-50 p-4 hover:border-red-100 hover:bg-red-50/30 transition-all duration-200">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 font-bold">{s.label}</p>
                  <p className="mt-2 text-2xl font-black text-gray-900">{s.value}</p>
                  <p className="mt-1 text-[11px] text-gray-500">{s.sub}</p>
                </div>
              ))}
            </div>
          </section>

        
          <section className="login-panel rounded-3xl border border-gray-200 bg-white p-7 shadow-[0_8px_40px_rgba(0,0,0,0.07)] md:p-9 flex flex-col">
          
            <div className="flex items-center justify-between mb-7">
              <div className="flex items-center gap-3">
                <div className="logo-spin flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 shadow-lg shadow-red-200/60">
                  <Compass size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">WanderLust</p>
                  <h2 className="display text-lg font-extrabold text-gray-900 leading-tight">Admin Sign In</h2>
                </div>
              </div>
              <span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-red-600">
                Secure
              </span>
            </div>

            <div className="h-px bg-gray-100 mb-6" />

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
              <InputField name="username" type="text" label="Username" placeholder="Enter username" value={form.username} onChange={onChange} />
              <InputField name="email" type="email" label="Email" placeholder="Enter email" value={form.email} onChange={onChange} />
              <InputField name="password" type="password" label="Password" placeholder="Enter password" value={form.password} onChange={onChange} />

              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <span className="text-red-500 mt-0.5">⚠</span>
                  <p className="text-sm font-semibold text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-login mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-200/60 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : (
                    <>
                      Access Dashboard
                      <ArrowRight size={15} />
                    </>
                  )
                }
              </button>
            </form>

            <p className="mt-5 text-[11px] leading-relaxed text-gray-400 text-center">
              Restricted to authorized admins · All activity is logged
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;