import React, { useState } from 'react';
import { Target, CheckCircle2, Clock, AlertTriangle, PlayCircle, Layers } from 'lucide-react';

export default function Plan({ planData, setPlanData }) {
  // Default Initial 90-Day Strategy Data based on prompt
  const initialMonths = [
    {
      id: 'm1',
      monthTitle: 'Month 1: প্রথম ক্লায়েন্ট অর্জন ও প্যাকেজ তৈরি',
      targetIncome: '৳৫৫,০০০ – ৳৬৫,০০০',
      newIncomeTarget: '৳১৫,০০০ – ৳২৫,০০০',
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
      monthTitle: 'Month 2: আউটরিচ জোরদার ও মেইনটেন্যান্স অফার',
      targetIncome: '৳৭০,০০০ – ৳৮৫,০০০',
      newIncomeTarget: '৳৩০,০০০ – ৳৪৫,০০০',
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
      monthTitle: 'Month 3: ৳১,০০,০০০+ ইনকাম ও রিকারিং ক্লায়েন্ট সিস্টেম',
      targetIncome: '৳১,০০,০০০+',
      newIncomeTarget: '৳৬০,০০০+',
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Done':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> সম্পন্ন (Done)</span>;
      case 'InProgress':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200"><Clock className="w-3.5 h-3.5" /> চলছে (In Progress)</span>;
      case 'Blocked':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200"><AlertTriangle className="w-3.5 h-3.5" /> আটকে আছে (Blocked)</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200"><PlayCircle className="w-3.5 h-3.5" /> শুরু হয়নি (Not Started)</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          🎯 ৯০ দিনের রোডম্যাপ ও অ্যাকশন প্ল্যান
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          মাসিক ১ লাখ+ আয় অর্জনের ৩ মাসের সুনির্দিষ্ট গোল ও সপ্তাহভিত্তিক ট্র্যাকার
        </p>
      </div>

      {/* Strategy Cards for 3 Months */}
      <div className="space-y-6">
        {months.map((month, idx) => (
          <div key={month.id} className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm">
            {/* Month Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold flex items-center justify-center text-base">
                  M{idx + 1}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{month.monthTitle}</h2>
                  <p className="text-xs text-slate-500 mt-0.5"><span className="font-semibold text-slate-700">প্রধান ফোকাস:</span> {month.focus}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-right">
                  <div className="text-[11px] text-slate-400 font-medium">টোটাল টার্গেট</div>
                  <div className="text-sm font-bold text-slate-800">{month.targetIncome}</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 text-right">
                  <div className="text-[11px] text-emerald-600 font-medium">নতুন আয় লক্ষ্য</div>
                  <div className="text-sm font-bold text-emerald-700">{month.newIncomeTarget}</div>
                </div>
              </div>
            </div>

            {/* Weeks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {month.weeks.map((week) => (
                <div key={week.id} className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-colors">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                        {week.week}
                      </span>
                      {getStatusBadge(week.status)}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-1 leading-snug">{week.title}</h3>
                    <p className="text-xs text-slate-500">{week.notes}</p>
                  </div>

                  {/* Quick Status Switcher */}
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-200/60">
                    <span className="text-[11px] text-slate-400 font-medium mr-1">স্ট্যাটাস বদলান:</span>
                    <button 
                      onClick={() => updateStatus(month.id, week.id, 'NotStarted')}
                      className={`text-[11px] px-2 py-0.5 rounded transition-colors ${week.status === 'NotStarted' ? 'bg-slate-700 text-white font-bold' : 'bg-white border text-slate-600 hover:bg-slate-100'}`}
                    >
                      Not Started
                    </button>
                    <button 
                      onClick={() => updateStatus(month.id, week.id, 'InProgress')}
                      className={`text-[11px] px-2 py-0.5 rounded transition-colors ${week.status === 'InProgress' ? 'bg-blue-600 text-white font-bold' : 'bg-white border text-slate-600 hover:bg-slate-100'}`}
                    >
                      In Progress
                    </button>
                    <button 
                      onClick={() => updateStatus(month.id, week.id, 'Done')}
                      className={`text-[11px] px-2 py-0.5 rounded transition-colors ${week.status === 'Done' ? 'bg-emerald-600 text-white font-bold' : 'bg-white border text-slate-600 hover:bg-slate-100'}`}
                    >
                      Done
                    </button>
                    <button 
                      onClick={() => updateStatus(month.id, week.id, 'Blocked')}
                      className={`text-[11px] px-2 py-0.5 rounded transition-colors ${week.status === 'Blocked' ? 'bg-rose-600 text-white font-bold' : 'bg-white border text-slate-600 hover:bg-slate-100'}`}
                    >
                      Blocked
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
