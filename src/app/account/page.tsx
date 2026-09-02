'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Truck,
  CreditCard,
  History,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Smartphone,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';

export default function CustomerAccountPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'history' | 'profile' | 'payouts'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch('/api/orders?limit=20');
        const data = await res.json();
        if (data.success) {
          setOrders(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const activeOrders = orders.filter((o) => o.status !== 'PAYMENT_COMPLETED' && o.status !== 'CANCELLED');
  const completedOrders = orders.filter((o) => o.status === 'PAYMENT_COMPLETED');
  const totalEarnings = completedOrders.reduce((acc, curr) => acc + (curr.finalVerifiedPrice || curr.estimatedPrice || 0), 0);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel shadow-xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-xl text-cyan-400">
              AG
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-xl sm:text-2xl font-bold text-white">Adarsh Gupta</h1>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                Verified Seller
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">+91 98765 43210 • adarsh.gupta@example.com</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-center sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-800 w-full sm:w-auto justify-around sm:justify-end">
          <div>
            <div className="text-xs text-slate-400">Total Payouts</div>
            <div className="text-xl font-extrabold text-emerald-400">
              ₹{totalEarnings.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-xs text-slate-400">Devices Sold</div>
            <div className="text-xl font-extrabold text-cyan-400">{completedOrders.length}</div>
          </div>
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-800">
        {[
          { id: 'orders', label: `Active Orders (${activeOrders.length})`, icon: Truck },
          { id: 'history', label: `Sell History (${completedOrders.length})`, icon: History },
          { id: 'profile', label: 'Saved Addresses', icon: MapPin },
          { id: 'payouts', label: 'Payout Accounts', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-fadeIn">
          {activeOrders.length === 0 ? (
            <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800 p-8">
              <Smartphone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Active Sell Orders</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                You do not have any pending device pickups scheduled right now.
              </p>
              <Link
                href="/sell"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold text-xs shadow-md"
              >
                <span>Sell a Gadget Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            activeOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 glass-panel"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                    {ord.deviceImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ord.deviceImageUrl} alt={ord.modelName} className="w-full h-full object-cover rounded" />
                    ) : (
                      <Smartphone className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-cyan-300">{ord.orderNumber}</span>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                        {ord.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-0.5">{ord.modelName}</h3>
                    <p className="text-xs text-slate-400">Pickup: {ord.pickupDate} ({ord.pickupTimeSlot})</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-left sm:text-right">
                    <div className="text-[11px] text-slate-400">Quote Payout</div>
                    <div className="text-base font-extrabold text-cyan-300">
                      ₹{ord.estimatedPrice.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <Link
                    href={`/track-order?q=${ord.orderNumber}`}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Track Status</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4 animate-fadeIn">
          {completedOrders.map((ord) => (
            <div
              key={ord.id}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 glass-panel"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                  {ord.deviceImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ord.deviceImageUrl} alt={ord.modelName} className="w-full h-full object-cover rounded" />
                  ) : (
                    <Smartphone className="w-6 h-6 text-slate-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-cyan-300">{ord.orderNumber}</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Payout Completed
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-0.5">{ord.modelName}</h3>
                  <p className="text-xs text-slate-400">Sold on {new Date(ord.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-[11px] text-slate-400">Total Received</div>
                <div className="text-lg font-black text-emerald-400">
                  ₹{(ord.finalVerifiedPrice || ord.estimatedPrice).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">Paid via {ord.payoutMethod}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Saved Pickup Addresses
          </h3>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300">Home Address (Default)</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Serviceable Pincode</span>
            </div>
            <p className="text-xs text-slate-300">
              Flat 402, Cyber Heights, Sector 62, Gurugram, Haryana - 122002
            </p>
            <p className="text-xs text-slate-500">Contact: +91 98765 43210</p>
          </div>
        </div>
      )}

      {activeTab === 'payouts' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Linked Payout Methods
          </h3>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Default UPI ID</span>
              <span className="text-[10px] text-cyan-400 font-semibold">Verified</span>
            </div>
            <p className="font-mono text-xs text-cyan-300">adarsh@okaxis</p>
            <p className="text-[11px] text-slate-500">All future device payouts will credit instantly to this VPA.</p>
          </div>
        </div>
      )}
    </div>
  );
}
