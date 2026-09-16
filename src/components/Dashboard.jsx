import React, { useState } from 'react';
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

export default function Dashboard({ data, setActiveTab }) {
  const [activeSubView, setActiveSubView] = useState('overview'); // 'overview' | 'tuition'

  // Standardized Data Processing (Preserves all existing logic & fallbacks)
  const currentIncome = data?.currentIncome || 40000;
  const newIncome = data?.newIncome || 0;
  const totalIncome = currentIncome + newIncome;
  const targetIncome = data?.targetIncome || 100000;
  const remainingTarget = Math.max(0, targetIncome - totalIncome);
  const installment = data?.installment || 80000;

  // Expenses & Net Position calculations
  const expensesList = data?.expenses || [];
  const totalExpenses = expensesList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const netPosition = totalIncome - totalExpenses;

  // Leads & Pipeline
  const leadsList = data?.leads || [];
  const activeLeads = leadsList.filter(l => l.status !== 'Lost' && l.status !== 'Paid').length || (data?.leads ? 0 : 4);
  const clientsWon = leadsList.filter(l => l.status === 'Paid' || l.status === 'Working' || l.status === 'Advance Paid').length || (data?.leads ? 0 : 2);
  
  // Tasks
  const todayTasks = data?.tasks || [
    { id: 1, name: '৫টি স্কুলে ইমেইল ও কোল্ড কল করা', category: 'Sales', priority: 'High', status: 'InProgress' },
    { id: 2, name: 'পোর্টফোলিও সাইটের হোমপেজ ডিজাইন সম্পন্ন করা', category: 'Portfolio', priority: 'High', status: 'NotStarted' },
    { id: 3, name: 'সার্ভিস প্যাকেজের পিডিএফ তৈরি করা', category: 'Admin', priority: 'Medium', status: 'Done' }
  ];
  const incompleteTasks = todayTasks.filter(t => t.status !== 'Done');

  // Tuition Data
  const tuitionStudents = data?.tuitionStudents || [];
  const tuitionPayments = data?.tuitionPayments || [];
  const activeStudentsCount = tuitionStudents.filter(s => s.status === 'active').length;
  const expectedTuitionCollection = tuitionStudents
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (Number(s.monthlyFee) || 0), 0);
  const collectedTuitionThisMonth = tuitionPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const dueTuitionAmount = Math.max(0, expectedTuitionCollection - collectedTuitionThisMonth);

  const monthlyProgressPercent = Math.min(100, Math.round((totalIncome / targetIncome) * 100));

  // User details
  const userName = data?.user?.user_metadata?.full_name || data?.user?.email?.split('@')[0] || 'উদ্যোক্তা';
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'শুভ সকাল' : currentHour < 17 ? 'শুভ দুপুর' : 'শুভ সন্ধ্যা';

  return (
    <div className="space-y-7 pb-10 max-w-7xl mx-auto font-sans antialiased text-slate-800">
      
      {/* ========================================================================= */}
      {/* 1. COMMAND HEADER: Clean Executive Welcome Bar */}
      {/* ========================================================================= */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              লাইভ বিজনেস কমান্ড
            </span>
            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60">
              ৯০ দিনের লক্ষ্যমাত্রা
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {greeting}, {userName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            আপনার ৯০ দিনে ৳১,০০,০০০ কন্টিনিউয়াস ইনকাম লক্ষ্যের রিয়েল-টাইম স্টেটাস ও দৈনিক ফোকাস।
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('tasks')}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all active:scale-[0.98]"
          >
            <CheckSquare className="w-4 h-4 text-slate-500" />
            <span>আজকের কাজ ({incompleteTasks.length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('crm')}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>নতুন লিড যোগ করুন</span>
          </button>
        </div>
      </header>

      {/* Sub-Navigation for Dashboard views if Tuition data exists */}
      {(tuitionStudents.length > 0 || tuitionPayments.length > 0) && (
        <div className="flex items-center gap-2 border-b border-slate-200/70 pb-2">
          <button
            onClick={() => setActiveSubView('overview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubView === 'overview'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100/70'
            }`}
          >
            মূল বিজনেস ড্যাশবোর্ড
          </button>
          <button
            onClick={() => setActiveSubView('tuition')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeSubView === 'tuition'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100/70'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>টিউশন ট্র্যাকার সামারি</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. HERO SURFACE: PRIMARY FINANCIAL & GOAL POSITION (LEVEL 1 - STRONGEST) */}
      {/* ========================================================================= */}
      {activeSubView === 'overview' && (
        <section className="bg-white border border-[#E2E8F0] rounded-[20px] p-6 sm:p-7 shadow-float-hero space-y-6">
          
          {/* Main Hero Header: Combined Income & Goal Progress */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            
            {/* Primary Metric Focus */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  বর্তমান মোট আয়
                </span>
                <span className="text-xs text-slate-400 font-medium">চলতি মাসের পারফরম্যান্স</span>
              </div>
              
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-bold text-slate-400">৳</span>
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                  {totalIncome.toLocaleString()}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-lg ml-2">
                  {monthlyProgressPercent}% অর্জন
                </span>
              </div>
            </div>

            {/* 90-Day Goal Progress Bar Simulator */}
            <div className="lg:w-1/2 space-y-2.5 bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
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
              <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out shadow-xs"
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

            {/* Stat 4: Monthly Installment */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-50/80 via-amber-50/40 to-yellow-50/60 border border-amber-200/90 shadow-2xs space-y-1">
              <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-amber-600" />
                মাসিক কিস্তি/দায়
              </div>
              <div className="text-xl font-bold text-amber-900">
                ৳{installment.toLocaleString()}
              </div>
              <p className="text-[10px] text-amber-700/80">স্থায়ী মাসিক পরিশোধ</p>
            </div>

          </div>

        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. LIST & DIVIDER LAYOUT: TODAY'S FOCUS & ACTIONS (LEVEL 2 - MEDIUM) */}
      {/* ========================================================================= */}
      {activeSubView === 'overview' && (
        <section className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-float space-y-4">
          
          {/* Section Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  আজকের ফোকাস ও অগ্রাধিকার
                </h2>
                <p className="text-[11px] text-slate-500">আজকে আপনার যে কাজগুলো সম্পন্ন করা প্রয়োজন</p>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab('tasks')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
            >
              <span>সব কাজ দেখুন ({incompleteTasks.length}টি বাকি)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Task Cards Container with Individual Premium Light Backgrounds */}
          <div className="space-y-2.5">
            {todayTasks.length > 0 ? (
              todayTasks.slice(0, 4).map((task) => (
                <div 
                  key={task.id} 
                  className={`p-3.5 rounded-xl border transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xs flex items-center justify-between gap-3 cursor-pointer ${
                    task.status === 'Done'
                      ? 'bg-gradient-to-r from-emerald-50/70 via-emerald-50/30 to-teal-50/40 border-emerald-200/80'
                      : task.status === 'InProgress'
                      ? 'bg-gradient-to-r from-sky-50/80 via-blue-50/40 to-indigo-50/40 border-sky-200/90'
                      : 'bg-gradient-to-r from-slate-50 via-slate-50/80 to-slate-100/60 border-slate-200/90'
                  }`}
                  onClick={() => setActiveTab('tasks')}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      task.priority === 'High' 
                        ? 'bg-rose-500' 
                        : task.priority === 'Medium' 
                        ? 'bg-amber-500' 
                        : 'bg-sky-500'
                    }`} title={`Priority: ${task.priority}`}></span>

                    <div>
                      <div className={`text-xs sm:text-sm font-semibold ${
                        task.status === 'Done' ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}>
                        {task.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-medium text-slate-600 bg-white/80 border border-slate-200/60 px-2 py-0.5 rounded text-[10px]">
                          {task.category}
                        </span>
                        <span>• প্রায়োরিটি: <strong className="text-slate-700">{task.priority}</strong></span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                    task.status === 'Done'
                      ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-200'
                      : task.status === 'InProgress' 
                      ? 'bg-sky-100/80 text-sky-800 border border-sky-200' 
                      : 'bg-slate-200/70 text-slate-700 border border-slate-300/60'
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
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-float-subtle space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">CRM ও সেলস সুযোগ</h3>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                  {activeLeads} সক্রিয় আলোচনা
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 my-3">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                  <div className="text-[10px] text-slate-500 font-medium">অর্জিত ক্লায়েন্ট (Won)</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{clientsWon} জন</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                  <div className="text-[10px] text-slate-500 font-medium">চলমান আলোচনা</div>
                  <div className="text-base font-bold text-emerald-700 mt-0.5">{activeLeads} জন</div>
                </div>
              </div>

              {/* Minimal Leads List */}
              <div className="space-y-2">
                {leadsList.length > 0 ? (
                  leadsList.slice(0, 2).map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-lg border border-slate-200/60 text-xs hover:-translate-y-[1px] transition-all duration-200 cursor-pointer" onClick={() => setActiveTab('crm')}>
                      <div>
                        <div className="font-semibold text-slate-800">{lead.businessName || lead.clientName}</div>
                        <div className="text-[10px] text-slate-500">বাজেট: ৳{(lead.quotedPrice || 0).toLocaleString()}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                        {lead.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-lg border border-slate-200/60 text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">আইডিয়াল মডেল স্কুল</div>
                      <div className="text-[10px] text-slate-500">বাজেট: ৳১৫,০০০</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                      Negotiation
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={() => setActiveTab('crm')}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition-colors"
            >
              <span>সেলস পাইপলাইনে যান</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Business & Tuition Operations Overview Panel */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-float-subtle space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">টিউশন ও অপারেশনস সামারি</h3>
                </div>
                <span className="text-[11px] font-medium text-slate-500">মাসিক হিসাব</span>
              </div>

              <div className="grid grid-cols-2 gap-3 my-3">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                  <div className="text-[10px] text-slate-500 font-medium">সক্রিয় ছাত্র-ছাত্রী</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{activeStudentsCount} জন</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                  <div className="text-[10px] text-slate-500 font-medium">প্রত্যাশিত ফি</div>
                  <div className="text-base font-bold text-indigo-700 mt-0.5">৳{expectedTuitionCollection.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                  <div className="text-[10px] text-emerald-800 font-medium">আদায়কৃত ফি</div>
                  <div className="text-base font-bold text-emerald-700 mt-0.5">৳{collectedTuitionThisMonth.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                  <div className="text-[10px] text-rose-800 font-medium">বকেয়া পরিমাণ</div>
                  <div className="text-base font-bold text-rose-600 mt-0.5">৳{dueTuitionAmount.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab('tuition')}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition-colors"
            >
              <span>টিউশন ট্র্যাকারে যান</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

        </section>
      )}

      {/* Tuition View if activeSubView === 'tuition' */}
      {activeSubView === 'tuition' && (
        <section className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-float-subtle space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">টিউশন ফি ও পেমেন্ট সামারি</h2>
              <p className="text-xs text-slate-500 mt-0.5">ছাত্র-ছাত্রীদের ভর্তি, প্রতি মাসের প্রত্যাশিত ফি ও আদায়কৃত অর্থ</p>
            </div>
            <button 
              onClick={() => setActiveTab('tuition')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              টিউশন ম্যানেজারে যান
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="text-xs text-slate-500 font-medium">মোট সক্রিয় ছাত্র</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{activeStudentsCount} জন</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="text-xs text-slate-500 font-medium">প্রত্যাশিত মোট আদায়</div>
              <div className="text-2xl font-extrabold text-indigo-700 mt-1">৳{expectedTuitionCollection.toLocaleString()}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="text-xs text-emerald-800 font-medium">চলতি মাসে সংগৃহীত</div>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">৳{collectedTuitionThisMonth.toLocaleString()}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="text-xs text-rose-800 font-medium">বকেয়া পরিমাণ</div>
              <div className="text-2xl font-extrabold text-rose-600 mt-1">৳{dueTuitionAmount.toLocaleString()}</div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. LIGHT QUIET SUMMARY SURFACE: EXECUTIVE INSIGHTS (LEVEL 4 - QUIETEST) */}
      {/* ========================================================================= */}
      {activeSubView === 'overview' && (
        <section className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 shadow-none">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-200/60">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              দ্রুত মূল্যায়িনী (Executive Business Summary)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="text-[10px] text-slate-400 font-medium">১. বর্তমান অবস্থান</div>
              <div className="font-semibold text-slate-800">Month 1 (পোর্টফোলিও ও ক্লায়েন্ট)</div>
            </div>

            <div className="space-y-0.5 border-l border-slate-200/60 pl-3">
              <div className="text-[10px] text-slate-400 font-medium">২. চলতি মাসের মোট আয়</div>
              <div className="font-bold text-emerald-700">৳{totalIncome.toLocaleString()}</div>
            </div>

            <div className="space-y-0.5 border-l border-slate-200/60 pl-3">
              <div className="text-[10px] text-slate-400 font-medium">৩. টার্গেটের বাকি</div>
              <div className="font-bold text-rose-600">৳{remainingTarget.toLocaleString()}</div>
            </div>

            <div className="space-y-0.5 border-l border-slate-200/60 pl-3">
              <div className="text-[10px] text-slate-400 font-medium">৪. আজকের করণীয়</div>
              <div className="font-semibold text-slate-800">{incompleteTasks.length}টি কাজ নির্ধারিত</div>
            </div>

            <div className="space-y-0.5 border-l border-slate-200/60 pl-3">
              <div className="text-[10px] text-slate-400 font-medium">৫. সক্রিয় সেলস লিড</div>
              <div className="font-bold text-sky-700">{activeLeads} জন ক্লায়েন্ট আলোচনাধীন</div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
