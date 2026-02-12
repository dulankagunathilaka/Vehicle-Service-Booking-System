import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Car,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  Wrench,
  Users,
  ChevronLeft,
  ChevronRight,
  Menu,
  ArrowLeft,
  Bell,
  Search,
  Home,
  ChevronDown,
  Shield,
  Settings,
  Activity,
  Star,
  DollarSign,
  Package,
  CheckCircle2,
  Mail,
  Smartphone,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  {
    path: "/admin",
    label: "Dashboard",
    Icon: LayoutDashboard,
    desc: "Overview & analytics",
  },
  {
    path: "/admin/bookings",
    label: "Bookings",
    Icon: ClipboardList,
    desc: "Manage appointments",
  },
  {
    path: "/admin/services",
    label: "Services",
    Icon: Wrench,
    desc: "Service catalog",
  },
  {
    path: "/admin/customers",
    label: "Customers",
    Icon: Users,
    desc: "Customer management",
  },
  {
    path: "/admin/reviews",
    label: "Reviews",
    Icon: Star,
    desc: "Customer feedback",
  },
  {
    path: "/admin/billing",
    label: "Billing",
    Icon: DollarSign,
    desc: "Invoices & payments",
  },
  {
    path: "/admin/notifications",
    label: "Notifications",
    Icon: Bell,
    desc: "SMS & email alerts",
  },
  {
    path: "/admin/inventory",
    label: "Inventory",
    Icon: Package,
    desc: "Parts & supplies",
  },
];

const breadcrumbMap = {
  "/admin": [{ label: "Dashboard" }],
  "/admin/bookings": [
    { label: "Dashboard", path: "/admin" },
    { label: "Bookings" },
  ],
  "/admin/services": [
    { label: "Dashboard", path: "/admin" },
    { label: "Services" },
  ],
  "/admin/customers": [
    { label: "Dashboard", path: "/admin" },
    { label: "Customers" },
  ],
  "/admin/reviews": [
    { label: "Dashboard", path: "/admin" },
    { label: "Reviews" },
  ],
  "/admin/billing": [
    { label: "Dashboard", path: "/admin" },
    { label: "Billing" },
  ],
  "/admin/notifications": [
    { label: "Dashboard", path: "/admin" },
    { label: "Notifications" },
  ],
  "/admin/inventory": [
    { label: "Dashboard", path: "/admin" },
    { label: "Inventory" },
  ],
};

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const notifCategoryColors = {
  "booking-confirmation": "bg-emerald-50 text-emerald-600",
  "booking-update": "bg-blue-50 text-blue-600",
  "booking-reminder": "bg-amber-50 text-amber-600",
  "booking-cancelled": "bg-red-50 text-red-600",
  "invoice-sent": "bg-purple-50 text-purple-600",
  "payment-received": "bg-green-50 text-green-600",
  "service-complete": "bg-cyan-50 text-cyan-600",
  general: "bg-gray-50 text-gray-600",
};

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

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setNotifLoading(true);
    try {
      const res = await fetch(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setNotifications(data.data || []);
    } catch (err) {
      console.error("Fetch notifications failed:", err);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/notifications/${id}/admin-read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/notifications/admin-mark-all-read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotifClick = (n) => {
    if (!n.isRead) markAsRead(n._id);
    setShowNotifPanel(false);
    const cat = n.category || "";
    if (cat.startsWith("invoice") || cat.startsWith("payment")) {
      navigate("/admin/billing");
    } else if (cat.startsWith("booking") || cat === "service-complete") {
      navigate("/admin/bookings");
    } else {
      navigate("/admin/notifications");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const crumbs = breadcrumbMap[location.pathname] || [{ label: "Admin" }];
  const currentPage = navItems.find((n) => n.path === location.pathname);
  const canGoBack = location.pathname !== "/admin";

  return (
    <div className="min-h-screen flex bg-gray-50">

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >

        <div className="h-16 flex items-center px-4 border-b border-white/10 flex-shrink-0">
          {collapsed ? (
            <span className="text-lg font-extrabold text-white mx-auto">
              A<span className="text-blue-400">S</span>
            </span>
          ) : (
            <div className="overflow-hidden">
              <h1 className="text-lg font-extrabold text-white leading-tight">
                Auto<span className="text-blue-400">Serve</span>
              </h1>
              <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">
                Admin Panel
              </p>
            </div>
          )}
        </div>

        <div className="px-3 pt-4 pb-2">
          {!collapsed && (
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold px-3 mb-2">
              Navigation
            </p>
          )}
          <button
            onClick={() => navigate("/")}
            title={collapsed ? "Visit Site" : undefined}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-gray-500 hover:text-blue-400 hover:bg-white/5 transition-all"
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Visit Site</span>}
          </button>
        </div>

        <nav className="flex-1 py-2 px-3 space-y-1 overflow-y-auto">
          {!collapsed && (
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold px-3 mb-2 mt-1">
              Management
            </p>
          )}
          {navItems.map(({ path, label, Icon, desc }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => {
                  navigate(path);
                  setMobileOpen(false);
                }}
                title={collapsed ? label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <div className="text-left flex-1 min-w-0">
                    <p className="truncate">{label}</p>
                    <p
                      className={`text-[10px] truncate ${active ? "text-blue-200" : "text-gray-600 group-hover:text-gray-400"}`}
                    >
                      {desc}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="mx-3 mb-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                System Online
              </span>
            </div>
            <p className="text-[10px] text-gray-500">
              All services operational
            </p>
          </div>
        )}

        <div className="border-t border-white/10 p-3 space-y-2 flex-shrink-0">
          {!collapsed && (
            <div className="px-3 py-2 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {(user.name || "A").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user.name || "Admin"}
                </p>
                <p className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" />
                  Administrator
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Logout"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center py-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">

        <header className="h-14 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-4 lg:px-6 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden mr-3 p-2 rounded-xl hover:bg-gray-100 transition"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {canGoBack && (
            <button
              onClick={() => navigate("/admin")}
              className="mr-3 p-2 rounded-xl hover:bg-gray-100 transition-all text-gray-400 hover:text-blue-600"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <nav className="flex items-center gap-1.5 text-xs flex-1 min-w-0">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3 h-3 text-gray-300" />}
                {c.path ? (
                  <button
                    onClick={() => navigate(c.path)}
                    className="text-gray-400 hover:text-blue-600 font-medium transition"
                  >
                    {c.label}
                  </button>
                ) : (
                  <span className="text-gray-800 font-bold">{c.label}</span>
                )}
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-2">

            <span className="hidden md:block text-[11px] text-gray-400 font-medium tabular-nums mr-2">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>

            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifPanel(!showNotifPanel);
                  setShowUserMenu(false);
                }}
                className="relative p-2 rounded-xl hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifPanel && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifPanel(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">

                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <span className="w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifPanel(false)}
                          className="p-1 rounded-lg hover:bg-gray-100 transition"
                        >
                          <X className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="text-center py-10">
                          <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                          <p className="text-xs text-gray-400">
                            No notifications
                          </p>
                        </div>
                      ) : (
                        <ul>
                          {notifications.slice(0, 15).map((n) => {
                            const catColor =
                              notifCategoryColors[n.category] ||
                              notifCategoryColors.general;
                            return (
                              <li
                                key={n._id}
                                onClick={() => handleNotifClick(n)}
                                className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 last:border-0 group ${
                                  n.isRead
                                    ? "hover:bg-gray-50"
                                    : "bg-indigo-50/40 hover:bg-indigo-50/70"
                                }`}
                              >
                                <div className="relative flex-shrink-0 mt-0.5">
                                  <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${catColor}`}
                                  >
                                    {n.type === "sms" ? (
                                      <Smartphone className="w-3.5 h-3.5" />
                                    ) : (
                                      <Mail className="w-3.5 h-3.5" />
                                    )}
                                  </div>
                                  {!n.isRead && (
                                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-xs leading-snug truncate ${
                                      n.isRead
                                        ? "text-gray-600"
                                        : "text-gray-800 font-semibold"
                                    }`}
                                  >
                                    {n.subject}
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                                    {n.recipientId?.name || "Unknown"} ·{" "}
                                    {timeAgo(n.createdAt)}
                                  </p>
                                </div>
                                {!n.isRead && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(n._id);
                                    }}
                                    title="Mark as read"
                                    className="shrink-0 p-1 rounded-lg text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 transition opacity-0 group-hover:opacity-100"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>

                    <div className="border-t border-gray-100 px-4 py-2.5">
                      <button
                        onClick={() => {
                          setShowNotifPanel(false);
                          navigate("/admin/notifications");
                        }}
                        className="w-full text-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 py-1 rounded-lg hover:bg-indigo-50 transition"
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">
                  {(user.name || "A").charAt(0).toUpperCase()}
                </div>
                <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
              </button>
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                    <div className="px-3 py-2 border-b border-gray-50">
                      <p className="text-xs font-bold text-gray-900">
                        {user.name || "Admin"}
                      </p>
                      <p className="text-[10px] text-gray-400">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigate("/");
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition"
                    >
                      <Home className="w-3.5 h-3.5" />
                      Visit Site
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
