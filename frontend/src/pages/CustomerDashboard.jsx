import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Car,
  CalendarCheck,
  Clock,
  DollarSign,
  Wrench,
  Star,
  Bell,
  ChevronRight,
  TrendingUp,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowRight,
  Sparkles,
  Sun,
  Moon,
  CloudSun,
  Sunset,
  BarChart3,
  Receipt,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Lightbulb,
  Snowflake,
  CloudRain,
  Flame,
  Leaf,
  Timer,
  Hash,
  Palette,
  Activity,
  XCircle,
  CircleCheck,
  CreditCard,
  Banknote,
  FileText,
  AlertTriangle,
  RotateCcw,
  Filter,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return { text: "Good Night", icon: Moon, emoji: "🌙" };
  if (h < 12) return { text: "Good Morning", icon: Sun, emoji: "☀️" };
  if (h < 17) return { text: "Good Afternoon", icon: CloudSun, emoji: "🌤️" };
  if (h < 21) return { text: "Good Evening", icon: Sunset, emoji: "🌆" };
  return { text: "Good Night", icon: Moon, emoji: "🌙" };
}

function getSeasonalTips() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4)
    return {
      season: "Spring",
      icon: Leaf,
      lightBg: "bg-emerald-50",
      tips: [
        { text: "Check AC system before summer", priority: "high" },
        { text: "Replace wiper blades", priority: "medium" },
        { text: "Inspect tires for damage", priority: "high" },
        { text: "Replace pollen filter", priority: "low" },
      ],
    };
  if (month >= 5 && month <= 7)
    return {
      season: "Summer",
      icon: Flame,
      lightBg: "bg-orange-50",
      tips: [
        { text: "Top up coolant levels", priority: "high" },
        { text: "Check tire pressure regularly", priority: "high" },
        { text: "Test AC performance", priority: "medium" },
        { text: "Apply UV-resistant wax", priority: "low" },
      ],
    };
  if (month >= 8 && month <= 10)
    return {
      season: "Autumn",
      icon: CloudRain,
      lightBg: "bg-amber-50",
      tips: [
        { text: "Check brakes before wet season", priority: "high" },
        { text: "Inspect all lights", priority: "medium" },
        { text: "Test heating system", priority: "medium" },
        { text: "Replace worn wipers", priority: "low" },
      ],
    };
  return {
    season: "Winter",
    icon: Snowflake,
    lightBg: "bg-blue-50",
    tips: [
      { text: "Check battery health", priority: "high" },
      { text: "Switch to winter-grade oil", priority: "high" },
      { text: "Inspect antifreeze levels", priority: "medium" },
      { text: "Keep fuel tank above half", priority: "low" },
    ],
  };
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeDate(d) {
  if (!d) return "—";
  const now = new Date();
  const date = new Date(d);
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  return formatDate(d);
}

function timeAgo(d) {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

function daysUntil(d) {
  if (!d) return null;
  return Math.ceil(
    (new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
}

function daysSince(d) {
  if (!d) return null;
  return Math.floor(
    (Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24),
  );
}

const STATUS = {
  pending: {
    label: "Pending",
    icon: Clock,
    bg: "bg-amber-50",
    text: "text-amber-700",
    gradient: "from-amber-400 to-amber-500",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle,
    bg: "bg-blue-50",
    text: "text-blue-700",
    gradient: "from-blue-400 to-blue-500",
  },
  "in-progress": {
    label: "In Progress",
    icon: Activity,
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    gradient: "from-indigo-400 to-indigo-500",
  },
  completed: {
    label: "Completed",
    icon: CircleCheck,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    gradient: "from-emerald-400 to-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    bg: "bg-red-50",
    text: "text-red-700",
    gradient: "from-red-400 to-red-500",
  },
};

const INVOICE_STATUS = {
  draft: { label: "Draft", bg: "bg-slate-100", text: "text-slate-600" },
  sent: { label: "Unpaid", bg: "bg-amber-100", text: "text-amber-700" },
  paid: { label: "Paid", bg: "bg-emerald-100", text: "text-emerald-700" },
  overdue: { label: "Overdue", bg: "bg-red-100", text: "text-red-700" },
  cancelled: { label: "Cancelled", bg: "bg-slate-100", text: "text-slate-500" },
};

function ReviewModal({ booking, token, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      setError("Please add a comment");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking._id,
          serviceId: booking.serviceId?._id || booking.serviceId,
          rating,
          title: title.trim() || undefined,
          comment: comment.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to submit review");
      setSuccess(true);
      setTimeout(() => {
        onSubmitted();
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const starLabels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];
  const activeRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeInUp overflow-hidden">

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-slate-800">
                Rate Your Experience
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {booking.serviceId?.name || "Service"} •{" "}
                {formatDate(booking.bookingDate)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/60 text-slate-400 hover:text-slate-600 transition"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {booking.vehicleInfo && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
              <Car className="w-3.5 h-3.5" />
              {booking.vehicleInfo.make} {booking.vehicleInfo.model} (
              {booking.vehicleInfo.year})
            </div>
          )}
        </div>

        <div className="px-6 py-5 space-y-5">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h4 className="font-bold text-lg text-slate-800">Thank You!</h4>
              <p className="text-sm text-slate-500 mt-1">
                Your review has been submitted
              </p>
            </div>
          ) : (
            <>

              <div className="text-center">
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(s)}
                      className="p-1 transition-transform hover:scale-125 active:scale-95"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          s <= activeRating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p
                  className={`text-sm font-medium h-5 transition-all ${
                    activeRating > 0 ? "text-amber-600" : "text-slate-300"
                  }`}
                >
                  {activeRating > 0
                    ? starLabels[activeRating - 1]
                    : "Tap a star to rate"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Sum up your experience"
                  maxLength={100}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Your Review
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your experience..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
                />
                <p className="text-right text-[11px] text-slate-300 mt-1">
                  {comment.length}/500
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || rating === 0}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />{" "}
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4" /> Submit Review
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AnimNum({ value, prefix = "", suffix = "" }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!value) {
      setN(0);
      return;
    }
    let frame;
    const start = performance.now();
    const dur = 700;
    const animate = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setN(Math.round(ease * value));
      if (t < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return (
    <span>
      {prefix}
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

function ProgressRing({ value, size = 56, strokeWidth = 5, color }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const fill =
    color || (value >= 80 ? "#10b981" : value >= 50 ? "#f59e0b" : "#ef4444");
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={fill}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span
        className="absolute font-bold text-slate-800"
        style={{ fontSize: size * 0.22 }}
      >
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pending;
  const Icon = s.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
    >
      <Icon className="w-3 h-3" />
      {s.label}
    </span>
  );
}

function ProgressTracker({ status }) {
  const steps = ["pending", "confirmed", "in-progress", "completed"];
  const idx = steps.indexOf(status);
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 flex-1 rounded-full bg-red-200" />
        <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-0.5">
      {steps.map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
            i <= idx
              ? `bg-gradient-to-r ${STATUS[status]?.gradient || "from-indigo-400 to-indigo-500"}`
              : "bg-slate-100"
          }`}
        />
      ))}
    </div>
  );
}

function Sparkline({ data, width = 120, height = 32, color = "#6366f1" }) {
  if (!data?.length) return null;
  const max = Math.max(...data, 1);
  const pts = data.map(
    (v, i) =>
      `${(i / (data.length - 1)) * width},${height - (v / max) * height * 0.8 - 2}`,
  );
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`0,${height} ${pts.join(" ")} ${width},${height}`}
        fill="url(#sparkFill)"
      />
    </svg>
  );
}

function SpendingChart({ data }) {
  if (!data?.length) return null;
  const maxVal = Math.max(...data.map((d) => d.amount), 1);
  const [hovered, setHovered] = useState(null);
  return (
    <div className="flex items-end justify-between gap-2 h-32 px-1">
      {data.map((d, i) => {
        const pct = (d.amount / maxVal) * 100;
        const isActive = hovered === i;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {isActive && d.amount > 0 && (
              <div className="text-xs font-bold text-indigo-600 animate-fadeIn">
                ${d.amount.toFixed(0)}
              </div>
            )}
            <div className="w-full flex items-end" style={{ height: "80px" }}>
              <div
                className={`w-full rounded-t-md transition-all duration-500 ease-out ${
                  isActive
                    ? "bg-indigo-500"
                    : d.amount > 0
                      ? "bg-indigo-400/70"
                      : "bg-slate-100"
                }`}
                style={{ height: `${Math.max(pct, d.amount > 0 ? 8 : 3)}%` }}
              />
            </div>
            <span
              className={`text-[10px] font-medium ${isActive ? "text-indigo-600" : "text-slate-400"}`}
            >
              {d.month}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function CustomerDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAmounts, setShowAmounts] = useState(true);
  const [reviewBooking, setReviewBooking] = useState(null);

  const greeting = useMemo(() => getGreeting(), []);
  const seasonal = useMemo(() => getSeasonalTips(), []);
  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token],
  );

  const fetchDashboard = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const [r1, r2, r3] = await Promise.all([
          fetch(`${API}/bookings/dashboard-stats`, { headers }),
          fetch(`${API}/notifications/my-notifications`, { headers }),
          fetch(`${API}/reviews/my-reviews`, { headers }),
        ]);
        const [d1, d2, d3] = await Promise.all([
          r1.json(),
          r2.json(),
          r3.json(),
        ]);
        if (d1.success) setStats(d1.data);
        else throw new Error(d1.message || "Failed to load stats");
        if (d2.success) setNotifications(d2.data || []);
        if (d3.success) setReviews(d3.data || []);
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [headers],
  );

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const vehicleHealth = useMemo(() => {
    if (!stats?.vehicles?.length) return 0;
    let total = 0;
    stats.vehicles.forEach((v) => {
      const d = daysSince(v.lastServiceDate);
      if (d === null) total += 25;
      else if (d < 30) total += 100;
      else if (d < 60) total += 85;
      else if (d < 90) total += 70;
      else if (d < 180) total += 45;
      else total += 20;
    });
    return Math.round(total / stats.vehicles.length);
  }, [stats]);

  const reviewedIds = useMemo(
    () => new Set(reviews.map((r) => r.bookingId?._id || r.bookingId)),
    [reviews],
  );
  const unreviewedCompleted = useMemo(() => {
    if (!stats?.recentCompleted) return [];
    return stats.recentCompleted.filter((b) => !reviewedIds.has(b._id));
  }, [stats, reviewedIds]);
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const smartAlerts = useMemo(() => {
    const alerts = [];
    if (stats?.pendingPayments > 0)
      alerts.push({
        type: "warning",
        icon: CreditCard,
        text: `You have $${stats.pendingPayments.toFixed(0)} in pending payments`,
        action: () => setActiveTab("billing"),
        actionLabel: "View",
      });
    if (vehicleHealth > 0 && vehicleHealth < 50)
      alerts.push({
        type: "danger",
        icon: AlertTriangle,
        text: "Your vehicle health is low — schedule maintenance soon",
        action: () => navigate("/booking"),
        actionLabel: "Book",
      });
    if (unreviewedCompleted.length > 0)
      alerts.push({
        type: "info",
        icon: Star,
        text: `${unreviewedCompleted.length} completed service${unreviewedCompleted.length > 1 ? "s" : ""} awaiting your review`,
      });
    return alerts;
  }, [stats, vehicleHealth, unreviewedCompleted, navigate]);

  const spendingTrend = useMemo(
    () => stats?.monthlySpending?.map((m) => m.amount) || [],
    [stats],
  );

  const markAsRead = useCallback(
    async (id) => {
      try {
        const res = await fetch(`${API}/notifications/${id}/read`, {
          method: "PUT",
          headers,
        });
        const data = await res.json();
        if (data.success) {
          setNotifications((prev) =>
            prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
          );
        }
      } catch (err) {
        console.error("Mark as read failed:", err);
      }
    },
    [headers],
  );

  const markAllRead = useCallback(async () => {
    try {
      const res = await fetch(`${API}/notifications/mark-all-read`, {
        method: "PUT",
        headers,
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error("Mark all read failed:", err);
    }
  }, [headers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-14 h-14">
            <div className="absolute inset-0 rounded-full border-[3px] border-slate-200" />
            <div className="absolute inset-0 rounded-full border-[3px] border-indigo-600 border-t-transparent animate-spin" />
            <Car className="absolute inset-0 m-auto w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-700">Loading dashboard</p>
            <p className="text-sm text-slate-400">Fetching your data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm w-full">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">
            Oops! Something went wrong
          </h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <button
            onClick={() => fetchDashboard()}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: "Overview", icon: Activity },
    { key: "bookings", label: "Bookings", icon: CalendarCheck },
    { key: "vehicles", label: "Vehicles", icon: Car },
    { key: "billing", label: "Billing", icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        .animate-fadeInUp { animation: fadeInUp .45s ease-out both }
        .animate-fadeIn { animation: fadeIn .3s ease-out both }
        .animate-slideDown { animation: slideDown .35s ease-out both }
        .delay-1 { animation-delay: .05s }
        .delay-2 { animation-delay: .1s }
        .delay-3 { animation-delay: .15s }
        .delay-4 { animation-delay: .2s }
        .delay-5 { animation-delay: .25s }
      `}</style>

      <header className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 pt-14 pb-4">
            <div className="min-w-0">
              <p className="text-sm text-slate-500 flex items-center gap-1.5">
                <span>{greeting.emoji}</span> {greeting.text}
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                Welcome back,{" "}
                <span className="text-indigo-600">
                  {user?.name?.split(" ")[0] || "there"}
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => fetchDashboard(true)}
                disabled={refreshing}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={() => navigate("/booking")}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm shadow-indigo-200"
              >
                <Plus className="w-4 h-4" /> New Booking
              </button>
            </div>
          </div>

          <nav className="flex gap-1 -mb-px pt-2">
            {tabs.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
                    active
                      ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {smartAlerts.length > 0 && activeTab === "overview" && (
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap gap-2">
            {smartAlerts.map((alert, i) => (
              <div
                key={i}
                className={`animate-fadeIn flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                  alert.type === "danger"
                    ? "bg-red-50 text-red-700"
                    : alert.type === "warning"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-blue-50 text-blue-700"
                }`}
              >
                <alert.icon className="w-3.5 h-3.5 shrink-0" />
                <span>{alert.text}</span>
                {alert.action && (
                  <button
                    onClick={alert.action}
                    className="ml-1 underline underline-offset-2 hover:no-underline font-semibold"
                  >
                    {alert.actionLabel}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "overview" && (
          <OverviewTab
            stats={stats}
            notifications={notifications}
            unreadCount={unreadCount}
            vehicleHealth={vehicleHealth}
            seasonal={seasonal}
            unreviewedCompleted={unreviewedCompleted}
            showAmounts={showAmounts}
            setShowAmounts={setShowAmounts}
            spendingTrend={spendingTrend}
            navigate={navigate}
            setActiveTab={setActiveTab}
            markAsRead={markAsRead}
            markAllRead={markAllRead}
            onReview={setReviewBooking}
          />
        )}
        {activeTab === "bookings" && (
          <BookingsTab
            stats={stats}
            navigate={navigate}
            reviewedIds={reviewedIds}
            onReview={setReviewBooking}
          />
        )}
        {activeTab === "vehicles" && (
          <VehiclesTab
            stats={stats}
            vehicleHealth={vehicleHealth}
            navigate={navigate}
          />
        )}
        {activeTab === "billing" && (
          <BillingTab
            stats={stats}
            showAmounts={showAmounts}
            setShowAmounts={setShowAmounts}
          />
        )}
      </main>

      <button
        onClick={() => navigate("/booking")}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-300 flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all z-50"
      >
        <Plus className="w-6 h-6" />
      </button>

      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          token={token}
          onClose={() => setReviewBooking(null)}
          onSubmitted={() => fetchDashboard(true)}
        />
      )}
    </div>
  );
}

function OverviewTab({
  stats,
  notifications,
  unreadCount,
  vehicleHealth,
  seasonal,
  unreviewedCompleted,
  showAmounts,
  setShowAmounts,
  spendingTrend,
  navigate,
  setActiveTab,
  markAsRead,
  markAllRead,
  onReview,
}) {
  return (
    <div className="space-y-6">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

        <div className="animate-fadeInUp delay-1 bg-white rounded-2xl border border-slate-200/60 p-4 sm:p-5 hover:shadow-md transition group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5 text-indigo-600" />
            </div>
            {stats?.activeCount > 0 && (
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {stats.activeCount} active
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-slate-800">
            <AnimNum value={stats?.totalBookings || 0} />
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Total Bookings</p>
        </div>

        <div className="animate-fadeInUp delay-2 bg-white rounded-2xl border border-slate-200/60 p-4 sm:p-5 hover:shadow-md transition group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            {stats?.completedCount > 0 && stats?.totalBookings > 0 && (
              <span className="text-xs font-medium text-slate-400">
                {Math.round((stats.completedCount / stats.totalBookings) * 100)}
                %
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-slate-800">
            <AnimNum value={stats?.completedCount || 0} />
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Completed</p>
        </div>

        <div className="animate-fadeInUp delay-3 bg-white rounded-2xl border border-slate-200/60 p-4 sm:p-5 hover:shadow-md transition group relative">
          <button
            onClick={() => setShowAmounts(!showAmounts)}
            className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition"
          >
            {showAmounts ? (
              <Eye className="w-3.5 h-3.5" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
          </button>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5 text-violet-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {showAmounts ? (
              <AnimNum value={stats?.totalSpent || 0} prefix="$" />
            ) : (
              "•••••"
            )}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Total Spent</p>
          {showAmounts && spendingTrend.length > 0 && (
            <div className="mt-2 -mb-1">
              <Sparkline data={spendingTrend} width={100} height={24} />
            </div>
          )}
        </div>

        <div className="animate-fadeInUp delay-4 bg-white rounded-2xl border border-slate-200/60 p-4 sm:p-5 hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">Vehicle Health</p>
              <p className="text-lg font-bold text-slate-800">
                {vehicleHealth >= 80
                  ? "Excellent"
                  : vehicleHealth >= 50
                    ? "Good"
                    : vehicleHealth > 0
                      ? "Needs Care"
                      : "No Data"}
              </p>
              {vehicleHealth > 0 && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Score: {vehicleHealth}/100
                </p>
              )}
            </div>
            {vehicleHealth > 0 && (
              <ProgressRing value={vehicleHealth} size={52} strokeWidth={4} />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        <div className="lg:col-span-2 space-y-4 sm:space-y-6">

          <section className="animate-fadeInUp delay-2 bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div>
                <h2 className="font-semibold text-slate-800">
                  Recent Bookings
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {stats?.allBookings?.length || 0} total •{" "}
                  {stats?.activeCount || 0} active
                </p>
              </div>
              <button
                onClick={() => setActiveTab("bookings")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                See All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {!stats?.allBookings?.length ? (
              <div className="px-5 pb-8 pt-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-7 h-7 text-slate-300" />
                </div>
                <p className="font-medium text-slate-600 mb-1">
                  No bookings yet
                </p>
                <p className="text-sm text-slate-400 mb-4">
                  Book your first vehicle service to get started
                </p>
                <button
                  onClick={() => navigate("/booking")}
                  className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition"
                >
                  Book a Service
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {stats.allBookings.slice(0, 5).map((b, i) => {
                  const sc = STATUS[b.status] || STATUS.pending;
                  const dLeft = daysUntil(b.bookingDate);
                  const isUrgent = dLeft !== null && dLeft >= 0 && dLeft <= 2;
                  return (
                    <div
                      key={b._id}
                      className={`px-5 py-4 hover:bg-slate-50/50 transition animate-fadeInUp`}
                      style={{ animationDelay: `${(i + 1) * 0.05}s` }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 bg-gradient-to-br ${sc.gradient}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm text-slate-800 truncate">
                              {b.serviceId?.name || "Service"}
                            </h4>
                            <StatusBadge status={b.status} />
                            {isUrgent &&
                              b.status !== "completed" &&
                              b.status !== "cancelled" && (
                                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                  {dLeft === 0
                                    ? "TODAY"
                                    : dLeft === 1
                                      ? "TOMORROW"
                                      : `${dLeft}d LEFT`}
                                </span>
                              )}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatRelativeDate(b.bookingDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {b.timeSlot}
                            </span>
                            <span className="flex items-center gap-1">
                              <Car className="w-3 h-3" />
                              {b.vehicleInfo?.make} {b.vehicleInfo?.model}
                            </span>
                          </div>
                          <div className="mt-2 max-w-[200px]">
                            <ProgressTracker status={b.status} />
                          </div>
                        </div>
                        <span className="font-bold text-sm text-slate-800 shrink-0">
                          ${b.totalPrice}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="animate-fadeInUp delay-3 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-5 text-white relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/5 rounded-full" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/5 rounded-full" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-amber-300" />
                  </div>
                  <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wide">
                    Smart Tip
                  </span>
                </div>
                {stats?.nextServiceSuggestion ? (
                  <>
                    <p className="font-bold mb-1">Service recommended</p>
                    <p className="text-indigo-200 text-sm mb-4 leading-relaxed">
                      Based on your history, schedule around{" "}
                      <span className="text-white font-semibold">
                        {formatDate(stats.nextServiceSuggestion)}
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-bold mb-1">Get started</p>
                    <p className="text-indigo-200 text-sm mb-4 leading-relaxed">
                      Book your first service to unlock personalized
                      recommendations
                    </p>
                  </>
                )}
                <button
                  onClick={() => navigate("/booking")}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm font-medium transition"
                >
                  Book Now <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="animate-fadeInUp delay-4 bg-white rounded-2xl border border-slate-200/60 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className={`w-8 h-8 rounded-lg ${seasonal.lightBg} flex items-center justify-center`}
                >
                  <seasonal.icon className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-800">
                    {seasonal.season} Tips
                  </h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                    Seasonal care
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {seasonal.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                        tip.priority === "high"
                          ? "bg-red-400"
                          : tip.priority === "medium"
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                      }`}
                    />
                    <span className="text-sm text-slate-600 leading-snug">
                      {tip.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {unreviewedCompleted.length > 0 && (
            <div className="animate-fadeInUp delay-5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-2xl border border-amber-200/50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-slate-800 text-sm">
                  Rate Your Experience
                </h3>
                <span className="ml-auto text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                  {unreviewedCompleted.length} pending
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {unreviewedCompleted.slice(0, 4).map((b) => (
                  <div
                    key={b._id}
                    onClick={() => onReview(b)}
                    className="bg-white rounded-xl p-3 border border-amber-100 flex items-center gap-3 cursor-pointer hover:border-amber-300 hover:shadow-sm transition group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition">
                      <Wrench className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-slate-700 truncate">
                        {b.serviceId?.name || "Service"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(b.bookingDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className="w-3.5 h-3.5 text-slate-200 group-hover:text-amber-400 transition"
                          />
                        ))}
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 sm:space-y-6">

          <section className="animate-fadeInUp delay-3 bg-white rounded-2xl border border-slate-200/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-slate-800">Spending</h3>
              <button
                onClick={() => setActiveTab("billing")}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Details
              </button>
            </div>
            {stats?.monthlySpending?.some((m) => m.amount > 0) ? (
              <SpendingChart data={stats.monthlySpending} />
            ) : (
              <div className="text-center py-6">
                <BarChart3 className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No spending data yet</p>
              </div>
            )}
            {stats?.totalSpent > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-sm">
                <span className="text-slate-500">Total</span>
                <span className="font-bold text-slate-800">
                  {showAmounts
                    ? `$${stats.totalSpent.toLocaleString()}`
                    : "•••••"}
                </span>
              </div>
            )}
          </section>

          <section className="animate-fadeInUp delay-4 bg-white rounded-2xl border border-slate-200/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-slate-800">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="text-center py-6">
                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No notifications yet</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {notifications.slice(0, 5).map((n) => {
                  const handleClick = () => {
                    if (!n.isRead) markAsRead(n._id);
                    const cat = n.category || "";
                    if (
                      cat.startsWith("invoice") ||
                      cat.startsWith("payment")
                    ) {
                      setActiveTab("billing");
                    } else if (
                      cat.startsWith("booking") ||
                      cat === "service-complete"
                    ) {
                      setActiveTab("bookings");
                    }
                  };
                  return (
                    <li
                      key={n._id}
                      onClick={handleClick}
                      className={`flex gap-3 items-start rounded-xl px-3 py-2.5 transition-colors cursor-pointer ${
                        n.isRead
                          ? "hover:bg-slate-50"
                          : "bg-indigo-50/40 hover:bg-indigo-50/70"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${n.isRead ? "bg-slate-200" : "bg-indigo-500 animate-pulse"}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm leading-snug truncate ${n.isRead ? "text-slate-500" : "text-slate-700 font-medium"}`}
                        >
                          {n.subject}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
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
                          className="shrink-0 mt-0.5 p-1 rounded-lg text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {stats?.topServices?.length > 0 && (
            <section className="animate-fadeInUp delay-5 bg-white rounded-2xl border border-slate-200/60 p-5">
              <h3 className="font-semibold text-sm text-slate-800 mb-3">
                Most Used Services
              </h3>
              <div className="space-y-2.5">
                {stats.topServices.slice(0, 4).map((svc, i) => {
                  const maxCount = stats.topServices[0].count;
                  const pct = (svc.count / maxCount) * 100;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-700 font-medium truncate">
                          {svc.name}
                        </span>
                        <span className="text-xs text-slate-400 shrink-0 ml-2">
                          {svc.count}x
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-500 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingsTab({ stats, navigate, reviewedIds, onReview }) {
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const allBookings = useMemo(
    () => (stats?.allBookings ? [...stats.allBookings] : []),
    [stats],
  );

  const filtered = useMemo(() => {
    let result =
      filter === "all"
        ? allBookings
        : allBookings.filter((b) => b.status === filter);
    result.sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.bookingDate) - new Date(a.bookingDate);
      if (sortBy === "oldest")
        return new Date(a.bookingDate) - new Date(b.bookingDate);
      if (sortBy === "price") return b.totalPrice - a.totalPrice;
      return 0;
    });
    return result;
  }, [allBookings, filter, sortBy]);

  const statusCounts = useMemo(() => {
    const counts = { all: allBookings.length };
    allBookings.forEach((b) => {
      counts[b.status] = (counts[b.status] || 0) + 1;
    });
    return counts;
  }, [allBookings]);

  const filters = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "in-progress", label: "In Progress" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="space-y-4">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => {
            const count = statusCounts[f.key] || 0;
            if (f.key !== "all" && count === 0) return null;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filter === f.key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {f.label}
                <span
                  className={`ml-1.5 ${filter === f.key ? "text-indigo-200" : "text-slate-300"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-fit"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="price">Highest price</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
            <CalendarCheck className="w-7 h-7 text-slate-300" />
          </div>
          <p className="font-medium text-slate-600 mb-1">No bookings found</p>
          <p className="text-sm text-slate-400 mb-4">
            Try a different filter or book a new service
          </p>
          <button
            onClick={() => navigate("/booking")}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
          >
            Book Service
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((b, i) => {
            const sc = STATUS[b.status] || STATUS.pending;
            const dLeft = daysUntil(b.bookingDate);
            return (
              <div
                key={b._id}
                className="animate-fadeInUp bg-white rounded-xl border border-slate-200/60 p-4 sm:p-5 hover:shadow-md transition"
                style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <StatusBadge status={b.status} />
                      {b.priority === "urgent" && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          URGENT
                        </span>
                      )}
                      {dLeft !== null &&
                        dLeft >= 0 &&
                        dLeft <= 3 &&
                        b.status !== "completed" &&
                        b.status !== "cancelled" && (
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Timer className="w-2.5 h-2.5" />
                            {dLeft === 0
                              ? "TODAY"
                              : dLeft === 1
                                ? "TOMORROW"
                                : `${dLeft}D LEFT`}
                          </span>
                        )}
                    </div>
                    <h4 className="font-bold text-slate-800">
                      {b.serviceId?.name || "Service"}
                    </h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(b.bookingDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {b.timeSlot}
                      </span>
                      <span className="flex items-center gap-1">
                        <Car className="w-3.5 h-3.5" />
                        {b.vehicleInfo?.make} {b.vehicleInfo?.model} (
                        {b.vehicleInfo?.year})
                      </span>
                      <span className="flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5" />
                        {b.vehicleInfo?.licensePlate}
                      </span>
                    </div>
                    {b.notes && (
                      <p className="mt-2 text-xs text-slate-400 italic line-clamp-1">
                        Note: {b.notes}
                      </p>
                    )}
                    <div className="mt-2.5 max-w-[240px]">
                      <ProgressTracker status={b.status} />
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-2">
                    <p className="text-xl font-bold text-slate-800">
                      ${b.totalPrice}
                    </p>
                    {b.assignedTech && (
                      <p className="text-[11px] text-slate-400">
                        Tech: {b.assignedTech}
                      </p>
                    )}
                    {b.status === "completed" && !reviewedIds?.has(b._id) && (
                      <button
                        onClick={() => onReview(b)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-semibold text-amber-700 hover:bg-amber-100 hover:border-amber-300 transition"
                      >
                        <Star className="w-3.5 h-3.5" /> Leave Review
                      </button>
                    )}
                    {b.status === "completed" && reviewedIds?.has(b._id) && (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Reviewed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VehiclesTab({ stats, vehicleHealth, navigate }) {
  const vehicles = stats?.vehicles || [];

  return (
    <div className="space-y-6">

      <div className="animate-fadeInUp bg-white rounded-2xl border border-slate-200/60 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <ProgressRing value={vehicleHealth} size={80} strokeWidth={6} />
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-bold text-slate-800">
              Fleet Health Score
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
              {vehicleHealth >= 80
                ? "All your vehicles are well maintained. Keep up the great work!"
                : vehicleHealth >= 50
                  ? "Some vehicles may need attention soon. Consider scheduling maintenance."
                  : vehicleHealth > 0
                    ? "Your vehicles need care. Book a service to keep them in top shape."
                    : "No vehicle data yet. Book your first service to start tracking."}
            </p>
            {vehicleHealth > 0 && vehicleHealth < 70 && (
              <button
                onClick={() => navigate("/booking")}
                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
              >
                Schedule Maintenance
              </button>
            )}
          </div>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
            <Car className="w-7 h-7 text-slate-300" />
          </div>
          <p className="font-medium text-slate-600 mb-1">No vehicles yet</p>
          <p className="text-sm text-slate-400 mb-4">
            Vehicles will appear here after your first booking
          </p>
          <button
            onClick={() => navigate("/booking")}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
          >
            Book First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((v, i) => {
            const d = daysSince(v.lastServiceDate);
            const health =
              d === null
                ? { label: "Unknown", color: "slate", score: 0 }
                : d < 60
                  ? { label: "Healthy", color: "emerald", score: 90 }
                  : d < 120
                    ? { label: "Due Soon", color: "amber", score: 55 }
                    : { label: "Overdue", color: "red", score: 25 };

            return (
              <div
                key={i}
                className="animate-fadeInUp bg-white rounded-2xl border border-slate-200/60 p-5 hover:shadow-md transition"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center">
                      <Car className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">
                        {v.make} {v.model}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {v.year} • {v.licensePlate}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      health.color === "emerald"
                        ? "bg-emerald-50 text-emerald-600"
                        : health.color === "amber"
                          ? "bg-amber-50 text-amber-600"
                          : health.color === "red"
                            ? "bg-red-50 text-red-600"
                            : "bg-slate-50 text-slate-400"
                    }`}
                  >
                    {health.label}
                  </span>
                </div>

                {v.color && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                    <Palette className="w-3.5 h-3.5" />
                    {v.color}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Services
                    </p>
                    <p className="text-lg font-bold text-slate-800">
                      {v.totalServices}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Last Service
                    </p>
                    <p className="text-sm font-semibold text-slate-700">
                      {v.lastServiceDate ? formatDate(v.lastServiceDate) : "—"}
                    </p>
                    {v.lastServiceName && (
                      <p className="text-[11px] text-slate-400 truncate">
                        {v.lastServiceName}
                      </p>
                    )}
                  </div>
                </div>

                {health.score > 0 && (
                  <div className="mt-3">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          health.color === "emerald"
                            ? "bg-emerald-400"
                            : health.color === "amber"
                              ? "bg-amber-400"
                              : "bg-red-400"
                        }`}
                        style={{ width: `${health.score}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => navigate("/booking")}
                  className="mt-4 w-full py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 font-medium hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition flex items-center justify-center gap-2"
                >
                  <Wrench className="w-4 h-4" /> Book Service
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BillingTab({ stats, showAmounts, setShowAmounts }) {
  const invoices = stats?.invoices || [];
  const monthlySpending = stats?.monthlySpending || [];

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="animate-fadeInUp delay-1 bg-white rounded-2xl border border-slate-200/60 p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-emerald-600" />
            </div>
            <button
              onClick={() => setShowAmounts(!showAmounts)}
              className="text-slate-300 hover:text-slate-500 transition"
            >
              {showAmounts ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">
            {showAmounts
              ? `$${(stats?.totalSpent || 0).toLocaleString()}`
              : "•••••"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Total Spent</p>
        </div>
        <div className="animate-fadeInUp delay-2 bg-white rounded-2xl border border-slate-200/60 p-5">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {showAmounts
              ? `$${(stats?.pendingPayments || 0).toLocaleString()}`
              : "•••••"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Pending</p>
        </div>
        <div className="animate-fadeInUp delay-3 bg-white rounded-2xl border border-slate-200/60 p-5">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center mb-2">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">
            {invoices.length}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Invoices</p>
        </div>
      </div>

      <div className="animate-fadeInUp delay-2 bg-white rounded-2xl border border-slate-200/60 p-5">
        <h3 className="font-semibold text-sm text-slate-800 mb-4">
          Monthly Spending
        </h3>
        {monthlySpending.some((m) => m.amount > 0) ? (
          <SpendingChart data={monthlySpending} />
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No spending data yet</p>
          </div>
        )}
      </div>

      <div className="animate-fadeInUp delay-3 bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h3 className="font-semibold text-sm text-slate-800">
            Recent Invoices
          </h3>
        </div>
        {invoices.length === 0 ? (
          <div className="px-5 pb-8 text-center">
            <Receipt className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No invoices yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {invoices.map((inv) => {
              const is = INVOICE_STATUS[inv.status] || INVOICE_STATUS.draft;
              return (
                <div
                  key={inv._id}
                  className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      <Receipt className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-slate-700 truncate">
                        {inv.invoiceNumber || "Invoice"}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {inv.bookingId?.serviceId?.name || "Service"} •{" "}
                        {formatDate(inv.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${is.bg} ${is.text}`}
                    >
                      {is.label}
                    </span>
                    <span className="font-bold text-sm text-slate-800 tabular-nums">
                      {showAmounts ? `$${inv.totalAmount?.toFixed(2)}` : "•••"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
