'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Send, CheckCircle2, MessageSquare, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmationMsg, setConfirmationMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [consentGiven, setConsentGiven] = useState(false); // Unchecked by default

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !phone.trim() || !message.trim()) {
      setErrorMsg('Please fill in your name, mobile number, and query message.');
      return;
    }

    if (phone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!consentGiven) {
      setErrorMsg('Please agree to share your details with our partner representative before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          subject: subject.trim() || 'General Customer Enquiry',
          message: message.trim(),
          consentGiven: true,
          consentText: 'I agree that my details (name, phone, email, address) will be shared with our partner representative who will contact/visit me on behalf of Trust Gadget.',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setConfirmationMsg(
          data.data?.confirmationMessage ||
            `Thanks ${name.trim()}, Our team will contact you within 2 hours. To verify any visit, check our verification helpline at +91 91139 90217.`
        );
      } else {
        setErrorMsg(data.error || 'Failed to send query. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
          Customer Support & Partner Dispatch
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mt-2">
          Contact Trust Gadget
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-3">
          Our dedicated device trade-in and pickup support team is available 7 days a week (9:00 AM – 8:00 PM IST).
        </p>
      </div>

      {/* Safety Notice for Phone Sellers (Requirement 5) */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-amber-950 dark:text-amber-300 font-bold block mb-0.5">
            Seller Safety & Data Privacy Note:
          </strong>
          Trust Gadget kindly requests you to clean and factory reset your phone data before handing over the phone to our collection executive for your safety and concern.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Info Left */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 glass-panel space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Direct Helplines & Contact</h3>
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Customer Helpline</div>
                  <a href="tel:+919113990217" className="text-cyan-700 dark:text-cyan-400 font-bold text-sm hover:underline">
                    +91 91139 90217
                  </a>
                  <p className="text-[11px] text-slate-500 mt-0.5">Mon–Sun (9:00 AM – 8:00 PM IST)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Email Enquiries</div>
                  <a href="mailto:trustgadgetmart@gmail.com" className="text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline">
                    trustgadgetmart@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Company Legal Name</div>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">Trust Gadget</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Operations Hub</div>
                  <p className="text-slate-500 dark:text-slate-400">Cyber City, Phase II, Gurugram, Haryana - 122002</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Right */}
        <div className="lg:col-span-7 p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 glass-panel">
          {submitted ? (
            <div className="py-8 text-center space-y-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Enquiry Received Successfully!</h3>
              
              {/* On-screen Confirmation Message (Requirement 4) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-cyan-200 dark:border-cyan-500/30 text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-md mx-auto space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-cyan-700 dark:text-cyan-400 font-bold">
                  <Clock className="w-4 h-4" />
                  <span>Doorstep Visit & Callback Confirmation</span>
                </div>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {confirmationMsg || `Thanks ${name}, Our team will contact you within 2 hours. To verify any visit, check our verification helpline at +91 91139 90217.`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                  setConsentGiven(false);
                }}
                className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
              >
                Send another enquiry →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Send an Enquiry / Booking Request
              </h3>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-600 dark:text-rose-400">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Phone Selling Enquiry, Doorstep Pickup Status, Price Valuation"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Message / Device Details *</label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
                  placeholder="Describe your device, condition, or question..."
                />
              </div>

              {/* Consent Checkbox (Requirement 1 & 2: unchecked by default just above submit) */}
              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 hover:border-cyan-500/40 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-400 dark:border-slate-700 bg-white dark:bg-slate-900 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  I agree that my details (name, phone, email, address) will be shared with our partner representative who will contact/visit me on behalf of <strong className="text-slate-900 dark:text-white">Trust Gadget</strong>. Read our{' '}
                  <Link href="/privacy" target="_blank" className="text-cyan-600 dark:text-cyan-400 font-medium underline">
                    Privacy Policy
                  </Link>{' '}
                  and{' '}
                  <Link href="/terms" target="_blank" className="text-cyan-600 dark:text-cyan-400 font-medium underline">
                    Terms of Service
                  </Link>.
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Submitting Enquiry...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Enquiry</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
