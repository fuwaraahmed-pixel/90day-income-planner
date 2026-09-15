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
  GraduationCap
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.email === 'fuwaraahmed@gmail.com';

  const menuItems = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড (Dashboard)', icon: LayoutDashboard },
    { id: 'plan', label: '৯০ দিনের প্ল্যান (90-Day Plan)', icon: Target },
    { id: 'tasks', label: 'আজকের কাজ (Today Tasks)', icon: CheckSquare },
    { id: 'tuition', label: 'টিউশন (Tuition)', icon: GraduationCap },
    { id: 'crm', label: 'ক্লায়েন্ট CRM (Pipeline)', icon: Users },
    { id: 'income', label: 'ইনকাম ট্র্যাকার (Income)', icon: TrendingUp },
    { id: 'expense', label: 'খরচের ট্র্যাকার (Expense)', icon: Receipt },
    { id: 'weekly', label: 'সাপ্তাহিক রিভিউ (Weekly)', icon: CalendarCheck },
    { id: 'services', label: 'সার্ভিস ও প্রাইসিং (Services)', icon: Tag },
    { id: 'settings', label: 'সেটিংস (Settings)', icon: SettingsIcon },
    ...(isAdmin ? [{ id: 'admin', label: 'এডমিন প্যানেল (Admin Panel)', icon: ShieldCheck }] : [])
  ];


  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };


  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-base shadow-sm">
            ৳
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 leading-tight">ইনকাম ম্যানেজার</h1>
            <p className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]">{user?.email || '৯০ দিনের ট্র্যাকার'}</p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Slide-down Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 sticky top-14 z-40 shadow-lg space-y-1 max-h-[80vh] overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {user && (
            <div className="pt-3 mt-3 border-t border-slate-100">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-5 h-5 text-rose-500" />
                <span>লগআউট (Logout)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200/80 p-5 fixed h-screen top-0 left-0 z-40 flex-col justify-between overflow-y-auto">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 pb-5 mb-5 border-b border-slate-100">
            <div className="w-9 h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
              ৳
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">ইনকাম ম্যানেজার</h1>
              <p className="text-[11px] text-slate-500 font-medium">৯০ দিনের গোল ট্র্যাকার</p>
            </div>
          </div>

          {/* Navigation List */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 text-left ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout Box */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          {user && (
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  <UserIcon className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[11px] font-bold text-slate-900 truncate">{user.email}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    <span>Supabase Cloud</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

