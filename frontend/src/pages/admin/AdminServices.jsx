import { useState, useEffect } from "react";
import {
  Plus,
  Wrench,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  Loader,
  Inbox,
  Search,
  TrendingUp,
  BarChart3,
} from "lucide-react";

const categories = ["maintenance", "repair", "inspection", "customization"];

const emptyService = {
  name: "",
  description: "",
  category: "maintenance",
  price: "",
  duration: "",
  isAvailable: true,
};

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyService });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/admin/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setServices(data.data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyService });
    setErrors({});
    setShowModal(true);
  };
  const openEdit = (s) => {
    setEditingId(s._id);
    setForm({
      name: s.name,
      description: s.description,
      category: s.category,
      price: s.price,
      duration: s.duration,
      isAvailable: s.isAvailable,
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.price || form.price <= 0) e.price = "Valid price is required";
    if (!form.duration || form.duration < 15) e.duration = "Min 15 minutes";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const token = localStorage.getItem("token");
    setSaving(true);
    try {
      const url = editingId
        ? `http://localhost:5000/api/services/${editingId}`
        : "http://localhost:5000/api/services";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          duration: Number(form.duration),
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (editingId) {
          setServices(
            services.map((s) => (s._id === editingId ? data.data : s)),
          );
        } else {
          setServices([data.data, ...services]);
        }
        setShowModal(false);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setServices(services.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const toggleAvailability = async (service) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:5000/api/services/${service._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isAvailable: !service.isAvailable }),
        },
      );
      const data = await res.json();
      if (data.success)
        setServices(
          services.map((s) => (s._id === service._id ? data.data : s)),
        );
    } catch (err) {
      console.error("Error:", err);
    }
  };

  let filtered =
    filterCat === "all"
      ? services
      : services.filter((s) => s.category === filterCat);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q),
    );
  }

  const totalRevenue = services.reduce((sum, s) => sum + (s.price || 0), 0);
  const avgPrice = services.length
    ? Math.round(totalRevenue / services.length)
    : 0;
  const activeCount = services.filter((s) => s.isAvailable).length;

  const catColor = {
    maintenance: "bg-blue-50 text-blue-700 border-blue-200",
    repair: "bg-red-50 text-red-700 border-red-200",
    inspection: "bg-amber-50 text-amber-700 border-amber-200",
    customization: "bg-violet-50 text-violet-700 border-violet-200",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Service Management
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {services.length} total services · {activeCount} active
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mb-2">
            <Wrench className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{services.length}</p>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            Total Services
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition">
          <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center mb-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">${avgPrice}</p>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            Avg Price
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center mb-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {activeCount}/{services.length}
          </p>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            Active
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search services by name or description..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 hover:border-gray-300 transition"
        />
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Wrench className="w-4 h-4 text-gray-400 flex-shrink-0" />
        {["all", ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-4 py-2 rounded-xl font-medium text-sm capitalize transition-all whitespace-nowrap ${
              filterCat === cat
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Loader className="w-8 h-8 text-blue-600 mx-auto mb-3 animate-spin" />
          <p className="text-gray-400 text-sm">Loading services...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-7 h-7 text-gray-300" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            No services found
          </h3>
          <p className="text-gray-400 text-sm">
            Try a different category or add a new service
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((service) => (
            <div
              key={service._id}
              className={`bg-white rounded-2xl border border-gray-100 p-5 transition-all hover:shadow-md ${!service.isAvailable ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize border ${catColor[service.category] || "bg-gray-50 text-gray-700 border-gray-200"}`}
                >
                  {service.category}
                </span>
                <button
                  onClick={() => toggleAvailability(service)}
                  title={service.isAvailable ? "Disable" : "Enable"}
                  className={`w-10 h-6 rounded-full relative transition-all ${service.isAvailable ? "bg-emerald-500" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${service.isAvailable ? "left-[18px]" : "left-0.5"}`}
                  />
                </button>
              </div>
              <h4 className="text-base font-bold text-gray-900 mb-1">
                {service.name}
              </h4>
              <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                {service.description}
              </p>
              <div className="flex items-end justify-between pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xl font-bold text-blue-600 flex items-center">
                    <DollarSign className="w-4 h-4" />
                    {service.price}
                  </p>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {service.duration} min
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(service)}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? "Edit Service" : "Add New Service"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm focus:outline-none transition ${errors.name ? "border-red-400" : "border-gray-200 focus:border-blue-500"}`}
                  placeholder="Service name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows="3"
                  className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm focus:outline-none transition resize-none ${errors.description ? "border-red-400" : "border-gray-200 focus:border-blue-500"}`}
                  placeholder="Service description"
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.description}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-500 transition capitalize"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="capitalize">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm focus:outline-none transition ${errors.price ? "border-red-400" : "border-gray-200 focus:border-blue-500"}`}
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.price}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: e.target.value })
                    }
                    min="15"
                    step="15"
                    className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm focus:outline-none transition ${errors.duration ? "border-red-400" : "border-gray-200 focus:border-blue-500"}`}
                    placeholder="60"
                  />
                  {errors.duration && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.duration}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, isAvailable: !form.isAvailable })
                  }
                  className={`w-10 h-6 rounded-full relative transition-all ${form.isAvailable ? "bg-emerald-500" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isAvailable ? "left-[18px]" : "left-0.5"}`}
                  />
                </button>
                <span className="text-sm text-gray-700 font-medium">
                  {form.isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition disabled:bg-gray-300 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingId ? (
                    "Update Service"
                  ) : (
                    "Create Service"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
