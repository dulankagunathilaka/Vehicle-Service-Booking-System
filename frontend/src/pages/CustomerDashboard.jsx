import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  LogOut,
  Plus,
  CalendarDays,
  Clock,
  DollarSign,
  StickyNote,
  X,
  Eye,
  Inbox,
  User,
  CheckCircle2,
  Loader,
  AlertCircle,
  ShieldCheck,
  Filter,
  Bell,
  ChevronRight,
  Wrench,
  Activity,
  TrendingUp,
  ChevronDown,
  Home,
  Star,
  MessageSquare,
  Send,
  FileText,
  Receipt,
  CreditCard,
  Mail,
  Smartphone,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:5000/api";

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
    dot: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: CheckCircle2,
    dot: "bg-blue-500",
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-violet-50 text-violet-700 border-violet-200",
    icon: Loader,
    dot: "bg-violet-500",
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: ShieldCheck,
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: AlertCircle,
    dot: "bg-red-500",
  },
};

const statusFlow = ["pending", "confirmed", "in-progress", "completed"];

function CustomerDashboard() {
  const navigate = useNavigate();
  const { user: authUser, token: authToken, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(authUser);
  const [cancelingId, setCancelingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [myReviews, setMyReviews] = useState([]);
  const [reviewError, setReviewError] = useState("");
  const [myInvoices, setMyInvoices] = useState([]);
  const [myNotifications, setMyNotifications] = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [activeTab, setActiveTab] = useState("bookings");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payingInvoice, setPayingInvoice] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  useEffect(() => {
    const token = authToken || localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }
    if (authUser) setUser(authUser);
    fetchBookings(token);
    fetchMyReviews(token);
    fetchMyInvoices(token);
    fetchMyNotifications(token);
  }, [navigate, authToken, authUser]);

  const fetchMyReviews = async (token) => {
    try {
      const res = await fetch(`${API}/reviews/my-reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMyReviews(data.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const fetchMyInvoices = async (token) => {
    try {
      const res = await fetch(`${API}/billing/my-invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMyInvoices(data.data);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    }
  };

  const fetchMyNotifications = async (token) => {
    try {
      const res = await fetch(`${API}/notifications/my-notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMyNotifications(data.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const markNotificationRead = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API}/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyNotifications(
        myNotifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsRead = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API}/notifications/mark-all-read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyNotifications(myNotifications.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayInvoice = async (invoiceId, paymentMethod) => {
    const token = localStorage.getItem("token");
    setPayingInvoice(true);
    try {
      const res = await fetch(`${API}/billing/${invoiceId}/pay`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentMethod }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedInvoice(data.data);
        setSelectedPaymentMethod(null);
        fetchMyInvoices(token);
        fetchMyNotifications(token);
        setPaymentSuccess({
          invoiceNumber: data.data.invoiceNumber,
          amount: data.data.totalAmount,
          method: paymentMethod,
        });
        setTimeout(() => setPaymentSuccess(null), 5000);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Payment failed. Please try again.");
    } finally {
      setPayingInvoice(false);
    }
  };

  const handleSubmitReview = async (booking) => {
    const token = localStorage.getItem("token");
    setSubmittingReview(true);
    setReviewError("");
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
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowReviewForm(null);
        setReviewData({ rating: 5, title: "", comment: "" });
        fetchMyReviews(token);
      } else {
        setReviewError(data.message || "Failed to submit review");
      }
    } catch (err) {
      setReviewError("Error submitting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const hasReviewed = (bookingId) => {
    return myReviews.some(
      (r) => r.bookingId?._id === bookingId || r.bookingId === bookingId,
    );
  };

  const fetchBookings = async (token) => {
    try {
      const res = await fetch(`${API}/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setBookings(data.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const token = localStorage.getItem("token");
    setCancelingId(bookingId);
    try {
      const res = await fetch(`${API}/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setBookings(
          bookings.map((b) =>
            b._id === bookingId ? { ...b, status: "cancelled" } : b,
          ),
        );
        if (selectedBooking?._id === bookingId)
          setSelectedBooking({ ...selectedBooking, status: "cancelled" });
      }
    } catch (err) {
      console.error("Error canceling booking:", err);
    } finally {
      setCancelingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const activeBookings = bookings.filter(
    (b) => b.status !== "completed" && b.status !== "cancelled",
  );
  const completedCount = bookings.filter(
    (b) => b.status === "completed",
  ).length;
  const totalSpent = bookings
    .filter((b) => b.status === "completed")
    .reduce((s, b) => s + (b.totalPrice || 0), 0);
  const upcomingBooking = activeBookings.sort(
    (a, b) => new Date(a.bookingDate) - new Date(b.bookingDate),
  )[0];

  const filteredBookings =
    filterStatus === "all"
      ? bookings
      : bookings.filter((b) => {
          if (filterStatus === "active")
            return b.status !== "completed" && b.status !== "cancelled";
          return b.status === filterStatus;
        });

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <nav className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 group"
          >
            <img
              src="/favicon.svg"
              alt="AutoServe"
              className="w-10 h-10 rounded-xl shadow-md group-hover:shadow-lg transition"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-800 leading-tight">
                AutoServe
              </h1>
              <p className="text-[9px] text-blue-600 font-semibold tracking-wider uppercase">
                My Dashboard
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/booking")}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition-all"
            >
              <Plus className="w-4 h-4" /> New Booking
            </button>

            <button
              onClick={() => setShowNotifPanel(!showNotifPanel)}
              className="relative p-2 rounded-xl hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
            >
              <Bell className="w-5 h-5" />
              {myNotifications.filter((n) => !n.isRead).length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                  {myNotifications.filter((n) => !n.isRead).length}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                  {(user?.name || "U").charAt(0).toUpperCase()}
                </div>
                <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
              </button>
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-sm font-bold text-gray-900">
                        {user?.name}
                      </p>
                      <p className="text-[11px] text-gray-400">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigate("/");
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2.5 transition"
                    >
                      <Home className="w-4 h-4" /> Home
                    </button>
                    <button
                      onClick={() => {
                        navigate("/booking");
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2.5 transition"
                    >
                      <Plus className="w-4 h-4" /> New Booking
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1 container mx-auto max-w-6xl px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-sm text-blue-600 font-semibold mb-1">
                {getGreeting()}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {user?.name || "Welcome back"}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Here's an overview of your vehicle service bookings
              </p>
            </div>
            <button
              onClick={() => navigate("/booking")}
              className="sm:hidden flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition-all"
            >
              <Plus className="w-4 h-4" /> New Booking
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {bookings.length}
            </p>
            <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">
              Total Bookings
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 p-5 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              {activeBookings.length > 0 && (
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              )}
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {activeBookings.length}
            </p>
            <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">
              Active
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-emerald-100 p-5 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {completedCount}
            </p>
            <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">
              Completed
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-amber-100 p-5 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${totalSpent.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">
              Total Spent
            </p>
          </div>
        </div>

        {/* Upcoming Booking Card */}
        {upcomingBooking && (
          <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-20 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                  Next Appointment
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">
                    {upcomingBooking.serviceId?.name || "Service"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-blue-100">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {new Date(upcomingBooking.bookingDate).toLocaleDateString(
                        "en-US",
                        { weekday: "short", month: "short", day: "numeric" },
                      )}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />{" "}
                      {upcomingBooking.timeSlot}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5" />
                      {upcomingBooking.vehicleInfo.year}{" "}
                      {upcomingBooking.vehicleInfo.make}{" "}
                      {upcomingBooking.vehicleInfo.model}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-lg text-xs font-bold capitalize">
                    {upcomingBooking.status}
                  </span>
                  <button
                    onClick={() => setSelectedBooking(upcomingBooking)}
                    className="px-4 py-2 bg-white text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all shadow-lg"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Dropdown Panel */}
        {showNotifPanel && (
          <div
            className="fixed inset-0 z-50"
            onClick={() => setShowNotifPanel(false)}
          >
            <div
              className="absolute right-4 top-16 w-[22rem] sm:w-96 max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-gray-900">
                    Notifications
                  </h3>
                  {myNotifications.filter((n) => !n.isRead).length > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                      {myNotifications.filter((n) => !n.isRead).length}
                    </span>
                  )}
                </div>
                {myNotifications.some((n) => !n.isRead) && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto max-h-[50vh] divide-y divide-gray-50">
                {myNotifications.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      No notifications
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      You're all caught up!
                    </p>
                  </div>
                ) : (
                  myNotifications.slice(0, 8).map((n) => {
                    const catIcon = n.category?.includes("booking")
                      ? ClipboardList
                      : n.category?.includes("invoice") ||
                          n.category?.includes("payment")
                        ? Receipt
                        : Mail;
                    const CatIcon = catIcon;
                    const catBg = n.category?.includes("booking")
                      ? "bg-blue-50 text-blue-600"
                      : n.category?.includes("invoice") ||
                          n.category?.includes("payment")
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-50 text-gray-600";
                    return (
                      <div
                        key={n._id}
                        onClick={() => markNotificationRead(n._id)}
                        className={`px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition ${!n.isRead ? "bg-blue-50/40" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${catBg}`}
                          >
                            <CatIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p
                                className={`text-sm ${!n.isRead ? "font-bold" : "font-medium"} text-gray-900 truncate`}
                              >
                                {n.subject}
                              </p>
                              {!n.isRead && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(n.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {myNotifications.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setShowNotifPanel(false);
                      setActiveTab("notifications");
                    }}
                    className="w-full text-center text-xs font-semibold text-blue-600 hover:underline"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Tab Navigation */}
        <div className="flex items-center gap-1 mb-6 bg-white rounded-2xl border border-gray-100 p-1.5 shadow-sm">
          {[
            {
              key: "bookings",
              label: "Bookings",
              Icon: ClipboardList,
              count: bookings.length,
            },
            {
              key: "invoices",
              label: "Invoices",
              Icon: Receipt,
              count: myInvoices.length,
            },
            {
              key: "notifications",
              label: "Notifications",
              Icon: Bell,
              count: myNotifications.filter((n) => !n.isRead).length,
            },
          ].map(({ key, label, Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === key
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
              {count > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === key
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: Invoices */}
        {activeTab === "invoices" && (
          <div>
            {/* Billing Notifications */}
            {(() => {
              const billingNotifs = myNotifications.filter(
                (n) =>
                  (n.category === "invoice-sent" ||
                    n.category === "payment-received") &&
                  !n.isRead,
              );
              if (billingNotifs.length === 0) return null;
              return (
                <div className="mb-6 space-y-2">
                  {billingNotifs.map((n) => {
                    const isPayment = n.category === "payment-received";
                    return (
                      <div
                        key={n._id}
                        className={`flex items-start gap-3 p-4 rounded-2xl border ${
                          isPayment
                            ? "bg-emerald-50/60 border-emerald-200"
                            : "bg-blue-50/60 border-blue-200"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isPayment
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {isPayment ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Receipt className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-semibold ${
                              isPayment ? "text-emerald-800" : "text-blue-800"
                            }`}
                          >
                            {n.subject}
                          </p>
                          <p
                            className={`text-xs mt-0.5 ${
                              isPayment ? "text-emerald-600" : "text-blue-600"
                            }`}
                          >
                            {n.message}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(n.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <button
                          onClick={() => markNotificationRead(n._id)}
                          className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
                          title="Dismiss"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Payment Success Toast */}
            {paymentSuccess && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 animate-fade-in">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-emerald-800">
                    Payment Successful!
                  </p>
                  <p className="text-xs text-emerald-600">
                    ${paymentSuccess.amount?.toFixed(2)} paid for{" "}
                    {paymentSuccess.invoiceNumber} via{" "}
                    {paymentSuccess.method === "card" ? "Card" : "Cash"}
                  </p>
                </div>
                <button
                  onClick={() => setPaymentSuccess(null)}
                  className="text-emerald-400 hover:text-emerald-600 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {myInvoices.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No invoices yet
                </h3>
                <p className="text-gray-400 text-sm">
                  Invoices will appear here after your services are billed
                </p>
              </div>
            ) : (
              <>
                {/* Invoice Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {myInvoices.length}
                        </p>
                        <p className="text-xs text-gray-400">Total Invoices</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-emerald-600">
                          $
                          {myInvoices
                            .filter((i) => i.status === "paid")
                            .reduce((s, i) => s + i.totalAmount, 0)
                            .toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400">Total Paid</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-amber-600">
                          $
                          {myInvoices
                            .filter(
                              (i) =>
                                i.status === "sent" || i.status === "overdue",
                            )
                            .reduce((s, i) => s + i.totalAmount, 0)
                            .toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400">Outstanding</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice List */}
                <div className="space-y-3">
                  {myInvoices.map((inv) => (
                    <div
                      key={inv._id}
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setSelectedPaymentMethod(null);
                      }}
                      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              inv.status === "paid"
                                ? "bg-emerald-50"
                                : inv.status === "overdue"
                                  ? "bg-red-50"
                                  : "bg-blue-50"
                            }`}
                          >
                            {inv.status === "paid" ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : inv.status === "overdue" ? (
                              <AlertCircle className="w-5 h-5 text-red-600" />
                            ) : (
                              <FileText className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-gray-900">
                                {inv.invoiceNumber}
                              </p>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  inv.status === "paid"
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                    : inv.status === "sent"
                                      ? "bg-blue-50 text-blue-600 border-blue-200"
                                      : inv.status === "overdue"
                                        ? "bg-red-50 text-red-600 border-red-200"
                                        : "bg-gray-50 text-gray-500 border-gray-200"
                                }`}
                              >
                                {inv.status.charAt(0).toUpperCase() +
                                  inv.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {inv.bookingId?.serviceId?.name || "Service"} ·{" "}
                              {new Date(inv.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-gray-900">
                            ${inv.totalAmount.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Due{" "}
                            {new Date(inv.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {(inv.status === "sent" ||
                            inv.status === "overdue") && (
                            <span className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm">
                              Pay Now
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition" />
                        </div>
                      </div>

                      {/* Item preview */}
                      {inv.items && inv.items.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-50 pl-15">
                          <div className="flex flex-wrap gap-2">
                            {inv.items.slice(0, 3).map((item, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 bg-gray-50 rounded-lg text-[11px] text-gray-500 font-medium"
                              >
                                {item.description} × {item.quantity}
                              </span>
                            ))}
                            {inv.items.length > 3 && (
                              <span className="px-2.5 py-1 bg-gray-50 rounded-lg text-[11px] text-gray-400">
                                +{inv.items.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab: Notifications */}
        {activeTab === "notifications" && (
          <div>
            {myNotifications.length > 0 &&
              myNotifications.some((n) => !n.isRead) && (
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500">
                    <span className="font-bold text-gray-900">
                      {myNotifications.filter((n) => !n.isRead).length}
                    </span>{" "}
                    unread
                  </p>
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    Mark all as read
                  </button>
                </div>
              )}

            {myNotifications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No notifications
                </h3>
                <p className="text-gray-400 text-sm">
                  You'll receive updates about your bookings and invoices here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myNotifications.map((n) => {
                  const isBooking = n.category?.includes("booking");
                  const isPayment =
                    n.category?.includes("invoice") ||
                    n.category?.includes("payment");
                  const NIcon = isBooking
                    ? ClipboardList
                    : isPayment
                      ? Receipt
                      : Mail;
                  const nBg = isBooking
                    ? "bg-blue-50 text-blue-600"
                    : isPayment
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-purple-50 text-purple-600";
                  const nType =
                    n.type === "sms"
                      ? "SMS"
                      : n.type === "both"
                        ? "Email & SMS"
                        : "Email";
                  return (
                    <div
                      key={n._id}
                      onClick={() => markNotificationRead(n._id)}
                      className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                        !n.isRead
                          ? "border-blue-200 bg-blue-50/30"
                          : "border-gray-100"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${nBg}`}
                        >
                          <NIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p
                                  className={`text-sm ${!n.isRead ? "font-bold" : "font-semibold"} text-gray-900`}
                                >
                                  {n.subject}
                                </p>
                                {!n.isRead && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                {n.message}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${nBg}`}
                                >
                                  {n.category?.replace(/-/g, " ")}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                                  {n.type === "sms" ? (
                                    <Smartphone className="w-3 h-3" />
                                  ) : (
                                    <Mail className="w-3 h-3" />
                                  )}
                                  {nType}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {new Date(n.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Bookings */}
        {activeTab === "bookings" && (
          <>
            {/* Filter Tabs + Bookings */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">
                Bookings History
              </h3>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {[
                  { value: "all", label: "All" },
                  { value: "active", label: "Active" },
                  { value: "completed", label: "Done" },
                  { value: "cancelled", label: "Cancelled" },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setFilterStatus(value)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      filterStatus === value
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <Loader className="w-8 h-8 text-blue-600 mx-auto mb-3 animate-spin" />
                <p className="text-gray-400 text-sm">
                  Loading your bookings...
                </p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Inbox className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {filterStatus === "all"
                    ? "No bookings yet"
                    : `No ${filterStatus} bookings`}
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  {filterStatus === "all"
                    ? "Book your first vehicle service appointment"
                    : "Try a different filter"}
                </p>
                {filterStatus === "all" && (
                  <button
                    onClick={() => navigate("/booking")}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Book Now
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => {
                  const sc =
                    statusConfig[booking.status] || statusConfig.pending;
                  const StatusIcon = sc.icon;
                  return (
                    <div
                      key={booking._id}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="p-5 sm:p-6">
                        {/* Top Row */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${sc.color} border`}
                            >
                              <StatusIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-gray-900">
                                {booking.serviceId?.name || "Service"}
                              </h3>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Booking #{booking._id.slice(-8)} ·{" "}
                                {new Date(booking.createdAt).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric" },
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize border ${sc.color}`}
                            >
                              {sc.label}
                            </span>
                          </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid sm:grid-cols-3 gap-4 mb-4 pl-14">
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                              Vehicle
                            </p>
                            <p className="text-sm font-semibold text-gray-800">
                              {booking.vehicleInfo.year}{" "}
                              {booking.vehicleInfo.make}{" "}
                              {booking.vehicleInfo.model}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">
                              {booking.vehicleInfo.licensePlate}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                              Appointment
                            </p>
                            <p className="text-sm font-semibold text-gray-800">
                              {new Date(booking.bookingDate).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {booking.timeSlot}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                              Price
                            </p>
                            <p className="text-lg font-bold text-blue-600">
                              ${booking.totalPrice}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar (for active bookings) */}
                        {booking.status !== "cancelled" && (
                          <div className="pl-14 mb-4">
                            <div className="flex items-center gap-1">
                              {statusFlow.map((s, i) => {
                                const currentIdx = statusFlow.indexOf(
                                  booking.status,
                                );
                                const done = i <= currentIdx;
                                return (
                                  <div
                                    key={s}
                                    className="flex items-center flex-1"
                                  >
                                    <div
                                      className={`h-1.5 flex-1 rounded-full transition-all ${done ? "bg-blue-500" : "bg-gray-100"}`}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex justify-between mt-1">
                              {statusFlow.map((s, i) => {
                                const currentIdx = statusFlow.indexOf(
                                  booking.status,
                                );
                                return (
                                  <span
                                    key={s}
                                    className={`text-[9px] font-semibold capitalize ${i <= currentIdx ? "text-blue-600" : "text-gray-300"}`}
                                  >
                                    {s.replace("-", " ")}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {booking.notes && (
                          <div className="pl-14 mb-4">
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                              <p className="text-xs text-gray-500 flex items-start gap-2">
                                <StickyNote className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gray-400" />
                                {booking.notes}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pl-14 pt-3 border-t border-gray-50">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all border border-blue-100"
                          >
                            <Eye className="w-4 h-4" /> Details
                          </button>
                          {booking.status === "completed" &&
                            !hasReviewed(booking._id) && (
                              <button
                                onClick={() => {
                                  setReviewData({
                                    rating: 5,
                                    title: "",
                                    comment: "",
                                  });
                                  setReviewError("");
                                  setShowReviewForm(booking);
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-amber-600 bg-amber-50 rounded-xl hover:bg-amber-100 transition-all border border-amber-100"
                              >
                                <Star className="w-4 h-4" /> Write Review
                              </button>
                            )}
                          {booking.status === "completed" &&
                            hasReviewed(booking._id) && (
                              <span className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-100">
                                <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                                Reviewed
                              </span>
                            )}
                          {booking.status !== "completed" &&
                            booking.status !== "cancelled" && (
                              <button
                                onClick={() => handleCancelBooking(booking._id)}
                                disabled={cancelingId === booking._id}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all border border-red-100 disabled:opacity-50"
                              >
                                {cancelingId === booking._id ? (
                                  <>
                                    <Loader className="w-4 h-4 animate-spin" />{" "}
                                    Canceling...
                                  </>
                                ) : (
                                  <>
                                    <X className="w-4 h-4" /> Cancel
                                  </>
                                )}
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Invoice Details
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedInvoice.invoiceNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Status Banner */}
              <div
                className={`rounded-xl p-4 flex items-center gap-3 ${
                  selectedInvoice.status === "paid"
                    ? "bg-emerald-50 border border-emerald-200"
                    : selectedInvoice.status === "overdue"
                      ? "bg-red-50 border border-red-200"
                      : selectedInvoice.status === "sent"
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-50 border border-gray-200"
                }`}
              >
                {selectedInvoice.status === "paid" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : selectedInvoice.status === "overdue" ? (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <Clock className="w-5 h-5 text-blue-600" />
                )}
                <div>
                  <p
                    className={`text-sm font-bold ${
                      selectedInvoice.status === "paid"
                        ? "text-emerald-700"
                        : selectedInvoice.status === "overdue"
                          ? "text-red-700"
                          : "text-blue-700"
                    }`}
                  >
                    {selectedInvoice.status === "paid"
                      ? "Payment Received"
                      : selectedInvoice.status === "overdue"
                        ? "Payment Overdue"
                        : selectedInvoice.status === "sent"
                          ? "Awaiting Payment"
                          : "Draft"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedInvoice.status === "paid" && selectedInvoice.paidAt
                      ? `Paid on ${new Date(selectedInvoice.paidAt).toLocaleDateString()}`
                      : `Due ${new Date(selectedInvoice.dueDate).toLocaleDateString()}`}
                  </p>
                </div>
              </div>

              {/* Service Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Service
                  </span>
                </div>
                <p className="font-semibold text-gray-900">
                  {selectedInvoice.bookingId?.serviceId?.name ||
                    "Vehicle Service"}
                </p>
                {selectedInvoice.bookingId?.bookingDate && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Booked for{" "}
                    {new Date(
                      selectedInvoice.bookingId.bookingDate,
                    ).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>

              {/* Line Items */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Receipt className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Items
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedInvoice.items?.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-sm py-1"
                    >
                      <div>
                        <p className="text-gray-800 font-medium">
                          {item.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          ${item.unitPrice?.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ${item.total?.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-3 pt-3 space-y-1.5">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>${selectedInvoice.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>
                      Tax ({((selectedInvoice.taxRate || 0) * 100).toFixed(0)}%)
                    </span>
                    <span>${selectedInvoice.taxAmount?.toFixed(2)}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Discount</span>
                      <span>-${selectedInvoice.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-200">
                    <span>Total</span>
                    <span>${selectedInvoice.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="flex gap-3">
                <div className="flex-1 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Invoice Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(selectedInvoice.createdAt).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </p>
                </div>
                <div className="flex-1 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Due Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(selectedInvoice.dueDate).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </p>
                </div>
                {selectedInvoice.paymentMethod && (
                  <div className="flex-1 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Payment</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5" />{" "}
                      {selectedInvoice.paymentMethod}
                    </p>
                  </div>
                )}
              </div>

              {selectedInvoice.notes && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                    Notes
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedInvoice.notes}
                  </p>
                </div>
              )}

              {/* Pay Now Section */}
              {(selectedInvoice.status === "sent" ||
                selectedInvoice.status === "overdue") && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" /> Choose Payment Method
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => setSelectedPaymentMethod("card")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        selectedPaymentMethod === "card"
                          ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                          : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      <CreditCard className="w-6 h-6" />
                      <span className="text-sm font-bold">Card</span>
                      <span
                        className={`text-[10px] ${
                          selectedPaymentMethod === "card"
                            ? "text-blue-100"
                            : "text-gray-400"
                        }`}
                      >
                        Debit / Credit
                      </span>
                    </button>
                    <button
                      onClick={() => setSelectedPaymentMethod("cash")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        selectedPaymentMethod === "cash"
                          ? "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                          : "border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50"
                      }`}
                    >
                      <DollarSign className="w-6 h-6" />
                      <span className="text-sm font-bold">Cash</span>
                      <span
                        className={`text-[10px] ${
                          selectedPaymentMethod === "cash"
                            ? "text-emerald-100"
                            : "text-gray-400"
                        }`}
                      >
                        Pay at counter
                      </span>
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      handlePayInvoice(
                        selectedInvoice._id,
                        selectedPaymentMethod,
                      )
                    }
                    disabled={!selectedPaymentMethod || payingInvoice}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {payingInvoice ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />{" "}
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Pay $
                        {selectedInvoice.totalAmount?.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Booking Details
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  #{selectedBooking._id.slice(-8)}
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Status Progress */}
              {selectedBooking.status !== "cancelled" && (
                <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Service Progress
                  </p>
                  <div className="flex items-center justify-between">
                    {statusFlow.map((s, i) => {
                      const currentIdx = statusFlow.indexOf(
                        selectedBooking.status,
                      );
                      const done = i <= currentIdx;
                      const active = s === selectedBooking.status;
                      const StepIcon = statusConfig[s]?.icon || Clock;
                      return (
                        <div key={s} className="flex items-center flex-1">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                active
                                  ? "border-blue-600 bg-blue-600 text-white scale-110"
                                  : done
                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                    : "border-gray-300 bg-white text-gray-300"
                              }`}
                            >
                              {done && !active ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <StepIcon className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <span
                              className={`text-[8px] font-bold mt-1.5 capitalize ${active ? "text-blue-600" : done ? "text-emerald-600" : "text-gray-400"}`}
                            >
                              {s.replace("-", " ")}
                            </span>
                          </div>
                          {i < statusFlow.length - 1 && (
                            <div
                              className={`flex-1 h-0.5 mx-1.5 rounded ${i < currentIdx ? "bg-emerald-400" : "bg-gray-200"}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedBooking.status === "cancelled" && (
                <div className="bg-red-50 rounded-xl p-4 border border-red-100 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-red-700">
                      Booking Cancelled
                    </p>
                    <p className="text-xs text-red-500">
                      This booking has been cancelled
                    </p>
                  </div>
                </div>
              )}

              {/* Service */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Service
                  </span>
                </div>
                <p className="font-bold text-gray-900 text-lg">
                  {selectedBooking.serviceId?.name}
                </p>
                <p className="text-xl font-bold text-blue-600 mt-1">
                  ${selectedBooking.totalPrice}
                </p>
              </div>

              {/* Vehicle */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Car className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </span>
                </div>
                <p className="font-semibold text-gray-900">
                  {selectedBooking.vehicleInfo.year}{" "}
                  {selectedBooking.vehicleInfo.make}{" "}
                  {selectedBooking.vehicleInfo.model}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedBooking.vehicleInfo.licensePlate}
                  {selectedBooking.vehicleInfo.color
                    ? ` · ${selectedBooking.vehicleInfo.color}`
                    : ""}
                </p>
              </div>

              {/* Schedule */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Schedule
                  </span>
                </div>
                <p className="font-semibold text-gray-900">
                  {new Date(selectedBooking.bookingDate).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" /> {selectedBooking.timeSlot}
                </p>
              </div>

              {/* Tracking Timeline */}
              {selectedBooking.statusHistory &&
                selectedBooking.statusHistory.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status History
                      </span>
                    </div>
                    <div className="relative ml-2">
                      <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200" />
                      <div className="space-y-3">
                        {[...selectedBooking.statusHistory]
                          .reverse()
                          .map((entry, i) => {
                            const sc2 =
                              statusConfig[entry.status] ||
                              statusConfig.pending;
                            return (
                              <div
                                key={i}
                                className="flex items-start gap-3 relative"
                              >
                                <div className="relative z-10 mt-0.5">
                                  <div
                                    className={`w-4 h-4 rounded-full ${i === 0 ? sc2.dot : "bg-gray-300"} border-2 border-white`}
                                  />
                                </div>
                                <div className="flex-1">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold capitalize border ${sc2.color}`}
                                  >
                                    {entry.status}
                                  </span>
                                  {entry.note && (
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {entry.note}
                                    </p>
                                  )}
                                  <p className="text-[10px] text-gray-300 mt-0.5">
                                    {new Date(entry.timestamp).toLocaleString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <StickyNote className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Notes
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              {selectedBooking.status !== "completed" &&
                selectedBooking.status !== "cancelled" && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        handleCancelBooking(selectedBooking._id);
                      }}
                      disabled={cancelingId === selectedBooking._id}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all border border-red-100 disabled:opacity-50"
                    >
                      {cancelingId === selectedBooking._id ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />{" "}
                          Canceling...
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" /> Cancel Booking
                        </>
                      )}
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowReviewForm(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Write a Review
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {showReviewForm.serviceId?.name || "Service"} ·{" "}
                  {new Date(showReviewForm.bookingDate).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" },
                  )}
                </p>
              </div>
              <button
                onClick={() => setShowReviewForm(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Star Rating */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setReviewData({ ...reviewData, rating: star })
                      }
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 transition ${
                          star <= reviewData.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-200 hover:text-amber-200"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-semibold text-gray-600">
                    {reviewData.rating}/5
                  </span>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={reviewData.title}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, title: e.target.value })
                  }
                  placeholder="Summarize your experience..."
                  maxLength={100}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, comment: e.target.value })
                  }
                  placeholder="Tell us about your experience with this service..."
                  rows={4}
                  maxLength={1000}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {reviewData.comment.length}/1000
                </p>
              </div>

              {reviewError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{reviewError}</p>
                </div>
              )}

              <button
                onClick={() => handleSubmitReview(showReviewForm)}
                disabled={
                  submittingReview ||
                  !reviewData.title.trim() ||
                  !reviewData.comment.trim()
                }
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReview ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;
