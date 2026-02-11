import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  LogOut,
  ClipboardList,
  Clock,
  CheckCircle2,
  Loader,
  AlertCircle,
  BarChart3,
  Filter,
  Inbox,
  ShieldCheck,
} from "lucide-react";

function AdminDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || user.role !== "admin") {
      navigate("/");
      return;
    }

    fetchBookings(token);
  }, [navigate]);

  const fetchBookings = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    const token = localStorage.getItem("token");
    setUpdatingId(bookingId);

    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/${bookingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setBookings(
          bookings.map((b) =>
            b._id === bookingId ? { ...b, status: newStatus } : b,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating booking:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getStatusStyle = (status) => {
    const map = {
      pending: "bg-amber-50 text-amber-700 border border-amber-200",
      confirmed: "bg-blue-50 text-blue-700 border border-blue-200",
      "in-progress": "bg-violet-50 text-violet-700 border border-violet-200",
      completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      cancelled: "bg-red-50 text-red-700 border border-red-200",
    };
    return map[status] || "bg-gray-50 text-gray-700 border border-gray-200";
  };

  const filteredBookings =
    filterStatus === "all"
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);

  const stats = [
    {
      label: "Total",
      value: bookings.length,
      Icon: BarChart3,
      accent: "text-gray-900",
      bg: "bg-white",
      border: "border-gray-100",
    },
    {
      label: "Pending",
      value: bookings.filter((b) => b.status === "pending").length,
      Icon: Clock,
      accent: "text-amber-600",
      bg: "bg-amber-50/50",
      border: "border-amber-100",
    },
    {
      label: "Confirmed",
      value: bookings.filter((b) => b.status === "confirmed").length,
      Icon: CheckCircle2,
      accent: "text-blue-600",
      bg: "bg-blue-50/50",
      border: "border-blue-100",
    },
    {
      label: "In Progress",
      value: bookings.filter((b) => b.status === "in-progress").length,
      Icon: Loader,
      accent: "text-violet-600",
      bg: "bg-violet-50/50",
      border: "border-violet-100",
    },
    {
      label: "Completed",
      value: bookings.filter((b) => b.status === "completed").length,
      Icon: ShieldCheck,
      accent: "text-emerald-600",
      bg: "bg-emerald-50/50",
      border: "border-emerald-100",
    },
  ];

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 group"
          >
            <h1 className="text-xl font-extrabold text-gray-900">
              Auto<span className="text-blue-600">Serve</span>
            </h1>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </nav>
      </header>

      <main className="flex-1 container mx-auto max-w-7xl px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            Booking Management
          </h2>
          <p className="text-gray-500 text-sm">
            Monitor and manage all vehicle service bookings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {stats.map(({ label, value, Icon, accent, bg, border }) => (
            <div
              key={label}
              className={`${bg} rounded-xl border ${border} p-5 transition-all hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent} bg-white/80`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className={`text-3xl font-bold ${accent}`}>{value}</p>
              <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {filterOptions.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilterStatus(value)}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                filterStatus === value
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Bookings Table */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <svg
              className="animate-spin w-8 h-8 text-blue-600 mx-auto mb-3"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p className="text-gray-500 text-sm">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No bookings found
            </h3>
            <p className="text-gray-500 text-sm">
              No bookings match the current filter
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {booking.customerId?.name || "N/A"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {booking.customerId?.email || "N/A"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-800">
                          {booking.serviceId?.name || "N/A"}
                        </p>
                        <p className="text-xs text-blue-600 font-bold mt-0.5">
                          ${booking.totalPrice}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-800">
                          {booking.vehicleInfo.year} {booking.vehicleInfo.make}{" "}
                          {booking.vehicleInfo.model}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">
                          {booking.vehicleInfo.licensePlate}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-800">
                          {new Date(booking.bookingDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {booking.timeSlot}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${getStatusStyle(booking.status)}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={booking.status}
                          onChange={(e) =>
                            handleStatusUpdate(booking._id, e.target.value)
                          }
                          disabled={updatingId === booking._id}
                          className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 hover:border-gray-300 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
