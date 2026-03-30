import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LayoutDashboard, Users, ListChecks, MessageSquare, LogOut, Menu, X, Compass, ChevronRight, Home } from 'lucide-react';

const NAV = [
  { path: '/admin',          icon: LayoutDashboard, label: 'Dashboard', breadcrumb: 'Dashboard' },
  { path: '/admin/users',    icon: Users,            label: 'Users',     breadcrumb: 'User Management' },
  { path: '/admin/listings', icon: ListChecks,       label: 'Listings',  breadcrumb: 'Listings Management' },
  { path: '/admin/reviews',  icon: MessageSquare,    label: 'Reviews',   breadcrumb: 'Reviews Management' },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [adminData, setAdminData] = useState(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('adminData'));
      if (!data) { navigate('/admin/login'); return; }
      setAdminData(data);
    } catch { navigate('/admin/login'); }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    toast.success('Signed out from admin console');
    navigate('/admin/login');
  };

  if (!adminData) return null;
  const initials = adminData.username?.slice(0, 2).toUpperCase() ?? 'AD';
  const currentNav = NAV.find(n => n.path === pathname);
  const currentPage = currentNav?.label ?? 'Admin';
  const breadcrumb = currentNav?.breadcrumb ?? currentPage;

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed md:relative inset-y-0 left-0 z-30 flex flex-col
        w-72 bg-white border-r border-slate-200 shadow-xl md:shadow-none
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center justify-between px-6 h-20 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-lg shadow-slate-300">
              <Compass size={20} className="text-white" />
            </div>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight">Wanderlust</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] px-3 mb-4">Navigation</p>
          {NAV.map(({ path, icon: Icon, label }) => {
            const active = pathname === path;
            return (
              <Link key={path} to={path}
                onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-150
                  ${active
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-300'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-6 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 mb-2">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-slate-900 truncate">{adminData.username}</p>
              <p className="text-sm text-slate-500 truncate">{adminData.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-semibold text-slate-500
                       hover:bg-rose-50 hover:text-rose-700 transition-all duration-150">
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center px-8 gap-4 flex-shrink-0 shadow-sm">
          <button onClick={() => setSidebarOpen(v => !v)} className="md:hidden text-slate-500 hover:text-slate-900 transition-colors">
            <Menu size={24} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm mb-1">
              <Link to="/admin" className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 transition-colors font-medium">
                <Home size={14} />
                <span>Admin</span>
              </Link>
              {pathname !== '/admin' && (
                <>
                  <ChevronRight size={14} className="text-slate-300" />
                  <span className="text-slate-700 font-semibold truncate">{breadcrumb}</span>
                </>
              )}
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 truncate">{currentPage}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Online
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-700">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200/60">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
