import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CustomerDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);

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
      const response = await fetch(
        "http://localhost:5000/api/bookings/my-bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
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

  const handleCancelBooking = async (bookingId) => {
    const token = localStorage.getItem("token");
    setCancelingId(bookingId);

    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/${bookingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();

      if (data.success) {
        setBookings(
          bookings.map((b) =>
            b._id === bookingId ? { ...b, status: "cancelled" } : b,
          ),
        );
      }
    } catch (error) {
      console.error("Error canceling booking:", error);
    } finally {
      setCancelingId(null);
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
            </div>
          </button>

          <div className="flex items-center gap-6">
            <span className="text-gray-600">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">My Bookings</h2>
          <p className="text-gray-600">
            View and manage all your vehicle service bookings
          </p>
        </div>

        <button
          onClick={() => navigate("/booking")}
          className="mb-8 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
        >
          New Booking
        </button>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg mb-4">No bookings yet</p>
            <button
              onClick={() => navigate("/booking")}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Book Now
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {booking.serviceId?.name || "Service"}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Booking ID: {booking._id.slice(0, 8)}...
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full font-semibold text-sm capitalize ${getStatusColor(
                        booking.status,
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">
                        Vehicle Details
                      </h4>
                      <p className="text-gray-600">
                        {booking.vehicleInfo.year} {booking.vehicleInfo.make}{" "}
                        {booking.vehicleInfo.model}
                      </p>
                      <p className="text-gray-600">
                        License: {booking.vehicleInfo.licensePlate}
                      </p>
                      {booking.vehicleInfo.color && (
                        <p className="text-gray-600">
                          Color: {booking.vehicleInfo.color}
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">
                        Appointment
                      </h4>
                      <p className="text-gray-600">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600">{booking.timeSlot}</p>
                      <p className="text-blue-600 font-semibold">
                        ${booking.totalPrice}
                      </p>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-2">
                        Notes
                      </h4>
                      <p className="text-gray-600">{booking.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button className="px-6 py-2 bg-blue-100 text-blue-600 font-semibold rounded-lg hover:bg-blue-200 transition">
                      View Details
                    </button>
                    {booking.status !== "completed" &&
                      booking.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          disabled={cancelingId === booking._id}
                          className="px-6 py-2 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition disabled:bg-red-50 disabled:text-red-400"
                        >
                          {cancelingId === booking._id
                            ? "Canceling..."
                            : "Cancel Booking"}
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerDashboard;
