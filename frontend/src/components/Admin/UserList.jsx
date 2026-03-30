import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Shield, ShieldOff, ArrowUpDown, AlertCircle, Users as UsersIcon, UserCheck, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-indigo-500', 'bg-purple-500',
  'bg-pink-500', 'bg-teal-500', 'bg-orange-500',
];
const avatarColor = u => AVATAR_COLORS[u.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % AVATAR_COLORS.length];

const inputCls = "w-full pl-10 pr-4 py-3 text-base rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm";
const selectCls = "text-base px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:border-blue-500 shadow-sm transition-colors";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('asc');
  const [role, setRole] = useState('all');

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
      fetchUsers(); toast.success('Role updated');
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
      <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <AlertCircle size={40} className="text-gray-300" />
      <p className="text-base text-gray-500">Failed to load users</p>
      <button onClick={fetchUsers} className="text-base text-blue-600 font-semibold underline underline-offset-2">Retry</button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">User Management</h2>
          <p className="text-base text-gray-500 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" />
            {users.length} registered accounts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
            <UsersIcon size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">{users.filter(u => !u.isAdmin).length} Users</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-xl">
            <Shield size={16} className="text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">{users.filter(u => u.isAdmin).length} Admins</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…" className={inputCls} />
        </div>
        <select value={role} onChange={e => setRole(e.target.value)} className={selectCls}>
          <option value="all">All Roles</option>
          <option value="admin">Admins</option>
          <option value="user">Users</option>
        </select>
        <button onClick={() => setSort(s => s === 'asc' ? 'desc' : 'asc')}
          className="flex items-center gap-2 px-4 py-3 text-base font-semibold rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 shadow-sm transition-all">
          <ArrowUpDown size={16} />
          {sort === 'asc' ? 'A → Z' : 'Z → A'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Search size={32} className="text-gray-200" />
            <p className="text-base text-gray-400 font-medium">No users match your search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="text-right px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-full ${avatarColor(user.username)} flex items-center justify-center text-base font-bold text-white flex-shrink-0`}>
                          {user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-base font-bold text-gray-900">{user.username}</p>
                          <p className="text-sm text-gray-400 mt-0.5">
                            Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-base text-gray-600 hidden sm:table-cell">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold
                        ${user.isAdmin ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => toggleAdmin(user._id, user.isAdmin)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
                          ${user.isAdmin
                            ? 'text-red-600 bg-red-50 hover:bg-red-100'
                            : 'text-green-700 bg-green-50 hover:bg-green-100'
                          }`}>
                        {user.isAdmin ? <><ShieldOff size={15} /> Remove Admin</> : <><Shield size={15} /> Make Admin</>}
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
