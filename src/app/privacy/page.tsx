import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-white">Privacy & Certified Data Sanitization Policy</h1>
        <p className="text-xs text-slate-400 mt-2">TrustMyGadget Technologies India Pvt Ltd</p>
      </div>

      <div className="text-xs text-slate-300 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-emerald-400">1. Data Privacy Guarantee</h2>
          <p>We take customer privacy with utmost seriousness. Personal contact information collected during pickup scheduling is used solely for logistics dispatch, payout processing, and regulatory tax compliance.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-emerald-400">2. Department of Defense (DoD) Standard Erasure</h2>
          <p>All flash storage, NVMe SSDs, and internal storage of purchased devices undergo multi-pass cryptographic data sanitization to ensure zero data recovery prior to refurbishing or recycling.</p>
        </section>
      </div>
    </div>
  );
}
