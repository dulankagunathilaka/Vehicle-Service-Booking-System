import { useState, useEffect } from "react";
import {
  Star,
  Loader,
  Inbox,
  Trash2,
  Search,
  Filter,
  User,
  CalendarDays,
  MessageSquare,
  TrendingUp,
  ChevronDown,
  BarChart3,
  Eye,
  X,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";

const API = "http://localhost:5000/api";

const ratingColors = {
  5: "text-emerald-500",
  4: "text-blue-500",
  3: "text-amber-500",
  2: "text-orange-500",
  1: "text-red-500",
};

const ratingBg = {
  5: "bg-emerald-50 border-emerald-200",
  4: "bg-blue-50 border-blue-200",
  3: "bg-amber-50 border-amber-200",
  2: "bg-orange-50 border-orange-200",
  1: "bg-red-50 border-red-200",
};

function StarRating({ rating, size = "w-4 h-4" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${size} ${i <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [filterApproval, setFilterApproval] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedReview, setSelectedReview] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        fetch(`${API}/admin/reviews`, { headers }),
        fetch(`${API}/admin/reviews/stats`, { headers }),
      ]);
      const [reviewsData, statsData] = await Promise.all([
        reviewsRes.json(),
        statsRes.json(),
      ]);
      if (reviewsData.success) setReviews(reviewsData.data);
      if (statsData.success) setStats(statsData.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    const token = localStorage.getItem("token");
    setDeletingId(reviewId);
    try {
      const res = await fetch(`${API}/admin/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.filter((r) => r._id !== reviewId));
        if (selectedReview?._id === reviewId) setSelectedReview(null);
        fetchData();
      }
    } catch (err) {
      console.error("Error deleting review:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleApprove = async (reviewId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/admin/reviews/${reviewId}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.map((r) => (r._id === reviewId ? data.data : r)));
        if (selectedReview?._id === reviewId) setSelectedReview(data.data);
        fetchData();
      }
    } catch (err) {
      console.error("Error approving review:", err);
    }
  };

  const handleReject = async (reviewId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/admin/reviews/${reviewId}/reject`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.map((r) => (r._id === reviewId ? data.data : r)));
        if (selectedReview?._id === reviewId) setSelectedReview(data.data);
        fetchData();
      }
    } catch (err) {
      console.error("Error rejecting review:", err);
    }
  };

  const filtered = reviews
    .filter((r) => {
      if (filterRating !== "all" && r.rating !== parseInt(filterRating))
        return false;
      if (filterApproval === "approved" && !r.isApproved) return false;
      if (filterApproval === "pending" && r.isApproved) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          r.title?.toLowerCase().includes(q) ||
          r.comment?.toLowerCase().includes(q) ||
          r.customerId?.name?.toLowerCase().includes(q) ||
          r.customerId?.email?.toLowerCase().includes(q) ||
          r.serviceId?.name?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      return 0;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-600 mx-auto mb-3 animate-spin" />
          <p className="text-gray-400 text-sm">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">
          View and manage all customer feedback
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalReviews}
                </p>
                <p className="text-xs text-gray-500">Total Reviews</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {stats.pendingApproval || 0}
                </p>
                <p className="text-xs text-gray-500">Pending Approval</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">
                  {stats.approvedReviews || 0}
                </p>
                <p className="text-xs text-gray-500">Approved & Live</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageRating}
                </p>
                <p className="text-xs text-gray-500">Average Rating</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer, service, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={filterApproval}
            onChange={(e) => setFilterApproval(e.target.value)}
            className="pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No reviews found
          </h3>
          <p className="text-sm text-gray-500">
            {searchQuery || filterRating !== "all"
              ? "Try adjusting your filters"
              : "Customer reviews will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">

                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(review.customerId?.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {review.customerId?.name || "Unknown Customer"}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${ratingBg[review.rating]}`}
                        >
                          <Star
                            className={`w-3 h-3 fill-current ${ratingColors[review.rating]}`}
                          />
                          {review.rating}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {review.customerId?.email}
                        {review.serviceId && (
                          <>
                            {" "}
                            ·{" "}
                            <span className="text-blue-500">
                              {review.serviceId.name}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold text-gray-800 mb-1">
                    {review.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {review.comment}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <StarRating rating={review.rating} size="w-3 h-3" />
                    {review.isApproved ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" /> Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  {!review.isApproved ? (
                    <button
                      onClick={() => handleApprove(review._id)}
                      className="p-2 rounded-xl hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition"
                      title="Approve review"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReject(review._id)}
                      className="p-2 rounded-xl hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition"
                      title="Revoke approval"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedReview(review)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(review._id)}
                    disabled={deletingId === review._id}
                    className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition disabled:opacity-50"
                    title="Delete review"
                  >
                    {deletingId === review._id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReview && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Review Details
                </h3>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold">
                  {(selectedReview.customerId?.name || "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedReview.customerId?.name || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedReview.customerId?.email}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <StarRating rating={selectedReview.rating} size="w-5 h-5" />
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold border ${ratingBg[selectedReview.rating]} ${ratingColors[selectedReview.rating]}`}
                  >
                    {selectedReview.rating}/5
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {selectedReview.title}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedReview.comment}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                {selectedReview.serviceId && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="font-medium text-gray-700">Service:</span>
                    <span className="text-blue-600">
                      {selectedReview.serviceId.name}
                    </span>
                  </div>
                )}
                {selectedReview.bookingId && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="font-medium text-gray-700">
                      Booking Date:
                    </span>
                    {new Date(
                      selectedReview.bookingId.bookingDate,
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="font-medium text-gray-700">
                    Reviewed on:
                  </span>
                  {new Date(selectedReview.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    },
                  )}
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2">
                {selectedReview.isApproved ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-4 h-4" /> Approved — Visible on
                    Homepage
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock className="w-4 h-4" /> Pending Approval
                  </span>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                {!selectedReview.isApproved ? (
                  <button
                    onClick={() => handleApprove(selectedReview._id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-200"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve & Publish
                  </button>
                ) : (
                  <button
                    onClick={() => handleReject(selectedReview._id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-amber-700 bg-amber-50 rounded-xl hover:bg-amber-100 transition-all border border-amber-200"
                  >
                    <XCircle className="w-4 h-4" /> Revoke Approval
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedReview._id)}
                  disabled={deletingId === selectedReview._id}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all border border-red-100 disabled:opacity-50"
                >
                  {deletingId === selectedReview._id ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" /> Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" /> Delete Review
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
