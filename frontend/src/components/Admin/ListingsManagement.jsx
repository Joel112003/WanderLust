import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Check, X, Star, AlertCircle, MapPin, DollarSign, Filter, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import AdminSelect from './AdminSelect';

const STATUS = {
  pending:  { bg: 'bg-amber-50',  text: 'text-amber-600',  label: 'Pending'  },
  approved: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Approved' },
  rejected: { bg: 'bg-red-50',    text: 'text-red-600',    label: 'Rejected' },
};

const inputCls  = "w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 shadow-sm transition-all";
const FILTER_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];
const CARD_DELAY_CLASSES = ['delay-0', 'delay-75', 'delay-100', 'delay-150', 'delay-200', 'delay-300'];

/* ── Reject Modal ── */
const RejectModal = ({ listing, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  if (!listing) return null;
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[3px] flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 motion-safe:animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-11 h-11 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
          <X size={20} className="text-red-600" />
        </div>
        <h3 className="display text-lg font-extrabold text-gray-900 mb-1">Reject listing</h3>
        <p className="text-sm text-gray-500 mb-5">
          <span className="font-semibold text-gray-700">"{listing.title}"</span> — the owner will be notified by email.
        </p>
        <div className="mb-5">
          <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 mb-2">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4} value={reason} onChange={e => setReason(e.target.value)} maxLength={300}
            placeholder="e.g. Photos are low quality, description is too vague…"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-400 focus:ring-4 focus:ring-red-100 outline-none resize-none text-sm text-gray-800 transition-all"
          />
          <p className="text-[11px] text-gray-400 mt-1 text-right">{reason.length}/300</p>
        </div>
        <div className="flex gap-2.5">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { if (reason.trim()) { onConfirm(listing._id, reason.trim()); onClose(); }}}
            disabled={!reason.trim()}
            className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200/60"
          >
            <X size={14} /> Reject listing
          </button>
        </div>
      </div>
    </div>
  );
};


const ListingModal = ({ listing, onClose, onApprove, onRejectClick, onFeature }) => {
  if (!listing) return null;
  const s = STATUS[listing.status] ?? STATUS.pending;
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[3px] flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto motion-safe:animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="relative h-60 bg-gray-100 rounded-t-3xl overflow-hidden">
          <img src={listing.image?.url ?? '/placeholder-image.jpg'} alt={listing.title}
            className="w-full h-full object-cover" onError={e => { e.target.src = '/placeholder-image.jpg'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white shadow-md transition-all hover:scale-105">
            <X size={14} />
          </button>
          {listing.featured && (
            <div className="absolute top-4 left-4 flex items-center gap-1 bg-amber-400 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
              <Star size={10} fill="white" /> Featured
            </div>
          )}
          <div className="absolute bottom-4 left-5">
            <h3 className="display text-lg font-bold text-white drop-shadow-md">{listing.title ?? 'Untitled'}</h3>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${s.bg} ${s.text}`}>{s.label}</span>
            <p className="text-[11px] text-gray-400">By <span className="font-semibold text-gray-600">{listing.owner?.username ?? 'Unknown'}</span></p>
          </div>

          {listing.status === 'rejected' && listing.rejectionReason && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Rejection reason</p>
              <p className="text-sm text-gray-700">{listing.rejectionReason}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
              <MapPin size={14} className="text-gray-400 flex-shrink-0" />{listing.location ?? 'No location'}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
              <DollarSign size={14} className="text-gray-400 flex-shrink-0" />${listing.price ?? 0}/night
            </div>
          </div>

          {listing.description && <p className="text-sm text-gray-500 leading-relaxed">{listing.description}</p>}

          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
            <button onClick={() => { onFeature(listing._id); onClose(); }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[11px] font-bold border transition-all hover:-translate-y-0.5
                ${listing.featured ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
              <Star size={13} fill={listing.featured ? 'currentColor' : 'none'} />
              {listing.featured ? 'Unfeature' : 'Feature'}
            </button>
            {listing.status !== 'approved' && (
              <button onClick={() => { onApprove(listing._id); onClose(); }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all hover:-translate-y-0.5 shadow-sm">
                <Check size={13} /> Approve
              </button>
            )}
            {listing.status !== 'rejected' && (
              <button onClick={() => { onClose(); onRejectClick(listing); }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[11px] font-bold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all hover:-translate-y-0.5">
                <X size={13} /> Reject
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Listing Card ── */
const ListingCard = ({ listing, onView, onApprove, onRejectClick, index }) => {
  const s = STATUS[listing.status] ?? STATUS.pending;
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-200 group hover:shadow-xl hover:-translate-y-1 motion-safe:animate-fade-in ${CARD_DELAY_CLASSES[index % CARD_DELAY_CLASSES.length]}`}
    >
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        <img
          src={listing.image?.url ?? '/placeholder-image.jpg'} alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = '/placeholder-image.jpg'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {listing.featured && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
            <Star size={12} fill="white" className="text-white" />
          </div>
        )}
        <span className={`absolute bottom-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
      </div>

      <div className="p-4 space-y-2.5">
        <p className="text-sm font-bold text-gray-900 truncate">{listing.title ?? 'Untitled'}</p>
        <p className="text-[11px] text-gray-400 flex items-center gap-1">
          <MapPin size={11} className="text-gray-300" /> {listing.location ?? '—'}
        </p>

        {listing.status === 'rejected' && listing.rejectionReason && (
          <p className="text-[11px] text-red-500 bg-red-50 rounded-lg px-2.5 py-1.5 line-clamp-2">{listing.rejectionReason}</p>
        )}

        <div className="flex items-center justify-between pt-1">
          <button onClick={() => onView(listing)}
            className="text-[11px] font-bold text-red-600 hover:text-red-700 transition-colors underline underline-offset-2">
            View details
          </button>
          {listing.status === 'pending' && (
            <div className="flex gap-1.5">
              <button onClick={() => onApprove(listing._id)}
                className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center hover:bg-emerald-100 transition-all hover:scale-110">
                <Check size={14} />
              </button>
              <button onClick={() => onRejectClick(listing)}
                className="w-8 h-8 rounded-lg bg-red-50 text-red-500 border border-red-100 flex items-center justify-center hover:bg-red-100 transition-all hover:scale-110">
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Stats Bar ── */
const StatsBar = ({ listings }) => {
  const counts  = listings.reduce((acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {});
  const total   = listings.length;
  const bars = [
    { key: 'pending',  label: 'Pending Review', bg: 'bg-amber-50',   border: 'border-amber-100',   text: 'text-amber-600',   barClass: 'text-amber-500' },
    { key: 'approved', label: 'Approved',        bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', barClass: 'text-emerald-500' },
    { key: 'rejected', label: 'Rejected',        bg: 'bg-red-50',     border: 'border-red-100',     text: 'text-red-600',     barClass: 'text-red-600' },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {bars.map(({ key, label, bg, border, text, barClass }) => {
        const count = counts[key] || 0;
        const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={key} className={`${bg} border ${border} rounded-2xl px-5 py-4`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${text} opacity-70`}>{label}</p>
              <span className={`text-[10px] font-bold ${text}`}>{pct}%</span>
            </div>
            <p className={`text-3xl font-black ${text} mb-2`}>{count}</p>
            {/* Mini progress */}
            <progress
              value={pct}
              max={100}
              className={`h-1.5 w-full overflow-hidden rounded-full bg-white/60 ${barClass} [&::-webkit-progress-bar]:bg-white/60 [&::-webkit-progress-value]:bg-current [&::-moz-progress-bar]:bg-current`}
            />
          </div>
        );
      })}
    </div>
  );
};


const ListingsManagement = () => {
  const [listings,     setListings]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(false);
  const [search,       setSearch]       = useState('');
  const [filter,       setFilter]       = useState('all');
  const [selected,     setSelected]     = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const fetchListings = useCallback(async () => {
    setError(false);
    try {
      const { data } = await api.get('/admin/listings');
      setListings(data ?? []);
    } catch { setError(true); toast.error('Failed to load listings'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const approve = async id => {
    try {
      await api.patch(`/admin/listings/${id}/status`, { status: 'approved' });
      setListings(prev => prev.map(l => l._id === id ? { ...l, status: 'approved', rejectionReason: null } : l));
      toast.success('Listing approved');
    } catch { toast.error('Failed to approve listing'); }
  };

  const reject = async (id, reason) => {
    try {
      await api.patch(`/admin/listings/${id}/status`, { status: 'rejected', reason });
      setListings(prev => prev.map(l => l._id === id ? { ...l, status: 'rejected', rejectionReason: reason } : l));
      toast.success('Listing rejected');
    } catch { toast.error('Failed to reject listing'); }
  };

  const toggleFeatured = async id => {
    try {
      await api.patch(`/admin/listings/${id}/feature`, {});
      fetchListings(); toast.success('Featured status updated');
    } catch { toast.error('Failed to update featured status'); }
  };

  const filtered = useMemo(() => listings.filter(l => {
    if (!l) return false;
    const q = search.toLowerCase();
    return ((l.title ?? '').toLowerCase().includes(q) || (l.location ?? '').toLowerCase().includes(q))
      && (filter === 'all' || l.status === filter);
  }), [listings, search, filter]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <AlertCircle size={40} className="text-gray-300" />
      <p className="text-sm text-gray-500">Failed to load listings</p>
      <button onClick={fetchListings} className="text-sm text-red-600 font-semibold underline underline-offset-2 hover:text-red-700">Retry</button>
    </div>
  );

  return (
      <div className="space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Listings Management</h2>
            <p className="mt-1 text-sm text-gray-500 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-red-500" />
              {listings.length} total properties
            </p>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 bg-red-50 border border-red-100 rounded-xl">
            <Filter size={14} className="text-red-500" />
            <span className="text-xs font-bold text-red-600">{filtered.length} shown</span>
          </div>
        </div>

        <StatsBar listings={listings} />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or location…" className={inputCls} />
          </div>
          <AdminSelect
            value={filter}
            onChange={setFilter}
            options={FILTER_OPTIONS}
            className="sm:min-w-[170px]"
          />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Search size={28} className="text-gray-200" />
            <p className="text-sm text-gray-400 font-medium">No listings found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((l, i) => (
              <ListingCard key={l._id} listing={l} onView={setSelected} onApprove={approve} onRejectClick={setRejectTarget} index={i} />
            ))}
          </div>
        )}

        {selected && <ListingModal listing={selected} onClose={() => setSelected(null)} onApprove={approve} onRejectClick={setRejectTarget} onFeature={toggleFeatured} />}
        {rejectTarget && <RejectModal listing={rejectTarget} onClose={() => setRejectTarget(null)} onConfirm={reject} />}
      </div>
  );
};

export default ListingsManagement;