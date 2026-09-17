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
import EmptyState from './ui/EmptyState';
import Skeleton from './ui/Skeleton';

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
  currency = '৳',
  loading = false
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
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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

  // Class & Batch list for dropdown filters
  const uniqueClasses = useMemo(() => {
    const set = new Set();
    students.forEach(s => {
      if (s.className || s.class) set.add(s.className || s.class);
    });
    return Array.from(set).sort();
  }, [students]);

  const uniqueBatches = useMemo(() => {
    const set = new Set();
    students.forEach(s => {
      if (s.batch) set.add(s.batch);
    });
    return Array.from(set).sort();
  }, [students]);

  const [classFilter, setClassFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
        (student.className || student.class)?.toLowerCase().includes(searchLower) ||
        student.batch?.toLowerCase().includes(searchLower);

      if (!matchSearch) return false;

      // Class Filter
      if (classFilter !== 'All') {
        const studentClass = student.className || student.class || '';
        if (studentClass !== classFilter) return false;
      }

      // Batch Filter
      if (batchFilter !== 'All') {
        if ((student.batch || '') !== batchFilter) return false;
      }

      // Status & Payment Filter
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
  }, [students, searchQuery, statusFilter, classFilter, batchFilter, selectedMonth, paidStudentIds]);

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
      showSuccessNotification('Student updated successfully');
    } else {
      await onAddStudent(formData);
      showSuccessNotification('Student added successfully');
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
    <div className="space-y-4 md:space-y-6 pb-12 max-w-full overflow-x-hidden">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 left-5 md:left-auto z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs md:text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Tuition Management</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {formatMonthDisplay(selectedMonth)}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Manage students, monthly tuition fees, dues, and payments</p>
          </div>
        </div>

        {/* Quick Actions & Month Picker */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl flex-1 sm:flex-none justify-between sm:justify-start">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700">Month:</span>
            </div>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleOpenAddStudent}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 min-h-[40px] touch-manipulation"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Student</span>
          </button>
        </div>
      </div>

      {/* Tuition Summary Cards */}
      {/* 1 column on <380px, 2 columns on sm/md, 4 columns on lg */}
      <div className="grid grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Total Students */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Total Students</p>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 sm:mt-1">{activeStudentsCount}</div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Active enrolled</p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* 2. Paid This Month */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Paid This Month</p>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5 sm:mt-1">{paidStudents.length}</div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Of {eligibleStudents.length} eligible</p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* 3. Due This Month */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Due This Month</p>
            <div className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5 sm:mt-1">{dueStudents.length}</div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">{currency}{dueAmount.toLocaleString()} pending</p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* 4. Total Collection */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Total Collection</p>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5 sm:mt-1">{currency}{collectedThisMonth.toLocaleString()}</div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Exp: {currency}{expectedThisMonth.toLocaleString()}</p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student, guardian, phone..."
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

          {/* Toggle Mobile Filter Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex-1 py-2 px-3 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters {classFilter !== 'All' || batchFilter !== 'All' ? '(Active)' : ''}</span>
            </button>
          </div>

          {/* Dropdowns & Status Filter Pills (Desktop Always Visible, Mobile Collapsible) */}
          <div className={`${showMobileFilters ? 'flex' : 'hidden'} md:flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full md:w-auto`}>
            {/* Class Filter */}
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-slate-900 text-slate-700"
            >
              <option value="All">All Classes</option>
              {uniqueClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Batch Filter */}
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-slate-900 text-slate-700"
            >
              <option value="All">All Batches</option>
              {uniqueBatches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {/* Payment / Status Filter Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 overflow-x-auto max-w-full">
              {[
                { id: 'All', label: 'All' },
                { id: 'Paid', label: `Paid (${paidStudents.length})` },
                { id: 'Due', label: `Due (${dueStudents.length})` },
                { id: 'Active', label: 'Active' },
                { id: 'Left', label: 'Left/Inactive' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    statusFilter === f.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Student Roster Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Student Roster ({filteredStudents.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">Month: <strong className="text-slate-800">{formatMonthDisplay(selectedMonth)}</strong></span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-1/3 h-4" />
                  <Skeleton className="w-1/4 h-3" />
                </div>
                <Skeleton className="w-20 h-8 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          /* Empty State */
          <div className="p-4">
            <EmptyState
              icon={GraduationCap}
              title={searchQuery || statusFilter !== 'All' ? 'কোনো মেলানো শিক্ষার্থী পাওয়া যায়নি' : 'কোনো শিক্ষার্থী নিবন্ধিত নেই'}
              description={searchQuery || statusFilter !== 'All' ? 'আপনার সার্চ বা স্ট্যাটাস ফিল্টারের সাথে মিলিয়ে কোনো শিক্ষার্থী পাওয়া যায়নি।' : 'নতুন শিক্ষার্থী ও মাসিক টিউটরিয়াল ফি ট্র্যাক করতে শিক্ষার্থী যুক্ত করুন।'}
              actionLabel={searchQuery || statusFilter !== 'All' ? 'ফিল্টার রিসেট করুন' : 'নতুন শিক্ষার্থী যোগ করুন'}
              actionIcon={searchQuery || statusFilter !== 'All' ? undefined : Plus}
              onAction={searchQuery || statusFilter !== 'All' ? () => { setSearchQuery(''); setStatusFilter('All'); } : () => handleOpenAddStudent()}
            />
          </div>
        ) : (
          <>
            {/* Desktop Table View (Hidden on mobile <768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Class</th>
                    <th className="py-3.5 px-4">Batch</th>
                    <th className="py-3.5 px-4">Monthly Fee</th>
                    <th className="py-3.5 px-4 text-center">Payment Status</th>
                    <th className="py-3.5 px-4">Payment Date</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredStudents.map(student => {
                    const isEligible = isStudentEligibleForMonth(student, selectedMonth);
                    const hasPaid = paidStudentIds.has(String(student.id));
                    const paymentRecord = paymentsForSelectedMonth.find(p => String(p.studentId) === String(student.id));

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Student Name */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-sm">{student.studentName}</div>
                          <div className="text-[11px] text-slate-400">
                            {student.guardianName ? `Guardian: ${student.guardianName}` : ''} 
                            {student.mobile ? ` • ${student.mobile}` : ''}
                          </div>
                        </td>

                        {/* Class */}
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {student.className || student.class || '-'}
                        </td>

                        {/* Batch */}
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {student.batch || '-'}
                        </td>

                        {/* Monthly Fee */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                          {currency}{Number(student.monthlyFee || 0).toLocaleString()}
                        </td>

                        {/* Current Month Payment Status Badge */}
                        <td className="py-3.5 px-4 text-center">
                          {student.status === 'Left' || student.status === 'Inactive' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              {student.status}
                            </span>
                          ) : !isEligible ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-400">
                              Not Eligible
                            </span>
                          ) : hasPaid ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                              Due
                            </span>
                          )}
                        </td>

                        {/* Payment Date */}
                        <td className="py-3.5 px-4 text-slate-600 text-xs font-semibold">
                          {hasPaid ? paymentRecord?.paymentDate || '-' : '-'}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isEligible && !hasPaid && student.status === 'Active' && (
                              <button
                                onClick={() => handleOpenPayment(student.id)}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors flex items-center gap-1"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Pay</span>
                              </button>
                            )}

                            <button
                              onClick={() => setViewingStudent(student)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="View Student Details & History"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleOpenEditStudent(student)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit Student"
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

            {/* Mobile Cards View (Visible on screens <768px) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredStudents.map(student => {
                const isEligible = isStudentEligibleForMonth(student, selectedMonth);
                const hasPaid = paidStudentIds.has(String(student.id));
                const paymentRecord = paymentsForSelectedMonth.find(p => String(p.studentId) === String(student.id));

                return (
                  <div key={student.id} className="p-4 space-y-3 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{student.studentName}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {student.className || student.class || 'No Class'}
                          {student.batch ? ` • ${student.batch}` : ''}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {student.status === 'Left' || student.status === 'Inactive' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            {student.status}
                          </span>
                        ) : !isEligible ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-400">
                            Not Eligible
                          </span>
                        ) : hasPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Due
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400">Fee: </span>
                        <strong className="text-slate-900 font-bold">{currency}{Number(student.monthlyFee || 0).toLocaleString()}</strong>
                      </div>
                      {hasPaid && paymentRecord?.paymentDate && (
                        <div className="text-[11px] text-slate-500">
                          Paid on: <span className="font-semibold text-slate-700">{paymentRecord.paymentDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Mobile Card Actions */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setViewingStudent(student)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1 min-h-[36px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditStudent(student)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors min-h-[36px]"
                        title="Edit Student"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {isEligible && !hasPaid && student.status === 'Active' && (
                        <button
                          onClick={() => handleOpenPayment(student.id)}
                          className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors flex items-center gap-1 min-h-[36px]"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Pay Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Student Details Drawer / Responsive Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold text-base sm:text-lg flex-shrink-0">
                  {viewingStudent.studentName?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">{viewingStudent.studentName}</h3>
                  <p className="text-xs text-slate-300">
                    {viewingStudent.className || viewingStudent.class || 'No Class'} • {viewingStudent.batch || 'No Batch'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors touch-manipulation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
              {/* Information Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase block">Guardian</span>
                  <span className="text-xs font-semibold text-slate-900">{viewingStudent.guardianName || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase block">Mobile</span>
                  <span className="text-xs font-semibold text-slate-900">{viewingStudent.mobile || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase block">Monthly Fee</span>
                  <span className="text-xs font-bold text-emerald-700">{currency}{viewingStudent.monthlyFee}</span>
                </div>
                <div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase block">Current Status</span>
                  <span className={`text-xs font-bold ${viewingStudent.status === 'Active' ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {viewingStudent.status}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase block">Joining Date</span>
                  <span className="text-xs font-semibold text-slate-900">{viewingStudent.joiningDate || '-'}</span>
                </div>
                {viewingStudent.status === 'Left' && (
                  <>
                    <div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase block">Leaving Date</span>
                      <span className="text-xs font-semibold text-amber-700">{viewingStudent.leavingDate || '-'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase block">Reason</span>
                      <span className="text-xs font-semibold text-slate-800">{viewingStudent.leavingReason || '-'}</span>
                    </div>
                  </>
                )}
                {viewingStudent.notes && (
                  <div className="col-span-2 md:col-span-4 border-t border-slate-200/60 pt-2 mt-1">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase block">Notes</span>
                    <span className="text-xs text-slate-700">{viewingStudent.notes}</span>
                  </div>
                )}
              </div>

              {/* Payment History */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-600" />
                    <span>Payment History</span>
                  </h4>
                  <button
                    onClick={() => {
                      const stId = viewingStudent.id;
                      setViewingStudent(null);
                      handleOpenPayment(stId);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 min-h-[36px]"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Pay Now</span>
                  </button>
                </div>

                {(() => {
                  const studentPayments = payments.filter(
                    p => String(p.studentId) === String(viewingStudent.id)
                  );

                  const totalCollectedStudent = studentPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

                  if (studentPayments.length === 0) {
                    return (
                      <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <p className="text-xs text-slate-500 font-medium">No payment history recorded yet</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <div className="text-xs text-slate-600 font-semibold">
                        Total Collected: <strong className="text-emerald-700">{currency}{totalCollectedStudent.toLocaleString()}</strong>
                      </div>
                      <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3">Date</th>
                              <th className="py-2.5 px-3">Month</th>
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
