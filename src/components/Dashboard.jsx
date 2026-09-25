import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Target, 
  HelpCircle, 
  Users, 
  CheckCircle2, 
  Sparkles,
  AlertCircle,
  Wallet,
  Coins,
  Receipt,
  Building2,
  ChevronRight,
  CheckSquare,
  PlusCircle,
  GraduationCap,
  ArrowUpRight,
  Clock,
  Briefcase
} from 'lucide-react';
import IncomeProgressChart from './charts/IncomeProgressChart';
import IncomeSourceChart from './charts/IncomeSourceChart';
import UniversalPaymentModal from './ui/UniversalPaymentModal';
import * as api from '../lib/supabaseService';
import { getUnpaidMonths, getLocalTodayISO, getLocalCurrentMonthStr, getCollectedCashFlow } from './Tuition';

export default function Dashboard({ data, setActiveTab, onRecordLiabilityPayment }) {
  const [activeSubView, setActiveSubView] = useState('overview'); // 'overview' | 'tuition'
  const [payingEmiId, setPayingEmiId] = useState(null);

  // Backend Totals State
  const [backendTotals, setBackendTotals] = useState(null);

  const localTodayISO = getLocalTodayISO();

  const currentMonthPrefix = getLocalCurrentMonthStr();
  const todayStr = localTodayISO;
  const next7DaysStr = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];

  useEffect(() => {
    let isMounted = true;
    const fetchTotals = async () => {
      if (!data?.user?.id) return;
      const [t1, t2] = await Promise.all([
        api.getDashboardFinancialTotals(data.user.id),
        api.getDashboardTuitionAndDuesTotals(data.user.id, currentMonthPrefix, todayStr, next7DaysStr)
      ]);
      if (isMounted) {
        setBackendTotals({ ...(t1 || {}), ...(t2 || {}) });
      }
    };
    fetchTotals();
    return () => { isMounted = false; };
  }, [
    data?.user?.id, 
    data?.incomes, 
    data?.expenses, 
    data?.tuitionPayments, 
    data?.customerDues, 
    data?.liabilities, 
    data?.liabilityPayments,
    data?.tuitionStudents
  ]);

  // Standardized Data Processing
  const currentIncome = backendTotals?.salarySum != null ? Number(backendTotals.salarySum) : (data?.currentIncome ?? 0);
  const newIncome = backendTotals?.newIncomeSum != null ? Number(backendTotals.newIncomeSum) : (data?.newIncome ?? 0);
  const totalIncome = currentIncome + newIncome;
  const targetIncome = backendTotals?.targetIncome != null ? Number(backendTotals.targetIncome) : (data?.targetIncome || 100000);
  const remainingTarget = Math.max(0, targetIncome - totalIncome);
  
  // EMI Liabilities Quick Action
  const liabilities = data?.liabilities || [];
  const liabilityPayments = data?.liabilityPayments || [];
  const activeEmis = liabilities.filter(l => l.liabilityType === 'EMI' && l.status !== 'Paid Off');
  
  const unpaidEmis = activeEmis.filter(emi => {
    return !liabilityPayments.some(p => p.liabilityId === emi.id && p.paymentDate?.startsWith(currentMonthPrefix));
  });

  const [dashboardPaymentModalEmi, setDashboardPaymentModalEmi] = useState(null);

  const handleQuickPayEmi = (emi) => {
    setDashboardPaymentModalEmi(emi);
  };

  const submitDashboardEmiPayment = async (paymentData) => {
    const amount = Number(paymentData.amount);
    if (!amount || amount <= 0) return;
    
    setPayingEmiId(dashboardPaymentModalEmi.id);
    const uniquePaymentId = paymentData.paymentId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pay_${Date.now()}`);
    
    if (onRecordLiabilityPayment) {
      const res = await onRecordLiabilityPayment({
        paymentId: uniquePaymentId,
        liabilityId: dashboardPaymentModalEmi.id,
        paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
        amount: amount,
        paymentMethod: paymentData.paymentMethod || 'Cash',
        notes: paymentData.notes || 'Quick EMI Payment from Dashboard',
        addToExpense: true
      });
      if (res && res.success === false) {
        alert(res.message || 'Error recording EMI payment');
      }
    }
    setPayingEmiId(null);
    setDashboardPaymentModalEmi(null);
  };

  // Expenses & Net Position calculations
  const expensesList = data?.expenses || [];
  const totalExpenses = backendTotals?.totalExpenses != null ? Number(backendTotals.totalExpenses) : expensesList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const netPosition = totalIncome - totalExpenses;

  // Leads & Pipeline
  const leadsList = data?.leads || [];
  const activeLeads = leadsList.filter(l => l.status !== 'Lost' && l.status !== 'Paid').length;
  const clientsWon = leadsList.filter(l => l.status === 'Paid' || l.status === 'Working' || l.status === 'Advance Paid').length;
  
  // Tasks
  const todayTasks = data?.tasks || [];
  const incompleteTasks = todayTasks.filter(t => t.status !== 'Done');

  // Tuition Data
  const tuitionStudents = data?.tuitionStudents || [];
  const tuitionPayments = data?.tuitionPayments || [];
  const activeStudentsCount = tuitionStudents.filter(s => s.status?.toLowerCase() === 'active').length;
  
  // Use source-of-truth postpaid logic to compute exact total historical dues
  let calculatedDueTuitionAmount = 0;
  
  tuitionStudents.filter(s => s.status?.toLowerCase() === 'active').forEach(student => {
    const { unpaid } = getUnpaidMonths(student, localTodayISO, tuitionPayments);
    calculatedDueTuitionAmount += unpaid.length * (Number(student.monthlyFee) || 0);
  });

  const dueTuitionAmount = calculatedDueTuitionAmount;
  
  // "Cash Flow" semantic: Total cash actually received during this calendar month
  const collectedTuitionThisMonth = getCollectedCashFlow(tuitionPayments, currentMonthPrefix);
    
  // "Run Rate" semantic: Total expected fees for 1 standard month
  const expectedTuitionCollection = tuitionStudents
    .filter(s => s.status?.toLowerCase() === 'active')
    .reduce((sum, s) => sum + (Number(s.monthlyFee) || 0), 0);

  // Customer Dues Data
  const customerDues = data?.customerDues || [];
  const totalDuesAmount = backendTotals?.totalDues != null ? Number(backendTotals.totalDues) : customerDues.reduce((sum, item) => {
    const due = Math.max(0, (Number(item.totalAmount) || 0) - (Number(item.paidAmount) || 0));
    return sum + due;
  }, 0);

  const overdueDuesAmount = backendTotals?.overdueDues != null ? Number(backendTotals.overdueDues) : customerDues.reduce((sum, item) => {
    const due = Math.max(0, (Number(item.totalAmount) || 0) - (Number(item.paidAmount) || 0));
    if (item.dueDate && item.dueDate < todayStr && due > 0) return sum + due;
    return sum;
  }, 0);

  const dueSoonDuesAmount = backendTotals?.dueSoonDues != null ? Number(backendTotals.dueSoonDues) : customerDues.reduce((sum, item) => {
    const due = Math.max(0, (Number(item.totalAmount) || 0) - (Number(item.paidAmount) || 0));
    if (item.dueDate && item.dueDate >= todayStr && item.dueDate <= next7DaysStr && due > 0) return sum + due;
    return sum;
  }, 0);

  const upcomingDuesAmount = Math.max(0, totalDuesAmount - (overdueDuesAmount + dueSoonDuesAmount));

  const dueCustomersCount = new Set(
    customerDues
      .filter(item => Math.max(0, (Number(item.totalAmount) || 0) - (Number(item.paidAmount) || 0)) > 0)
      .map(item => item.customerName?.trim().toLowerCase())
  ).size;

  const monthlyProgressPercent = Math.min(100, Math.round((totalIncome / targetIncome) * 100));

  // User details
  const userName = data?.user?.user_metadata?.full_name || data?.user?.email?.split('@')[0] || 'উদ্যোক্তা';
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'শুভ সকাল' : currentHour < 17 ? 'শুভ দুপুর' : 'শুভ সন্ধ্যা';

  return (
    <div className="space-y-7 pb-10 w-full max-w-[1600px] mx-auto font-sans antialiased text-slate-800">
      
      {/* ========================================================================= */}
      {/* 1. COMMAND HEADER: Executive Dark Premium Hero Banner */}
      {/* ========================================================================= */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background glow graphics */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                লাইভ বিজনেস কমান্ড
              </span>
              <span className="text-xs text-slate-300 font-semibold bg-white/10 px-3 py-1 rounded-full border border-white/15">
                🎯 ৯০ দিনের লক্ষ্যমাত্রা
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              {greeting}, {userName}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-xl">
              আপনার ৯০ দিনে <span className="font-bold text-emerald-300">৳১,০০,০০০ কন্টিনিউয়াস ইনকাম</span> লক্ষ্যের রিয়েল-টাইম স্টেটাস ও দৈনিক ফোকাস।
            </p>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <button
                onClick={() => setActiveSubView('overview')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeSubView === 'overview'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm font-extrabold'
                    : 'bg-white/10 text-slate-300 border border-white/15 hover:bg-white/20'
                }`}
              >
                📊 মূল বিজনেস ড্যাশবোর্ড
              </button>
              {(tuitionStudents.length > 0 || tuitionPayments.length > 0) && (
                <button
                  onClick={() => setActiveSubView('tuition')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeSubView === 'tuition'
                      ? 'bg-indigo-500 text-white shadow-sm font-extrabold'
                      : 'bg-white/10 text-slate-300 border border-white/15 hover:bg-white/20'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>টিউশন ট্র্যাকার সামারি</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Action & Stat Widget Container */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-4 self-start lg:self-auto shrink-0 w-full lg:w-auto">
            {/* Quick Goal Progress Glass Widget */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 min-w-[260px] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  মাসিক আয়ের লক্ষ্য
                </span>
                <span className="text-sm font-bold text-emerald-400">{monthlyProgressPercent}%</span>
              </div>
              <div className="w-full bg-slate-700/60 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
                  style={{ width: `${monthlyProgressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-300 pt-0.5 font-medium">
                <span>আয়: ৳{totalIncome.toLocaleString()}</span>
                <span>টার্গেট: ৳{targetIncome.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 w-full">
              <button 
                onClick={() => setActiveTab('tasks')}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-md transition-all active:scale-[0.98]"
              >
                <CheckSquare className="w-4 h-4 text-emerald-300" />
                <span>আজকের কাজ ({incompleteTasks.length})</span>
              </button>
              <button 
                onClick={() => setActiveTab('crm')}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" />
                <span>নতুন লিড</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SURFACE: PRIMARY FINANCIAL & GOAL POSITION (LEVEL 1 - STRONGEST) */}
      {/* ========================================================================= */}
      {activeSubView === 'overview' && (
        <section className="bg-gradient-to-br from-white via-slate-50/60 to-indigo-50/30 border border-indigo-100/80 rounded-[20px] p-6 sm:p-7 shadow-float-hero space-y-6 relative overflow-hidden">
          
          {/* Main Hero Header: Combined Income & Goal Progress */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200/60">
            
            {/* Primary Metric Focus */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  বর্তমান মোট আয়
                </span>
                <span className="text-xs text-slate-500 font-medium">চলতি মাসের পারফরম্যান্স</span>
              </div>
              
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-bold text-slate-400">৳</span>
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                  {totalIncome.toLocaleString()}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg ml-2 shadow-2xs">
                  {monthlyProgressPercent}% অর্জন
                </span>
              </div>
            </div>

            {/* 90-Day Goal Progress Bar Simulator */}
            <div className="lg:w-1/2 space-y-2.5 bg-white/90 p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-600" />
                  ৯০ দিনের মাসিক টার্গেট: ৳{targetIncome.toLocaleString()}
                </span>
                <span className="text-rose-600 font-bold">
                  বাকি ৳{remainingTarget.toLocaleString()}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/70 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 rounded-full transition-all duration-700 ease-out shadow-xs"
                  style={{ width: `${monthlyProgressPercent}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-medium pt-0.5">
                <span>৳০</span>
                <span>৳২৫,০০০</span>
                <span>৳৫০,০০০</span>
                <span>৳৭৫,০০০</span>
                <span className="font-bold text-slate-900">৳১,০০,০০০+</span>
              </div>
            </div>
          </div>

          {/* Integrated Metrics Row with Subtle Soft Gradients */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
            
            {/* Stat 1: Current Fixed Income */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200/90 shadow-2xs space-y-1">
              <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-slate-500" />
                বর্তমান স্থায়ী আয়
              </div>
              <div className="text-xl font-bold text-slate-900">
                ৳{currentIncome.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500">স্থায়ী বেতন / সাবস্ক্রিপশন</p>
            </div>

            {/* Stat 2: New Income */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50/80 via-emerald-50/40 to-teal-50/60 border border-emerald-200/90 shadow-2xs space-y-1">
              <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                নতুন আয় (চলতি মাস)
              </div>
              <div className="text-xl font-bold text-emerald-700">
                ৳{newIncome.toLocaleString()}
              </div>
              <p className="text-[10px] text-emerald-600/80">নতুন প্রজেক্ট ও ক্লায়েন্ট</p>
            </div>

            {/* Stat 3: Target Gap */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-rose-50/80 via-rose-50/40 to-pink-50/60 border border-rose-200/90 shadow-2xs space-y-1">
              <div className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                লক্ষ্যে পৌঁছাতে বাকি
              </div>
              <div className="text-xl font-bold text-rose-600">
                ৳{remainingTarget.toLocaleString()}
              </div>
              <p className="text-[10px] text-rose-600/80">প্রয়োজনীয় অতিরিক্ত আয়</p>
            </div>

            {/* Stat 4: Monthly Installment / EMI */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-50/80 via-amber-50/40 to-yellow-50/60 border border-amber-200/90 shadow-2xs space-y-1">
              <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-amber-600" />
                মাসিক কিস্তি/দায়
              </div>
              <div className="text-xl font-bold text-amber-900">
                {unpaidEmis.length > 0 ? `${unpaidEmis.length}টি কিস্তি বাকি` : 'সব কিস্তি পরিশোধিত'}
              </div>
              {unpaidEmis.length > 0 ? (
                <div className="pt-1 flex flex-col gap-1">
                  {unpaidEmis.map(emi => (
                    <button 
                      key={emi.id}
                      onClick={() => handleQuickPayEmi(emi)}
                      disabled={payingEmiId === emi.id}
                      className="text-[10px] bg-amber-600 text-white px-2 py-1 rounded shadow-sm hover:bg-amber-700 transition-colors w-full text-left truncate flex justify-between items-center"
                    >
                      <span>Pay {emi.creditorName}</span>
                      {payingEmiId === emi.id && <RefreshCw className="w-3 h-3 animate-spin" />}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-amber-700/80">চলতি মাসের দায় নেই</p>
              )}
            </div>

          </div>

          {/* Customer Dues Compact Summary Banner */}
          <div className="mt-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">আমার পাওনা (Customer Dues)</h3>
                  {overdueDuesAmount > 0 && (
                    <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      ⚠ Overdue ৳{overdueDuesAmount.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2 pt-0.5">
                  <span className="text-2xl font-black text-white">৳{totalDuesAmount.toLocaleString()}</span>
                  <span className="text-xs text-slate-300 font-medium">({dueCustomersCount} জন কাস্টমারের কাছ থেকে পাওনা)</span>
                </div>
              </div>
            </div>

            {/* Breakdown Chips & Action */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                  <span className="text-amber-300">Overdue:</span>
                  <span>৳{overdueDuesAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                  <span className="text-blue-300">Due Soon:</span>
                  <span>৳{dueSoonDuesAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                  <span className="text-emerald-300">Upcoming:</span>
                  <span>৳{upcomingDuesAmount.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('dues')}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs w-full sm:w-auto"
              >
                <span>পাওনা তালিকা</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </section>
      )}

      {/* ========================================================================= */}
      {/* 2.5 VISUAL ANALYTICS: 90-DAY PROGRESS & INCOME SOURCE BREAKDOWN */}
      {/* ========================================================================= */}
      {activeSubView === 'overview' && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <IncomeProgressChart incomes={data?.incomes || []} targetIncome={targetIncome} />
          </div>
          <div className="lg:col-span-1">
            <IncomeSourceChart incomes={data?.incomes || []} />
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. LIST & DIVIDER LAYOUT: TODAY'S FOCUS & ACTIONS (LEVEL 2 - MEDIUM) */}
      {/* ========================================================================= */}
      {activeSubView === 'overview' && (
        <section className="bg-gradient-to-br from-white via-slate-50/60 to-indigo-50/20 border border-indigo-100/80 rounded-[20px] p-6 sm:p-7 shadow-float space-y-6 relative overflow-hidden">
          
          {/* Section Header */}
          <div className="bg-gradient-to-r from-indigo-100 via-sky-100/70 to-slate-50/40 -mx-6 -mt-6 sm:-mx-7 sm:-mt-7 px-6 py-5 sm:px-7 sm:py-5.5 mb-5 rounded-t-[20px] border-b border-indigo-200/90 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-xs ring-2 ring-indigo-300/60 shrink-0">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-indigo-950 tracking-tight">
                    আজকের ফোকাস ও অগ্রাধিকার
                  </h2>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white border border-indigo-400 shadow-2xs">
                    {incompleteTasks.length}টি বাকি
                  </span>
                </div>
                <p className="text-[11px] text-indigo-900/80 font-semibold">আজকে আপনার যে কাজগুলো সম্পন্ন করা প্রয়োজন</p>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab('tasks')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-950 bg-white/95 hover:bg-white px-3.5 py-1.5 rounded-xl border border-indigo-300/80 shadow-2xs transition-all hover:-translate-y-[1px]"
            >
              <span>সব কাজ দেখুন</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Task Cards Container with Individual Premium Light Backgrounds */}
          <div className="space-y-2.5">
            {todayTasks.length > 0 ? (
              todayTasks.slice(0, 4).map((task) => (
                <div 
                  key={task.id} 
                  className={`p-4 rounded-xl border transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xs flex items-center justify-between gap-3 cursor-pointer ${
                    task.status === 'Done'
                      ? 'bg-gradient-to-r from-emerald-50/80 via-emerald-50/40 to-teal-50/50 border-emerald-200/80 hover:border-emerald-300'
                      : task.status === 'InProgress'
                      ? 'bg-gradient-to-r from-sky-50/90 via-blue-50/50 to-indigo-50/50 border-sky-200/90 hover:border-sky-300'
                      : 'bg-gradient-to-r from-slate-50 via-slate-50/90 to-slate-100/70 border-slate-200/90 hover:border-slate-300'
                  }`}
                  onClick={() => setActiveTab('tasks')}
                >
                  <div className="flex items-center gap-3.5">
                    <span className={`w-3 h-3 rounded-full shrink-0 shadow-2xs ring-2 ring-white ${
                      task.priority === 'High' 
                        ? 'bg-rose-500' 
                        : task.priority === 'Medium' 
                        ? 'bg-amber-500' 
                        : 'bg-sky-500'
                    }`} title={`Priority: ${task.priority}`}></span>

                    <div>
                      <div className={`text-xs sm:text-sm font-semibold ${
                        task.status === 'Done' ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}>
                        {task.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-slate-700 bg-white/90 border border-slate-200 px-2 py-0.5 rounded-md text-[10px] shadow-2xs">
                          {task.category}
                        </span>
                        <span>• প্রায়োরিটি: <strong className={task.priority === 'High' ? 'text-rose-700 font-bold' : 'text-slate-700'}>{task.priority}</strong></span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-3 py-1 rounded-lg shrink-0 shadow-2xs ${
                    task.status === 'Done'
                      ? 'bg-emerald-100/90 text-emerald-900 border border-emerald-200'
                      : task.status === 'InProgress' 
                      ? 'bg-sky-100/90 text-sky-900 border border-sky-200' 
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}>
                    {task.status === 'Done' ? 'সম্পন্ন' : task.status === 'InProgress' ? 'চলছে' : 'শুরু হয়নি'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                আজকের জন্য কোনো কাজ এন্ট্রি করা নেই
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. COMPACT PANELS: CRM PIPELINE & OPERATIONAL SUMMARY (LEVEL 3 - QUIET) */}
      {/* ========================================================================= */}
      {activeSubView === 'overview' && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* CRM & Sales Opportunities Compact Panel */}
          <div className="bg-gradient-to-br from-white via-slate-50/60 to-emerald-50/30 border border-emerald-100/90 rounded-[20px] p-6 sm:p-7 shadow-float-subtle space-y-5 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="bg-gradient-to-r from-teal-100 via-emerald-100/70 to-slate-50/40 -mx-6 -mt-6 sm:-mx-7 sm:-mt-7 px-6 py-5 sm:px-7 sm:py-5.5 mb-5 rounded-t-[20px] border-b border-teal-200/90 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white flex items-center justify-center shadow-xs ring-2 ring-teal-300/60 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-teal-950 tracking-tight">CRM ও সেলস সুযোগ</h3>
                </div>
                <span className="text-xs font-bold text-teal-950 bg-white/95 px-3 py-1.5 rounded-full border border-teal-300 shadow-2xs">
                  {activeLeads} সক্রিয় আলোচনা
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 my-3.5">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-3 rounded-xl border border-slate-700/80 shadow-xs">
                  <div className="text-[10px] text-slate-300 font-medium">অর্জিত ক্লায়েন্ট (Won)</div>
                  <div className="text-lg font-black text-emerald-400 mt-0.5">{clientsWon} জন</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-emerald-100/50 p-3 rounded-xl border border-emerald-200/90 shadow-2xs">
                  <div className="text-[10px] text-emerald-800 font-semibold">চলমান আলোচনা</div>
                  <div className="text-lg font-black text-emerald-900 mt-0.5">{activeLeads} জন</div>
                </div>
              </div>

              {/* Minimal Leads List */}
              <div className="space-y-2.5">
                {leadsList.length > 0 ? (
                  leadsList.slice(0, 2).map((lead) => (
                    <div 
                      key={lead.id} 
                      className="flex items-center justify-between p-3 bg-white/90 rounded-xl border border-slate-200/90 hover:border-emerald-300 text-xs hover:-translate-y-[1px] transition-all duration-200 shadow-2xs cursor-pointer" 
                      onClick={() => setActiveTab('crm')}
                    >
                      <div>
                        <div className="font-bold text-slate-900">{lead.businessName || lead.clientName}</div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">বাজেট: <strong className="text-slate-700">৳{(lead.quotedPrice || 0).toLocaleString()}</strong></div>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {lead.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between p-3 bg-white/90 rounded-xl border border-slate-200/90 text-xs shadow-2xs">
                    <div>
                      <div className="font-bold text-slate-900">আইডিয়াল মডেল স্কুল</div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5">বাজেট: <strong className="text-slate-700">৳১৫,০০০</strong></div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                      Negotiation
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={() => setActiveTab('crm')}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-2xs hover:-translate-y-[1px] transition-all"
            >
              <span>সেলস পাইপলাইনে যান</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Business & Tuition Operations Overview Panel */}
          <div className="bg-gradient-to-br from-white via-slate-50/60 to-indigo-50/30 border border-indigo-100/90 rounded-[20px] p-6 sm:p-7 shadow-float-subtle space-y-5 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="bg-gradient-to-r from-purple-100 via-indigo-100/70 to-slate-50/40 -mx-6 -mt-6 sm:-mx-7 sm:-mt-7 px-6 py-5 sm:px-7 sm:py-5.5 mb-5 rounded-t-[20px] border-b border-purple-200/90 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center shadow-xs ring-2 ring-purple-300/60 shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-purple-950 tracking-tight">টিউশন ও অপারেশনস সামারি</h3>
                </div>
                <span className="text-[11px] font-extrabold text-purple-950 bg-white/95 px-3 py-1.5 rounded-full border border-purple-300 shadow-2xs">
                  মাসিক হিসাব
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 my-3.5">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/80 p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-medium">সক্রিয় ছাত্র-ছাত্রী</div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">{activeStudentsCount} জন</div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50/90 via-indigo-50/40 to-blue-50/60 p-3 rounded-xl border border-indigo-200/80 shadow-2xs">
                  <div className="text-[10px] text-indigo-800 font-semibold">প্রত্যাশিত ফি</div>
                  <div className="text-base font-extrabold text-indigo-900 mt-0.5">৳{expectedTuitionCollection.toLocaleString()}</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-teal-50/60 p-3 rounded-xl border border-emerald-200/80 shadow-2xs">
                  <div className="text-[10px] text-emerald-800 font-semibold">আদায়কৃত ফি</div>
                  <div className="text-base font-extrabold text-emerald-800 mt-0.5">৳{collectedTuitionThisMonth.toLocaleString()}</div>
                </div>
                <div className="bg-gradient-to-br from-rose-50/90 via-rose-50/40 to-pink-50/60 p-3 rounded-xl border border-rose-200/80 shadow-2xs">
                  <div className="text-[10px] text-rose-800 font-semibold">বকেয়া পরিমাণ</div>
                  <div className="text-base font-extrabold text-rose-700 mt-0.5">৳{dueTuitionAmount.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab('tuition')}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-2xs hover:-translate-y-[1px] transition-all"
            >
              <span>টিউশন ট্র্যাকারে যান</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

        </section>
      )}

      {/* Tuition View if activeSubView === 'tuition' */}
      {activeSubView === 'tuition' && (
        <section className="bg-gradient-to-br from-white via-slate-50/60 to-indigo-50/30 border border-indigo-100/90 rounded-[20px] p-6 sm:p-7 shadow-float-subtle space-y-6 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-100 via-indigo-100/70 to-slate-50/40 -mx-6 -mt-6 sm:-mx-7 sm:-mt-7 px-6 py-5 sm:px-7 sm:py-5.5 mb-5 rounded-t-[20px] border-b border-purple-200/90 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-purple-950 tracking-tight">টিউশন ফি ও পেমেন্ট সামারি</h2>
              <p className="text-xs text-purple-900/80 font-semibold mt-0.5">ছাত্র-ছাত্রীদের ভর্তি, প্রতি মাসের প্রত্যাশিত ফি ও আদায়কৃত অর্থ</p>
            </div>
            <button 
              onClick={() => setActiveTab('tuition')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              টিউশন ম্যানেজারে যান
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/80 p-4 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">মোট সক্রিয় ছাত্র</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{activeStudentsCount} জন</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50/90 via-indigo-50/40 to-blue-50/60 p-4 rounded-xl border border-indigo-200/80 shadow-2xs">
              <div className="text-xs text-indigo-800 font-semibold">প্রত্যাশিত মোট আদায়</div>
              <div className="text-2xl font-extrabold text-indigo-900 mt-1">৳{expectedTuitionCollection.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-teal-50/60 p-4 rounded-xl border border-emerald-200/80 shadow-2xs">
              <div className="text-xs text-emerald-800 font-semibold">চলতি মাসে সংগৃহীত</div>
              <div className="text-2xl font-extrabold text-emerald-800 mt-1">৳{collectedTuitionThisMonth.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-rose-50/90 via-rose-50/40 to-pink-50/60 p-4 rounded-xl border border-rose-200/80 shadow-2xs">
              <div className="text-xs text-rose-800 font-semibold">বকেয়া পরিমাণ</div>
              <div className="text-2xl font-extrabold text-rose-700 mt-1">৳{dueTuitionAmount.toLocaleString()}</div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. LIGHT QUIET SUMMARY SURFACE: EXECUTIVE INSIGHTS (LEVEL 4 - QUIETEST) */}
      {/* ========================================================================= */}
      {activeSubView === 'overview' && (
        <section className="bg-gradient-to-br from-white via-slate-50/80 to-indigo-50/20 border border-slate-200/90 rounded-[20px] p-6 sm:p-7 shadow-float-subtle space-y-5 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-100 via-teal-100/70 to-indigo-100/60 -mx-6 -mt-6 sm:-mx-7 sm:-mt-7 px-6 py-5 sm:px-7 sm:py-5.5 mb-5 rounded-t-[20px] border-b border-teal-200/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9.5 h-9.5 rounded-xl bg-gradient-to-br from-teal-600 to-indigo-700 text-white flex items-center justify-center shadow-xs ring-2 ring-teal-300/60 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-wide">
                  দ্রুত মূল্যায়িনী (Executive Business Summary)
                </h3>
                <p className="text-xs text-slate-800/80 font-semibold mt-0.5">রিয়েল-টাইম বিজনেস পারফরম্যান্স ও কী ইন্সাইটস</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
            <div className="p-4 sm:p-4.5 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/80 space-y-1 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-medium">১. বর্তমান অবস্থান</div>
              <div className="font-bold text-slate-800 text-sm">Month 1 (পোর্টফোলিও ও ক্লায়েন্ট)</div>
            </div>

            <div className="p-4 sm:p-4.5 rounded-xl bg-gradient-to-br from-emerald-50/60 via-emerald-50/30 to-teal-50/40 border border-emerald-200/70 space-y-1 shadow-2xs">
              <div className="text-[11px] text-emerald-800 font-medium">২. চলতি মাসের মোট আয়</div>
              <div className="font-extrabold text-emerald-900 text-sm">৳{totalIncome.toLocaleString()}</div>
            </div>

            <div className="p-4 sm:p-4.5 rounded-xl bg-gradient-to-br from-rose-50/60 via-rose-50/30 to-pink-50/40 border border-rose-200/70 space-y-1 shadow-2xs">
              <div className="text-[11px] text-rose-800 font-medium">৩. টার্গেটের বাকি</div>
              <div className="font-extrabold text-rose-700 text-sm">৳{remainingTarget.toLocaleString()}</div>
            </div>

            <div className="p-4 sm:p-4.5 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/80 space-y-1 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-medium">৪. আজকের করণীয়</div>
              <div className="font-bold text-slate-800 text-sm">{incompleteTasks.length}টি কাজ নির্ধারিত</div>
            </div>

            <div className="p-4 sm:p-4.5 rounded-xl bg-gradient-to-br from-sky-50/60 via-sky-50/30 to-indigo-50/40 border border-sky-200/70 space-y-1 shadow-2xs">
              <div className="text-[11px] text-sky-800 font-medium">৫. সক্রিয় সেলস লিড</div>
              <div className="font-extrabold text-sky-900 text-sm">{activeLeads} জন ক্লায়েন্ট আলোচনাধীন</div>
            </div>
          </div>
        </section>
      )}

      {/* Add UniversalPaymentModal at the bottom */}
      <UniversalPaymentModal
        isOpen={Boolean(dashboardPaymentModalEmi)}
        onClose={() => setDashboardPaymentModalEmi(null)}
        onSubmit={submitDashboardEmiPayment}
        title="কিস্তি (EMI) পরিশোধ করুন"
        description="পেমেন্ট রেকর্ড করলে তা স্বয়ংক্রিয়ভাবে খরচ (Expense)-এ যুক্ত হবে।"
        isSubmitting={payingEmiId === dashboardPaymentModalEmi?.id}
        submitLabel="পেমেন্ট নিশ্চিত করুন"
        defaultAmount={dashboardPaymentModalEmi?.remainingAmount > 0 ? dashboardPaymentModalEmi.remainingAmount : ''}
        headerContent={
          dashboardPaymentModalEmi ? (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Creditor: <span className="font-medium text-slate-800">{dashboardPaymentModalEmi.creditorName}</span></span>
              <span className="text-slate-500">Remaining: <span className="font-bold text-rose-600">৳{Number(dashboardPaymentModalEmi.remainingAmount).toLocaleString()}</span></span>
            </div>
          ) : null
        }
      />
    </div>
  );
}
