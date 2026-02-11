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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  // Scroll detection for navbar style + active section
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      const ids = ["services", "features"];
      let found = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.top <= 100 && r.bottom > 100) found = id;
        }
      }
      setActiveSection(found);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { setShowUserMenu(false); setMobileOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock body when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const scrollTo = useCallback((id) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const navLinks = [
    { label: "Services", id: "services" },
    { label: "Features", id: "features" },
    { label: "About", href: "/learn-more" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ══════════ NAVBAR ══════════ */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/90 backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-b border-gray-200/60"
            : "bg-transparent"
        }`}
      >
        {/* Gradient accent line */}
        <div className={`h-[2px] bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`} />

        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 lg:h-[68px]">
          {/* ── Logo ── */}
          <a href="/" className="flex items-center gap-2.5 group shrink-0">
            <img
              src="/favicon.svg"
              alt="AutoServe"
              className={`w-9 h-9 rounded-lg transition-all duration-300 group-hover:scale-105 ${
                scrolled ? "shadow-sm" : "shadow-md shadow-white/10 ring-1 ring-white/20"
              }`}
            />
            <div className="hidden sm:block">
              <h1 className={`text-[17px] font-extrabold leading-none tracking-tight transition-colors duration-300 ${scrolled ? "text-gray-900" : "text-white"}`}>
                AutoServe
              </h1>
              <p className={`text-[8px] font-bold tracking-[0.18em] uppercase mt-0.5 transition-colors duration-300 ${scrolled ? "text-blue-600" : "text-blue-300"}`}>
                Vehicle Service Pro
              </p>
            </div>
          </a>

          {/* ── Center nav links (desktop) ── */}
          <div className="hidden md:flex items-center">
            <div className={`flex items-center gap-0.5 p-1 rounded-full transition-all duration-300 ${
              scrolled ? "bg-gray-100/70" : "bg-white/[0.07] backdrop-blur-sm"
            }`}>
              {navLinks.map((link) => {
                const active = link.id && activeSection === link.id;
                return (
                  <button
                    key={link.label}
                    onClick={() => link.id ? scrollTo(link.id) : (window.location.href = link.href)}
                    className={`relative px-4 py-1.5 text-[13px] font-semibold rounded-full transition-all duration-300 ${
                      active
                        ? scrolled ? "bg-white text-blue-700 shadow-sm" : "bg-white/20 text-white"
                        : scrolled ? "text-gray-500 hover:text-gray-900 hover:bg-white/60" : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Right side ── */}
          <div className="flex items-center gap-2">
            {/* Book Now CTA */}
            {(!isAuthenticated || !isAdmin) && (
              <button
                onClick={() => (window.location.href = "/booking")}
                className={`hidden md:flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold rounded-full transition-all duration-300 hover:-translate-y-[1px] ${
                  scrolled
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 hover:shadow-md"
                    : "bg-white/95 text-gray-900 shadow-md shadow-black/5 hover:bg-white"
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                Book Now
              </button>
            )}

            {isAuthenticated ? (
              /* ── User avatar dropdown ── */
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full transition-all duration-300 ${
                    scrolled ? "hover:bg-gray-100" : "hover:bg-white/10"
                  } ${showUserMenu ? (scrolled ? "bg-gray-100" : "bg-white/10") : ""}`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow ring-2 ring-white/40">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span className={`text-[13px] font-semibold hidden sm:block transition-colors duration-300 ${scrolled ? "text-gray-700" : "text-white"}`}>
                    {user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className={`w-3 h-3 transition-all duration-300 ${scrolled ? "text-gray-400" : "text-gray-300"} ${showUserMenu ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown */}
                <div className={`absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl shadow-black/8 border border-gray-200/80 overflow-hidden transition-all duration-200 origin-top-right ${
                  showUserMenu ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                }`}>
                  {/* User header */}
                  <div className="px-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm border border-white/30">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                        <p className="text-[11px] text-blue-200 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  {/* Items */}
                  <div className="p-1.5">
                    <button
                      onClick={() => { setShowUserMenu(false); window.location.href = isAdmin ? "/admin" : "/dashboard"; }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-500" />
                      {isAdmin ? "Admin Panel" : "My Dashboard"}
                    </button>
                    {!isAdmin && (
                      <button
                        onClick={() => { setShowUserMenu(false); window.location.href = "/booking"; }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-700 rounded-lg transition"
                      >
                        <CalendarCheck className="w-4 h-4 text-violet-500" />
                        Book a Service
                      </button>
                    )}
                  </div>
                  <div className="border-t border-gray-100 p-1.5">
                    <button
                      onClick={() => { setShowUserMenu(false); logout(); window.location.href = "/"; }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
                {showUserMenu && <div className="fixed inset-0 z-[-1]" onClick={() => setShowUserMenu(false)} />}
              </div>
            ) : (
              /* ── Guest ── */
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => (window.location.href = "/signin")}
                  className={`px-4 py-2 text-[13px] font-semibold rounded-full transition-all duration-300 ${
                    scrolled ? "text-gray-600 hover:text-blue-600 hover:bg-blue-50" : "text-gray-200 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => (window.location.href = "/signup")}
                  className={`px-5 py-2 text-[13px] font-bold rounded-full transition-all duration-300 hover:-translate-y-[1px] ${
                    scrolled
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700"
                      : "bg-white/95 text-gray-900 shadow-md shadow-black/5 hover:bg-white"
                  }`}
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors duration-300 ${scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"}`}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* ── Mobile menu ── */}
        <div className={`md:hidden fixed inset-x-0 top-[calc(4rem+2px)] bottom-0 z-40 transition-all duration-300 ${mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setMobileOpen(false)} />
          <div className={`relative mx-3 mt-1 bg-white rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden transition-all duration-300 ${mobileOpen ? "translate-y-0" : "-translate-y-3"}`}>
            <div className="p-2 space-y-0.5">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => link.id ? scrollTo(link.id) : (window.location.href = link.href)}
                  className={`w-full text-left px-4 py-3 text-sm font-semibold rounded-xl transition ${
                    link.id && activeSection === link.id ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
            <div className="border-t border-gray-100 p-3 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                      <p className="text-[11px] text-gray-400">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setMobileOpen(false); window.location.href = isAdmin ? "/admin" : "/dashboard"; }}
                    className="w-full py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-sm flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" /> {isAdmin ? "Admin Panel" : "Dashboard"}
                  </button>
                  <button
                    onClick={() => { setMobileOpen(false); logout(); window.location.href = "/"; }}
                    className="w-full py-2.5 text-red-500 text-sm font-semibold rounded-xl hover:bg-red-50 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => (window.location.href = "/signin")}
                    className="w-full py-2.5 text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => (window.location.href = "/signup")}
                    className="w-full py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-sm flex items-center justify-center gap-2"
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section — pushed under the fixed navbar so hero bg shows through transparent nav */}
      <section className="relative overflow-hidden -mt-[4.25rem] lg:-mt-[4.5rem] pt-[4.25rem] lg:pt-[4.5rem]">
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
