import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Lock, Mail, LogIn, UserPlus, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });

        if (error) {
          setErrorMessage(error.message || 'অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        } else if (data?.user && data?.session === null) {
          setSuccessMessage('আপনার ইমেইলে একটি নিশ্চিতকরণ লিংক পাঠানো হয়েছে। দয়া করে ইমেইল ভেরিফাই করুন।');
        } else {
          setSuccessMessage('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrorMessage('ইমেইল অথবা পাসওয়ার্ড ভুল হয়েছে। আবার চেষ্টা করুন।');
          } else {
            setErrorMessage(error.message || 'লগইন করতে সমস্যা হয়েছে।');
          }
        }
      }
    } catch (err) {
      setErrorMessage('একটি অপ্রত্যাশিত ভুল ঘটেছে: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
        
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

        {/* Form */}
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

        {/* Toggle Login / Signup */}
        <div className="text-center pt-2 border-t border-slate-100">
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
        </div>

      </div>
    </div>
  );
}
