import React, { useState, useEffect } from 'react';
import { getSyncState } from '../../store/syncStore';

export default function SyncStatusPill({ status, lastSyncedAt, onRetry }) {
  const [timeAgo, setTimeAgo] = useState('');

  // We read hasUnsavedFailure from the store directly because the pill might not get it from props.
  // Actually, wait, it's better to pass it from App.jsx or read it here if it's not passed.
  // The user says: "status ও hasUnsavedFailure মিলিয়ে দেখাও".
  // App.jsx passes `status` and `lastSyncedAt`. I should read `getSyncState()` for hasUnsavedFailure.
  const syncState = getSyncState();
  const hasUnsavedFailure = syncState.hasUnsavedFailure;
  const isOffline = status === 'offline' || !navigator.onLine;

  useEffect(() => {
    if (!lastSyncedAt) return;
    
    const updateTimeAgo = () => {
      const seconds = Math.floor((Date.now() - lastSyncedAt) / 1000);
      if (seconds < 60) setTimeAgo('সবেমাত্র');
      else {
        const mins = Math.floor(seconds / 60);
        setTimeAgo(`${mins} মিনিট আগে`);
      }
    };
    
    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000);
    return () => clearInterval(interval);
  }, [lastSyncedAt, status]);

  if (!status) return null;

  let dot = 'bg-emerald-500';
  let text = `সিঙ্ক হয়েছে · ${timeAgo}`;
  let shortText = timeAgo;
  let hasErrorClass = false;

  if (hasUnsavedFailure) {
    dot = 'bg-rose-500';
    text = isOffline ? 'অফলাইন · সেভ হয়নি' : 'সেভ হয়নি';
    shortText = text;
    hasErrorClass = true;
  } else if (isOffline) {
    dot = 'bg-slate-400';
    text = 'অফলাইন';
    shortText = 'অফলাইন';
  } else if (status === 'error') {
    dot = 'bg-rose-500';
    text = 'সিঙ্ক ত্রুটি - আবার চেষ্টা করুন';
    shortText = 'সিঙ্ক ত্রুটি';
    hasErrorClass = true;
  } else if (status === 'syncing') {
    dot = 'bg-indigo-500 animate-pulse';
    text = 'সিঙ্ক হচ্ছে...';
    shortText = 'সিঙ্ক হচ্ছে...';
  } else if (status === 'synced') {
    // Keep defaults
  }

  return (
    <div 
      onClick={hasErrorClass ? onRetry : undefined}
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:bottom-6 z-40 flex items-center gap-2 bg-white/95 backdrop-blur-md border border-slate-200/80 px-3.5 py-1.5 rounded-full text-xs font-medium shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 ${hasErrorClass ? 'cursor-pointer hover:bg-rose-50 border-rose-200 text-rose-700' : 'text-slate-600'}`}
      style={{
        paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))'
      }}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${dot} transition-colors duration-300`}></span>
      <span className="hidden md:inline">{text}</span>
      <span className="md:hidden inline">{shortText}</span>
    </div>
  );
}
