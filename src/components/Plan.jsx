import React, { useState, useMemo } from 'react';
import { 
  Target, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  PlayCircle, 
  TrendingUp, 
  Sparkles, 
  Filter, 
  Calendar, 
  ChevronRight, 
  Flag,
  Award,
  BarChart3,
  Layers,
  ArrowUpRight,
  Check
} from 'lucide-react';

export default function Plan({ planData, setPlanData }) {
  // Default Initial 90-Day Strategy Data
  const initialMonths = [
    {
      id: 'm1',
      monthNumber: 1,
      monthTitle: 'Month 1: প্রথম ক্লায়েন্ট অর্জন ও প্যাকেজ তৈরি',
      targetIncome: '৳৫৫,০০০ – ৳৬৫,০০০',
      newIncomeTarget: '৳১৫,০০০ – ৳২৫,০০০',
      color: 'emerald',
      focus: '৩টি পোর্টফোলিও/ডেমো ওয়েবসাইট তৈরি, সার্ভিস প্যাকেজ তৈরি, সম্ভাব্য ক্লায়েন্টদের সাথে আউটরিচ এবং প্রথম ২–৩ জন ক্লায়েন্ট অনবোর্ডিং।',
      weeks: [
        { id: 'm1w1', week: 'Week 1', title: '৩টি ডেমো ওয়েবসাইট তৈরি (স্কুল, কোচিং, লোকাল বিজনেস)', status: 'Done', notes: 'রেডিমেড পোর্টফোলিও লিংক প্রস্তুত করা' },
        { id: 'm1w2', week: 'Week 2', title: 'সার্ভিস প্যাকেজ প্রস্তুত ও আউটরিচ লিস্ট (৫০টি প্রতিষ্ঠান)', status: 'InProgress', notes: 'স্কুল ও ট্রেনিং ইনস্টিটিউট ফোকাস' },
        { id: 'm1w3', week: 'Week 3', title: 'প্রতিদিন ১০টি আউটরিচ/কোল্ড কল ও মিটিং বুকিং', status: 'InProgress', notes: 'প্রথম ক্লায়েন্ট অ্যাডভান্স পাওয়া' },
        { id: 'm1w4', week: 'Week 4', title: 'প্রথম ২ জন ক্লায়েন্টের প্রজেক্ট ডেলিভারি ও ইনভয়েস', status: 'NotStarted', notes: 'রিভিউ নেওয়া ও পোর্টফোলিওতে যোগ' }
      ]
    },
    {
      id: 'm2',
      monthNumber: 2,
      monthTitle: 'Month 2: আউটরিচ জোরদার ও মেইনটেন্যান্স অফার',
      targetIncome: '৳৭০,০০০ – ৳৮৫,০০০',
      newIncomeTarget: '৳৩০,০০০ – ৳৪৫,০০০',
      color: 'blue',
      focus: 'স্কুল, কোচিং সেন্টার, ট্রেনিং ইনস্টিটিউট ও স্থানীয় ব্যবসাকে টার্গেট করা। দৈনিক কন্টাক্ট চালিয়ে যাওয়া ও মাসিক মেইনটেন্যান্স অফার চালু করা।',
      weeks: [
        { id: 'm2w1', week: 'Week 5', title: 'স্কুল ও কোচিং সেন্টারের জন্য স্পেশাল প্যাকেজ ডেমো প্রদর্শন', status: 'NotStarted', notes: 'ডাইরেক্ট ভিজিট বা ইমেইল' },
        { id: 'm2w2', week: 'Week 6', title: '৩টি নতুন ওয়েবসাইট প্রজেক্ট কনফার্ম করা', status: 'NotStarted', notes: 'অ্যাডভান্স ৫০% পেমেন্ট নিশ্চিত করা' },
        { id: 'm2w3', week: 'Week 7', title: 'পুরাতন ক্লায়েন্টদের মাসিক ৳১,০০০-৳৩,০০০ মেইনটেন্যান্স প্রস্তাব', status: 'NotStarted', notes: 'ফিক্সড রিকারিং ইনকাম তৈরি' },
        { id: 'm2w4', week: 'Week 8', title: 'ক্লায়েন্ট প্রজেক্ট হ্যান্ডওভার ও লোকাল রেফারেল কালেকশন', status: 'NotStarted', notes: 'সন্তুষ্ট ক্লায়েন্ট রেফারেল' }
      ]
    },
    {
      id: 'm3',
      monthNumber: 3,
      monthTitle: 'Month 3: ৳১,০০,০০০+ ইনকাম ও রিকারিং ক্লায়েন্ট সিস্টেম',
      targetIncome: '৳১,০০,০০০+',
      newIncomeTarget: '৳৬০,০০০+',
      color: 'purple',
      focus: '৩+ ওয়েবসাইট প্রজেক্ট, ল্যান্ডিং পেজ ও স্মল জবস সম্পন্ন করা। রিকারিং মেইনটেন্যান্স ইনকাম মজবুত করে ৳১,০০,০০০+ স্থায়ী আয় নিশ্চিত করা।',
      weeks: [
        { id: 'm3w1', week: 'Week 9', title: 'হাই-ভ্যালু প্রফেশনাল ওয়েবসাইট প্যাকেজ (৳২০,০০০+) মার্কেটিং', status: 'NotStarted', notes: 'ই-কমার্স ও বড় বিজনেস ফোকাস' },
        { id: 'm3w2', week: 'Week 10', title: 'ফাস্ট টার্নঅ্যারাউন্ড ল্যান্ডিং পেজ ও ছোট ছোট কাজ নেওয়া', status: 'NotStarted', notes: 'দ্রুত ক্যাশ ফ্লো বাড়ানো' },
        { id: 'm3w3', week: 'Week 11', title: '৫+ মেইনটেন্যান্স ক্লায়েন্ট কনফার্ম করা (রিকারিং)', status: 'NotStarted', notes: 'প্রতি মাসে ফিক্সড ১৫-২০ হাজার' },
        { id: 'm3w4', week: 'Week 12', title: '৯০ দিনের গোল রিভিউ, লাভ-ক্ষতি বিশ্লেষণ ও পরবর্তী গোল সেট', status: 'NotStarted', notes: '১ লাখ+ মাসিক আয় কনফার্মেশন' }
      ]
    }
  ];

  const months = planData || initialMonths;
  const [activeMonthFilter, setActiveMonthFilter] = useState('all'); // 'all', 'm1', 'm2', 'm3'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'Done', 'InProgress', 'NotStarted', 'Blocked'

  const updateStatus = (monthId, weekId, newStatus) => {
    const updated = months.map(m => {
      if (m.id === monthId) {
        return {
          ...m,
          weeks: m.weeks.map(w => w.id === weekId ? { ...w, status: newStatus } : w)
        };
      }
      return m;
    });
    setPlanData(updated);
  };

  // Calculate Overall Statistics
  const stats = useMemo(() => {
    let totalWeeks = 0;
    let completedWeeks = 0;
    let inProgressWeeks = 0;
    let blockedWeeks = 0;
    let notStartedWeeks = 0;

    months.forEach(m => {
      m.weeks.forEach(w => {
        totalWeeks++;
        if (w.status === 'Done') completedWeeks++;
        else if (w.status === 'InProgress') inProgressWeeks++;
        else if (w.status === 'Blocked') blockedWeeks++;
        else notStartedWeeks++;
      });
    });

    const percent = Math.round((completedWeeks / (totalWeeks || 1)) * 100);
    return { totalWeeks, completedWeeks, inProgressWeeks, blockedWeeks, notStartedWeeks, percent };
  }, [months]);

  // Status badge generator
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Done':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            সম্পন্ন
          </span>
        );
      case 'InProgress':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs animate-pulse">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            চলছে
          </span>
        );
      case 'Blocked':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            আটকে আছে
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            <PlayCircle className="w-3.5 h-3.5 text-slate-400" />
            শুরু হয়নি
          </span>
        );
    }
  };

  // Filtered Months & Weeks
  const filteredMonths = useMemo(() => {
    return months
      .filter(m => activeMonthFilter === 'all' || m.id === activeMonthFilter)
      .map(m => {
        const matchingWeeks = m.weeks.filter(w => statusFilter === 'all' || w.status === statusFilter);
        const monthCompletedWeeks = m.weeks.filter(w => w.status === 'Done').length;
        const monthProgress = Math.round((monthCompletedWeeks / m.weeks.length) * 100);
        return {
          ...m,
          weeks: matchingWeeks,
          monthProgress,
          completedCount: monthCompletedWeeks,
          totalCount: m.weeks.length
        };
      });
  }, [months, activeMonthFilter, statusFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background glow graphics */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>এক্সিকিউটিভ ৯টি অ্যাকশন প্ল্যান</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              🎯 ৯০ দিনের রোডম্যাপ ও অ্যাকশন ট্র্যাকার
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl font-normal leading-relaxed">
              মাসিক <span className="font-semibold text-emerald-300">৳১,০০,০০০+ আয়</span> অর্জনের জন্য সুনির্দিষ্ট ১২টি সপ্তাহের ধাপে ধাপে নির্দেশিকা ও এক্সিকিউশন স্ট্যাটাস।
            </p>
          </div>

          {/* Overall Progress Widget */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 md:p-5 min-w-[280px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                সামগ্রিক অগ্রগতি
              </span>
              <span className="text-lg font-bold text-emerald-400">{stats.percent}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-700/60 rounded-full h-2.5 overflow-hidden mb-3">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${stats.percent}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-white/5 rounded-lg py-1.5 px-2">
                <div className="text-slate-400 text-[11px]">সম্পন্ন সপ্তাহ</div>
                <div className="font-bold text-white text-sm">{stats.completedWeeks} / {stats.totalWeeks}</div>
              </div>
              <div className="bg-white/5 rounded-lg py-1.5 px-2">
                <div className="text-slate-400 text-[11px]">চলমান কাজ</div>
                <div className="font-bold text-blue-300 text-sm">{stats.inProgressWeeks} টি</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">মোট টার্গেট</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900">৳১,০০,০০০+</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> ৩য় মাসের লক্ষ্যমাত্রা
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">সম্পন্ন (Done)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-emerald-700">{stats.completedWeeks} <span className="text-xs font-normal text-slate-400">টি সপ্তাহ</span></div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            মোট ১২ সপ্তাহের মধ্যে
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">চলমান (In Progress)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-blue-700">{stats.inProgressWeeks} <span className="text-xs font-normal text-slate-400">টি সপ্তাহ</span></div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">
            বর্তমান অ্যাকশন ফোকাস
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">আটকে আছে/বাকি</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-800">{stats.notStartedWeeks + stats.blockedWeeks} <span className="text-xs font-normal text-slate-400">টি সপ্তাহ</span></div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {stats.blockedWeeks > 0 ? `${stats.blockedWeeks}টি ব্লকেড চিহ্নিত` : 'পরবর্তী ধাপসমূহ'}
          </div>
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 md:space-y-0 md:flex md:items-center md:justify-between">
        {/* Month Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveMonthFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeMonthFilter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🗓️ সকল মাস (All Months)
          </button>
          {months.map(m => {
            const mCompleted = m.weeks.filter(w => w.status === 'Done').length;
            const mPercent = Math.round((mCompleted / m.weeks.length) * 100);
            return (
              <button
                key={m.id}
                onClick={() => setActiveMonthFilter(m.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeMonthFilter === m.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Month {m.monthNumber}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                  activeMonthFilter === m.id ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-700'
                }`}>
                  {mPercent}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Status Dropdown / Filter Pill */}
        <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">স্ট্যাটাস:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">সব দেখান (All Status)</option>
            <option value="Done">সম্পন্ন (Done)</option>
            <option value="InProgress">চলছে (In Progress)</option>
            <option value="NotStarted">শুরু হয়নি (Not Started)</option>
            <option value="Blocked">আটকে আছে (Blocked)</option>
          </select>
        </div>
      </div>

      {/* Main Timeline Month Sections */}
      <div className="space-y-8">
        {filteredMonths.map((month) => {
          const isEmerald = month.color === 'emerald';
          const isBlue = month.color === 'blue';
          const isPurple = month.color === 'purple';

          // Month-specific visual theme tokens
          const monthTheme = isEmerald ? {
            containerBg: 'bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 border-emerald-200/90 shadow-emerald-900/5',
            headerBg: 'bg-gradient-to-r from-emerald-900/5 via-teal-900/5 to-emerald-600/10 border-b border-emerald-100',
            badgeBg: 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-emerald-500/20 shadow-sm',
            pillTag: 'bg-emerald-100/90 text-emerald-800 border-emerald-200',
            targetBadge: 'bg-white/80 border-emerald-200 text-slate-800',
            incomeBadge: 'bg-emerald-100/80 border-emerald-300 text-emerald-900',
            progressBarBg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
          } : isBlue ? {
            containerBg: 'bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/40 border-blue-200/90 shadow-blue-900/5',
            headerBg: 'bg-gradient-to-r from-blue-900/5 via-indigo-900/5 to-sky-600/10 border-b border-blue-100',
            badgeBg: 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-500/20 shadow-sm',
            pillTag: 'bg-blue-100/90 text-blue-800 border-blue-200',
            targetBadge: 'bg-white/80 border-blue-200 text-slate-800',
            incomeBadge: 'bg-blue-100/80 border-blue-300 text-blue-900',
            progressBarBg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
          } : {
            containerBg: 'bg-gradient-to-br from-purple-50/80 via-white to-fuchsia-50/40 border-purple-200/90 shadow-purple-900/5',
            headerBg: 'bg-gradient-to-r from-purple-900/5 via-fuchsia-900/5 to-amber-600/10 border-b border-purple-100',
            badgeBg: 'bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white shadow-purple-500/20 shadow-sm',
            pillTag: 'bg-purple-100/90 text-purple-800 border-purple-200',
            targetBadge: 'bg-white/80 border-purple-200 text-slate-800',
            incomeBadge: 'bg-purple-100/80 border-purple-300 text-purple-900',
            progressBarBg: 'bg-gradient-to-r from-purple-500 to-fuchsia-500',
          };

          return (
            <div 
              key={month.id} 
              className={`border rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden ${monthTheme.containerBg}`}
            >
              {/* Month Card Header */}
              <div className={`p-5 md:p-6 ${monthTheme.headerBg}`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left Info */}
                  <div className="flex items-start gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl ${monthTheme.badgeBg} font-black flex items-center justify-center text-lg shrink-0`}>
                      M{month.monthNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg md:text-xl font-bold text-slate-900">{month.monthTitle}</h2>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${monthTheme.pillTag}`}>
                          {month.completedCount}/{month.totalCount} সপ্তাহ শেষ
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-3xl">
                        <strong className="text-slate-800 font-semibold">প্রধান ফোকাস:</strong> {month.focus}
                      </p>
                    </div>
                  </div>

                  {/* Right Income Badges & Month Progress */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start lg:self-auto shrink-0">
                    <div className={`rounded-2xl px-3.5 py-2 text-left sm:text-right shadow-2xs min-w-[130px] border ${monthTheme.targetBadge}`}>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">টোটাল টার্গেট</div>
                      <div className="text-sm font-extrabold text-slate-800">{month.targetIncome}</div>
                    </div>
                    <div className={`rounded-2xl px-3.5 py-2 text-left sm:text-right shadow-2xs min-w-[130px] border ${monthTheme.incomeBadge}`}>
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">নতুন আয় লক্ষ্য</div>
                      <div className="text-sm font-extrabold">{month.newIncomeTarget}</div>
                    </div>
                  </div>
                </div>

                {/* Month Progress Bar */}
                <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">মাসিক অগ্রগতি:</span>
                  <div className="grow bg-slate-200/80 rounded-full h-2 overflow-hidden shadow-inner">
                    <div 
                      className={`${monthTheme.progressBarBg} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${month.monthProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-800 w-9 text-right">{month.monthProgress}%</span>
                </div>
              </div>

              {/* Weeks Cards Grid */}
              <div className="p-5 md:p-6">
                {month.weeks.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs italic">
                    এই ফিল্টারে কোন কাজ পাওয়া যায়নি।
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {month.weeks.map((week) => {
                      const isDone = week.status === 'Done';
                      const isInProgress = week.status === 'InProgress';
                      const isBlocked = week.status === 'Blocked';

                      const cardBorder = isDone 
                        ? 'border-emerald-200 bg-emerald-50/30' 
                        : isInProgress 
                        ? 'border-blue-200 bg-blue-50/20' 
                        : isBlocked
                        ? 'border-rose-200 bg-rose-50/20'
                        : 'border-slate-200/90 bg-white';

                      return (
                        <div 
                          key={week.id} 
                          className={`border rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-md ${cardBorder}`}
                        >
                          <div>
                            {/* Card Top Bar */}
                            <div className="flex justify-between items-center mb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
                                  {week.week}
                                </span>
                                {/* Checkbox Quick Toggle */}
                                <button
                                  onClick={() => updateStatus(month.id, week.id, isDone ? 'NotStarted' : 'Done')}
                                  title={isDone ? 'মার্ক নট স্টার্টেড' : 'মার্ক কমপ্লিট'}
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                    isDone 
                                      ? 'bg-emerald-600 text-white shadow-xs' 
                                      : 'border border-slate-300 text-transparent hover:border-emerald-500 hover:text-emerald-500'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </button>
                              </div>
                              {renderStatusBadge(week.status)}
                            </div>

                            {/* Task Title */}
                            <h3 className={`text-sm font-bold leading-snug mb-1.5 ${isDone ? 'text-slate-600 line-through' : 'text-slate-900'}`}>
                              {week.title}
                            </h3>

                            {/* Notes / Action Hint */}
                            {week.notes && (
                              <p className="text-xs text-slate-500 bg-white/70 border border-slate-100 rounded-xl px-2.5 py-1.5 inline-block mt-1">
                                📌 <span className="font-medium">{week.notes}</span>
                              </p>
                            )}
                          </div>

                          {/* Quick Interactive Status Selector */}
                          <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-semibold text-slate-400">স্ট্যাটাস বদলান:</span>
                            </div>
                            <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
                              {/* Not Started Button */}
                              <button
                                onClick={() => updateStatus(month.id, week.id, 'NotStarted')}
                                title="কাজটি এখনও শুরু হয়নি (ক্লিক করে পরিবর্তন করা যাবে)"
                                className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl transition-all duration-200 flex items-center gap-1 ${
                                  week.status === 'NotStarted'
                                    ? 'bg-slate-800 text-white shadow-xs scale-102 ring-1 ring-slate-700'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                }`}
                              >
                                <PlayCircle className={`w-3 h-3 ${week.status === 'NotStarted' ? 'text-slate-300' : 'text-slate-400'}`} />
                                <span>বাকি</span>
                              </button>

                              {/* In Progress Button */}
                              <button
                                onClick={() => updateStatus(month.id, week.id, 'InProgress')}
                                title="কাজটি বর্তমানে চলছে (ক্লিক করে স্ট্যাটাস পরিবর্তন করুন)"
                                className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl transition-all duration-200 flex items-center gap-1 ${
                                  week.status === 'InProgress'
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs shadow-blue-500/30 scale-102 ring-1 ring-blue-500'
                                    : 'text-slate-600 hover:text-blue-600 hover:bg-white/60'
                                }`}
                              >
                                <Clock className={`w-3 h-3 ${week.status === 'InProgress' ? 'text-blue-200 animate-spin-slow' : 'text-slate-400'}`} />
                                <span>চলছে</span>
                              </button>

                              {/* Done Button */}
                              <button
                                onClick={() => updateStatus(month.id, week.id, 'Done')}
                                title="কাজটি সম্পন্ন হয়েছে (ভুল হলে পুনরায় অন্য বাটনে চাপুন)"
                                className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl transition-all duration-200 flex items-center gap-1 ${
                                  week.status === 'Done'
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs shadow-emerald-500/30 scale-102 ring-1 ring-emerald-500'
                                    : 'text-slate-600 hover:text-emerald-600 hover:bg-white/60'
                                }`}
                              >
                                <CheckCircle2 className={`w-3 h-3 ${week.status === 'Done' ? 'text-emerald-200' : 'text-slate-400'}`} />
                                <span>সম্পন্ন</span>
                              </button>

                              {/* Blocked Button */}
                              <button
                                onClick={() => updateStatus(month.id, week.id, 'Blocked')}
                                title="কোন সমস্যা বা বাধা থাকলে চিহ্নিত করুন"
                                className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl transition-all duration-200 flex items-center gap-1 ${
                                  week.status === 'Blocked'
                                    ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-xs shadow-rose-500/30 scale-102 ring-1 ring-rose-500'
                                    : 'text-slate-600 hover:text-rose-600 hover:bg-white/60'
                                }`}
                              >
                                <AlertTriangle className={`w-3 h-3 ${week.status === 'Blocked' ? 'text-rose-200' : 'text-slate-400'}`} />
                                <span>সমস্যা</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

