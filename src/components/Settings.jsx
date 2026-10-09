import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  CheckCircle2, 
  Target, 
  Database, 
  CloudUpload, 
  RefreshCw, 
  AlertCircle,
  User as UserIcon,
  Camera,
  Phone,
  Mail,
  Upload
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Settings({ appData, setAppData, user, onMigrate, isMigrating }) {
  const [formData, setFormData] = useState({
    targetIncome: appData.targetIncome || 100000,
    dailyOutreachTarget: appData.dailyOutreachTarget || 10,
    currency: appData.currency || '৳'
  });

  // Profile State
  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    avatarUrl: user?.user_metadata?.avatar_url || '',
    phone: user?.user_metadata?.phone || user?.phone || ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);

  // Handle Profile Photo File Upload (Convert to Base64 data URL)
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileError('ছবির সাইজ সর্বোচ্চ ২ মেগাবাইট (2MB) হতে পারবে।');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfileData(prev => ({ ...prev, avatarUrl: reader.result }));
      setProfileError('');
    };
    reader.onerror = () => {
      setProfileError('ছবি লোড করতে সমস্যা হয়েছে।');
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (isSavingProfile) return;
    setIsSavingProfile(true);
    setProfileError('');
    setProfileSuccess(false);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.fullName.trim(),
          avatar_url: profileData.avatarUrl,
          phone: profileData.phone.trim()
        }
      });

      if (error) throw error;

      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3500);
    } catch (err) {
      console.error('Error updating profile:', err);
      setProfileError(err?.message || 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      await setAppData({
        ...appData,
        targetIncome: Number(formData.targetIncome) || 100000,
        dailyOutreachTarget: Number(formData.dailyOutreachTarget) || 10,
        currency: formData.currency
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } finally {
      setIsSaving(false);
    }
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
          আপনার প্রোফাইল তথ্য, ছবি এবং ইনকাম টার্গেট ও প্যারামিটার পরিচালনা করুন
        </p>
      </div>

      {/* 1. User Profile Settings Card */}
      <form onSubmit={handleProfileSubmit} className="bg-white border-2 border-emerald-300/80 hover:border-emerald-500 rounded-2xl p-6 md:p-8 shadow-xs space-y-6 max-w-3xl transition-all">
        {profileSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!</span>
          </div>
        )}

        {profileError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        <div className="space-y-5">
          <h3 className="text-base font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-emerald-600" />
            <span>আপনার প্রোফাইল ও ব্যক্তিগত তথ্য</span>
          </h3>

          {/* Profile Photo Upload & Preview */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50/70 border border-slate-200">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md bg-slate-900 flex items-center justify-center">
                {profileData.avatarUrl ? (
                  <img 
                    src={profileData.avatarUrl} 
                    alt="User Avatar" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {profileData.fullName ? profileData.fullName.slice(0, 2).toUpperCase() : (user?.email?.slice(0, 2).toUpperCase() || '👤')}
                  </span>
                )}
              </div>
              <label 
                htmlFor="avatar-upload" 
                className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer transition-transform active:scale-95 group-hover:scale-105"
                title="ছবি পরিবর্তন করুন"
              >
                <Camera className="w-3.5 h-3.5" />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                  className="hidden" 
                />
              </label>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <h4 className="text-sm font-bold text-slate-800">প্রোফাইল ছবি</h4>
              <p className="text-xs text-slate-500">
                আপনার ছবি সরাসরি ডিভাইস থেকে আপলোড করতে পারেন (সর্বোচ্চ 2MB) অথবা নিচের ফিল্ডে ছবির লিঙ্ক দিন।
              </p>
              <div className="pt-1 flex flex-wrap gap-2 justify-center sm:justify-start">
                <label 
                  htmlFor="avatar-upload" 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>গ্যালারি/ফাইল থেকে ছবি পছন্দ করুন</span>
                </label>
                {profileData.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setProfileData(p => ({ ...p, avatarUrl: '' }))}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded hover:bg-rose-50"
                  >
                    ছবি মুছুন
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">পূর্ণ নাম (Full Name) *</label>
              <input
                type="text"
                required
                placeholder="যেমন: ফুয়ারা আহমেদ"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>মোবাইল নম্বর (Phone Number)</span>
              </label>
              <input
                type="tel"
                placeholder="যেমন: 01712345678"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>ইমেইল অ্যাড্রেস (Login Email)</span>
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 bg-slate-100 cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">নিরাপত্তার স্বার্থে ইমেইল অ্যাড্রেস পরিবর্তনযোগ্য নয়।</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSavingProfile}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-emerald-950/20 disabled:opacity-60 cursor-pointer"
          >
            {isSavingProfile ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>প্রোফাইল আপডেট হচ্ছে...</span>
              </>
            ) : profileSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>আপডেট সম্পন্ন!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>প্রোফাইল সেভ করুন</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* 2. Settings Card Form (Financial Target) */}
      <form onSubmit={handleSubmit} className="bg-white border-2 border-slate-200 hover:border-slate-300 rounded-2xl p-6 md:p-8 shadow-xs space-y-6 max-w-3xl transition-all">
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
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>সংরক্ষণ হচ্ছে...</span>
              </>
            ) : savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>সংরক্ষিত হয়েছে!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>পরিবর্তনসমূহ সংরক্ষণ করুন</span>
              </>
            )}
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
