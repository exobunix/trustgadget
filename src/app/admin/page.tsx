'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  Clock,
  DollarSign,
  Smartphone,
  Laptop,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/metrics');
      const data = await res.json();
      if (data.success) {
        setMetrics(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const COLORS = ['#00f2fe', '#00e599', '#8b5cf6', '#f59e0b', '#ef4444'];

  // Simulated chart data based on live metrics
  const categoryChartData = metrics?.categoryStats?.map((c: any) => ({
    name: c.categoryName,
    orders: c.orderCount,
    value: c.totalValue,
  })) || [
    { name: 'Smartphones', orders: 12, value: 340000 },
    { name: 'Laptops', orders: 8, value: 410000 },
  ];

  const statusChartData = metrics?.statusCounts?.map((s: any) => ({
    name: s.status.replace('_', ' '),
    count: s.count,
  })) || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
            Executive Summary
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Resale Operations Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live telemetry of incoming customer trade-in orders, field pickup schedules, and financial disbursements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMetrics}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-2"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Resale Volume</span>
            <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            ₹{(metrics?.totalPurchaseValue || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500">Gross customer payout value across all orders</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Orders</span>
            <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {metrics?.totalOrders || 0}
          </div>
          <p className="text-[11px] text-slate-500">
            <span className="text-cyan-400 font-bold">{metrics?.pendingOrders || 0} pending</span> pickups/verifications
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Completed Payouts</span>
            <div className="p-2 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-300">
            {metrics?.completedOrders || 0}
          </div>
          <p className="text-[11px] text-slate-500">
            ₹{(metrics?.completedPurchaseValue || 0).toLocaleString('en-IN')} transferred via UPI
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Catalog Inventory</span>
            <div className="p-2 rounded-xl bg-blue-950/80 text-blue-400 border border-blue-500/30">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-300">
            {metrics?.totalModels || 0} Models
          </div>
          <p className="text-[11px] text-slate-500">
            Across {metrics?.totalBrands || 0} Indian OEM smartphone & laptop brands
          </p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: Orders by Category (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Trade-in Volume by Category
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="orders" fill="#00f2fe" radius={[6, 6, 0, 0]} name="Orders Placed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Pipeline Status Distribution (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Status Breakdown
          </h3>

          <div className="h-64 w-full flex items-center justify-center">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    fontSize={10}
                  >
                    {statusChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500">Collecting pipeline telemetry...</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Stream Table */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Recent Customer Sell Orders</h3>
            <p className="text-xs text-slate-400">Incoming doorstep requests requiring agent assignment or verification.</p>
          </div>
          <Link href="/admin/orders" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold">
            Open Order Manager →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Device & Variant</th>
                <th className="py-3 px-3">Pickup Slot</th>
                <th className="py-3 px-3">Estimated Quote</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {metrics?.recentOrders?.map((ord: any) => (
                <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-cyan-300">{ord.orderNumber}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{ord.customerName}</div>
                    <div className="text-slate-500 text-[10px]">{ord.customerPhone}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-200">{ord.modelName}</div>
                    <div className="text-slate-500 text-[10px]">{ord.variantName}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div>{ord.pickupDate}</div>
                    <div className="text-slate-500 text-[10px]">{ord.pickupTimeSlot}</div>
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-400">
                    ₹{ord.estimatedPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ord.status === 'PAYMENT_COMPLETED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : ord.status === 'IN_VERIFICATION'
                        ? 'bg-purple-950 text-purple-400 border border-purple-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {ord.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <Link
                      href={`/admin/verification?orderId=${ord.id}`}
                      className="px-2.5 py-1 rounded bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 text-[11px] font-semibold"
                    >
                      Verify
                    </Link>
                    <Link
                      href={`/track-order?q=${ord.orderNumber}`}
                      target="_blank"
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
