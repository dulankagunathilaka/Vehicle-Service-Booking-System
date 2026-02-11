import { useState, useEffect, useRef } from "react";
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
  Star,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Quote,
  Gauge,
  Zap,
  Timer,
  Activity,
  TrendingUp,
  CircleCheck,
} from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import BookingPage from "./pages/Booking";
import CustomerDashboard from "./pages/CustomerDashboard";
import PaymentsPage from "./pages/Payments";
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

// Layout wrapper that includes the shared Navbar
function WithNavbar({ children, transparent }) {
  return (
    <>
      <Navbar transparent={transparent} />
      {children}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <Routes>
            <Route
              path="/"
              element={
                <WithNavbar transparent>
                  <HomePage />
                </WithNavbar>
              }
            />
            <Route
              path="/learn-more"
              element={
                <WithNavbar>
                  <LearnMore />
                </WithNavbar>
              }
            />
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
                  <WithNavbar>
                    <BookingPage />
                  </WithNavbar>
                </CustomerGuard>
              }
            />
            <Route
              path="/dashboard"
              element={
                <CustomerGuard>
                  <WithNavbar>
                    <CustomerDashboard />
                  </WithNavbar>
                </CustomerGuard>
              }
            />
            <Route
              path="/payments"
              element={
                <CustomerGuard>
                  <WithNavbar>
                    <PaymentsPage />
                  </WithNavbar>
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

// Animated counter hook
function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const num = parseInt(target.replace(/[^0-9]/g, ""), 10);
          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            setCount(Math.floor(progress * num));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  const suffix = target.replace(/[0-9,]/g, "");
  const formatted = count.toLocaleString() + suffix;
  return { ref, formatted };
}

function AnimatedStat({ Icon, value, label }) {
  const { ref, formatted } = useCountUp(value);
  return (
    <div ref={ref} className="text-center group">
      <div className="w-14 h-14 mx-auto mb-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-7 h-7 text-blue-300" />
      </div>
      <div className="text-3xl font-bold text-white mb-1">{formatted}</div>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

const howItWorks = [
  {
    step: 1,
    Icon: Search,
    title: "Choose Service",
    desc: "Browse our range of services and pick what your vehicle needs.",
  },
  {
    step: 2,
    Icon: CalendarCheck,
    title: "Pick Date & Time",
    desc: "Select a convenient time slot that fits your schedule.",
  },
  {
    step: 3,
    Icon: CheckCircle,
    title: "Get Confirmed",
    desc: "Receive instant confirmation and real-time status updates.",
  },
];

// Typing effect hook
function useTypingEffect(
  words,
  typingSpeed = 100,
  deleteSpeed = 60,
  pauseTime = 2000,
) {
  const [text, setText] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    const word = words[wordIdx];
    const timer = setTimeout(
      () => {
        if (!isDeleting) {
          setText(word.substring(0, text.length + 1));
          if (text.length + 1 === word.length) {
            setTimeout(() => setIsDeleting(true), pauseTime);
          }
        } else {
          setText(word.substring(0, text.length - 1));
          if (text.length === 0) {
            setIsDeleting(false);
            setWordIdx((prev) => (prev + 1) % words.length);
          }
        }
      },
      isDeleting ? deleteSpeed : typingSpeed,
    );
    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIdx, words, typingSpeed, deleteSpeed, pauseTime]);
  return text;
}

// Testimonials data
const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Toyota Camry Owner",
    text: "AutoServe made booking my car service incredibly easy. I got confirmation within seconds and real-time updates throughout.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Honda Civic Owner",
    text: "The best vehicle service platform I've used. Transparent pricing, certified mechanics, and the booking process is seamless.",
    rating: 5,
  },
  {
    name: "Priya Patel",
    role: "BMW 3 Series Owner",
    text: "I love the real-time tracking feature. I always know exactly what stage my vehicle is at. Highly recommended!",
    rating: 5,
  },
];

// Live activity feed for hero
const liveActivities = [
  {
    text: "Oil Change completed",
    vehicle: "Toyota Camry",
    time: "Just now",
    Icon: CheckCircle,
    color: "text-emerald-400",
  },
  {
    text: "Brake inspection started",
    vehicle: "Honda Civic",
    time: "2 min ago",
    Icon: Activity,
    color: "text-amber-400",
  },
  {
    text: "New booking confirmed",
    vehicle: "BMW X5",
    time: "5 min ago",
    Icon: CalendarCheck,
    color: "text-blue-400",
  },
  {
    text: "Diagnostics complete",
    vehicle: "Ford Focus",
    time: "8 min ago",
    Icon: Gauge,
    color: "text-violet-400",
  },
];

function HomePage() {
  const typedWord = useTypingEffect(
    ["Service Booking", "Maintenance", "Inspections", "Repairs"],
    90,
    50,
    1800,
  );
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [liveIdx, setLiveIdx] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const t = setInterval(
      () => setActiveTestimonial((p) => (p + 1) % testimonials.length),
      5000,
    );
    return () => clearInterval(t);
  }, []);

  // Cycle live activity
  useEffect(() => {
    const t = setInterval(
      () => setLiveIdx((p) => (p + 1) % liveActivities.length),
      3000,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section className="relative overflow-hidden -mt-[4.25rem] lg:-mt-[4.5rem] pt-[4.25rem] lg:pt-[4.5rem]">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/3 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative container mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* ── Left ── */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/[0.07] border border-white/10 rounded-full text-sm text-blue-300 mb-6">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span>Trusted by 5,000+ vehicle owners</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-white mb-5 leading-[1.12] tracking-tight">
                Smart Vehicle
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  {typedWord}
                </span>
                <span className="animate-blink text-blue-400">|</span>
              </h1>

              <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-8 max-w-md">
                Book service appointments in seconds. No calls, no waiting.
                AutoServe connects you with certified service centers instantly.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <button
                  onClick={() => (window.location.href = "/booking")}
                  className="group px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2"
                >
                  Book a Service
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => (window.location.href = "/learn-more")}
                  className="px-7 py-3.5 bg-white/[0.07] hover:bg-white/[0.12] text-white font-semibold text-sm rounded-xl border border-white/10 transition-all"
                >
                  Learn More
                </button>
              </div>

              {/* Trust row */}
              <div className="flex flex-wrap items-center gap-5 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Certified Centers</span>
                </div>
                <div className="w-px h-4 bg-white/10 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Fast Turnaround</span>
                </div>
                <div className="w-px h-4 bg-white/10 hidden sm:block" />
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>4.9 Rating</span>
                </div>
              </div>
            </div>

            {/* ── Right — Live Service Preview ── */}
            <div className="hidden md:block">
              <div className="relative">
                {/* Main card */}
                <div className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">
                          Live Activity
                        </p>
                        <p className="text-gray-500 text-xs">
                          Real-time updates
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-emerald-400 text-[11px] font-medium">
                        Live
                      </span>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-2.5 mb-5">
                    {[
                      {
                        label: "Active",
                        val: "24",
                        color: "text-blue-400",
                        bg: "bg-blue-500/10",
                      },
                      {
                        label: "In Progress",
                        val: "8",
                        color: "text-amber-400",
                        bg: "bg-amber-500/10",
                      },
                      {
                        label: "Done Today",
                        val: "47",
                        color: "text-emerald-400",
                        bg: "bg-emerald-500/10",
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className={`${s.bg} rounded-xl p-3 text-center`}
                      >
                        <p className={`text-lg font-bold ${s.color}`}>
                          {s.val}
                        </p>
                        <p className="text-gray-500 text-[10px] mt-0.5">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Live feed — cycling */}
                  <div className="space-y-2">
                    {liveActivities.map((item, idx) => {
                      const isActive = idx === liveIdx;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-3 rounded-xl p-2.5 transition-all duration-500 ${
                            isActive
                              ? "bg-white/[0.07] border border-white/10"
                              : "opacity-40"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isActive ? "bg-white/[0.1]" : "bg-transparent"
                            }`}
                          >
                            <item.Icon className={`w-4 h-4 ${item.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-medium truncate">
                              {item.text}
                            </p>
                            <p className="text-gray-500 text-[10px]">
                              {item.vehicle}
                            </p>
                          </div>
                          <span className="text-gray-600 text-[10px] whitespace-nowrap">
                            {item.time}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-3 -right-3 bg-white/[0.08] backdrop-blur-xl border border-white/15 rounded-xl px-3.5 py-2 shadow-lg animate-float">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-white text-xs font-medium">
                      98% Satisfaction
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="py-14 px-4 bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto max-w-4xl">
          <p className="text-center text-xs font-semibold text-blue-600 uppercase tracking-wider mb-8">
            How It Works
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, idx) => (
              <div
                key={item.step}
                className="relative flex flex-col items-center text-center"
              >
                {idx < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[60%] right-[-40%] h-[2px] bg-gradient-to-r from-blue-200 to-transparent" />
                )}
                <div className="relative w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 z-10">
                  <item.Icon className="w-5 h-5 text-blue-600" />
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    {item.step}
                  </div>
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">
                  {item.desc}
                </p>
              </div>
            ))}
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

      {/* Stats Section — Animated Counters */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-64 h-64 bg-blue-500/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px]" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative container mx-auto max-w-5xl px-4 py-20">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-blue-400 tracking-wider uppercase mb-2">
              Our Impact
            </p>
            <h3 className="text-2xl md:text-3xl font-bold text-white">
              Numbers That Speak
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <AnimatedStat
                key={stat.label}
                Icon={stat.Icon}
                value={stat.value}
                label={stat.label}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-blue-600 tracking-wider uppercase mb-3">
              Testimonials
            </p>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
              What Our Customers Say
            </h3>
          </div>
          <div className="relative">
            <div className="bg-gray-50 rounded-2xl p-8 md:p-10 border border-gray-100">
              <Quote className="w-8 h-8 text-blue-200 mb-4" />
              <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-6 min-h-[60px] transition-all duration-500">
                {testimonials[activeTestimonial].text}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 font-semibold text-sm">
                    {testimonials[activeTestimonial].name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {testimonials[activeTestimonial].role}
                  </p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(testimonials[activeTestimonial].rating)].map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-amber-400 fill-amber-400"
                      />
                    ),
                  )}
                </div>
              </div>
            </div>
            {/* Dots + arrows */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() =>
                  setActiveTestimonial(
                    (p) => (p - 1 + testimonials.length) % testimonials.length,
                  )
                }
                className="w-8 h-8 rounded-full border border-gray-200 hover:border-gray-400 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === activeTestimonial
                        ? "bg-blue-600 w-6"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() =>
                  setActiveTestimonial((p) => (p + 1) % testimonials.length)
                }
                className="w-8 h-8 rounded-full border border-gray-200 hover:border-gray-400 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA SECTION ═══════════════ */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-400/10 rounded-full blur-[80px]" />
        </div>
        <div className="relative container mx-auto max-w-3xl text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Book Your Service?
          </h3>
          <p className="text-blue-100 text-base mb-8 max-w-lg mx-auto">
            Join thousands of satisfied customers. Book in under 60 seconds.
          </p>
          <div className="flex flex-wrap gap-6 justify-center mb-10">
            {[
              { Icon: Zap, text: "Instant Confirmation" },
              { Icon: ShieldCheck, text: "Certified Mechanics" },
              { Icon: Timer, text: "2-Hour Avg. Service" },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2 text-white/80 text-sm"
              >
                <item.Icon className="w-4 h-4" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => (window.location.href = "/booking")}
              className="group px-8 py-4 bg-white text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-50 transition-all shadow-lg shadow-black/10 flex items-center gap-2"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => (window.location.href = "/learn-more")}
              className="px-8 py-4 text-white font-semibold text-sm rounded-xl border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all"
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
              <div className="mb-4">
                <span className="text-xl font-extrabold text-white">
                  Auto<span className="text-blue-400">Serve</span>
                </span>
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
