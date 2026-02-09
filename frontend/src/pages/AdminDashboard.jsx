import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredBookings =
    filterStatus === "all"
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    inProgress: bookings.filter((b) => b.status === "in-progress").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 hover:opacity-80 transition"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">AutoServe</h1>
              <p className="text-xs text-blue-600">Admin Panel</p>
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            Booking Management
          </h2>
          <p className="text-gray-600">
            Manage all vehicle service bookings and update their status
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Total</p>
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          </div>

          <div className="bg-yellow-50 rounded-lg shadow p-6">
            <p className="text-yellow-600 text-sm font-semibold mb-2">
              Pending
            </p>
            <p className="text-3xl font-bold text-yellow-800">
              {stats.pending}
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg shadow p-6">
            <p className="text-blue-600 text-sm font-semibold mb-2">
              Confirmed
            </p>
            <p className="text-3xl font-bold text-blue-800">
              {stats.confirmed}
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg shadow p-6">
            <p className="text-purple-600 text-sm font-semibold mb-2">
              In Progress
            </p>
            <p className="text-3xl font-bold text-purple-800">
              {stats.inProgress}
            </p>
          </div>

          <div className="bg-green-50 rounded-lg shadow p-6">
            <p className="text-green-600 text-sm font-semibold mb-2">
              Completed
            </p>
            <p className="text-3xl font-bold text-green-800">
              {stats.completed}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-8 flex gap-2 flex-wrap">
          {["all", "pending", "confirmed", "in-progress", "completed"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filterStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-blue-600"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ),
          )}
        </div>

        {/* Bookings Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No bookings found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">
                    Service
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">
                    Vehicle
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {booking.customerId?.name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.customerId?.email || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-800">
                        {booking.serviceId?.name || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${booking.totalPrice}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-800">
                        {booking.vehicleInfo.year} {booking.vehicleInfo.make}{" "}
                        {booking.vehicleInfo.model}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.vehicleInfo.licensePlate}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-800">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.timeSlot}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(
                          booking.status,
                        )}`}
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
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
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
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
