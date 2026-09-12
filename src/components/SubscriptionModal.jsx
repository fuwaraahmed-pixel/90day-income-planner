import React, { useState } from 'react';
import { CreditCard, Send, CheckCircle2, AlertCircle, Clock, ShieldCheck, PhoneCall, Copy, LogOut } from 'lucide-react';

export default function SubscriptionModal({ subscription, paymentRequests, onSubmitPayment, user, onLogout }) {
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(null);

  const bkashNumber = '01700000000';
  const nagadNumber = '01800000000';
  const rocketNumber = '01900000000';

  const handleCopy = (num, name) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(name);
    setTimeout(() => setCopiedNumber(null), 2000);
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
      amount: 500,
      planName: 'Monthly Pro'
    });

    setLoading(false);
    if (res && res.success) {
      setSubmitSuccess(true);
      setSenderNumber('');
      setTrxId('');
    } else {
      setErrorMsg(res?.message || 'পেমেন্ট রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };


  const isPending = subscription?.status === 'pending';
  const isRejected = subscription?.status === 'rejected';
  const isExpired = subscription?.status === 'expired';

  const latestRequest = paymentRequests && paymentRequests.length > 0 ? paymentRequests[0] : null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
        
        {/* Header Banner */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm">
              💎
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                প্রিমিয়াম সাবস্ক্রিপশন ও এক্সেস
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                অ্যাকাউন্ট: <strong className="text-slate-700">{user?.email}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>লগআউট</span>
          </button>
        </div>

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
              আপনার ৩০ দিনের মেয়াদী সাবস্ক্রিপশন শেষ হয়ে গেছে। সার্ভিস সচল রাখতে মাসিক ৳৫০০ ফি প্রদান করে ট্রানজেকশন আইডি সাবমিট করুন।
            </p>
          </div>
        )}

        {/* Payment Instructions Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>পেমেন্ট নির্দেশিকা (Send Money / সেন্ড মানি করুন)</span>
          </h3>
          <p className="text-xs text-slate-600">
            নিচের যেকোনো নম্বরে <strong className="text-emerald-700">৳৫০০ (মাসিক ফি)</strong> সেন্ড মানি করুন এবং ফর্মটিতে প্রেরক নম্বর ও TrxID দিয়ে জমা দিন:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* bKash */}
            <div className="bg-white border border-pink-200 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-pink-600">bKash (বিকাশ)</div>
                <div className="text-xs font-bold text-slate-800 mt-1 font-mono">{bkashNumber}</div>
                <div className="text-[10px] text-slate-400">Personal Send Money</div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(bkashNumber, 'bKash')}
                className="mt-2 text-[11px] font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedNumber === 'bKash' ? 'কপি হয়েছে!' : 'নম্বর কপি করুন'}</span>
              </button>
            </div>

            {/* Nagad */}
            <div className="bg-white border border-orange-200 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-orange-600">Nagad (নগদ)</div>
                <div className="text-xs font-bold text-slate-800 mt-1 font-mono">{nagadNumber}</div>
                <div className="text-[10px] text-slate-400">Personal Send Money</div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(nagadNumber, 'Nagad')}
                className="mt-2 text-[11px] font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedNumber === 'Nagad' ? 'কপি হয়েছে!' : 'নম্বর কপি করুন'}</span>
              </button>
            </div>

            {/* Rocket */}
            <div className="bg-white border border-purple-200 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-purple-600">Rocket (রকেট)</div>
                <div className="text-xs font-bold text-slate-800 mt-1 font-mono">{rocketNumber}</div>
                <div className="text-[10px] text-slate-400">Personal Send Money</div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(rocketNumber, 'Rocket')}
                className="mt-2 text-[11px] font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedNumber === 'Rocket' ? 'কপি হয়েছে!' : 'নম্বর কপি করুন'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Submit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b pb-2">
            পেমেন্ট তথ্য সাবমিট করুন
          </h3>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে! এডমিন এপ্রুভালের জন্য অপেক্ষা করুন।</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">পেমেন্ট মেথড</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="bKash">bKash (বিকাশ)</option>
                <option value="Nagad">Nagad (নগদ)</option>
                <option value="Rocket">Rocket (রকেট)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">প্রেরক নম্বর (Sender Mobile)</label>
              <input
                type="text"
                required
                placeholder="যেমন: 01711XXXXXX"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ট্রানজেকশন আইডি (TrxID)</label>
              <input
                type="text"
                required
                placeholder="যেমন: 9H7X8K2L"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold uppercase"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'জমা হচ্ছে...' : 'পেমেন্ট রিকোয়েস্ট সাবমিট করুন'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
