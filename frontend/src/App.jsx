import { useState, useEffect, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import {
  Car,
  Wrench,
  Cog,
  Search,
  Sparkles,
  CalendarCheck,
  ShieldCheck,
  Bell,
  ArrowRight,
  Users,
  MapPin,
  ClipboardCheck,
  Headphones,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  Phone,
} from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import BookingPage from "./pages/Booking";
import CustomerDashboard from "./pages/CustomerDashboard";
import LearnMore from "./pages/LearnMore";
import AdminLayout from "./components/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminServices from "./pages/admin/AdminServices";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminBilling from "./pages/admin/AdminBilling";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminInventory from "./pages/admin/AdminInventory";

// Redirect logged-in users away from signin/signup
function GuestRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated)
    return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
  return children;
}

// Protect customer routes
function CustomerGuard({ children }) {
  const { isAuthenticated, isCustomer, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  if (!isCustomer) return <Navigate to="/admin" replace />;
  return children;
}

// Protect admin routes
function AdminGuard({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/learn-more" element={<LearnMore />} />
            <Route
              path="/signup"
              element={
                <GuestRoute>
                  <SignUp />
                </GuestRoute>
              }
            />
            <Route
              path="/signin"
              element={
                <GuestRoute>
                  <SignIn />
                </GuestRoute>
              }
            />
            <Route
              path="/booking"
              element={
                <CustomerGuard>
                  <BookingPage />
                </CustomerGuard>
              }
            />
            <Route
              path="/dashboard"
              element={
                <CustomerGuard>
                  <CustomerDashboard />
                </CustomerGuard>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminOverview />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <AdminGuard>
                  <AdminBookings />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/services"
              element={
                <AdminGuard>
                  <AdminServices />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <AdminGuard>
                  <AdminCustomers />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <AdminGuard>
                  <AdminReviews />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/billing"
              element={
                <AdminGuard>
                  <AdminBilling />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <AdminGuard>
                  <AdminNotifications />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/inventory"
              element={
                <AdminGuard>
                  <AdminInventory />
                </AdminGuard>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

const homeServices = [
  {
    Icon: Wrench,
    title: "Regular Maintenance",
    description: "Oil changes, filter replacements, fluid checks",
    accent: "blue",
  },
  {
    Icon: Cog,
    title: "Repair Services",
    description: "Engine repairs, electrical issues, brake service",
    accent: "indigo",
  },
  {
    Icon: Search,
    title: "Vehicle Inspection",
    description: "Comprehensive diagnostics, health reports",
    accent: "amber",
  },
  {
    Icon: Sparkles,
    title: "Customization",
    description: "Upgrades, detailing, interior modifications",
    accent: "violet",
  },
];

const serviceAccent = {
  blue: {
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    border: "border-blue-200 hover:border-blue-400",
  },
  indigo: {
    bg: "bg-indigo-50",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    border: "border-indigo-200 hover:border-indigo-400",
  },
  amber: {
    bg: "bg-amber-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    border: "border-amber-200 hover:border-amber-400",
  },
  violet: {
    bg: "bg-violet-50",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    border: "border-violet-200 hover:border-violet-400",
  },
};

const features = [
  {
    Icon: CalendarCheck,
    title: "Easy Booking",
    description:
      "Select your service, choose a convenient date and time slot, and confirm your booking in just three clicks.",
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    Icon: ShieldCheck,
    title: "Secure & Safe",
    description:
      "Your personal data is encrypted and protected. We use industry-standard security protocols for all transactions.",
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    Icon: Bell,
    title: "Real-time Updates",
    description:
      "Get instant notifications about your booking status, service updates, and completion confirmations.",
    bg: "bg-violet-50",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
];

const stats = [
  { Icon: Users, value: "5,000+", label: "Happy Customers" },
  { Icon: MapPin, value: "500+", label: "Service Centers" },
  { Icon: ClipboardCheck, value: "50k+", label: "Bookings Completed" },
  { Icon: Headphones, value: "24/7", label: "Customer Support" },
];

function HomePage() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  // Scroll-aware navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Detect active section
      const sections = ["features", "services"];
      let current = "";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom > 120) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowUserMenu(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const smoothScroll = useCallback((id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const navLinks = [
    { label: "Services", href: "services" },
    { label: "Features", href: "features" },
    { label: "About", href: "/learn-more", isPage: true },
    { label: "Contact", href: "footer", scrollTo: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ═══════════════════ ADVANCED NAVBAR ═══════════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-black/[0.04] border-b border-gray-100/80"
            : "bg-transparent"
        }`}
      >
        {/* Top accent bar */}
        <div
          className={`h-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 transition-opacity duration-500 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        />

        <nav className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-[72px]">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3 group relative z-10">
              <div className="relative">
                <img
                  src="/favicon.svg"
                  alt="AutoServe"
                  className={`w-10 h-10 rounded-xl transition-all duration-300 ${
                    scrolled
                      ? "shadow-md"
                      : "shadow-lg shadow-white/20 ring-1 ring-white/20"
                  } group-hover:scale-105`}
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <h1
                  className={`text-lg font-extrabold leading-tight tracking-tight transition-colors duration-300 ${
                    scrolled ? "text-gray-900" : "text-white"
                  }`}
                >
                  AutoServe
                </h1>
                <p
                  className={`text-[9px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 ${
                    scrolled ? "text-blue-600" : "text-blue-300"
                  }`}
                >
                  Vehicle Service Pro
                </p>
              </div>
            </a>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center">
              <div
                className={`flex items-center gap-1 px-2 py-1.5 rounded-2xl transition-all duration-300 ${
                  scrolled
                    ? "bg-gray-50/80"
                    : "bg-white/[0.08] backdrop-blur-sm"
                }`}
              >
                {navLinks.map((link) => {
                  const isActive = !link.isPage && activeSection === link.href;
                  return (
                    <button
                      key={link.label}
                      onClick={() => {
                        if (link.isPage) {
                          window.location.href = link.href;
                        } else {
                          smoothScroll(link.href);
                        }
                      }}
                      className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                        isActive
                          ? scrolled
                            ? "text-blue-700 bg-blue-50"
                            : "text-white bg-white/20"
                          : scrolled
                            ? "text-gray-500 hover:text-gray-900 hover:bg-gray-100/80"
                            : "text-gray-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Side — CTA + User */}
            <div className="flex items-center gap-2 sm:gap-3 relative z-10">
              {/* Book Now CTA — always visible on desktop */}
              {(!isAuthenticated || !isAdmin) && (
                <button
                  onClick={() => (window.location.href = "/booking")}
                  className={`hidden md:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                    scrolled
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5"
                      : "bg-white text-gray-900 shadow-lg shadow-black/10 hover:bg-blue-50 hover:-translate-y-0.5"
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  Book Now
                </button>
              )}

              {isAuthenticated ? (
                /* ── User Avatar Menu ── */
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-300 group ${
                      scrolled ? "hover:bg-gray-50" : "hover:bg-white/10"
                    } ${showUserMenu ? (scrolled ? "bg-gray-50" : "bg-white/10") : ""}`}
                  >
                    <div className="relative">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white/50 group-hover:ring-blue-300/50 transition-all">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                    </div>
                    <span
                      className={`text-sm font-semibold hidden sm:inline transition-colors duration-300 ${
                        scrolled ? "text-gray-700" : "text-white"
                      }`}
                    >
                      {user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-all duration-300 ${
                        scrolled ? "text-gray-400" : "text-gray-300"
                      } ${showUserMenu ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* User Dropdown */}
                  <div
                    className={`absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden transition-all duration-200 origin-top-right ${
                      showUserMenu
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    }`}
                  >
                    {/* Profile header */}
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-lg font-bold border border-white/30">
                          {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">
                            {user?.name}
                          </p>
                          <p className="text-xs text-blue-100 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 px-2.5 py-1 bg-white/15 rounded-lg inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                        <ShieldCheck className="w-3 h-3" />
                        {isAdmin ? "Administrator" : "Customer"}
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          window.location.href = isAdmin
                            ? "/admin"
                            : "/dashboard";
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all group"
                      >
                        <div className="w-8 h-8 bg-blue-50 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                          <LayoutDashboard className="w-4 h-4 text-blue-500" />
                        </div>
                        {isAdmin ? "Admin Panel" : "My Dashboard"}
                      </button>
                      {!isAdmin && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            window.location.href = "/booking";
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 rounded-xl transition-all group"
                        >
                          <div className="w-8 h-8 bg-violet-50 group-hover:bg-violet-100 rounded-lg flex items-center justify-center transition-colors">
                            <CalendarCheck className="w-4 h-4 text-violet-500" />
                          </div>
                          Book a Service
                        </button>
                      )}
                    </div>

                    <div className="p-2 pt-0">
                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                            window.location.href = "/";
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-all group"
                        >
                          <div className="w-8 h-8 bg-red-50 group-hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors">
                            <LogOut className="w-4 h-4 text-red-400" />
                          </div>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Backdrop to close menu */}
                  {showUserMenu && (
                    <div
                      className="fixed inset-0 z-[-1]"
                      onClick={() => setShowUserMenu(false)}
                    />
                  )}
                </div>
              ) : (
                /* ── Guest buttons ── */
                <>
                  <button
                    onClick={() => (window.location.href = "/signin")}
                    className={`hidden md:inline-flex px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                      scrolled
                        ? "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        : "text-gray-200 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => (window.location.href = "/signup")}
                    className={`hidden md:inline-flex px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                      scrolled
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5"
                        : "bg-white text-gray-900 shadow-lg shadow-black/10 hover:bg-blue-50 hover:-translate-y-0.5"
                    }`}
                  >
                    Get Started
                  </button>
                </>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 rounded-xl transition-all duration-300 ${
                  scrolled
                    ? "text-gray-600 hover:bg-gray-100"
                    : "text-white hover:bg-white/10"
                }`}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* ═══════════════════ MOBILE MENU ═══════════════════ */}
        <div
          className={`md:hidden fixed inset-0 top-[calc(4rem+2px)] z-40 transition-all duration-300 ${
            mobileMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu panel */}
          <div
            className={`relative bg-white m-3 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 ${
              mobileMenuOpen
                ? "translate-y-0 opacity-100"
                : "-translate-y-4 opacity-0"
            }`}
          >
            {/* Nav links */}
            <div className="p-3 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => {
                    if (link.isPage) {
                      window.location.href = link.href;
                    } else {
                      smoothScroll(link.href);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    activeSection === link.href
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                  {activeSection === link.href && (
                    <span className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Mobile user section */}
            <div className="p-3 pt-0">
              <div className="border-t border-gray-100 pt-3 space-y-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {user?.name}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        window.location.href = isAdmin
                          ? "/admin"
                          : "/dashboard";
                      }}
                      className="w-full px-4 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {isAdmin ? "Admin Panel" : "My Dashboard"}
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                        window.location.href = "/";
                      }}
                      className="w-full px-4 py-2.5 text-red-500 text-sm font-semibold rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => (window.location.href = "/signin")}
                      className="w-full px-4 py-3 text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => (window.location.href = "/signup")}
                      className="w-full px-4 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed navbar */}
      <div className="h-16 md:h-[72px]" />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
        </div>
        <div className="relative container mx-auto max-w-6xl px-4 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-blue-200 mb-8">
                <Sparkles className="w-4 h-4" />
                <span>Trusted by 5,000+ vehicle owners</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
                Smart Vehicle
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Service Booking
                </span>
              </h2>
              <p className="text-lg text-gray-300 mb-10 leading-relaxed max-w-lg">
                Book your vehicle service appointments online in seconds. No
                more phone calls, no more waiting. AutoServe connects you with
                the best service centers instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => (window.location.href = "/booking")}
                  className="group px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2"
                >
                  Book Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => (window.location.href = "/learn-more")}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition"
                >
                  Learn More
                </button>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="w-72 h-72 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-2xl">
                  <div className="w-56 h-56 bg-gradient-to-br from-blue-600/30 to-blue-800/30 rounded-2xl border border-white/10 flex items-center justify-center">
                    <Car className="w-24 h-24 text-white/80" />
                  </div>
                </div>
                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="text-white text-sm font-medium">
                      Certified
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-blue-400" />
                    <span className="text-white text-sm font-medium">
                      Instant Book
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold text-blue-600 tracking-wider uppercase mb-3">
              Why Choose Us
            </p>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AutoServe
            </h3>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Experience the future of vehicle service booking
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`${feature.bg} rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-gray-200`}
              >
                <div
                  className={`w-14 h-14 ${feature.iconBg} rounded-xl flex items-center justify-center mb-5`}
                >
                  <feature.Icon className={`w-7 h-7 ${feature.iconColor}`} />
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold text-blue-600 tracking-wider uppercase mb-3">
              What We Offer
            </p>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h3>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Complete vehicle maintenance solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {homeServices.map((service) => {
              const colors = serviceAccent[service.accent];
              return (
                <div
                  key={service.title}
                  className={`bg-white rounded-2xl p-7 border-2 ${colors.border} transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
                >
                  <div
                    className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center mb-5`}
                  >
                    <service.Icon className={`w-6 h-6 ${colors.iconColor}`} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">
                    {service.title}
                  </h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-20 w-64 h-64 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-400 rounded-full blur-3xl" />
        </div>
        <div className="relative container mx-auto max-w-5xl px-4 py-20">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="w-14 h-14 mx-auto mb-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <stat.Icon className="w-7 h-7 text-blue-300" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold text-blue-600 tracking-wider uppercase mb-3">
            Get Started
          </p>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Book Your Service?
          </h3>
          <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
            Join thousands of satisfied customers who have simplified their
            vehicle maintenance with AutoServe.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => (window.location.href = "/booking")}
              className="group px-10 py-4 bg-blue-600 text-white font-semibold text-base rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 flex items-center gap-2"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => (window.location.href = "/learn-more")}
              className="px-10 py-4 text-blue-600 font-semibold text-base rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-14 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Car className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold text-lg">AutoServe</span>
              </div>
              <p className="text-sm leading-relaxed">
                Smart vehicle service booking platform built for modern vehicle
                owners.
              </p>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">
                Quick Links
              </h5>
              <ul className="text-sm space-y-2.5">
                <li>
                  <a href="/" className="hover:text-white transition">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-white transition">
                    Services
                  </a>
                </li>
                <li>
                  <a href="/learn-more" className="hover:text-white transition">
                    About
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">
                Legal
              </h5>
              <ul className="text-sm space-y-2.5">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">
                Contact
              </h5>
              <p className="text-sm mb-1">support@autoserve.com</p>
              <p className="text-sm">+1 (555) 123-4567</p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-xs text-gray-500">
            <p>Copyright 2026 AutoServe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
