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
  Crown,
  Lock
} from 'lucide-react';
import { hasActiveTrial } from '../utils/subscriptionHelper';
import { isFeatureAllowed } from '../utils/planPermissions';

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
      <div className="md:hidden bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 sticky top-0 z-50 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          {user?.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
              alt="Avatar" 
              className="w-8 h-8 rounded-xl object-cover border border-emerald-500/30 shadow-xs" 
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 rounded-xl flex items-center justify-center font-extrabold text-base shadow-xs shadow-emerald-500/20">
              {user?.user_metadata?.full_name ? user.user_metadata.full_name.slice(0, 1).toUpperCase() : '৳'}
            </div>
          )}
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">
              {user?.user_metadata?.full_name || 'ইনকাম ম্যানেজার'}
            </h1>
            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]">{user?.email || '৯০ দিনের ট্র্যাকার'}</p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Slide-down Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-850 p-4 sticky top-[56px] z-40 shadow-xl max-h-[calc(100vh-56px)] overflow-y-auto">
          <div className="space-y-5">
            {navigationGroups.map((group, groupIdx) => (
              <div key={groupIdx}>
                <h3 className="px-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const isAllowed = isFeatureAllowed(item.id, subscription, isAdmin);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] transition-all duration-150 text-left cursor-pointer group ${
                          isActive
                            ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/25 shadow-xs shadow-emerald-950/50'
                            : 'text-slate-400 font-medium hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {!isAllowed && (
                          <span title="Locked feature - Upgrade required" className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-slate-900 text-slate-500 group-hover:text-amber-400 shrink-0">
                            <Lock className="w-3 h-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Free Trial Promo Card */}
          {!isAdmin && hasActiveTrial(subscription) && (
            <div className="pt-4 mt-4 border-t border-slate-850 px-2">
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-2xl p-3.5 shadow-md border border-indigo-500/20 relative overflow-hidden space-y-2.5">
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
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 text-slate-950" />
                  <span>এখনই সাবস্ক্রাইব করুন</span>
                </button>
              </div>
            </div>
          )}

          {user && (
            <div className="pt-4 mt-6 border-t border-slate-850 px-2">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 py-2 px-3 rounded-xl text-[13px] font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>লগআউট (Logout)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-950 border-r border-slate-800/80 fixed h-screen top-0 left-0 z-40 flex-col justify-between select-none">
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 no-scrollbar">
          {/* Brand Header */}
          <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-850">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 rounded-xl flex items-center justify-center font-extrabold text-base shadow-sm shadow-emerald-500/20 shrink-0">
              ৳
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white tracking-tight leading-tight truncate">ইনকাম ম্যানেজার</h1>
              <p className="text-[11px] text-slate-400 font-medium truncate">৯০ দিনের বিজনেস কমান্ড</p>
            </div>
          </div>

          {/* Navigation List */}
          <nav className="space-y-5">
            {navigationGroups.map((group, groupIdx) => (
              <div key={groupIdx}>
                <h3 className="px-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const isAllowed = isFeatureAllowed(item.id, subscription, isAdmin);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] transition-all duration-150 text-left cursor-pointer group ${
                          isActive
                            ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/25 shadow-xs shadow-emerald-950/50'
                            : 'text-slate-400 font-medium hover:bg-slate-900/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {!isAllowed && (
                          <span title="Locked feature - Upgrade required" className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-slate-900 text-slate-500 group-hover:text-amber-400 shrink-0">
                            <Lock className="w-3 h-3" />
                          </span>
                        )}
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
          <div className="p-3.5 border-t border-slate-850 bg-slate-950/60">
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-2xl p-3.5 shadow-md border border-indigo-500/20 relative overflow-hidden space-y-2.5">
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
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer hover:scale-[1.01]"
              >
                <Crown className="w-3.5 h-3.5 text-slate-950" />
                <span>সাবস্ক্রাইব করুন</span>
              </button>
            </div>
          </div>
        )}

        {/* User Profile & Logout Box */}
        <div className="p-3.5 border-t border-slate-850 bg-slate-950">
          {user && (() => {
            const fullName = user?.user_metadata?.full_name || '';
            const avatarUrl = user?.user_metadata?.avatar_url || '';
            const initials = fullName 
              ? fullName.slice(0, 2).toUpperCase() 
              : (user?.email?.slice(0, 2).toUpperCase() || 'U');

            return (
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                <div 
                  onClick={() => handleTabClick('settings')}
                  className="flex items-center gap-2.5 overflow-hidden cursor-pointer group"
                  title="প্রোফাইল ও সেটিংস দেখুন"
                >
                  <div className="w-8 h-8 rounded-xl overflow-hidden bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs group-hover:border-emerald-400 transition-colors">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={fullName || 'Avatar'} className="w-full h-full object-cover" />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[12px] font-bold text-white group-hover:text-emerald-300 truncate transition-colors">
                      {fullName || user.email?.split('@')[0]}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[125px]">
                      {user.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0 cursor-pointer"
                  title="লগআউট করুন"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            );
          })()}
        </div>
      </aside>
    </>
  );
}


