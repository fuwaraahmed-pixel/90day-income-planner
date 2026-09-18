import React, { useState } from 'react';
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
  Target
} from 'lucide-react';

export default function LandingPage({ onNavigateToAuth }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

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
            <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy underline-offset-8">এক জায়গায়।</span>
          </h1>
          <p className="text-base sm:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            আয়, খরচ, customer, follow-up, কাজ আর business progress—সবকিছু এক workspace থেকে সহজভাবে পরিচালনা করুন।
          </p>
        </div>

        {/* Hero Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
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
        </div>

        {/* Hero Visual — Large Dominant Dremoy Dashboard Preview */}
        <div className="pt-8 max-w-6xl mx-auto">
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
        </div>

      </section>

      {/* 03. PROBLEM SECTION */}
      <section id="problem" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              ব্যবসার কাজ কোথায় কোথায় ছড়িয়ে আছে?
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              আপনার ব্যবসার প্রতিদিনের হিসাব ও কাজগুলো সাধারণত আলাদা আলাদা জায়গায় পেঁচিয়ে থাকে।
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 text-center space-y-3 hover:border-slate-300 transition-all">
              <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">হিসাব খাতায়</h3>
              <p className="text-xs text-slate-500 font-medium">কাগজের খাতায় হিসাব রাখা</p>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 text-center space-y-3 hover:border-slate-300 transition-all">
              <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Messenger-এ</h3>
              <p className="text-xs text-slate-500 font-medium">কাস্টমার চ্যাট ছড়ানো</p>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 text-center space-y-3 hover:border-slate-300 transition-all">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center mx-auto">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Excel-এ</h3>
              <p className="text-xs text-slate-500 font-medium">স্প্রেডশিটের জটিলতা</p>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 text-center space-y-3 hover:border-slate-300 transition-all">
              <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">ফোনের নোট</h3>
              <p className="text-xs text-slate-500 font-medium">মোবাইল অ্যাপে নোটিং</p>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 text-center space-y-3 hover:border-slate-300 transition-all">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center mx-auto">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">মনে রাখা</h3>
              <p className="text-xs text-slate-500 font-medium">ফলো-আপ মনে রাখা</p>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 text-center space-y-3 hover:border-slate-300 transition-all">
              <div className="w-12 h-12 bg-rose-50 text-rose-700 rounded-xl flex items-center justify-center mx-auto">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">আলাদা জায়গায়</h3>
              <p className="text-xs text-slate-500 font-medium">ফলো-আপ ট্র্যাকিং</p>
            </div>
          </div>

          {/* Empathetic Conclusion Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 text-center max-w-3xl mx-auto space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              সমস্যা software-এর অভাব নয়।
            </h3>
            <p className="text-base text-slate-600 font-semibold">
              সমস্যা হলো—গুরুত্বপূর্ণ কাজগুলো এক জায়গায় নেই।
            </p>
          </div>

        </div>
      </section>

      {/* 04. WITHOUT DREMOY VS WITH DREMOY */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
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
      </section>

      {/* 05. PRODUCT SHOWCASE */}
      <section id="features" className="py-20 bg-white border-y border-slate-200/80">
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
      </section>

      {/* 06. CORE FEATURES (6 BLOCK GRID) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Dremoy-এর ৬টি মূল ফিচার
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium">
            ব্যবসার প্রতিটি গুরুত্বপূর্ণ অংশ পরিচালনা করার জন্য নিখুঁত টুলস।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 01 — Income */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-2xs hover:shadow-md transition-all">
            <div className="text-xs font-bold text-emerald-600">01</div>
            <h3 className="text-lg font-bold text-slate-900">Income</h3>
            <p className="text-sm text-slate-600 font-medium">
              কোথা থেকে কত আয় হচ্ছে, সহজে দেখুন।
            </p>
          </div>

          {/* 02 — CRM */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-2xs hover:shadow-md transition-all">
            <div className="text-xs font-bold text-emerald-600">02</div>
            <h3 className="text-lg font-bold text-slate-900">CRM</h3>
            <p className="text-sm text-slate-600 font-medium">
              Customer ও lead-এর তথ্য গুছিয়ে রাখুন।
            </p>
          </div>

          {/* 03 — Tasks */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-2xs hover:shadow-md transition-all">
            <div className="text-xs font-bold text-emerald-600">03</div>
            <h3 className="text-lg font-bold text-slate-900">Tasks</h3>
            <p className="text-sm text-slate-600 font-medium">
              আজকের গুরুত্বপূর্ণ কাজগুলো এক জায়গায় রাখুন।
            </p>
          </div>

          {/* 04 — Pipeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-2xs hover:shadow-md transition-all">
            <div className="text-xs font-bold text-emerald-600">04</div>
            <h3 className="text-lg font-bold text-slate-900">Pipeline</h3>
            <p className="text-sm text-slate-600 font-medium">
              কোন opportunity কোথায় আছে, বুঝতে সহজ হবে।
            </p>
          </div>

          {/* 05 — Expenses */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-2xs hover:shadow-md transition-all">
            <div className="text-xs font-bold text-emerald-600">05</div>
            <h3 className="text-lg font-bold text-slate-900">Expenses</h3>
            <p className="text-sm text-slate-600 font-medium">
              Business-এর খরচগুলো আলাদা করে track করুন।
            </p>
          </div>

          {/* 06 — Business Overview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-2xs hover:shadow-md transition-all">
            <div className="text-xs font-bold text-emerald-600">06</div>
            <h3 className="text-lg font-bold text-slate-900">Business Overview</h3>
            <p className="text-sm text-slate-600 font-medium">
              ব্যবসার বর্তমান অবস্থাটা এক নজরে দেখুন।
            </p>
          </div>

        </div>
      </section>

      {/* 07. HOW IT WORKS */}
      <section className="py-20 bg-white border-y border-slate-200/80">
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
      </section>

      {/* 08. DREMOY কার জন্য? */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
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
      </section>

      {/* 10. VALUE PROPOSITION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
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
      </section>

      {/* 11. PRICING / OFFER SECTION */}
      <section id="pricing" className="py-20 bg-white border-y border-slate-200/80">
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
      </section>

      {/* 12. FAQ ACCORDION */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
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
              q: 'Dremoy কী?',
              a: 'Dremoy হলো আপনার ব্যবসার আয়, খরচ, কাস্টমার, সিআরএম, টাস্ক ও ডেইলি প্রোগ্রেস এক জায়গায় পরিচালনা করার একটি প্র্যাকটিক্যাল বিজনেস ওয়ার্কস্পেস।'
            },
            {
              q: 'Dremoy কার জন্য?',
              a: 'ছোট ব্যবসার মালিক, ফ্রিল্যান্সার, এজেন্সি, সার্ভিস প্রোভাইডার, অনলাইন সেলার ও কোচিং অপারেটরদের জন্য উপযুক্ত।'
            },
            {
              q: 'Dremoy-তে কী কী manage করা যায়?',
              a: 'আয় ও ব্যয় ট্র্যাকিং, সেলস সিআরএম পাইপলাইন, দৈনিক কাজ, ক্লায়েন্ট ফলো-আপ ও বিজনেস ওভারভিউ।'
            },
            {
              q: 'আমি কীভাবে শুরু করব?',
              a: "'শুরু করুন' বাটনে ক্লিক করে ইমেইল দিয়ে ১ মিনিটে ফ্রি একাউন্ট তৈরি করে আজই শুরু করতে পারেন।"
            },
            {
              q: 'আমার business information কীভাবে যোগ করব?',
              a: 'একাউন্টে লগইন করে ড্যাশবোর্ডের সেটিংসে আপনার সার্ভিস, লক্ষ্য ও ক্লায়েন্ট ইনফরমেশন সহজেই যোগ করতে পারবেন।'
            },
            {
              q: 'Pricing কীভাবে কাজ করবে?',
              a: 'বর্তমানে প্রাথমিক ব্যবহারকারীদের জন্য প্রারম্ভিক অ্যাক্সেস দেওয়া হচ্ছে। খুব শিগগিরই সহজ ও সাশ্রয়ী প্ল্যান প্রকাশ করা হবে।'
            },
            {
              q: 'আমার account ও data কীভাবে পরিচালিত হবে?',
              a: 'আপনার একাউন্টের সকল তথ্য নিরাপদ ক্লাউড ডাটাবেজে সংরক্ষিত থাকে এবং শুধুমাত্র আপনি আপনার একাউন্ট দিয়ে তা দেখতে ও পরিচালনা করতে পারবেন।'
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
      </section>

      {/* 13. FINAL CTA */}
      <section className="py-20 bg-emerald-950 text-white text-center">
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
      </section>

      {/* 14. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
          
          <div className="space-y-1 text-center md:text-left">
            <div className="text-white font-bold text-lg flex items-center justify-center md:justify-start gap-2">
              <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                D
              </div>
              Dremoy
            </div>
            <p className="text-xs text-slate-400 font-medium">Business Management SaaS</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 font-semibold text-slate-300 text-xs">
            <button onClick={() => scrollToSection('features')} className="hover:text-emerald-400">Features</button>
            <button onClick={() => scrollToSection('why-dremoy')} className="hover:text-emerald-400">Why Dremoy</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-emerald-400">Pricing</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-emerald-400">FAQ</button>
            <button onClick={() => onNavigateToAuth('login')} className="hover:text-emerald-400">Login</button>
          </div>

          <div className="text-xs text-slate-400 font-medium text-center">
            © 2026 Dremoy. All rights reserved.
          </div>

        </div>
      </footer>

    </div>
  );
}
