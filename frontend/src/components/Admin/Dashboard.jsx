import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ListChecks,
  MessageSquare,
  Clock,
  Download,
  Loader2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Activity,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../lib/api';

const CARD_META = {
  totalUsers: {
    label: 'Total Users',
    icon: Users,
    iconWrap: 'bg-cyan-100 text-cyan-700',
    cardTone: 'from-cyan-500/15 to-cyan-500/5',
    link: '/admin/users',
  },
  totalListings: {
    label: 'Total Listings',
    icon: ListChecks,
    iconWrap: 'bg-emerald-100 text-emerald-700',
    cardTone: 'from-emerald-500/15 to-emerald-500/5',
    link: '/admin/listings',
  },
  totalReviews: {
    label: 'Total Reviews',
    icon: MessageSquare,
    iconWrap: 'bg-violet-100 text-violet-700',
    cardTone: 'from-violet-500/15 to-violet-500/5',
    link: '/admin/reviews',
  },
  pendingListings: {
    label: 'Pending Listings',
    icon: Clock,
    iconWrap: 'bg-amber-100 text-amber-700',
    cardTone: 'from-amber-500/15 to-amber-500/5',
    link: '/admin/listings',
  },
};

const quickActions = [
  {
    label: 'Manage Users',
    hint: 'Roles and account controls',
    icon: Users,
    iconWrap: 'bg-cyan-100 text-cyan-700',
    link: '/admin/users',
  },
  {
    label: 'Review Listings',
    hint: 'Approve or reject submissions',
    icon: ListChecks,
    iconWrap: 'bg-emerald-100 text-emerald-700',
    link: '/admin/listings',
  },
  {
    label: 'Moderate Reviews',
    hint: 'Keep community trust healthy',
    icon: MessageSquare,
    iconWrap: 'bg-violet-100 text-violet-700',
    link: '/admin/reviews',
  },
];

const trends = {
  totalUsers: { trend: 'up', value: 12 },
  totalListings: { trend: 'up', value: 8 },
  totalReviews: { trend: 'up', value: 15 },
  pendingListings: { trend: 'down', value: 5 },
};

const selectCls =
  'rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all focus:border-slate-400 focus:outline-none';

const StatCard = ({ dataKey, value }) => {
  const meta = CARD_META[dataKey];
  const Icon = meta.icon;
  const cardTrend = trends[dataKey];

  return (
    <Link to={meta.link} className="group block">
      <div className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br ${meta.cardTone} p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
        <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/30 blur-2xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{meta.label}</p>
            <p className="mt-3 text-4xl font-black tracking-tight text-slate-900">{Number(value || 0).toLocaleString()}</p>
            <div className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${cardTrend.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {cardTrend.trend === 'up' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {cardTrend.value}% vs last week
            </div>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${meta.iconWrap}`}>
            <Icon size={21} />
          </div>
        </div>
      </div>
    </Link>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="mb-1 flex items-center gap-2 text-sm last:mb-0">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="font-semibold text-slate-600">{entry.name}:</span>
          <span className="font-bold" style={{ color: entry.color }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const ActivityList = ({ title, icon: Icon, items, type, link, emptyText }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Icon size={17} />
          </div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
        </div>
        <Link to={link} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900">
          View all
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="p-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm font-medium text-slate-400">
            {emptyText}
          </div>
        ) : (
          items.slice(0, 5).map((item) => (
            <div key={item._id} className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50 last:mb-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                {type === 'users' ? item.username?.[0]?.toUpperCase() : <ListChecks size={16} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {type === 'users' ? item.username : item.title}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="mx-auto max-w-7xl animate-pulse space-y-6">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-36 rounded-2xl border border-slate-200 bg-white" />
      ))}
    </div>
    <div className="h-80 rounded-2xl border border-slate-200 bg-white" />
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalReviews: 0,
    pendingListings: 0,
    recentUsers: [],
    recentListings: [],
    chartData: [],
  });
  const [reportType, setReportType] = useState('all');
  const [dateRange, setDateRange] = useState('week');
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      const today = new Date();

      const chartData = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - index));

        return {
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          Users:
            data.recentUsers?.filter(
              (user) => new Date(user.createdAt).toDateString() === date.toDateString()
            ).length || 0,
          Listings:
            data.recentListings?.filter(
              (listing) => new Date(listing.createdAt).toDateString() === date.toDateString()
            ).length || 0,
        };
      });

      setStats({ ...data, chartData });
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const refreshInterval = setInterval(fetchStats, 60000);
    return () => clearInterval(refreshInterval);
  }, [fetchStats]);

  const generateReport = async () => {
    setGenerating(true);

    try {
      const { data } = await api.get('/admin/reports/generate', {
        params: { type: reportType, dateRange },
        responseType: 'blob',
      });

      const downloadUrl = URL.createObjectURL(new Blob([data]));
      const downloadLink = Object.assign(document.createElement('a'), {
        href: downloadUrl,
        download: `wanderlust_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`,
      });

      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      URL.revokeObjectURL(downloadUrl);
      toast.success('Report downloaded successfully');
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-7 text-white shadow-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
              <Sparkles size={14} />
              Admin Intelligence
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Dashboard Overview</h2>
            <p className="mt-1 text-sm text-slate-200">
              Live moderation pulse and business health in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className={selectCls}>
              <option value="all">All Data</option>
              <option value="users">Users</option>
              <option value="listings">Listings</option>
              <option value="reviews">Reviews</option>
            </select>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className={selectCls}>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
            <button
              onClick={generateReport}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {generating ? 'Generating...' : 'Export PDF'}
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Object.keys(CARD_META).map((key) => (
          <StatCard key={key} dataKey={key} value={stats[key]} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {quickActions.map(({ label, hint, icon: Icon, iconWrap, link }) => (
          <Link
            key={link}
            to={link}
            className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconWrap}`}>
                <Icon size={18} />
              </div>
              <ArrowRight size={16} className="text-slate-300 transition-colors group-hover:text-slate-700" />
            </div>
            <p className="mt-4 text-base font-bold text-slate-900">{label}</p>
            <p className="mt-1 text-sm text-slate-500">{hint}</p>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Activity Trends</h3>
            <p className="text-sm text-slate-500">Last 7 days</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            <Activity size={14} />
            Real-time refresh every minute
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="listingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="Users" stroke="#06b6d4" strokeWidth={3} fill="url(#usersGradient)" />
              <Area type="monotone" dataKey="Listings" stroke="#8b5cf6" strokeWidth={3} fill="url(#listingsGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ActivityList
          title="Recent Users"
          icon={Users}
          items={stats.recentUsers}
          type="users"
          link="/admin/users"
          emptyText="No recent users"
        />
        <ActivityList
          title="Recent Listings"
          icon={ListChecks}
          items={stats.recentListings}
          type="listings"
          link="/admin/listings"
          emptyText="No recent listings"
        />
      </section>
    </div>
  );
};

export default Dashboard;
