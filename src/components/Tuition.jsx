import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Users,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Calendar,
  Edit,
  Eye,
  CreditCard,
  User,
  Phone,
  ArrowRight,
  BookOpen,
  X,
  History,
  Info
} from 'lucide-react';
import TuitionStudentModal from './TuitionStudentModal';
import TuitionPaymentModal from './TuitionPaymentModal';

/**
 * Business Rule for Date-Based Eligibility:
 * A student is eligible for selected month 'YYYY-MM' if:
 * 1. joining_date.slice(0, 7) <= 'YYYY-MM'
 * 2. If student has leaving_date:
 *    - If leaving_date day == '01', student stopped before that month -> not eligible for leaveMonth or later.
 *    - Otherwise (day > 01), student attended during leaveMonth -> eligible for leaveMonth, NOT eligible for months strictly after.
 */
export const isStudentEligibleForMonth = (student, monthStr) => {
  if (!student || !student.joiningDate) return false;
  const joinMonth = student.joiningDate.slice(0, 7);
  if (joinMonth > monthStr) return false;

  if (student.leavingDate) {
    const leaveMonth = student.leavingDate.slice(0, 7);
    const leaveDay = parseInt(student.leavingDate.slice(8, 10), 10);

    if (leaveDay === 1) {
      if (monthStr >= leaveMonth) return false;
    } else {
      if (monthStr > leaveMonth) return false;
    }
  }
  return true;
};

export default function Tuition({
  students = [],
  payments = [],
  onAddStudent,
  onUpdateStudent,
  onRecordPayment,
  currency = '৳'
}) {
  // Selected reporting month (Format: 'YYYY-MM')
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Active', 'Left', 'Inactive', 'Paid', 'Due'

  // Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [preselectedStudentId, setPreselectedStudentId] = useState(null);

  const [viewingStudent, setViewingStudent] = useState(null);
  const [notification, setNotification] = useState('');

  const showSuccessNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // Helper: Format month YYYY-MM into human string (e.g., September 2026)
  const formatMonthDisplay = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' });
  };

  // --- Calculations for selected month ---
  const activeStudentsCount = useMemo(() => {
    return students.filter(s => s.status === 'Active').length;
  }, [students]);

  // Eligible students for selected month
  const eligibleStudents = useMemo(() => {
    return students.filter(s => isStudentEligibleForMonth(s, selectedMonth));
  }, [students, selectedMonth]);

  // Payments recorded for selected month
  const paymentsForSelectedMonth = useMemo(() => {
    return payments.filter(p => p.paymentMonth === selectedMonth);
  }, [payments, selectedMonth]);

  // Paid Student IDs for selected month
  const paidStudentIds = useMemo(() => {
    const ids = new Set();
    paymentsForSelectedMonth.forEach(p => ids.add(String(p.studentId)));
    return ids;
  }, [paymentsForSelectedMonth]);

  // Paid & Due Counts among eligible students
  const paidStudents = useMemo(() => {
    return eligibleStudents.filter(s => paidStudentIds.has(String(s.id)));
  }, [eligibleStudents, paidStudentIds]);

  const dueStudents = useMemo(() => {
    return eligibleStudents.filter(s => !paidStudentIds.has(String(s.id)));
  }, [eligibleStudents, paidStudentIds]);

  // Summary Money Amounts
  const collectedThisMonth = useMemo(() => {
    return paymentsForSelectedMonth.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [paymentsForSelectedMonth]);

  const expectedThisMonth = useMemo(() => {
    return eligibleStudents.reduce((sum, s) => sum + (Number(s.monthlyFee) || 0), 0);
  }, [eligibleStudents]);

  const dueAmount = Math.max(0, expectedThisMonth - collectedThisMonth);

  // --- Filtered Student List ---
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Search
      const searchLower = searchQuery.toLowerCase().trim();
      const matchSearch =
        !searchLower ||
        student.studentName?.toLowerCase().includes(searchLower) ||
        student.guardianName?.toLowerCase().includes(searchLower) ||
        student.mobile?.includes(searchLower) ||
        student.className?.toLowerCase().includes(searchLower) ||
        student.batch?.toLowerCase().includes(searchLower);

      if (!matchSearch) return false;

      // Status Filter
      if (statusFilter === 'All') return true;
      if (statusFilter === 'Active') return student.status === 'Active';
      if (statusFilter === 'Left') return student.status === 'Left';
      if (statusFilter === 'Inactive') return student.status === 'Inactive';

      const isEligible = isStudentEligibleForMonth(student, selectedMonth);
      const hasPaid = paidStudentIds.has(String(student.id));

      if (statusFilter === 'Paid') return isEligible && hasPaid;
      if (statusFilter === 'Due') return isEligible && !hasPaid;

      return true;
    });
  }, [students, searchQuery, statusFilter, selectedMonth, paidStudentIds]);

  // Handlers
  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (student) => {
    setEditingStudent(student);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = async (formData) => {
    if (editingStudent) {
      await onUpdateStudent(editingStudent.id, formData);
      showSuccessNotification('শিক্ষার্থীর তথ্য সফলভাবে আপডেট হয়েছে');
    } else {
      await onAddStudent(formData);
      showSuccessNotification('নতুন শিক্ষার্থী সফলভাবে যুক্ত হয়েছে');
    }
  };

  const handleOpenPayment = (studentId = null) => {
    setPreselectedStudentId(studentId);
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = async (paymentData) => {
    const res = await onRecordPayment(paymentData);
    if (res && res.success !== false) {
      showSuccessNotification('Payment successfully recorded');
    }
    return res;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
              📚
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">টিউশন ম্যানেজমেন্ট (Tuition)</h1>
              <p className="text-xs text-slate-500 font-medium">শিক্ষার্থীদের তালিকা, মাসিক ফি, বকেয়া ও পেমেন্ট হিস্ট্রি</p>
            </div>
          </div>
        </div>

        {/* Quick Actions & Month Picker */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700">মাস:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => {
              setStatusFilter('Due');
            }}
            className="px-3.5 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all flex items-center gap-1.5"
          >
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>⚠️ View Due ({dueStudents.length})</span>
          </button>

          <button
            onClick={() => handleOpenPayment(null)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <DollarSign className="w-4 h-4" />
            <span>💰 Receive Payment</span>
          </button>

          <button
            onClick={handleOpenAddStudent}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Student</span>
          </button>
        </div>
      </div>

      {/* Tuition Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Active Students */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold truncate">Active Students</span>
            <Users className="w-4 h-4 text-blue-500 flex-shrink-0" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{activeStudentsCount}</div>
            <p className="text-[10px] text-slate-500 font-medium">বর্তমান সক্রিয় শিক্ষার্থী</p>
          </div>
        </div>

        {/* 2. Paid This Month */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold truncate">Paid This Month</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">{paidStudents.length}</div>
            <p className="text-[10px] text-slate-500 font-medium">পরিশোধিত শিক্ষার্থী ({eligibleStudents.length} এর মধ্যে)</p>
          </div>
        </div>

        {/* 3. Due Students */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold truncate">Due Students</span>
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600">{dueStudents.length}</div>
            <p className="text-[10px] text-slate-500 font-medium">বকেয়া রয়েছে যাদের</p>
          </div>
        </div>

        {/* 4. Collected This Month */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold truncate">Collected</span>
            <DollarSign className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          </div>
          <div>
            <div className="text-xl font-black text-emerald-700">{currency}{collectedThisMonth.toLocaleString()}</div>
            <p className="text-[10px] text-slate-500 font-medium">{formatMonthDisplay(selectedMonth)} এ সংগৃহীত</p>
          </div>
        </div>

        {/* 5. Expected This Month */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold truncate">Expected</span>
            <TrendingUp className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          </div>
          <div>
            <div className="text-xl font-black text-indigo-700">{currency}{expectedThisMonth.toLocaleString()}</div>
            <p className="text-[10px] text-slate-500 font-medium">প্রত্যাশিত মোট আয়</p>
          </div>
        </div>

        {/* 6. Due Amount */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold truncate">Due Amount</span>
            <Clock className="w-4 h-4 text-rose-500 flex-shrink-0" />
          </div>
          <div>
            <div className="text-xl font-black text-rose-700">{currency}{dueAmount.toLocaleString()}</div>
            <p className="text-[10px] text-slate-500 font-medium">মোট বকেয়া পরিমাণ</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, অভিভাবক, মোবাইল, ক্লাস দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'All', label: `সব শিক্ষার্থী (${students.length})` },
            { id: 'Active', label: `Active (${activeStudentsCount})` },
            { id: 'Paid', label: `Paid This Month (${paidStudents.length})` },
            { id: 'Due', label: `Due This Month (${dueStudents.length})` },
            { id: 'Left', label: `Left (${students.filter(s => s.status === 'Left').length})` },
            { id: 'Inactive', label: `Inactive (${students.filter(s => s.status === 'Inactive').length})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                statusFilter === f.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            শিক্ষার্থীদের তালিকা ({filteredStudents.length})
          </h3>
          <span className="text-xs text-slate-500">রিপোর্ট মাস: <strong className="text-slate-800">{formatMonthDisplay(selectedMonth)}</strong></span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700">কোনো শিক্ষার্থী পাওয়া যায়নি</h4>
            <p className="text-xs text-slate-500 mt-1">ফিল্টার পরিবর্তন করে অথবা নতুন শিক্ষার্থী যুক্ত করে দেখুন।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">শিক্ষার্থী</th>
                  <th className="py-3.5 px-4">ক্লাস / ব্যাচ</th>
                  <th className="py-3.5 px-4">অভিভাবক ও মোবাইল</th>
                  <th className="py-3.5 px-4">মাসিক ফি</th>
                  <th className="py-3.5 px-4">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 text-center">{selectedMonth} পেমেন্ট</th>
                  <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudents.map(student => {
                  const isEligible = isStudentEligibleForMonth(student, selectedMonth);
                  const hasPaid = paidStudentIds.has(String(student.id));

                  // Find payment record if paid
                  const paymentRecord = paymentsForSelectedMonth.find(p => String(p.studentId) === String(student.id));

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Joining Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{student.studentName}</div>
                        <div className="text-[11px] text-slate-400">
                          ভর্তি: {student.joiningDate || 'N/A'}
                          {student.status === 'Left' && student.leavingDate && (
                            <span className="text-amber-600 font-medium"> | ছাড়ছে: {student.leavingDate}</span>
                          )}
                        </div>
                      </td>

                      {/* Class & Batch */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{student.className || 'N/A'}</div>
                        <div className="text-[11px] text-slate-500">{student.batch || '-'}</div>
                      </td>

                      {/* Guardian & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">{student.guardianName || '-'}</div>
                        {student.mobile ? (
                          <a href={`tel:${student.mobile}`} className="text-emerald-700 font-semibold text-[11px] hover:underline flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {student.mobile}
                          </a>
                        ) : (
                          <div className="text-slate-400">-</div>
                        )}
                      </td>

                      {/* Monthly Fee */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        {currency}{Number(student.monthlyFee || 0).toLocaleString()}
                      </td>

                      {/* Student Status Badge */}
                      <td className="py-3.5 px-4">
                        {student.status === 'Active' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        )}
                        {student.status === 'Left' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800" title={student.leavingReason || ''}>
                            Left
                          </span>
                        )}
                        {student.status === 'Inactive' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Payment Status for Selected Month */}
                      <td className="py-3.5 px-4 text-center">
                        {!isEligible ? (
                          <span className="inline-block px-2.5 py-1 text-[11px] font-semibold text-slate-400 bg-slate-100 rounded-lg">
                            Not Eligible
                          </span>
                        ) : hasPaid ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Paid ({currency}{paymentRecord?.amount || student.monthlyFee})
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">{paymentRecord?.paymentDate}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 border border-rose-200 text-rose-700">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            Due ({currency}{student.monthlyFee})
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isEligible && !hasPaid && (
                            <button
                              onClick={() => handleOpenPayment(student.id)}
                              className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                              title="পেমেন্ট গ্রহণ করুন"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>Pay</span>
                            </button>
                          )}

                          <button
                            onClick={() => setViewingStudent(student)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="বিস্তারিত হিস্ট্রি দেখুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEditStudent(student)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="এডিট করুন"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Details & Payment History Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
                  {viewingStudent.studentName?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{viewingStudent.studentName}</h3>
                  <p className="text-xs text-slate-300">
                    {viewingStudent.className || 'No Class'} • {viewingStudent.batch || 'No Batch'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">অভিভাবক</span>
                  <span className="text-xs font-semibold text-slate-900">{viewingStudent.guardianName || '-'}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">মোবাইল</span>
                  <span className="text-xs font-semibold text-slate-900">{viewingStudent.mobile || '-'}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">মাসিক ফি</span>
                  <span className="text-xs font-bold text-emerald-700">{currency}{viewingStudent.monthlyFee}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">স্ট্যাটাস</span>
                  <span className="text-xs font-bold text-slate-800">{viewingStudent.status}</span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">ভর্তির তারিখ</span>
                  <span className="text-xs font-semibold text-slate-900">{viewingStudent.joiningDate || '-'}</span>
                </div>
                {viewingStudent.status === 'Left' && (
                  <>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase block">টিউশন ছাড়ার তারিখ</span>
                      <span className="text-xs font-semibold text-amber-700">{viewingStudent.leavingDate || '-'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase block">ছাড়ার কারণ</span>
                      <span className="text-xs font-semibold text-slate-800">{viewingStudent.leavingReason || '-'}</span>
                    </div>
                  </>
                )}
                {viewingStudent.notes && (
                  <div className="col-span-2 md:col-span-4 border-t border-slate-200/60 pt-2 mt-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase block">নোট</span>
                    <span className="text-xs text-slate-700">{viewingStudent.notes}</span>
                  </div>
                )}
              </div>

              {/* Payment History */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-600" />
                    <span>পেমেন্ট হিস্ট্রি (Payment History)</span>
                  </h4>
                  <button
                    onClick={() => {
                      const stId = viewingStudent.id;
                      setViewingStudent(null);
                      handleOpenPayment(stId);
                    }}
                    className="px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Receive Payment</span>
                  </button>
                </div>

                {(() => {
                  const studentPayments = payments.filter(
                    p => String(p.studentId) === String(viewingStudent.id)
                  );

                  if (studentPayments.length === 0) {
                    return (
                      <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <p className="text-xs text-slate-500 font-medium">কোনো পেমেন্ট হিস্ট্রি পাওয়া যায়নি</p>
                      </div>
                    );
                  }

                  return (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">For Month</th>
                            <th className="py-2.5 px-3">Amount</th>
                            <th className="py-2.5 px-3">Method</th>
                            <th className="py-2.5 px-3">Note</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {studentPayments.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 text-slate-900 font-bold">{p.paymentDate}</td>
                              <td className="py-2.5 px-3 text-emerald-700 font-bold">{p.paymentMonth}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-900">{currency}{Number(p.amount).toLocaleString()}</td>
                              <td className="py-2.5 px-3 text-slate-600">{p.paymentMethod}</td>
                              <td className="py-2.5 px-3 text-slate-500">{p.note || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      <TuitionStudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSave={handleSaveStudent}
        student={editingStudent}
      />

      {/* Receive Payment Modal */}
      <TuitionPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSave={handleSavePayment}
        students={students}
        selectedStudentId={preselectedStudentId}
        selectedMonth={selectedMonth}
        existingPayments={payments}
      />
    </div>
  );
}
