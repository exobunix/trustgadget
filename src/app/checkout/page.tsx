'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Clock,
  CreditCard,
  Zap,
  Smartphone,
  AlertCircle,
  MapPin,
  User,
  Phone,
  Mail,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();

  const [orderSummary, setOrderSummary] = useState<any>(null);
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupCity, setPickupCity] = useState('Gurugram');
  const [pickupState, setPickupState] = useState('Haryana');
  const [pickupPincode, setPickupPincode] = useState('');
  const [pickupLandmark, setPickupLandmark] = useState('');
  const [pickupNotes, setPickupNotes] = useState('');

  // Pickup Slots
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTimeSlot, setPickupTimeSlot] = useState('10:00 AM - 01:00 PM');

  // Payout Method
  const [payoutMethod, setPayoutMethod] = useState<'UPI' | 'BANK_TRANSFER'>('UPI');
  const [payoutUpiId, setPayoutUpiId] = useState('');
  const [payoutBankAccount, setPayoutBankAccount] = useState('');
  const [payoutBankIfsc, setPayoutBankIfsc] = useState('');
  const [payoutBankName, setPayoutBankName] = useState('');

  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Load valuation summary from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('tmg_checkout_order');
      if (stored) {
        setOrderSummary(JSON.parse(stored));
      } else {
        // Fallback demo order if direct URL accessed
        setOrderSummary({
          categoryName: 'Smartphones',
          brandName: 'Apple',
          modelName: 'iPhone 15 Pro Max',
          variantName: '256 GB',
          deviceImageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
          basePrice: 78000,
          estimatedPrice: 79200,
          conditionSummary: { PHONE_POWER: 'YES', PHONE_DISPLAY_TOUCH: 'PERFECT' },
        });
      }

      // Default pickup date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setPickupDate(tomorrow.toISOString().split('T')[0]);
    }
  }, []);

  // Quick Indian date generator for slots
  const availableDates = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    const dateStr = d.toISOString().split('T')[0];
    const displayStr = d.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    return { value: dateStr, label: i === 0 ? `Tomorrow (${displayStr})` : displayStr };
  });

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!customerName || !customerPhone || !pickupAddress || !pickupPincode) {
      setErrorMsg('Please fill in all mandatory contact and address fields.');
      return;
    }
    if (customerPhone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (pickupPincode.replace(/[^0-9]/g, '').length < 6) {
      setErrorMsg('Please enter a valid 6-digit Indian pincode.');
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupDate || !pickupTimeSlot) {
      setErrorMsg('Please select a pickup date and time slot.');
      return;
    }
    setStep(3);
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (payoutMethod === 'UPI' && !payoutUpiId) {
      setErrorMsg('Please enter your valid UPI ID (e.g. mobile@upi).');
      return;
    }
    if (payoutMethod === 'BANK_TRANSFER' && (!payoutBankAccount || !payoutBankIfsc)) {
      setErrorMsg('Please enter your Bank Account Number and IFSC Code.');
      return;
    }
    setStep(4);
  };

  const handleConfirmOrder = async () => {
    if (!agreedToTerms) {
      setErrorMsg('Please accept the terms and conditions.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        customerName,
        customerPhone,
        customerEmail: customerEmail || `${customerPhone.replace(/[^0-9]/g, '')}@trustmygadget.user`,
        categoryName: orderSummary?.categoryName || 'Smartphones',
        brandName: orderSummary?.brandName || 'Apple',
        modelName: orderSummary?.modelName || 'Device',
        variantName: orderSummary?.variantName || 'Standard',
        deviceImageUrl: orderSummary?.deviceImageUrl || null,
        basePrice: orderSummary?.basePrice || 0,
        estimatedPrice: orderSummary?.estimatedPrice || 0,
        payoutMethod,
        payoutUpiId: payoutMethod === 'UPI' ? payoutUpiId : null,
        payoutBankAccount: payoutMethod === 'BANK_TRANSFER' ? payoutBankAccount : null,
        payoutBankIfsc: payoutMethod === 'BANK_TRANSFER' ? payoutBankIfsc : null,
        payoutBankName: payoutMethod === 'BANK_TRANSFER' ? payoutBankName : null,
        pickupDate,
        pickupTimeSlot,
        pickupAddress,
        pickupCity,
        pickupState,
        pickupPincode,
        pickupLandmark,
        pickupNotes,
        conditionSummary: orderSummary?.conditionSummary || {},
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('tmg_checkout_order');
        }
        router.push(`/order-confirmed/${data.data.orderNumber}`);
      } else {
        setErrorMsg(data.error || 'Unable to place order. Please try again.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Stepper Header */}
      <div className="mb-8">
        <Link href="/sell" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Valuation
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              Secure Doorstep Checkout
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Schedule Your Free Pickup
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" /> 100% Free Doorstep Service
          </div>
        </div>

        {/* Stepper Indicators */}
        <div className="grid grid-cols-4 gap-2 mt-6">
          {[
            { num: 1, label: 'Contact & Address' },
            { num: 2, label: 'Pickup Slot' },
            { num: 3, label: 'Payout Method' },
            { num: 4, label: 'Review & Confirm' },
          ].map((s) => (
            <div
              key={s.num}
              className={`p-3 rounded-xl border text-center transition-all ${
                step === s.num
                  ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-bold shadow-sm shadow-cyan-500/10'
                  : step > s.num
                  ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400'
                  : 'border-slate-800 bg-slate-900/50 text-slate-500'
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider">Step {s.num}</div>
              <div className="text-xs truncate">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Area (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 glass-panel shadow-xl">
          {/* STEP 1: CUSTOMER & ADDRESS */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4 animate-fadeIn">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" /> Customer Information & Address
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adarsh Gupta"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number (For Agent Call) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">+91</span>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Doorstep Pickup Address *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Flat / House No, Building Name, Street / Sector"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    placeholder="110001"
                    maxLength={6}
                    value={pickupPincode}
                    onChange={(e) => setPickupPincode(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    value={pickupCity}
                    onChange={(e) => setPickupCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
                  <input
                    type="text"
                    value={pickupState}
                    onChange={(e) => setPickupState(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nearby Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="Near Metro Station / Opposite Mall"
                  value={pickupLandmark}
                  onChange={(e) => setPickupLandmark(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-2"
                >
                  <span>Continue to Pickup Slot</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PICKUP SCHEDULING */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" /> Choose Pickup Date & Time
                </h3>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Edit Address
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Select Preferred Date</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableDates.map((d) => (
                    <button
                      type="button"
                      key={d.value}
                      onClick={() => setPickupDate(d.value)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        pickupDate === d.value
                          ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Select Time Window</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    '10:00 AM - 01:00 PM',
                    '01:00 PM - 04:00 PM',
                    '04:00 PM - 07:00 PM',
                  ].map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setPickupTimeSlot(slot)}
                      className={`p-3 rounded-xl border text-center text-xs transition-all ${
                        pickupTimeSlot === slot
                          ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Special Instructions for Logistics Agent</label>
                <input
                  type="text"
                  placeholder="e.g. Call before coming, gate passcode #102"
                  value={pickupNotes}
                  onChange={(e) => setPickupNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-2"
                >
                  <span>Continue to Payout Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: PAYOUT METHOD */}
          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-cyan-400" /> Doorstep Payment Method
                </h3>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Edit Slot
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPayoutMethod('UPI')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    payoutMethod === 'UPI'
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-bold shadow-sm shadow-cyan-500/10'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-white">Instant UPI</div>
                  <div className="text-[11px] text-slate-400 mt-1">Google Pay, PhonePe, Paytm</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPayoutMethod('BANK_TRANSFER')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    payoutMethod === 'BANK_TRANSFER'
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-bold shadow-sm shadow-cyan-500/10'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-white">Bank IMPS / NEFT</div>
                  <div className="text-[11px] text-slate-400 mt-1">Direct Bank Account Transfer</div>
                </button>
              </div>

              {payoutMethod === 'UPI' ? (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">Your UPI ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543210@paytm or name@okaxis"
                    value={payoutUpiId}
                    onChange={(e) => setPayoutUpiId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Money will be transferred instantly via UPI at the time of doorstep handover.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Bank Account Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 50100492817263"
                      value={payoutBankAccount}
                      onChange={(e) => setPayoutBankAccount(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">IFSC Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="HDFC0001234"
                        value={payoutBankIfsc}
                        onChange={(e) => setPayoutBankIfsc(e.target.value.toUpperCase())}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Bank Name</label>
                      <input
                        type="text"
                        placeholder="HDFC Bank"
                        value={payoutBankName}
                        onChange={(e) => setPayoutBankName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-2"
                >
                  <span>Review Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: ORDER REVIEW & CONFIRM */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Confirm Your Sell Order
              </h3>

              {/* Review Grid */}
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Seller Name</span>
                  <span className="font-semibold text-white">{customerName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Mobile Phone</span>
                  <span className="font-semibold text-white">+91 {customerPhone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Pickup Address</span>
                  <span className="font-semibold text-white max-w-[60%] text-right truncate">
                    {pickupAddress}, {pickupCity} - {pickupPincode}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Scheduled Date & Slot</span>
                  <span className="font-semibold text-cyan-300">
                    {pickupDate} • {pickupTimeSlot}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Payout Mode</span>
                  <span className="font-semibold text-emerald-400">
                    {payoutMethod === 'UPI' ? `UPI: ${payoutUpiId}` : `Bank: ${payoutBankAccount}`}
                  </span>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  I certify that I am the legal owner of this device, device is free from financial lien/locks, and I agree to TrustMyGadget’s <Link href="/terms" className="text-cyan-400 underline">Terms of Sale</Link>.
                </span>
              </label>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={submitting}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <span>Confirming Sell Order...</span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-slate-950" />
                      <span>Confirm Sell Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Summary Sidebar (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 glass-panel space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Order Summary
          </h3>

          {/* Device Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden p-1 shrink-0">
              {orderSummary?.deviceImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={orderSummary.deviceImageUrl} alt={orderSummary?.modelName} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <Smartphone className="w-8 h-8 text-slate-600" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                {orderSummary?.brandName}
              </span>
              <h4 className="text-sm font-bold text-white">{orderSummary?.modelName}</h4>
              <p className="text-xs text-slate-400">{orderSummary?.variantName}</p>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Base Device Value</span>
              <span className="text-slate-200">₹{orderSummary?.basePrice?.toLocaleString('en-IN') || '0'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Doorstep Pickup Fee</span>
              <span className="text-emerald-400 font-bold">FREE (₹0)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>DoD Data Erasure</span>
              <span className="text-emerald-400 font-bold">FREE (₹0)</span>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm font-bold text-white">
              <span>Total Payout Amount</span>
              <span className="text-xl font-extrabold text-cyan-300">
                ₹{orderSummary?.estimatedPrice?.toLocaleString('en-IN') || '0'}
              </span>
            </div>
          </div>

          {/* Trust Guarantee Box */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <Zap className="w-4 h-4" /> Instant Doorstep Payment
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Our executive will verify your gadget and transfer the full amount directly to your account before taking possession.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
