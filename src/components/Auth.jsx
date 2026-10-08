import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Mail, 
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
  Check
} from 'lucide-react';
import { PLANS } from '../utils/plans';

export default function Auth({ initialSignUp = false, onBackToLanding }) {
  const [isSignUp, setIsSignUp] = useState(initialSignUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    try {
      const storedPlanId = localStorage.getItem('dremoy_selected_plan');
      if (storedPlanId) {
        const found = Object.values(PLANS).find(p => p.id === storedPlanId);
        if (found) setSelectedPlan(found);
      }
    } catch {
      // localStorage error fallback
    }
  }, []);

  const getAuthErrorMessage = (error) => {
    if (!error) return 'সার্ভারে একটি সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
    const msg = (error.message || '').toLowerCase();
    const code = error.code || '';
    const status = error.status || 0;

    if (msg.includes('invalid login credentials') || code === 'invalid_credentials') {
      return 'ইমেইল অথবা পাসওয়ার্ড ভুল হয়েছে। আবার চেষ্টা করুন।';
    }
    if (msg.includes('email not confirmed') || code === 'email_not_confirmed') {
      return 'আপনার ইমেইলটি এখনও ভেরিফাই করা হয়নি। দয়া করে আপনার ইমেইল চেক করুন।';
    }
    if (msg.includes('already registered') || code === 'user_already_exists') {
      return 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট তৈরি করা আছে। দয়া করে লগইন করুন।';
    }
    if (msg.includes('invalid email') || code === 'validation_failed') {
      return 'দয়া করে একটি সঠিক ইমেইল ঠিকানা দিন।';
    }
    if (msg.includes('weak_password') || msg.includes('password should be at least') || code === 'weak_password') {
      return 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।';
    }
    if (msg.includes('rate limit') || msg.includes('too many requests') || status === 429 || code === 'over_email_send_rate_limit') {
      return 'অতিরিক্ত চেষ্টার কারণে সাময়িকভাবে অনুরোধ সীমিত করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
    }
    if (msg.includes('failed to fetch') || msg.includes('network error')) {
      return 'ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।';
    }
    if (msg.includes('token has expired') || msg.includes('invalid') || code === 'otp_expired' || code === 'invalid_otp') {
      return 'দেওয়া কোডটি ভুল অথবা মেয়াদ শেষ হয়ে গেছে।';
    }

    return 'সার্ভারে একটি সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

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
        });

        if (error) {
          setErrorMessage(getAuthErrorMessage(error));
        } else if (data?.user && data?.session === null) {
          setSuccessMessage('আপনার ইমেইলে একটি নিশ্চিতকরণ লিংক পাঠানো হয়েছে। দয়া করে ইমেইল ভেরিফাই করুন।');
        } else {
          setSuccessMessage('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
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

  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    if (!email.trim()) return;

    if (!isSupabaseConfigured) {
      setErrorMessage('Supabase কনফিগারেশন অনুপস্থিত! দয়া করে .env.local ফাইলে VITE_SUPABASE_URL এবং VITE_SUPABASE_ANON_KEY সেট করুন।');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail
      });

      if (error) {
        setErrorMessage(getAuthErrorMessage(error));
      } else {
        setOtpSent(true);
        setOtpCode('');
        setSuccessMessage('আপনার ইমেইলে ৬ সংখ্যার একটি ওটিপি কোড পাঠানো হয়েছে।');
      }
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const cleanOtp = otpCode.trim();
    if (!email.trim() || cleanOtp.length !== 6) return;

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: cleanOtp,
        type: 'email'
      });

      if (error) setErrorMessage(getAuthErrorMessage(error));
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative font-sans text-white flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden bg-slate-950 selection:bg-emerald-500 selection:text-white">
      
      {/* 1. SEAMLESS SINGLE FLUID CANVAS BACKGROUND (No visual dividing line) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000 ease-out"
        style={{ backgroundImage: `url('/images/dremoy_ink_bg.jpg')` }}
      />

      {/* Atmospheric Overlays for Deep Contrast & Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/70 to-slate-950/80 backdrop-blur-[2px] pointer-events-none" />
      <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-950/40 to-slate-950/90 pointer-events-none" />

      {/* Subtle Glow Embers */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-orange-500/15 rounded-full blur-[160px] pointer-events-none" />

      {/* 2. MAIN UNIFIED VIEWPORT CONTAINER */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 py-6 sm:py-10">

        {/* LEFT COLUMN: Organic Seamless Branding & App Proposition (Floating on Background) */}
        <div className="w-full lg:w-7/12 space-y-8 text-left">
          
          {/* Logo & Category Eyebrow */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-3">
              <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center p-1 border border-white/20 shadow-xl shadow-cyan-950/30">
                <img 
                  src="/dremoy.png" 
                  alt="Dremoy Logo" 
                  className="w-8 h-8 object-contain drop-shadow"
                />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Dremoy
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                    PRO
                  </span>
                </span>
                <p className="text-[11px] font-bold text-cyan-300/90 tracking-widest uppercase">
                  Digital Business Workspace
                </p>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs font-bold text-amber-300/90 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                আপনার ব্যবসার আয়, খরচ ও গ্রাহক এক জায়গায়
              </span>
            </div>
          </div>

          {/* Master Headline (Directly aligned with Landing Page Proposition) */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] drop-shadow-md">
              আপনার ব্যবসার পুরো কাজ,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-400">
                এক জায়গায়।
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-200/90 font-medium max-w-xl leading-relaxed drop-shadow-sm">
              তথ্য খুঁজতে নয়—ব্যবসা বাড়াতে সময় দিন। ৯০ দিনের ইনকাম গোল, কাস্টমার পাওনা (Dues), ক্লায়েন্ট CRM ও খরচের হিসাব পরিচালনা করুন সহজে।
            </p>
          </div>

          {/* Quick Real App Feature Pills (Harmonious with Kaleido Reference) */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 text-xs font-bold text-white shadow-sm transition-all">
              <div className="flex -space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-xs"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block shadow-xs"></span>
              </div>
              <span>৯০ দিনের ইনকাম গোল</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 text-xs font-bold text-white shadow-sm transition-all">
              <div className="flex -space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shadow-xs"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block shadow-xs"></span>
              </div>
              <span>ক্লায়েন্ট CRM ও পাওনা</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 text-xs font-bold text-white shadow-sm transition-all">
              <div className="flex -space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block shadow-xs"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-xs"></span>
              </div>
              <span>টিউশন ও সার্ভিসেস</span>
            </div>
          </div>

          {/* Bottom Social Proof Bar */}
          <div className="flex items-center gap-6 pt-4 text-xs font-semibold text-slate-300/80">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>১,০০০+ উদ্যোক্তা ও ফ্রিল্যান্সার</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>256-bit Cloud Security</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Pure Frosted Glass Auth Card (Seamless, Translucent, Vibrant) */}
        <div className="w-full lg:w-5/12 max-w-md">
          
          <div className="relative group">
            {/* Ambient Backlight for Glass Depth */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-emerald-500/20 to-orange-500/30 rounded-[36px] blur-xl opacity-80 group-hover:opacity-100 transition duration-700 pointer-events-none" />

            {/* Frosted Glass Card Body */}
            <div className="relative bg-slate-950/60 backdrop-blur-2xl border border-white/20 rounded-[32px] p-7 sm:p-9 shadow-2xl shadow-black/80 space-y-6">

              {/* Top Navigation & Selected Plan Context */}
              <div className="flex items-center justify-between">
                {onBackToLanding ? (
                  <button
                    type="button"
                    onClick={onBackToLanding}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl transition-all border border-white/15"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>হোমপেজ</span>
                  </button>
                ) : <div />}

                {selectedPlan ? (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 rounded-full">
                    <Check className="w-3 h-3 text-emerald-300" />
                    <span>{selectedPlan.name} (৳{selectedPlan.price})</span>
                  </div>
                ) : (
                  <span className="text-[11px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-400/25 px-2.5 py-1 rounded-full">
                    ১৪ দিনের ট্রায়াল
                  </span>
                )}
              </div>

              {/* Card Header */}
              <div className="space-y-1 text-left">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {isSignUp ? 'Sign up' : 'Sign in'}
                </h2>
                <p className="text-xs text-slate-300/80 font-medium">
                  {isSignUp ? 'নতুন অ্যাকাউন্ট খুলে এখনই শুরু করুন।' : 'Good to see you again.'}
                </p>
              </div>

              {/* Glass Tab Switcher: Sign in | Sign up */}
              {!isOtpMode && (
                <div className="grid grid-cols-2 p-1 bg-black/40 rounded-2xl border border-white/10 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className={`py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                      !isSignUp 
                        ? 'bg-white text-slate-950 font-black shadow-lg shadow-white/10' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign in</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className={`py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                      isSignUp 
                        ? 'bg-white text-slate-950 font-black shadow-lg shadow-white/10' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create account</span>
                  </button>
                </div>
              )}

              {/* Supabase Config Warning (If any) */}
              {!isSupabaseConfigured && (
                <div className="bg-amber-500/20 border border-amber-400/40 text-amber-200 rounded-2xl p-3.5 text-xs space-y-1 text-left">
                  <div className="font-bold flex items-center gap-1.5 text-amber-300">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Supabase কনফিগারেশন প্রয়োজন</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80">আপনার <code>.env.local</code> ফাইলে কি যোগ করা আছে কিনা চেক করুন।</p>
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div className="bg-rose-500/20 border border-rose-400/40 text-rose-200 rounded-2xl p-3.5 text-xs font-medium flex items-start gap-2.5 text-left animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Alert */}
              {successMessage && (
                <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 rounded-2xl p-3.5 text-xs font-medium flex items-start gap-2.5 text-left">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Interactive Form Area */}
              {isOtpMode ? (
                /* OTP MODE */
                <form onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      disabled={otpSent}
                      placeholder="you@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/[0.12] focus:bg-black/60 border border-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-sm font-semibold text-white placeholder:text-slate-400/60 transition-all"
                    />
                  </div>

                  {otpSent && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        6-Digit OTP Code
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="••••••"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/20 focus:border-cyan-400 focus:outline-none text-center tracking-[0.5em] text-xl font-black text-cyan-300"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || (otpSent && otpCode.trim().length !== 6)}
                    className="w-full py-3.5 bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-950 font-black rounded-2xl text-sm transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{loading ? 'প্রসেসিং হচ্ছে...' : otpSent ? 'Verify & Continue' : 'Send login code'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {otpSent && (
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleRequestOtp}
                        className="text-xs text-slate-300 hover:text-white font-semibold underline transition-colors"
                      >
                        কোড পাননি? আবার পাঠান
                      </button>
                    </div>
                  )}
                </form>
              ) : (
                /* REGULAR EMAIL + PASSWORD MODE */
                <form onSubmit={handleAuth} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/[0.12] focus:bg-black/60 border border-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-sm font-semibold text-white placeholder:text-slate-400/60 transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Password
                      </label>
                      {!isSignUp && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsOtpMode(true);
                            setErrorMessage('');
                            setSuccessMessage('');
                          }}
                          className="text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 underline transition-all"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-4 pr-11 py-3 rounded-2xl bg-white/10 hover:bg-white/[0.12] focus:bg-black/60 border border-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-sm font-semibold text-white placeholder:text-slate-400/60 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Primary Action Button (White high-contrast with dark text like Kaleido) */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-950 font-black rounded-2xl text-sm transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <span>প্রসেসিং হচ্ছে...</span>
                    ) : isSignUp ? (
                      <>
                        <span>Create an account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Sign in</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Social / Alternative Divider */}
              {!isOtpMode && (
                <div className="space-y-4 pt-1">
                  <div className="relative flex items-center justify-center">
                    <div className="w-full border-t border-white/15"></div>
                    <span className="absolute bg-slate-950/80 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                      or continue with
                    </span>
                  </div>

                  {/* Google Sign In Button */}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleGoogleLogin}
                    className="w-full py-3 bg-white/10 hover:bg-white/15 active:scale-[0.99] border border-white/20 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google One-Tap Sign In</span>
                  </button>
                </div>
              )}

              {/* Bottom Switcher & Magic Code Link */}
              <div className="pt-2 border-t border-white/10 flex flex-col items-center gap-2 text-center">
                {!isOtpMode ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOtpMode(true);
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className="text-xs text-cyan-300 hover:text-cyan-200 font-semibold transition-colors"
                    >
                      🔐 পাসওয়ার্ড ছাড়া ওটিপি (Magic Code) দিয়ে লগইন করুন
                    </button>

                    <p className="text-xs text-slate-300/80">
                      {isSignUp ? (
                        <>আগে থেকেই অ্যাকাউন্ট আছে? <button type="button" onClick={() => setIsSignUp(false)} className="text-white font-bold underline hover:text-cyan-300 ml-1">Sign in</button></>
                      ) : (
                        <>New to Dremoy? <button type="button" onClick={() => setIsSignUp(true)} className="text-white font-bold underline hover:text-cyan-300 ml-1">Create an account</button></>
                      )}
                    </p>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpMode(false);
                      setOtpSent(false);
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-xs text-cyan-300 hover:text-cyan-200 font-semibold transition-colors"
                  >
                    🔑 পাসওয়ার্ড দিয়ে লগইন করুন
                  </button>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
