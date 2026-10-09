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
  HelpCircle
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      
      {/* Top Header Navigation */}
      <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center p-1.5 shadow-sm">
              <img 
                src="/dremoy.png" 
                alt="Dremoy Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-900 tracking-tight">
                Dremoy
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Workspace
              </span>
            </div>
          </div>

          {/* Action / Return to Home */}
          <div className="flex items-center gap-3">
            {onBackToLanding && (
              <button
                type="button"
                onClick={onBackToLanding}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>মূল ওয়েবসাইটে ফিরে যান</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">

          {/* LEFT COLUMN: Genuine Product Concept & Demo Preview (Desktop focused, clean on mobile) */}
          <div className="lg:col-span-6 space-y-6 text-left order-2 lg:order-1">
            
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>ব্যবসায়িক আয়, ব্যয় ও গ্রাহক ব্যবস্থাপনা</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                আপনার ব্যবসার প্রতিটি হিসাব,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700">
                  এক প্ল্যাটফর্মে।
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
                ৯০ দিনের ইনকাম প্ল্যান, ক্লায়েন্ট CRM, বকেয়া পাওনা ট্র্যাকিং ও দৈনিক খরচ নিয়ন্ত্রণের জন্য আধুনিক বিজনেস ওয়ার্কস্পেস।
              </p>
            </div>

            {/* Illustrative Dashboard Widget (Transparently Labeled as Demo Preview) */}
            <div className="relative rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4 max-w-xl">
              
              {/* Demo Badge */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-bold text-slate-700">ইনকাম প্ল্যানার ও গোল মনিটর</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  Demo Preview
                </span>
              </div>

              {/* Sample Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-medium text-slate-500 block">টার্গেট আয়</span>
                  <span className="text-sm sm:text-base font-black text-slate-900">৳১,৫০,০০০</span>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="text-[11px] font-medium text-emerald-700 block">চলতি অর্জন</span>
                  <span className="text-sm sm:text-base font-black text-emerald-800">৳১,২৩,০০০</span>
                </div>
                <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100">
                  <span className="text-[11px] font-medium text-teal-700 block">বকেয়া পাওনা</span>
                  <span className="text-sm sm:text-base font-black text-teal-800">৳২৭,০০০</span>
                </div>
              </div>

              {/* Sample Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>৯০ দিনের কোয়ার্টার অগ্রগতি (নমুনা)</span>
                  <span className="text-emerald-700 font-bold">৮২%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full w-[82%]"></div>
                </div>
              </div>

              {/* Feature Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>ক্লায়েন্ট CRM</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>কাস্টমার Dues</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>দৈনিক আয়-ব্যয়</span>
                </div>
              </div>

            </div>

            {/* Architecture / Cloud Verification Info */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Supabase সিকিউর ক্লাউড ডাটাবেজ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>রো-লেভেল সিকিউরিটি (RLS) সুরক্ষিত</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Authentication Card (Mobile-First Priority) */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto order-1 lg:order-2">
            
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg shadow-slate-200/40 p-6 sm:p-8 space-y-6">

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
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            required
                            placeholder="যেমন: মোঃ সাকিব আহমেদ"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all"
                          />
                        </div>
                      </div>

                      {/* Business Name (Optional) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-slate-700">
                            প্রতিষ্ঠান বা ব্যবসার নাম
                          </label>
                          <span className="text-[11px] text-slate-400">ঐচ্ছিক</span>
                        </div>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            placeholder="যেমন: ক্রিয়েটিভ ডিজিটাল বা শপ"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all"
                          />
                        </div>
                      </div>

                      {/* Phone Number (Optional) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-slate-700">
                            মোবাইল নম্বর
                          </label>
                          <span className="text-[11px] text-slate-400">ঐচ্ছিক</span>
                        </div>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="tel"
                            placeholder="01XXXXXXXXX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all"
                          />
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

      {/* Clean, Restrained Footer (Desktops limited, mobile unobtrusive) */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Dremoy. সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-4 font-semibold text-slate-600">
            <span>সহায়তা: support@dremoy.com</span>
            <span>•</span>
            <span>প্রাইভেসি পলিসি</span>
            <span>•</span>
            <span>শর্তাবলী</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
