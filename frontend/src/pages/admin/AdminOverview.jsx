import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Clock,
  CheckCircle2,
  Users,
  Wrench,
  ClipboardList,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CalendarClock,
  Activity,
  Trophy,
  AlertCircle,
  Star,
  Zap,
  RefreshCw,
  ArrowUpRight,
  Target,
  ShieldCheck,
  ChevronRight,
  PieChart,
  Gauge,
  Calendar,
  ArrowDown,
  ArrowUp,
  Minus,
  CircleDot,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const num = typeof value === "number" ? value : parseFloat(value) || 0;
    if (num === 0) {
      setDisplay(0);
      return;
    }
    let start = 0;
    const duration = 900;
    const step = num / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) {
        setDisplay(num);
        clearInterval(timer);
      } else
        setDisplay(
          decimals > 0
            ? parseFloat(start.toFixed(decimals))
            : Math.floor(start),
        );
    }, 16);
    return () => clearInterval(timer);
  }, [value, decimals]);
  return (
    <span>
      {prefix}
      {decimals > 0 ? display.toFixed(decimals) : display.toLocaleString()}
      {suffix}
    </span>
  );
}

function Sparkline({ data, color = "#3b82f6", height = 36, width = "100%" }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  const areaPoints = `0,${height} ${points} 100,${height}`;
  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      style={{ width, height }}
      className="overflow-visible"
    >
      <defs>
        <linearGradient
          id={`grad-${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#grad-${color.replace("#", "")})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={100}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}

function CircularGauge({ value, max = 100, size = 96, label }) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (percentage / 100) * circumference);
    }, 400);
    return () => clearTimeout(timer);
  }, [percentage, circumference]);

  const color =
    percentage >= 75
      ? "#10b981"
      : percentage >= 50
        ? "#3b82f6"
        : percentage >= 25
          ? "#f59e0b"
          : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-gray-900">{percentage}</span>
          <span className="text-[9px] text-gray-400 -mt-0.5">/ 100</span>
        </div>
      </div>
      {label && (
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
}

function ChangeIndicator({ value }) {
  if (value === 0 || value === undefined || value === null) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md">
        <Minus className="w-3 h-3" />
        0%
      </span>
    );
  }
  const isUp = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${isUp ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"}`}
    >
      {isUp ? (
        <ArrowUp className="w-3 h-3" />
      ) : (
        <ArrowDown className="w-3 h-3" />
      )}
      {Math.abs(value)}%
    </span>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Yesterday" : `${d}d ago`;
}

export default function AdminOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [revenueByCategory, setRevenueByCategory] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [statsRes, trendsRes, topRes, revRes, actRes] = await Promise.all([
        fetch(`${API}/admin/stats`, { headers }),
        fetch(`${API}/admin/analytics/trends`, { headers }),
        fetch(`${API}/admin/analytics/top-services`, { headers }),
        fetch(`${API}/admin/analytics/revenue-by-category`, { headers }),
        fetch(`${API}/admin/activity`, { headers }),
      ]);
      const [statsData, trendsData, topData, revData, actData] =
        await Promise.all([
          statsRes.json(),
          trendsRes.json(),
          topRes.json(),
          revRes.json(),
          actRes.json(),
        ]);
      if (statsData.success) setStats(statsData.data);
      if (trendsData.success) setTrends(trendsData.data);
      if (topData.success) setTopServices(topData.data);
      if (revData.success) setRevenueByCategory(revData.data);
      if (actData.success) setActivityFeed(actData.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => fetchAll(), 60000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const computed = useMemo(() => {
    if (!stats) return null;
    const avgBookingValue =
      stats.completedBookings > 0
        ? Math.round(stats.totalRevenue / stats.completedBookings)
        : 0;
    const completionRate =
      stats.totalBookings > 0
        ? Math.round((stats.completedBookings / stats.totalBookings) * 100)
        : 0;
    const cancellationRate =
      stats.totalBookings > 0
        ? Math.round((stats.cancelledBookings / stats.totalBookings) * 100)
        : 0;
    const utilization =
      stats.totalServices > 0
        ? Math.round((stats.activeServices / stats.totalServices) * 100)
        : 0;
    const weekRevenue = trends.reduce((s, t) => s + t.revenue, 0);
    const weekBookings = trends.reduce((s, t) => s + t.count, 0);
    const dailyAvgRevenue = trends.length > 0 ? weekRevenue / trends.length : 0;
    const projectedMonthly = Math.round(dailyAvgRevenue * 30);
    const todayTrend = trends.length > 0 ? trends[trends.length - 1] : null;
    const yesterdayTrend = trends.length > 1 ? trends[trends.length - 2] : null;
    const revenueChange =
      yesterdayTrend && yesterdayTrend.revenue > 0
        ? Math.round(
            ((todayTrend.revenue - yesterdayTrend.revenue) /
              yesterdayTrend.revenue) *
              100,
          )
        : 0;
    const bookingChange =
      yesterdayTrend && yesterdayTrend.count > 0
        ? Math.round(
            ((todayTrend.count - yesterdayTrend.count) / yesterdayTrend.count) *
              100,
          )
        : 0;
    const busiestDay =
      trends.length > 0
        ? [...trends].sort((a, b) => b.count - a.count)[0]
        : null;
    const healthScore = Math.min(
      100,
      Math.round(
        completionRate * 0.35 +
          (100 - cancellationRate) * 0.25 +
          utilization * 0.2 +
          (Math.min(weekBookings, 50) / 50) * 100 * 0.2,
      ),
    );

    return {
      avgBookingValue,
      completionRate,
      cancellationRate,
      utilization,
      weekRevenue,
      weekBookings,
      dailyAvgRevenue,
      projectedMonthly,
      revenueChange,
      bookingChange,
      busiestDay,
      healthScore,
    };
  }, [stats, trends]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-[3px] border-gray-100" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-600 animate-spin" />
          </div>
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats || !computed) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center max-w-xs">
          <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Failed to load data
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Check your connection and try again.
          </p>
          <button
            onClick={() => {
              setLoading(true);
              fetchAll();
            }}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: {
      color: "text-amber-600",
      bg: "bg-amber-500",
      light: "bg-amber-50",
      border: "border-amber-200",
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    confirmed: {
      color: "text-blue-600",
      bg: "bg-blue-500",
      light: "bg-blue-50",
      border: "border-blue-200",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    "in-progress": {
      color: "text-violet-600",
      bg: "bg-violet-500",
      light: "bg-violet-50",
      border: "border-violet-200",
      icon: <Activity className="w-3.5 h-3.5" />,
    },
    completed: {
      color: "text-emerald-600",
      bg: "bg-emerald-500",
      light: "bg-emerald-50",
      border: "border-emerald-200",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    cancelled: {
      color: "text-red-600",
      bg: "bg-red-500",
      light: "bg-red-50",
      border: "border-red-200",
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
  };

  const getStatusBadge = (status) => {
    const cfg = statusConfig[status] || {};
    return `${cfg.light || "bg-gray-50"} ${cfg.color || "text-gray-600"} ${cfg.border || "border-gray-200"}`;
  };

  const totalCategoryRevenue =
    revenueByCategory.reduce((s, r) => s + r.revenue, 0) || 1;
  const catColorMap = {
    maintenance: "#3b82f6",
    repair: "#ef4444",
    inspection: "#f59e0b",
    customization: "#8b5cf6",
  };

  const pipelineStages = [
    { key: "pending", label: "Pending", value: stats.pendingBookings },
    { key: "confirmed", label: "Confirmed", value: stats.confirmedBookings },
    {
      key: "in-progress",
      label: "In Progress",
      value: stats.inProgressBookings,
    },
    { key: "completed", label: "Completed", value: stats.completedBookings },
    { key: "cancelled", label: "Cancelled", value: stats.cancelledBookings },
  ];
  const maxPipeline = Math.max(...pipelineStages.map((s) => s.value), 1);

  const insights = [];
  if (stats.pendingBookings > 3)
    insights.push({
      icon: <Clock className="w-4 h-4" />,
      text: `${stats.pendingBookings} bookings awaiting confirmation`,
      color: "amber",
      action: () => navigate("/admin/bookings"),
    });
  if (computed.cancellationRate > 20)
    insights.push({
      icon: <AlertCircle className="w-4 h-4" />,
      text: `High cancellation rate at ${computed.cancellationRate}%`,
      color: "red",
    });
  if (computed.completionRate >= 80)
    insights.push({
      icon: <CheckCircle2 className="w-4 h-4" />,
      text: `Strong ${computed.completionRate}% completion rate`,
      color: "emerald",
    });
  if (computed.utilization < 50 && stats.totalServices > 0)
    insights.push({
      icon: <Wrench className="w-4 h-4" />,
      text: `${stats.totalServices - stats.activeServices} of ${stats.totalServices} services are inactive`,
      color: "blue",
      action: () => navigate("/admin/services"),
    });

  const insightStyle = {
    amber: "border-amber-200 bg-amber-50/60 text-amber-800",
    red: "border-red-200 bg-red-50/60 text-red-800",
    emerald: "border-emerald-200 bg-emerald-50/60 text-emerald-800",
    blue: "border-blue-200 bg-blue-50/60 text-blue-800",
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {lastUpdated && (
            <span className="text-[11px] text-gray-300 hidden sm:block">
              {lastUpdated.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          )}
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-100">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* Smart Insights */}
      {insights.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {insights.map((ins, i) => (
            <button
              key={i}
              onClick={ins.action}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition hover:shadow-sm ${insightStyle[ins.color]}`}
            >
              {ins.icon}
              <span>{ins.text}</span>
              {ins.action && <ChevronRight className="w-3 h-3 opacity-40" />}
            </button>
          ))}
        </div>
      )}

      {/* Primary KPIs */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Revenue",
            value: stats.totalRevenue,
            prefix: "$",
            Icon: TrendingUp,
            accent: "text-emerald-600",
            spark: trends.map((t) => t.revenue),
            sparkColor: "#10b981",
            change: computed.revenueChange,
            sub: `$${computed.projectedMonthly.toLocaleString()} projected/mo`,
          },
          {
            label: "Bookings",
            value: stats.totalBookings,
            Icon: ClipboardList,
            accent: "text-blue-600",
            spark: trends.map((t) => t.count),
            sparkColor: "#3b82f6",
            change: computed.bookingChange,
            sub: `${computed.weekBookings} this week`,
          },
          {
            label: "Customers",
            value: stats.totalCustomers,
            Icon: Users,
            accent: "text-violet-600",
            sub: `$${computed.avgBookingValue} avg. booking`,
          },
          {
            label: "Services",
            value: stats.activeServices,
            suffix: ` / ${stats.totalServices}`,
            Icon: Wrench,
            accent: "text-amber-600",
            sub: `${computed.utilization}% utilization`,
          },
        ].map(
          ({
            label,
            value,
            prefix,
            suffix,
            Icon,
            accent,
            spark,
            sparkColor,
            change,
            sub,
          }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-gray-100 p-5 group hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center ${accent}`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                {change !== undefined && <ChangeIndicator value={change} />}
              </div>
              <p className="text-[26px] font-bold text-gray-900 leading-none tracking-tight">
                <AnimatedNumber value={value} prefix={prefix || ""} />
                {suffix && (
                  <span className="text-sm font-medium text-gray-400">
                    {suffix}
                  </span>
                )}
              </p>
              <p className="text-[11px] font-medium text-gray-400 mt-1 uppercase tracking-wider">
                {label}
              </p>
              {sub && <p className="text-[11px] text-gray-300 mt-0.5">{sub}</p>}
              {spark && spark.length > 1 && (
                <div className="mt-3 -mb-1">
                  <Sparkline data={spark} color={sparkColor} height={28} />
                </div>
              )}
            </div>
          ),
        )}
      </div>

      {/* Health Score + Pipeline */}
      <div className="grid lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col items-center justify-center">
          <CircularGauge value={computed.healthScore} label="Health Score" />
          <div className="mt-3 w-full space-y-1.5">
            {[
              {
                label: "Completion",
                val: computed.completionRate,
                color: "bg-emerald-500",
              },
              {
                label: "Utilization",
                val: computed.utilization,
                color: "bg-blue-500",
              },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 w-16 shrink-0">
                  {label}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${color} h-full rounded-full transition-all duration-1000`}
                    style={{ width: `${val}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-gray-600 w-8 text-right">
                  {val}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Booking Pipeline
              </h3>
              <p className="text-[11px] text-gray-400">
                Status distribution across all bookings
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/bookings")}
              className="text-[11px] text-blue-600 font-medium hover:text-blue-700 flex items-center gap-0.5"
            >
              All bookings <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-end gap-2" style={{ height: 100 }}>
            {pipelineStages.map(({ key, label, value }) => {
              const cfg = statusConfig[key];
              const pct = Math.max((value / maxPipeline) * 100, 6);
              return (
                <div
                  key={key}
                  className="flex-1 flex flex-col items-center gap-1.5"
                >
                  <span className={`text-xs font-bold ${cfg.color}`}>
                    {value}
                  </span>
                  <div
                    className="w-full bg-gray-50 rounded-lg relative"
                    style={{ height: 60 }}
                  >
                    <div
                      className={`absolute bottom-0 inset-x-0 ${cfg.bg} rounded-lg transition-all duration-1000 ease-out opacity-80`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-medium text-gray-400 text-center leading-tight whitespace-nowrap">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 text-center">
            {[
              {
                label: "Total",
                value: stats.totalBookings,
                cls: "text-gray-900",
              },
              {
                label: "Completion",
                value: `${computed.completionRate}%`,
                cls: "text-emerald-600",
              },
              {
                label: "Cancellation",
                value: `${computed.cancellationRate}%`,
                cls: "text-red-500",
              },
              {
                label: "Avg. Value",
                value: `$${computed.avgBookingValue}`,
                cls: "text-blue-600",
              },
            ].map(({ label, value, cls }) => (
              <div key={label}>
                <p className={`text-sm font-bold ${cls}`}>{value}</p>
                <p className="text-[9px] text-gray-400 font-medium uppercase">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trends + Sidebar */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                7-Day Performance
              </h3>
              <p className="text-[11px] text-gray-400">
                Daily bookings and revenue trend
              </p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-medium text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-5 h-[3px] bg-blue-500 rounded-full" />
                Bookings
              </span>
              <span className="flex items-center gap-1">
                <span className="w-5 h-[3px] bg-emerald-500 rounded-full" />
                Revenue
              </span>
            </div>
          </div>
          {trends.length > 0 ? (
            (() => {
              const maxC = Math.max(...trends.map((t) => t.count), 1);
              const maxR = Math.max(...trends.map((t) => t.revenue), 1);
              return (
                <div className="space-y-0">
                  {trends.map((day, i) => {
                    const isToday = i === trends.length - 1;
                    const isBusiest =
                      computed.busiestDay &&
                      day.date === computed.busiestDay.date &&
                      day.count > 0;
                    return (
                      <div
                        key={day.date}
                        className={`flex items-center gap-3 py-2.5 ${i < trends.length - 1 ? "border-b border-gray-50" : ""} ${isToday ? "bg-blue-50/40 -mx-6 px-6 rounded-lg" : ""}`}
                      >
                        <div className="w-16 shrink-0">
                          <p
                            className={`text-[11px] font-semibold ${isToday ? "text-blue-600" : "text-gray-500"}`}
                          >
                            {isToday
                              ? "Today"
                              : new Date(
                                  day.date + "T00:00:00",
                                ).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  day: "numeric",
                                })}
                          </p>
                          {isBusiest && (
                            <span className="text-[8px] font-bold text-amber-600 uppercase tracking-wider">
                              Peak
                            </span>
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-[6px] overflow-hidden">
                              <div
                                className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
                                style={{
                                  width: `${(day.count / maxC) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-blue-600 w-6 text-right">
                              {day.count}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-[6px] overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                                style={{
                                  width: `${(day.revenue / maxR) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 w-6 text-right">
                              ${day.revenue}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-300">
              <BarChart3 className="w-8 h-8 mb-2" />
              <p className="text-sm">No trend data yet</p>
            </div>
          )}
          {computed.busiestDay && computed.busiestDay.count > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2 text-[11px] text-gray-400">
              <Gauge className="w-3.5 h-3.5" />
              <span>
                Busiest day:{" "}
                <strong className="text-gray-600">
                  {new Date(
                    computed.busiestDay.date + "T00:00:00",
                  ).toLocaleDateString("en-US", { weekday: "long" })}
                </strong>{" "}
                with {computed.busiestDay.count} bookings
              </span>
            </div>
          )}
        </div>

        {/* Right sidebar - Revenue Mix + Top Services */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Revenue by Category
            </h3>
            {revenueByCategory.length > 0 ? (
              <div className="space-y-3">
                {revenueByCategory.map((cat) => {
                  const pct = Math.round(
                    (cat.revenue / totalCategoryRevenue) * 100,
                  );
                  const color = catColorMap[cat._id] || "#6b7280";
                  return (
                    <div key={cat._id}>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="flex items-center gap-1.5 text-gray-700 font-medium capitalize">
                          <span
                            className="w-2 h-2 rounded-sm"
                            style={{ backgroundColor: color }}
                          />
                          {cat._id}
                        </span>
                        <span className="font-semibold text-gray-900">
                          ${cat.revenue.toLocaleString()}{" "}
                          <span className="text-gray-400 font-normal">
                            ({pct}%)
                          </span>
                        </span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-300">
                <PieChart className="w-7 h-7 mx-auto mb-1.5" />
                <p className="text-xs">No data</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Top Services
            </h3>
            {topServices.length > 0 ? (
              <div className="space-y-2.5">
                {topServices.map((svc, i) => {
                  const maxSvcRev = topServices[0]?.revenue || 1;
                  const pct = Math.round((svc.revenue / maxSvcRev) * 100);
                  return (
                    <div key={svc._id || i} className="group">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-100 text-gray-600" : i === 2 ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-400"}`}
                        >
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="text-[11px] font-medium text-gray-800 truncate">
                              {svc.serviceName || "Unknown"}
                            </p>
                            <span className="text-[11px] font-bold text-gray-900 shrink-0 ml-2">
                              ${svc.revenue.toLocaleString()}
                            </span>
                          </div>
                          <div className="bg-gray-100 rounded-full h-1 overflow-hidden">
                            <div
                              className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-300">
                <Trophy className="w-7 h-7 mx-auto mb-1.5" />
                <p className="text-xs">No data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings + Activity */}
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">
                Recent Bookings
              </h3>
              {stats.recentBookings.length > 0 && (
                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                  {stats.recentBookings.length}
                </span>
              )}
            </div>
            <button
              onClick={() => navigate("/admin/bookings")}
              className="text-[11px] text-blue-600 font-medium hover:text-blue-700 flex items-center gap-0.5"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {stats.recentBookings.length === 0 ? (
            <div className="p-10 text-center text-gray-300">
              <ClipboardList className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No bookings yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stats.recentBookings.map((b) => (
                <div
                  key={b._id}
                  className="px-5 py-3 hover:bg-gray-50/50 transition-colors flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-gray-500">
                      {(b.customerId?.name || "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {b.customerId?.name || "N/A"}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {b.serviceId?.name || ""} &middot;{" "}
                      {new Date(b.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right shrink-0 space-y-0.5">
                    <p className="text-sm font-semibold text-gray-900">
                      ${b.totalPrice}
                    </p>
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold capitalize border ${getStatusBadge(b.status)}`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
            <Zap className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Activity</h3>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {activityFeed.length === 0 ? (
              <div className="p-10 text-center text-gray-300">
                <Activity className="w-7 h-7 mx-auto mb-1.5" />
                <p className="text-xs">No recent activity</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {activityFeed.slice(0, 12).map((item, i) => {
                  const cfg = statusConfig[item.status] || {};
                  return (
                    <div
                      key={i}
                      className="px-5 py-2.5 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`mt-0.5 w-6 h-6 ${cfg.light || "bg-gray-50"} rounded flex items-center justify-center shrink-0 ${cfg.color || "text-gray-400"}`}
                        >
                          {cfg.icon || <CircleDot className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-gray-600">
                            <span className="font-semibold text-gray-800">
                              {item.customerName}
                            </span>{" "}
                            &rarr;{" "}
                            <span
                              className={`inline-block px-1 py-px rounded text-[9px] font-semibold capitalize border ${getStatusBadge(item.status)}`}
                            >
                              {item.status}
                            </span>
                          </p>
                          <p className="text-[10px] text-gray-300 mt-0.5">
                            {timeAgo(item.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Bookings",
            desc: "Manage appointments",
            path: "/admin/bookings",
            Icon: ClipboardList,
            count: stats.pendingBookings,
            badge: "pending",
          },
          {
            label: "Services",
            desc: "Service catalog",
            path: "/admin/services",
            Icon: Wrench,
            count: stats.activeServices,
            badge: "active",
          },
          {
            label: "Customers",
            desc: "Customer directory",
            path: "/admin/customers",
            Icon: Users,
            count: stats.totalCustomers,
          },
          {
            label: "Reviews",
            desc: "Customer feedback",
            path: "/admin/reviews",
            Icon: Star,
          },
        ].map(({ label, desc, path, Icon, count, badge }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="bg-white rounded-xl border border-gray-100 p-4 text-left hover:shadow-md hover:border-gray-200 transition-all group flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition shrink-0">
              <Icon className="w-[18px] h-[18px]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition">
                {label}
              </h4>
              <p className="text-[10px] text-gray-400">{desc}</p>
            </div>
            {count !== undefined && (
              <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded shrink-0">
                {count}
                {badge ? ` ${badge}` : ""}
              </span>
            )}
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-blue-500 transition shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
