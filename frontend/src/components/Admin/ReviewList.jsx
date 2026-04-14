import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Search, Star, Check, Trash2, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import AdminSelect from './AdminSelect';

const inputCls  = "w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 shadow-sm transition-all";
const FILTER_OPTIONS = [
  { value: 'all', label: 'All Reviews' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
];
const CARD_DELAY_CLASSES = ['delay-0', 'delay-75', 'delay-100', 'delay-150', 'delay-200', 'delay-300'];

const StarRating = memo(({ rating }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={14}
        className={i < rating ? 'text-amber-400' : 'text-gray-200'}
        fill={i < rating ? 'currentColor' : 'none'}
      />
    ))}
  </div>
));

const ReviewCard = ({ review, onApprove, onDelete, index }) => (
  <div
    className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3.5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 motion-safe:animate-fade-in ${CARD_DELAY_CLASSES[index % CARD_DELAY_CLASSES.length]}`}
  >
    {/* Header */}
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-sm font-bold text-red-600 flex-shrink-0 shadow-sm">
          {review.author?.username?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{review.listing?.title ?? 'Deleted listing'}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            by <span className="font-semibold text-gray-600">{review.author?.username ?? 'Unknown'}</span>
          </p>
        </div>
      </div>
      <span className={`flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full
        ${review.approved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
        {review.approved ? '✓ Approved' : '⏳ Pending'}
      </span>
    </div>

    <StarRating rating={review.rating} />

    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{review.comment}</p>

    {/* Footer */}
    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
      <p className="text-[11px] text-gray-400 font-medium">
        {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
      <div className="flex gap-2">
        {!review.approved && (
          <button
            onClick={() => onApprove(review._id)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all hover:-translate-y-0.5 shadow-sm"
          >
            <Check size={12} /> Approve
          </button>
        )}
        <button
          onClick={() => onDelete(review._id)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all hover:-translate-y-0.5"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  </div>
);

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('all');

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
      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <AlertCircle size={40} className="text-gray-300" />
      <p className="text-sm text-gray-500">Failed to load reviews</p>
      <button onClick={fetchReviews} className="text-sm text-red-600 font-semibold underline underline-offset-2 hover:text-red-700">Retry</button>
    </div>
  );

  const pendingCount  = reviews.filter(r => !r.approved).length;
  const approvedCount = reviews.filter(r =>  r.approved).length;

  return (
      <div className="space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Reviews Management</h2>
            <p className="mt-1 text-sm text-gray-500 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-red-500" />
              {reviews.length} total reviews
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 border border-amber-100 rounded-xl">
              <Clock size={14} className="text-amber-500" />
              <span className="text-xs font-bold text-amber-600">{pendingCount} Pending</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
              <Check size={14} className="text-emerald-500" />
              <span className="text-xs font-bold text-emerald-600">{approvedCount} Approved</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by comment or author…" className={inputCls} />
          </div>
          <AdminSelect
            value={filter}
            onChange={setFilter}
            options={FILTER_OPTIONS}
            className="sm:min-w-[170px]"
          />
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Search size={28} className="text-gray-200" />
            <p className="text-sm text-gray-400 font-medium">No reviews found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((r, i) => (
              <ReviewCard key={r._id} review={r} onApprove={approveReview} onDelete={deleteReview} index={i} />
            ))}
          </div>
        )}
      </div>
  );
};

export default ReviewList;