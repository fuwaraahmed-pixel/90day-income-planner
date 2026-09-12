import React, { useState, useEffect } from 'react';
import { getPendingPaymentRequestsForAdmin, rpcApprovePaymentRequest, rpcRejectPaymentRequest } from '../lib/supabaseService';
import { ShieldCheck, CheckCircle2, XCircle, RefreshCw, Clock, Search, AlertCircle } from 'lucide-react';

export default function AdminPanel({ adminUser }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const fetchAdminRequests = async () => {
    setLoading(true);
    const data = await getPendingPaymentRequestsForAdmin();
    setRequests(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAdminRequests();
  }, []);

  const handleApprove = async (reqId) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই পেমেন্ট ট্রানজেকশনটি ভেরিফাইড এবং এপ্রুভ করতে চান?')) return;

    setActionLoadingId(reqId);
    setFeedbackMsg(null);

    const result = await rpcApprovePaymentRequest(reqId);
    setActionLoadingId(null);

    if (result && result.success) {
      setFeedbackMsg({ type: 'success', message: 'পেমেন্ট সফলভাবে এপ্রুভ করা হয়েছে! ইউজারের ৩০ দিনের সাবস্ক্রিপশন সক্রিয় হয়েছে।' });
      fetchAdminRequests();
    } else {
      setFeedbackMsg({ type: 'error', message: 'এপ্রুভ করতে ব্যর্থ: ' + (result?.message || 'অজানা ত্রুটি') });
    }
  };

  const handleReject = async (reqId) => {
    const reason = window.prompt('পেমেন্ট বাতিলের কারণ লিখুন (ঐচ্ছিক):', 'TrxID ভেরিফিকেশনে পাওয়া যায়নি');
    if (reason === null) return; // user cancelled prompt

    setActionLoadingId(reqId);
    setFeedbackMsg(null);

    const result = await rpcRejectPaymentRequest(reqId, reason);
    setActionLoadingId(null);

    if (result && result.success) {
      setFeedbackMsg({ type: 'success', message: 'পেমেন্ট রিকোয়েস্ট বাতিল করা হয়েছে।' });
      fetchAdminRequests();
    } else {
      setFeedbackMsg({ type: 'error', message: 'বাতিল করতে ব্যর্থ: ' + (result?.message || 'অজানা ত্রুটি') });
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
            <span>এডমিন পেমেন্ট ভেরিফিকেশন প্যানেল</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            এডমিন ইমেইল: <strong className="text-slate-800">{adminUser?.email}</strong> (Database Level Protected)
          </p>
        </div>

        <button
          onClick={fetchAdminRequests}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>রিফ্রেশ করুন</span>
        </button>
      </div>

      {/* Feedback Notice */}
      {feedbackMsg && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
          feedbackMsg.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{feedbackMsg.message}</span>
        </div>
      )}

      {/* Pending Payment Requests Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>অপেক্ষমান পেমেন্ট রিকোয়েস্ট ({pendingRequests.length}টি পেন্ডিং)</span>
          </h2>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>পেমেন্ট ডাটা লোড হচ্ছে...</span>
          </div>
        ) : pendingRequests.length > 0 ? (
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{req.userEmail}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      PENDING
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 flex flex-wrap gap-4 pt-1 font-mono">
                    <span>মেথড: <strong className="text-slate-800">{req.paymentMethod}</strong></span>
                    <span>প্রেরক: <strong className="text-slate-800">{req.senderNumber}</strong></span>
                    <span>TrxID: <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{req.trxId}</strong></span>
                    <span>টাকা: <strong className="text-slate-800">৳{req.amount}</strong></span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    তারিখ: {new Date(req.createdAt).toLocaleString('bn-BD')}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(req.id)}
                    disabled={actionLoadingId === req.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{actionLoadingId === req.id ? 'প্রসেসিং...' : 'এপ্রুভ করুন'}</span>
                  </button>

                  <button
                    onClick={() => handleReject(req.id)}
                    disabled={actionLoadingId === req.id}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-xl text-xs transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>বাতিল</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            বর্তমানে কোনো পেন্ডিং পেমেন্ট রিকোয়েস্ট নেই।
          </div>
        )}
      </div>

      {/* Processed History Card */}
      {processedRequests.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 border-b pb-3">
            পূর্বের পেমেন্ট হিস্ট্রি ({processedRequests.length}টি প্রসেসড)
          </h2>

          <div className="space-y-2">
            {processedRequests.map((req) => (
              <div key={req.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-slate-800">{req.userEmail}</span>
                  <span className="text-slate-400 mx-2">•</span>
                  <span className="font-mono">{req.paymentMethod} ({req.senderNumber})</span>
                  <span className="text-slate-400 mx-2">•</span>
                  <span className="font-mono font-bold text-slate-700">TrxID: {req.trxId}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {req.status === 'approved' ? 'APPROVED ✓' : 'REJECTED ✕'}
                  </span>
                  <span className="text-[10px] text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
