'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Shield, Lock, Phone, Mail } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success) {
          const map: Record<string, string> = {};
          data.data.forEach((s: any) => {
            map[s.key] = s.value;
          });
          setSettings(map);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      for (const [key, value] of Object.entries(settings)) {
        await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value, adminName: 'Super Admin' }),
        });
      }
      setSavedSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const updateKey = (key: string, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
    setSavedSuccess(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
          Platform Governance
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
          System & Business Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure operational thresholds, customer support endpoints, and administrative permissions.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Company Information */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" /> Company & Support Endpoints
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Company Registered Name</label>
              <input
                type="text"
                value={settings.company_name || 'TrustMyGadget Technologies India Pvt Ltd'}
                onChange={(e) => updateKey('company_name', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Toll-Free Customer Support</label>
              <input
                type="text"
                value={settings.support_phone || '1800 209 8899'}
                onChange={(e) => updateKey('support_phone', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Support Email</label>
              <input
                type="email"
                value={settings.support_email || 'help@trustmygadget.com'}
                onChange={(e) => updateKey('support_email', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Serviceable Pincodes in India</label>
              <input
                type="text"
                value={settings.pickup_pincodes_count || '19450'}
                onChange={(e) => updateKey('pickup_pincodes_count', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
              />
            </div>
          </div>
        </div>

        {/* Business & Valuation Controls */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" /> Valuation & Payment Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Minimum Buyback Purchase Value (₹)</label>
              <input
                type="number"
                value={settings.min_order_value || '1500'}
                onChange={(e) => updateKey('min_order_value', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Instant Doorstep UPI Payouts</label>
              <select
                value={settings.instant_upi_enabled || 'true'}
                onChange={(e) => updateKey('instant_upi_enabled', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
              >
                <option value="true">Enabled (Instant IMPS / VPA)</option>
                <option value="false">Disabled (Next-day settlement)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Role Permissions Matrix View */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" /> Role-Based Access Control (RBAC)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[
              { role: 'Super Admin', desc: 'Catalog, Pricing Rules, Orders, CMS, Audit Logs, Settings', badge: 'ALL_PERMISSIONS' },
              { role: 'Ops Manager', desc: 'Order Dispatch, Agent Assign, Rescheduling, Escalations', badge: 'OPERATIONS' },
              { role: 'Verification Agent', desc: 'Physical Inspection Studio, Final Price Renegotiation', badge: 'VERIFICATION' },
              { role: 'Content Manager', desc: 'Hero Banners, Blogs, FAQs, SEO, Testimonials', badge: 'CMS_EDITOR' },
            ].map((r, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{r.role}</span>
                  <span className="text-[9px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800">
                    {r.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Platform settings saved successfully.</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
