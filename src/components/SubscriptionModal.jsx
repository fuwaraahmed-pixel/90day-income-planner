import React, { useState } from 'react';
import { CreditCard, Send, CheckCircle2, AlertCircle, Clock, ShieldCheck, PhoneCall, Copy, LogOut, Sparkles, Gift, X } from 'lucide-react';
import { PLANS, DEFAULT_PLAN } from '../utils/plans';

export default function SubscriptionModal({ subscription, paymentRequests, onSubmitPayment, onStartTrial, user, onLogout, onClose, selectedPlanId }) {
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(null);

  const bkashNumber = '01622536026';
  const nagadNumber = '01622536026';
  const rocketNumber = '01622536026';

  const handleCopy = (num, name) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(name);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  // Resolve the plan: find the matching one, ignore legacy 'monthly_pro', fallback to DEFAULT_PLAN
  const matchedPlan = Object.values(PLANS).find(p => p.id === selectedPlanId);
  const activePlan = matchedPlan && matchedPlan.id !== 'monthly_pro' ? matchedPlan : DEFAULT_PLAN;

  const handleStartTrialClick = async () => {
    if (!onStartTrial) return;
    setTrialLoading(true);
    setErrorMsg('');
    const res = await onStartTrial();
    setTrialLoading(false);
    if (!res || !res.success) {
      setErrorMsg(res?.message || 'ফ্রি ট্রায়াল চালু করতে সমস্যা হয়েছে।');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!senderNumber.trim() || !trxId.trim()) {
      setErrorMsg('দয়া করে প্রেরক নম্বর এবং ট্রানজেকশন আইডি (TrxID) সঠিকভাবে দিন।');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSubmitSuccess(false);

    const res = await onSubmitPayment({
      paymentMethod,
      senderNumber: senderNumber.trim(),
      trxId: trxId.trim(),
      amount: activePlan.price,
      planName: activePlan.name,
      planId: activePlan.id
    });

    setLoading(false);
    if (res && res.success) {
      setSubmitSuccess(true);
      setSenderNumber('');
      setTrxId('');
      localStorage.removeItem('dremoy_selected_plan');
    } else {
      setErrorMsg(res?.message || 'পেমেন্ট রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  const isPending = subscription?.status === 'pending';
  const isRejected = subscription?.status === 'rejected';
  const isExpired = subscription?.status === 'expired';
  
  // Trial calculations
  const isTrialActive = Boolean(
    subscription?.trialEndsAt && 
    new Date(subscription.trialEndsAt) > new Date() && 
    !subscription?.trialEndedAt
  );
  const trialDaysLeft = isTrialActive 
    ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;
  const isTrialExpired = Boolean(
    (subscription?.trialEndsAt && new Date(subscription.trialEndsAt) <= new Date()) || 
    subscription?.trialEndedAt
  );
  const hasUsedTrial = Boolean(subscription?.trialStartsAt || isTrialExpired || isTrialActive);

  const latestRequest = paymentRequests && paymentRequests.length > 0 ? paymentRequests[0] : null;

  return (
    <div className={onClose ? "fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto" : "min-h-screen bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 font-sans"}>
      <div className="w-full max-w-2xl bg-white border border-slate-200/80 rounded-[28px] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 text-white p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/15 text-emerald-400 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-inner">
                💎
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {activePlan.name} সাবস্ক্রিপশন
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ৳{activePlan.price}/মাস
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  অ্যাকাউন্ট: <strong className="text-emerald-300">{user?.email}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white bg-white/5 hover:bg-white/15 rounded-xl transition-all"
                  title="বন্ধ করুন"
                >
                  <X className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>লগআউট</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7 space-y-5">
          {/* 14-Day Free Trial Offer Card (Show only if user hasn't consumed trial) */}
          {!hasUsedTrial && !isPending && (
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-700 text-white rounded-3xl p-6 shadow-xl space-y-4">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold tracking-wide">
                    <Gift className="w-3.5 h-3.5 text-amber-300" />
                    <span>স্পেশাল অফার — সম্পূর্ণ ফ্রি</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    ১৪ দিনের ফ্রি ট্রায়াল নিন!
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-50/90 leading-relaxed max-w-md">
                    কোনো ক্রেডিট কার্ড বা পেমেন্ট ছাড়াই এখনই ১৪ দিনের জন্য সম্পূর্ণ অ্যাপের সমস্ত প্রিমিয়াম ফিচার ব্যবহার করুন।
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleStartTrialClick}
                  disabled={trialLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-sm rounded-2xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 flex-shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" style={{ animationDuration: '3s' }} />
                  <span>{trialLoading ? 'চালু হচ্ছে...' : '১৪ দিনের ফ্রি ট্রায়াল শুরু করুন'}</span>
                </button>
              </div>
            </div>
          )}

          {/* DYNAMIC TRIAL BANNER: Active Trial (Time Remaining Countdown) */}
          {isTrialActive && !isPending && (
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-white">
                      আপনার ফ্রি ট্রায়াল বর্তমানে সক্রিয় রয়েছে
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      {trialDaysLeft} দিন বাকি
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    ট্রায়ালের মেয়াদ শেষ হওয়ার আগেই নিরবচ্ছিন্ন সেবা নিশ্চিত করতে নিচে পেমেন্ট রিকোয়েস্ট জমা দিতে পারেন।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC TRIAL BANNER: Expired Trial */}
          {isTrialExpired && !subscription?.expiresAt && !isPending && (
            <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-400/40 rounded-2xl p-4 sm:p-5">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-amber-950">
                    আপনার ফ্রি ট্রায়ালের মেয়াদ শেষ হয়েছে
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-medium">
                    অ্যাপটির প্রিমিয়াম সেবা ও বিজনেস ডেটা নিরবচ্ছিন্নভাবে পরিচালনা করতে অনুগ্রহ করে নিচে মাসিক ফি <strong>৳{activePlan.price}</strong> প্রদান করে সাবস্ক্রিপশন সম্পন্ন করুন।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pending Request Status Banner */}
          {isPending && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                <span>আপনার পেমেন্ট রিকোয়েস্ট পর্যালোচনায় আছে</span>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                আপনার জমাকৃত ট্রানজেকশন আইডি ({latestRequest?.trxId || 'TrxID'}) এডমিন কর্তৃক ভেরিফাই করা হচ্ছে। এডমিন এপ্রুভ করার সাথে সাথে আপনার ড্যাশবোর্ড অ্যাক্টিভ হয়ে যাবে।
              </p>
              {latestRequest && (
                <div className="text-[11px] font-mono bg-white/70 p-2.5 rounded-xl border border-amber-200/80 text-amber-900 mt-2 flex flex-wrap gap-4">
                  <span>মেথড: <strong>{latestRequest.paymentMethod}</strong></span>
                  <span>প্রেরক: <strong>{latestRequest.senderNumber}</strong></span>
                  <span>TrxID: <strong>{latestRequest.trxId}</strong></span>
                  <span>টাকা: <strong>৳{latestRequest.amount}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Rejected Status Banner */}
          {isRejected && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs space-y-1">
              <div className="font-bold text-sm flex items-center gap-1.5 text-rose-900">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>পূর্বের পেমেন্ট রিকোয়েস্ট বাতিল করা হয়েছে</span>
              </div>
              <p className="text-slate-700">
                {latestRequest?.adminNotes ? `কারণ: ${latestRequest.adminNotes}` : 'সঠিক তথ্য দিয়ে নিচে আবার নতুন করে পেমেন্ট রিকোয়েস্ট জমা দিন।'}
              </p>
            </div>
          )}

          {/* Expired Status Banner */}
          {isExpired && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs space-y-1">
              <div className="font-bold text-sm flex items-center gap-1.5 text-rose-900">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>সাবস্ক্রিপশনের মেয়াদ শেষ হয়েছে</span>
              </div>
              <p className="text-slate-700">
                আপনার সাবস্ক্রিপশন শেষ হয়ে গেছে। সার্ভিস সচল রাখতে মাসিক ৳{activePlan.price} ফি প্রদান করে ট্রানজেকশন আইডি সাবমিট করুন।
              </p>
            </div>
          )}

          {/* Premium Payment Instructions Card with Brand Logos */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>পেমেন্ট নির্দেশিকা ({activePlan.name} প্যাকেজ)</span>
              </h3>
              <span className="text-xs font-bold text-slate-500">
                Send Money Fee: <span className="text-emerald-600 font-extrabold">৳{activePlan.price}</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              নিচের যেকোনো পেমেন্ট নম্বরে <strong className="text-emerald-700">৳{activePlan.price} (মাসিক ফি)</strong> সেন্ড মানি (Personal) করুন এবং নিচের ফর্মে TrxID সাবমিট করুন:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* bKash Card */}
              <div 
                onClick={() => setPaymentMethod('bKash')}
                className={`relative rounded-2xl p-4 cursor-pointer transition-all border flex flex-col justify-between ${
                  paymentMethod === 'bKash' 
                    ? 'bg-pink-50/60 border-pink-500 shadow-md ring-2 ring-pink-500/20' 
                    : 'bg-white border-slate-200/90 hover:border-pink-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    {/* bKash Brand Icon */}
                    <div className="w-9 h-9 rounded-xl bg-pink-600 flex items-center justify-center shadow-xs">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-label="bKash">
                        <path d="M12.02 2.5l-6.8 9.98 4.3 6.35 6.84-2.85-4.34-13.48zm-1.02 11.23l-2.07-3.05 4.32-6.34 2.1 6.54-4.35 2.85zm6.82 2.22l-4.73 1.97 3.31 3.58 1.42-5.55zm-11.64-1.28l3.19 4.7 1.5-3.02-4.69-1.68z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                      বিকাশ
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="text-[11px] font-bold text-slate-500">Personal Account</div>
                    <div className="text-sm font-black text-slate-900 font-mono tracking-wide mt-0.5">{bkashNumber}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(bkashNumber, 'bKash');
                  }}
                  className="mt-3 w-full py-1.5 px-2 bg-pink-100/70 hover:bg-pink-100 text-pink-700 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedNumber === 'bKash' ? '✓ নম্বর কপি হয়েছে!' : 'নম্বর কপি করুন'}</span>
                </button>
              </div>

              {/* Nagad Card */}
              <div 
                onClick={() => setPaymentMethod('Nagad')}
                className={`relative rounded-2xl p-4 cursor-pointer transition-all border flex flex-col justify-between ${
                  paymentMethod === 'Nagad' 
                    ? 'bg-orange-50/60 border-orange-500 shadow-md ring-2 ring-orange-500/20' 
                    : 'bg-white border-slate-200/90 hover:border-orange-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    {/* Nagad Brand Icon */}
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center shadow-xs">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-label="Nagad">
                        <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" fill="none" />
                        <path d="M12 7v10M8.5 9.5l7 5M15.5 9.5l-7 5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                      নগদ
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="text-[11px] font-bold text-slate-500">Personal Account</div>
                    <div className="text-sm font-black text-slate-900 font-mono tracking-wide mt-0.5">{nagadNumber}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(nagadNumber, 'Nagad');
                  }}
                  className="mt-3 w-full py-1.5 px-2 bg-orange-100/70 hover:bg-orange-100 text-orange-700 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedNumber === 'Nagad' ? '✓ নম্বর কপি হয়েছে!' : 'নম্বর কপি করুন'}</span>
                </button>
              </div>

              {/* Rocket Card */}
              <div 
                onClick={() => setPaymentMethod('Rocket')}
                className={`relative rounded-2xl p-4 cursor-pointer transition-all border flex flex-col justify-between ${
                  paymentMethod === 'Rocket' 
                    ? 'bg-purple-50/60 border-purple-600 shadow-md ring-2 ring-purple-600/20' 
                    : 'bg-white border-slate-200/90 hover:border-purple-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    {/* Rocket Brand Icon */}
                    <div className="w-9 h-9 rounded-xl bg-purple-700 flex items-center justify-center shadow-xs">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-label="Rocket">
                        <path d="M12 2.5C9.5 2.5 8 5.5 8 8c0 3 2.5 7 4 9 1.5-2 4-6 4-9 0-2.5-1.5-5.5-4-5.5zm0 8a2 2 0 110-4 2 2 0 010 4zm-5 7.5c-2 1-3 2.5-3 4h16c0-1.5-1-3-3-4-2 1-3.5 1-5 1s-3 0-5-1z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      রকেট
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="text-[11px] font-bold text-slate-500">Personal Account</div>
                    <div className="text-sm font-black text-slate-900 font-mono tracking-wide mt-0.5">{rocketNumber}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(rocketNumber, 'Rocket');
                  }}
                  className="mt-3 w-full py-1.5 px-2 bg-purple-100/70 hover:bg-purple-100 text-purple-700 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedNumber === 'Rocket' ? '✓ নম্বর কপি হয়েছে!' : 'নম্বর কপি করুন'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Submit Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>পেমেন্ট তথ্য সাবমিট করুন</span>
              </h3>
              <span className="text-[11px] text-slate-400">TrxID যাচাই সাপেক্ষে ড্যাশবোর্ড আনলক হবে</span>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {submitSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে! এডমিন দ্রুত অনুমোদন করে দেবে।</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">নির্বাচিত মেথড</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-2xs"
                >
                  <option value="bKash">bKash (বিকাশ)</option>
                  <option value="Nagad">Nagad (নগদ)</option>
                  <option value="Rocket">Rocket (রকেট)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">প্রেরক নম্বর (Sender Mobile)</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: 01711XXXXXX"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800 shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">ট্রানজেকশন আইডি (TrxID)</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: 9H7X8K2L"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-black uppercase text-slate-900 shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>আপনার পেমেন্ট তথ্য ১০০% সুরক্ষিত</span>
              </div>

              <button
                type="submit"
                disabled={loading || isPending}
                className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-2xl text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'জমা হচ্ছে...' : 'পেমেন্ট রিকোয়েস্ট সাবমিট করুন'}</span>
              </button>
            </div>
          </form>
        </div>


      </div>
    </div>
  );
}
