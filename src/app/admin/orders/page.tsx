'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Filter,
  ArrowRight,
  UserCheck,
  CreditCard,
  Edit,
  Eye,
  AlertCircle,
  RefreshCw,
  X,
  Smartphone,
} from 'lucide-react';

const STATUS_LIST = [
  'ALL',
  'ORDER_PLACED',
  'PICKUP_SCHEDULED',
  'COLLECTED',
  'IN_VERIFICATION',
  'PRICE_CONFIRMED',
  'PAYMENT_COMPLETED',
  'CANCELLED',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Status edit modal state
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newAgent, setNewAgent] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  // Inspect full details modal
  const [inspectOrder, setInspectOrder] = useState<any>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders?limit=100');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus || selectedOrder.status,
          assignedAgent: newAgent || selectedOrder.assignedAgent,
          statusNote,
          adminName: 'Super Admin',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleQuickMarkPaid = async (orderId: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'PAYMENT_COMPLETED',
          paymentStatus: 'PAID',
          statusNote: 'Doorstep IMPS/UPI payment transferred to customer.',
          adminName: 'Super Admin',
        }),
      });
      fetchOrders();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search) ||
      o.modelName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Fulfillment & Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Sell Orders Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review incoming pickups, inspect detailed question answers, assign field agents, and manage payouts.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-2 text-xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {STATUS_LIST.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-cyan-400 text-slate-950 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order ID, phone, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden glass-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Order ID</th>
                <th className="py-3.5 px-4 font-semibold">Customer & Contact</th>
                <th className="py-3.5 px-4 font-semibold">Device Model</th>
                <th className="py-3.5 px-4 font-semibold">Scheduled Slot</th>
                <th className="py-3.5 px-4 font-semibold">Estimated / Verified</th>
                <th className="py-3.5 px-4 font-semibold">Assigned Agent</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No orders matching the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{ord.customerName}</div>
                      <div className="text-slate-400 text-[11px]">+91 {ord.customerPhone}</div>
                      <div className="text-slate-500 text-[10px] truncate max-w-[150px]">{ord.pickupCity}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-200">{ord.modelName}</div>
                      <div className="text-slate-400 text-[10px]">{ord.variantName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">{ord.pickupDate}</div>
                      <div className="text-slate-500 text-[10px]">{ord.pickupTimeSlot}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-emerald-400 font-extrabold text-sm">
                        ₹{(ord.finalVerifiedPrice || ord.estimatedPrice).toLocaleString('en-IN')}
                      </div>
                      {ord.finalVerifiedPrice && (
                        <div className="text-[10px] text-purple-300">Verified Payout</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 font-medium">{ord.assignedAgent || 'Unassigned'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.status === 'PAYMENT_COMPLETED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : ord.status === 'IN_VERIFICATION'
                          ? 'bg-purple-950 text-purple-400 border border-purple-500/30'
                          : ord.status === 'CANCELLED'
                          ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {ord.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setInspectOrder(ord)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-medium"
                        title="View Full Declared Condition & Answers"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setNewStatus(ord.status);
                          setNewAgent(ord.assignedAgent || '');
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium"
                      >
                        Status
                      </button>
                      <Link
                        href={`/admin/verification?orderId=${ord.id}`}
                        className="px-2 py-1 rounded bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 text-[11px] font-medium"
                      >
                        Verify
                      </Link>
                      {ord.status !== 'PAYMENT_COMPLETED' && ord.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleQuickMarkPaid(ord.id)}
                          className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[11px] font-medium"
                        >
                          Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT ORDER DETAILS & DECLARED ANSWERS MODAL */}
      {inspectOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 glass-panel space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-500/30">
                  ORDER DETAILS & DECLARED ANSWERS
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {inspectOrder.modelName} ({inspectOrder.variantName})
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Order #{inspectOrder.orderNumber} • Placed on {new Date(inspectOrder.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setInspectOrder(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price & Payout Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Base Model Price</div>
                <div className="text-sm font-bold text-white mt-0.5">₹{inspectOrder.basePrice?.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Final Quote</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">₹{(inspectOrder.finalVerifiedPrice || inspectOrder.estimatedPrice).toLocaleString('en-IN')}</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Payout Method</div>
                <div className="text-xs font-bold text-cyan-300 mt-0.5">{inspectOrder.payoutMethod}</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Payment Status</div>
                <div className="text-xs font-bold text-amber-400 mt-0.5">{inspectOrder.paymentStatus}</div>
              </div>
            </div>

            {/* Customer & Pickup Schedule */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="font-bold text-cyan-400 uppercase tracking-wider text-[11px]">Customer & Logistics</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                <div>Customer: <b className="text-white">{inspectOrder.customerName}</b> (+91 {inspectOrder.customerPhone})</div>
                <div>Scheduled: <b className="text-white">{inspectOrder.pickupDate} ({inspectOrder.pickupTimeSlot})</b></div>
                <div className="sm:col-span-2">Address: <span className="text-slate-400">{inspectOrder.pickupAddress}, {inspectOrder.pickupCity} - {inspectOrder.pickupPincode}</span></div>
                {inspectOrder.payoutMethod === 'UPI' ? (
                  <div>UPI VPA: <span className="font-mono text-cyan-300">{inspectOrder.payoutUpiId}</span></div>
                ) : (
                  <div>Bank: <span className="font-mono text-cyan-300">{inspectOrder.payoutBankAccount} ({inspectOrder.payoutBankIfsc})</span></div>
                )}
                <div>Assigned Agent: <span className="font-semibold text-purple-300">{inspectOrder.assignedAgent || 'Unassigned'}</span></div>
              </div>
            </div>

            {/* DECLARED QUESTIONS & ANSWERS MATRIX */}
            <div className="space-y-3">
              <div className="font-bold text-white uppercase tracking-wider text-xs flex items-center justify-between">
                <span>Customer Declared Condition & Diagnostic Answers:</span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
                {inspectOrder.conditionSummary ? (
                  typeof inspectOrder.conditionSummary === 'string' ? (
                    (() => {
                      try {
                        const parsed = JSON.parse(inspectOrder.conditionSummary);
                        if (Array.isArray(parsed)) {
                          return parsed.map((item: any, idx: number) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                              <span className="text-slate-300 font-medium">{item.questionCode?.replace(/_/g, ' ')}</span>
                              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">
                                {item.answerCode?.replace(/_/g, ' ')}
                              </span>
                            </div>
                          ));
                        }
                        return Object.entries(parsed).map(([k, v]) => (
                          <div key={k} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                            <span className="text-slate-300 font-medium">{k.replace(/_/g, ' ')}</span>
                            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">{String(v)}</span>
                          </div>
                        ));
                      } catch (e) {
                        return <div className="p-3 rounded-xl bg-slate-950 text-slate-300 font-mono">{inspectOrder.conditionSummary}</div>;
                      }
                    })()
                  ) : (
                    Object.entries(inspectOrder.conditionSummary).map(([k, v]) => (
                      <div key={k} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-300 font-medium">{k.replace(/_/g, ' ')}</span>
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">{String(v)}</span>
                      </div>
                    ))
                  )
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950 text-slate-500 italic text-center">
                    No individual diagnostic answers recorded for this order.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setInspectOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <Link
                href={`/admin/verification?orderId=${inspectOrder.id}`}
                className="px-5 py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 text-xs font-bold"
              >
                Open Verification Studio →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Status / Agent Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 glass-panel space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                Update Order: <span className="text-cyan-400 font-mono">{selectedOrder.orderNumber}</span>
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pipeline Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  {STATUS_LIST.filter((s) => s !== 'ALL').map((s) => (
                    <option key={s} value={s}>
                      {s.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assign Field Agent</label>
                <input
                  type="text"
                  placeholder="e.g. Kiran Patel (Senior Field Inspector)"
                  value={newAgent}
                  onChange={(e) => setNewAgent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Status Transition Note</label>
                <input
                  type="text"
                  placeholder="e.g. Agent dispatched to customer residence"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="px-6 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold shadow-md disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Save Updates'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
