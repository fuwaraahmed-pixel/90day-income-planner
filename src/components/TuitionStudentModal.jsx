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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[92vh] sm:max-h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {student ? 'Edit Student Details' : 'Add New Student'}
              </h3>
              <p className="text-xs text-slate-300">Enter student details & fee structure</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Group 1: Essential Info */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student Name <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder="e.g. Rahim Ahmed"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 min-h-[44px]"
                  required
                />
              </div>
            </div>

            {/* Class & Batch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Class</label>
                <input
                  type="text"
                  name="className"
                  value={formData.className}
                  onChange={handleChange}
                  placeholder="e.g. Class 10"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Batch</label>
                <input
                  type="text"
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  placeholder="e.g. Batch A"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 min-h-[44px]"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Group 2: Fee & Academic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Monthly Fee (৳) <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">৳</span>
                <input
                  type="number"
                  name="monthlyFee"
                  value={formData.monthlyFee}
                  onChange={handleChange}
                  placeholder="1500"
                  min="1"
                  className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 font-bold text-emerald-700 min-h-[44px]"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Joining Date <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 min-h-[44px]"
                required
              />
            </div>
          </div>

          {/* Group 3: Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Guardian Name</label>
              <input
                type="text"
                name="guardianName"
                value={formData.guardianName}
                onChange={handleChange}
                placeholder="e.g. Shafiqul Islam"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="01712345678"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Group 4: Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 bg-white min-h-[44px]"
            >
              <option value="Active">Active</option>
              <option value="Left">Left</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Leaving Date & Reason (If Status == Left) */}
          {formData.status === 'Left' && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1">
                  Leaving Date <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="date"
                  name="leavingDate"
                  value={formData.leavingDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm border border-amber-300 rounded-xl focus:outline-none focus:border-amber-900 focus:ring-1 focus:ring-amber-900 bg-white min-h-[44px]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1">Leaving Reason</label>
                <input
                  type="text"
                  name="leavingReason"
                  value={formData.leavingReason}
                  onChange={handleChange}
                  placeholder="e.g. Course completed / Relocated"
                  className="w-full px-3 py-2.5 text-sm border border-amber-300 rounded-xl focus:outline-none focus:border-amber-900 focus:ring-1 focus:ring-amber-900 bg-white min-h-[44px]"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Remarks</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              placeholder="Additional notes..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px] flex-1 sm:flex-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px] flex-1 sm:flex-none"
            >
              {submitting ? 'Saving...' : student ? 'Update Student' : 'Save Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
