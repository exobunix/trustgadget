'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Zap,
  Smartphone,
  AlertCircle,
  User,
  LogIn,
} from 'lucide-react';
import { triggerWebNotification } from '@/lib/notifications';

export default function CheckoutPage() {
  const router = useRouter();

  const [orderSummary, setOrderSummary] = useState<any>(null);
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Customer Authentication state
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  // Step 1: Contact & Address Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupCity, setPickupCity] = useState('Gurugram');
  const [pickupState, setPickupState] = useState('Haryana');
  const [pickupPincode, setPickupPincode] = useState('');
  const [pickupLandmark, setPickupLandmark] = useState('');

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPartnerConsent, setAgreedToPartnerConsent] = useState(false);

  // Load user and trade-in device summary
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Check logged in customer
      const storedUser = localStorage.getItem('tmg_customer_user');
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          setLoggedInUser(u);
          setCustomerName(u.name || '');
          setCustomerPhone(u.phone || '');
          setCustomerEmail(u.email || '');
        } catch (e) {
          setShowAuthModal(true);
        }
      } else {
        setShowAuthModal(true);
      }

      // 2. Load user's actual selected selling device
      const localData = localStorage.getItem('tmg_current_tradein');
      const sessionData = sessionStorage.getItem('tmg_checkout_order');
      const activeData = localData || sessionData;

      if (activeData) {
        try {
          const parsed = JSON.parse(activeData);
          setOrderSummary(parsed);

          // Verify with live catalog to prevent stale session storage prices
          if (parsed.modelId) {
            fetch(`/api/catalog/model/${parsed.modelId}?_t=${Date.now()}`, { cache: 'no-store' })
              .then((r) => r.json())
              .then((data) => {
                if (data.success && data.data) {
                  const liveModel = data.data;
                  const liveVariant = liveModel.variants?.find((v: any) => v.id === parsed.variantId) || liveModel.variants?.[0];
                  const currentBasePrice = liveVariant?.basePrice || liveModel.basePrice;
                  if (currentBasePrice && currentBasePrice !== parsed.basePrice) {
                    const priceDiff = currentBasePrice - parsed.basePrice;
                    const updated = {
                      ...parsed,
                      basePrice: currentBasePrice,
                      estimatedPrice: Math.max(500, (parsed.estimatedPrice || currentBasePrice) + priceDiff),
                    };
                    setOrderSummary(updated);
                    sessionStorage.setItem('tmg_checkout_order', JSON.stringify(updated));
                    localStorage.setItem('tmg_current_tradein', JSON.stringify(updated));
                  }
                }
              })
              .catch(() => {});
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleCustomerAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!authPhone || authPhone.replace(/[^0-9]/g, '').length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!authName.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }

    setAuthSubmitting(true);
    try {
      const res = await fetch('/api/auth/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authName.trim(),
          phone: authPhone.trim(),
          email: authEmail.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLoggedInUser(data.data);
        localStorage.setItem('tmg_customer_user', JSON.stringify(data.data));
        setCustomerName(data.data.name || authName);
        setCustomerPhone(data.data.phone || authPhone);
        if (data.data.email) setCustomerEmail(data.data.email);
        setShowAuthModal(false);
      } else {
        setAuthError(data.error || 'Authentication failed. Please try again.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Network error.');
    } finally {
      setAuthSubmitting(false);
    }
  };

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
    // Advance directly from Step 1 (Contact & Address) to Step 2 (Review & Confirm)
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmOrder = async () => {
    if (!loggedInUser) {
      setShowAuthModal(true);
      setErrorMsg('Please login or signup to confirm your booking and track your order.');
      return;
    }

    if (!agreedToPartnerConsent) {
      setErrorMsg('Please agree that your details will be shared with our partner representative to proceed.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMsg('Please accept the device ownership and terms of sale.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        userId: loggedInUser.id,
        customerName: customerName || loggedInUser.name,
        customerPhone: customerPhone || loggedInUser.phone,
        customerEmail: customerEmail || loggedInUser.email || `${(customerPhone || loggedInUser.phone).replace(/[^0-9]/g, '')}@trustmygadget.user`,
        categoryName: orderSummary?.categoryName || 'Smartphones',
        brandName: orderSummary?.brandName || 'Apple',
        modelName: orderSummary?.modelName || 'Device',
        variantName: orderSummary?.variantName || 'Standard',
        deviceImageUrl: orderSummary?.deviceImageUrl || null,
        basePrice: orderSummary?.basePrice || 0,
        estimatedPrice: orderSummary?.estimatedPrice || 0,
        payoutMethod: 'DOORSTEP_UPI_OR_CASH',
        payoutUpiId: null,
        payoutBankAccount: null,
        payoutBankIfsc: null,
        payoutBankName: null,
        pickupDate: new Date().toISOString().split('T')[0],
        pickupTimeSlot: 'Doorstep Pickup & Verification',
        pickupAddress,
        pickupCity,
        pickupState,
        pickupPincode,
        pickupLandmark,
        pickupNotes: 'Doorstep Verification & Immediate Payout',
        conditionSummary: orderSummary?.conditionSummary || {},
        agreedToPartnerConsent: true,
        consentGiven: true,
        consentText: 'I agree that my details (name, phone, email, address) will be shared with our partner representative who will contact/visit me on behalf of Trust Gadget.',
        consentTimestamp: new Date().toISOString(),
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
          localStorage.removeItem('tmg_current_tradein');
        }

        // Trigger web notification and audible chime
        triggerWebNotification(`Order Confirmed: ${data.data.orderNumber}`, {
          body: `Doorstep order placed for ${payload.modelName}. Guaranteed Payout: ₹${payload.estimatedPrice.toLocaleString('en-IN')}`,
          soundType: 'order',
        });

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
    <div className="min-h-screen py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Stepper Header */}
      <div className="mb-8">
        <Link
          href="/sell"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Valuation
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
              Secure Doorstep Checkout
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              Confirm Your Sell Order
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-500/30 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4" /> 100% Free Doorstep Service
          </div>
        </div>

        {/* 2-Step Modern Stepper Indicator */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {[
            { num: 1, label: 'Contact & Address' },
            { num: 2, label: 'Review & Confirm' },
          ].map((s) => (
            <div
              key={s.num}
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                step === s.num
                  ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 font-bold shadow-sm shadow-cyan-500/10'
                  : step > s.num
                  ? 'border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-semibold'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500'
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider font-semibold">Step {s.num}</div>
              <div className="text-xs font-bold truncate mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Auth Profile Bar */}
      <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            {loggedInUser ? (
              <>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Logged in as: {loggedInUser.name}</span>
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30 font-semibold">
                    Verified
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {loggedInUser.phone} • Orders will sync automatically to your tracking dashboard.
                </div>
              </>
            ) : (
              <>
                <div className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Login / Signup Required
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Please sign in with your mobile number to link your booking for live tracking.
                </div>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (loggedInUser) {
              setAuthName(loggedInUser.name || '');
              setAuthPhone(loggedInUser.phone || '');
              setAuthEmail(loggedInUser.email || '');
            }
            setShowAuthModal(true);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            loggedInUser
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-sm'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
          }`}
        >
          {loggedInUser ? 'Change Profile' : 'Login / Sign Up'}
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Area (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          {/* STEP 1: CUSTOMER & ADDRESS (Unchanged 1st Step) */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Customer Information & Address
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number (For Agent Coordination) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Doorstep Pickup Address *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Flat / House No, Building Name, Street / Sector"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    placeholder="110001"
                    maxLength={6}
                    value={pickupPincode}
                    onChange={(e) => setPickupPincode(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    value={pickupCity}
                    onChange={(e) => setPickupCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">State</label>
                  <input
                    type="text"
                    value={pickupState}
                    onChange={(e) => setPickupState(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nearby Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="Near Metro Station / Opposite Mall"
                  value={pickupLandmark}
                  onChange={(e) => setPickupLandmark(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-2 transition-all"
                >
                  <span>Continue to Order Review</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: ORDER REVIEW & CONFIRM (Unchanged Last Step) */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Review & Confirm Booking
              </h3>

              {/* Review Grid */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Seller Name</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{customerName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Mobile Phone</span>
                  <span className="font-semibold text-slate-900 dark:text-white">+91 {customerPhone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Doorstep Address</span>
                  <span className="font-semibold text-slate-900 dark:text-white max-w-[60%] text-right truncate">
                    {pickupAddress}, {pickupCity} - {pickupPincode}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">Payment Mode</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Instant Doorstep UPI / Cash (Paid on-the-spot upon inspection)
                  </span>
                </div>
              </div>

              {/* Safety & Privacy Advisory */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/40 text-amber-950 dark:text-amber-200 text-xs flex items-start gap-3 shadow-sm">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-amber-900 dark:text-amber-300 font-semibold block mb-0.5">Important Safety & Privacy Advisory:</strong>
                  Trust Gadget kindly requests you to back up and clean all your phone data, remove Google/Apple iCloud accounts, and perform a factory reset before handing over the phone to our collection executive for your safety, security, and privacy concern.
                </div>
              </div>

              {/* Partner Consent Checkbox */}
              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreedToPartnerConsent}
                  onChange={(e) => setAgreedToPartnerConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-500 focus:ring-cyan-400 cursor-pointer"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  I agree that my details (name, phone, email, address) will be shared with our partner representative who will contact/visit me on behalf of <strong className="text-slate-900 dark:text-white">Trust Gadget</strong>. Read our{' '}
                  <Link href="/privacy" target="_blank" className="text-cyan-600 dark:text-cyan-400 font-medium underline hover:text-cyan-500">
                    Privacy Policy
                  </Link>{' '}
                  and{' '}
                  <Link href="/terms" target="_blank" className="text-cyan-600 dark:text-cyan-400 font-medium underline hover:text-cyan-500">
                    Terms of Service
                  </Link>.
                </span>
              </label>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-500 focus:ring-cyan-400 cursor-pointer"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  I certify that I am the legal owner of this device, device is free from financial lien/locks, and I agree to Trust Gadget’s <Link href="/terms" target="_blank" className="text-cyan-600 dark:text-cyan-400 underline">Terms of Sale</Link>.
                </span>
              </label>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-colors"
                >
                  ← Edit Address
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={submitting}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center gap-2"
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
        <div className="lg:col-span-5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Order Summary
          </h3>

          {/* Device Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden p-1 shrink-0 flex items-center justify-center">
              {orderSummary?.deviceImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={orderSummary.deviceImageUrl} alt={orderSummary?.modelName} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <Smartphone className="w-8 h-8 text-cyan-600 dark:text-slate-600" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                {orderSummary?.brandName}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{orderSummary?.modelName}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{orderSummary?.variantName}</p>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Base Device Value</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">₹{orderSummary?.basePrice?.toLocaleString('en-IN') || '0'}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Doorstep Pickup Fee</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE (₹0)</span>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white">
              <span>Total Payout Amount</span>
              <span className="text-xl font-extrabold text-cyan-600 dark:text-cyan-300 font-mono">
                ₹{orderSummary?.estimatedPrice?.toLocaleString('en-IN') || '0'}
              </span>
            </div>
          </div>

          {/* Trust Guarantee Box */}
          <div className="p-4 rounded-xl bg-cyan-50/80 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-500/20 text-xs space-y-2">
            <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 font-bold">
              <Zap className="w-4 h-4" /> Instant Doorstep Payment
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Our executive will verify your gadget and transfer the full amount directly to your account before taking possession.
            </p>
          </div>

          {/* Physical Inspection Notice */}
          <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/30 text-xs flex items-start gap-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
              <span className="font-bold">Note:</span> The final price will be confirmed after a physical inspection of the device by our partner.
            </p>
          </div>
        </div>
      </div>

      {/* Customer Login / Signup Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <LogIn className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Login or Quick Sign Up</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Required to link order & enable live tracking</p>
                </div>
              </div>
              {loggedInUser && (
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
                >
                  ✕
                </button>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Enter your mobile number and name so our doorstep executive can coordinate your pickup and you can monitor order progress in the <strong className="text-emerald-600 dark:text-emerald-400">Track Order</strong> section.
            </p>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleCustomerAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mobile Number (For OTP / Agent Call) *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3.5 text-xs bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-300 dark:border-slate-700 rounded-l-xl text-slate-700 dark:text-slate-300 font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-r-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                {loggedInUser && (
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{authSubmitting ? 'Verifying...' : 'Save & Continue to Checkout'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
