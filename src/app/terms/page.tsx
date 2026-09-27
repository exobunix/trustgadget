import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Scale, Handshake, AlertTriangle, ArrowLeft, Phone, Mail, FileCheck } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | Trust Gadget',
  description: 'Understand the terms governing device valuations, doorstep partner pickups, vendor relationships, and dispute resolution on Trust Gadget.',
};

export default function TermsPage() {
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
              Terms & Legal Framework
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Terms of Service
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Legal Entity: <span className="font-semibold text-slate-800 dark:text-slate-200">Trust Gadget</span> • Last Updated: September 2026
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-semibold w-fit">
            <Scale className="w-4 h-4" /> Vendor & Lead-Gen Platform Rules
          </div>
        </div>
      </div>

      {/* Legal Review Note Banner */}
      <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/30 flex items-start gap-3">
        <FileCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-cyan-950 dark:text-cyan-200 leading-relaxed">
          <strong className="block font-bold">Interim Operating Terms Notice:</strong>
          These terms outline the operational model of Trust Gadget as a lead-generation trade-in platform. A finalized statutory addendum will be published upon conclusion of ongoing formal legal counsel review.
        </div>
      </div>

      {/* Safety Notice Callout (Item 5 Requirement) */}
      <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 shadow-sm flex items-start gap-3.5">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
            Mandatory Requirement for Phone Sellers
          </h4>
          <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
            Trust Gadget kindly requests you to clean and wipe all personal phone data (remove Google/Apple iCloud accounts, erase biometric locks, and conduct a factory reset) before handing over the phone to our collection executive for your personal safety, security, and privacy concern.
          </p>
        </div>
      </div>

      {/* Terms Body */}
      <div className="space-y-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {/* Section 1 */}
        <section className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base">
            <Handshake className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h2>1. Platform Role: Lead-Generation & Marketplace Discovery</h2>
          </div>
          <p>
            <strong className="text-slate-900 dark:text-white">Trust Gadget</strong> operates as a digital lead-generation and marketplace discovery platform. We provide automated valuation tools, quote discovery engines, and scheduling infrastructure to connect prospective sellers of second-hand electronic devices with verified commercial buyers and authorized trade-in partners.
          </p>
          <p>
            Trust Gadget facilitates the initial valuation match, customer scheduling, and confirmation communication. The actual physical examination, on-site device purchase, and doorstep collection are executed by our verified partner networks.
          </p>
        </section>

        {/* Section 2 */}
        <section className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base">
            <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h2>2. Verified Partner Agents & Vendor Status</h2>
          </div>
          <p>
            Our doorstep collection executives and field evaluation technicians represent verified partner logistics companies and authorized electronics refurbishers:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <li>
              <strong className="text-slate-900 dark:text-slate-200">Vendor Relationship:</strong> Field collection agents operate as independent vendors / contractors who are background-verified and onboarded under vendor agreements to fulfill doorstep pickups on behalf of Trust Gadget.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-slate-200">Verification Protocol:</strong> Every collection executive carries official digital authorization and order identification matching your unique Trust Gadget Order ID (e.g., TMG-XXXXXX). You can verify any visiting agent via our live tracking portal or by calling <strong className="text-slate-900 dark:text-white">+91 91139 90217</strong>.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-slate-200">Doorstep Diagnostics:</strong> Partner agents follow standardized diagnostic protocols to verify screen conditions, battery health, camera functionality, and physical integrity against your declared answers.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base">
            <Scale className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h2>3. Device Ownership & Seller Declarations</h2>
          </div>
          <p>
            By booking a sell order or submitting an enquiry on Trust Gadget, you explicitly warrant and certify that:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <li>You are the lawful and rightful owner of the gadget, or have obtained explicit legal authority from the owner to sell the gadget.</li>
            <li>You are at least 18 years of age and competent to enter into a legally binding contract under the Indian Contract Act, 1872.</li>
            <li>The device is completely free of any financial liens, active EMI locks, lease obligations, or unpaid carrier contracts.</li>
            <li>The device is not stolen, counterfeit, blacklisted, or subject to any ongoing police investigation or legal claim.</li>
            <li>You agree to provide a valid Government photo ID (Aadhaar Card, Voter ID, Driving License, or Passport) to the collection executive at the time of pickup for ownership transfer compliance.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base">
            <Scale className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h2>4. Algorithmic Quotation & Doorstep Price Revaluation</h2>
          </div>
          <p>
            Online quotes provided by Trust Gadget represent estimated algorithmic valuations based on declared functional and cosmetic inputs. Upon physical examination:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <li>If the device condition matches your declared answers, the full estimated quote is paid instantly.</li>
            <li>If physical defects or undisclosed functional flaws are uncovered during diagnostic testing, the partner agent will present a revised fair-market offer with transparent deduction details.</li>
            <li>
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Zero-Fee Cancellation Right:</strong> You maintain the unconditional right to reject any revised price. If you decline, the pickup is cancelled immediately at zero charge to you.
            </li>
          </ul>
        </section>

        {/* Section 5: Dispute Language */}
        <section className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base">
            <Scale className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h2>5. Dispute Resolution & Governing Law</h2>
          </div>
          <p>
            Trust Gadget is committed to fair, amicable, and prompt resolution of any customer grievances:
          </p>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-semibold">1. Informal Resolution Process</strong>
              <p className="text-slate-500 dark:text-slate-400">
                In the event of any disagreement, grievance, or dispute regarding device valuation, partner conduct, or payout transfer, the user agrees to first submit a formal complaint to our Grievance Desk at <strong className="text-slate-900 dark:text-white">trustgadgetmart@gmail.com</strong> or call <strong className="text-slate-900 dark:text-white">+91 91139 90217</strong>. Both parties agree to engage in good-faith discussions for a period of thirty (30) days.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-semibold">2. Limitation of Liability</strong>
              <p className="text-slate-500 dark:text-slate-400">
                To the maximum extent permissible under applicable law, Trust Gadget’s total cumulative liability arising out of or related to any transaction shall not exceed the estimated trade-in price of the applicable device. Trust Gadget is not liable for data loss from devices handed over without prior factory reset.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-semibold">3. Jurisdiction</strong>
              <p className="text-slate-500 dark:text-slate-400">
                These terms and any disputes arising hereunder shall be governed by and construed in accordance with the laws of the Republic of India, and the courts located in Gurugram / New Delhi, India shall have exclusive jurisdiction.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Contact Information */}
        <section className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base">
            <Mail className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h2>6. Company Legal Contact Details</h2>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-slate-900 dark:text-white">Company Legal Name: Trust Gadget</div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Phone className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Helpline: <strong className="text-slate-900 dark:text-white">+91 91139 90217</strong> (Mon–Sun, 9:00 AM – 8:00 PM IST)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Mail className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Support & Legal Enquiries: <strong className="text-slate-900 dark:text-white">trustgadgetmart@gmail.com</strong></span>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Navigation Backlink */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <p>© {new Date().getFullYear()} Trust Gadget. All rights reserved.</p>
        <div className="flex items-center gap-3">
          <Link href="/privacy" className="text-cyan-600 dark:text-cyan-400 hover:underline">Privacy Policy</Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-slate-800 dark:hover:text-slate-200">Contact Support</Link>
          <span>•</span>
          <Link href="/sell" className="hover:text-slate-800 dark:hover:text-slate-200">Sell Device</Link>
        </div>
      </div>
    </div>
  );
}
