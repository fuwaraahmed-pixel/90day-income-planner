import React, { useState, useEffect } from 'react';
import Modal from './Modal';

export default function UniversalPaymentModal({
  isOpen,
  onClose,
  onSubmit,
  title = 'পেমেন্ট গ্রহণ করুন',
  description = 'পেমেন্টের বিস্তারিত তথ্য দিন',
  headerContent = null,
  isSubmitting = false,
  submitLabel = 'পেমেন্ট নিশ্চিত করুন',
  defaultAmount = '',
  defaultDate = '',
  paymentId = '',
  error = null,
  children = null
}) {
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'Cash',
    paymentDate: '',
    notes: ''
  });

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setPaymentForm({
        amount: defaultAmount || '',
        paymentMethod: 'Cash',
        paymentDate: defaultDate || new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
  }, [isOpen, defaultAmount, defaultDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...paymentForm,
      paymentId // Passthrough if parent manages it
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        
        {/* Optional Custom Header Content (e.g. Budget Summary from CRM) */}
        {headerContent && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            {headerContent}
          </div>
        )}

        {/* Global Error Display */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Payment ID (Optional Display) */}
        {paymentId && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">পেমেন্ট আইডি (Payment UUID - Auto Generated)</label>
            <input
              type="text"
              readOnly
              value={paymentId}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-xs font-mono select-all cursor-not-allowed"
            />
            <span className="text-[10px] text-slate-400">এই ইউনিক আইডির মাধ্যমে ডুপ্লিকেট পেমেন্ট প্রতিরোধ করা হয়।</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">পেমেন্টের পরিমাণ (Amount ৳) *</label>
            <input
              type="number"
              required
              min="1"
              placeholder="যেমন: 5000"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">পেমেন্ট মেথড (Payment Method)</label>
            <select
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="bKash">bKash (বিকাশ)</option>
              <option value="Nagad">Nagad (নগদ)</option>
              <option value="Bank Transfer">Bank Transfer (ব্যাংক ডিরেক্ট)</option>
              <option value="Cash">Cash (নগদ টাকা)</option>
              <option value="Rocket">Rocket (রকেট)</option>
              <option value="Other">Other (অন্যান্য)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">পেমেন্টের তারিখ (Date)</label>
            <input
              type="date"
              required
              value={paymentForm.paymentDate}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">নোটস / রেফারেন্স (Notes)</label>
            <input
              type="text"
              placeholder="যেমন: ১ম কিস্তি বা ট্রানজ্যাকশন আইডি"
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {children}

        <div className="flex justify-end gap-2 pt-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
            disabled={isSubmitting}
          >
            বাতিল
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <span>{submitLabel}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
