import React from 'react';

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  icon: Icon,
  className = ''
}) {
  const baseStyles = 'inline-flex items-center gap-1 font-semibold rounded-lg tracking-tight transition-colors select-none';

  const variants = {
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
    info: 'bg-blue-50 text-blue-800 border border-blue-200/80',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200/80',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200/80',
    purple: 'bg-purple-50 text-purple-800 border border-purple-200/80',
    cyan: 'bg-cyan-50 text-cyan-800 border border-cyan-200/80',
    teal: 'bg-teal-50 text-teal-800 border border-teal-200/80',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={`${baseStyles} ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}>
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
      {children}
    </span>
  );
}
