import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Loader,
  Search,
  ChevronDown,
  X,
  Inbox,
  Send,
  CheckCircle2,
  Mail,
  Smartphone,
  Users,
  MessageSquare,
  Filter,
  Trash2,
  Eye,
  Megaphone,
  BarChart3,
} from "lucide-react";

const API = "http://localhost:5000/api";

const categoryColors = {
  "booking-confirmation": "bg-emerald-50 text-emerald-600",
  "booking-update": "bg-blue-50 text-blue-600",
  "booking-reminder": "bg-amber-50 text-amber-600",
  "booking-cancelled": "bg-red-50 text-red-600",
  "invoice-sent": "bg-purple-50 text-purple-600",
  "payment-received": "bg-green-50 text-green-600",
  "service-complete": "bg-cyan-50 text-cyan-600",
  general: "bg-gray-50 text-gray-600",
};

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [sendData, setSendData] = useState({
    recipientId: "",
    type: "email",
    subject: "",
    message: "",
  });
  const [broadcastData, setBroadcastData] = useState({
    type: "email",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [notifRes, statsRes, custRes] = await Promise.all([
        fetch(`${API}/notifications`, { headers }),
        fetch(`${API}/notifications/stats`, { headers }),
        fetch(`${API}/admin/customers`, { headers }),
      ]);
      const [notifData, statsData, custData] = await Promise.all([
        notifRes.json(),
        statsRes.json(),
        custRes.json(),
      ]);
      if (notifData.success) setNotifications(notifData.data);
      if (statsData.success) setStats(statsData.data);
      if (custData.success) setCustomers(custData.data);
    } catch (err) {
      console.error("Error fetching:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const token = localStorage.getItem("token");
    setSending(true);
    try {
      const res = await fetch(`${API}/notifications/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sendData),
      });
      const data = await res.json();
      if (data.success) {
        setShowSendModal(false);
        setSendData({
          recipientId: "",
          type: "email",
          subject: "",
          message: "",
        });
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Error sending notification");
    } finally {
      setSending(false);
    }
  };

  const handleBroadcast = async () => {
    if (!window.confirm("Send this notification to ALL customers?")) return;
    const token = localStorage.getItem("token");
    setSending(true);
    try {
      const res = await fetch(`${API}/notifications/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(broadcastData),
      });
      const data = await res.json();
      if (data.success) {
        setShowBroadcastModal(false);
        setBroadcastData({ type: "email", subject: "", message: "" });
        fetchData();
        alert(`Sent to ${data.data.sentCount} customers`);
      }
    } catch (err) {
      alert("Error broadcasting");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API}/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifications.filter((n) => n._id !== id));
      if (selectedNotification?._id === id) setSelectedNotification(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/notifications/${id}/admin-read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
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
  };

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/notifications/admin-mark-all-read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error("Mark all read failed:", err);
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.isRead) handleMarkAsRead(n._id);
    const cat = n.category || "";
    if (cat.startsWith("invoice") || cat.startsWith("payment")) {
      navigate("/admin/billing");
    } else if (cat.startsWith("booking") || cat === "service-complete") {
      navigate("/admin/bookings");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered = notifications
    .filter((n) => {
      if (filterCategory !== "all" && n.category !== filterCategory)
        return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          n.subject?.toLowerCase().includes(q) ||
          n.message?.toLowerCase().includes(q) ||
          n.recipientId?.name?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Send and manage customer notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Mark All
              Read
              <span className="ml-0.5 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            </button>
          )}
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-400 transition"
          >
            <Megaphone className="w-4 h-4" /> Broadcast
          </button>
          <button
            onClick={() => setShowSendModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition"
          >
            <Send className="w-4 h-4" /> Send Notification
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Sent",
              value: stats.totalNotifications,
              Icon: Mail,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Email Sent",
              value: stats.emailSent,
              Icon: Mail,
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
            {
              label: "SMS Sent",
              value: stats.smsSent,
              Icon: Smartphone,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: "Read",
              value: stats.readNotifications,
              Icon: CheckCircle2,
              color: "text-green-600",
              bg: "bg-green-50",
            },
          ].map(({ label, value, Icon, color, bg }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {value || 0}
                  </p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="relative">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Categories</option>
            <option value="booking-confirmation">Booking Confirmation</option>
            <option value="booking-update">Booking Update</option>
            <option value="booking-reminder">Booking Reminder</option>
            <option value="invoice-sent">Invoice Sent</option>
            <option value="payment-received">Payment Received</option>
            <option value="general">General</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No notifications found
          </h3>
          <p className="text-sm text-gray-500">
            Send a notification to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const catColor =
              categoryColors[n.category] || categoryColors.general;
            return (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all group cursor-pointer ${
                  n.isRead
                    ? "border-gray-100"
                    : "border-indigo-200 bg-indigo-50/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${catColor}`}
                    >
                      {n.type === "sms" ? (
                        <Smartphone className="w-5 h-5" />
                      ) : (
                        <Mail className="w-5 h-5" />
                      )}
                    </div>
                    {!n.isRead && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={`text-sm font-bold ${n.isRead ? "text-gray-900" : "text-indigo-900"}`}
                      >
                        {n.subject}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${catColor}`}
                      >
                        {n.category?.replace(/-/g, " ")}
                      </span>
                      {n.isRead && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      To: {n.recipientId?.name || "Unknown"} ·{" "}
                      {n.recipientId?.email}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                      {n.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs text-gray-400 mr-2">
                      {new Date(n.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {!n.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(n._id);
                        }}
                        title="Mark as read"
                        className="p-2 rounded-xl hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition opacity-0 group-hover:opacity-100"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNotification(n);
                      }}
                      className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition opacity-0 group-hover:opacity-100"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(n._id);
                      }}
                      className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedNotification && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Notification Details
                </h3>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="p-2 rounded-xl hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                    Subject
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedNotification.subject}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                    Recipient
                  </p>
                  <p className="text-sm text-gray-900">
                    {selectedNotification.recipientId?.name} (
                    {selectedNotification.recipientId?.email})
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                    Message
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedNotification.message}
                  </p>
                </div>
                <div className="flex gap-3 text-sm">
                  <div className="flex-1 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {selectedNotification.type}
                    </p>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {selectedNotification.category?.replace(/-/g, " ")}
                    </p>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Read</p>
                    <p className="font-semibold text-gray-900">
                      {selectedNotification.isRead ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      {showSendModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowSendModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Send Notification
              </h3>
              <button
                onClick={() => setShowSendModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                  Recipient
                </label>
                <select
                  value={sendData.recipientId}
                  onChange={(e) =>
                    setSendData({ ...sendData, recipientId: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                  Type
                </label>
                <select
                  value={sendData.type}
                  onChange={(e) =>
                    setSendData({ ...sendData, type: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={sendData.subject}
                  onChange={(e) =>
                    setSendData({ ...sendData, subject: e.target.value })
                  }
                  placeholder="Notification subject"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                  Message
                </label>
                <textarea
                  value={sendData.message}
                  onChange={(e) =>
                    setSendData({ ...sendData, message: e.target.value })
                  }
                  rows={4}
                  placeholder="Write your message..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={
                  sending ||
                  !sendData.recipientId ||
                  !sendData.subject ||
                  !sendData.message
                }
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-500 transition disabled:opacity-50"
              >
                {sending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}{" "}
                Send Notification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowBroadcastModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                <Megaphone className="w-5 h-5 inline mr-2 text-amber-500" />
                Broadcast to All Customers
              </h3>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                This will send a notification to all registered customers.
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                  Type
                </label>
                <select
                  value={broadcastData.type}
                  onChange={(e) =>
                    setBroadcastData({ ...broadcastData, type: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={broadcastData.subject}
                  onChange={(e) =>
                    setBroadcastData({
                      ...broadcastData,
                      subject: e.target.value,
                    })
                  }
                  placeholder="Broadcast subject"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                  Message
                </label>
                <textarea
                  value={broadcastData.message}
                  onChange={(e) =>
                    setBroadcastData({
                      ...broadcastData,
                      message: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Write your broadcast message..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
              <button
                onClick={handleBroadcast}
                disabled={
                  sending || !broadcastData.subject || !broadcastData.message
                }
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-white font-semibold text-sm rounded-xl hover:bg-amber-400 transition disabled:opacity-50"
              >
                {sending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Megaphone className="w-4 h-4" />
                )}{" "}
                Send Broadcast
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
