import React from 'react';
import { Lock, Sparkles, Crown, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { FEATURE_METADATA } from '../../utils/planPermissions';

export default function FeatureLockCard({ featureId, onUpgrade }) {
  const meta = FEATURE_METADATA[featureId] || {
    name: 'প্রিমিয়াম ফিচার',
    requiredPlanName: 'Pro Business',
    requiredPlanPrice: 999,
    description: 'এই ফিচারটি ব্যবহার করতে আপনার প্ল্যান আপগ্রেড করুন।'
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white border border-slate-200/90 rounded-[28px] shadow-xl overflow-hidden text-center relative p-8 sm:p-10 space-y-6">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-12 w-48 h-48 bg-gradient-to-b from-indigo-500/10 via-emerald-500/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>

        {/* Lock Icon Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white flex items-center justify-center shadow-lg shadow-indigo-950/20">
            <Lock className="w-7 h-7 text-amber-300" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center border-2 border-white shadow-xs">
            <Crown className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Headline & Description */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>{meta.requiredPlanName} প্ল্যানের অন্তর্ভুক্ত</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {meta.name} আনলক করুন
          </h2>

          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {meta.description}
          </p>
        </div>

        {/* Feature Highlights List */}
        <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 text-left max-w-md mx-auto space-y-2.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            এই প্ল্যানে যা পাবেন:
          </div>
          <div className="space-y-2 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{meta.name} এর সম্পূর্ণ এক্সেস</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>নিরাপদ ক্লাউড ডেটা ব্যাকআপ ও রিয়েল-টাইম সিঙ্ক</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>অগ্রাধিকার ভিত্তিতে কাস্টমার সাপোর্ট</span>
            </div>
          </div>
        </div>

        {/* Upgrade Call to Action */}
        <div className="pt-2 space-y-3">
          <button
            type="button"
            onClick={() => onUpgrade(meta.requiredPlanId)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>মাত্র ৳{meta.requiredPlanPrice}/মাসে {meta.requiredPlanName}-এ আপগ্রেড করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-slate-400 font-medium">
            যেকোনো সময় প্ল্যান পরিবর্তন বা বাতিল করার সুবিধা
          </p>
        </div>
      </div>
    </div>
  );
}
