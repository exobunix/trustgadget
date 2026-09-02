'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Ban, CheckCircle2, Trash2, ShoppingBag, DollarSign, RefreshCw, ShieldAlert } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (phone: string, currentBlocked: number) => {
    const isBlocked = currentBlocked === 1 ? 0 : 1;
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, isBlocked, adminName: 'Super Admin' }),
      });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (phone: string) => {
    if (!confirm(`Are you sure you want to delete user with phone ${phone} and all their orders?`)) return;
    try {
      await fetch(`/api/admin/users?phone=${phone}`, { method: 'DELETE' });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredUsers = users.filter((u) =>
    (u.customerName && u.customerName.toLowerCase().includes(search.toLowerCase())) ||
    (u.customerPhone && u.customerPhone.includes(search)) ||
    (u.customerEmail && u.customerEmail.toLowerCase().includes(search.toLowerCase()))
  );

  const totalVolume = users.reduce((acc, curr) => acc + (curr.totalEarnings || 0), 0);
  const blockedCount = users.filter((u) => u.isBlocked === 1).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            User Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Customers & User Accounts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Inspect customer trade-in profiles, block abusive sellers, and manage account privileges.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-2 text-xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel">
          <div className="text-xs text-slate-400 font-semibold">Total Registered Sellers</div>
          <div className="text-2xl font-black text-white mt-1">{users.length}</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel">
          <div className="text-xs text-slate-400 font-semibold">Total Customer Payouts</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">₹{totalVolume.toLocaleString('en-IN')}</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel">
          <div className="text-xs text-slate-400 font-semibold">Blocked Accounts</div>
          <div className="text-2xl font-black text-rose-400 mt-1">{blockedCount}</div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <span className="text-xs text-slate-400">{filteredUsers.length} accounts found</span>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden glass-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Customer</th>
                <th className="py-3.5 px-4 font-semibold">Contact Phone</th>
                <th className="py-3.5 px-4 font-semibold">Email</th>
                <th className="py-3.5 px-4 font-semibold">Total Orders</th>
                <th className="py-3.5 px-4 font-semibold">Total Payout Volume</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No customer accounts matching query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.customerPhone} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {u.customerName || 'Anonymous Seller'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-cyan-300">
                      +91 {u.customerPhone}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {u.customerEmail || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {u.totalOrders} Order(s)
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-400 font-mono">
                      ₹{(u.totalEarnings || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isBlocked === 1 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit">
                          <Ban className="w-3 h-3" /> BLOCKED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleBlock(u.customerPhone, u.isBlocked)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          u.isBlocked === 1
                            ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {u.isBlocked === 1 ? 'Unblock User' : 'Block User'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.customerPhone)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
