import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  CheckCircle2, 
  Target, 
  Database,
  CloudUpload,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function Settings({ appData, setAppData, user, onMigrate, isMigrating }) {
  const [formData, setFormData] = useState({
    targetIncome: appData.targetIncome || 100000,
    installment: appData.installment || 80000,
    dailyOutreachTarget: appData.dailyOutreachTarget || 10,
    currency: appData.currency || '৳'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setAppData({
      ...appData,
      targetIncome: Number(formData.targetIncome) || 100000,
      installment: Number(formData.installment) || 80000,
      dailyOutreachTarget: Number(formData.dailyOutreachTarget) || 10,
      currency: formData.currency
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleRunMigration = async () => {
    if (!onMigrate) return;
    setMigrationResult(null);
    const result = await onMigrate();
    setMigrationResult(result);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          ⚙️ অ্যাপ সেটিংস (Settings)
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          আপনার ইনকাম টার্গেট, মাসিক কিস্তি এবং গোল প্যারামিটার পরিবর্তন করুন
        </p>
      </div>

      {/* Settings Card Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 max-w-3xl">
        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>সেটিংস সফলভাবে সংরক্ষিত হয়েছে! ড্যাশবোর্ড আপডেট করা হয়েছে।</span>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>আর্থিক লক্ষ্যমাত্রা ও কনফিগারেশন</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">মাসিক ইনকাম লক্ষ্যমাত্রা (Monthly Target ৳)</label>
              <input
                type="number"
                required
                value={formData.targetIncome}
                onChange={(e) => setFormData({ ...formData, targetIncome: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">যেমন: ১,০০,০০০ বা ২,০০,০০০</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">মাসিক কিস্তির টাকা (Monthly Installment ৳)</label>
              <input
                type="number"
                required
                value={formData.installment}
                onChange={(e) => setFormData({ ...formData, installment: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-rose-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">যেমন: ৮০,০০০</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">দৈনিক আউটরিচ টার্গেট (Daily Outreach)</label>
              <input
                type="number"
                required
                value={formData.dailyOutreachTarget}
                onChange={(e) => setFormData({ ...formData, dailyOutreachTarget: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">দৈনিক নতুন কন্টাক্ট লক্ষ্য</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">মুদ্রা সংকেত (Currency Symbol)</label>
              <input
                type="text"
                required
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>পরিবর্তনসমূহ সংরক্ষণ করুন</span>
          </button>
        </div>
      </form>

      {/* Local Data Migration Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-4 max-w-3xl">
        <h3 className="text-base font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" />
          <span>ব্রাউজার লোকাল ডাটা ক্লাউডে ইমপোর্ট (Cloud Migration)</span>
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed">
          আপনার ব্রাউজারে আগে থেকেই কোনো লোকাল ডাটা (Local Data) থেকে থাকলে আপনি তা নিরাপদভাবে আপনার Supabase Cloud অ্যাকাউন্টে ইমপোর্ট করতে পারেন।
          <strong className="text-slate-800 block mt-1">
            * দ্রষ্টব্য: লোকাল ডাটা কোনোভাবেই মুছে যাবে না এবং ক্লাউডে আগের কোনো ডাটা Overwrite হবে না।
          </strong>
        </p>

        {migrationResult && (
          <div className={`p-4 rounded-xl text-xs font-semibold space-y-1 ${
            migrationResult.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}>
            <div className="font-bold text-sm flex items-center gap-1.5">
              {migrationResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{migrationResult.message}</span>
            </div>
            {migrationResult.success && (
              <div className="flex gap-4 pt-1 font-mono text-[11px]">
                <span>নতুন ইমপোর্ট: <strong>{migrationResult.importedCount}</strong></span>
                <span>আগে থেকেই বিদ্যমান (Skipped): <strong>{migrationResult.skippedCount}</strong></span>
                <span>ব্যর্থ: <strong>{migrationResult.failedCount}</strong></span>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 flex justify-start">
          <button
            type="button"
            onClick={handleRunMigration}
            disabled={isMigrating || !user}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm disabled:opacity-50"
          >
            {isMigrating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>ডাটা ইমপোর্ট হচ্ছে...</span>
              </>
            ) : (
              <>
                <CloudUpload className="w-4 h-4" />
                <span>লোকাল ডাটা Supabase ক্লাউডে ইমপোর্ট করুন</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
