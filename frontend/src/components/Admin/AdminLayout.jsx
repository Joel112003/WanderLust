import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Users, ListChecks, MessageSquare,
  LogOut, Menu, X, Compass, ChevronRight, Home,
} from 'lucide-react';

const NAV = [
  { path: '/admin',          icon: LayoutDashboard, label: 'Dashboard',  breadcrumb: 'Dashboard'           },
  { path: '/admin/users',    icon: Users,            label: 'Users',      breadcrumb: 'User Management'     },
  { path: '/admin/listings', icon: ListChecks,       label: 'Listings',   breadcrumb: 'Listings Management' },
  { path: '/admin/reviews',  icon: MessageSquare,    label: 'Reviews',    breadcrumb: 'Reviews Management'  },
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
    <>
      <style>{`

        .wl-root { font-family: 'DM Sans', sans-serif; }
        .wl-root h1, .wl-root h2, .wl-root h3, .wl-root .display { font-family: 'Sora', sans-serif; }

        .sidebar-enter { animation: slideInLeft 0.28s cubic-bezier(.22,1,.36,1) both; }
        @keyframes slideInLeft { from { transform: translateX(-100%); opacity:0; } to { transform: translateX(0); opacity:1; } }

        .nav-link-active { position: relative; }
        .nav-link-active::before {
          content: '';
          position: absolute;
          left: 0; top: 50%; transform: translateY(-50%);
          width: 3px; height: 60%; border-radius: 0 4px 4px 0;
          background: #dc2626;
        }

        .sidebar-nav-item { transition: all 0.18s ease; }
        .sidebar-nav-item:hover { transform: translateX(3px); }

        .pulse-dot { animation: pulseDot 2s infinite; }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }

        .header-fade-in { animation: fadeDown 0.4s ease both; }
        @keyframes fadeDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }

        .logo-mark { transition: transform 0.3s ease; }
        .logo-mark:hover { transform: rotate(-8deg) scale(1.08); }
      `}</style>

      <div className="wl-root flex h-screen overflow-hidden bg-[#f7f7f8]">
      
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

      
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-30 flex flex-col
          w-[260px] bg-white border-r border-gray-100
          shadow-[4px_0_24px_rgba(0,0,0,0.06)] md:shadow-none
          transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]
          ${sidebarOpen ? 'translate-x-0 sidebar-enter' : '-translate-x-full md:translate-x-0'}
        `}>
         
          <div className="flex h-[68px] items-center justify-between px-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="logo-mark flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 shadow-lg shadow-red-200/60">
                <Compass size={18} className="text-white" />
              </div>
              <span className="display text-[17px] font-extrabold tracking-tight text-gray-900">
                Wander<span className="text-red-600">lust</span>
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all md:hidden"
            >
              <X size={16} />
            </button>
          </div>

      
          <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-0.5">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
              Main Menu
            </p>
            {NAV.map(({ path, icon: Icon, label }) => {
              const active = pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                  className={`sidebar-nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                    ${active
                      ? 'nav-link-active bg-red-50 text-red-600 pl-4'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors
                    ${active ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Icon size={16} />
                  </div>
                  {label}
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-100 p-3 space-y-1">
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-md shadow-red-100">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-900">{adminData.username}</p>
                <p className="truncate text-[11px] text-gray-400">{adminData.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>

       
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
       
          <header className="header-fade-in flex h-[68px] flex-shrink-0 items-center gap-4 border-b border-gray-100 bg-white px-6 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all md:hidden"
            >
              <Menu size={20} />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] mb-0.5">
                <Link to="/admin" className="flex items-center gap-1 font-medium text-gray-400 hover:text-red-600 transition-colors">
                  <Home size={12} />
                  <span>Admin</span>
                </Link>
                {pathname !== '/admin' && (
                  <>
                    <ChevronRight size={11} className="text-gray-300" />
                    <span className="font-semibold text-gray-600">{breadcrumb}</span>
                  </>
                )}
              </div>
              <h1 className="display truncate text-lg font-extrabold text-gray-900 tracking-tight">{currentPage}</h1>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 sm:flex">
                <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white shadow-md shadow-red-100">
                {initials}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-[#f7f7f8] p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;