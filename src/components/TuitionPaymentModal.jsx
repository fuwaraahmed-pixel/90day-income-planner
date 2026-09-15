import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, AlertCircle, CheckCircle2, CreditCard, FileText } from 'lucide-react';

export default function TuitionPaymentModal({
  isOpen,
  onClose,
  onSave,
  students = [],
  selectedStudentId = null,
  selectedMonth = '',
  existingPayments = []
}) {
  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMonth, setPaymentMonth] = useState(selectedMonth || new Date().toISOString().slice(0, 7));
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [note, setNote] = useState('');

  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Initialize or reset form state
  useEffect(() => {
    const currentMonthStr = selectedMonth || new Date().toISOString().slice(0, 7);
    setPaymentMonth(currentMonthStr);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('Cash');
    setNote('');
    setError('');

    if (selectedStudentId) {
      setStudentId(String(selectedStudentId));
      const s = students.find(st => String(st.id) === String(selectedStudentId));
      if (s) {
        setAmount(String(s.monthlyFee || ''));
      }
    } else if (students.length > 0) {
      const activeSts = students.filter(s => s.status === 'Active');
      const targetList = activeSts.length > 0 ? activeSts : students;
      setStudentId(String(targetList[0].id));
      setAmount(String(targetList[0].monthlyFee || ''));
    }
  }, [isOpen, selectedStudentId, selectedMonth, students]);

  // When studentId changes, update default amount & check existing payment warning
  useEffect(() => {
    if (!studentId) return;
    const s = students.find(st => String(st.id) === String(studentId));
    if (s && (!amount || amount === '0')) {
      setAmount(String(s.monthlyFee || ''));
    }

    checkDuplicate(studentId, paymentMonth);
  }, [studentId, paymentMonth, students, existingPayments]);

  const checkDuplicate = (stId, monthStr) => {
    if (!stId || !monthStr) {
      setWarning('');
      return;
    }

    const hasPayment = existingPayments.some(
      p => String(p.studentId) === String(stId) && p.paymentMonth === monthStr
    );

    if (hasPayment) {
      const st = students.find(s => String(s.id) === String(stId));
      setWarning(`সতর্কতা: ${st?.studentName || 'এই শিক্ষার্থীর'} ${monthStr} মাসের বেতন ইতিমধ্যে পরিশোধ করা হয়েছে।`);
    } else {
      setWarning('');
    }
  };

  if (!isOpen) return null;

  const handleStudentSelect = (e) => {
    const id = e.target.value;
    setStudentId(id);
    const s = students.find(st => String(st.id) === String(id));
    if (s) {
      setAmount(String(s.monthlyFee || ''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!studentId) {
      setError('শিক্ষার্থী সিলেক্ট করুন (Please select a student)');
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError('টাকার পরিমাণ অবশ্যই ০ এর বেশি হতে হবে (Amount must be a positive number)');
      return;
    }

    if (!paymentDate) {
      setError('পেমেন্টের তারিখ সিলেক্ট করুন (Payment date is required)');
      return;
    }

    if (!paymentMonth || !/^\d{4}-\d{2}$/.test(paymentMonth)) {
      setError('মাসের ফরম্যাট সঠিকভাবে সিলেক্ট করুন (YYYY-MM)');
      return;
    }

    try {
      setSubmitting(true);
      const res = await onSave({
        studentId: Number(studentId),
        amount: Number(amount),
        paymentDate,
        paymentMonth,
        paymentMethod,
        note
      });

      if (res && res.success === false) {
        setError(res.message || 'পেমেন্ট রেকর্ড করা সম্ভব হয়নি');
      } else {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'পেমেন্ট জমা দিতে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const activeStudents = students.filter(s => s.status === 'Active');
  const otherStudents = students.filter(s => s.status !== 'Active');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Receive Tuition Payment</h3>
              <p className="text-xs text-emerald-100">টিউশন ফি পেমেন্ট গ্রহণ ও রসিদ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {warning && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>{warning}</span>
            </div>
          )}

          {/* Student Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              শিক্ষার্থী সিলেক্ট করুন <span className="text-rose-500">*</span>
            </label>
            <select
              value={studentId}
              onChange={handleStudentSelect}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
              required
            >
              <option value="">-- শিক্ষার্থী সিলেক্ট করুন --</option>
              {activeStudents.length > 0 && (
                <optgroup label="Active Students (পড়ছে)">
                  {activeStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.studentName} {s.className ? `(${s.className})` : ''} - ৳{s.monthlyFee}
                    </option>
                  ))}
                </optgroup>
              )}
              {otherStudents.length > 0 && (
                <optgroup label="Left / Inactive Students">
                  {otherStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.studentName} ({s.status}) - ৳{s.monthlyFee}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Amount & For Month */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                টাকার পরিমাণ (Amount) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">৳</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000"
                  min="1"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                কোন মাসের জন্য (For Month) <span className="text-rose-500">*</span>
              </label>
              <input
                type="month"
                value={paymentMonth}
                onChange={(e) => setPaymentMonth(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                required
              />
            </div>
          </div>

          {/* Payment Date & Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                পেমেন্টের তারিখ (Date) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">পেমেন্ট মেথড</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
              >
                <option value="Cash">Cash (নগদ)</option>
                <option value="bKash">bKash (বিকাশ)</option>
                <option value="Nagad">Nagad (নগদ অ্যাপ)</option>
                <option value="Rocket">Rocket (রকেট)</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">নোট (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="পেমেন্ট সম্পর্কিত কোনো নোট..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
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
              className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? 'পেমেন্ট জমা হচ্ছে...' : '💰 Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
