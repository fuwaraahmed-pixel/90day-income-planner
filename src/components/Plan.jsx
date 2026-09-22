import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlayCircle,
  Sparkles,
  Filter,
  BarChart3,
  Check,
  Pencil,
  X,
  Save,
  PlusCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  LayoutTemplate,
} from 'lucide-react';

// Bengali numeral converter
const toBengaliNum = (n) => String(n).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);

// ─── Default Templates ───────────────────────────────────────────────
const TEMPLATES = {
  freelancer: {
    label: '💻 ফ্রিল্যান্সার / ওয়েব ডেভেলপার',
    months: [
      {
        id: 'm1', monthNumber: 1,
        monthTitle: 'মাস-১: প্রথম ক্লায়েন্ট অর্জন ও প্যাকেজ তৈরি',
        targetIncome: '৳৫৫,০০০ – ৳৬৫,০০০',
        newIncomeTarget: '৳১৫,০০০ – ৳২৫,০০০',
        color: 'emerald',
        focus: '৩টি পোর্টফোলিও/ডেমো ওয়েবসাইট তৈরি, সার্ভিস প্যাকেজ তৈরি, প্রথম ২–৩ জন ক্লায়েন্ট অনবোর্ডিং।',
        weeks: [
          { id: 'm1w1', week: 'Week 1', title: '৩টি ডেমো ওয়েবসাইট তৈরি', status: 'Done', notes: 'রেডিমেড পোর্টফোলিও লিংক প্রস্তুত' },
          { id: 'm1w2', week: 'Week 2', title: 'সার্ভিস প্যাকেজ ও আউটরিচ লিস্ট (৫০টি)', status: 'InProgress', notes: 'স্কুল ও ট্রেনিং ইনস্টিটিউট ফোকাস' },
          { id: 'm1w3', week: 'Week 3', title: 'প্রতিদিন ১০টি আউটরিচ/কোল্ড কল', status: 'InProgress', notes: 'প্রথম ক্লায়েন্ট অ্যাডভান্স পাওয়া' },
          { id: 'm1w4', week: 'Week 4', title: 'প্রথম ২ জন ক্লায়েন্টের প্রজেক্ট ডেলিভারি', status: 'NotStarted', notes: 'রিভিউ নেওয়া ও পোর্টফোলিওতে যোগ' },
        ],
      },
      {
        id: 'm2', monthNumber: 2,
        monthTitle: 'মাস-২: আউটরিচ জোরদার ও মেইনটেন্যান্স অফার',
        targetIncome: '৳৭০,০০০ – ৳৮৫,০০০',
        newIncomeTarget: '৳৩০,০০০ – ৳৪৫,০০০',
        color: 'blue',
        focus: 'স্কুল, কোচিং সেন্টার, ট্রেনিং ইনস্টিটিউট টার্গেট করা। মাসিক মেইনটেন্যান্স অফার চালু করা।',
        weeks: [
          { id: 'm2w1', week: 'Week 5', title: 'স্কুল ও কোচিং সেন্টারে ডেমো প্রদর্শন', status: 'NotStarted', notes: 'ডাইরেক্ট ভিজিট বা ইমেইল' },
          { id: 'm2w2', week: 'Week 6', title: '৩টি নতুন ওয়েবসাইট প্রজেক্ট কনফার্ম', status: 'NotStarted', notes: 'অ্যাডভান্স ৫০% পেমেন্ট নিশ্চিত' },
          { id: 'm2w3', week: 'Week 7', title: 'পুরাতন ক্লায়েন্টদের মাসিক মেইনটেন্যান্স অফার', status: 'NotStarted', notes: 'ফিক্সড রিকারিং ইনকাম তৈরি' },
          { id: 'm2w4', week: 'Week 8', title: 'প্রজেক্ট হ্যান্ডওভার ও রেফারেল কালেকশন', status: 'NotStarted', notes: 'সন্তুষ্ট ক্লায়েন্ট রেফারেল' },
        ],
      },
      {
        id: 'm3', monthNumber: 3,
        monthTitle: 'মাস-৩: ৳১,০০,০০০+ ইনকাম ও রিকারিং সিস্টেম',
        targetIncome: '৳১,০০,০০০+',
        newIncomeTarget: '৳৬০,০০০+',
        color: 'purple',
        focus: 'হাই-ভ্যালু ক্লায়েন্ট, ল্যান্ডিং পেজ ও রিকারিং মেইনটেন্যান্স ইনকাম মজবুত করা।',
        weeks: [
          { id: 'm3w1', week: 'Week 9', title: 'হাই-ভ্যালু প্যাকেজ (৳২০,০০০+) মার্কেটিং', status: 'NotStarted', notes: 'ই-কমার্স ও বড় বিজনেস ফোকাস' },
          { id: 'm3w2', week: 'Week 10', title: 'ফাস্ট টার্নঅ্যারাউন্ড ল্যান্ডিং পেজ', status: 'NotStarted', notes: 'দ্রুত ক্যাশ ফ্লো বাড়ানো' },
          { id: 'm3w3', week: 'Week 11', title: '৫+ মেইনটেন্যান্স ক্লায়েন্ট কনফার্ম', status: 'NotStarted', notes: 'প্রতি মাসে ফিক্সড ১৫-২০ হাজার' },
          { id: 'm3w4', week: 'Week 12', title: '৯০ দিনের গোল রিভিউ ও পরবর্তী গোল সেট', status: 'NotStarted', notes: '১ লাখ+ মাসিক আয় কনফার্মেশন' },
        ],
      },
    ],
  },
  tuition: {
    label: '📚 টিউশন / কোচিং সেন্টার',
    months: [
      {
        id: 'm1', monthNumber: 1,
        monthTitle: 'মাস-১: স্টুডেন্ট ভর্তি ও বেসিক সেটআপ',
        targetIncome: '৳৩০,০০০ – ৳৪০,০০০',
        newIncomeTarget: '৳১০,০০০ – ৳২০,০০০',
        color: 'emerald',
        focus: 'এলাকায় প্রচার চালানো, প্রথম ব্যাচ তৈরি ও পাঠ্যক্রম প্রস্তুত করা।',
        weeks: [
          { id: 'm1w1', week: 'Week 1', title: 'লিফলেট ও সোশ্যাল মিডিয়া প্রচার', status: 'NotStarted', notes: 'ফেসবুক গ্রুপ ও পাড়ায় পোস্টার' },
          { id: 'm1w2', week: 'Week 2', title: 'প্রথম ১০ জন স্টুডেন্ট ভর্তি', status: 'NotStarted', notes: 'বিনামূল্যে ট্রায়াল ক্লাস দেওয়া' },
          { id: 'm1w3', week: 'Week 3', title: 'পাঠ্যক্রম ও রুটিন চূড়ান্ত করা', status: 'NotStarted', notes: 'ছাত্রদের সুবিধামতো সময়সূচি' },
          { id: 'm1w4', week: 'Week 4', title: 'প্রথম মাসের ফি সংগ্রহ', status: 'NotStarted', notes: 'সঠিক হিসাব রাখা' },
        ],
      },
      {
        id: 'm2', monthNumber: 2,
        monthTitle: 'মাস-২: স্টুডেন্ট বাড়ানো ও অনলাইন ক্লাস চালু',
        targetIncome: '৳৫০,০০০ – ৳৬০,০০০',
        newIncomeTarget: '৳২০,০০০ – ৳৩০,০০০',
        color: 'blue',
        focus: 'রেফারেলের মাধ্যমে নতুন স্টুডেন্ট, অনলাইন ব্যাচ চালু ও নোট/সিট প্যাক বিক্রি।',
        weeks: [
          { id: 'm2w1', week: 'Week 5', title: 'রেফারেল অফার চালু (বন্ধু আনলে ছাড়)', status: 'NotStarted', notes: 'মুখে মুখে মার্কেটিং' },
          { id: 'm2w2', week: 'Week 6', title: 'অনলাইন ব্যাচ শুরু (Zoom/Google Meet)', status: 'NotStarted', notes: 'দূরে থাকা ছাত্রদের জন্য' },
          { id: 'm2w3', week: 'Week 7', title: 'হ্যান্ডনোট / প্রিন্টেড গাইড বিক্রি', status: 'NotStarted', notes: 'অতিরিক্ত ইনকাম' },
          { id: 'm2w4', week: 'Week 8', title: 'পরীক্ষামূলক টেস্ট ও ফলাফল বিশ্লেষণ', status: 'NotStarted', notes: 'রেজাল্ট ভালো হলে রেপুটেশন বাড়বে' },
        ],
      },
      {
        id: 'm3', monthNumber: 3,
        monthTitle: 'মাস-৩: স্থায়ী আয় ও ব্র্যান্ড তৈরি',
        targetIncome: '৳৭০,০০০ – ৳১,০০,০০০',
        newIncomeTarget: '৳৪০,০০০+',
        color: 'purple',
        focus: 'সুনাম তৈরি করে বড় ব্যাচ ও অভিভাবকদের আস্থা অর্জন করা।',
        weeks: [
          { id: 'm3w1', week: 'Week 9', title: 'অভিভাবক সভা ও রেজাল্ট শেয়ার', status: 'NotStarted', notes: 'বিশ্বাস তৈরি করুন' },
          { id: 'm3w2', week: 'Week 10', title: 'সরকারি পরীক্ষার বিশেষ কোর্স চালু', status: 'NotStarted', notes: 'SSC, HSC, BCS ব্যাচ' },
          { id: 'm3w3', week: 'Week 11', title: 'নিয়মিত ছাত্রদের বার্ষিক প্যাকেজ অফার', status: 'NotStarted', notes: 'ডিসকাউন্টে ১ বছরের চুক্তি' },
          { id: 'm3w4', week: 'Week 12', title: '৯০ দিনের রিভিউ ও পরবর্তী পরিকল্পনা', status: 'NotStarted', notes: 'স্থায়ী ইনকাম কনফার্মেশন' },
        ],
      },
    ],
  },
  ecommerce: {
    label: '🛒 ই-কমার্স / অনলাইন বিজনেস',
    months: [
      {
        id: 'm1', monthNumber: 1,
        monthTitle: 'মাস-১: প্রোডাক্ট সেটআপ ও প্রথম সেল',
        targetIncome: '৳৪০,০০০ – ৳৫০,০০০',
        newIncomeTarget: '৳১০,০০০ – ৳২০,০০০',
        color: 'emerald',
        focus: 'পণ্য নির্বাচন, পেজ তৈরি, প্রথম অর্ডার পাওয়া ও কাস্টমার রিভিউ সংগ্রহ।',
        weeks: [
          { id: 'm1w1', week: 'Week 1', title: 'ফেসবুক পেজ ও বিকাশ/নগদ পেমেন্ট সেটআপ', status: 'NotStarted', notes: 'প্রফেশনাল লুক দিন' },
          { id: 'm1w2', week: 'Week 2', title: 'প্রথম ৫টি প্রোডাক্ট পোস্ট করা', status: 'NotStarted', notes: 'ভালো ছবি ও দাম দিন' },
          { id: 'm1w3', week: 'Week 3', title: 'ফেসবুক বুস্ট ও বন্ধুদের শেয়ার', status: 'NotStarted', notes: '৳৫০০ বাজেটে বুস্ট করুন' },
          { id: 'm1w4', week: 'Week 4', title: 'প্রথম ১০টি অর্ডার ডেলিভারি', status: 'NotStarted', notes: 'দ্রুত ডেলিভারি দিন' },
        ],
      },
      {
        id: 'm2', monthNumber: 2,
        monthTitle: 'মাস-২: বিক্রি বাড়ানো ও নতুন পণ্য',
        targetIncome: '৳৬০,০০০ – ৳৭৫,০০০',
        newIncomeTarget: '৳২৫,০০০ – ৳৩৫,০০০',
        color: 'blue',
        focus: 'নিয়মিত পোস্ট, বুস্ট, কাস্টমার সার্ভিস ও নতুন পণ্য যোগ করা।',
        weeks: [
          { id: 'm2w1', week: 'Week 5', title: 'প্রতিদিন ১টি প্রোডাক্ট পোস্ট', status: 'NotStarted', notes: 'নিয়মিত পেজ এক্টিভ রাখুন' },
          { id: 'm2w2', week: 'Week 6', title: '৫টি নতুন প্রোডাক্ট যোগ করা', status: 'NotStarted', notes: 'চাহিদা অনুযায়ী পণ্য' },
          { id: 'm2w3', week: 'Week 7', title: 'পুরাতন কাস্টমারকে অফার/কুপন দেওয়া', status: 'NotStarted', notes: 'রিপিট অর্ডার পাওয়া' },
          { id: 'm2w4', week: 'Week 8', title: 'রিভিউ সংগ্রহ ও পেজে পোস্ট করা', status: 'NotStarted', notes: 'বিশ্বাসযোগ্যতা বাড়ানো' },
        ],
      },
      {
        id: 'm3', monthNumber: 3,
        monthTitle: 'মাস-৩: ৳১,০০,০০০+ টার্গেট ও ব্র্যান্ড তৈরি',
        targetIncome: '৳১,০০,০০০+',
        newIncomeTarget: '৳৫০,০০০+',
        color: 'purple',
        focus: 'হোলসেল/রিসেলার নেটওয়ার্ক, ওয়েবসাইট চালু ও বড় অর্ডার পাওয়া।',
        weeks: [
          { id: 'm3w1', week: 'Week 9', title: 'রিসেলার প্রোগ্রাম চালু', status: 'NotStarted', notes: 'অন্যরা বিক্রি করলে কমিশন' },
          { id: 'm3w2', week: 'Week 10', title: 'অফিসিয়াল ওয়েবসাইট চালু', status: 'NotStarted', notes: 'SEO ও অনলাইন অর্ডার' },
          { id: 'm3w3', week: 'Week 11', title: 'বড় অর্ডার/কর্পোরেট সেল', status: 'NotStarted', notes: 'অফিস ও প্রতিষ্ঠানকে টার্গেট' },
          { id: 'm3w4', week: 'Week 12', title: '৯০ দিনের রিভিউ ও পরবর্তী পরিকল্পনা', status: 'NotStarted', notes: '১ লাখ+ মাসিক আয় কনফার্মেশন' },
        ],
      },
    ],
  },
};

// ─── Color Theme Tokens ──────────────────────────────────────────────
const getTheme = (color) => {
  if (color === 'blue') return {
    badge: 'from-blue-600 to-indigo-600',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    bar: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    pill: 'bg-blue-100 text-blue-800 border-blue-200',
    income: 'bg-blue-50 border-blue-200 text-blue-900',
  };
  if (color === 'purple') return {
    badge: 'from-purple-600 to-fuchsia-600',
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    bar: 'bg-gradient-to-r from-purple-500 to-fuchsia-500',
    pill: 'bg-purple-100 text-purple-800 border-purple-200',
    income: 'bg-purple-50 border-purple-200 text-purple-900',
  };
  return {
    badge: 'from-emerald-600 to-teal-600',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    bar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    pill: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    income: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  };
};

const uid = () => Math.random().toString(36).slice(2, 9);

// ─── Status Badge ─────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    Done:       { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'সম্পন্ন' },
    InProgress: { cls: 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse', icon: <Clock className="w-3.5 h-3.5" />, label: 'চলছে' },
    Blocked:    { cls: 'bg-rose-100 text-rose-700 border-rose-200', icon: <AlertTriangle className="w-3.5 h-3.5" />, label: 'সমস্যা' },
    NotStarted: { cls: 'bg-slate-100 text-slate-600 border-slate-200', icon: <PlayCircle className="w-3.5 h-3.5" />, label: 'বাকি' },
  };
  const s = map[status] || map.NotStarted;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}>
      {s.icon}{s.label}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────
export default function Plan({ planData, setPlanData }) {
  const months = planData || TEMPLATES.freelancer.months;

  const [activeMonthFilter, setActiveMonthFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editMode, setEditMode] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState({});

  const save = (updated) => setPlanData(updated);

  const updateStatus = (monthId, weekId, newStatus) => {
    save(months.map(m =>
      m.id === monthId
        ? { ...m, weeks: m.weeks.map(w => w.id === weekId ? { ...w, status: newStatus } : w) }
        : m
    ));
  };

  const updateMonthField = (monthId, field, value) => {
    save(months.map(m => m.id === monthId ? { ...m, [field]: value } : m));
  };

  const addMonth = () => {
    const n = months.length + 1;
    const colors = ['emerald', 'blue', 'purple', 'teal', 'rose'];
    save([...months, {
      id: uid(), monthNumber: n,
      monthTitle: `মাস-${toBengaliNum(n)}: নতুন মাসের লক্ষ্য`,
      targetIncome: '৳০', newIncomeTarget: '৳০',
      color: colors[(n - 1) % colors.length],
      focus: 'এই মাসের প্রধান ফোকাস লিখুন।',
      weeks: [{ id: uid(), week: `Week ${(n - 1) * 4 + 1}`, title: 'নতুন কাজ', status: 'NotStarted', notes: '' }],
    }]);
  };

  const deleteMonth = (monthId) => {
    if (months.length <= 1) return;
    if (window.confirm('এই মাস মুছে ফেলবেন?')) save(months.filter(m => m.id !== monthId));
  };

  const addWeek = (monthId) => {
    save(months.map(m => {
      if (m.id !== monthId) return m;
      const next = m.weeks.length + 1;
      return { ...m, weeks: [...m.weeks, { id: uid(), week: `Week ${next}`, title: 'নতুন কাজ লিখুন', status: 'NotStarted', notes: '' }] };
    }));
  };

  const updateWeekField = (monthId, weekId, field, value) => {
    save(months.map(m =>
      m.id === monthId
        ? { ...m, weeks: m.weeks.map(w => w.id === weekId ? { ...w, [field]: value } : w) }
        : m
    ));
  };

  const deleteWeek = (monthId, weekId) => {
    save(months.map(m => {
      if (m.id !== monthId) return m;
      if (m.weeks.length <= 1) return m;
      return { ...m, weeks: m.weeks.filter(w => w.id !== weekId) };
    }));
  };

  const loadTemplate = (key) => {
    if (window.confirm('টেমপ্লেট লোড করলে বর্তমান প্ল্যান রিসেট হবে। নিশ্চিত?')) {
      save(TEMPLATES[key].months);
      setShowTemplates(false);
    }
  };

  const stats = useMemo(() => {
    let total = 0, done = 0, inProgress = 0, blocked = 0;
    months.forEach(m => m.weeks.forEach(w => {
      total++;
      if (w.status === 'Done') done++;
      else if (w.status === 'InProgress') inProgress++;
      else if (w.status === 'Blocked') blocked++;
    }));
    return { total, done, inProgress, blocked, notStarted: total - done - inProgress - blocked, percent: Math.round((done / (total || 1)) * 100) };
  }, [months]);

  const filteredMonths = useMemo(() =>
    months
      .filter(m => activeMonthFilter === 'all' || m.id === activeMonthFilter)
      .map(m => {
        const doneCount = m.weeks.filter(w => w.status === 'Done').length;
        return {
          ...m,
          weeks: m.weeks.filter(w => statusFilter === 'all' || w.status === statusFilter),
          monthProgress: Math.round((doneCount / m.weeks.length) * 100),
          completedCount: doneCount,
        };
      }),
    [months, activeMonthFilter, statusFilter]
  );

  const toggleExpand = (id) => setExpandedMonths(p => ({ ...p, [id]: p[id] === false ? true : false }));
  const isExpanded = (id) => expandedMonths[id] !== false;

  return (
    <div className="space-y-4 pb-12 max-w-5xl mx-auto">

      {/* ══ HEADER BANNER ══ */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">

          {/* Left: Title */}
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] sm:text-xs font-semibold mb-2">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>৯০-দিনের অ্যাকশন প্ল্যান</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 leading-tight break-words mt-1">
              🎯 আমার ৯০ দিনের রোডম্যাপ
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed max-w-md">
              প্রতিটি সপ্তাহের কাজ ট্র্যাক করুন ও স্ট্যাটাস আপডেট করুন।
            </p>
          </div>

          {/* Right: Progress Widget */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 sm:p-5 w-full sm:w-64 sm:shrink-0 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                <span>সামগ্রিক অগ্রগতি</span>
              </span>
              <span className="text-base sm:text-lg font-bold text-emerald-600">{stats.percent}%</span>
            </div>
            <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden mb-4">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${stats.percent}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white rounded-lg py-1.5 border border-slate-200/60 shadow-xs">
                <div className="text-[10px] text-slate-500">সম্পন্ন</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900">{stats.done}</div>
              </div>
              <div className="bg-white rounded-lg py-1.5 border border-slate-200/60 shadow-xs">
                <div className="text-[10px] text-slate-500">চলছে</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900">{stats.inProgress}</div>
              </div>
              <div className="bg-white rounded-lg py-1.5 border border-slate-200/60 shadow-xs">
                <div className="text-[10px] text-slate-500">বাকি</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900">{stats.notStarted}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ ACTION BAR ══ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex flex-col gap-2.5">
        {/* Row 1: Month filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveMonthFilter('all')}
            className={`h-8 px-3 rounded-xl text-xs font-semibold transition-all whitespace-nowrap touch-manipulation ${
              activeMonthFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300'
            }`}>
            🗓️ সব মাস
          </button>
          {months.map((m, idx) => (
            <button key={m.id}
              onClick={() => setActiveMonthFilter(m.id)}
              className={`h-8 px-3 rounded-xl text-xs font-semibold transition-all whitespace-nowrap touch-manipulation ${
                activeMonthFilter === m.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300'
              }`}>
              মাস-{toBengaliNum(m.monthNumber ?? idx + 1)}
            </button>
          ))}
        </div>

        {/* Row 2: Controls */}
        <div className="flex items-center gap-2 flex-wrap border-t border-slate-100 pt-2.5">
          {/* Status filter */}
          <div className="flex items-center gap-1.5 flex-1 min-w-[160px]">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="flex-1 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 touch-manipulation">
              <option value="all">সব স্ট্যাটাস</option>
              <option value="Done">✅ সম্পন্ন</option>
              <option value="InProgress">🔵 চলছে</option>
              <option value="NotStarted">⬜ বাকি</option>
              <option value="Blocked">🔴 সমস্যা</option>
            </select>
          </div>

          {/* Template button */}
          <button
            onClick={() => setShowTemplates(v => !v)}
            className="h-9 flex items-center gap-1.5 px-3 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 transition-all border border-slate-200 touch-manipulation whitespace-nowrap">
            <LayoutTemplate className="w-3.5 h-3.5 shrink-0" />
            <span>টেমপ্লেট</span>
          </button>

          {/* Edit toggle */}
          <button
            onClick={() => setEditMode(v => !v)}
            className={`h-9 flex items-center gap-1.5 px-3 rounded-xl text-xs font-semibold transition-all border touch-manipulation whitespace-nowrap ${
              editMode ? 'bg-amber-500 text-white border-amber-500 active:bg-amber-600' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 active:bg-slate-300'
            }`}>
            {editMode
              ? <><Save className="w-3.5 h-3.5 shrink-0" /><span>সম্পাদনা শেষ</span></>
              : <><Pencil className="w-3.5 h-3.5 shrink-0" /><span>প্ল্যান ইডিট করুন</span></>}
          </button>
        </div>
      </div>

      {/* ══ TEMPLATE PICKER ══ */}
      {showTemplates && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-snug">📋 একটি টেমপ্লেট বেছে নিন</h3>
            <button
              onClick={() => setShowTemplates(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0 touch-manipulation">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            আপনার পেশা অনুযায়ী টেমপ্লেট বেছে নিন। লোড করার পর &quot;প্ল্যান ইডিট করুন&quot; দিয়ে কাস্টমাইজ করুন।
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(TEMPLATES).map(([key, tmpl]) => (
              <button key={key} onClick={() => loadTemplate(key)}
                className="text-left p-3 sm:p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 active:bg-emerald-100 transition-all group touch-manipulation">
                <div className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-emerald-700 leading-snug">{tmpl.label}</div>
                <div className="text-[11px] sm:text-xs text-slate-500 mt-1">{tmpl.months.length} মাস · {tmpl.months.reduce((s, m) => s + m.weeks.length, 0)} সপ্তাহ</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ EDIT MODE NOTICE ══ */}
      {editMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-3.5 flex items-start gap-2.5">
          <Pencil className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-amber-800 font-medium leading-relaxed">
            <strong>সম্পাদনা মোড চালু।</strong> মাসের টাইটেল, ইনকাম টার্গেট, ফোকাস এবং সপ্তাহের কাজ পরিবর্তন করুন। শেষে &quot;সম্পাদনা শেষ&quot; বাটনে চাপুন।
          </p>
        </div>
      )}

      {/* ══ MONTH CARDS ══ */}
      <div className="space-y-3 sm:space-y-4">
        {filteredMonths.map((month) => {
          const t = getTheme(month.color);
          const expanded = isExpanded(month.id);

          return (
            <div key={month.id} className={`border-2 ${t.border} rounded-2xl overflow-hidden shadow-sm bg-white`}>

              {/* Month Header */}
              <div className={`${t.bg} px-3 sm:px-5 py-3 sm:py-4`}>
                <div className="flex items-start gap-2.5 sm:gap-3">

                  {/* Month badge */}
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${t.badge} text-white flex items-center justify-center text-xs sm:text-sm font-black shrink-0 shadow-sm`}>
                    {toBengaliNum(month.monthNumber ?? (filteredMonths.indexOf(month) + 1))}
                  </div>

                  {/* Month info */}
                  <div className="flex-1 min-w-0">
                    {editMode ? (
                      <input
                        value={month.monthTitle}
                        onChange={e => updateMonthField(month.id, 'monthTitle', e.target.value)}
                        className="w-full text-sm sm:text-base font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 mb-2"
                        placeholder="মাসের শিরোনাম"
                      />
                    ) : (
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug break-words">
                        {month.monthTitle}
                      </h2>
                    )}

                    {editMode ? (
                      <textarea
                        value={month.focus}
                        onChange={e => updateMonthField(month.id, 'focus', e.target.value)}
                        rows={2}
                        className="w-full text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none mt-1"
                        placeholder="এই মাসের প্রধান ফোকাস..."
                      />
                    ) : (
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed break-words">
                        <span className="font-semibold text-slate-700">ফোকাস:</span> {month.focus}
                      </p>
                    )}

                    {/* Income badges */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {editMode ? (
                        <>
                          <div className="flex items-center gap-1.5 w-full sm:w-auto">
                            <span className="text-[11px] text-slate-500 font-semibold whitespace-nowrap shrink-0">মোট টার্গেট:</span>
                            <input
                              value={month.targetIncome}
                              onChange={e => updateMonthField(month.id, 'targetIncome', e.target.value)}
                              className="flex-1 sm:w-36 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 w-full sm:w-auto">
                            <span className="text-[11px] text-slate-500 font-semibold whitespace-nowrap shrink-0">নতুন আয়:</span>
                            <input
                              value={month.newIncomeTarget}
                              onChange={e => updateMonthField(month.id, 'newIncomeTarget', e.target.value)}
                              className="flex-1 sm:w-36 text-xs font-bold bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <span className={`text-[11px] font-bold px-2 py-1 rounded-full border whitespace-nowrap ${t.income}`}>🎯 {month.targetIncome}</span>
                          <span className={`text-[11px] font-bold px-2 py-1 rounded-full border whitespace-nowrap ${t.pill}`}>💰 {month.newIncomeTarget}</span>
                          <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border whitespace-nowrap ${t.pill}`}>{month.completedCount}/{month.weeks.length} সপ্তাহ</span>
                        </>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div className={`${t.bar} h-full rounded-full transition-all duration-500`} style={{ width: `${month.monthProgress}%` }} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 w-8 text-right shrink-0">{month.monthProgress}%</span>
                    </div>
                  </div>

                  {/* Collapse + Delete */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    {editMode && (
                      <button onClick={() => deleteMonth(month.id)} title="এই মাস মুছুন"
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 active:bg-rose-100 transition-all touch-manipulation">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => toggleExpand(month.id)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-700 active:bg-slate-100 transition-all touch-manipulation">
                      {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Week Cards */}
              {expanded && (
                <div className="p-3 sm:p-4 space-y-2">
                  {month.weeks.length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-6 italic">এই ফিল্টারে কোন কাজ পাওয়া যায়নি।</p>
                  )}

                  {month.weeks.map((week) => {
                    const isDone = week.status === 'Done';
                    const cardBg =
                      isDone                       ? 'bg-emerald-50 border-emerald-200' :
                      week.status === 'InProgress' ? 'bg-blue-50 border-blue-200'      :
                      week.status === 'Blocked'    ? 'bg-rose-50 border-rose-200'      :
                                                     'bg-white border-slate-200';
                    return (
                      <div key={week.id} className={`border rounded-xl p-3 sm:p-3.5 transition-all hover:shadow-sm ${cardBg}`}>
                        <div className="flex items-start gap-2.5">

                          {/* Checkbox */}
                          <button
                            onClick={() => updateStatus(month.id, week.id, isDone ? 'NotStarted' : 'Done')}
                            title={isDone ? 'সম্পন্ন চিহ্ন সরান' : 'সম্পন্ন করুন'}
                            className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all border touch-manipulation ${
                              isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 text-transparent hover:border-emerald-500'
                            }`}>
                            <Check className="w-3 h-3 stroke-[3]" />
                          </button>

                          <div className="flex-1 min-w-0">
                            {/* Week label + status badge */}
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[11px] font-extrabold text-slate-500 bg-white border border-slate-200 rounded-md px-2 py-0.5 shrink-0">
                                  {week.week}
                                </span>
                                {!editMode && <StatusBadge status={week.status} />}
                              </div>

                              {/* Status quick buttons */}
                              {!editMode && (
                                <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200 overflow-x-auto">
                                  {[['NotStarted','বাকি'],['InProgress','চলছে'],['Done','সম্পন্ন'],['Blocked','সমস্যা']].map(([s, label]) => (
                                    <button
                                      key={s}
                                      onClick={() => updateStatus(month.id, week.id, s)}
                                      className={`flex-1 min-w-[44px] py-1.5 px-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap touch-manipulation ${
                                        week.status === s
                                          ? s === 'Done'       ? 'bg-emerald-600 text-white'
                                          : s === 'InProgress' ? 'bg-blue-600 text-white'
                                          : s === 'Blocked'    ? 'bg-rose-600 text-white'
                                          :                      'bg-slate-700 text-white'
                                          : 'text-slate-500 hover:bg-white active:bg-slate-200'
                                      }`}>
                                      {label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Edit inputs */}
                            {editMode ? (
                              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                                <input
                                  value={week.week}
                                  onChange={e => updateWeekField(month.id, week.id, 'week', e.target.value)}
                                  className="text-xs font-bold w-full sm:w-20 shrink-0 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                  placeholder="Week 1"
                                />
                                <input
                                  value={week.title}
                                  onChange={e => updateWeekField(month.id, week.id, 'title', e.target.value)}
                                  className="flex-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                  placeholder="কাজের বিবরণ"
                                />
                              </div>
                            ) : (
                              <p className={`text-sm font-semibold mt-1.5 leading-snug break-words ${isDone ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                                {week.title}
                              </p>
                            )}

                            {/* Notes */}
                            {editMode ? (
                              <input
                                value={week.notes}
                                onChange={e => updateWeekField(month.id, week.id, 'notes', e.target.value)}
                                className="mt-2 w-full text-xs text-slate-500 bg-white/80 border border-slate-100 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                placeholder="📌 নোট বা টিপস (ঐচ্ছিক)"
                              />
                            ) : (
                              week.notes && (
                                <p className="text-xs text-slate-500 mt-1.5 bg-white/70 border border-slate-100 rounded-lg px-2.5 py-1.5 leading-relaxed break-words">
                                  📌 {week.notes}
                                </p>
                              )
                            )}
                          </div>

                          {/* Delete week */}
                          {editMode && (
                            <button onClick={() => deleteWeek(month.id, week.id)} title="এই সপ্তাহ মুছুন"
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-rose-300 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 transition-all shrink-0 touch-manipulation">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Add week */}
                  {editMode && (
                    <button onClick={() => addWeek(month.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 text-xs font-semibold hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 transition-all touch-manipulation">
                      <PlusCircle className="w-4 h-4 shrink-0" />
                      <span>নতুন সপ্তাহ যোগ করুন</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ══ ADD MONTH ══ */}
      {editMode && (
        <button onClick={addMonth}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 text-sm font-semibold hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 transition-all touch-manipulation">
          <PlusCircle className="w-5 h-5 shrink-0" />
          <span>নতুন মাস যোগ করুন</span>
        </button>
      )}
    </div>
  );
}
