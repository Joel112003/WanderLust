import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Search, Star, Check, Trash2, AlertCircle, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../lib/api';

const inputCls = "w-full pl-10 pr-4 py-3 text-base rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all";
const selectCls = "text-base px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:border-blue-500 shadow-sm transition-colors";

const StarRating = memo(({ rating }) => (
  <div className="flex gap-1">
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={16}
        className={i < rating ? 'text-amber-400' : 'text-gray-200'}
        fill={i < rating ? 'currentColor' : 'none'}
      />
    ))}
  </div>
));

const ReviewCard = ({ review, onApprove, onDelete }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-base font-bold text-blue-700 flex-shrink-0">
          {review.author?.username?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-gray-900 truncate">
            {review.listing?.title ?? 'Deleted listing'}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            by <span className="font-semibold">{review.author?.username ?? 'Unknown'}</span>
          </p>
        </div>
      </div>
      <span className={`flex-shrink-0 text-sm font-bold px-3 py-1.5 rounded-full
        ${review.approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
        {review.approved ? 'Approved' : 'Pending'}
      </span>
    </div>

    <StarRating rating={review.rating} />

    <p className="text-base text-gray-600 leading-relaxed line-clamp-3">{review.comment}</p>

    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
      <p className="text-sm text-gray-400 font-medium">
        {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
      <div className="flex gap-2">
        {!review.approved && (
          <button onClick={() => onApprove(review._id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-green-600 text-white hover:bg-green-700 transition-colors">
            <Check size={14} /> Approve
          </button>
        )}
        <button onClick={() => onDelete(review._id)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  </div>
);

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchReviews = useCallback(async () => {
    setError(false);
    try {
      const { data } = await api.get('/admin/reviews');
      setReviews(data);
    } catch { setError(true); toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const approveReview = async id => {
    try {
      await api.patch(`/admin/reviews/${id}/approve`, {});
      fetchReviews(); toast.success('Review approved');
    } catch { toast.error('Failed to approve review'); }
  };

  const deleteReview = async id => {
    try {
      await api.delete(`/admin/reviews/${id}`);
      fetchReviews(); toast.success('Review deleted');
    } catch { toast.error('Failed to delete review'); }
  };

  const filtered = useMemo(() => reviews.filter(r => {
    const q = search.toLowerCase();
    return (r.comment?.toLowerCase().includes(q) || r.author?.username?.toLowerCase().includes(q))
      && (filter === 'all' || (filter === 'approved' ? r.approved : !r.approved));
  }), [reviews, search, filter]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <AlertCircle size={40} className="text-gray-300" />
      <p className="text-base text-gray-500">Failed to load reviews</p>
      <button onClick={fetchReviews} className="text-base text-blue-600 font-semibold underline underline-offset-2">Retry</button>
    </div>
  );

  const pendingCount = reviews.filter(r => !r.approved).length;
  const approvedCount = reviews.filter(r => r.approved).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">Reviews Management</h2>
          <p className="text-base text-gray-500 flex items-center gap-2">
            <TrendingUp size={16} className="text-purple-500" />
            {reviews.length} total reviews
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
            <Clock size={16} className="text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">{pendingCount} Pending</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl">
            <Check size={16} className="text-green-600" />
            <span className="text-sm font-semibold text-green-700">{approvedCount} Approved</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by comment or author…" className={inputCls} />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className={selectCls}>
          <option value="all">All Reviews</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Search size={32} className="text-gray-200" />
          <p className="text-base text-gray-400 font-medium">No reviews found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map(r => (
            <ReviewCard key={r._id} review={r} onApprove={approveReview} onDelete={deleteReview} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList;