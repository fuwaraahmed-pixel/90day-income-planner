import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const bgStyles = {
    success: 'border-emerald-200 bg-white text-slate-800 shadow-xl',
    error: 'border-rose-200 bg-white text-slate-800 shadow-xl',
    warning: 'border-amber-200 bg-white text-slate-800 shadow-xl',
    info: 'border-blue-200 bg-white text-slate-800 shadow-xl',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200 max-w-md">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold ${bgStyles[type] || bgStyles.success}`}>
        {icons[type] || icons.success}
        <span className="flex-1 text-xs sm:text-sm font-semibold">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
