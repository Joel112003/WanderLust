import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
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
      <div className="flex items-center justify-center h-screen bg-neutral-50">
        <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return status === 'ok' ? children : <Navigate to="/admin/login" replace />;
};

export default ProtectedAdminRoute;
