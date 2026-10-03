import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Target, 
  CheckSquare, 
  Users, 
  TrendingUp, 
  Receipt, 
  CalendarCheck, 
  Tag, 
  Settings as SettingsIcon,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  GraduationCap,
  Wallet,
  Landmark,
  Sparkles,
  Crown
} from 'lucide-react';
import { hasActiveTrial } from '../utils/subscriptionHelper';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout, isAdmin = false, subscription, onOpenUpgrade }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationGroups = [
    {
      title: 'WORKSPACE',
      items: [
        { id: 'dashboard', label: 'ড্যাশবোর্ড (Dashboard)', icon: LayoutDashboard },
        { id: 'tasks', label: 'আজকের কাজ (Today Tasks)', icon: CheckSquare },
      ]
    },
    {
      title: 'PLANNING',
      items: [
        { id: 'plan', label: '৯০ দিনের প্ল্যান (90-Day Plan)', icon: Target },
        { id: 'weekly', label: 'সাপ্তাহিক রিভিউ (Weekly)', icon: CalendarCheck },
      ]
    },
    {
      title: 'BUSINESS',
      items: [
        { id: 'crm', label: 'ক্লায়েন্ট CRM (Pipeline)', icon: Users },
        { id: 'dues', label: 'পাওনা ম্যানেজমেন্ট (Dues)', icon: Wallet },
        { id: 'tuition', label: 'টিউশন (Tuition)', icon: GraduationCap },
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { id: 'income', label: 'ইনকাম ট্র্যাকার (Income)', icon: TrendingUp },
        { id: 'expense', label: 'খরচের ট্র্যাকার (Expense)', icon: Receipt },
        { id: 'liabilities', label: 'দেনা ও কিস্তি (Liabilities)', icon: Landmark },
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { id: 'services', label: 'সার্ভিস ও প্রাইসিং (Services)', icon: Tag },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings', label: 'সেটিংস (Settings)', icon: SettingsIcon },
        ...(isAdmin ? [{ id: 'admin', label: 'এডমিন প্যানেল (Admin Panel)', icon: ShieldCheck }] : [])
      ]
    }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sticky top-0 z-50 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-base shadow-xs">
            ৳
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">ইনকাম ম্যানেজার</h1>
            <p className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]">{user?.email || '৯০ দিনের ট্র্যাকার'}</p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Slide-down Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 sticky top-[56px] z-40 shadow-md max-h-[calc(100vh-56px)] overflow-y-auto">
          <div className="space-y-5">
            {navigationGroups.map((group, groupIdx) => (
              <div key={groupIdx}>
                <h3 className="px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase mb-2">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-150 text-left group ${
                          isActive
                            ? 'bg-emerald-50/70 text-emerald-950 font-semibold'
                            : 'text-slate-600 font-medium hover:bg-slate-100/60 hover:text-slate-900'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Free Trial Promo Card */}
          {!isAdmin && hasActiveTrial(subscription) && (
            <div className="pt-4 mt-4 border-t border-slate-100 px-3">
              <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-2xl p-3.5 shadow-md relative overflow-hidden space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    <span>ফ্রি ট্রায়াল</span>
                  </span>
                  <span className="text-[11px] font-bold text-amber-300">
                    {Math.max(0, Math.ceil((new Date(subscription.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24)))} দিন বাকি
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenUpgrade) onOpenUpgrade();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-all"
                >
                  <Crown className="w-3.5 h-3.5 text-slate-950" />
                  <span>এখনই সাবস্ক্রাইব করুন</span>
                </button>
              </div>
            </div>
          )}

          {user && (
            <div className="pt-4 mt-6 border-t border-slate-100 px-3">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 py-2 rounded-lg text-[13px] font-medium text-rose-600 hover:text-rose-700 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>লগআউট (Logout)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200/80 fixed h-screen top-0 left-0 z-40 flex-col justify-between">
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 no-scrollbar">
          {/* Brand Header */}
          <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-100">
            <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              ৳
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight truncate">ইনকাম ম্যানেজার</h1>
              <p className="text-[11px] text-slate-500 font-medium truncate">৯০ দিনের বিজেনস কমান্ড</p>
            </div>
          </div>

          {/* Navigation List */}
          <nav className="space-y-5">
            {navigationGroups.map((group, groupIdx) => (
              <div key={groupIdx}>
                <h3 className="px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase mb-2">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 text-left group ${
                          isActive
                            ? 'bg-emerald-50/70 text-emerald-950 font-semibold'
                            : 'text-slate-600 font-medium hover:bg-slate-100/60 hover:text-slate-900'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Free Trial Upgrade Promo Card (If user is currently in trial) */}
        {!isAdmin && hasActiveTrial(subscription) && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-2xl p-3.5 shadow-md relative overflow-hidden space-y-2.5">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-indigo-500/20 rounded-full blur-xl pointer-events-none"></div>
              
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                  <span>ফ্রি ট্রায়াল</span>
                </span>
                <span className="text-[11px] font-bold text-amber-300">
                  {Math.max(0, Math.ceil((new Date(subscription.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24)))} দিন বাকি
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-tight">
                মেয়াদ শেষে সেবা সচল রাখতে এখনই পেইড সাবস্ক্রিপশন নিন।
              </p>

              <button
                type="button"
                onClick={onOpenUpgrade}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Crown className="w-3.5 h-3.5 text-slate-950" />
                <span>সাবস্ক্রাইব করুন</span>
              </button>
            </div>
          </div>
        )}

        {/* User Profile & Logout Box */}
        <div className="p-4 border-t border-slate-100 bg-white">
          {user && (
            <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                  <UserIcon className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[11px] font-semibold text-slate-900 truncate">{user.email}</div>
                  <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    <span>Supabase Cloud</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                title="লগআউট করুন"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}


