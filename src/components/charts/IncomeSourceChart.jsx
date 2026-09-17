import React from 'react';
import { PieChart, Tag, ArrowUpRight } from 'lucide-react';

export default function IncomeSourceChart({ incomes = [] }) {
  const validIncomes = incomes.filter(i => Number(i.amount) > 0);

  if (validIncomes.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">আয়ের উৎস অ্যানালিটিক্স</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            ব্রেকডাউন
          </span>
        </div>

        <div className="py-10 text-center space-y-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border border-blue-100">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">উৎস ডেটা ফাঁকা</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              কোনো আয়ের এন্ট্রি রেকর্ড পাওয়া যায়নি। ইনকাম ট্র্যাকার-এ ইনকাম যোগ করলে সোর্স ব্রেকডাউন দেখাবে।
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals by source
  const sourceTotals = {};
  let grandTotal = 0;

  validIncomes.forEach(inc => {
    const src = inc.source || 'Other (অন্যান্য)';
    const amt = Number(inc.amount) || 0;
    sourceTotals[src] = (sourceTotals[src] || 0) + amt;
    grandTotal += amt;
  });

  const colors = [
    { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', lightBg: 'bg-emerald-50' },
    { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-200', lightBg: 'bg-blue-50' },
    { bg: 'bg-indigo-500', text: 'text-indigo-700', border: 'border-indigo-200', lightBg: 'bg-indigo-50' },
    { bg: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-200', lightBg: 'bg-purple-50' },
    { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200', lightBg: 'bg-amber-50' },
    { bg: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-200', lightBg: 'bg-rose-50' },
    { bg: 'bg-cyan-500', text: 'text-cyan-700', border: 'border-cyan-200', lightBg: 'bg-cyan-50' },
  ];

  const breakdown = Object.entries(sourceTotals)
    .map(([source, amount], index) => {
      const percentage = grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0;
      const colorScheme = colors[index % colors.length];
      return {
        source,
        amount,
        percentage,
        color: colorScheme
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">আয়ের উৎস অ্যানালিটিক্স (Income Breakdown)</h3>
            <p className="text-[11px] text-slate-500 font-medium">উৎস অনুযায়ী মোট আয়ের শতাংশ ও পরিমাণ</p>
          </div>
        </div>
        <span className="text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
          মোট ৳{grandTotal.toLocaleString()}
        </span>
      </div>

      {/* Multi-segment Horizontal Donut/Bar Visualization */}
      <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
        {breakdown.map((item, idx) => (
          <div
            key={idx}
            className={`${item.color.bg} transition-all duration-500`}
            style={{ width: `${item.percentage}%` }}
            title={`${item.source}: ৳${item.amount.toLocaleString()} (${item.percentage}%)`}
          />
        ))}
      </div>

      {/* Source Breakdown List */}
      <div className="space-y-2.5 pt-1">
        {breakdown.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2.5 bg-slate-50/70 hover:bg-slate-100/70 rounded-xl border border-slate-200/70 transition-all text-xs"
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${item.color.bg} shrink-0`}></span>
              <span className="font-bold text-slate-800">{item.source}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className={`font-bold ${item.color.text} ${item.color.lightBg} border ${item.color.border} px-2 py-0.5 rounded-md text-[11px]`}>
                {item.percentage}%
              </span>
              <span className="font-extrabold text-slate-900 min-w-[70px] text-right">
                ৳{item.amount.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
