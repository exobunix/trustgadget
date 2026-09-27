import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, FileText, Trash2, Mail, Phone, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Trust Gadget',
  description: 'Learn how Trust Gadget collects, uses, protects, and shares your data with authorized partner representatives for device trade-ins and doorstep pickups.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      {/* Top Breadcrumb & Header */}
      <div>
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
              Legal & Compliance
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Legal Entity: <span className="font-semibold text-slate-800 dark:text-slate-200">Trust Gadget</span> • Last Updated: September 2026
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold w-fit">
            <ShieldCheck className="w-4 h-4" /> 100% Data Privacy Guaranteed
          </div>
        </div>
      </div>

      {/* Safety Notice Callout (Item 5 Requirement) */}
      <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 shadow-sm flex items-start gap-3.5">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
            Seller Advisory: Clean Your Phone Data Before Collection
          </h4>
          <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
            For your safety and personal concern, Trust Gadget strictly requests you to log out of all personal accounts (Apple iCloud, Google Account, Samsung Account), disable screen passwords / biometric locks, and perform a factory reset before handing over the phone to our collection executive.
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {/* Section 1 */}
        <section className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base">
            <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h2>1. What Data We Collect</h2>
          </div>
          <p>
            When you use Trust Gadget to receive an algorithmic trade-in quotation, request support, or schedule a doorstep inspection and pickup, we collect the following categories of information:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <li>
              <strong className="text-slate-900 dark:text-slate-200">Contact & Identity Details:</strong> Full name, mobile phone number, email address, physical pickup address, landmark, city, state, and postal pincode.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-slate-200">Device & Trade-In Data:</strong> Device category, brand, model, storage/RAM variant, serial/IMEI details (upon inspection), declared functional condition answers, and uploaded device photos.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-slate-200">Payout Information:</strong> Chosen payment method, UPI ID (Virtual Payment Address), or Bank Account Number and IFSC Code for direct fund transfers.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-slate-200">Audit & Consent Telemetry:</strong> Precise timestamp of consent, client IP address, browser user-agent, and the exact consent text displayed during form submission.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base">
            <Eye className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h2>2. Why We Collect Your Information</h2>
          </div>
          <p>
            Trust Gadget utilizes your information strictly for legitimate commercial purposes in connection with electronic device valuations and doorstep buybacks:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-semibold">Instant Algorithmic Valuation</strong>
              <span className="text-slate-500 dark:text-slate-400">To calculate transparent, fair market prices based on device specs and declared condition.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-semibold">Doorstep Inspection & Pickup</strong>
              <span className="text-slate-500 dark:text-slate-400">To dispatch authorized logistics collection executives directly to your designated address.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-semibold">Instant Payout Processing</strong>
              <span className="text-slate-500 dark:text-slate-400">To initiate instantaneous UPI or IMPS bank disbursements once device verification is complete.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-semibold">Verification & Fraud Prevention</strong>
              <span className="text-slate-500 dark:text-slate-400">To verify ownership authenticity, prevent stolen goods distribution, and comply with Indian law.</span>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base">
            <Lock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h2>3. Sharing with Authorized Partner Representatives</h2>
          </div>
          <p>
            Trust Gadget acts as a specialized technology platform connecting device owners with verified trade-in logistics and buyer networks. In order to complete your doorstep pickup and device verification:
          </p>
          <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-500/30 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong className="text-cyan-900 dark:text-cyan-300 block mb-1 font-bold">Partner Disclosure:</strong>
            Your contact details (name, phone number, email, and pickup address) and device particulars are shared with our background-verified partner representative / collection executive who will contact and visit you on behalf of <strong className="text-slate-900 dark:text-white">Trust Gadget</strong>.
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            All partners operate under binding service-level agreements and non-disclosure obligations, and are strictly prohibited from using your personal data for any purpose other than executing the specific trade-in transaction.
          </p>
        </section>

        {/* Section 4 */}
        <section className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base">
            <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h2>4. Data Retention Policy (How Long We Keep Your Data)</h2>
          </div>
          <p>
            We retain personal information only for the duration necessary to satisfy the objectives outlined in this policy:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <li>
              <strong className="text-slate-900 dark:text-slate-200">Active Trade-In Transactions:</strong> Information is maintained actively throughout the pickup scheduling, verification, and payment stages.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-slate-200">Statutory Tax & Regulatory Records:</strong> Purchase invoices, order numbers, and verified transaction logs are maintained for up to 5 years as required by Indian commercial, tax, and anti-fraud statutory frameworks.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-slate-200">Consent & Audit Trails:</strong> IP addresses and timestamped consent logs are preserved securely to maintain tamper-proof audit trails of legal permissions granted.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-slate-200">Uncompleted Enquiries:</strong> Incomplete lead submissions or general contact queries are purged or anonymized after 180 days.
            </li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base">
            <Trash2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2>5. Your Rights: How to Request Deletion or Access What We Have</h2>
          </div>
          <p>
            You have clear, enforceable rights concerning your personal data:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deletion Box */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Right to Request Data Deletion
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You may request complete erasure of your personal contact data from our active databases at any time.
              </p>
              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-[11px] text-slate-700 dark:text-slate-300">
                Send an email with the subject line <strong>&quot;Data Deletion Request&quot;</strong> to{' '}
                <a href="mailto:trustgadgetmart@gmail.com" className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline">
                  trustgadgetmart@gmail.com
                </a>
                . We process verified requests within 30 days.
              </div>
            </div>

            {/* Access Box */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-cyan-500" /> Right to Inquire What Data We Have
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You have the right to request a complete summary or export of all personal details and transaction records linked to your phone number or email.
              </p>
              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-[11px] text-slate-700 dark:text-slate-300">
                Email our Grievance Desk at{' '}
                <a href="mailto:trustgadgetmart@gmail.com" className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline">
                  trustgadgetmart@gmail.com
                </a>{' '}
                or call{' '}
                <a href="tel:+919113990217" className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline">
                  +91 91139 90217
                </a>
                .
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Grievance Officer & Contact Details */}
        <section className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base">
            <Mail className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h2>6. Company Legal Contact Details & Grievance Desk</h2>
          </div>
          <p>
            If you have questions, feedback, or grievance regarding data handling or partner conduct, contact our official grievance desk:
          </p>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-slate-900 dark:text-white">Company Legal Name: Trust Gadget</div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Phone className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Helpline: <strong className="text-slate-900 dark:text-white">+91 91139 90217</strong> (Mon–Sun, 9:00 AM – 8:00 PM IST)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Mail className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Official Email: <strong className="text-slate-900 dark:text-white">trustgadgetmart@gmail.com</strong></span>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Navigation Backlink */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <p>© {new Date().getFullYear()} Trust Gadget. All rights reserved.</p>
        <div className="flex items-center gap-3">
          <Link href="/terms" className="text-cyan-600 dark:text-cyan-400 hover:underline">Terms of Service</Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-slate-800 dark:hover:text-slate-200">Contact Desk</Link>
          <span>•</span>
          <Link href="/sell" className="hover:text-slate-800 dark:hover:text-slate-200">Sell Device</Link>
        </div>
      </div>
    </div>
  );
}
