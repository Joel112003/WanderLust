import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import toast from "react-hot-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../lib/api";
import AdminSelect from "./AdminSelect";

const CARD_META = {
  totalUsers: {
    label: "Total Users",
    icon: Users,
    stripClass: "bg-red-500",
    glowClass: "bg-red-500",
    iconWrapClass: "bg-red-50 text-red-600",
    link: "/admin/users",
  },
  totalListings: {
    label: "Total Listings",
    icon: ListChecks,
    stripClass: "bg-red-400",
    glowClass: "bg-red-400",
    iconWrapClass: "bg-red-50 text-red-500",
    link: "/admin/listings",
  },
  totalReviews: {
    label: "Total Reviews",
    icon: MessageSquare,
    stripClass: "bg-red-300",
    glowClass: "bg-red-300",
    iconWrapClass: "bg-red-50 text-red-400",
    link: "/admin/reviews",
  },
  pendingListings: {
    label: "Pending Listings",
    icon: Clock,
    stripClass: "bg-red-700",
    glowClass: "bg-red-700",
    iconWrapClass: "bg-red-100 text-red-700",
    link: "/admin/listings",
  },
};

const trends = {
  totalUsers: { trend: "up", value: 12 },
  totalListings: { trend: "up", value: 8 },
  totalReviews: { trend: "up", value: 15 },
  pendingListings: { trend: "down", value: 5 },
};

const quickActions = [
  {
    label: "Manage Users",
    hint: "Roles and account controls",
    icon: Users,
    iconWrapClass: "bg-red-50 text-red-600",
    link: "/admin/users",
  },
  {
    label: "Review Listings",
    hint: "Approve or reject submissions",
    icon: ListChecks,
    iconWrapClass: "bg-red-50 text-red-500",
    link: "/admin/listings",
  },
  {
    label: "Moderate Reviews",
    hint: "Keep community trust healthy",
    icon: MessageSquare,
    iconWrapClass: "bg-red-50 text-red-400",
    link: "/admin/reviews",
  },
];

const CARD_DELAY_CLASSES = ["delay-0", "delay-75", "delay-100", "delay-150"];
const ACTION_DELAY_CLASSES = ["delay-0", "delay-75", "delay-100"];
const ROW_DELAY_CLASSES = [
  "delay-0",
  "delay-75",
  "delay-100",
  "delay-150",
  "delay-200",
];

const getSeriesColorClasses = (dataKey) => {
  if (dataKey === "Users") return "bg-red-600 text-red-600";
  return "bg-red-400 text-red-400";
};

const REPORT_TYPE_OPTIONS = [
  { value: "all", label: "All Data" },
  { value: "users", label: "Users" },
  { value: "listings", label: "Listings" },
  { value: "reviews", label: "Reviews" },
];

const DATE_RANGE_OPTIONS = [
  { value: "week", label: "Last Week" },
  { value: "month", label: "Last Month" },
  { value: "quarter", label: "Last 3 Months" },
  { value: "year", label: "Last Year" },
  { value: "all", label: "All Time" },
];

/* ── Stat Card ── */
const StatCard = ({ dataKey, value, index }) => {
  const meta = CARD_META[dataKey];
  const Icon = meta.icon;
  const t = trends[dataKey];
  const up = t.trend === "up";

  return (
    <Link
      to={meta.link}
      className={`group block transition-all duration-300 motion-safe:animate-fade-in ${CARD_DELAY_CLASSES[index] || "delay-0"}`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/60">
        {/* Accent strip */}
        <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${meta.stripClass}`} />
        {/* Glow */}
        <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl opacity-20 ${meta.glowClass}`} />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
              {meta.label}
            </p>
            <p className="mt-2.5 text-4xl font-black tracking-tight text-gray-900">
              {Number(value || 0).toLocaleString()}
            </p>
            <div
              className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
            >
              {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {t.value}% vs last week
            </div>
          </div>
          <div
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${meta.iconWrapClass}`}
          >
            <Icon size={20} />
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ── Tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-2xl shadow-gray-200/80">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
        {label}
      </p>
      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          className="mb-1 flex items-center gap-2 text-sm last:mb-0"
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${getSeriesColorClasses(entry.dataKey).split(" ")[0]}`}
          />
          <span className="font-medium text-gray-500">{entry.name}:</span>
          <span
            className={`font-bold ${getSeriesColorClasses(entry.dataKey).split(" ")[1]}`}
          >
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ── Activity List ── */
const ActivityList = ({ title, icon: Icon, items, type, link, emptyText }) => (
  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
          <Icon size={15} />
        </div>
        <h3 className="display text-sm font-extrabold text-gray-900">
          {title}
        </h3>
      </div>
      <Link
        to={link}
        className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 transition-colors"
      >
        View all <ArrowRight size={12} />
      </Link>
    </div>
    <div className="p-3">
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm font-medium text-gray-400">
          {emptyText}
        </div>
      ) : (
        items.slice(0, 5).map((item, i) => (
          <div
            key={item._id}
            className={`mb-1.5 flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors last:mb-0 hover:bg-gray-50 motion-safe:animate-fade-in ${ROW_DELAY_CLASSES[i] || "delay-0"}`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 text-sm font-bold flex-shrink-0">
              {type === "users" ? (
                item.username?.[0]?.toUpperCase()
              ) : (
                <ListChecks size={14} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">
                {type === "users" ? item.username : item.title}
              </p>
              <p className="text-[11px] text-gray-400">
                {new Date(item.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);


const LoadingSkeleton = () => (
  <div className="mx-auto max-w-7xl space-y-6 animate-pulse">
    <div className="h-28 rounded-3xl bg-gray-100" />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-36 rounded-2xl bg-gray-100" />
      ))}
    </div>
    <div className="h-80 rounded-2xl bg-gray-100" />
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
  const [reportType, setReportType] = useState("all");
  const [dateRange, setDateRange] = useState("week");
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/dashboard");
      const today = new Date();
      const chartData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        return {
          name: d.toLocaleDateString("en-US", { weekday: "short" }),
          Users:
            data.recentUsers?.filter(
              (u) => new Date(u.createdAt).toDateString() === d.toDateString(),
            ).length || 0,
          Listings:
            data.recentListings?.filter(
              (l) => new Date(l.createdAt).toDateString() === d.toDateString(),
            ).length || 0,
        };
      });
      setStats({ ...data, chartData });
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const t = setInterval(fetchStats, 60000);
    return () => clearInterval(t);
  }, [fetchStats]);

  const generateReport = async () => {
    setGenerating(true);
    try {
      const { data } = await api.get("/admin/reports/generate", {
        params: { type: reportType, dateRange },
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([data]));
      const a = Object.assign(document.createElement("a"), {
        href: url,
        download: `wanderlust_${reportType}_${new Date().toISOString().split("T")[0]}.pdf`,
      });
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Report downloaded");
    } catch {
      toast.error("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      
        <section className="rounded-2xl border border-red-100 bg-red-600 px-6 py-6 shadow-xl shadow-red-200/40 motion-safe:animate-fade-in">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/90">
                <Sparkles size={12} />
                Admin Intelligence
              </div>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-white">
                Dashboard Overview
              </h2>
              <p className="mt-1 text-sm text-white/70">
                Live moderation pulse and business health in one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <AdminSelect
                value={reportType}
                onChange={setReportType}
                options={REPORT_TYPE_OPTIONS}
                className="min-w-[150px]"
              />

              <AdminSelect
                value={dateRange}
                onChange={setDateRange}
                options={DATE_RANGE_OPTIONS}
                className="min-w-[160px]"
              />

              <button
                onClick={generateReport}
                disabled={generating}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-red-600 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
              >
                {generating ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Download size={15} />
                )}
                {generating ? "Generating…" : "Export PDF"}
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Object.keys(CARD_META).map((key, i) => (
            <StatCard key={key} dataKey={key} value={stats[key]} index={i} />
          ))}
        </section>

        {/* Quick actions */}
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {quickActions.map(
            ({ label, hint, icon: Icon, iconWrapClass, link }, i) => (
              <Link
                key={link}
                to={link}
                className={`group rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg motion-safe:animate-fade-in ${ACTION_DELAY_CLASSES[i] || "delay-0"}`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${iconWrapClass}`}
                  >
                    <Icon size={18} />
                  </div>
                  <ArrowRight
                    size={15}
                    className="text-gray-300 transition-all group-hover:text-gray-700 group-hover:translate-x-1"
                  />
                </div>
                <p className="mt-4 text-sm font-extrabold text-gray-900">
                  {label}
                </p>
                <p className="mt-0.5 text-[12px] text-gray-500">{hint}</p>
              </Link>
            ),
          )}
        </section>

       
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">
                Activity Trends
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Last 7 days</p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-3 py-1.5 text-[11px] font-bold text-gray-500">
              <Activity size={12} />
              Auto-refresh every minute
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.chartData}
                margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gListings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "#e2e8f0", strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="Users"
                  stroke="#dc2626"
                  strokeWidth={2.5}
                  fill="url(#gUsers)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#dc2626" }}
                />
                <Area
                  type="monotone"
                  dataKey="Listings"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fill="url(#gListings)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#8b5cf6" }}
                />
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
