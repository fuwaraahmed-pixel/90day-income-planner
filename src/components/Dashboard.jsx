import React from 'react';
import { 
  TrendingUp, 
  Target, 
  HelpCircle, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  AlertCircle,
  Clock,
  Wallet,
  Coins,
  Receipt,
  CalendarCheck,
  Building2,
  Briefcase,
  ChevronRight,
  CheckSquare,
  ArrowUpRight,
  PieChart,
  Layers,
  ArrowRightCircle
} from 'lucide-react';

export default function Dashboard({ data, setActiveTab }) {
  const currentIncome = data?.currentIncome || 40000;
  const newIncome = data?.newIncome || 0;
  const totalIncome = currentIncome + newIncome;
  const targetIncome = data?.targetIncome || 100000;
  const remainingTarget = Math.max(0, targetIncome - totalIncome);
  const installment = data?.installment || 80000;

  const activeLeads = data?.leads?.filter(l => l.status !== 'Lost' && l.status !== 'Paid').length || 4;
  const clientsWon = data?.leads?.filter(l => l.status === 'Paid' || l.status === 'Working' || l.status === 'Advance Paid').length || 2;
  const todayTasks = data?.tasks || [
    { id: 1, name: '৫টি স্কুলে ইমেইল ও কোল্ড কল করা', category: 'Sales', priority: 'High', status: 'InProgress' },
    { id: 2, name: 'পোর্টফোলিও সাইটের হোমপেজ ডিজাইন সম্পন্ন করা', category: 'Portfolio', priority: 'High', status: 'NotStarted' },
    { id: 3, name: 'সার্ভিস প্যাকেজের পিডিএফ তৈরি করা', category: 'Admin', priority: 'Medium', status: 'Done' }
  ];

  const incompleteTasks = todayTasks.filter(t => t.status !== 'Done');
  const monthlyProgressPercent = Math.min(100, Math.round((totalIncome / targetIncome) * 100));

  return (
    <div className="space-y-10 sm:space-y-12 pb-12 max-w-7xl mx-auto px-1 sm:px-2">
      {/* ========================================================================= */}
      {/* 00. DASHBOARD HEADER */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              লাইভ ট্র্যাকার • Month 1
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
              ৯০ দিনের লক্ষ্য
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            বিজনেস ড্যাশবোর্ড
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal leading-relaxed max-w-2xl">
            ৯০ দিনে ১ লাখ টাকা মাসিক ইনকাম লক্ষ্য অর্জনের রিয়েল-টাইম ওভারভিউ ও বিজনেসের সামগ্রিক অবস্থা
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start md:self-auto w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('tasks')}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 active:scale-[0.99]"
          >
            <CheckSquare className="w-4 h-4 text-slate-500" />
            <span>আজকের কাজ ({incompleteTasks.length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('crm')}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all duration-150 active:scale-[0.99]"
          >
            <Users className="w-4 h-4" />
            <span>নতুন লিড যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 01: FINANCIAL OVERVIEW */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-900"></span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                আর্থিক ওভারভিউ
              </h2>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60">
                ৬টি মূল সূচক
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 ml-4.5">
              আর্থিক স্থিতির ৬টি মূল সূচক ও চলতি মাসের আয়-ব্যয় ট্র্যাকিং
            </p>
          </div>
        </div>

        {/* 6 Financial Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
          
          {/* Card 1: Current Income (Slate / Neutral Accent) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-800 transition-colors">বর্তমান আয়</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100/90 text-slate-700 flex items-center justify-center border border-slate-200/70 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-2xl font-black text-slate-900 tracking-tight">৳{currentIncome.toLocaleString()}</div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">ধরন:</span>
                <span className="font-semibold text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/60">স্থায়ী আয়</span>
              </div>
            </div>
          </div>

          {/* Card 2: New Income (Emerald Accent) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-emerald-800 transition-colors">নতুন ইনকাম</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-2xl font-black text-emerald-600 tracking-tight">৳{newIncome.toLocaleString()}</div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">উৎস:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70">নতুন ক্লায়েন্ট</span>
              </div>
            </div>
          </div>

          {/* Card 3: Total Income (Sky/Blue Accent) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all duration-200 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-sky-800 transition-colors">সর্বমোট ইনকাম</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200/60 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-2xl font-black text-sky-600 tracking-tight">৳{totalIncome.toLocaleString()}</div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">সময়কাল:</span>
                <span className="font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/70">চলতি মাস</span>
              </div>
            </div>
          </div>

          {/* Card 4: Monthly Target (Indigo Accent) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-indigo-800 transition-colors">মাসিক লক্ষ্য</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200/60 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-2xl font-black text-slate-900 tracking-tight">৳{targetIncome.toLocaleString()}</div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">পরিকল্পনা:</span>
                <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/70">৯০ দিনের গোল</span>
              </div>
            </div>
          </div>

          {/* Card 5: Remaining Target (Rose Accent) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-rose-300 transition-all duration-200 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-rose-800 transition-colors">লক্ষ্যে বাকি</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/60 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-2xl font-black text-rose-600 tracking-tight">৳{remainingTarget.toLocaleString()}</div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">স্ট্যাটাস:</span>
                <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/70">প্রয়োজনীয় বাকি</span>
              </div>
            </div>
          </div>

          {/* Card 6: Monthly Installment (Amber Accent) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all duration-200 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-amber-800 transition-colors">মাসিক কিস্তি</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-2xl font-black text-amber-600 tracking-tight">৳{installment.toLocaleString()}</div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">দেনা/কিস্তি:</span>
                <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">ফিক্সড খরচ</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 02: TARGET PROGRESS CANVAS */}
      {/* ========================================================================= */}
      <section className="bg-slate-900/[0.02] border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                মাসিক লক্ষ্যের অগ্রগতি
              </h2>
              <Sparkles className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5 ml-4.5">
              আপনার ৯০ দিনের ১ লাখ টাকা ইনকাম লক্ষ্য অনুযায়ী চলতি মাসের অগ্রগতির সমীকরণ
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto bg-white px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500">অর্জন হার:</span>
            <span className="text-sm font-black text-emerald-700">
              {monthlyProgressPercent}%
            </span>
          </div>
        </div>

        {/* Dynamic Progress Indicator Container */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium text-xs">অর্জিত:</span>
              <span className="text-emerald-700 text-base font-black">৳{totalIncome.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-right">
              <span className="text-slate-400 font-medium text-xs">লক্ষ্যমাত্রা:</span>
              <span className="text-slate-900 text-base font-black">৳{targetIncome.toLocaleString()}</span>
            </div>
          </div>

          {/* Thin Progress Bar */}
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/60 p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-full transition-all duration-700 ease-out relative shadow-xs"
              style={{ width: `${monthlyProgressPercent}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 rounded-full"></div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Target className="w-3.5 h-3.5 text-slate-400" />
              <span>লক্ষ্যের আর মাত্র <strong className="text-slate-900 font-bold">৳{remainingTarget.toLocaleString()}</strong> বাকি</span>
            </div>
            <div className="text-slate-400 text-[11px]">
              * নিয়মিত ক্লায়েন্ট পেমেন্ট ও নতুন লিড কনভার্সনে এটি আপডেট হবে
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 03: TASKS + CRM ACTIVITIES */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600"></span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                আজকের কাজ ও CRM অ্যাক্টিভিটি
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 ml-4.5">
              আজকের দৈনন্দিন অগ্রাধিকার ও চলমান সেলস পাইপলাইনের রিয়েল-টাইম স্টেটাস
            </p>
          </div>
        </div>

        {/* 2-Column Grid for Tasks & CRM */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          
          {/* LEFT PANEL: TODAY'S PRIORITIES */}
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">আজকের অগ্রাধিকার</h3>
                    <p className="text-[11px] text-slate-500">Today's Priorities & Action Plan</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70 shadow-2xs">
                  {incompleteTasks.length}টি কাজ বাকি
                </span>
              </div>

              <div className="space-y-2.5">
                {incompleteTasks.length > 0 ? (
                  incompleteTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3.5 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-200/70 transition-colors group">
                      <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          task.priority === 'High' ? 'bg-rose-500 shadow-2xs' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-sky-500'
                        }`}></span>
                        <div>
                          <div className="text-sm font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">{task.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            ক্যাটাগরি: <span className="text-slate-700 font-medium">{task.category}</span> • প্রায়োরিটি: <span className="text-slate-700 font-medium">{task.priority}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0 ${
                        task.status === 'InProgress' 
                          ? 'bg-sky-50 text-sky-700 border border-sky-200/80' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                      }`}>
                        {task.status === 'InProgress' ? 'চলছে' : 'শুরু হয়নি'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 text-sm bg-slate-50/50 rounded-xl border border-dashed border-slate-200 font-medium">
                    আজকের সব কাজ সফলভাবে সম্পন্ন হয়েছে! 👏
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-5 border-t border-slate-100">
              <button 
                onClick={() => setActiveTab('tasks')}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-all duration-150 active:scale-[0.99] group"
              >
                <span>সব কাজ ও ডেইলি প্ল্যানার দেখুন</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: CRM PIPELINE */}
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">CRM Pipeline</h3>
                    <p className="text-[11px] text-slate-500">Sales & Client Overview</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                  {activeLeads} জন সক্রিয় লিড
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50/80 p-3 sm:p-3.5 rounded-xl border border-slate-200/70">
                  <div className="text-[11px] text-slate-500 font-semibold">অর্জিত ক্লায়েন্ট</div>
                  <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">{clientsWon} জন</div>
                </div>
                <div className="bg-slate-50/80 p-3 sm:p-3.5 rounded-xl border border-slate-200/70">
                  <div className="text-[11px] text-slate-500 font-semibold">কথা চলছে (Negotiation)</div>
                  <div className="text-lg sm:text-xl font-black text-emerald-600 mt-0.5">{activeLeads} জন</div>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3.5 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-200/70 transition-colors">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">আইডিয়াল মডেল স্কুল (Business Website)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">বাজেট: <span className="font-bold text-slate-900">৳১৫,০০০</span></div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200/80">
                    Negotiation
                  </span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-200/70 transition-colors">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">প্রোগ্রেস কোচিং সেন্টার (Landing Page)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">বাজেট: <span className="font-bold text-slate-900">৳৮,০০০</span></div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    Advance Paid
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-5 border-t border-slate-100">
              <button 
                onClick={() => setActiveTab('crm')}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-all duration-150 active:scale-[0.99] group"
              >
                <span>সেলস পাইপলাইনে যান</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 04: QUICK BUSINESS REFLECTION / SUMMARY */}
      {/* ========================================================================= */}
      <section className="bg-slate-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-lg shadow-slate-900/10 border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                দ্রুত মূল্যায়ন (Quick Business Summary)
              </h2>
              <p className="text-[11px] text-slate-400">এক নজরে আপনার ৫টি প্রধান প্রশ্নের উত্তর</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/60 self-start sm:self-auto">
            রিয়েল-টাইম সিনক্রোনাইজড
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="bg-slate-800/60 hover:bg-slate-800/80 transition-colors border border-slate-700/60 rounded-xl p-4">
            <div className="text-[11px] text-slate-400 mb-1.5 font-medium">১. এখন আমি কোথায় আছি?</div>
            <div className="text-xs font-bold text-slate-100 leading-snug">Month 1 (পোর্টফোলিও ও ১ম ৩ ক্লায়েন্ট)</div>
          </div>

          <div className="bg-slate-800/60 hover:bg-slate-800/80 transition-colors border border-slate-700/60 rounded-xl p-4">
            <div className="text-[11px] text-slate-400 mb-1.5 font-medium">২. এই মাসে কত আয় করেছি?</div>
            <div className="text-base font-black text-emerald-400">৳{totalIncome.toLocaleString()}</div>
          </div>

          <div className="bg-slate-800/60 hover:bg-slate-800/80 transition-colors border border-slate-700/60 rounded-xl p-4">
            <div className="text-[11px] text-slate-400 mb-1.5 font-medium">৩. টার্গেটে পৌঁছাতে কত বাকি?</div>
            <div className="text-base font-black text-rose-400">৳{remainingTarget.toLocaleString()}</div>
          </div>

          <div className="bg-slate-800/60 hover:bg-slate-800/80 transition-colors border border-slate-700/60 rounded-xl p-4">
            <div className="text-[11px] text-slate-400 mb-1.5 font-medium">৪. আজ কী কী কাজ করা দরকার?</div>
            <div className="text-xs font-bold text-slate-100 leading-snug">{incompleteTasks.length}টি কাজ বাকি আছে</div>
          </div>

          <div className="bg-slate-800/60 hover:bg-slate-800/80 transition-colors border border-slate-700/60 rounded-xl p-4">
            <div className="text-[11px] text-slate-400 mb-1.5 font-medium">৫. কতজন ক্লায়েন্টের কথা চলছে?</div>
            <div className="text-base font-black text-sky-400">{activeLeads} জন লিড সক্রিয়</div>
          </div>
        </div>
      </section>
    </div>
  );
}


