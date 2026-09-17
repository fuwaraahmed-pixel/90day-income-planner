import React from 'react';
import { FolderOpen } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = FolderOpen,
  title = 'কোনো ডেটা পাওয়া যায়নি',
  description = 'এখনো কোনো এন্ট্রি যোগ করা হয়নি। নতুন এন্ট্রি যোগ করতে নিচের বাটনে ক্লিক করুন।',
  actionLabel,
  onAction,
  actionIcon,
  className = ''
}) {
  return (
    <div className={`bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-2xs ${className}`}>
      <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-400 flex items-center justify-center shadow-2xs">
        <Icon className="w-7 h-7 text-slate-400" />
      </div>

      <div className="max-w-md mx-auto space-y-1">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onAction}
            icon={actionIcon}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
