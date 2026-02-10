import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  Loader,
  AlertCircle,
  BarChart3,
  Filter,
  Inbox,
  ShieldCheck,
  Eye,
  X,
  CalendarClock,
  DollarSign,
  Car,
  StickyNote,
  User,
  Search,
  ArrowRight,
  Zap,
  ChevronDown,
  Activity,
} from "lucide-react";

const API = "http://localhost:5000/api";

const priorityConfig = {
  low: { label: "Low", color: "bg-gray-100 text-gray-600 border-gray-200" },
  normal: {
    label: "Normal",
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  high: { label: "High", color: "bg-amber-50 text-amber-700 border-amber-200" },
  urgent: { label: "Urgent", color: "bg-red-50 text-red-700 border-red-200" },
};

const statusFlow = ["pending", "confirmed", "in-progress", "completed"];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [statusNote, setStatusNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/bookings`, {
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

  const handleStatusUpdate = async (bookingId, newStatus, note = "") => {
    const token = localStorage.getItem("token");
    setUpdatingId(bookingId);
    try {
      const res = await fetch(`${API}/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, note }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchBookings();
        if (selectedBooking?._id === bookingId) {
          const refreshed = await fetch(`${API}/bookings/${bookingId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const refreshedData = await refreshed.json();
          if (refreshedData.success) setSelectedBooking(refreshedData.data);
        }
      }
    } catch (err) {
      console.error("Error updating booking:", err);
    } finally {
      setUpdatingId(null);
      setShowNoteInput(false);
      setStatusNote("");
      setPendingStatus(null);
    }
  };

  const handlePriorityUpdate = async (bookingId, priority) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ priority }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings(
          bookings.map((b) => (b._id === bookingId ? { ...b, priority } : b)),
        );
        if (selectedBooking?._id === bookingId)
          setSelectedBooking({ ...selectedBooking, priority });
      }
    } catch (err) {
      console.error("Error updating priority:", err);
    }
  };

  const handleTechUpdate = async (bookingId, assignedTech) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assignedTech }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings(
          bookings.map((b) =>
            b._id === bookingId ? { ...b, assignedTech } : b,
          ),
        );
        if (selectedBooking?._id === bookingId)
          setSelectedBooking({ ...selectedBooking, assignedTech });
      }
    } catch (err) {
      console.error("Error updating tech:", err);
    }
  };

  const openDetailModal = async (booking) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/bookings/${booking._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setSelectedBooking(data.data);
      else setSelectedBooking(booking);
    } catch {
      setSelectedBooking(booking);
    }
  };

  const exportCSV = () => {
    const rows = [
      [
        "Customer",
        "Email",
        "Service",
        "Vehicle",
        "Date",
        "Time",
        "Status",
        "Priority",
        "Price",
      ],
    ];
    filteredBookings.forEach((b) => {
      rows.push([
        b.customerId?.name || "",
        b.customerId?.email || "",
        b.serviceId?.name || "",
        `${b.vehicleInfo.year} ${b.vehicleInfo.make} ${b.vehicleInfo.model}`,
        new Date(b.bookingDate).toLocaleDateString(),
        b.timeSlot,
        b.status,
        b.priority || "normal",
        b.totalPrice,
      ]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusStyle = (status) =>
    ({
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      confirmed: "bg-blue-50 text-blue-700 border-blue-200",
      "in-progress": "bg-violet-50 text-violet-700 border-violet-200",
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    })[status] || "bg-gray-50 text-gray-700 border-gray-200";

  const statusIconMap = {
    pending: <Clock className="w-3.5 h-3.5 text-amber-500" />,
    confirmed: <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />,
    "in-progress": <Loader className="w-3.5 h-3.5 text-violet-500" />,
    completed: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />,
    cancelled: <AlertCircle className="w-3.5 h-3.5 text-red-500" />,
  };

  let filteredBookings =
    filterStatus === "all"
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredBookings = filteredBookings.filter(
      (b) =>
        (b.customerId?.name || "").toLowerCase().includes(q) ||
        (b.customerId?.email || "").toLowerCase().includes(q) ||
        (b.serviceId?.name || "").toLowerCase().includes(q) ||
        (b.vehicleInfo?.licensePlate || "").toLowerCase().includes(q) ||
        (b.vehicleInfo?.make || "").toLowerCase().includes(q),
    );
  }

  if (sortBy === "newest")
    filteredBookings.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  else if (sortBy === "oldest")
    filteredBookings.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    );
  else if (sortBy === "price-high")
    filteredBookings.sort((a, b) => b.totalPrice - a.totalPrice);
  else if (sortBy === "price-low")
    filteredBookings.sort((a, b) => a.totalPrice - b.totalPrice);

  const stats = [
    {
      label: "Total",
      value: bookings.length,
      Icon: BarChart3,
      color: "text-gray-900",
      bg: "bg-white",
      border: "border-gray-100",
    },
    {
      label: "Pending",
      value: bookings.filter((b) => b.status === "pending").length,
      Icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50/50",
      border: "border-amber-100",
    },
    {
      label: "Confirmed",
      value: bookings.filter((b) => b.status === "confirmed").length,
      Icon: CheckCircle2,
      color: "text-blue-600",
      bg: "bg-blue-50/50",
      border: "border-blue-100",
    },
    {
      label: "In Progress",
      value: bookings.filter((b) => b.status === "in-progress").length,
      Icon: Loader,
      color: "text-violet-600",
      bg: "bg-violet-50/50",
      border: "border-violet-100",
    },
    {
      label: "Completed",
      value: bookings.filter((b) => b.status === "completed").length,
      Icon: ShieldCheck,
      color: "text-emerald-600",
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Booking Management
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Track and manage all service bookings
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all"
        >
          <ArrowRight className="w-4 h-4 rotate-90" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map(({ label, value, Icon, color, bg, border }) => (
          <div
            key={label}
            className={`${bg} rounded-xl border ${border} p-4 transition-all hover:shadow-md`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} bg-white/80 mb-2`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs font-medium text-gray-400 mt-0.5 uppercase tracking-wider">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Search + Filters + Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, service, vehicle..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 hover:border-gray-300 transition"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price-high">Price: High to Low</option>
          <option value="price-low">Price: Low to High</option>
        </select>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
        {filterOptions.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilterStatus(value)}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
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
          <Loader className="w-8 h-8 text-blue-600 mx-auto mb-3 animate-spin" />
          <p className="text-gray-500 text-sm">Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-7 h-7 text-gray-300" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            No bookings found
          </h3>
          <p className="text-gray-400 text-sm">
            No bookings match the current filter
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    "Customer",
                    "Service",
                    "Vehicle",
                    "Schedule",
                    "Priority",
                    "Status",
                    "Action",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBookings.map((booking) => {
                  const pri = priorityConfig[booking.priority || "normal"];
                  return (
                    <tr
                      key={booking._id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-gray-900">
                          {booking.customerId?.name || "N/A"}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {booking.customerId?.email || "N/A"}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-gray-800">
                          {booking.serviceId?.name || "N/A"}
                        </p>
                        <p className="text-xs text-blue-600 font-bold">
                          ${booking.totalPrice}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-gray-800">
                          {booking.vehicleInfo.year} {booking.vehicleInfo.make}{" "}
                          {booking.vehicleInfo.model}
                        </p>
                        <p className="text-[11px] text-gray-400 font-mono">
                          {booking.vehicleInfo.licensePlate}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-gray-800">
                          {new Date(booking.bookingDate).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" },
                          )}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {booking.timeSlot}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${pri.color}`}
                        >
                          {pri.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border ${getStatusStyle(booking.status)}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={booking.status}
                          onChange={(e) =>
                            handleStatusUpdate(booking._id, e.target.value)
                          }
                          disabled={updatingId === booking._id}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 hover:border-gray-300 transition disabled:bg-gray-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => openDetailModal(booking)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal with Tracking Timeline */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setSelectedBooking(null);
            setShowNoteInput(false);
            setStatusNote("");
            setPendingStatus(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Booking Details
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  ID: {selectedBooking._id?.slice(-8)}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedBooking(null);
                  setShowNoteInput(false);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status Flow Tracker */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl p-4">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Progress Tracker
                </p>
                <div className="flex items-center justify-between">
                  {statusFlow.map((s, i) => {
                    const currentIdx = statusFlow.indexOf(
                      selectedBooking.status,
                    );
                    const done =
                      i <= currentIdx && selectedBooking.status !== "cancelled";
                    const active = s === selectedBooking.status;
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
                              statusIconMap[s]
                            )}
                          </div>
                          <span
                            className={`text-[9px] font-semibold mt-1.5 capitalize ${active ? "text-blue-600" : done ? "text-emerald-600" : "text-gray-400"}`}
                          >
                            {s.replace("-", " ")}
                          </span>
                        </div>
                        {i < statusFlow.length - 1 && (
                          <div
                            className={`flex-1 h-0.5 mx-2 rounded ${i < currentIdx ? "bg-emerald-400" : "bg-gray-200"}`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Two columns: Info + Actions */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Left: Info Cards */}
                <div className="space-y-3">
                  {/* Customer */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Customer
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {selectedBooking.customerId?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {selectedBooking.customerId?.email} ·{" "}
                      {selectedBooking.customerId?.phone}
                    </p>
                  </div>
                  {/* Service */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                        Service
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {selectedBooking.serviceId?.name}
                    </p>
                    <p className="text-lg font-bold text-blue-600 mt-1">
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
                    <p className="text-xs text-gray-400">
                      {selectedBooking.vehicleInfo.licensePlate}
                      {selectedBooking.vehicleInfo.color
                        ? ` · ${selectedBooking.vehicleInfo.color}`
                        : ""}
                    </p>
                  </div>
                  {/* Schedule */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarClock className="w-4 h-4 text-gray-500" />
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
                      <Clock className="w-3 h-3" />
                      {selectedBooking.timeSlot}
                    </p>
                  </div>
                </div>

                {/* Right: Actions & Timeline */}
                <div className="space-y-3">
                  {/* Priority & Tech Assignment */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Priority Level
                      </label>
                      <div className="flex gap-1.5 mt-1.5">
                        {Object.entries(priorityConfig).map(([key, cfg]) => (
                          <button
                            key={key}
                            onClick={() =>
                              handlePriorityUpdate(selectedBooking._id, key)
                            }
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all ${
                              (selectedBooking.priority || "normal") === key
                                ? cfg.color +
                                  " ring-2 ring-offset-1 ring-blue-300"
                                : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                            }`}
                          >
                            {cfg.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Assigned Technician
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBooking.assignedTech || ""}
                        onBlur={(e) =>
                          handleTechUpdate(selectedBooking._id, e.target.value)
                        }
                        placeholder="Enter technician name..."
                        className="w-full mt-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>

                  {/* Status Update with Note */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Update Status
                    </label>
                    <div className="mt-2 space-y-2">
                      <select
                        value={pendingStatus || selectedBooking.status}
                        onChange={(e) => {
                          setPendingStatus(e.target.value);
                          setShowNoteInput(true);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {showNoteInput &&
                        pendingStatus &&
                        pendingStatus !== selectedBooking.status && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={statusNote}
                              onChange={(e) => setStatusNote(e.target.value)}
                              placeholder="Add a note (optional)..."
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-500 transition"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleStatusUpdate(
                                    selectedBooking._id,
                                    pendingStatus,
                                    statusNote,
                                  )
                                }
                                disabled={updatingId === selectedBooking._id}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 transition disabled:opacity-50"
                              >
                                {updatingId === selectedBooking._id
                                  ? "Updating..."
                                  : "Confirm Update"}
                              </button>
                              <button
                                onClick={() => {
                                  setShowNoteInput(false);
                                  setPendingStatus(null);
                                  setStatusNote("");
                                }}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-50 transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedBooking.notes && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <StickyNote className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Customer Notes
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {selectedBooking.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status History Timeline */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Tracking Timeline
                  </span>
                </div>
                {selectedBooking.statusHistory &&
                selectedBooking.statusHistory.length > 0 ? (
                  <div className="relative ml-2">
                    {/* Timeline line */}
                    <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200" />
                    <div className="space-y-4">
                      {[...selectedBooking.statusHistory]
                        .reverse()
                        .map((entry, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 relative"
                          >
                            <div className="relative z-10 mt-0.5">
                              <div
                                className={`w-4 h-4 rounded-full border-2 ${
                                  i === 0
                                    ? "border-blue-500 bg-blue-500"
                                    : "border-gray-300 bg-white"
                                } flex items-center justify-center`}
                              >
                                {i === 0 && (
                                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1 pb-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase capitalize ${getStatusStyle(
                                    entry.status,
                                  ).replace("border-", "border ")}`}
                                >
                                  {entry.status}
                                </span>
                                {i === 0 && (
                                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-[9px] font-bold">
                                    LATEST
                                  </span>
                                )}
                              </div>
                              {entry.note && (
                                <p className="text-xs text-gray-600 mt-1">
                                  {entry.note}
                                </p>
                              )}
                              <p className="text-[10px] text-gray-400 mt-1">
                                {new Date(entry.timestamp).toLocaleString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-gray-400">
                      No tracking history available yet
                    </p>
                    <p className="text-[10px] text-gray-300 mt-1">
                      Status changes will be recorded here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
