import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import api from '../lib/api';

const ProtectedAdminRoute = ({ children }) => {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { setStatus('fail'); return; }

    api.get('/admin/verify')
      .then(() => setStatus('ok'))
      .catch(() => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        setStatus('fail');
      });
  }, []);

  if (status === 'checking') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 gap-4">
        <div className="relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 shadow-xl shadow-red-200/60">
            <Compass size={24} className="text-white" />
          </div>
          <div className="absolute -inset-1.5 rounded-3xl border-2 border-red-200 border-t-red-500 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-gray-400 tracking-wide">Verifying session…</p>
      </div>
    );
  }

  return status === 'ok' ? children : <Navigate to="/admin/login" replace />;
};

export default ProtectedAdminRoute;