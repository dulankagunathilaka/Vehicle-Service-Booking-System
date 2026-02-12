import { useState, useEffect } from "react";
import {
  Package,
  Loader,
  Search,
  ChevronDown,
  X,
  Inbox,
  Plus,
  Trash2,
  Eye,
  Edit3,
  AlertTriangle,
  BarChart3,
  Archive,
  RefreshCw,
  Minus,
  Check,
  Boxes,
  Wrench,
  Tag,
} from "lucide-react";

const API = "http://localhost:5000/api";

const categoryConfig = {
  parts: { label: "Parts", color: "bg-blue-50 text-blue-600" },
  fluids: { label: "Fluids", color: "bg-cyan-50 text-cyan-600" },
  filters: { label: "Filters", color: "bg-amber-50 text-amber-600" },
  tires: { label: "Tires", color: "bg-gray-100 text-gray-600" },
  batteries: { label: "Batteries", color: "bg-yellow-50 text-yellow-600" },
  tools: { label: "Tools", color: "bg-purple-50 text-purple-600" },
  accessories: { label: "Accessories", color: "bg-pink-50 text-pink-600" },
  other: { label: "Other", color: "bg-gray-50 text-gray-500" },
};

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showUseModal, setShowUseModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [restockTarget, setRestockTarget] = useState(null);
  const [useTarget, setUseTarget] = useState(null);
  const [restockQty, setRestockQty] = useState(1);
  const [restockNote, setRestockNote] = useState("");
  const [useQty, setUseQty] = useState(1);
  const [useNote, setUseNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "parts",
    quantity: 0,
    minQuantity: 5,
    unitPrice: 0,
    costPrice: 0,
    supplier: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [itemsRes, statsRes] = await Promise.all([
        fetch(`${API}/inventory`, { headers }),
        fetch(`${API}/inventory/stats/summary`, { headers }),
      ]);
      const [itemsData, statsData] = await Promise.all([
        itemsRes.json(),
        statsRes.json(),
      ]);
      if (itemsData.success) setItems(itemsData.data);
      if (statsData.success) setStats(statsData.data);
    } catch (err) {
      console.error("Error fetching:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async () => {
    const token = localStorage.getItem("token");
    setSaving(true);
    try {
      const url = editingItem
        ? `${API}/inventory/${editingItem._id}`
        : `${API}/inventory`;
      const method = editingItem ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setEditingItem(null);
        resetForm();
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Error saving item");
    } finally {
      setSaving(false);
    }
  };

  const handleRestock = async () => {
    const token = localStorage.getItem("token");
    setSaving(true);
    try {
      const res = await fetch(`${API}/inventory/${restockTarget._id}/restock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: restockQty, notes: restockNote }),
      });
      const data = await res.json();
      if (data.success) {
        setShowRestockModal(false);
        setRestockTarget(null);
        setRestockQty(1);
        setRestockNote("");
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Error restocking");
    } finally {
      setSaving(false);
    }
  };

  const handleUse = async () => {
    const token = localStorage.getItem("token");
    setSaving(true);
    try {
      const res = await fetch(`${API}/inventory/${useTarget._id}/use`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: useQty, notes: useNote }),
      });
      const data = await res.json();
      if (data.success) {
        setShowUseModal(false);
        setUseTarget(null);
        setUseQty(1);
        setUseNote("");
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Error using item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this inventory item?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API}/inventory/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(items.filter((i) => i._id !== id));
      if (selectedItem?._id === id) setSelectedItem(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "parts",
      quantity: 0,
      minQuantity: 5,
      unitPrice: 0,
      costPrice: 0,
      supplier: "",
      location: "",
      description: "",
    });
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      unitPrice: item.unitPrice,
      costPrice: item.costPrice,
      supplier: item.supplier || "",
      location: item.location || "",
      description: item.description || "",
    });
    setShowAddModal(true);
  };

  const filtered = items
    .filter((item) => {
      if (filterCategory !== "all" && item.category !== filterCategory)
        return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.name?.toLowerCase().includes(q) ||
          item.sku?.toLowerCase().includes(q) ||
          item.supplier?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

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
            Inventory Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track parts, supplies, and stock levels
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingItem(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Items",
              value: stats.totalItems,
              Icon: Boxes,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Total Value",
              value: `$${stats.totalValue?.toLocaleString() || 0}`,
              Icon: Tag,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: "Low Stock",
              value: stats.lowStockItems,
              Icon: AlertTriangle,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "Out of Stock",
              value: stats.outOfStockItems,
              Icon: Archive,
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

      {stats?.lowStockAlerts?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <p className="text-sm font-bold text-amber-800">Low Stock Alerts</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.lowStockAlerts.map((a) => (
              <span
                key={a._id}
                className="px-3 py-1 bg-white border border-amber-200 rounded-full text-xs text-amber-700 font-medium"
              >
                {a.name} ({a.quantity}/{a.minQuantity})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
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
            {Object.entries(categoryConfig).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No items found
          </h3>
          <p className="text-sm text-gray-500">
            Add inventory items to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const isLow =
              item.quantity <= item.minQuantity && item.quantity > 0;
            const isOut = item.quantity === 0;
            const cat = categoryConfig[item.category] || categoryConfig.other;
            return (
              <div
                key={item._id}
                className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all group ${isOut ? "border-red-200" : isLow ? "border-amber-200" : "border-gray-100"}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}
                    >
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400">{item.sku}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cat.color}`}
                  >
                    {cat.label}
                  </span>
                </div>

                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Stock</p>
                    <p
                      className={`text-2xl font-bold ${isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-gray-900"}`}
                    >
                      {item.quantity}
                      <span className="text-xs text-gray-400 ml-1 font-normal">
                        / min {item.minQuantity}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Unit Price</p>
                    <p className="text-lg font-bold text-gray-900">
                      ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                {(isLow || isOut) && (
                  <div
                    className={`flex items-center gap-1.5 mb-3 px-2 py-1 rounded-lg text-xs font-semibold ${isOut ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {isOut ? "Out of stock" : "Low stock"}
                  </div>
                )}

                <div className="flex items-center gap-1 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => {
                      setRestockTarget(item);
                      setShowRestockModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition"
                  >
                    <Plus className="w-3 h-3" /> Restock
                  </button>
                  <button
                    onClick={() => {
                      setUseTarget(item);
                      setShowUseModal(true);
                    }}
                    disabled={item.quantity === 0}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition disabled:opacity-40"
                  >
                    <Minus className="w-3 h-3" /> Use
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingItem ? "Edit Item" : "Add Inventory Item"}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                }}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Item name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {Object.entries(categoryConfig).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                    Min Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.minQuantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minQuantity: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                    Unit Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unitPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                    Cost Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        costPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                  Supplier
                </label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier: e.target.value })
                  }
                  placeholder="Supplier name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Storage location"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button
                onClick={handleSaveItem}
                disabled={saving || !formData.name}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-500 transition disabled:opacity-50"
              >
                {saving ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}{" "}
                {editingItem ? "Update Item" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRestockModal && restockTarget && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowRestockModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                Restock: {restockTarget.name}
              </h3>
              <p className="text-xs text-gray-500">
                Current stock: {restockTarget.quantity}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                  Quantity to Add
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                  Notes
                </label>
                <input
                  type="text"
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  placeholder="Restock reason..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button
                onClick={handleRestock}
                disabled={saving || restockQty < 1}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-semibold text-sm rounded-xl hover:bg-emerald-500 transition disabled:opacity-50"
              >
                {saving ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}{" "}
                Restock +{restockQty}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUseModal && useTarget && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowUseModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                Use: {useTarget.name}
              </h3>
              <p className="text-xs text-gray-500">
                Available: {useTarget.quantity}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                  Quantity to Use
                </label>
                <input
                  type="number"
                  min="1"
                  max={useTarget.quantity}
                  value={useQty}
                  onChange={(e) => setUseQty(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                  Notes
                </label>
                <input
                  type="text"
                  value={useNote}
                  onChange={(e) => setUseNote(e.target.value)}
                  placeholder="Usage reason..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button
                onClick={handleUse}
                disabled={saving || useQty < 1 || useQty > useTarget.quantity}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-500 transition disabled:opacity-50"
              >
                {saving ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}{" "}
                Use {useQty} unit{useQty > 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
