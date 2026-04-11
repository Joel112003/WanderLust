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
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed md:relative inset-y-0 left-0 z-30 flex flex-col
        w-72 border-r border-gray-200 bg-white shadow-xl md:shadow-none
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex h-20 items-center justify-between border-b border-gray-200 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-200/60">
              <Compass size={20} className="text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-stone-900">Wanderlust</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-stone-400 hover:text-stone-700 md:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="mb-4 px-3 text-xs font-bold uppercase tracking-[0.2em] text-stone-400">Navigation</p>
          {NAV.map(({ path, icon: Icon, label }) => {
            const active = pathname === path;
            return (
              <Link key={path} to={path}
                onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-150
                  ${active
                    ? 'bg-red-600 text-white shadow-md shadow-red-200/50'
                    : 'text-stone-500 hover:bg-gray-100 hover:text-stone-900'
                  }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 px-4 pb-6 pt-4">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-stone-900">{adminData.username}</p>
              <p className="truncate text-sm text-stone-500">{adminData.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold text-stone-500
                       transition-all duration-150 hover:bg-red-50 hover:text-red-600">
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex h-20 flex-shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-8 shadow-sm">
          <button onClick={() => setSidebarOpen(v => !v)} className="text-stone-500 transition-colors hover:text-stone-900 md:hidden">
            <Menu size={24} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm mb-1">
              <Link to="/admin" className="flex items-center gap-1.5 font-medium text-stone-400 transition-colors hover:text-stone-700">
                <Home size={14} />
                <span>Admin</span>
              </Link>
              {pathname !== '/admin' && (
                <>
                  <ChevronRight size={14} className="text-stone-300" />
                  <span className="truncate font-semibold text-stone-700">{breadcrumb}</span>
                </>
              )}
            </div>
            <h1 className="truncate text-xl font-extrabold text-stone-900">{currentPage}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 sm:flex">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Online
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-stone-700">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
