import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Users,
  CheckSquare,
  DollarSign,
  Sparkles,
  Menu,
  X,
  FileText,
  MessageSquare,
  FileSpreadsheet,
  Bookmark,
  Brain,
  Target,
  BarChart3,
  GitPullRequest,
  PieChart,
  Receipt,
  Activity,
  Check,
  GraduationCap,
  Calendar,
  Clock
} from 'lucide-react';

export default function LandingPage({ onNavigateToAuth }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [legalModal, setLegalModal] = useState(null); // 'privacy' | 'terms' | null

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.reveal-init');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-emerald-100 selection:text-emerald-900">

      {/* 01. HEADER / NAVIGATION */}
      <header className="sticky top-0 z-50 bg-[#F8FAFC]/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm shadow-emerald-500/20">
              D
            </div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Dremoy
            </span>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button onClick={() => scrollToSection('features')} className="hover:text-emerald-600 transition-colors">
              ফিচারসমূহ
            </button>
            <button onClick={() => scrollToSection('why-dremoy')} className="hover:text-emerald-600 transition-colors">
              কেন Dremoy?
            </button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-emerald-600 transition-colors">
              প্রাইসিং
            </button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-emerald-600 transition-colors">
              FAQ
            </button>
          </nav>

          {/* Action CTAs (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => onNavigateToAuth('login')}
              className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-emerald-600 transition-colors"
            >
              লগইন করুন
            </button>
            <button
              onClick={() => onNavigateToAuth('signup')}
              className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-md shadow-emerald-600/20"
            >
              শুরু করুন
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col gap-3 font-semibold text-slate-700 text-base">
              <button onClick={() => scrollToSection('features')} className="text-left py-1 hover:text-emerald-600">
                ফিচারসমূহ
              </button>
              <button onClick={() => scrollToSection('why-dremoy')} className="text-left py-1 hover:text-emerald-600">
                কেন Dremoy?
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-left py-1 hover:text-emerald-600">
                প্রাইসিং
              </button>
              <button onClick={() => scrollToSection('faq')} className="text-left py-1 hover:text-emerald-600">
                FAQ
              </button>
            </nav>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigateToAuth('login'); }}
                className="w-full py-2.5 text-center text-sm font-bold text-slate-700 bg-slate-100 rounded-xl"
              >
                লগইন করুন
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigateToAuth('signup'); }}
                className="w-full py-2.5 text-center text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20"
              >
                শুরু করুন
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 02. HERO SECTION */}
      <section className="pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-10">

        {/* Hero Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-semibold shadow-xs">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>ডিজিটাল বিজনেস ওয়ার্কস্পেস</span>
        </div>

        {/* Hero Headline & Subtitle */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.2]">
            আপনার ব্যবসার পুরো কাজ, <br className="hidden sm:inline" />
            <span className="text-emerald-600">এক জায়গায়।</span>
          </h1>
          <p className="text-base sm:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            আয়, খরচ, customer, follow-up, কাজ আর business progress—সবকিছু এক workspace থেকে সহজভাবে পরিচালনা করুন।
          </p>

          {/* Key Value Proposition Highlight */}
          <div className="pt-2">
            <p className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight inline-block py-2.5 px-5 rounded-2xl shadow-2xs">
              <span className="text-rose-600 font-black" style={{ textDecorationColor: 'black' }} >"তথ্য খুজতে নয়"{' '}</span>-  ব্যবসা বাড়াতে সময় দিন।”</p>
          </div>
        </div >

        {/* Hero Action CTAs */}
        < div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2" >
          <button
            onClick={() => onNavigateToAuth('signup')}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-2xl text-base sm:text-lg transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 group"
          >
            <span>শুরু করুন</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => onNavigateToAuth('login')}
            className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold rounded-2xl text-base sm:text-lg transition-all shadow-xs hover:bg-slate-50"
          >
            লগইন করুন
          </button>
        </div >

        {/* Hero Visual — Large Dominant Dremoy Dashboard Preview */}
        < div className="pt-8 max-w-6xl mx-auto" >
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden p-3 sm:p-6 space-y-6 text-left relative">

            {/* Mock Dashboard Top Control Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <span className="text-xs font-bold text-slate-400 ml-2 hidden sm:inline">Dremoy Business Command Center</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  ● লাইভ ড্যাশবোর্ড
                </span>
              </div>
            </div>

            {/* Dashboard Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                  <span>মাসিক আয় (Income)</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">৳ ১,৪৫,০০০</div>
                <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <span>+১৫% গত মাসের তুলনায়</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                  <span>সেলস সিআরএম (CRM)</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">১২ জন লিড</div>
                <div className="text-xs font-semibold text-blue-600">৩টি একটিভ ফলো-আপ</div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                  <span>আজকের কাজ (Tasks)</span>
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">৫/৮ সম্পন্ন</div>
                <div className="text-xs font-semibold text-slate-600">৩টি হাই প্রায়োরিটি</div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                  <span>বিজনেস খরচ (Expenses)</span>
                  <DollarSign className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">৳ ২৫,০০০</div>
                <div className="text-xs font-semibold text-slate-600">নিয়ন্ত্রণে আছে</div>
              </div>
            </div>

            {/* Dashboard Middle Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">

              {/* Sales CRM Pipeline Column */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">CRM পাইপলাইন</h4>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">একটিভ</span>
                </div>
                <div className="space-y-2.5">
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1 shadow-2xs">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                      <span>আইডিয়াল মডেল স্কুল</span>
                      <span className="text-emerald-600 font-bold">৳১৫,০০০</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">ফলো-আপ: আগামী পরশু</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1 shadow-2xs">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                      <span>প্রোগ্রেস কোচিং সেন্টার</span>
                      <span className="text-emerald-600 font-bold">৳৮,০০০</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold text-emerald-600">অ্যাডভান্স পেইড (৳৪,০০০)</div>
                  </div>
                </div>
              </div>

              {/* Priority Tasks Column */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">আজকের কাজের তালিকা</h4>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">৩টি বাকি</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800">
                    <div className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</div>
                    <span className="line-through text-slate-400">৫টি স্কুলে প্রস্তাবনা ইমেইল পাঠানো</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800">
                    <div className="w-4 h-4 rounded border-2 border-slate-300"></div>
                    <span>পোর্টফোলিও ল্যান্ডিং পেজ ডিজাইন ফিনিশিং</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800">
                    <div className="w-4 h-4 rounded border-2 border-slate-300"></div>
                    <span>ক্লায়েন্ট তানভীর ভাইয়ের সাথে মিটিং</span>
                  </div>
                </div>
              </div>

              {/* Income Growth Chart Mockup */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">আয় ও প্রোগ্রেস ট্র্যাকার</h4>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">৯০ দিনের গোল</span>
                </div>
                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>টার্গেট ইনকাম (৳১,০০,০০০)</span>
                      <span className="text-emerald-600 font-bold">৮৫% সম্পন্ন</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[85%] rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 space-y-1">
                    <div className="font-bold">আজকের সংক্ষেপ:</div>
                    <p>সবগুলো কাজের ট্র্যাকিং ঠিকঠাক চলছে। আপনার ফলো-আপ শিডিউল রেডি!</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div >

      </section >

      {/* 03. PROBLEM SECTION */}
      < section id="problem" className="py-20 bg-white border-y border-slate-200/80" >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <div className="text-center space-y-4 max-w-3xl mx-auto reveal-init">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
              একসাথে এত কাজ সামলাতে গিয়ে কি হিসাব আর{' '}
              <span className="text-rose-600 font-black">
                কাস্টমার ফলো-আপ মিস হয়ে যাচ্ছে?
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
              কাস্টমারের নাম কোথায়? খাতায়? WhatsApp-এ? নাকি মাথায়? কাস্টমার, লিড, আয়, খরচ, ফলো-আপ ও গুরুত্বপূর্ণ কাজ —সবকিছু এক জায়গায় রাখায় <span className="text-rose-600 font-black" style={{ textDecorationColor: 'black' }} >"মাথাটা কি প্রেসার কুকার মনে হচ্ছে?"{' '}</span>
              <span className="font-extrabold text-emerald-800 px-2.5 py-1 rounded-xl inline-block mt-1 sm:mt-0 shadow-xs">
                চিন্তা কমান, গুছিয়ে রাখার দায়িত্বটা দিয়ে দেন Dremoy-কে।
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 text-center space-y-3 hover:border-slate-300 transition-all reveal-init hover-lift delay-1">
              <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">হিসাব খাতায়</h3>
              <p className="text-xs text-slate-500 font-medium">কাগজের খাতায় হিসাব রাখা</p>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 text-center space-y-3 hover:border-slate-300 transition-all reveal-init hover-lift delay-2">
              <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Messenger-এ</h3>
              <p className="text-xs text-slate-500 font-medium">কাস্টমার চ্যাট ছড়ানো</p>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 text-center space-y-3 hover:border-slate-300 transition-all reveal-init hover-lift delay-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center mx-auto">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Excel-এ</h3>
              <p className="text-xs text-slate-500 font-medium">স্প্রেডশিটের জটিলতা</p>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 text-center space-y-3 hover:border-slate-300 transition-all reveal-init hover-lift delay-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">ফোনের নোট</h3>
              <p className="text-xs text-slate-500 font-medium">মোবাইল অ্যাপে নোটিং</p>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 text-center space-y-3 hover:border-slate-300 transition-all reveal-init hover-lift delay-5">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center mx-auto">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">মনে রাখা</h3>
              <p className="text-xs text-slate-500 font-medium">ফলো-আপ মনে রাখা</p>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 text-center space-y-3 hover:border-slate-300 transition-all reveal-init hover-lift delay-6">
              <div className="w-12 h-12 bg-rose-50 text-rose-700 rounded-xl flex items-center justify-center mx-auto">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">আলাদা জায়গায়</h3>
              <p className="text-xs text-slate-500 font-medium">ফলো-আপ ট্র্যাকিং</p>
            </div>
          </div>

          {/* Empathetic Conclusion Box */}
          <div className="bg-gradient-to-b from-white via-[#F8FAFC] to-emerald-50/40 border border-emerald-200/90 rounded-3xl p-6 sm:p-10 text-center max-w-3xl mx-auto space-y-5 shadow-lg shadow-emerald-950/5 relative overflow-hidden reveal-init">

            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600"></div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              কাজের চাপে হিসাব এলোমেলো হয়ে গেলে কি মনে হয়—<span className="text-rose-700 font-black underline decoration-rose-300 decoration-2 underline-offset-4">‘আমি বোধহয় গুছিয়ে কাজ করতে পারছি না’</span>?
            </h3>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-600 text-white font-bold text-sm sm:text-base shadow-md shadow-emerald-600/20">
              ✨ বিশ্বাস করুন, সমস্যাটা আপনার দক্ষতায় নয়।
            </div>

            <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
              ব্যবসা যখন ছোট থাকে, তখন খাতা বা মোবাইলের নোট যথেষ্ট। কিন্তু ব্যবসা যখন বড় হতে শুরু করে, তখন সব চাপ একা মাথায় রাখা অসম্ভব হয়ে পড়ে। পুরোনো পদ্ধতি আর কাজ না করা মানে আপনি থেমে নেই—<strong className="text-emerald-800 font-extrabold">আপনার ব্যবসা এগোচ্ছে।</strong>
            </p>

            <div className="pt-3 border-t border-slate-200/60">
              <p className="text-sm sm:text-base text-slate-800 font-bold max-w-2xl mx-auto leading-relaxed">
                Dremoy তৈরিই করা হয়েছে আপনার মাথার ওপর থেকে এই প্রেসার কুকার নামক চিন্তা থেকে মাথা মুক্ত রাখতে, আপনাকে "শান্তিতে ব্যবসা করার সুযোগ" করে দিতে।
              </p>
            </div>
          </div>

        </div>
      </section >

      {/* 04. WITHOUT DREMOY VS WITH DREMOY */}
      < section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12" >
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            কাজের পার্থক্যের চিত্র
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium">
            আলাদা আলাদা পেঁচানো পদ্ধতির বদলে একটি সুশৃঙ্খল বিজনেস সিস্টেম।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* LEFT: Without Dremoy */}
          <div className="bg-white border border-rose-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs relative">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs">
              ✕ এভাবে (Without Dremoy)
            </div>
            <ul className="space-y-4 text-sm font-semibold text-slate-700">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">✕</span>
                <span>কাজগুলো আলাদা আলাদা পেঁচানো জায়গায় ছড়িয়ে থাকে</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">✕</span>
                <span>Customer information মেসেঞ্জার ও ফোনে খুঁজে বের করতে হয়</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">✕</span>
                <span>ক্লায়েন্ট Follow-up মনে রাখার ওপর নির্ভর করতে হয়</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">✕</span>
                <span>আজকের Daily Priority পরিষ্কার থাকে না</span>
              </li>
            </ul>
          </div>

          {/* RIGHT: With Dremoy */}
          <div className="bg-white border border-emerald-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md relative">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs">
              ✓ Dremoy-তে (With Dremoy)
            </div>
            <ul className="space-y-4 text-sm font-semibold text-slate-800">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Business Overview:</strong> এক নজরে পুরো বিজনেসের স্পষ্ট চিত্র</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Income & Expenses:</strong> আয় ও ব্যয়ের সহজ ও সুনির্দিষ্ট হিসাব</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>CRM & Pipeline:</strong> কাস্টমার ও লিড এক জায়গায় গুছানো</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Tasks & Follow-up:</strong> প্রতিদিনের কাজের সঠিক অগ্রাধিকার</span>
              </li>
            </ul>
          </div>

        </div>
      </section >

      {/* 05. PRODUCT SHOWCASE */}
      < section id="features" className="py-20 bg-white border-y border-slate-200/80" >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              আপনার business-এর গুরুত্বপূর্ণ বিষয়গুলো এক নজরে।
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              সহজ ইন্টারফেস দিয়ে প্রতিদিনের জটিল কাজগুলোকে সুশৃঙ্খল করুন।
            </p>
          </div>

          {/* Product Showcase Visual Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
                📈
              </div>
              <h3 className="text-lg font-bold text-slate-900">Income Tracker</h3>
              <p className="text-sm text-slate-600 font-medium">
                কোথা থেকে কত আয় হচ্ছে এবং স্থায়ী বেতনের পাশাপাশি রিকারিং ও প্রজেক্টের আয় ট্র্যাক করুন।
              </p>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold">
                👥
              </div>
              <h3 className="text-lg font-bold text-slate-900">Sales CRM & Pipeline</h3>
              <p className="text-sm text-slate-600 font-medium">
                কোন কাস্টমার কোথায় আছে, কার সাথে কখন কথা বলতে হবে এবং অগ্রিম টাকা পাওয়া সহজে দেখা।
              </p>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold">
                📋
              </div>
              <h3 className="text-lg font-bold text-slate-900">Daily Tasks</h3>
              <p className="text-sm text-slate-600 font-medium">
                আজকের সবচেয়ে গুরুত্বপূর্ণ কাজগুলো অগ্রাধিকার অনুযায়ী সম্পন্ন করার সহজ তালিকা।
              </p>
            </div>

          </div>

        </div>
      </section >

      {/* 06. CORE FEATURES (6 BLOCK GRID WITH MINI UI WIDGETS) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>স্মার্ট বিজনেস ওয়ার্কস্পেস</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Dremoy-এর ৬টি মূল ফিচার
          </h2>
          <p className="text-base sm:text-xl text-slate-600 font-medium leading-relaxed">
            ব্যবসার প্রতিটি গুরুত্বপূর্ণ অংশ পরিচালনা করার জন্য নিখুঁত ও সহজ সমাধান।
          </p>
        </div>

        {/* 6 Grid Cards with Mini UI Mockups */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* 01 — Income */}
          <div className="group bg-white border border-slate-200/90 hover:border-emerald-500/50 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80">01</span>
                <div className="w-11 h-11 bg-emerald-100/70 text-emerald-600 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  আয় ট্র্যাকিং (Income)
                </h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  কোথা থেকে কত আয় হচ্ছে, রিয়েল-টাইম ডাটা সহ সহজে ট্র্যাক করুন।
                </p>
              </div>
            </div>

            {/* Mini Visual Widget */}
            <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 space-y-2 mt-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                <span>আজকের আয়</span>
                <span className="text-emerald-600 font-bold bg-emerald-100/60 px-2 py-0.5 rounded-md text-[11px]">+১৫% বৃদ্ধি</span>
              </div>
              <div className="text-lg font-black text-slate-900">৳ ১,৪৫,০০০</div>
              <div className="flex items-end gap-1.5 h-7 pt-1">
                <div className="w-1/4 bg-emerald-200 rounded-xs h-3"></div>
                <div className="w-1/4 bg-emerald-300 rounded-xs h-5"></div>
                <div className="w-1/4 bg-emerald-400 rounded-xs h-4"></div>
                <div className="w-1/4 bg-emerald-600 rounded-xs h-7"></div>
              </div>
            </div>
          </div>

          {/* 02 — CRM */}
          <div className="group bg-white border border-slate-200/90 hover:border-blue-500/50 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80">02</span>
                <div className="w-11 h-11 bg-blue-100/70 text-blue-600 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  গ্রাহক ও লিড (CRM)
                </h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  Customer ও lead-এর সব হিস্ট্রি এবং কন্টাক্ট তথ্য এক জায়গায় গুছিয়ে রাখুন।
                </p>
              </div>
            </div>

            {/* Mini Visual Widget */}
            <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 space-y-2.5 mt-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                <span>এক্টিভ কন্টাক্টস</span>
                <span className="text-blue-600 font-bold text-[11px]">১২ জন লিড</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between bg-white border border-slate-200/80 px-2.5 py-1.5 rounded-xl text-xs shadow-2xs">
                  <span className="font-bold text-slate-800">আইডিয়াল একাডেমি</span>
                  <span className="bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-md text-[10px]">হট লিড</span>
                </div>
                <div className="flex items-center justify-between bg-white border border-slate-200/80 px-2.5 py-1.5 rounded-xl text-xs shadow-2xs">
                  <span className="font-bold text-slate-800">মডেল স্কুল অ্যান্ড কলেজ</span>
                  <span className="bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-md text-[10px]">ফলো-আপ</span>
                </div>
              </div>
            </div>
          </div>

          {/* 03 — Tasks */}
          <div className="group bg-white border border-slate-200/90 hover:border-indigo-500/50 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80">03</span>
                <div className="w-11 h-11 bg-indigo-100/70 text-indigo-600 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <CheckSquare className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  ডেইলি টাস্ক (Tasks)
                </h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  আজকের জরুরি কাজগুলো অগ্রাধিকার অনুযায়ী সাজিয়ে রাখুন এবং সম্পন্ন করুন।
                </p>
              </div>
            </div>

            {/* Mini Visual Widget */}
            <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 space-y-2 mt-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                <span>আজকের অগ্রগতি</span>
                <span className="text-indigo-600 font-bold text-[11px]">৫/৮ সম্পন্ন</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 bg-white border border-slate-200/80 px-2.5 py-1.5 rounded-xl font-medium text-slate-700 shadow-2xs">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span className="line-through text-slate-400">ইনভয়েস কনফার্মেশন</span>
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200/80 px-2.5 py-1.5 rounded-xl font-bold text-slate-900 shadow-2xs">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-500"></div>
                  <span>বিকেল ৪টায় ক্লায়েন্ট কল</span>
                </div>
              </div>
            </div>
          </div>

          {/* 04 — Pipeline */}
          <div className="group bg-white border border-slate-200/90 hover:border-amber-500/50 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/80">04</span>
                <div className="w-11 h-11 bg-amber-100/70 text-amber-600 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all">
                  <GitPullRequest className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
                  সেলস পাইপলাইন (Pipeline)
                </h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  কোন ডিল বা Opportunity বর্তমানে কোন পর্যায়ে আছে, পরিষ্কারভাবে দেখুন।
                </p>
              </div>
            </div>

            {/* Mini Visual Widget */}
            <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 space-y-2.5 mt-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                <span>ডিল ফ্লো</span>
                <span className="text-amber-600 font-bold text-[11px]">৩টি ক্লোজিং পর্যায়ে</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center text-[10px] font-bold">
                <div className="bg-amber-100/80 text-amber-800 py-1.5 rounded-lg border border-amber-200/60">
                  লিড (৫)
                </div>
                <div className="bg-amber-200/80 text-amber-900 py-1.5 rounded-lg border border-amber-300/60">
                  মিটিং (৩)
                </div>
                <div className="bg-emerald-600 text-white py-1.5 rounded-lg font-black shadow-xs">
                  ডিল (২)
                </div>
              </div>
            </div>
          </div>

          {/* 05 — Expenses */}
          <div className="group bg-white border border-slate-200/90 hover:border-rose-500/50 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200/80">05</span>
                <div className="w-11 h-11 bg-rose-100/70 text-rose-600 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors">
                  খরচ হিসাব (Expenses)
                </h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  বিজনেস সংক্রান্ত সকল খরচ আলাদা ক্যাটাগরিতে নিখুঁতভাবে ট্র্যাক করুন।
                </p>
              </div>
            </div>

            {/* Mini Visual Widget */}
            <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 space-y-2 mt-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                <span>চলতি মাসের খরচ</span>
                <span className="text-rose-600 font-bold">৳ ২৫,০০০</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                <div className="bg-rose-500 h-full w-[60%]"></div>
                <div className="bg-amber-400 h-full w-[25%]"></div>
                <div className="bg-blue-400 h-full w-[15%]"></div>
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-slate-500 pt-0.5">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>অফিস</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>এডস</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>অন্যান্য</span>
              </div>
            </div>
          </div>

          {/* 06 — Business Overview */}
          <div className="group bg-white border border-slate-200/90 hover:border-purple-500/50 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200/80">06</span>
                <div className="w-11 h-11 bg-purple-100/70 text-purple-600 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors">
                  বিজনেস ওভারভিউ (Overview)
                </h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  একটি সেন্ট্রাল কমান্ড সেন্টার থেকে পুরো ব্যবসার সার্বিক অবস্থা এক নজরে দেখুন।
                </p>
              </div>
            </div>

            {/* Mini Visual Widget */}
            <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 space-y-2 mt-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                <span>ব্যবসার স্বাস্থ্য (Health)</span>
                <span className="text-purple-700 font-black bg-purple-100 px-2 py-0.5 rounded-md text-[11px]">৯৮% চমৎকার</span>
              </div>
              <div className="flex items-center justify-between bg-white border border-slate-200/80 p-2.5 rounded-xl shadow-2xs">
                <div className="text-xs font-bold text-slate-800">মোট নিট প্রফিট</div>
                <div className="text-sm font-black text-emerald-600">+৳ ১,২০,০০০</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 07. HOW IT WORKS */}
      < section className="py-20 bg-white border-y border-slate-200/80" >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              শুরু করা সহজ।
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              মাত্র ৩টি সহজ পদক্ষেপে আপনার বিজনেস সিস্টেম সেটআপ করুন।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">

            <div className="space-y-4">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto font-black text-xl shadow-xs">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900">Account তৈরি করুন</h3>
              <p className="text-sm text-slate-600 font-medium">
                ইমেইল দিয়ে বিনামূল্যে নিজের একাউন্ট রেজিস্ট্রেশন করুন।
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto font-black text-xl shadow-xs">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900">আপনার business information যোগ করুন</h3>
              <p className="text-sm text-slate-600 font-medium">
                আপনার সেবা, আয়ের উৎস ও কাস্টমার লিড যুক্ত করুন।
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto font-black text-xl shadow-xs">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900">Dashboard থেকে কাজ পরিচালনা করুন</h3>
              <p className="text-sm text-slate-600 font-medium">
                প্রতিদিনের আয়, কাজ ও কাস্টমার ফলো-আপ পরিচালনা শুরু করুন।
              </p>
            </div>

          </div>

        </div>
      </section >

      {/* 08. DREMOY কার জন্য? */}
      < section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12" >
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Dremoy কার জন্য?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium">
            যাঁরা প্রতিদিনের কাজ ও ব্যবসাকে সহজে গুছিয়ে পরিচালনা করতে চান।
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center font-bold text-slate-800 text-sm shadow-2xs">
            💻 Freelancer
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center font-bold text-slate-800 text-sm shadow-2xs">
            🏪 Small Business Owner
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center font-bold text-slate-800 text-sm shadow-2xs">
            🛠️ Service Provider
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center font-bold text-slate-800 text-sm shadow-2xs">
            🏢 Agency
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center font-bold text-slate-800 text-sm shadow-2xs">
            🛒 Online Seller
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center font-bold text-slate-800 text-sm shadow-2xs">
            💼 Consultant
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center font-bold text-slate-800 text-sm shadow-2xs col-span-2 sm:col-span-2">
            📚 Tutor / Coaching Operator
          </div>
        </div>
      </section>

      {/* 08-B. DEDICATED TUITION & STUDENT FEE MANAGEMENT SHOWCASE */}
      <section id="tuition-showcase" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold tracking-wide">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>টিউশন ও স্টুডেন্ট ফি ট্র্যাকার</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              টিউশনের হিসাবও থাকুক <span className="text-indigo-600">এক জায়গায়।</span>
            </h2>
            <p className="text-base sm:text-xl text-slate-600 font-medium leading-relaxed">
              আপনার সব ছাত্র-ছাত্রী, মাসিক ফি, আদায়কৃত পেমেন্ট ও বকেয়ার হিসাব রাখুন একদম সহজ ও নির্ভুলভাবে।
            </p>
          </div>

          {/* Section Main Content Grid (Features List + Interactive SaaS Mockup) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
            
            {/* Left Column: Core Value Highlights (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              
              <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-5 space-y-2 hover:border-indigo-300 transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold flex-shrink-0 mt-0.5 shadow-2xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">ছাত্রদের সুনির্দিষ্ট তালিকা</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">
                      প্রতিটি শিক্ষার্থীর নাম, বিষয়, শ্রেণী, যোগাযোগের নম্বর এবং চুক্তিভিত্তিক মাসিক ফি এক জায়গায় সাজানো থাকে।
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-5 space-y-2 hover:border-emerald-300 transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold flex-shrink-0 mt-0.5 shadow-2xs">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">আদায় ও বকেয়ার রিয়েল-টাইম ট্র্যাকিং</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">
                      কে ফি দিয়েছে আর কার ফি বাকি আছে, তা খুঁজতে হবে না। এক নজরে বকেয়া তালিকা দেখে অনুস্মারকমূলক ফলো-আপ করুন।
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-5 space-y-2 hover:border-purple-300 transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center font-bold flex-shrink-0 mt-0.5 shadow-2xs">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">পেমেন্ট হিস্ট্রি ও অটো ইনকাম সিঙ্ক</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">
                      বিকাশ, নগদ বা ক্যাশ পেমেন্ট রেকর্ড করার সাথে সাথে তা আপনার মাসিক মোট ইনকাম রিপোর্টে স্বয়ংক্রিয়ভাবে যুক্ত হয়ে যায়।
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => onNavigateToAuth('signup')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 group"
                >
                  <span>টিউশন ট্র্যাকার ব্যবহার শুরু করুন</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>

            {/* Right Column: Realistic SaaS Product Mockup Preview (7 cols) */}
            <div className="lg:col-span-7 bg-[#F8FAFC] border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-xl space-y-5">
              
              {/* Top Control Bar of Mockup */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold shadow-xs">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">টিউশন ও স্টুডেন্ট ড্যাশবোর্ড</h4>
                    <p className="text-[11px] font-semibold text-slate-500">চলতি মাস: মার্চ ২০২৬</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100/80 text-indigo-800 text-xs font-bold self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                  <span>লাইভ ডাটা প্রিভিউ</span>
                </div>
              </div>

              {/* Summary KPI Cards Grid (3 Columns) */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-2 sm:p-3.5 space-y-0.5 shadow-2xs min-w-0">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block truncate">মোট শিক্ষার্থী</span>
                  <div className="text-xs xs:text-sm sm:text-2xl font-black text-slate-900 whitespace-nowrap truncate">১২ জন</div>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-indigo-600 block truncate">৩টি ব্যাচ</span>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-2 sm:p-3.5 space-y-0.5 shadow-2xs min-w-0">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block truncate">এই মাসে আদায়</span>
                  <div className="text-xs xs:text-sm sm:text-2xl font-black text-emerald-600 whitespace-nowrap truncate">৳ ৪৫,০০০</div>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-600 block truncate">৭৯% সংগৃহীত</span>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-2 sm:p-3.5 space-y-0.5 shadow-2xs min-w-0">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block truncate">মোট বকেয়া</span>
                  <div className="text-xs xs:text-sm sm:text-2xl font-black text-rose-600 whitespace-nowrap truncate">৳ ১২,০০০</div>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-rose-600 block truncate">২ জনের বাকি</span>
                </div>
              </div>

              {/* Student Fee Status Table Mockup */}
              <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
                <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-100/70 border-b border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>ছাত্র-ছাত্রীর পেমেন্ট তালিকা</span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500">৪ জন দেখাচ্ছে</span>
                </div>

                <div className="divide-y divide-slate-100 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 text-[10px] sm:text-[11px]">
                      <tr>
                        <th className="py-2 px-2 sm:px-3.5">শিক্ষার্থী ও বিষয়</th>
                        <th className="py-2 px-1 sm:px-3 text-center">মাসিক ফি</th>
                        <th className="py-2 px-1 sm:px-3 text-center">আদায়</th>
                        <th className="py-2 px-1 sm:px-3 text-center">বকেয়া</th>
                        <th className="py-2 px-1.5 sm:px-3.5 text-right">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800 text-[10px] sm:text-xs">
                      
                      {/* Row 1 */}
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-2 sm:px-3.5">
                          <div className="font-bold text-slate-900 leading-tight">রাফিদ আহমেদ</div>
                          <div className="text-[9px] sm:text-[10px] text-slate-500 leading-tight">ক্লাস ১০ (পদার্থ ও গণিত)</div>
                        </td>
                        <td className="py-2.5 px-1 sm:px-3 text-center font-bold text-slate-800 whitespace-nowrap">৳ ৫,০০০</td>
                        <td className="py-2.5 px-1 sm:px-3 text-center font-bold text-emerald-600 whitespace-nowrap">৳ ৫,০০০</td>
                        <td className="py-2.5 px-1 sm:px-3 text-center font-bold text-slate-400 whitespace-nowrap">৳ ০</td>
                        <td className="py-2.5 px-1.5 sm:px-3.5 text-right">
                          <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[8.5px] sm:text-[10px] font-bold whitespace-nowrap">
                            ✓ পরিশোধিত
                          </span>
                        </td>
                      </tr>

                      {/* Row 2 */}
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-2 sm:px-3.5">
                          <div className="font-bold text-slate-900 leading-tight">তাসনিম সুলতানা</div>
                          <div className="text-[9px] sm:text-[10px] text-slate-500 leading-tight">HSC ২য় বর্ষ (আইসিটি)</div>
                        </td>
                        <td className="py-2.5 px-1 sm:px-3 text-center font-bold text-slate-800 whitespace-nowrap">৳ ৬,০০০</td>
                        <td className="py-2.5 px-1 sm:px-3 text-center font-bold text-emerald-600 whitespace-nowrap">৳ ৩,০০০</td>
                        <td className="py-2.5 px-1 sm:px-3 text-center font-bold text-rose-600 whitespace-nowrap">৳ ৩,০০০</td>
                        <td className="py-2.5 px-1.5 sm:px-3.5 text-right">
                          <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[8.5px] sm:text-[10px] font-bold whitespace-nowrap">
                            ● আংশিক
                          </span>
                        </td>
                      </tr>

                      {/* Row 3 */}
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-2 sm:px-3.5">
                          <div className="font-bold text-slate-900 leading-tight">তানভীর হাসান</div>
                          <div className="text-[9px] sm:text-[10px] text-slate-500 leading-tight">ও-লেভেল (রসায়ন)</div>
                        </td>
                        <td className="py-2.5 px-1 sm:px-3 text-center font-bold text-slate-800 whitespace-nowrap">৳ ৯,০০০</td>
                        <td className="py-2.5 px-1 sm:px-3 text-center font-bold text-slate-400 whitespace-nowrap">৳ ০</td>
                        <td className="py-2.5 px-1 sm:px-3 text-center font-bold text-rose-600 whitespace-nowrap">৳ ৯,০০০</td>
                        <td className="py-2.5 px-1.5 sm:px-3.5 text-right">
                          <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[8.5px] sm:text-[10px] font-bold whitespace-nowrap">
                            ✕ বকেয়া
                          </span>
                        </td>
                      </tr>

                      {/* Row 4 */}
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-2 sm:px-3.5">
                          <div className="font-bold text-slate-900 leading-tight">সায়মা চৌধুরী</div>
                          <div className="text-[9px] sm:text-[10px] text-slate-500 leading-tight">ক্লাস ৯ (সাধারণ বিজ্ঞান)</div>
                        </td>
                        <td className="py-2.5 px-1 sm:px-3 text-center font-bold text-slate-800 whitespace-nowrap">৳ ৪,০০০</td>
                        <td className="py-2.5 px-1 sm:px-3 text-center font-bold text-emerald-600 whitespace-nowrap">৳ ৪,০০০</td>
                        <td className="py-2.5 px-1 sm:px-3 text-center font-bold text-slate-400 whitespace-nowrap">৳ ০</td>
                        <td className="py-2.5 px-1.5 sm:px-3.5 text-right">
                          <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[8.5px] sm:text-[10px] font-bold whitespace-nowrap">
                            ✓ পরিশোধিত
                          </span>
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Quick Payment Entry Bar */}
              <div className="p-3 bg-indigo-50/90 border border-indigo-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-semibold text-indigo-900">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>সর্বশেষ পেমেন্ট গ্রহণ: <strong>তাসনিম সুলতানা (৳৩,০০০ - বিকাশ)</strong></span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-200/60 text-indigo-900">
                  স্বয়ংক্রিয় আয়ে যুক্ত
                </span>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 08-C. 90-DAY INCOME GOAL & PROGRESS METHODOLOGY SHOWCASE */}
      <section id="ninety-day-planner" className="py-24 bg-gradient-to-b from-[#F8FAFC] to-slate-100/60 border-y border-slate-200/80 relative overflow-hidden">
        {/* Background Subtle Accent Gradients */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300/80 text-emerald-800 text-xs sm:text-sm font-extrabold tracking-wide shadow-xs">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>৯০ দিনের ইনকাম গোল ও প্রোগ্রেস মেথডোলজি</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              ৯০ দিনের লক্ষ্যকে <span className="text-emerald-600">প্রতিদিনের কাজে</span> নামিয়ে আনুন
            </h2>
            <p className="text-base sm:text-xl text-slate-600 font-medium leading-relaxed">
              Dremoy শুধু আপনার আয়ের হিসাব রাখে না—একটি সুনির্দিষ্ট income goal-এর দিকে আপনার ব্যবসার ধারাবাহিক অগ্রগতি track করতে সাহায্য করে।
            </p>
          </div>

          {/* 5-Step Methodology Flow */}
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                পদ্ধতিগত অগ্রগতি ফ্লো (Goal to Progress Flow)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
              {/* Step 1 */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all relative flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center">01</span>
                  <Target className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">1. Income Goal</h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">
                    কত আয় করতে চান তা সুনির্দিষ্টভাবে নির্ধারণ করুন।
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all relative flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 font-black text-xs flex items-center justify-center">02</span>
                  <Calendar className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">2. 90-Day Plan</h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">
                    ৯০ দিনের বাস্তবসম্মত লক্ষ্য ও রোডম্যাপ সাজান।
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all relative flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">03</span>
                  <CheckSquare className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">3. Daily Actions</h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">
                    প্রতিদিনের সবচেয়ে গুরুত্বপূর্ণ কাজ সম্পন্ন করুন।
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all relative flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">04</span>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">4. Income Tracking</h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">
                    কোথা থেকে কত আয় হচ্ছে সাথে সাথে এনট্রি দিন।
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all relative flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center">05</span>
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">5. Weekly Review</h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">
                    অগ্রগতি দেখে পরবর্তী পদক্ষেপ ও কৌশল ঠিক করুন।
                  </p>
                </div>
              </div>
            </div>

            {/* Connecting Flow Summary Pill */}
            <div className="bg-white/80 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-3 text-center text-xs font-extrabold text-slate-700 shadow-2xs max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-2">
              <span className="text-emerald-700">Income Goal</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-teal-700">90-Day Plan</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-indigo-700">Daily Actions</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-blue-700">Income Tracking</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-purple-700">Weekly Review</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md font-black">অগ্রগতি</span>
            </div>
          </div>

          {/* Product Dashboard Mockup Container */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-8 shadow-xl space-y-6 sm:space-y-8">
            
            {/* Mockup Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-4 sm:pb-5">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-md shadow-emerald-600/20 shrink-0 mt-0.5 sm:mt-0">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-lg font-black text-slate-900 leading-tight">90-Day Income Goal Dashboard</h3>
                    <span className="text-[9.5px] sm:text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0 whitespace-nowrap">
                      Q1 Goal Sprint
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-semibold leading-tight">ডিজিটাল বিজনেস ইনকাম ট্রাক অ্যান্ড প্রোগ্রেস মেথডোলজি</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[11px] sm:text-xs font-extrabold self-start sm:self-auto shrink-0 whitespace-nowrap">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>ট্র্যাকিং সেশন: Day 62 / Day 90</span>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Goal Card */}
              <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-500">
                  <span>90-Day Income Goal</span>
                  <Target className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">৳১,০০,০০০+</div>
                <div className="text-[11px] font-bold text-slate-500">নির্ধারিত লক্ষ্যমাত্রার বাজেট</div>
              </div>

              {/* Progress Card */}
              <div className="bg-emerald-50/60 border border-emerald-200/90 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-emerald-800">
                  <span>Current Progress</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">৳৬৮,৫০০</div>
                <div className="text-[11px] font-bold text-emerald-700">অর্জিত আয়ের রিয়েল-টাইম যোগফল</div>
              </div>

              {/* Progress Rate Card */}
              <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-500">
                  <span>Progress</span>
                  <Activity className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">68.5%</div>
                  <span className="text-xs font-black text-emerald-600">অন-ট্র্যাক</span>
                </div>
                {/* Mini Progress Bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '68.5%' }}></div>
                </div>
              </div>
            </div>

            {/* Visual Timeline Bar Section */}
            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-5 space-y-6">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-700 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>৯০ দিনের রোডম্যাপ টাইমলাইন (Day 1 → Day 30 → Day 60 → Day 90)</span>
                </div>
                <span className="text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md text-[11px] font-black">
                  ৬৮.৫% সম্পন্ন
                </span>
              </div>

              {/* Multi-stage Progress Bar */}
              <div className="relative pt-1 pb-2">
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500" style={{ width: '68.5%' }}></div>
                </div>

                {/* Milestones Grid */}
                <div className="grid grid-cols-4 gap-2 pt-4 text-center">
                  {/* Day 1 */}
                  <div className="space-y-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center font-bold text-xs shadow-xs">
                      ✓
                    </div>
                    <div className="text-xs font-black text-slate-900">Day 1</div>
                    <div className="text-[11px] font-bold text-slate-500">৳০ (শুরু)</div>
                  </div>

                  {/* Day 30 */}
                  <div className="space-y-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center font-bold text-xs shadow-xs">
                      ✓
                    </div>
                    <div className="text-xs font-black text-slate-900">Day 30</div>
                    <div className="text-[11px] font-bold text-slate-600">৳৩০,০০০</div>
                  </div>

                  {/* Day 60 */}
                  <div className="space-y-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center font-bold text-xs shadow-xs">
                      ✓
                    </div>
                    <div className="text-xs font-black text-slate-900">Day 60</div>
                    <div className="text-[11px] font-bold text-slate-600">৳৬৫,০০০</div>
                  </div>

                  {/* Day 90 */}
                  <div className="space-y-1">
                    <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-slate-400 text-slate-600 mx-auto flex items-center justify-center font-bold text-xs">
                      🎯
                    </div>
                    <div className="text-xs font-black text-slate-900">Day 90</div>
                    <div className="text-[11px] font-bold text-emerald-700">৳১,০০,০০০</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Insight Card */}
            <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">সাপ্তাহিক প্রোগ্রেস ইনসাইট</div>
                  <div className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                    “এই সপ্তাহে আপনার অগ্রগতি গত সপ্তাহের তুলনায় +১২%”
                  </div>
                </div>
              </div>

              <div className="px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-xs font-extrabold flex items-center gap-1.5 shrink-0 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>লক্ষ্যের পথে সঠিকভাবে এগোচ্ছেন</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 09. WHY DREMOY? (WORKFLOW VISUALIZATION) */}
      <section id="why-dremoy" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              শুধু একটি কাজ নয়—পুরো workflow এক জায়গায়।
            </h2>
            <p className="text-base text-slate-600 font-medium leading-relaxed">
              বাজারে business software অনেক আছে। কিছু হিসাবকে কেন্দ্র করে, কিছু CRM-কে, কিছু POS বা inventory-কে। Dremoy-এর লক্ষ্য হলো—আপনার প্রতিদিনের business workflow-টা একটি সহজ workspace-এর মধ্যে গুছিয়ে দেওয়া।
            </p>
          </div>

          {/* Workflow Diagram */}
          <div className="bg-[#F8FAFC] border border-slate-200 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">

              <div className="p-4 bg-white border border-slate-200 rounded-2xl w-full md:w-auto font-bold text-xs text-slate-700 shadow-2xs">
                Scattered Work <br />
                <span className="text-[11px] font-medium text-slate-500">(ছড়িয়ে থাকা কাজ)</span>
              </div>

              <div className="text-emerald-500 font-bold text-lg hidden md:block">→</div>

              <div className="p-4 bg-emerald-500 text-white border border-emerald-600 rounded-2xl w-full md:w-auto font-bold text-xs shadow-sm">
                One Workspace <br />
                <span className="text-[11px] font-medium text-emerald-100">(এক বিজনেস ওয়ার্কস্পেস)</span>
              </div>

              <div className="text-emerald-500 font-bold text-lg hidden md:block">→</div>

              <div className="p-4 bg-white border border-slate-200 rounded-2xl w-full md:w-auto font-bold text-xs text-slate-700 shadow-2xs">
                Clear Priorities <br />
                <span className="text-[11px] font-medium text-slate-500">(কাজের স্পষ্টতা)</span>
              </div>

              <div className="text-emerald-500 font-bold text-lg hidden md:block">→</div>

              <div className="p-4 bg-white border border-slate-200 rounded-2xl w-full md:w-auto font-bold text-xs text-slate-700 shadow-2xs">
                Easier Follow-up <br />
                <span className="text-[11px] font-medium text-slate-500">(সহজ ফলো-আপ)</span>
              </div>

              <div className="text-emerald-500 font-bold text-lg hidden md:block">→</div>

              <div className="p-4 bg-white border border-slate-200 rounded-2xl w-full md:w-auto font-bold text-xs text-slate-700 shadow-2xs">
                Better Business Visibility <br />
                <span className="text-[11px] font-medium text-slate-500">(স্পষ্ট বিজনেস চিত্র)</span>
              </div>

            </div>
          </div>

        </div>
      </section >

      {/* 10. VALUE PROPOSITION */}
      < section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto" >
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-6 shadow-xl relative overflow-hidden">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-xs border border-emerald-500/30">
            প্রিমিয়াম ভ্যালু
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-snug">
            আপনি শুধু software-এর জন্য টাকা দিচ্ছেন না।
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed max-w-3xl">
            আপনি এমন একটি workspace-এর জন্য pay করছেন, যেখানে প্রতিদিনের গুরুত্বপূর্ণ business information খুঁজে পেতে কম সময় লাগে, কাজের priority পরিষ্কার থাকে, আর customer follow-up গুছিয়ে রাখা সহজ হয়।
          </p>

          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-semibold text-slate-200">
            <div className="flex items-center gap-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Follow-up ভুলে যাওয়ার সম্ভাবনা কমাতে সাহায্য করে</span>
            </div>
            <div className="flex items-center gap-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>তথ্য খোঁজার সময় বাঁচায়</span>
            </div>
            <div className="flex items-center gap-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>ব্যবসার ওভারঅল স্পষ্টতা বাড়ায়</span>
            </div>
          </div>

        </div>
      </section >

      {/* 11. PRICING / OFFER SECTION */}
      < section id="pricing" className="py-20 bg-white border-y border-slate-200/80" >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          {/* Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              💎 সহজ ও স্বচ্ছ প্রাইসিং
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              আপনার business-এর জন্য একটি পরিষ্কার plan বেছে নিন।
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              আপনার ব্যবসার প্রয়োজনীয়তা অনুযায়ী বেছে নিন নিখুঁত প্ল্যান। কোনো গোপন চার্জ নেই।
            </p>
          </div>

          {/* 3 Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">

            {/* Plan 1: Starter */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between relative">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">স্টার্টার প্ল্যান</span>
                  <h3 className="text-xl font-bold text-slate-900">Starter</h3>
                  <p className="text-xs text-slate-500 font-medium">ফ্রিল্যান্সার ও সোলো উদ্যোক্তাদের জন্য</p>
                </div>

                <div className="flex items-baseline gap-1 pt-2 border-t border-slate-100">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">৳৪৯৯</span>
                  <span className="text-xs font-semibold text-slate-500">/ মাস</span>
                </div>

                <ul className="space-y-3 pt-4 text-xs font-semibold text-slate-700 border-t border-slate-100">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>আয় ও ব্যয় ট্র্যাকিং</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>ডেইলি টাস্ক ম্যানেজার</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>১০ জন পর্যন্ত সেলস লিড (CRM)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>বেসিক বিজনেস ওভারভিউ</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>নিরাপদ ক্লাউড ডাটা সিঙ্ক</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => onNavigateToAuth('signup')}
                  className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-sm transition-all"
                >
                  শুরু করুন
                </button>
              </div>
            </div>

            {/* Plan 2: Pro (Featured) */}
            <div className="bg-white border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between relative transform md:-translate-y-2">

              {/* Featured Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-600 text-white font-bold text-[11px] shadow-sm tracking-wide">
                ★ সবচেয়ে জনপ্রিয়
              </div>

              <div className="space-y-4">
                <div className="space-y-1 pt-1">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">প্রফেশনাল প্ল্যান</span>
                  <h3 className="text-xl font-bold text-slate-900">Pro Business</h3>
                  <p className="text-xs text-slate-500 font-medium">ছোট ব্যবসা ও গ্রোইং উদ্যোক্তাদের জন্য</p>
                </div>

                <div className="flex items-baseline gap-1 pt-2 border-t border-slate-100">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">৳৯৯৯</span>
                  <span className="text-xs font-semibold text-slate-500">/ মাস</span>
                </div>

                <ul className="space-y-3 pt-4 text-xs font-semibold text-slate-800 border-t border-slate-100">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>আনলিমিটেড আয় ও ব্যয় ট্র্যাকিং</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>অ্যাডভান্সড CRM ও পাইপলাইন</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>ক্লায়েন্ট অনুস্মারক ও কাস্টমার ফলো-আপ</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>টিউশন ও সার্ভিস চার্জ ট্র্যাকার</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>৯০ দিনের গোল ও উইকলি রিভিউ</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>প্রায়োরিটি সাপোর্ট</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => onNavigateToAuth('signup')}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20"
                >
                  বিনামূল্যে শুরু করুন
                </button>
              </div>
            </div>

            {/* Plan 3: Business / Agency */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between relative">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">এজেন্সি ও টিম</span>
                  <h3 className="text-xl font-bold text-slate-900">Agency</h3>
                  <p className="text-xs text-slate-500 font-medium">এজেন্সি ও ক্রমবর্ধমান টিম পরিচালনার জন্য</p>
                </div>

                <div className="flex items-baseline gap-1 pt-2 border-t border-slate-100">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">৳১,৯৯৯</span>
                  <span className="text-xs font-semibold text-slate-500">/ মাস</span>
                </div>

                <ul className="space-y-3 pt-4 text-xs font-semibold text-slate-700 border-t border-slate-100">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Pro-এর সকল ফিচার অন্তর্ভুক্ত</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>আনলিমিটেড কাস্টমার ডাটাবেজ</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>কাস্টম রিপোর্ট ও ডাটা এক্সপোর্ট</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>মাল্টি-ডিভাইস এক্সেস</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>ডেডিকেটেড অনবোর্ডিং সাপোর্ট</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => onNavigateToAuth('signup')}
                  className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-sm transition-all"
                >
                  একাউন্ট তৈরি করুন
                </button>
              </div>
            </div>

          </div>

        </div>
      </section >

      {/* 12. FAQ ACCORDION */}
      < section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12" >
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            সাধারণ কিছু প্রশ্ন (FAQ)
          </h2>
          <p className="text-base text-slate-600 font-medium">
            Dremoy সম্পর্কিত আপনার যেকোনো প্রশ্নের সহজ উত্তর।
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Dremoy কী এবং Dremoy IT কী কী সেবা প্রদান করে?',
              a: 'Dremoy হলো আপনার ব্যবসার আয়, খরচ, সিআরএম, টাস্ক ও ৯০ দিনের প্রোগ্রেস অল-ইন-ওয়ান ড্যাশবোর্ডে পরিচালনা করার প্ল্যাটফর্ম। পাশাপাশি Dremoy IT কাস্টম ওয়েব ডেভেলপমেন্ট, ই-কমার্স সলিউশন, আইটি ট্রেনিং, স্মার্ট স্কুল সফটওয়্যার ও ড্রপশিপিং মেন্টরশিপ সেবা দিয়ে থাকে।'
            },
            {
              q: 'Dremoy কার জন্য সবচেয়ে বেশি উপযোগী?',
              a: 'ছোট ও মাঝারি ব্যবসার মালিক, অনলাইন সেলার, ফ্রিল্যান্সার, এজেন্সি, টিউটর/কোচিং অপারেটর এবং টেকনোলজি সার্ভিস নিতে ইচ্ছুক উদ্যোক্তাদের জন্য।'
            },
            {
              q: 'Dremoy-তে কী কী বিজনেস অ্যাক্টিভিটি manage করা যায়?',
              a: 'দৈনিক আয় ও ব্যয় ট্র্যাকিং, সেলস সিআরএম পাইপলাইন, কাজ ও ফলো-আপ টাস্ক (Daily Tasks), টিউশন ও স্টুডент ফি ড্যাশবোর্ড এবং ৯০ দিনের ইনকাম গোল প্রোগ্রেস।'
            },
            {
              q: 'Dremoy IT-এর ট্রেনিং ও মেন্টরশিপের সুযোগ কী কী?',
              a: 'আমাদের আইটি ট্রেনিংয়ের মধ্যে রয়েছে বেসিক কম্পিউটার, প্রফেশনাল অফিস স্কিলস, গ্রাফিক্স ডিজাইন, স্পোকেন ইংলিশ এবং সরাসরি ওয়ান-টু-ওয়ান ই-কমার্স ও ড্রপশিপিং মেন্টরশিপ।'
            },
            {
              q: 'আমি কীভাবে শুরু করব বা সেবা নিতে পারি?',
              a: "'শুরু করুন' বাটনে ক্লিক করে ফ্রি একাউন্ট তৈরি করে আজই বিজনেস ওয়ার্কস্পেস ব্যবহার শুরু করতে পারেন। এছাড়া ওয়েবসাইট ও কন্টাক্ট অপশন থেকে কাস্টম সেবার ডেমো নিতে পারেন।"
            },
            {
              q: 'আমার একাউন্ট ও ব্যবসায়িক ডাটা কতটা নিরাপদ?',
              a: 'আপনার একাউন্টের সকল তথ্য ক্লাউড ডাটাবেজে এনক্রিপ্টেড অবস্থায় সংরক্ষিত থাকে এবং শুধুমাত্র আপনি আপনার একাউন্ট দিয়ে তা এক্সেস করতে পারবেন।'
            },
            {
              q: 'Pricing ও সার্ভিস চার্জ কীভাবে কাজ করবে?',
              a: 'Dremoy বিজনেস ম্যানেজমেন্ট ড্যাশবোর্ডে বর্তমানে প্রারম্ভিক ফ্রি অ্যাক্সেস দেওয়া হচ্ছে। কাস্টম আইটি সলিউশন বা কাস্টম প্রজেক্টের জন্য প্রয়োজন অনুযায়ী সাশ্রয়ী প্ল্যান রয়েছে।'
            }
          ].map((faq, index) => (
            <div key={index} className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden transition-all">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-4.5 text-left font-bold text-slate-900 text-base flex justify-between items-center gap-4 hover:bg-slate-50/80 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === index ? (
                  <ChevronUp className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
              </button>
              {openFaq === index && (
                <div className="px-6 pb-4.5 text-sm font-medium text-slate-600 border-t border-slate-100 pt-3 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section >

      {/* 13. FINAL CTA */}
      < section className="py-20 bg-emerald-950 text-white text-center" >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          <div className="space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              আপনার ব্যবসা আরও গুছিয়ে নেওয়ার সময় এখন।
            </h2>
            <p className="text-base sm:text-xl text-emerald-100 font-medium max-w-2xl mx-auto leading-relaxed">
              আজকের কাজ, customer follow-up, আয় আর business activity—একটি workspace দিয়ে পরিচালনা শুরু করুন।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigateToAuth('signup')}
              className="w-full sm:w-auto px-9 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-base sm:text-lg transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 group"
            >
              <span>শুরু করুন</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigateToAuth('login')}
              className="w-full sm:w-auto px-9 py-4 bg-emerald-900/60 border border-emerald-700 text-white hover:bg-emerald-900 font-bold rounded-2xl text-base sm:text-lg transition-all"
            >
              লগইন করুন
            </button>
          </div>

        </div>
      </section >

      {/* 14. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/80">
            {/* 1. Brand & Info */}
            <div className="space-y-3 col-span-1 md:col-span-1">
              <div className="text-white font-bold text-xl flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shadow-sm shadow-emerald-500/30">
                  D
                </div>
                Dremoy
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                উদ্যোক্তাদের জন্য স্মার্ট বিজনেস ম্যানেজমেন্ট প্ল্যাটফর্ম।
              </p>
            </div>

            {/* 2. Navigation Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">ন্যাভিগেশন</h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-400">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-emerald-400 transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('why-dremoy')} className="hover:text-emerald-400 transition-colors">Why Dremoy</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-emerald-400 transition-colors">Pricing</button></li>
                <li><button onClick={() => scrollToSection('faq')} className="hover:text-emerald-400 transition-colors">FAQ</button></li>
              </ul>
            </div>

            {/* 3. Account Actions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">একাউন্ট</h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-400">
                <li><button onClick={() => onNavigateToAuth('login')} className="hover:text-emerald-400 transition-colors">লগইন করুন</button></li>
                <li><button onClick={() => onNavigateToAuth('signup')} className="hover:text-emerald-400 transition-colors">শুরু করুন (ফ্রি একাউন্ট)</button></li>
              </ul>
            </div>

            {/* 4. Support & Legal Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">সাপোর্ট ও লিগ্যাল</h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-400">
                <li>
                  <button 
                    onClick={() => scrollToSection('faq')} 
                    className="hover:text-emerald-400 transition-colors text-left"
                  >
                    Contact / Support (FAQ)
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setLegalModal('privacy')} 
                    className="hover:text-emerald-400 transition-colors text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setLegalModal('terms')} 
                    className="hover:text-emerald-400 transition-colors text-left"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
            <p>© 2026 Dremoy. All rights reserved.</p>
            <p className="text-[11px] text-slate-400">Business Management SaaS</p>
          </div>

        </div>
      </footer>

      {/* LEGAL MODAL */}
      {legalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setLegalModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                {legalModal === 'privacy' ? 'Privacy Policy (গোপনীয়তা নীতি)' : 'Terms of Service (ব্যবহারের শর্তাবলী)'}
              </h3>
              <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md inline-block">
                Dremoy Official Notice
              </p>
            </div>
            <div className="text-sm text-slate-600 font-medium space-y-3 leading-relaxed">
              {legalModal === 'privacy' ? (
                <>
                  <p>Dremoy আপনার তথ্যের নিরাপত্তা ও গোপনীয়তা রক্ষায় সর্বোচ্চ গুরুত্ব দেয়।</p>
                  <p>প্ল্যাটফর্মে সংরক্ষিত সকল ব্যবসায়িক ডাটা সুরক্ষিত ও এনক্রিপ্টেড অবস্থায় রাখা হয় এবং ব্যবহারকারীর অনুমতি ছাড়া অন্য কোনো উদ্দেশ্যে ব্যবহার করা হয় না।</p>
                  <p className="text-xs text-slate-400 italic">সর্বশেষ আপডেট: সেপ্টেম্বর ২০২৬</p>
                </>
              ) : (
                <>
                  <p>Dremoy বিজনেস ম্যানেজমেন্ট প্ল্যাটফর্মের ব্যবহারের শর্তাবলী।</p>
                  <p>প্ল্যাটফর্মটি সফলভাবে পরিচালনার জন্য সকল ব্যবহারকারীকে সুনির্দিষ্ট নির্দেশনা মেনে চলতে হয়। ব্যবহারের নীতি ও নিয়মাবলী নিয়মিত পরিমার্জনযোগ্য।</p>
                  <p className="text-xs text-slate-400 italic">সর্বশেষ আপডেট: সেপ্টেম্বর ২০২৬</p>
                </>
              )}
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setLegalModal(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div >
  );
}
