import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Inbox,
  Loader,
  CheckCircle2,
  X,
  DollarSign,
  ClipboardList,
  Phone,
  CalendarDays,
  Eye,
  TrendingUp,
  Star,
  AlertCircle,
} from "lucide-react";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/admin/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setCustomers(data.data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/customers/${id}/toggle-status`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        setCustomers(
          customers.map((c) =>
            c._id === id ? { ...c, isActive: data.data.isActive } : c,
          ),
        );
        if (selectedCustomer?._id === id)
          setSelectedCustomer({
            ...selectedCustomer,
            isActive: data.data.isActive,
          });
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const filtered = customers
    .filter((c) => {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "spent") return (b.totalSpent || 0) - (a.totalSpent || 0);
      if (sortBy === "bookings")
        return (b.bookingCount || 0) - (a.bookingCount || 0);
      return 0;
    });

  const totalSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const totalBookings = customers.reduce(
    (sum, c) => sum + (c.bookingCount || 0),
    0,
  );
  const activeCustomers = customers.filter((c) => c.isActive).length;
  const avgSpent = customers.length
    ? Math.round(totalSpent / customers.length)
    : 0;

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Customer Management
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {customers.length} total customers · {activeCustomers} active
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-semibold">
            <TrendingUp className="w-3 h-3" />${totalSpent.toLocaleString()}{" "}
            lifetime revenue
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition">
          <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center mb-2">
            <Users className="w-4 h-4 text-violet-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            Total Customers
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mb-2">
            <ClipboardList className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            Total Bookings
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition">
          <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center mb-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${totalSpent.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            Total Revenue
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center mb-2">
            <Star className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">${avgSpent}</p>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            Avg Spent
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 hover:border-gray-300 transition"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="spent">Highest Spent</option>
          <option value="bookings">Most Bookings</option>
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Loader className="w-8 h-8 text-blue-600 mx-auto mb-3 animate-spin" />
          <p className="text-gray-400 text-sm">Loading customers...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-7 h-7 text-gray-300" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            No customers found
          </h3>
          <p className="text-gray-400 text-sm">Try a different search term</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    "Customer",
                    "Phone",
                    "Bookings",
                    "Total Spent",
                    "Status",
                    "Joined",
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
                {filtered.map((customer) => (
                  <tr
                    key={customer._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {customer.name}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      {customer.phone}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-bold text-gray-900">
                        {customer.bookingCount}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-bold text-blue-600">
                        ${customer.totalSpent}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleStatus(customer._id)}
                        className={`w-10 h-6 rounded-full relative transition-all ${customer.isActive ? "bg-emerald-500" : "bg-gray-300"}`}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${customer.isActive ? "left-[18px]" : "left-0.5"}`}
                        />
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">
                      {new Date(customer.createdAt).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Customer Details
              </h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-5">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                  {selectedCustomer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <h4 className="text-lg font-bold text-gray-900">
                  {selectedCustomer.name}
                </h4>
                <p className="text-xs text-gray-400">
                  {selectedCustomer.email}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">
                      Phone
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedCustomer.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <CalendarDays className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">
                      Joined
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedCustomer.createdAt).toLocaleDateString(
                        "en-US",
                        { month: "long", day: "numeric", year: "numeric" },
                      )}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-xl text-center">
                    <p className="text-xl font-bold text-blue-600">
                      {selectedCustomer.bookingCount}
                    </p>
                    <p className="text-[10px] text-blue-500 font-semibold uppercase">
                      Bookings
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl text-center">
                    <p className="text-xl font-bold text-emerald-600">
                      ${selectedCustomer.totalSpent}
                    </p>
                    <p className="text-[10px] text-emerald-500 font-semibold uppercase">
                      Total Spent
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">
                    Account Status
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${selectedCustomer.isActive ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {selectedCustomer.isActive ? "Active" : "Inactive"}
                    </span>
                    <button
                      onClick={() => toggleStatus(selectedCustomer._id)}
                      className={`w-10 h-6 rounded-full relative transition-all ${selectedCustomer.isActive ? "bg-emerald-500" : "bg-gray-300"}`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${selectedCustomer.isActive ? "left-[18px]" : "left-0.5"}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
