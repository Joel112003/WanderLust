import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Shield, ShieldOff, ArrowUpDown, AlertCircle, Users as UsersIcon, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import AdminSelect from './AdminSelect';

const AVATAR_COLORS = [
  'bg-red-500',
  'bg-red-600',
  'bg-red-400',
  'bg-rose-500',
  'bg-red-700',
  'bg-orange-500',
];
const avatarColor = u => AVATAR_COLORS[u.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
const ROW_DELAY_CLASSES = ['delay-0', 'delay-75', 'delay-100', 'delay-150', 'delay-200', 'delay-300'];

const inputCls  = "w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all shadow-sm";
const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'admin', label: 'Admins' },
  { value: 'user', label: 'Users' },
];

const UserList = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [search,  setSearch]  = useState('');
  const [sort,    setSort]    = useState('asc');
  const [role,    setRole]    = useState('all');

  const fetchUsers = useCallback(async () => {
    setError(false);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch { setError(true); toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleAdmin = async (id, current) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { isAdmin: !current });
      fetchUsers();
      toast.success('Role updated');
    } catch { toast.error('Failed to update role'); }
  };

  const filtered = useMemo(() => users
    .filter(u => {
      const q = search.toLowerCase();
      return (u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q))
        && (role === 'all' || (role === 'admin' ? u.isAdmin : !u.isAdmin));
    })
    .sort((a, b) => {
      const c = a.username.localeCompare(b.username);
      return sort === 'asc' ? c : -c;
    }), [users, search, sort, role]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <AlertCircle size={40} className="text-gray-300" />
      <p className="text-sm text-gray-500">Failed to load users</p>
      <button onClick={fetchUsers} className="text-sm text-red-600 font-semibold underline underline-offset-2 hover:text-red-700">Retry</button>
    </div>
  );

  return (
      <div className="space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">User Management</h2>
            <p className="mt-1 text-sm text-gray-500 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-red-500" />
              {users.length} registered accounts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 border border-blue-100 rounded-xl">
              <UsersIcon size={14} className="text-blue-500" />
              <span className="text-xs font-bold text-blue-600">{users.filter(u => !u.isAdmin).length} Users</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 bg-violet-50 border border-violet-100 rounded-xl">
              <Shield size={14} className="text-violet-500" />
              <span className="text-xs font-bold text-violet-600">{users.filter(u => u.isAdmin).length} Admins</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…" className={inputCls} />
          </div>
          <AdminSelect
            value={role}
            onChange={setRole}
            options={ROLE_OPTIONS}
            className="sm:min-w-[160px]"
          />
          <button
            onClick={() => setSort(s => s === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all"
          >
            <ArrowUpDown size={14} />
            {sort === 'asc' ? 'A → Z' : 'Z → A'}
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Search size={28} className="text-gray-200" />
              <p className="text-sm text-gray-400 font-medium">No users match your search</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">User</th>
                    <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 hidden sm:table-cell">Email</th>
                    <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Role</th>
                    <th className="text-right px-6 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((user, i) => (
                    <tr
                      key={user._id}
                      className={`hover:bg-red-50/30 transition-colors motion-safe:animate-fade-in ${ROW_DELAY_CLASSES[i % ROW_DELAY_CLASSES.length]}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-sm ${avatarColor(user.username)}`}
                          >
                            {user.username[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{user.username}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${user.isAdmin ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500'}`}>
                          {user.isAdmin && <Shield size={10} />}
                          {user.isAdmin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleAdmin(user._id, user.isAdmin)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all hover:-translate-y-0.5
                            ${user.isAdmin
                              ? 'text-red-600 bg-red-50 hover:bg-red-100 border border-red-100'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100'
                            }`}
                        >
                          {user.isAdmin
                            ? <><ShieldOff size={13} /> Remove Admin</>
                            : <><Shield size={13} /> Make Admin</>
                          }
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
  );
};

export default UserList;