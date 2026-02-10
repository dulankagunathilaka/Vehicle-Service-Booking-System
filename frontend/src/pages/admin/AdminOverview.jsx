import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Clock,
  CheckCircle2,
  Loader,
  Users,
  DollarSign,
  Wrench,
  ClipboardList,
  ArrowRight,
  TrendingUp,
  CalendarClock,
  Activity,
  Trophy,
  AlertCircle,
  Star,
  Zap,
} from "lucide-react";

const API = "http://localhost:5000/api";

export default function AdminOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [revenueByCategory, setRevenueByCategory] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
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
    } catch (err) {
      console.error("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-600 mx-auto mb-3 animate-spin" />
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      label: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      Icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      label: "Total Bookings",
      value: stats.totalBookings,
      Icon: ClipboardList,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      label: "Customers",
      value: stats.totalCustomers,
      Icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      label: "Active Services",
      value: `${stats.activeServices}/${stats.totalServices}`,
      Icon: Wrench,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  const statusCards = [
    {
      label: "Pending",
      value: stats.pendingBookings,
      Icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Confirmed",
      value: stats.confirmedBookings,
      Icon: CheckCircle2,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "In Progress",
      value: stats.inProgressBookings,
      Icon: Loader,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Completed",
      value: stats.completedBookings,
      Icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  const maxTrendCount = Math.max(...trends.map((t) => t.count), 1);
  const maxTrendRevenue = Math.max(...trends.map((t) => t.revenue), 1);

  const statusIcon = {
    pending: <Clock className="w-3 h-3 text-amber-500" />,
    confirmed: <CheckCircle2 className="w-3 h-3 text-blue-500" />,
    "in-progress": <Loader className="w-3 h-3 text-violet-500" />,
    completed: <CheckCircle2 className="w-3 h-3 text-emerald-500" />,
    cancelled: <AlertCircle className="w-3 h-3 text-red-500" />,
  };

  const statusColor = {
    pending: "bg-amber-50 text-amber-700",
    confirmed: "bg-blue-50 text-blue-700",
    "in-progress": "bg-violet-50 text-violet-700",
    completed: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-700",
  };

  const getStatusStyle = (status) =>
    ({
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      confirmed: "bg-blue-50 text-blue-700 border-blue-200",
      "in-progress": "bg-violet-50 text-violet-700 border-violet-200",
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    })[status] || "bg-gray-50 text-gray-700 border-gray-200";

  const totalCategoryRevenue =
    revenueByCategory.reduce((s, r) => s + r.revenue, 0) || 1;
  const catColors = {
    maintenance: { bar: "bg-blue-500", text: "text-blue-600" },
    repair: { bar: "bg-red-500", text: "text-red-600" },
    inspection: { bar: "bg-amber-500", text: "text-amber-600" },
    customization: { bar: "bg-violet-500", text: "text-violet-600" },
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Here's what's happening with your business today
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />{" "}
            Live
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ label, value, Icon, color, bg, border, gradient }) => (
          <div
            key={label}
            className={`bg-white rounded-2xl border ${border} p-5 hover:shadow-lg transition-all group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-11 h-11 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Booking Status Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" /> Booking Pipeline
          </h3>
          <button
            onClick={() => navigate("/admin/bookings")}
            className="text-xs text-blue-600 font-semibold hover:text-blue-500 flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statusCards.map(({ label, value, Icon, color, bg }) => (
            <div
              key={label}
              className={`${bg} rounded-xl p-4 text-center hover:scale-[1.02] transition-transform`}
            >
              <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 7-Day Trend Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" /> 7-Day Trends
            </h3>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm" /> Bookings
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />{" "}
                Revenue
              </span>
            </div>
          </div>
          {trends.length > 0 ? (
            <div className="space-y-3">
              {trends.map((day) => (
                <div key={day.date} className="group">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-500 font-medium w-24">
                      {new Date(day.date + "T00:00:00").toLocaleDateString(
                        "en-US",
                        { weekday: "short", month: "short", day: "numeric" },
                      )}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-blue-600 font-bold">
                        {day.count}
                      </span>
                      <span className="text-emerald-600 font-bold">
                        ${day.revenue}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(day.count / maxTrendCount) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(day.revenue / maxTrendRevenue) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              No trend data available
            </div>
          )}
        </div>

        {/* Top Services & Revenue by Category */}
        <div className="space-y-6">
          {/* Top Services */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-amber-500" /> Top Services
            </h3>
            {topServices.length > 0 ? (
              <div className="space-y-3">
                {topServices.map((svc, i) => (
                  <div key={svc._id || i} className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        i === 0
                          ? "bg-amber-100 text-amber-700"
                          : i === 1
                            ? "bg-gray-100 text-gray-600"
                            : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {svc.serviceName || "Unknown"}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {svc.count} bookings
                      </p>
                    </div>
                    <span className="text-sm font-bold text-blue-600">
                      ${svc.revenue}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">
                No service data
              </div>
            )}
          </div>

          {/* Revenue by Category */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-emerald-500" /> Revenue by
              Category
            </h3>
            {revenueByCategory.length > 0 ? (
              <div className="space-y-3">
                {revenueByCategory.map((cat) => {
                  const pct = (
                    (cat.revenue / totalCategoryRevenue) *
                    100
                  ).toFixed(0);
                  const style = catColors[cat._id] || {
                    bar: "bg-gray-500",
                    text: "text-gray-600",
                  };
                  return (
                    <div key={cat._id}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-700 font-semibold capitalize">
                          {cat._id}
                        </span>
                        <span className={`${style.text} font-bold`}>
                          ${cat.revenue} ({pct}%)
                        </span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`${style.bar} h-full rounded-full transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">
                No category data
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Feed & Recent Bookings */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-base font-bold text-gray-900">Activity Feed</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {activityFeed.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No recent activity
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {activityFeed.map((item, i) => (
                  <div
                    key={i}
                    className="px-5 py-3 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {statusIcon[item.status] || (
                          <Activity className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700">
                          <span className="font-semibold">
                            {item.customerName || "Customer"}
                          </span>{" "}
                          booking moved to{" "}
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold capitalize ${statusColor[item.status] || "bg-gray-50 text-gray-600"}`}
                          >
                            {item.status}
                          </span>
                        </p>
                        {item.note && (
                          <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                            {item.note}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-300 mt-1">
                          {new Date(item.timestamp).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-gray-400" />
              <h3 className="text-base font-bold text-gray-900">
                Recent Bookings
              </h3>
            </div>
            <button
              onClick={() => navigate("/admin/bookings")}
              className="text-xs text-blue-600 font-semibold hover:text-blue-500 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {stats.recentBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No recent bookings
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    {["Customer", "Service", "Price", "Status", "Date"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.recentBookings.map((b) => (
                    <tr
                      key={b._id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold text-gray-900">
                          {b.customerId?.name || "N/A"}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {b.customerId?.email || ""}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-700">
                        {b.serviceId?.name || "N/A"}
                      </td>
                      <td className="px-5 py-3 text-sm font-bold text-blue-600">
                        ${b.totalPrice}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border ${getStatusStyle(b.status)}`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400">
                        {new Date(b.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            label: "Manage Bookings",
            desc: "View and update all bookings",
            path: "/admin/bookings",
            Icon: ClipboardList,
            gradient: "from-blue-500 to-indigo-600",
          },
          {
            label: "Manage Services",
            desc: "Add, edit, or remove services",
            path: "/admin/services",
            Icon: Wrench,
            gradient: "from-amber-500 to-orange-600",
          },
          {
            label: "View Customers",
            desc: "See customer list and details",
            path: "/admin/customers",
            Icon: Users,
            gradient: "from-violet-500 to-purple-600",
          },
        ].map(({ label, desc, path, Icon, gradient }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="bg-white rounded-2xl border border-gray-100 p-5 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all group"
          >
            <div
              className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-3 shadow-lg`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">{label}</h4>
            <p className="text-xs text-gray-400 mt-1">{desc}</p>
            <ArrowRight className="w-4 h-4 text-gray-300 mt-3 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
}
