import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-white">Terms of Service & Buyback Policy</h1>
        <p className="text-xs text-slate-400 mt-2">Last updated: September 2026 • TrustMyGadget Technologies India Pvt Ltd</p>
      </div>

      <div className="text-xs text-slate-300 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-cyan-400">1. Device Ownership & Representation</h2>
          <p>By scheduling a sell order on TrustMyGadget, you certify that you are the lawful owner of the device, you have reached at least 18 years of age, and the device is completely free of liens, financing encumbrances, or theft reports.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-cyan-400">2. Valuation & Physical Diagnostic Verification</h2>
          <p>The online quotation generated on our platform represents an algorithmic estimate based on declared functional status. During free doorstep pickup, our executive conducts an automated 5-minute diagnostic test. If verified condition differs from declared answers, a revised final price will be offered with line-by-line itemized rationale. You have 100% right to decline with zero fee.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-cyan-400">3. Data Sanitization & Account Removal</h2>
          <p>Sellers must disable Apple iCloud / Find My, Google FRP, and BIOS / Knox passwords before handover. TrustMyGadget executes a DoD-certified data sanitization process upon transfer of ownership.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-cyan-400">4. Instant Payout Terms</h2>
          <p>Payouts are transferred immediately upon physical device handover and ownership transfer confirmation via UPI (VPA) or IMPS Direct Bank Transfer.</p>
        </section>
      </div>
    </div>
  );
}
