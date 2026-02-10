import { useState } from "react";
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
} from "lucide-react";

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
};

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const crumbs = breadcrumbMap[location.pathname] || [{ label: "Admin" }];
  const currentPage = navItems.find((n) => n.path === location.pathname);
  const canGoBack = location.pathname !== "/admin";

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/10 flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Car className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="ml-3 overflow-hidden">
              <h1 className="text-sm font-bold leading-tight">AutoServe</h1>
              <p className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">
                Admin Panel
              </p>
            </div>
          )}
        </div>

        {/* Quick nav to site */}
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

        {/* Nav */}
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

        {/* Status indicator */}
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

        {/* User & collapse */}
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

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-4 lg:px-6 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden mr-3 p-2 rounded-xl hover:bg-gray-100 transition"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Back button */}
          {canGoBack && (
            <button
              onClick={() => navigate("/admin")}
              className="mr-3 p-2 rounded-xl hover:bg-gray-100 transition-all text-gray-400 hover:text-blue-600"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {/* Breadcrumbs */}
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

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Live clock */}
            <span className="hidden md:block text-[11px] text-gray-400 font-medium tabular-nums mr-2">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition text-gray-400 hover:text-gray-600">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User dropdown */}
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

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
