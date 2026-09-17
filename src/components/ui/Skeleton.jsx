import React from 'react';

export default function Skeleton({ className = '', variant = 'rectangular', ...rest }) {
  const baseClasses = 'animate-pulse bg-slate-200/80 rounded-xl';
  const variantClasses = {
    circular: 'rounded-full',
    text: 'h-4 rounded-md',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant] || ''} ${className}`}
      {...rest}
    />
  );
}
