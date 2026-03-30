import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Check, X, Star, Eye, AlertCircle, MapPin, DollarSign, Filter, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../lib/api';

const STATUS = {
  pending:  { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Pending'  },
  approved: { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Approved' },
  rejected: { bg: 'bg-red-100',    text: 'text-red-600',    label: 'Rejected' },
};

const inputCls  = "w-full pl-10 pr-4 py-3 text-base rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all";
const selectCls = "text-base px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:border-blue-500 shadow-sm transition-colors";

const RejectModal = ({ listing, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  if (!listing) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8" onClick={e => e.stopPropagation()}
        style={{ animation: 'popIn 0.35s cubic-bezier(.34,1.56,.64,1) both' }}>
        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
          <X size={22} className="text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">Reject listing</h3>
        <p className="text-sm text-gray-500 mb-6">
          <span className="font-semibold text-gray-700">"{listing.title}"</span> — the owner will receive an email with your reason.
        </p>
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Reason for rejection <span className="text-red-500">*</span>
          </label>
          <textarea rows={4} value={reason} onChange={e => setReason(e.target.value)}
            placeholder="e.g. Photos are low quality, description is too vague, pricing seems incorrect…"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none resize-none text-sm text-gray-800 transition-all"
            maxLength={300}
          />
          <p className="text-xs text-gray-400 mt-1">{reason.length}/300</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={() => { if (reason.trim()) { onConfirm(listing._id, reason.trim()); onClose(); }}}
            disabled={!reason.trim()}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
            <X size={15} /> Reject listing
          </button>
        </div>
      </div>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
};

const ListingModal = ({ listing, onClose, onApprove, onRejectClick, onFeature }) => {
  if (!listing) return null;
  const s = STATUS[listing.status] ?? STATUS.pending;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="relative h-64 bg-gray-100 rounded-t-3xl overflow-hidden">
          <img src={listing.image?.url ?? '/placeholder-image.jpg'} alt={listing.title}
            className="w-full h-full object-cover" onError={e => { e.target.src = '/placeholder-image.jpg'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <button onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white shadow-md transition-colors">
            <X size={16} />
          </button>
          {listing.featured && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-amber-400 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow">
              <Star size={12} fill="white" /> Featured
            </div>
          )}
          <div className="absolute bottom-4 left-5">
            <h3 className="text-xl font-bold text-white drop-shadow-md">{listing.title ?? 'Untitled'}</h3>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${s.bg} ${s.text}`}>{s.label}</span>
            <p className="text-sm text-gray-500">By <span className="font-semibold text-gray-700">{listing.owner?.username ?? 'Unknown'}</span></p>
          </div>

          {listing.status === 'rejected' && listing.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Rejection reason</p>
              <p className="text-sm text-gray-700 leading-relaxed">{listing.rejectionReason}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
              <MapPin size={15} className="text-gray-400 flex-shrink-0" />{listing.location ?? 'No location'}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
              <DollarSign size={15} className="text-gray-400 flex-shrink-0" />${listing.price ?? 0}/night
            </div>
          </div>

          {listing.description && <p className="text-sm text-gray-600 leading-relaxed">{listing.description}</p>}

          <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
            <button onClick={() => { onFeature(listing._id); onClose(); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all
                ${listing.featured ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
              <Star size={15} fill={listing.featured ? 'currentColor' : 'none'} />
              {listing.featured ? 'Unfeature' : 'Feature'}
            </button>
            {listing.status !== 'approved' && (
              <button onClick={() => { onApprove(listing._id); onClose(); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-green-600 text-white hover:bg-green-700 transition-all">
                <Check size={15} /> Approve
              </button>
            )}
            {listing.status !== 'rejected' && (
              <button onClick={() => { onClose(); onRejectClick(listing); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all">
                <X size={15} /> Reject
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ListingCard = ({ listing, onView, onApprove, onRejectClick }) => {
  const s = STATUS[listing.status] ?? STATUS.pending;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img src={listing.image?.url ?? '/placeholder-image.jpg'} alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.src = '/placeholder-image.jpg'; }} />
        {listing.featured && (
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
            <Star size={14} fill="white" className="text-white" />
          </div>
        )}
        <span className={`absolute bottom-3 left-3 text-sm font-bold px-3 py-1 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
      </div>
      <div className="p-5 space-y-3">
        <p className="text-base font-bold text-gray-900 truncate">{listing.title ?? 'Untitled'}</p>
        <p className="text-sm text-gray-500 flex items-center gap-1.5">
          <MapPin size={13} className="text-gray-400" /> {listing.location ?? '—'}
        </p>
        {listing.status === 'rejected' && listing.rejectionReason && (
          <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 line-clamp-2">❌ {listing.rejectionReason}</p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <button onClick={() => onView(listing)}
            className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
            <Eye size={15} /> View Details
          </button>
          {listing.status === 'pending' && (
            <div className="flex gap-2">
              <button onClick={() => onApprove(listing._id)} title="Approve"
                className="w-8 h-8 rounded-lg bg-green-50 text-green-600 border border-green-200 flex items-center justify-center hover:bg-green-100 transition-all">
                <Check size={14} />
              </button>
              <button onClick={() => onRejectClick(listing)} title="Reject"
                className="w-8 h-8 rounded-lg bg-red-50 text-red-500 border border-red-200 flex items-center justify-center hover:bg-red-100 transition-all">
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatsBar = ({ listings }) => {
  const counts = listings.reduce((acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {});
  const total = listings.length;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { key: 'pending',  label: 'Pending Review', light: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200', icon: '⏳' },
        { key: 'approved', label: 'Approved',        light: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200', icon: '✅' },
        { key: 'rejected', label: 'Rejected',        light: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',   icon: '❌' },
      ].map(({ key, label, light, text, border, icon }) => {
        const count = counts[key] || 0;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={key} className={`${light} border ${border} rounded-2xl px-5 py-4 hover:scale-105 transition-transform duration-200`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{icon}</span>
              <span className={`text-xs font-bold ${text} opacity-70`}>{percentage}%</span>
            </div>
            <p className={`text-3xl font-bold ${text} mb-1`}>{count}</p>
            <p className={`text-sm font-medium ${text} opacity-80`}>{label}</p>
          </div>
        );
      })}
    </div>
  );
};

const ListingsManagement = () => {
  const [listings, setListings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(false);
  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState('all');
  const [selected, setSelected]         = useState(null);
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

  const approve = async (id) => {
    try {
      await api.patch(`/admin/listings/${id}/status`, { status: 'approved' });
      setListings(prev => prev.map(l => l._id === id ? { ...l, status: 'approved', rejectionReason: null } : l));
      toast.success('✅ Listing approved — owner notified by email');
    } catch { toast.error('Failed to approve listing'); }
  };

  const reject = async (id, reason) => {
    try {
      await api.patch(`/admin/listings/${id}/status`, { status: 'rejected', reason });
      setListings(prev => prev.map(l => l._id === id ? { ...l, status: 'rejected', rejectionReason: reason } : l));
      toast.success('Listing rejected — owner notified by email');
    } catch { toast.error('Failed to reject listing'); }
  };

  const toggleFeatured = async (id) => {
    try {
      await api.patch(`/admin/listings/${id}/feature`, {});
      fetchListings();
      toast.success('Featured status updated');
    } catch { toast.error('Failed to update featured status'); }
  };

  const filtered = useMemo(() => listings.filter(l => {
    if (!l) return false;
    const q = search.toLowerCase();
    return (
      ((l.title ?? '').toLowerCase().includes(q) || (l.location ?? '').toLowerCase().includes(q)) &&
      (filter === 'all' || l.status === filter)
    );
  }), [listings, search, filter]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <AlertCircle size={40} className="text-gray-300" />
      <p className="text-base text-gray-500">Failed to load listings</p>
      <button onClick={fetchListings} className="text-base text-blue-600 font-semibold underline underline-offset-2">Retry</button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">Listings Management</h2>
          <p className="text-base text-gray-500 flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-500" />
            {listings.length} total properties
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
          <Filter size={16} className="text-blue-600" />
          <span className="text-sm font-semibold text-blue-700">{filtered.length} filtered</span>
        </div>
      </div>

      <StatsBar listings={listings} />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or location…" className={inputCls} />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className={selectCls}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Search size={32} className="text-gray-200" />
          <p className="text-base text-gray-400 font-medium">No listings found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(l => (
            <ListingCard key={l._id} listing={l} onView={setSelected} onApprove={approve} onRejectClick={setRejectTarget} />
          ))}
        </div>
      )}

      {selected && <ListingModal listing={selected} onClose={() => setSelected(null)} onApprove={approve} onRejectClick={setRejectTarget} onFeature={toggleFeatured} />}
      {rejectTarget && <RejectModal listing={rejectTarget} onClose={() => setRejectTarget(null)} onConfirm={reject} />}
    </div>
  );
};

export default ListingsManagement;
