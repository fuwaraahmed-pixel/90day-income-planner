import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ArrowRight,
  TrendingUp,
  Target,
  Users,
  ShieldCheck,
  Check,
  Building2,
  User,
  Mail,
  Phone,
  KeyRound,
  ExternalLink,
  HelpCircle,
  Menu,
  X,
  Database,
  Lock,
  Globe,
  MessageCircle
} from 'lucide-react';
import { PLANS } from '../utils/plans';

export default function Auth({ 
  initialSignUp = false, 
  initialResetMode = false,
  onPasswordResetSuccess,
  onBackToLanding 
}) {
  const [isSignUp, setIsSignUp] = useState(initialSignUp);
  
  // Shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Signup-specific fields
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [legalModal, setLegalModal] = useState(null);

  const navItems = [
    { id: 'features', label: 'ফিচারসমূহ' },
    { id: 'tuition-showcase', label: 'টিউশন ট্র্যাকার' },
    { id: 'ninety-day-planner', label: '৯০ দিনের গোল' },
    { id: 'why-dremoy', label: 'কেন Dremoy?' },
    { id: 'pricing', label: 'প্রাইসিং' },
    { id: 'faq', label: 'FAQ' },
  ];

  // Password reset flow
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // New Password Setup (Recovery Callback Flow)
  const [isResetMode, setIsResetMode] = useState(() => {
    if (initialResetMode) return true;
    if (typeof window !== 'undefined') {
      const search = window.location.search || '';
      const hash = window.location.hash || '';
      const isExplicitRecovery = search.includes('recovery=true') || 
                                 search.includes('type=recovery') ||
                                 hash.includes('type=recovery');
      const isAwaitingRecovery = sessionStorage.getItem('dremoy_awaiting_recovery') === 'true' && 
                                 (search.includes('code=') || hash.includes('access_token=') || isExplicitRecovery);
      return Boolean(isExplicitRecovery || isAwaitingRecovery);
    }
    return false;
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Detect recovery mode from hash or auth event
  useEffect(() => {
    // 1. Check if URL search or hash indicates recovery
    if (typeof window !== 'undefined') {
      if (window.location.search.includes('recovery=true') || window.location.hash.includes('type=recovery')) {
        setIsResetMode(true);
      }
    }

    // 2. Listen for Supabase PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsResetMode(true);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    try {
      const storedPlanId = localStorage.getItem('dremoy_selected_plan');
      if (storedPlanId) {
        const found = Object.values(PLANS).find(p => p.id === storedPlanId);
        if (found) setSelectedPlan(found);
      }
    } catch {
      // localStorage fallback
    }
  }, []);

  const getAuthErrorMessage = (error) => {
    if (!error) return 'সার্ভারে একটি সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
    const msg = (error.message || '').toLowerCase();
    const code = error.code || '';
    const status = error.status || 0;

    if (msg.includes('invalid login credentials') || code === 'invalid_credentials') {
      return 'ইমেইল অথবা পাসওয়ার্ড ভুল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
    }
    if (msg.includes('email not confirmed') || code === 'email_not_confirmed') {
      return 'আপনার ইমেইলটি এখনও ভেরিফাই করা হয়নি। অনুগ্রহ করে আপনার ইনবক্স চেক করে লিংকটিতে ক্লিক করুন।';
    }
    if (msg.includes('already registered') || code === 'user_already_exists') {
      return 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট তৈরি করা আছে। দয়া করে লগইন করুন।';
    }
    if (msg.includes('invalid email') || code === 'validation_failed') {
      return 'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।';
    }
    if (msg.includes('weak_password') || msg.includes('password should be at least') || code === 'weak_password') {
      return 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।';
    }
    if (msg.includes('same_password')) {
      return 'নতুন পাসওয়ার্ড আগের পাসওয়ার্ড থেকে ভিন্ন হতে হবে।';
    }
    if (msg.includes('rate limit') || msg.includes('too many requests') || status === 429 || code === 'over_email_send_rate_limit') {
      return 'অতিরিক্ত চেষ্টার কারণে সাময়িকভাবে অনুরোধ সীমিত করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
    }
    if (msg.includes('failed to fetch') || msg.includes('network error')) {
      return 'ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।';
    }

    return error.message || 'সার্ভারে একটি সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
  };

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass) || /[A-Z]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, text: 'দুর্বল (Weak)', color: 'bg-rose-500', width: 'w-1/4' };
      case 2:
        return { score: 2, text: 'মোটামুটি (Fair)', color: 'bg-amber-500', width: 'w-2/4' };
      case 3:
        return { score: 3, text: 'ভালো (Good)', color: 'bg-blue-500', width: 'w-3/4' };
      case 4:
        return { score: 4, text: 'খুব শক্তিশালী (Strong)', color: 'bg-emerald-500', width: 'w-full' };
      default:
        return { score: 0, text: '', color: 'bg-slate-200', width: 'w-0' };
    }
  };

  const passwordStrength = getPasswordStrength(password);
  const newPasswordStrength = getPasswordStrength(newPassword);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    if (isSignUp && !agreeTerms) {
      setErrorMessage('শর্তাবলী ও প্রাইভেসি পলিসি মেনে নেওয়া বাধ্যতামূলক।');
      return;
    }

    if (!isSupabaseConfigured) {
      setErrorMessage('Supabase কনফিগারেশন অনুপস্থিত! দয়া করে .env.local ফাইলে VITE_SUPABASE_URL এবং VITE_SUPABASE_ANON_KEY সেট করুন।');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: password,
          options: {
            data: {
              full_name: fullName.trim() || undefined,
              business_name: businessName.trim() || undefined,
              phone: phone.trim() || undefined,
            }
          }
        });

        if (error) {
          setErrorMessage(getAuthErrorMessage(error));
        } else if (data?.user && data?.session === null) {
          setSuccessMessage('আপনার ইমেইলে একটি নিশ্চিতকরণ লিংক পাঠানো হয়েছে। ইনবক্স চেক করে ইমেইল ভেরিফাই করুন।');
        } else {
          setSuccessMessage('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! প্রবেশ করা হচ্ছে...');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password,
        });

        if (error) {
          setErrorMessage(getAuthErrorMessage(error));
        }
      }
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) setErrorMessage(getAuthErrorMessage(error));
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার ইমেইল ঠিকানা দিন।');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const normalizedEmail = email.trim().toLowerCase();
      
      // Mark browser as awaiting recovery so returning link is caught without fail
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('dremoy_awaiting_recovery', 'true');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/?recovery=true`
      });

      if (error) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('dremoy_awaiting_recovery');
        }
        setErrorMessage(getAuthErrorMessage(error));
      } else {
        setResetEmailSent(true);
        setSuccessMessage('পাসওয়ার্ড রিসেটের লিংক আপনার ইমেইলে পাঠানো হয়েছে। অনুগ্রহ করে ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন।');
      }
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Submit New Password (Recovery Flow)
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না।');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setErrorMessage(getAuthErrorMessage(error));
      } else {
        setResetCompleted(true);
        setSuccessMessage('আপনার পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!');
        
        // Clean URL search and hash without exposing recovery tokens in history
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('dremoy_awaiting_recovery');
          if (window.history?.replaceState) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }

        setTimeout(() => {
          setIsResetMode(false);
          setIsForgotPassword(false);
          setResetCompleted(false);
          setNewPassword('');
          setConfirmPassword('');
          if (onPasswordResetSuccess) {
            onPasswordResetSuccess();
          }
        }, 1500);
      }
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-[#06201b] font-sans text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Decorative ambient background glows */}
      <div className="absolute top-[-120px] left-[-100px] w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[600px] h-[600px] bg-teal-500/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* HEADER / NAVIGATION (Exact Landing Page Navbar) */}
      <header className="sticky top-0 z-50 bg-slate-950/70 backdrop-blur-md border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">

          {/* Logo */}
          <button
            type="button"
            onClick={onBackToLanding || undefined}
            className="flex items-center group outline-none text-left cursor-pointer bg-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-xs border border-white/20 transition-transform hover:scale-105"
            aria-label="Dremoy হোম পেজে যান"
          >
            <img 
              src="/dremoy.png" 
              alt="Dremoy Logo" 
              className="h-8 sm:h-10 w-auto object-contain" 
            />
          </button>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-slate-300" aria-label="প্রধান মেনু">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (onBackToLanding) {
                    onBackToLanding();
                    setTimeout(() => {
                      const el = document.getElementById(item.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
                className="px-3 py-1.5 rounded-xl font-bold text-sm text-slate-300 hover:text-emerald-400 hover:bg-slate-800/60 transition-all cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Action CTAs (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setIsForgotPassword(false);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`px-4 py-2 text-sm font-bold transition-colors rounded-xl cursor-pointer ${
                !isSignUp && !isForgotPassword && !isResetMode
                  ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                  : 'text-slate-300 hover:text-emerald-400 hover:bg-slate-800/60'
              }`}
            >
              লগইন করুন
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setIsForgotPassword(false);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 cursor-pointer"
            >
              শুরু করুন
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-navigation"
            className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-4 pt-3 pb-6 space-y-4 shadow-2xl animate-in slide-in-from-top duration-200"
          >
            <nav className="flex flex-col gap-1.5 font-semibold text-slate-200 text-base" aria-label="মোবাইল মেনু">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onBackToLanding) {
                      onBackToLanding();
                      setTimeout(() => {
                        const el = document.getElementById(item.id);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }
                  }}
                  className="text-left py-2.5 px-3.5 rounded-xl font-bold transition-all text-slate-300 hover:bg-slate-800/80 hover:text-emerald-400 cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsSignUp(false);
                  setIsForgotPassword(false);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="w-full py-2.5 text-center text-sm font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                লগইন করুন
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsSignUp(true);
                  setIsForgotPassword(false);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="w-full py-2.5 text-center text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
              >
                শুরু করুন
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex items-start">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start pt-2 sm:pt-4">

          {/* LEFT COLUMN: Clean Brand Value Proposition */}
          <div className="lg:col-span-6 space-y-6 text-left order-1 lg:order-1 lg:pr-6 lg:sticky lg:top-28">
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>ব্যবসায়িক আয়, ব্যয় ও হিসাব ব্যবস্থাপনা</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.2]">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-black drop-shadow-sm">
                  "তথ্য খুঁজতে নয়"
                </span>{' '}
                —{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  ব্যবসা বাড়াতে সময় দিন।
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl">
                ব্যবসার আয়, পাওনা আর খরচের হিসাব সামলান সহজে—যাতে হিসাবের পেছনে কম সময় দিয়ে, ব্যবসা বাড়াতে বেশি সময় দিতে পারেন।
              </p>
            </div>

            {/* Trust & Enterprise Architecture Badges (Enhanced Premium Visibility) */}
            <div className="pt-5 sm:pt-7 space-y-4 max-w-xl">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-extrabold tracking-wider uppercase text-emerald-400">
                  নিরাপত্তা ও ডাটা প্রটেকশন
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/40 via-emerald-500/20 to-transparent" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Badge 1: Supabase Cloud */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 hover:border-emerald-500/50 shadow-lg shadow-black/30 backdrop-blur-xl flex items-start gap-3.5 transition-all duration-200 group hover:-translate-y-0.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-xs group-hover:bg-emerald-500/25 transition-colors">
                    <Database className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      Supabase ক্লাউড ডাটাবেজ
                    </h4>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                      আপনার ব্যবসার প্রতিটি হিসাব নিরাপদে ক্লাউডে ব্যাকআপ থাকে।
                    </p>
                  </div>
                </div>

                {/* Badge 2: Bank-Grade RLS Security */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 hover:border-teal-500/50 shadow-lg shadow-black/30 backdrop-blur-xl flex items-start gap-3.5 transition-all duration-200 group hover:-translate-y-0.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0 shadow-xs group-hover:bg-teal-500/25 transition-colors">
                    <ShieldCheck className="w-5 h-5 text-teal-300" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                      রো-লেভেল সিকিউরিটি (RLS)
                    </h4>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                      শুধুমাত্র আপনি ছাড়া অন্য কেউ আপনার ডাটা দেখতে বা পরিবর্তন করতে পারবে না।
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Footer Mini Row */}
              <div className="flex flex-wrap items-center gap-5 pt-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 border border-slate-800 text-xs font-semibold text-slate-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>৯৯.৯% আপটাইম নিশ্চয়তা</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 border border-slate-800 text-xs font-semibold text-slate-200 shadow-xs">
                  <Lock className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>সম্পূর্ণ এনক্রিপ্টেড ও সুরক্ষিত</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Authentication Card (Mobile-First Priority) */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto order-2 lg:order-2">
            
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl shadow-emerald-950/40 p-5 sm:p-7 space-y-5">


              {/* Card Header & Selected Plan Badge */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {isResetMode 
                      ? 'নতুন পাসওয়ার্ড দিন' 
                      : isForgotPassword 
                        ? 'পাসওয়ার্ড পুনরুদ্ধার' 
                        : isSignUp 
                          ? 'নতুন অ্যাকাউন্ট খুলুন' 
                          : 'লগইন করুন'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {isResetMode
                      ? 'আপনার অ্যাকাউন্টের জন্য নতুন ও শক্তিশালী পাসওয়ার্ড সেট করুন'
                      : isForgotPassword 
                        ? 'আপনার অ্যাকাউন্টের ইমেইলে রিসেট লিংক পাঠানো হবে'
                        : isSignUp 
                          ? 'আপনার তথ্যাদি দিয়ে ড্রিময় ওয়ার্কস্পেসে যুক্ত হোন' 
                          : 'আপনার ড্রিময় অ্যাকাউন্টে প্রবেশ করতে তথ্য দিন'}
                  </p>
                </div>

                {selectedPlan && !isResetMode && (
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                    {selectedPlan.name}
                  </span>
                )}
              </div>

              {/* Tab Switcher: Sign In vs Sign Up (Visible when not in forgot password or reset mode) */}
              {!isForgotPassword && !isResetMode && (
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className={`py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                      !isSignUp 
                        ? 'bg-white text-slate-900 shadow-sm font-black' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className={`py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSignUp 
                        ? 'bg-white text-slate-900 shadow-sm font-black' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Account</span>
                  </button>
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs font-medium flex items-start gap-2.5 text-left">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Alert */}
              {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs font-medium flex items-start gap-2.5 text-left">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* RECOVERY: NEW PASSWORD SUBMISSION VIEW */}
              {isResetMode ? (
                <form onSubmit={handleUpdatePassword} className="space-y-4 text-left">
                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      নতুন পাসওয়ার্ড <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        disabled={loading || resetCompleted}
                        minLength={6}
                        placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        title={showNewPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* New Password Strength Meter */}
                    {newPassword && (
                      <div className="mt-2 space-y-1">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-300 ${newPasswordStrength.color} ${newPasswordStrength.width}`}></div>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-500">
                          নিরাপত্তা মান: <span className="font-bold text-slate-700">{newPasswordStrength.text}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      পাসওয়ার্ড নিশ্চিত করুন <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        disabled={loading || resetCompleted}
                        minLength={6}
                        placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        title={showConfirmPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Update Password Button */}
                  <button
                    type="submit"
                    disabled={loading || resetCompleted || !newPassword || !confirmPassword}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    <span>{loading ? 'সংরক্ষণ করা হচ্ছে...' : resetCompleted ? 'পাসওয়ার্ড সফল' : 'পাসওয়ার্ড পরিবর্তন করুন'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          sessionStorage.removeItem('dremoy_awaiting_recovery');
                          if (window.history?.replaceState) {
                            window.history.replaceState(null, '', window.location.pathname);
                          }
                        }
                        setIsResetMode(false);
                        setIsForgotPassword(false);
                        setErrorMessage('');
                        setSuccessMessage('');
                        if (onPasswordResetSuccess) {
                          onPasswordResetSuccess();
                        }
                      }}
                      className="text-xs text-slate-600 hover:text-slate-900 font-semibold underline cursor-pointer"
                    >
                      বাতিল করে লগইন পেজে ফিরে যান
                    </button>
                  </div>
                </form>
              ) : isForgotPassword ? (
                <form onSubmit={handleResetPassword} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      রেজিস্টার্ড ইমেইল এড্রেস
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        disabled={resetEmailSent}
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || resetEmailSent}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{loading ? 'প্রসেসিং হচ্ছে...' : resetEmailSent ? 'লিংক পাঠানো হয়েছে' : 'রিসেট লিংক পাঠান'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setResetEmailSent(false);
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className="text-xs text-slate-600 hover:text-slate-900 font-semibold underline cursor-pointer"
                    >
                      লগইন পেজে ফিরে যান
                    </button>
                  </div>
                </form>
              ) : (
                /* REGULAR SIGN IN / SIGN UP FORM */
                <form onSubmit={handleAuth} className="space-y-4 text-left">
                  
                  {/* Additional Signup Fields */}
                  {isSignUp && (
                    <>
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          আপনার নাম <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                          <input
                            type="text"
                            required
                            placeholder="যেমন: মোঃ সাকিব আহমেদ"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all"
                          />
                        </div>
                      </div>

                      {/* Optional Business & Phone in 2 Columns */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Business Name (Optional) */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-slate-700 truncate">
                              প্রতিষ্ঠানের নাম
                            </label>
                            <span className="text-[10px] text-slate-400">ঐচ্ছিক</span>
                          </div>
                          <div className="relative">
                            <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                            <input
                              type="text"
                              placeholder="ব্যবসার নাম"
                              value={businessName}
                              onChange={(e) => setBusinessName(e.target.value)}
                              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all"
                            />
                          </div>
                        </div>

                        {/* Phone Number (Optional) */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-slate-700">
                              মোবাইল নম্বর
                            </label>
                            <span className="text-[10px] text-slate-400">ঐচ্ছিক</span>
                          </div>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                            <input
                              type="tel"
                              placeholder="01XXXXXXXXX"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email Field (Always present) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ইমেইল ঠিকানা <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        পাসওয়ার্ড <span className="text-rose-500">*</span>
                      </label>
                      {!isSignUp && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setErrorMessage('');
                            setSuccessMessage('');
                          }}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline transition-colors cursor-pointer"
                        >
                          পাসওয়ার্ড ভুলে গেছেন?
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Meter (Shown only on signup) */}
                    {isSignUp && password && (
                      <div className="mt-2 space-y-1">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`}></div>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-500">
                          নিরাপত্তা মান: <span className="font-bold text-slate-700">{passwordStrength.text}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Terms & Privacy Consent (Signup only) */}
                  {isSignUp && (
                    <div className="pt-1">
                      <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                        <span>
                          আমি ড্রিময়-এর <span className="font-semibold text-slate-900">শর্তাবলী</span> ও <span className="font-semibold text-slate-900">গোপনীয়তা নীতি</span> মেনে নিচ্ছি।
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Primary Action Button */}
                  <button
                    type="submit"
                    disabled={loading || (isSignUp && !agreeTerms)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <span>প্রসেসিং হচ্ছে...</span>
                    ) : isSignUp ? (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                </form>
              )}

              {/* Social OAuth Divider & Google Button (Standard OAuth implementation) */}
              {!isForgotPassword && (
                <div className="space-y-4 pt-1">
                  <div className="relative flex items-center justify-center">
                    <div className="w-full border-t border-slate-200"></div>
                    <span className="absolute bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      বা সরাসরি
                    </span>
                  </div>

                  {/* Standard Google OAuth Button */}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleGoogleLogin}
                    className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-300 active:scale-[0.99] text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer shadow-2xs"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>
              )}

              {/* Bottom Switcher */}
              <div className="pt-2 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-600 font-medium">
                  {isSignUp ? (
                    <>
                      আগে থেকেই অ্যাকাউন্ট আছে?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(false);
                          setIsForgotPassword(false);
                          setErrorMessage('');
                          setSuccessMessage('');
                        }}
                        className="text-emerald-700 font-bold hover:underline ml-1 cursor-pointer"
                      >
                        Sign In
                      </button>
                    </>
                  ) : (
                    <>
                      নতুন ইউজার?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(true);
                          setIsForgotPassword(false);
                          setErrorMessage('');
                          setSuccessMessage('');
                        }}
                        className="text-emerald-700 font-bold hover:underline ml-1 cursor-pointer"
                      >
                        Create an account
                      </button>
                    </>
                  )}
                </p>
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* Comprehensive LandingPage-Style Footer */}
      <footer className="relative w-full bg-slate-950/80 backdrop-blur-xl text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/80">
            {/* 1. Brand & Info + Direct Contact */}
            <div className="space-y-4 col-span-1 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="bg-white px-2.5 py-1 rounded-lg">
                  <img src="/dremoy.png" alt="Dremoy Logo" className="h-6 w-auto object-contain" />
                </div>
              </div>
              <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
                উদ্যোক্তাদের জন্য স্মার্ট বিজনেস ম্যানেজমেন্ট প্ল্যাটফর্ম।
              </p>
              
              {/* WhatsApp & Main Site below slogan vertically stacked with prominent fonts & icons */}
              <div className="space-y-2.5 pt-1">
                <div>
                  <a 
                    href="https://wa.me/8801622536026"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-slate-200 hover:text-emerald-400 transition-colors group"
                  >
                    <span className="p-1.5 rounded-lg bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30 group-hover:bg-[#25D366]/25 transition-colors flex items-center justify-center">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.174.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-10.416C6.674 4 2.33 8.342 2.33 13.698c0 2.001.609 3.864 1.661 5.418L2 26l7.072-1.855c1.474.805 3.161 1.253 4.959 1.253 5.356 0 9.7-4.342 9.7-9.698C23.731 8.342 19.387 4 12.031 4z"/>
                      </svg>
                    </span>
                    <span className="text-slate-400 font-normal">হোয়াটসঅ্যাপ:</span>
                    <span className="text-emerald-400 group-hover:underline">01622536026</span>
                  </a>
                </div>
                <div>
                  <a 
                    href="https://www.dremoy.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-slate-200 hover:text-emerald-400 transition-colors group"
                  >
                    <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
                      <Globe className="w-4 h-4" />
                    </span>
                    <span className="text-slate-400 font-normal">ভিজিট করুন:</span>
                    <span className="text-white group-hover:underline">www.dremoy.com</span>
                  </a>
                </div>
              </div>
            </div>

            {/* 2. Navigation Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">ন্যাভিগেশন</h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-400">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <button 
                      type="button"
                      onClick={() => {
                        if (onBackToLanding) {
                          onBackToLanding();
                          setTimeout(() => {
                            const el = document.getElementById(item.id);
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }
                      }} 
                      className="hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Account Actions & Support */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">একাউন্ট ও সাপোর্ট</h4>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
                <li>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setIsForgotPassword(false);
                      setErrorMessage('');
                      setSuccessMessage('');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    লগইন করুন
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setIsForgotPassword(false);
                      setErrorMessage('');
                      setSuccessMessage('');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    শুরু করুন (ফ্রি একাউন্ট)
                  </button>
                </li>
                <li className="pt-1">
                  <a 
                    href="mailto:dremoyit@gmail.com"
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                  >
                    <span className="text-slate-400">ইমেইল:</span>
                    <span className="text-slate-300 hover:underline">dremoyit@gmail.com</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright on Left, Privacy & Terms in Center/Right, Developed By */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
            <p>© {new Date().getFullYear()} Dremoy IT. All rights reserved.</p>
            
            {/* Legal Links at the very bottom */}
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <button 
                type="button"
                onClick={() => setLegalModal('privacy')} 
                className="hover:text-emerald-400 transition-colors cursor-pointer"
              >
                প্রাইভেসি পলিসি
              </button>
              <span className="text-slate-700">•</span>
              <button 
                type="button"
                onClick={() => setLegalModal('terms')} 
                className="hover:text-emerald-400 transition-colors cursor-pointer"
              >
                শর্তাবলী
              </button>
            </div>

            <p className="flex items-center gap-1.5">
              <span>Developed with</span>
              <span className="text-rose-500">❤️</span>
              <span>by</span>
              <strong className="text-white font-black tracking-wide">Dremoy</strong>
            </p>
          </div>

        </div>
      </footer>

      {/* LEGAL MODAL */}
      {legalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative border border-slate-100 text-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setLegalModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
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
                type="button"
                onClick={() => setLegalModal(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
