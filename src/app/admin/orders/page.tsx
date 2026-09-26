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
  Check,
  Zap,
} from 'lucide-react';
import { triggerWebNotification } from '@/lib/notifications';

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
  const [verifiedPrice, setVerifiedPrice] = useState<number | string>('');
  const [updating, setUpdating] = useState(false);

  // Inspect full details modal
  const [inspectOrder, setInspectOrder] = useState<any>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders?limit=100', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (overrideStatus?: string, customNote?: string) => {
    if (!selectedOrder) return;
    const targetStatus = overrideStatus || newStatus || selectedOrder.status;
    const note = customNote || statusNote || `Status updated to ${targetStatus}`;
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          assignedAgent: newAgent || selectedOrder.assignedAgent,
          statusNote: note,
          finalVerifiedPrice: verifiedPrice !== '' ? Number(verifiedPrice) : undefined,
          adminName: 'Super Admin',
        }),
      });
      const data = await res.json();
      if (data.success) {
        triggerWebNotification(`Order ${selectedOrder.orderNumber}: ${targetStatus.replace(/_/g, ' ')}`, {
          body: `Order status updated. Customer track section updated in real-time!`,
          soundType: 'order',
        });
        setSelectedOrder(null);
        await fetchOrders();
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
    const s = search.toLowerCase();
    const matchSearch =
      !search ||
      (o.orderNumber && o.orderNumber.toLowerCase().includes(s)) ||
      (o.customerName && o.customerName.toLowerCase().includes(s)) ||
      (o.customerPhone && o.customerPhone.includes(search)) ||
      (o.modelName && o.modelName.toLowerCase().includes(s)) ||
      (o.pickupCity && o.pickupCity.toLowerCase().includes(s));
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
                          setVerifiedPrice(ord.finalVerifiedPrice ? String(ord.finalVerifiedPrice) : String(ord.estimatedPrice));
                          setStatusNote('');
                        }}
                        className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold shadow-sm transition-all"
                      >
                        Manage
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

      {/* Order Management Modal (Screenshot 5 Match) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 glass-panel space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs text-slate-400 font-semibold">Order Management</span>
                <h2 className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                  {selectedOrder.orderNumber}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-purple-950/80 text-purple-300 border border-purple-500/30">
                    Sell
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                    {selectedOrder.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Change Order Status Panel (Screenshot 5 Match) */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Change Order Status</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  Current: {selectedOrder.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Quick Status Buttons Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('PICKUP_SCHEDULED', 'Executive assigned and doorstep pickup scheduled')}
                  disabled={updating}
                  className="px-3 py-2.5 rounded-xl border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-950/70 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus('COLLECTED', 'Executive inspected and collected device from customer doorstep')}
                  disabled={updating}
                  className="px-3 py-2.5 rounded-xl border border-amber-500/40 bg-amber-950/30 hover:bg-amber-950/70 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Picked Up</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus('IN_VERIFICATION', 'Device is undergoing physical and diagnostic verification')}
                  disabled={updating}
                  className="px-3 py-2.5 rounded-xl border border-purple-500/40 bg-purple-950/30 hover:bg-purple-950/70 text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Inspection</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus('PAYMENT_COMPLETED', 'Doorstep IMPS/UPI payment transferred successfully')}
                  disabled={updating}
                  className="px-3 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-950/70 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Complete</span>
                </button>
              </div>

              {/* Status Dropdown Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-slate-400 shrink-0">All Statuses:</span>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500"
                >
                  {STATUS_LIST.filter((s) => s !== 'ALL').map((st) => (
                    <option key={st} value={st}>
                      {st.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer & Device Information (Screenshot 5 Match) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Customer Box */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Customer
                </div>
                <div className="font-bold text-sm text-white">{selectedOrder.customerName}</div>
                <div className="text-slate-300 font-mono">+91 {selectedOrder.customerPhone}</div>
                <div className="text-slate-400 leading-snug">
                  {selectedOrder.pickupAddress}, {selectedOrder.pickupCity}
                </div>
                <div className="text-slate-500 font-mono">PIN: {selectedOrder.pickupPincode}</div>
              </div>

              {/* Device Box */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Device
                </div>
                <div className="font-bold text-sm text-white">
                  {selectedOrder.modelName} {selectedOrder.variantName}
                </div>
                <div className="text-cyan-400 text-xs">
                  {selectedOrder.brandName} • {selectedOrder.categoryName}
                </div>
                <div className="text-slate-300">
                  Pickup: <strong className="text-white">{selectedOrder.pickupDate}</strong>
                </div>
                <div className="text-slate-400 font-mono text-[11px]">
                  Slot: {selectedOrder.pickupTimeSlot}
                </div>
              </div>
            </div>

            {/* Pricing Box (Screenshot 5 Match) */}
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pricing
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-slate-400 text-xs">Quoted Price</div>
                  <div className="text-xl font-extrabold text-white font-mono mt-0.5">
                    ₹{selectedOrder.estimatedPrice?.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-xs">Final Inspected Price (₹)</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <input
                      type="number"
                      placeholder={selectedOrder.finalVerifiedPrice ? String(selectedOrder.finalVerifiedPrice) : String(selectedOrder.estimatedPrice)}
                      value={verifiedPrice}
                      onChange={(e) => setVerifiedPrice(e.target.value)}
                      className="px-3 py-1.5 w-36 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-bold font-mono text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Agent & Status Transition Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Assigned Executive</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar (Doorstep Agent)"
                  value={newAgent}
                  onChange={(e) => setNewAgent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Status Update Note</label>
                <input
                  type="text"
                  placeholder="e.g. Executive dispatched for collection"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus()}
                disabled={updating}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{updating ? 'Updating...' : 'Save & Sync Status'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
