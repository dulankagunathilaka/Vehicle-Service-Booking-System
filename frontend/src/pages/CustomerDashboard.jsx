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
} from "lucide-react";

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
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token) {
      navigate("/signin");
      return;
    }
    setUser(JSON.parse(userData));
    fetchBookings(token);
  }, [navigate]);

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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition">
              <Car className="w-5 h-5 text-white" />
            </div>
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

            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition text-gray-400 hover:text-gray-600">
              <Bell className="w-5 h-5" />
              {activeBookings.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
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

        {/* Filter Tabs + Bookings */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Bookings History</h3>
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
            <p className="text-gray-400 text-sm">Loading your bookings...</p>
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
              const sc = statusConfig[booking.status] || statusConfig.pending;
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
                          {booking.vehicleInfo.year} {booking.vehicleInfo.make}{" "}
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
                              <div key={s} className="flex items-center flex-1">
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
      </main>

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
    </div>
  );
}

export default CustomerDashboard;
