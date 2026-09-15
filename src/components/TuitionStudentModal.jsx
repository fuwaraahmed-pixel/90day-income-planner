import React, { useState, useEffect } from 'react';
import { X, User, Phone, GraduationCap, Calendar, DollarSign, AlertCircle, FileText, UserCheck } from 'lucide-react';

export default function TuitionStudentModal({ isOpen, onClose, onSave, student = null }) {
  const [formData, setFormData] = useState({
    studentName: '',
    guardianName: '',
    mobile: '',
    className: '',
    batch: '',
    monthlyFee: '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    leavingDate: '',
    leavingReason: '',
    notes: ''
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        studentName: student.studentName || '',
        guardianName: student.guardianName || '',
        mobile: student.mobile || '',
        className: student.className || student.class || '',
        batch: student.batch || '',
        monthlyFee: student.monthlyFee !== undefined ? String(student.monthlyFee) : '',
        joiningDate: student.joiningDate || new Date().toISOString().split('T')[0],
        status: student.status || 'Active',
        leavingDate: student.leavingDate || '',
        leavingReason: student.leavingReason || '',
        notes: student.notes || ''
      });
    } else {
      setFormData({
        studentName: '',
        guardianName: '',
        mobile: '',
        className: '',
        batch: '',
        monthlyFee: '',
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        leavingDate: '',
        leavingReason: '',
        notes: ''
      });
    }
    setError('');
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.studentName.trim()) {
      setError('শিক্ষার্থীর নাম দিতে হবে (Student Name is required)');
      return;
    }

    if (!formData.monthlyFee || isNaN(formData.monthlyFee) || Number(formData.monthlyFee) <= 0) {
      setError('মাসিক ফি অবশ্যই শূন্যের বেশি হতে হবে (Monthly Fee must be a valid positive number)');
      return;
    }

    if (!formData.joiningDate) {
      setError('ভর্তির তারিখ দিতে হবে (Joining Date is required)');
      return;
    }

    if (formData.status === 'Left' && !formData.leavingDate) {
      setError('টিউশন ছাড়ার তারিখ সিলেক্ট করুন (Leaving Date is required when status is Left)');
      return;
    }

    try {
      setSubmitting(true);
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'ডাটা সেভ করতে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {student ? 'শিক্ষার্থী তথ্য এডিট' : 'নতুন শিক্ষার্থী যুক্ত করুন'}
              </h3>
              <p className="text-xs text-slate-300">টিউশন শিক্ষার্থীর প্রোফাইল আপডেট</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              শিক্ষার্থীর নাম <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                placeholder="যেমন: আব্দুর রহিম"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                required
              />
            </div>
          </div>

          {/* Class & Batch */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ক্লাস (Class)</label>
              <input
                type="text"
                name="className"
                value={formData.className}
                onChange={handleChange}
                placeholder="যেমন: Class 9"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ব্যাচ (Batch)</label>
              <input
                type="text"
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                placeholder="যেমন: Morning Batch"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Guardian & Mobile */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">অভিভাবকের নাম</label>
              <input
                type="text"
                name="guardianName"
                value={formData.guardianName}
                onChange={handleChange}
                placeholder="যেমন: মোঃ শফিকুল ইসলাম"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">মোবাইল নাম্বার</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="017xxxxxxxx"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Monthly Fee & Joining Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                মাসিক ফি (৳) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-bold text-slate-400">৳</span>
                <input
                  type="number"
                  name="monthlyFee"
                  value={formData.monthlyFee}
                  onChange={handleChange}
                  placeholder="1000"
                  min="1"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ভর্তির তারিখ <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                required
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">স্ট্যাটাস (Status)</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 bg-white"
            >
              <option value="Active">Active (পড়ছে)</option>
              <option value="Left">Left (ছেড়ে দিয়েছে)</option>
              <option value="Inactive">Inactive (নিষ্ক্রিয়)</option>
            </select>
          </div>

          {/* Leaving Date & Reason (If Status == Left) */}
          {formData.status === 'Left' && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1">
                  টিউশন ছাড়ার তারিখ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="leavingDate"
                  value={formData.leavingDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-amber-300 rounded-xl focus:outline-none focus:border-amber-900 focus:ring-1 focus:ring-amber-900 bg-white"
                  required
                />
                <p className="text-[11px] text-amber-700 mt-1">
                  নোট: ১ তারিখে ছেড়ে দিলে সেই মাস থেকে বাদ পড়বে, অন্য তারিখ হলে সেই মাস পর্যন্ত হিসাব থাকবে।
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1">টিউশন ছাড়ার কারণ</label>
                <input
                  type="text"
                  name="leavingReason"
                  value={formData.leavingReason}
                  onChange={handleChange}
                  placeholder="যেমন: পরীক্ষা শেষ / অন্য শহরে স্থানান্তর"
                  className="w-full px-3 py-2 text-sm border border-amber-300 rounded-xl focus:outline-none focus:border-amber-900 focus:ring-1 focus:ring-amber-900 bg-white"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">নোট / অতিরিক্ত তথ্য</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              placeholder="অতিরিক্ত বিস্তারিত নোট..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? 'সেভ হচ্ছে...' : student ? 'তথ্য আপডেট করুন' : 'Save Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
