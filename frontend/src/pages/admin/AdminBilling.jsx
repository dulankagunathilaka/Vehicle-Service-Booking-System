import { useState, useEffect } from "react";
import {
  DollarSign,
  Loader,
  Search,
  Filter,
  ChevronDown,
  Eye,
  X,
  Inbox,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Plus,
  Trash2,
  CreditCard,
  TrendingUp,
  Receipt,
} from "lucide-react";

const API = "http://localhost:5000/api";

const statusConfig = {
  draft: {
    label: "Draft",
    color: "bg-gray-50 text-gray-600 border-gray-200",
  },
  sent: { label: "Sent", color: "bg-blue-50 text-blue-600 border-blue-200" },
  paid: {
    label: "Paid",
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  overdue: {
    label: "Overdue",
    color: "bg-red-50 text-red-600 border-red-200",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-50 text-gray-400 border-gray-200",
  },
};

export default function AdminBilling() {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [generateData, setGenerateData] = useState({
    bookingId: "",
    discount: 0,
    taxRate: 0.1,
    notes: "",
  });
  const [generating, setGenerating] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [invRes, statsRes, bookingsRes] = await Promise.all([
        fetch(`${API}/billing`, { headers }),
        fetch(`${API}/billing/stats/summary`, { headers }),
        fetch(`${API}/bookings`, { headers }),
      ]);
      const [invData, statsData, bookingsData] = await Promise.all([
        invRes.json(),
        statsRes.json(),
        bookingsRes.json(),
      ]);
      if (invData.success) setInvoices(invData.data);
      if (statsData.success) setStats(statsData.data);
      if (bookingsData.success) setBookings(bookingsData.data);
    } catch (err) {
      console.error("Error fetching billing:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    const token = localStorage.getItem("token");
    setGenerating(true);
    try {
      const res = await fetch(`${API}/billing/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(generateData),
      });
      const data = await res.json();
      if (data.success) {
        setShowGenerateModal(false);
        setGenerateData({
          bookingId: "",
          discount: 0,
          taxRate: 0.1,
          notes: "",
        });
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Error generating invoice");
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusUpdate = async (invoiceId, newStatus, paymentMethod) => {
    const token = localStorage.getItem("token");
    setUpdatingId(invoiceId);
    try {
      const body = { status: newStatus };
      if (paymentMethod) body.paymentMethod = paymentMethod;
      const res = await fetch(`${API}/billing/${invoiceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        if (selectedInvoice?._id === invoiceId) setSelectedInvoice(data.data);
      }
    } catch (err) {
      console.error("Error updating invoice:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (invoiceId) => {
    if (!window.confirm("Delete this invoice?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/billing/${invoiceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setInvoices(invoices.filter((i) => i._id !== invoiceId));
        if (selectedInvoice?._id === invoiceId) setSelectedInvoice(null);
        fetchData();
      }
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const filtered = invoices
    .filter((inv) => {
      if (filterStatus !== "all" && inv.status !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          inv.invoiceNumber?.toLowerCase().includes(q) ||
          inv.customerId?.name?.toLowerCase().includes(q) ||
          inv.customerId?.email?.toLowerCase().includes(q)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Billing & Invoices
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage invoices and payments
          </p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition-all"
        >
          <Plus className="w-4 h-4" /> Generate Invoice
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Revenue",
              value: `$${stats.totalRevenue?.toLocaleString() || 0}`,
              Icon: DollarSign,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: "Outstanding",
              value: `$${stats.outstanding?.toLocaleString() || 0}`,
              Icon: Clock,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "Paid Invoices",
              value: stats.paidInvoices,
              Icon: CheckCircle2,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Overdue",
              value: stats.overdueInvoices,
              Icon: AlertCircle,
              color: "text-red-600",
              bg: "bg-red-50",
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
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No invoices found
          </h3>
          <p className="text-sm text-gray-500">
            Generate an invoice from a booking to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => {
            const sc = statusConfig[inv.status] || statusConfig.draft;
            return (
              <div
                key={inv._id}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900">
                          {inv.invoiceNumber}
                        </p>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${sc.color}`}
                        >
                          {sc.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {inv.customerId?.name} · {inv.customerId?.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-gray-900">
                      ${inv.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Due{" "}
                      {new Date(inv.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {inv.status === "draft" && (
                      <button
                        onClick={() => handleStatusUpdate(inv._id, "sent")}
                        disabled={updatingId === inv._id}
                        className="p-2 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition"
                        title="Send invoice"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    {inv.status === "sent" && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(inv._id, "paid", "card")
                        }
                        disabled={updatingId === inv._id}
                        className="p-2 rounded-xl hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition"
                        title="Mark as paid"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(inv._id)}
                      className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
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

      {selectedInvoice && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedInvoice.invoiceNumber}
                  </h3>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${statusConfig[selectedInvoice.status]?.color}`}
                  >
                    {statusConfig[selectedInvoice.status]?.label}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Customer
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedInvoice.customerId?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedInvoice.customerId?.email} ·{" "}
                    {selectedInvoice.customerId?.phone}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Items
                  </p>
                  <div className="space-y-2">
                    {selectedInvoice.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.description} × {item.quantity}
                        </span>
                        <span className="font-semibold">
                          ${item.total.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 mt-3 pt-3 space-y-1">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span>
                      <span>${selectedInvoice.subtotal?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>
                        Tax ({(selectedInvoice.taxRate * 100).toFixed(0)}%)
                      </span>
                      <span>${selectedInvoice.taxAmount?.toFixed(2)}</span>
                    </div>
                    {selectedInvoice.discount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600">
                        <span>Discount</span>
                        <span>-${selectedInvoice.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold text-gray-900 pt-1">
                      <span>Total</span>
                      <span>${selectedInvoice.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 text-sm">
                  <div className="flex-1 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Due Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedInvoice.paidAt && (
                    <div className="flex-1 bg-emerald-50 rounded-xl p-3">
                      <p className="text-xs text-emerald-600">Paid On</p>
                      <p className="font-semibold text-emerald-700">
                        {new Date(selectedInvoice.paidAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {selectedInvoice.status === "draft" && (
                  <button
                    onClick={() =>
                      handleStatusUpdate(selectedInvoice._id, "sent")
                    }
                    disabled={updatingId === selectedInvoice._id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-500 transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" /> Send Invoice
                  </button>
                )}
                {selectedInvoice.status === "sent" && (
                  <button
                    onClick={() =>
                      handleStatusUpdate(selectedInvoice._id, "paid", "card")
                    }
                    disabled={updatingId === selectedInvoice._id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-semibold text-sm rounded-xl hover:bg-emerald-500 transition disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark as Paid
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showGenerateModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowGenerateModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Generate Invoice
              </h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Booking
                </label>
                <select
                  value={generateData.bookingId}
                  onChange={(e) =>
                    setGenerateData({
                      ...generateData,
                      bookingId: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select a booking</option>
                  {bookings
                    .filter(
                      (b) =>
                        b.status === "completed" || b.status === "in-progress",
                    )
                    .map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.customerId?.name} - {b.serviceId?.name} ($
                        {b.totalPrice}) -{" "}
                        {new Date(b.bookingDate).toLocaleDateString()}
                      </option>
                    ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={(generateData.taxRate * 100).toFixed(0)}
                    onChange={(e) =>
                      setGenerateData({
                        ...generateData,
                        taxRate: parseFloat(e.target.value) / 100,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                    Discount ($)
                  </label>
                  <input
                    type="number"
                    value={generateData.discount}
                    onChange={(e) =>
                      setGenerateData({
                        ...generateData,
                        discount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Notes
                </label>
                <textarea
                  value={generateData.notes}
                  onChange={(e) =>
                    setGenerateData({ ...generateData, notes: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating || !generateData.bookingId}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-500 transition disabled:opacity-50"
              >
                {generating ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Receipt className="w-4 h-4" />
                )}{" "}
                Generate Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
