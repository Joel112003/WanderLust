import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Compass } from 'lucide-react';
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
                     focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-150"
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
  const navigate = useNavigate();

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/admin/login', form);
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminData', JSON.stringify({ username: data.user.username, email: data.user.email }));
      toast.success('Welcome back');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Top band */}
          <div className="bg-blue-600 px-10 py-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-4">
              <Compass size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Wanderlust</h1>
            <p className="text-blue-100 text-base mt-1">Admin Portal</p>
          </div>

          {/* Form */}
          <div className="px-10 py-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField name="username" type="text" label="Username" placeholder="Enter username" value={form.username} onChange={onChange} />
              <InputField name="email" type="email" label="Email" placeholder="Enter email" value={form.email} onChange={onChange} />
              <InputField name="password" type="password" label="Password" placeholder="••••••••" value={form.password} onChange={onChange} />
              <button
                type="submit" disabled={loading}
                className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-base font-bold
                           shadow-lg shadow-blue-200 disabled:opacity-60 transition-all duration-150 flex items-center justify-center gap-2 mt-2"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;