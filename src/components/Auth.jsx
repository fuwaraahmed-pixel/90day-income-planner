import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Lock, Mail, LogIn, UserPlus, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Auth({ initialSignUp = false, onBackToLanding }) {
  const [isSignUp, setIsSignUp] = useState(initialSignUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

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
      return 'এই ইমেইল দিয়ে অ্যাকাউন্ট তৈরি করা সম্ভব হয়নি। আপনার তথ্য যাচাই করে আবার চেষ্টা করুন।';
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
      return 'দেওয়া কোডটি ভুল অথবা মেয়াদ শেষ হয়ে গেছে।';
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
          console.error("Signup error");
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
          console.error("Login error");
          setErrorMessage(getAuthErrorMessage(error));
        }
      }
    } catch (err) {
      console.error("Auth exception");
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
          redirectTo: 'https://app.dremoy.com'
        }
      });
      if (error) {
        console.error("Google Auth error");
        setErrorMessage(getAuthErrorMessage(error));
      }
    } catch (err) {
      console.error("Google Auth exception");
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
        console.error("OTP Request error");
        setErrorMessage(getAuthErrorMessage(error));
      } else {
        setOtpSent(true);
        setOtpCode('');
        setSuccessMessage('আপনার ইমেইলে ৬ সংখ্যার একটি কোড পাঠানো হয়েছে।');
      }
    } catch (err) {
      console.error("OTP exception");
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

      if (error) {
        console.error("OTP Verify error");
        setErrorMessage(getAuthErrorMessage(error));
      }
    } catch (err) {
      console.error("OTP Verify exception");
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
        
        {onBackToLanding && (
          <div className="flex justify-start">
            <button
              type="button"
              onClick={onBackToLanding}
              className="text-xs font-semibold text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full"
            >
              ← হোমপেজে ফিরে যান
            </button>
          </div>
        )}

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto font-bold text-2xl shadow-sm">
            🎯
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            পার্সোনাল বিজনেস ম্যানাজার
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            ৯০ দিনে ১ লাখ টাকা ইনকাম গোল ও ক্লাউড ডাটাবেজ এক্সেস
          </p>
        </div>

        {/* Missing Env Banner */}
        {!isSupabaseConfigured && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Supabase কনফিগারেশন প্রয়োজন</span>
            </div>
            <p>
              আপনার প্রজেক্টের <code>.env.local</code> ফাইলে Supabase URL ও Anon Key যোগ করুন।
            </p>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-3.5 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl p-3.5 text-xs font-semibold flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="space-y-4">
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              <path fill="none" d="M1 1h22v22H1z" />
            </svg>
            Continue with Google
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-semibold">অথবা</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {isOtpMode ? (
            <form onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp} className="space-y-4">
              {!otpSent ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ইমেইল অ্যাড্রেস (Email Address)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="yourname@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-4">
                    <strong>{email}</strong> ঠিকানায় কোড পাঠানো হয়েছে।
                  </p>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 text-left">
                    ৬ সংখ্যার কোড (6-digit Code)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      required
                      maxLength={6}
                      pattern="\d{6}"
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-center tracking-widest text-lg"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (otpSent && otpCode.trim().length !== 6)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>প্রসেসিং হচ্ছে...</span>
                ) : otpSent ? (
                  <span>ভেরিফাই করুন</span>
                ) : (
                  <span>কোড পাঠান</span>
                )}
              </button>

              {otpSent && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleRequestOtp}
                    className="text-xs text-slate-600 hover:text-emerald-700 font-semibold transition-colors disabled:opacity-50"
                  >
                    কোড পাননি? আবার পাঠান
                  </button>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ইমেইল অ্যাড্রেস (Email Address)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="yourname@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পাসওয়ার্ড (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>প্রসেসিং হচ্ছে...</span>
                ) : isSignUp ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>নতুন অ্যাকাউন্ট তৈরি করুন</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>লগইন করুন</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Toggle Login / Signup */}
        <div className="text-center pt-2 border-t border-slate-100 flex flex-col gap-2">
          {!isOtpMode ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsOtpMode(true);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-xs text-slate-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                ইমেইল কোড দিয়ে লগইন
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-xs text-slate-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                {isSignUp ? (
                  <span>আগে থেকেই অ্যাকাউন্ট আছে? <strong className="text-emerald-600 underline">লগইন করুন</strong></span>
                ) : (
                  <span>নতুন অ্যাকাউন্ট প্রয়োজন? <strong className="text-emerald-600 underline">রেজিস্ট্রেশন করুন</strong></span>
                )}
              </button>
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
              className="text-xs text-slate-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              পাসওয়ার্ড দিয়ে লগইন করুন
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
