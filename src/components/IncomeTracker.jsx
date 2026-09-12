import React, { useState } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  Calendar, 
  CreditCard, 
  Trash2, 
  Target, 
  CheckCircle,
  Tag
} from 'lucide-react';

export default function IncomeTracker({ incomes, setIncomes, targetIncome, currentSalary }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState('All');

  const sources = [
    'Salary (স্থায়ী বেতন/আয়)',
    'Website (ওয়েবসাইট প্রজেক্ট)',
    'Landing Page (ল্যান্ডিং পেজ)',
    'Maintenance (মাসিক রক্ষণাবেক্ষণ)',
    'E-commerce (ই-কমার্স প্রজেক্ট)',
    'Small Task (ছোট কাজ)',
    'Other (অন্যান্য)'
  ];

  const paymentTypes = ['bKash', 'Nagad', 'Bank Transfer', 'Cash', 'Rocket', 'Other'];

  const [newIncome, setNewIncome] = useState({
    date: new Date().toISOString().split('T')[0],
    source: 'Website (ওয়েবসাইট প্রজেক্ট)',
    clientDetails: '',
    amount: '',
    paymentType: 'bKash',
    month: 'Month 1',
    notes: ''
  });

  const handleAddIncome = (e) => {
    e.preventDefault();
    if (!newIncome.clientDetails.trim() || !newIncome.amount) return;

    const created = {
      ...newIncome,
      id: Date.now(),
      amount: Number(newIncome.amount) || 0
    };

    setIncomes([created, ...incomes]);
    setNewIncome({
      date: new Date().toISOString().split('T')[0],
      source: 'Website (ওয়েবসাইট প্রজেক্ট)',
      clientDetails: '',
      amount: '',
      paymentType: 'bKash',
      month: 'Month 1',
      notes: ''
    });
    setShowAddForm(false);
  };

  const handleDeleteIncome = (id) => {
    setIncomes(incomes.filter(i => i.id !== id));
  };

  // Calculations
  const totalIncome = incomes.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const salaryIncome = incomes.filter(i => i.source.includes('Salary')).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const newClientIncome = totalIncome - salaryIncome;
  const remainingTarget = Math.max(0, targetIncome - totalIncome);

  // Filter & Search
  const filteredIncomes = incomes.filter(inc => {
    const q = searchQuery.toLowerCase();
    const matchQ = inc.clientDetails.toLowerCase().includes(q) || inc.notes.toLowerCase().includes(q);
    const matchS = filterSource === 'All' || inc.source === filterSource;
    return matchQ && matchS;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            📈 ইনকাম ট্র্যাকার (Income Tracker)
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            দৈনিক ও প্রজেক্টভিত্তিক সমস্ত আয়ের স্বচ্ছ হিসাব ট্র্যাকিং
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন ইনকাম এন্ট্রি করুন</span>
        </button>
      </div>

      {/* 4 Income Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">সর্বমোট সংগৃহীত ইনকাম</div>
          <div className="text-2xl font-bold text-emerald-600 mt-0.5">৳{totalIncome.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">চলতি জমা</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">নতুন কাজ থেকে আয়</div>
          <div className="text-2xl font-bold text-blue-600 mt-0.5">৳{newClientIncome.toLocaleString()}</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">ওয়েবসাইট/সার্ভিস ইনকাম</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">মাসিক লক্ষ্যমাত্রা</div>
          <div className="text-2xl font-bold text-slate-800 mt-0.5">৳{targetIncome.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">৯০ দিনের টার্গেট</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">টার্গেটে পৌঁছাতে বাকি</div>
          <div className="text-2xl font-bold text-rose-600 mt-0.5">৳{remainingTarget.toLocaleString()}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">বাকি ইনকাম</div>
        </div>
      </div>

      {/* Add Income Form */}
      {showAddForm && (
        <form onSubmit={handleAddIncome} className="bg-white border border-emerald-200 rounded-2xl p-5 md:p-6 shadow-md space-y-4">
          <h3 className="text-base font-bold text-slate-800 border-b pb-3">নতুন ইনকাম এন্ট্রি</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">আয়ের উৎস (Source) *</label>
              <select
                value={newIncome.source}
                onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {sources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ক্লায়েন্ট / বিবরণ (Client / Details) *</label>
              <input
                type="text"
                required
                placeholder="যেমন: আইডিয়াল স্কুল অ্যাডভান্স বা বেতন"
                value={newIncome.clientDetails}
                onChange={(e) => setNewIncome({ ...newIncome, clientDetails: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">টাকার পরিমাণ (Amount ৳) *</label>
              <input
                type="number"
                required
                placeholder="যেমন: 5000"
                value={newIncome.amount}
                onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">পেমেন্ট মাধ্যম (Payment Type)</label>
              <select
                value={newIncome.paymentType}
                onChange={(e) => setNewIncome({ ...newIncome, paymentType: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {paymentTypes.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">মাস (Month)</label>
              <input
                type="text"
                placeholder="যেমন: Month 1"
                value={newIncome.month}
                onChange={(e) => setNewIncome({ ...newIncome, month: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">তারিখ (Date)</label>
              <input
                type="date"
                value={newIncome.date}
                onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">নোটস (Notes)</label>
              <input
                type="text"
                placeholder="অতিরিক্ত তথ্য"
                value={newIncome.notes}
                onChange={(e) => setNewIncome({ ...newIncome, notes: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="বিবরণ বা ক্লায়েন্ট দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none"
          >
            <option value="All">সব আয়ের উৎস</option>
            {sources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Income List Table / Cards */}
      <div className="space-y-3">
        {filteredIncomes.length > 0 ? (
          filteredIncomes.map((inc) => (
            <div key={inc.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  ৳
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{inc.clientDetails}</h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {inc.source}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      {inc.paymentType}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {inc.date} ({inc.month})
                    </span>
                    {inc.notes && <span>• {inc.notes}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-right">
                  <div className="text-base font-extrabold text-emerald-600">+৳{inc.amount.toLocaleString()}</div>
                  <div className="text-[11px] text-slate-400">প্রাপ্তি জমা</div>
                </div>
                <button
                  onClick={() => handleDeleteIncome(inc.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
            কোনো ইনকাম এন্ট্রি পাওয়া যায়নি!
          </div>
        )}
      </div>
    </div>
  );
}
