import React, { useState, useEffect } from 'react';
import { 
  getPendingPaymentRequestsForAdmin, 
  rpcApprovePaymentRequest, 
  rpcRejectPaymentRequest, 
  getAllSubscriptionsForAdmin,
  rpcManageUserTrial,
  getTrialHistory
} from '../lib/supabaseService';
import { 
  ShieldCheck, CheckCircle2, XCircle, RefreshCw, Clock, Search, AlertCircle, 
  CreditCard, LayoutList, Calendar, CalendarX2, Sparkles, PlusCircle, History, 
  RotateCcw, Ban, ChevronRight, X
} from 'lucide-react';

export default function AdminPanel({ adminUser }) {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'subscriptions'
  const [requests, setRequests] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Trial Modal States
  const [selectedSubForTrial, setSelectedSubForTrial] = useState(null);
  const [trialModalType, setTrialModalType] = useState(null); // 'START' | 'EXTEND' | 'RESET' | 'HISTORY'
  const [trialDays, setTrialDays] = useState(14);
  const [trialPlanId, setTrialPlanId] = useState('starter');
  const [trialReason, setTrialReason] = useState('');
  const [trialHistoryList, setTrialHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Filters for subscriptions tab
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchAdminData = async () => {
    setLoading(true);
    const [reqData, subData] = await Promise.all([
      getPendingPaymentRequestsForAdmin(),
      getAllSubscriptionsForAdmin()
    ]);
    setRequests(reqData || []);
    setSubscriptions(subData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApprove = async (reqId) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই পেমেন্ট ট্রানজেকশনটি ভেরিফাইড এবং এপ্রুভ করতে চান?')) return;

    setActionLoadingId(reqId);
    setFeedbackMsg(null);

    const result = await rpcApprovePaymentRequest(reqId);
    setActionLoadingId(null);

    if (result && result.success) {
      setFeedbackMsg({ type: 'success', message: 'পেমেন্ট সফলভাবে এপ্রুভ করা হয়েছে!' });
      fetchAdminData();
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
      fetchAdminData();
    } else {
      setFeedbackMsg({ type: 'error', message: 'বাতিল করতে ব্যর্থ: ' + (result?.message || 'অজানা ত্রুটি') });
    }
  };

  // Open Trial History
  const handleOpenHistory = async (sub) => {
    setSelectedSubForTrial(sub);
    setTrialModalType('HISTORY');
    setHistoryLoading(true);
    const history = await getTrialHistory(sub.userId);
    setTrialHistoryList(history || []);
    setHistoryLoading(false);
  };

  // Submit Trial Action (START, EXTEND, RESET, END)
  const handleTrialActionSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedSubForTrial) return;

    setActionLoadingId(selectedSubForTrial.id);
    const res = await rpcManageUserTrial({
      userId: selectedSubForTrial.userId,
      action: trialModalType,
      days: trialDays,
      planId: trialPlanId,
      reason: trialReason
    });
    setActionLoadingId(null);

    if (res && res.success) {
      setFeedbackMsg({ type: 'success', message: res.message || 'ট্রায়াল সফলভাবে আপডেট করা হয়েছে।' });
      setTrialModalType(null);
      setSelectedSubForTrial(null);
      setTrialReason('');
      fetchAdminData();
    } else {
      alert('ব্যর্থ হয়েছে: ' + (res?.message || 'অজানা ত্রুটি'));
    }
  };

  // End Trial Directly with Confirmation
  const handleDirectEndTrial = async (sub) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে ${sub.userEmail} এর ফ্রি ট্রায়াল সাথে সাথে বাতিল করতে চান?`)) return;
    setActionLoadingId(sub.id);
    const res = await rpcManageUserTrial({
      userId: sub.userId,
      action: 'END',
      reason: 'Admin cancelled trial manually'
    });
    setActionLoadingId(null);
    if (res && res.success) {
      setFeedbackMsg({ type: 'success', message: 'ট্রায়াল সফলভাবে বন্ধ করা হয়েছে।' });
      fetchAdminData();
    } else {
      alert('ব্যর্থ: ' + (res?.message || 'অজানা ত্রুটি'));
    }
  };

  // Helper functions for expiry calculation (UI only)
  const getExpiryInfo = (expiresAt) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return { expired: false, text: `Expires in ${diffDays} day(s)` };
    } else if (diffDays === 0) {
      return { expired: false, text: 'Expires today' };
    } else {
      return { expired: true, text: `Expired ${Math.abs(diffDays)} day(s) ago` };
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchPlan = filterPlan === 'all' || sub.planId === filterPlan || (filterPlan === 'monthly_pro' && (!sub.planId || sub.planId === 'monthly_pro'));
    const matchStatus = filterStatus === 'all' || sub.status === filterStatus;
    return matchPlan && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
            <span>এডমিন প্যানেল</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            অ্যাডমিনিস্ট্রেটর: <strong className="text-slate-800">{adminUser?.email}</strong>
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>রিফ্রেশ করুন</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'requests' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>পেমেন্ট রিকোয়েস্ট</span>
          {pendingRequests.length > 0 && (
            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full ml-1">{pendingRequests.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'subscriptions' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <LayoutList className="w-4 h-4" />
          <span>সাবস্ক্রিপশন ওভারভিউ</span>
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

      {/* =========================================================================
          TAB: PAYMENT REQUESTS 
          ========================================================================= */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>অপেক্ষমান পেমেন্ট রিকোয়েস্ট</span>
              </h2>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>ডাটা লোড হচ্ছে...</span>
              </div>
            ) : pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.map((req) => {
                  const currentSub = subscriptions.find(s => s.userId === req.userId);
                  const isLegacyRequest = req.planId === 'monthly_pro' || !req.planId;
                  const requestPlanName = isLegacyRequest ? 'Legacy Plan (Monthly Pro)' : (req.planName || 'Starter');
                  
                  // Plan Change Warning
                  const currentPlanId = currentSub?.planId || 'monthly_pro';
                  const reqPlanId = req.planId || 'monthly_pro';
                  const planChanged = currentSub && currentSub.status !== 'unpaid' && currentPlanId !== reqPlanId;

                  return (
                    <div key={req.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 md:p-5 flex flex-col md:flex-row gap-5">
                      {/* Left: Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{req.userEmail}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                            Pending
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(req.createdAt).toLocaleString('bn-BD')}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-100">
                          <div>
                            <span className="text-slate-500 block mb-0.5 text-[10px] uppercase font-bold tracking-wider">Plan</span>
                            <span className={`font-bold ${isLegacyRequest ? 'text-slate-600' : 'text-emerald-700'}`}>
                              {requestPlanName}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block mb-0.5 text-[10px] uppercase font-bold tracking-wider">Amount</span>
                            <span className="font-bold text-slate-800">৳{req.amount}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block mb-0.5 text-[10px] uppercase font-bold tracking-wider">Method</span>
                            <span className="font-bold text-slate-800">{req.paymentMethod}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block mb-0.5 text-[10px] uppercase font-bold tracking-wider">Sender</span>
                            <span className="font-bold text-slate-800">{req.senderNumber}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Transaction ID</span>
                          <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded font-mono font-bold">
                            {req.trxId}
                          </span>
                        </div>

                        {planChanged && (
                          <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-lg flex gap-2 items-start text-xs text-blue-800 mt-2">
                            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong className="block mb-1">প্ল্যান পরিবর্তন সতর্কতা</strong>
                              ইউজারের বর্তমান প্ল্যান <strong>{currentSub.planName || 'Monthly Pro'}</strong>। 
                              অ্যাপ্রুভ করলে ইউজারের প্ল্যান <strong>{req.planName}</strong>-এ আপডেট হবে এবং মেয়াদ বর্তমান মেয়াদ/আজকের দিন থেকে ১ মাস বৃদ্ধি পাবে।
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-row md:flex-col items-center justify-end md:justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-5">
                        <button
                          onClick={() => handleApprove(req.id)}
                          disabled={actionLoadingId === req.id}
                          className="w-full md:w-32 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{actionLoadingId === req.id ? 'Processing...' : 'Approve'}</span>
                        </button>

                        <button
                          onClick={() => handleReject(req.id)}
                          disabled={actionLoadingId === req.id}
                          className="w-full md:w-32 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 font-semibold rounded-xl text-xs transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center bg-slate-50 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                <p className="text-slate-600 font-semibold text-sm">কোনো পেন্ডিং রিকোয়েস্ট নেই</p>
                <p className="text-slate-400 text-xs mt-1">সব পেমেন্ট রিকোয়েস্ট চেক করা হয়েছে!</p>
              </div>
            )}
          </div>

          {/* Processed History Card */}
          {processedRequests.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-800 border-b pb-3">
                পেমেন্ট রিকোয়েস্ট হিস্ট্রি
              </h2>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {processedRequests.map((req) => (
                  <div key={req.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div>
                        <span className="font-bold text-slate-800">{req.userEmail}</span>
                        <span className="text-slate-400 mx-2">•</span>
                        <span className="font-semibold text-slate-600">{req.planName || 'Legacy Plan'}</span>
                      </div>
                      <div className="text-slate-500 font-mono">
                        {req.paymentMethod} ({req.senderNumber}) - {req.trxId} - ৳{req.amount}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400">{new Date(req.createdAt).toLocaleDateString('bn-BD')}</span>
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                        req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {req.status === 'approved' ? 'APPROVED ✓' : 'REJECTED ✕'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB: SUBSCRIPTIONS OVERVIEW 
          ========================================================================= */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {/* Toolbar / Filters */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-4 items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">
              সকল সাবস্ক্রিপশন ({filteredSubscriptions.length})
            </h2>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">Plan:</label>
                <select 
                  value={filterPlan} 
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="bg-white border border-slate-300 text-xs rounded-lg px-2 py-1.5 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-medium"
                >
                  <option value="all">All Plans</option>
                  <option value="starter">Starter</option>
                  <option value="pro_business">Pro Business</option>
                  <option value="agency">Agency</option>
                  <option value="monthly_pro">Legacy Plan</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">Status:</label>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white border border-slate-300 text-xs rounded-lg px-2 py-1.5 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="pending">Pending</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>সাবস্ক্রিপশন লোড হচ্ছে...</span>
              </div>
            ) : filteredSubscriptions.length > 0 ? (
              <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Trial Status</th>
                    <th className="px-4 py-3">Start Date</th>
                    <th className="px-4 py-3">Expiry</th>
                    <th className="px-4 py-3 text-right">Trial Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubscriptions.map(sub => {
                    const isLegacy = sub.planId === 'monthly_pro' || !sub.planId;
                    const planName = isLegacy ? 'Legacy Plan' : (sub.planName || 'Starter');
                    const expiryInfo = getExpiryInfo(sub.expiresAt);
                    
                    let statusBadge = "bg-slate-100 text-slate-600";
                    if (sub.status === 'active') statusBadge = "bg-emerald-100 text-emerald-800";
                    if (sub.status === 'expired') statusBadge = "bg-rose-100 text-rose-800";
                    if (sub.status === 'pending') statusBadge = "bg-amber-100 text-amber-800";

                    // Trial info
                    const hasActiveTrial = sub.trialEndsAt && new Date(sub.trialEndsAt) > new Date() && !sub.trialEndedAt;
                    const isTrialExpired = sub.trialEndsAt && new Date(sub.trialEndsAt) <= new Date() && !sub.trialEndedAt;
                    const isTrialEnded = Boolean(sub.trialEndedAt);

                    const trialDaysRemaining = hasActiveTrial 
                      ? Math.ceil((new Date(sub.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24))
                      : 0;

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900">{sub.userEmail}</td>
                        <td className="px-4 py-3 font-medium">
                          <span className={isLegacy ? "text-slate-500" : "text-emerald-700"}>
                            {planName}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${statusBadge}`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {hasActiveTrial ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <Sparkles className="w-3 h-3 text-indigo-600" />
                              <span>{trialDaysRemaining} দিন বাকি</span>
                            </span>
                          ) : isTrialExpired ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              মেয়াদোত্তীর্ণ
                            </span>
                          ) : isTrialEnded ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                              বাতিলকৃত
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {sub.startsAt ? new Date(sub.startsAt).toLocaleDateString('bn-BD') : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {sub.expiresAt ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-semibold text-slate-800">{new Date(sub.expiresAt).toLocaleDateString('bn-BD')}</span>
                              {expiryInfo && (
                                <span className={`text-[10px] font-medium flex items-center gap-1 ${expiryInfo.expired ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  {expiryInfo.expired ? <CalendarX2 className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                                  {expiryInfo.text}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {!hasActiveTrial && sub.status !== 'active' ? (
                              <button
                                onClick={() => {
                                  setSelectedSubForTrial(sub);
                                  setTrialModalType('START');
                                  setTrialDays(14);
                                }}
                                className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                              >
                                Start Trial
                              </button>
                            ) : hasActiveTrial ? (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedSubForTrial(sub);
                                    setTrialModalType('EXTEND');
                                    setTrialDays(7);
                                  }}
                                  className="px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                                >
                                  +7 দিন
                                </button>
                                <button
                                  onClick={() => handleDirectEndTrial(sub)}
                                  className="px-2 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                                >
                                  End
                                </button>
                              </>
                            ) : null}

                            <button
                              onClick={() => handleOpenHistory(sub)}
                              className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Trial History"
                            >
                              <History className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                কোনো সাবস্ক্রিপশন পাওয়া যায়নি।
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trial Modal (Start / Extend / History) */}
      {trialModalType && selectedSubForTrial && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>
                  {trialModalType === 'START' && 'ফ্রি ট্রায়াল শুরু করুন'}
                  {trialModalType === 'EXTEND' && 'ট্রায়ালের মেয়াদ বৃদ্ধি করুন'}
                  {trialModalType === 'HISTORY' && 'ট্রায়াল অডিট হিস্টোরি'}
                </span>
              </h3>
              <button 
                onClick={() => { setTrialModalType(null); setSelectedSubForTrial(null); }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              ইউজার: <strong className="text-slate-800">{selectedSubForTrial.userEmail}</strong>
            </p>

            {/* Modal Body: Form for START / EXTEND */}
            {(trialModalType === 'START' || trialModalType === 'EXTEND') && (
              <form onSubmit={handleTrialActionSubmit} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মেয়াদ (দিন):
                  </label>
                  <select 
                    value={trialDays} 
                    onChange={e => setTrialDays(Number(e.target.value))}
                    className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={7}>৭ দিন (১ সপ্তাহ)</option>
                    <option value={14}>১৪ দিন (২ সপ্তাহ - স্ট্যান্ডার্ড)</option>
                    <option value={30}>৩০ দিন (১ মাস)</option>
                  </select>
                </div>

                {trialModalType === 'START' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      প্যাকেজ (Plan):
                    </label>
                    <select 
                      value={trialPlanId} 
                      onChange={e => setTrialPlanId(e.target.value)}
                      className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="starter">Starter</option>
                      <option value="pro_business">Pro Business</option>
                      <option value="agency">Agency</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    নোট (ঐচ্ছিক):
                  </label>
                  <input 
                    type="text" 
                    value={trialReason} 
                    onChange={e => setTrialReason(e.target.value)}
                    placeholder="যেমন: স্পেশাল অনবোর্ডিং রিকোয়েস্ট"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setTrialModalType(null); setSelectedSubForTrial(null); }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoadingId === selectedSubForTrial.id}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                  >
                    {actionLoadingId === selectedSubForTrial.id ? 'আপডেট হচ্ছে...' : 'নিশ্চিত করুন'}
                  </button>
                </div>
              </form>
            )}

            {/* Modal Body: Trial History List */}
            {trialModalType === 'HISTORY' && (
              <div className="space-y-3 pt-1">
                {historyLoading ? (
                  <div className="py-8 text-center text-xs text-slate-500">হিস্টোরি লোড হচ্ছে...</div>
                ) : trialHistoryList.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {trialHistoryList.map(h => (
                      <div key={h.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-emerald-700 uppercase tracking-wide text-[10px] bg-emerald-100 px-2 py-0.5 rounded">
                            {h.action}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(h.createdAt).toLocaleString('bn-BD')}
                          </span>
                        </div>
                        <div className="text-slate-700 font-medium">
                          {h.daysAdded > 0 && <span>+ {h.daysAdded} দিন বৃদ্ধি | </span>}
                          {h.newEndAt && <span>মেয়াদ: {new Date(h.newEndAt).toLocaleDateString('bn-BD')}</span>}
                        </div>
                        {h.note && <div className="text-[11px] text-slate-500 italic">নোট: {h.note}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500">কোনো ট্রায়াল রেকর্ড পাওয়া যায়নি।</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
