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
  CheckSquare
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
    <div className="space-y-8 pb-8 max-w-7xl mx-auto">
      {/* 1. Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              লাইভ ট্র্যাকার • Month 1
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            বিজনেস ড্যাশবোর্ড
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-normal leading-relaxed">
            ৯০ দিনে ১ লাখ টাকা মাসিক ইনকাম লক্ষ্য অর্জনের রিয়েল-টাইম ওভারভিউ
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button 
            onClick={() => setActiveTab('tasks')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-all duration-150"
          >
            <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>আজকের কাজ ({incompleteTasks.length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('crm')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all duration-150"
          >
            <Users className="w-3.5 h-3.5" />
            <span>নতুন লিড যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* 2. Important Financial Overview (6 Stats Cards) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            অর্থনৈতিক ওভারভিউ (Financial Overview)
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Card 1: Current Income */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm hover:border-slate-300 hover:shadow transition-all duration-150 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">বর্তমান আয়</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">৳{currentIncome.toLocaleString()}</div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">ধরন:</span>
                <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">স্থায়ী আয়</span>
              </div>
            </div>
          </div>

          {/* Card 2: New Income */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm hover:border-slate-300 hover:shadow transition-all duration-150 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">নতুন ইনকাম</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600 tracking-tight">৳{newIncome.toLocaleString()}</div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">উৎস:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">নতুন ক্লায়েন্ট</span>
              </div>
            </div>
          </div>

          {/* Card 3: Total Income */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm hover:border-slate-300 hover:shadow transition-all duration-150 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">সর্বমোট ইনকাম</span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 border border-sky-100">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-sky-700 tracking-tight">৳{totalIncome.toLocaleString()}</div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">সময়কাল:</span>
                <span className="font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">চলতি মাস</span>
              </div>
            </div>
          </div>

          {/* Card 4: Target Income */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm hover:border-slate-300 hover:shadow transition-all duration-150 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">মাসিক লক্ষ্য</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">৳{targetIncome.toLocaleString()}</div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">পরিকল্পনা:</span>
                <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">৯০ দিনের গোল</span>
              </div>
            </div>
          </div>

          {/* Card 5: Remaining Target */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm hover:border-slate-300 hover:shadow transition-all duration-150 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">লক্ষ্যে বাকি</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-rose-600 tracking-tight">৳{remainingTarget.toLocaleString()}</div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">স্ট্যাটাস:</span>
                <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">প্রয়োজনীয় বাকি</span>
              </div>
            </div>
          </div>

          {/* Card 6: Installment */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm hover:border-slate-300 hover:shadow transition-all duration-150 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">মাসিক কিস্তি</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600 tracking-tight">৳{installment.toLocaleString()}</div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">দেনা/কিস্তি:</span>
                <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">ফিক্সড খরচ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Income Progress / Target Section */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">চলতি মাসের ইনকাম টার্গেট প্রগ্রেস</h3>
            <p className="text-xs text-slate-500 mt-0.5">মোট অর্জিত ইনকাম বনাম মাসের লক্ষ্যমাত্রা</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">অগ্রগতি:</span>
            <span className="text-base font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-lg">
              {monthlyProgressPercent}%
            </span>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-2">
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
            <div 
              className="h-full bg-slate-900 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${monthlyProgressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-500 font-medium pt-1">
            <span>বর্তমানে অর্জিত: <strong className="text-slate-800">৳{totalIncome.toLocaleString()}</strong></span>
            <span>লক্ষ্যমাত্রা: <strong className="text-slate-800">৳{targetIncome.toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      {/* 4 & 5. Today's Tasks & Recent Business Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 4: Today's Tasks */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">আজকের বাকি কাজসমূহ</h3>
                <p className="text-xs text-slate-500 mt-0.5">দৈনিক প্রায়োরিটি টাস্ক লিস্ট</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
                {incompleteTasks.length}টি কাজ বাকি
              </span>
            </div>

            <div className="space-y-2.5">
              {incompleteTasks.length > 0 ? (
                incompleteTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3.5 bg-slate-50/60 hover:bg-slate-50 rounded-xl border border-slate-200/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        task.priority === 'High' ? 'bg-rose-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-sky-500'
                      }`}></span>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{task.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          ক্যাটাগরি: <span className="text-slate-700 font-medium">{task.category}</span> • প্রায়োরিটি: <span className="text-slate-700 font-medium">{task.priority}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md flex-shrink-0 ${
                      task.status === 'InProgress' 
                        ? 'bg-sky-50 text-sky-700 border border-sky-200/80' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                    }`}>
                      {task.status === 'InProgress' ? 'চলছে' : 'শুরু হয়নি'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  আজকের সব কাজ সম্পন্ন হয়েছে! 👏
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button 
              onClick={() => setActiveTab('tasks')}
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <span>সব কাজ ও ডেইলি প্ল্যানার দেখুন</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Section 5: Recent Business Activity & CRM Overview */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">কাজের বর্তমান অবস্থা (CRM Overview)</h3>
                <p className="text-xs text-slate-500 mt-0.5">ক্লাইন্ট পাইপলাইন ও সম্ভাব্য চুক্তি</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                {activeLeads} জন সক্রিয় লিড
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70">
                <div className="text-xs text-slate-500 font-medium">অর্জিত ক্লায়েন্ট</div>
                <div className="text-xl font-bold text-slate-900 mt-1">{clientsWon} জন</div>
              </div>
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70">
                <div className="text-xs text-slate-500 font-medium">কথা চলছে (Negotiation)</div>
                <div className="text-xl font-bold text-emerald-600 mt-1">{activeLeads} জন</div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3.5 bg-slate-50/60 hover:bg-slate-50 rounded-xl border border-slate-200/70 transition-colors">
                <div>
                  <div className="text-sm font-semibold text-slate-800">আইডিয়াল মডেল স্কুল (Business Website)</div>
                  <div className="text-xs text-slate-500 mt-0.5">বাজেট: <span className="font-medium text-slate-700">৳১৫,০০০</span></div>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 border border-sky-200/80">
                  Negotiation
                </span>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-slate-50/60 hover:bg-slate-50 rounded-xl border border-slate-200/70 transition-colors">
                <div>
                  <div className="text-sm font-semibold text-slate-800">প্রোগ্রেস কোচিং সেন্টার (Landing Page)</div>
                  <div className="text-xs text-slate-500 mt-0.5">বাজেট: <span className="font-medium text-slate-700">৳৮,০০০</span></div>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  Advance Paid
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button 
              onClick={() => setActiveTab('crm')}
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <span>সেলস পাইপলাইনে যান</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Quick Answer Summary Component */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-sm mb-4 text-emerald-400">
          <HelpCircle className="w-4 h-4" />
          <span>এক নজরে আপনার ৫টি প্রধান প্রশ্নের উত্তর</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-3.5">
            <div className="text-[11px] text-slate-400 mb-1">১. এখন আমি কোথায় আছি?</div>
            <div className="text-xs font-semibold text-slate-200 leading-snug">Month 1 (পোর্টফোলিও ও ১ম ৩ ক্লায়েন্ট)</div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-3.5">
            <div className="text-[11px] text-slate-400 mb-1">২. এই মাসে কত আয় করেছি?</div>
            <div className="text-sm font-bold text-emerald-400">৳{totalIncome.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-3.5">
            <div className="text-[11px] text-slate-400 mb-1">৩. টার্গেটে পৌঁছাতে কত বাকি?</div>
            <div className="text-sm font-bold text-rose-400">৳{remainingTarget.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-3.5">
            <div className="text-[11px] text-slate-400 mb-1">৪. আজ কী কী কাজ করা দরকার?</div>
            <div className="text-xs font-semibold text-slate-200 leading-snug">{incompleteTasks.length}টি কাজ বাকি আছে</div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-3.5">
            <div className="text-[11px] text-slate-400 mb-1">৫. কতজন ক্লায়েন্টের কথা চলছে?</div>
            <div className="text-sm font-bold text-sky-400">{activeLeads} জন লিড সক্রিয়</div>
          </div>
        </div>
      </div>
    </div>
  );
}

