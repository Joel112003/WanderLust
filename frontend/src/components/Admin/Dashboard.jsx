import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, ListChecks, MessageSquare, Clock, Download, Loader2, TrendingUp, TrendingDown, ArrowRight, Activity } from 'lucide-react';
import { toast } from 'react-toastify';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/api';

const CARDS = [
  { key: 'totalUsers',      label: 'Total Users',      icon: Users,        gradient: 'from-blue-500 to-blue-600',   light: 'bg-blue-50',  text: 'text-blue-600', link: '/admin/users'  },
  { key: 'totalListings',   label: 'Total Listings',   icon: ListChecks,   gradient: 'from-indigo-500 to-indigo-600', light: 'bg-indigo-50',text: 'text-indigo-600', link: '/admin/listings'},
  { key: 'totalReviews',    label: 'Total Reviews',    icon: MessageSquare,gradient: 'from-purple-500 to-purple-600', light: 'bg-purple-50',text: 'text-purple-600', link: '/admin/reviews'},
  { key: 'pendingListings', label: 'Pending Listings', icon: Clock,        gradient: 'from-orange-500 to-orange-600', light: 'bg-orange-50',text: 'text-orange-600', link: '/admin/listings'},
];

const StatCard = ({ label, value, icon: Icon, gradient, light, text, link, trend, trendValue }) => (
  <Link to={link} className="block group">
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative">
      {/* Background decoration */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{label}</p>
          <p className="text-4xl font-bold text-gray-900 tabular-nums mb-2">{value.toLocaleString()}</p>
          {trend && (
            <div className={`flex items-center gap-1.5 text-sm font-bold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{trendValue}%</span>
              <span className="text-gray-400 font-normal ml-1">vs last week</span>
            </div>
          )}
        </div>
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={28} className="text-white" />
        </div>
      </div>
    </div>
  </Link>
);

const ActivityRow = ({ item, type }) => {
  const Icon = type === 'users' ? Users : ListChecks;
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors px-3 rounded-lg group">
      <div className={`w-11 h-11 rounded-xl ${type === 'users' ? 'bg-blue-100' : 'bg-indigo-100'} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
        {type === 'users' ? (
          <span className="text-base font-bold text-blue-600">{item.username?.[0]?.toUpperCase()}</span>
        ) : (
          <ListChecks size={18} className="text-indigo-600" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {type === 'users' ? item.username : item.title}
        </p>
        <p className="text-sm text-gray-400 mt-0.5">
          {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border-2 border-gray-100 rounded-xl shadow-xl px-5 py-3">
      <p className="text-sm font-bold text-gray-800 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm font-semibold mb-1 last:mb-0">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-600">{p.name}:</span>
          <span style={{ color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const QuickActions = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {[
      { label: 'Manage Users', icon: Users, link: '/admin/users', color: 'blue' },
      { label: 'Review Listings', icon: ListChecks, link: '/admin/listings', color: 'indigo' },
      { label: 'Check Reviews', icon: MessageSquare, link: '/admin/reviews', color: 'purple' },
    ].map(({ label, icon: Icon, link, color }) => (
      <Link key={link} to={link}
        className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all duration-200 group">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-${color}-50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon size={20} className={`text-${color}-600`} />
          </div>
          <span className="text-base font-semibold text-gray-700 group-hover:text-gray-900">{label}</span>
        </div>
        <ArrowRight size={18} className="text-gray-300 group-hover:text-gray-700" />
      </Link>
    ))}
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-8 max-w-7xl mx-auto animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[1,2,3,4].map(i => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-36">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-3/4"></div>
        </div>
      ))}
    </div>
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-96">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
      <div className="h-full bg-gray-100 rounded"></div>
    </div>
  </div>
);

const selectCls = "text-base px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm hover:shadow";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0, totalListings: 0, totalReviews: 0, pendingListings: 0,
    recentUsers: [], recentListings: [], chartData: []
  });
  const [reportType, setReportType] = useState('all');
  const [dateRange, setDateRange] = useState('week');
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      const today = new Date();
      const chartData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        return {
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          Users: data.recentUsers?.filter(u => new Date(u.createdAt).toDateString() === d.toDateString()).length || 0,
          Listings: data.recentListings?.filter(l => new Date(l.createdAt).toDateString() === d.toDateString()).length || 0,
        };
      });
      setStats({ ...data, chartData });
    } catch (err) { 
      console.error('Dashboard error:', err);
      toast.error('Failed to load dashboard data'); 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 60_000);
    return () => clearInterval(id);
  }, [fetchStats]);

  const generateReport = async () => {
    setGenerating(true);
    try {
      const { data } = await api.get('/admin/reports/generate', {
        params: { type: reportType, dateRange }, responseType: 'blob',
      });
      const url = URL.createObjectURL(new Blob([data]));
      const a = Object.assign(document.createElement('a'), {
        href: url,
        download: `wanderlust_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`,
      });
      document.body.appendChild(a); a.click(); a.remove();
      toast.success('Report downloaded successfully!');
    } catch { toast.error('Failed to generate report'); }
    finally { setGenerating(false); }
  };

  if (loading) return <LoadingSkeleton />;

  // Calculate trends (mock data - in real app, compare with previous period)
  const trends = {
    totalUsers: { trend: 'up', value: 12 },
    totalListings: { trend: 'up', value: 8 },
    totalReviews: { trend: 'up', value: 15 },
    pendingListings: { trend: 'down', value: 5 },
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">Dashboard Overview</h2>
          <p className="text-base text-gray-500 flex items-center gap-2">
            <Activity size={16} className="text-blue-500" />
            Real-time analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select value={reportType} onChange={e => setReportType(e.target.value)} className={selectCls}>
            <option value="all">All Data</option>
            <option value="users">Users</option>
            <option value="listings">Listings</option>
            <option value="reviews">Reviews</option>
          </select>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} className={selectCls}>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
          <button onClick={generateReport} disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-base font-bold rounded-xl shadow-lg shadow-blue-200 disabled:opacity-50 transition-all hover:shadow-xl">
            {generating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {generating ? 'Generating...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {CARDS.map(c => (
          <StatCard key={c.key} {...c} value={stats[c.key]} {...trends[c.key]} />
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Activity Trends</h3>
            <p className="text-sm text-gray-500">Last 7 days overview</p>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-600">
              <span className="w-3 h-3 rounded-full bg-blue-500" />New Users
            </span>
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-600">
              <span className="w-3 h-3 rounded-full bg-purple-500" />New Listings
            </span>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorListings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 13, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="Users" stroke="#3b82f6" strokeWidth={3} fill="url(#colorUsers)" />
              <Area type="monotone" dataKey="Listings" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorListings)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { title: 'Recent Users',    items: stats.recentUsers,    type: 'users',    icon: Users,        color: 'blue',   link: '/admin/users' },
          { title: 'Recent Listings', items: stats.recentListings, type: 'listings', icon: ListChecks,   color: 'indigo', link: '/admin/listings' },
        ].map(({ title, items, type, icon: Icon, color, link }) => (
          <div key={type} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className={`flex items-center justify-between px-6 py-4 bg-gradient-to-r from-${color}-50 to-${color}-50/50 border-b border-${color}-100`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-${color}-100 flex items-center justify-center`}>
                  <Icon size={20} className={`text-${color}-600`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              </div>
              <Link to={link} className={`text-sm font-semibold text-${color}-600 hover:text-${color}-700 flex items-center gap-1 transition-colors`}>
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="p-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Icon size={32} className="text-gray-200" />
                  <p className="text-base text-gray-400 font-medium">No recent activity</p>
                </div>
              ) : (
                items.slice(0, 5).map(item => <ActivityRow key={item._id} item={item} type={type} />)
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;