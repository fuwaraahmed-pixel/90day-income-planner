import React, { useState } from 'react';
import { TrendingUp, Target, Calendar, Info } from 'lucide-react';

export default function IncomeProgressChart({ incomes = [], targetIncome = 100000 }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // If no incomes exist or all amounts are 0, return clean empty state
  const validIncomes = incomes.filter(i => Number(i.amount) > 0);
  
  if (validIncomes.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">৯০ দিনের ইনকাম ট্র্যাজেক্টরি</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            রিয়েল-টাইম
          </span>
        </div>

        <div className="py-10 text-center space-y-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">এখনো কোনো আয়ের রেকর্ড নেই</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              ইনকাম ট্র্যাকার-এ নতুন আয় যুক্ত করলে ৯০ দিনের প্রোগ্রেস চার্ট রিয়েল-টাইমে আপডেট হবে।
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Sort valid incomes by date ascending
  const sortedIncomes = [...validIncomes].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Build cumulative chart points
  let cumulative = 0;
  const chartPoints = sortedIncomes.map((item, idx) => {
    cumulative += Number(item.amount) || 0;
    return {
      date: item.date,
      amount: Number(item.amount) || 0,
      cumulative,
      source: item.source,
      clientDetails: item.clientDetails
    };
  });

  const maxVal = Math.max(targetIncome, cumulative * 1.1, 10000);
  const width = 600;
  const height = 200;
  const padding = 35;

  const pointsCount = chartPoints.length;
  
  // Calculate SVG X, Y coordinates
  const points = chartPoints.map((pt, i) => {
    const x = pointsCount === 1 
      ? width / 2 
      : padding + (i / (pointsCount - 1)) * (width - padding * 2);
    const y = height - padding - (pt.cumulative / maxVal) * (height - padding * 2);
    return { ...pt, x, y };
  });

  // Target line Y coordinate
  const targetY = height - padding - (targetIncome / maxVal) * (height - padding * 2);

  // SVG path definitions
  const pathD = points.length === 1 
    ? `M ${padding},${points[0].y} L ${width - padding},${points[0].y}`
    : points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`, '');

  const areaD = points.length === 1
    ? `M ${padding},${points[0].y} L ${width - padding},${points[0].y} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`
    : `${pathD} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">৯০ দিনের ইনকাম প্রোগ্রেস ট্র্যাজেক্টরি</h3>
            <p className="text-[11px] text-slate-500 font-medium">আয়ের পুঞ্জীভূত প্রবৃদ্ধি বনাম টার্গেট গন্তব্য</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            অর্জন: ৳{cumulative.toLocaleString()}
          </span>
          <span className="flex items-center gap-1.5 text-indigo-600 font-bold">
            <span className="w-2.5 h-0.5 border-b-2 border-dashed border-indigo-500 w-3"></span>
            টার্গেট: ৳{targetIncome.toLocaleString()}
          </span>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Background Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding + ratio * (height - padding * 2);
            return (
              <line
                key={ratio}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#E2E8F0"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
            );
          })}

          {/* Target Line */}
          {targetY >= padding && targetY <= height - padding && (
            <g>
              <line
                x1={padding}
                y1={targetY}
                x2={width - padding}
                y2={targetY}
                stroke="#6366F1"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={width - padding - 4}
                y={targetY - 5}
                fill="#6366F1"
                fontSize="9"
                fontWeight="bold"
                textAnchor="end"
              >
                টার্গেট ৳{targetIncome.toLocaleString()}
              </text>
            </g>
          )}

          {/* Area Fill */}
          <path
            d={areaD}
            fill="url(#emeraldGradient)"
            opacity="0.25"
          />

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Gradient Definition */}
          <defs>
            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Data Points */}
          {points.map((pt, idx) => (
            <g key={idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIndex === idx ? 6 : 4}
                fill="#FFFFFF"
                stroke="#10B981"
                strokeWidth="2.5"
                className="transition-all duration-150 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute z-20 bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-lg pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full mb-2 space-y-0.5"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: `${(points[hoveredIndex].y / height) * 100}%`
            }}
          >
            <div className="font-bold text-emerald-400">৳{points[hoveredIndex].cumulative.toLocaleString()}</div>
            <div className="text-[10px] text-slate-300">তারিখ: {points[hoveredIndex].date}</div>
            <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{points[hoveredIndex].clientDetails}</div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-medium">
        <span>১ম লেনদেন: {points[0]?.date || ''}</span>
        <span>মোট এন্ট্রি: {points.length}টি</span>
        <span>সাম্প্রতিক: {points[points.length - 1]?.date || ''}</span>
      </div>
    </div>
  );
}
