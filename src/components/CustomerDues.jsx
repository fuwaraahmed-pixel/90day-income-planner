import React, { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Receipt, 
  Eye, 
  Pencil, 
  Trash2, 
  ArrowUpRight, 
  CreditCard,
  Building2,
  FileText,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Input from './ui/Input';
import Modal from './ui/Modal';
import EmptyState from './ui/EmptyState';
import ConfirmModal from './ui/ConfirmModal';

export default function CustomerDues({ 
  dues = [], 
  duePayments = [], 
  crmClients = [], 
  onAddDue, 
  onUpdateDue, 
  onDeleteDue, 
  onRecordPayment 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Unpaid' | 'Partially Paid' | 'Overdue' | 'Paid'
  const [dateFilter, setDateFilter] = useState('All'); // 'All' | 'ThisMonth' | 'LastMonth'
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDue, setEditingDue] = useState(null);
  const [viewingDue, setViewingDue] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  // Payment modal state
  const [paymentModalDue, setPaymentModalDue] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    amount: '',
    paymentMethod: 'bKash',
    note: ''
  });
  const [paymentError, setPaymentError] = useState(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // New / Edit Due Form state
  const [dueForm, setDueForm] = useState({
    customerId: '',
    customerName: '',
    description: '',
    totalAmount: '',
    paidAmount: '',
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    note: ''
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to determine real status (considering due_date for overdue)
  const getComputedStatus = (item) => {
    const total = Number(item.totalAmount) || 0;
    const paid = Number(item.paidAmount) || 0;
    const due = Math.max(0, total - paid);

    if (due <= 0) return 'Paid';
    if (item.dueDate && item.dueDate < todayStr && due > 0) return 'Overdue';
    if (paid > 0 && due > 0) return 'Partially Paid';
    return 'Unpaid';
  };

  // Metrics calculation
  const totalReceivable = dues.reduce((sum, d) => {
    const due = Math.max(0, (Number(d.totalAmount) || 0) - (Number(d.paidAmount) || 0));
    return sum + due;
  }, 0);

  const overdueAmount = dues.reduce((sum, d) => {
    const due = Math.max(0, (Number(d.totalAmount) || 0) - (Number(d.paidAmount) || 0));
    if (d.dueDate && d.dueDate < todayStr && due > 0) {
      return sum + due;
    }
    return sum;
  }, 0);

  // Due this week (due date within next 7 days)
  const next7DaysStr = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];
  const dueThisWeekAmount = dues.reduce((sum, d) => {
    const due = Math.max(0, (Number(d.totalAmount) || 0) - (Number(d.paidAmount) || 0));
    if (d.dueDate && d.dueDate >= todayStr && d.dueDate <= next7DaysStr && due > 0) {
      return sum + due;
    }
    return sum;
  }, 0);

  // Collected this month from due payments
  const currentMonthPrefix = todayStr.substring(0, 7); // 'YYYY-MM'
  const collectedThisMonth = duePayments.reduce((sum, p) => {
    if (p.paymentDate && p.paymentDate.startsWith(currentMonthPrefix)) {
      return sum + (Number(p.amount) || 0);
    }
    return sum;
  }, 0);

  // Outstanding customers count (unique customers with due > 0)
  const outstandingCustomerNames = new Set(
    dues
      .filter(d => Math.max(0, (Number(d.totalAmount) || 0) - (Number(d.paidAmount) || 0)) > 0)
      .map(d => d.customerName?.trim().toLowerCase())
  );
  const outstandingCustomersCount = outstandingCustomerNames.size;

  // Filtering list
  const filteredDues = dues.filter(item => {
    const computedStatus = getComputedStatus(item);
    
    // Status Filter
    if (statusFilter === 'Unpaid' && computedStatus !== 'Unpaid') return false;
    if (statusFilter === 'Partially Paid' && computedStatus !== 'Partially Paid') return false;
    if (statusFilter === 'Overdue' && computedStatus !== 'Overdue') return false;
    if (statusFilter === 'Paid' && computedStatus !== 'Paid') return false;

    // Date Filter
    if (dateFilter === 'ThisMonth') {
      if (!item.createdAt || !item.createdAt.startsWith(currentMonthPrefix)) return false;
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.customerName?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchNote = item.note?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchNote) return false;
    }

    return true;
  });

  // Handlers
  const handleOpenAddModal = () => {
    setEditingDue(null);
    setFormError(null);
    setDueForm({
      customerId: '',
      customerName: '',
      description: '',
      totalAmount: '',
      paidAmount: '',
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      note: ''
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (due) => {
    setEditingDue(due);
    setFormError(null);
    setDueForm({
      customerId: due.customerId || '',
      customerName: due.customerName || '',
      description: due.description || '',
      totalAmount: due.totalAmount || '',
      paidAmount: due.paidAmount || '',
      dueDate: due.dueDate || new Date().toISOString().split('T')[0],
      note: due.note || ''
    });
    setShowAddModal(true);
  };

  const handleCustomerSelect = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setDueForm(prev => ({ ...prev, customerId: '', customerName: '' }));
      return;
    }
    const found = crmClients.find(c => String(c.id) === String(selectedId));
    if (found) {
      setDueForm(prev => ({
        ...prev,
        customerId: found.id,
        customerName: found.businessName ? `${found.clientName} (${found.businessName})` : found.clientName
      }));
    }
  };

  const [formError, setFormError] = useState(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const handleSaveDue = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!dueForm.customerName.trim() || !dueForm.totalAmount) {
      setFormError('অনুগ্রহ করে কাস্টমারের নাম এবং মোট টাকার পরিমাণ পূরণ করুন।');
      return;
    }

    setIsSubmittingForm(true);
    try {
      const payload = {
        ...dueForm,
        description: dueForm.description.trim() || 'পাওনা বিবরণী'
      };

      if (editingDue) {
        await onUpdateDue(editingDue.id, payload);
      } else {
        await onAddDue(payload);
      }

      setShowAddModal(false);
      setEditingDue(null);
    } catch (err) {
      console.error('Save due error:', err);
      setFormError(err.message || 'পাওনা সংরক্ষণ করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleOpenPaymentModal = (due) => {
    const currentDueAmount = Math.max(0, (Number(due.totalAmount) || 0) - (Number(due.paidAmount) || 0));
    
    // Generate unique UUID for payment idempotency
    const uniquePaymentId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `pay_due_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    setPaymentModalDue(due);
    setPaymentForm({
      paymentId: uniquePaymentId,
      paymentDate: new Date().toISOString().split('T')[0],
      amount: currentDueAmount > 0 ? currentDueAmount : '',
      paymentMethod: 'bKash',
      note: ''
    });
    setPaymentError(null);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentModalDue) return;

    const amountNum = Number(paymentForm.amount);
    if (!amountNum || amountNum <= 0) {
      setPaymentError('পরিশোধিত টাকার পরিমাণ ০-এর বেশি হতে হবে।');
      return;
    }

    const currentDueAmount = Math.max(0, (Number(paymentModalDue.totalAmount) || 0) - (Number(paymentModalDue.paidAmount) || 0));
    if (amountNum > currentDueAmount + 0.01) {
      setPaymentError(`পেমেন্ট পরিমাণ বর্তমান বাকি টাকা (৳${currentDueAmount.toLocaleString()}) এর চেয়ে বেশি হতে পারে না।`);
      return;
    }

    setIsSubmittingPayment(true);
    setPaymentError(null);

    try {
      const res = await onRecordPayment({
        paymentId: paymentForm.paymentId,
        dueId: paymentModalDue.id,
        paymentDate: paymentForm.paymentDate,
        amount: amountNum,
        paymentMethod: paymentForm.paymentMethod,
        note: paymentForm.note
      });

      if (res && res.success === false) {
        setPaymentError(res.message || 'পেমেন্ট প্রসেস করতে সমস্যা হয়েছে।');
      } else {
        setPaymentModalDue(null);
      }
    } catch (err) {
      setPaymentError(err.message || 'পেমেন্ট জমা দেওয়া ব্যর্থ হয়েছে।');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Render Status Badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            পরিশোধিত
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            আংশিক পরিশোধ
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            বকেয়া / ওভারডিউ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            বাকি (Unpaid)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans antialiased text-slate-800 pb-12">
      
      {/* ========================================================================= */}
      {/* 1. HEADER BANNER */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                কাস্টমার পাওনা ম্যানেজমেন্ট
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              কার কাছে কত টাকা পাওনা — এক নজরে হিসাব ৳
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              আপনার ব্যবসার প্রতিটি বিক্রয় ও অর্ডারের বকেয়া পাওনা ট্র্যাক করুন, কিস্তিতে পেমেন্ট গ্রহণ করুন এবং বকেয়া টাকা আদায় সহজ করুন।
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="self-start md:self-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 text-sm shrink-0 active:scale-95"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>+ নতুন পাওনা যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUMMARY METRICS CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Card 1: Total Receivable */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-1.5 relative overflow-hidden col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>মোট বাকি পাওনা</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            ৳{totalReceivable.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            সকল কাস্টমারের বর্তমান মোট পাওনা
          </p>
        </div>

        {/* Card 2: Overdue Dues */}
        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-2xs space-y-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
            <span>⚠ মেয়ানোত্তীর্ণ (Overdue)</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-900 tracking-tight">
            ৳{overdueAmount.toLocaleString()}
          </div>
          <p className="text-[11px] text-amber-700 font-medium">
            মেয়াদ পার হয়ে যাওয়া পাওনা
          </p>
        </div>

        {/* Card 3: Due This Week */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>এই সপ্তাহে প্ৰদেয়</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            ৳{dueThisWeekAmount.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            আগামী ৭ দিনের মধ্যে মেয়াদ
          </p>
        </div>

        {/* Card 4: Collected This Month */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>এই মাসে আদায়</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 tracking-tight">
            ৳{collectedThisMonth.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">
            চলতি মাসে সংগৃহীত পেমেন্ট
          </p>
        </div>

        {/* Card 5: Outstanding Customers */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>বকেয়া গ্রাহক</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {outstandingCustomersCount} <span className="text-xs text-slate-500 font-normal">জন</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            যাদের কাছে পাওনা বাকি আছে
          </p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. FILTER & SEARCH BAR */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="কাস্টমার নাম বা কাজের বিবরণ লিখে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: 'All', label: 'সকল পাওনা' },
              { key: 'Unpaid', label: 'বাকি (Unpaid)' },
              { key: 'Partially Paid', label: 'আংশিক' },
              { key: 'Overdue', label: '⚠ ওভারডিউ' },
              { key: 'Paid', label: 'পরিশোধিত' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === tab.key
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. DUES TABLE & LIST */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        {filteredDues.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="কোনো পাওনা পাওয়া যায়নি"
            description="আপনার সার্চ বা ফিল্টারের সাথে মিলে এমন কোনো পাওনা রেকর্ড নেই।"
            actionLabel="+ নতুন পাওনা যোগ করুন"
            onAction={handleOpenAddModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">কাস্টমার</th>
                  <th className="px-4 py-3.5">কাজের বিবরণ</th>
                  <th className="px-4 py-3.5 text-right">মোট বিল</th>
                  <th className="px-4 py-3.5 text-right">পরিশোধিত</th>
                  <th className="px-4 py-3.5 text-right">বাকি পাওনা</th>
                  <th className="px-4 py-3.5">মেয়াদ তারিখ</th>
                  <th className="px-4 py-3.5">স্ট্যাটাস</th>
                  <th className="px-4 py-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredDues.map((item) => {
                  const total = Number(item.totalAmount) || 0;
                  const paid = Number(item.paidAmount) || 0;
                  const due = Math.max(0, total - paid);
                  const computedStatus = getComputedStatus(item);
                  const isOverdue = computedStatus === 'Overdue';

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isOverdue ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Customer Name */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{item.customerName}</div>
                        {item.note && (
                          <div className="text-[10px] text-slate-400 font-normal truncate max-w-[180px]">
                            {item.note}
                          </div>
                        )}
                      </td>

                      {/* Work Description */}
                      <td className="px-4 py-3.5 font-medium text-slate-700">
                        {item.description}
                      </td>

                      {/* Total Amount */}
                      <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                        ৳{total.toLocaleString()}
                      </td>

                      {/* Paid Amount */}
                      <td className="px-4 py-3.5 text-right font-semibold text-emerald-600">
                        ৳{paid.toLocaleString()}
                      </td>

                      {/* Remaining Due */}
                      <td className="px-4 py-3.5 text-right">
                        <span className={`font-extrabold ${due > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                          ৳{due.toLocaleString()}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {item.dueDate ? (
                          <span className={`text-xs ${isOverdue ? 'text-amber-800 font-bold' : 'text-slate-600'}`}>
                            {item.dueDate}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {renderStatusBadge(computedStatus)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {due > 0 && (
                            <button
                              onClick={() => handleOpenPaymentModal(item)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-2xs transition-colors flex items-center gap-1"
                              title="পেমেন্ট রিসিভ করুন"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>পরিশোধ নিন</span>
                            </button>
                          )}
                          <button
                            onClick={() => setViewingDue(item)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="বিস্তারিত দেখুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="সম্পাদনা করুন"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* ========================================================================= */}
      {/* 5. ADD / EDIT DUE MODAL */}
      {/* ========================================================================= */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title={editingDue ? 'পাওনা তথ্য সংশোধন' : '+ নতুন কাস্টমার পাওনা যোগ করুন'}
        >
          <form onSubmit={handleSaveDue} className="space-y-4 pt-2">
            
            {/* Select existing customer or custom name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                কাস্টমার সিলেক্ট করুন বা নতুন নাম লিখুন <span className="text-rose-500">*</span>
              </label>
              {crmClients.length > 0 && (
                <select
                  value={dueForm.customerId}
                  onChange={handleCustomerSelect}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl mb-2 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="">-- CRM কাস্টমার থেকে নির্বাচন করুন (ঐচ্ছিক) --</option>
                  {crmClients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.clientName} ({c.businessName})
                    </option>
                  ))}
                </select>
              )}
              <input
                type="text"
                required
                placeholder="কাস্টমার / বিজনেসের নাম (যেমন: Rahim Electronics)"
                value={dueForm.customerName}
                onChange={(e) => setDueForm({ ...dueForm, customerName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            {/* Description / Work Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                কাজ / বিক্রয়ের বিবরণ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: Website Development, প্রোডাক্ট সেল, ইত্যাদি"
                value={dueForm.description}
                onChange={(e) => setDueForm({ ...dueForm, description: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            {/* Total Amount & Initial Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  মোট টাকা (Total Amount) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="৳২০০০০"
                  value={dueForm.totalAmount}
                  onChange={(e) => setDueForm({ ...dueForm, totalAmount: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-bold"
                />
              </div>

              {!editingDue && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    প্রাথমিক পেমেন্ট (Initial Paid)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="৳১২০০০ (যদি নগদ পেয়ে থাকেন)"
                    value={dueForm.paidAmount}
                    onChange={(e) => setDueForm({ ...dueForm, paidAmount: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Calculated Due Preview */}
            {dueForm.totalAmount && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">অবশিষ্ট বাকি টাকা (Remaining Due):</span>
                <span className="font-extrabold text-rose-600 text-sm">
                  ৳{Math.max(0, (Number(dueForm.totalAmount) || 0) - (Number(dueForm.paidAmount) || 0)).toLocaleString()}
                </span>
              </div>
            )}

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                মেয়াদ / পরিশোধের শেষ তারিখ (Due Date)
              </label>
              <input
                type="date"
                value={dueForm.dueDate}
                onChange={(e) => setDueForm({ ...dueForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                নোট বা মন্তব্য (ঐচ্ছিক)
              </label>
              <textarea
                rows={2}
                placeholder="যেকোনো শর্ত বা মন্তব্য..."
                value={dueForm.note}
                onChange={(e) => setDueForm({ ...dueForm, note: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                disabled={isSubmittingForm}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmittingForm}
                className="px-5 py-2 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmittingForm ? 'সংরক্ষণ হচ্ছে...' : editingDue ? 'সংশোধন সংরক্ষণ করুন' : 'পাওনা সংরক্ষণ করুন'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 6. PAYMENT RECEIVED MODAL */}
      {/* ========================================================================= */}
      {paymentModalDue && (
        <Modal
          isOpen={Boolean(paymentModalDue)}
          onClose={() => setPaymentModalDue(null)}
          title="💳 কাস্টমার পেমেন্ট গ্রহণ (Payment Received)"
        >
          <form onSubmit={handlePaymentSubmit} className="space-y-4 pt-1">
            
            {/* Customer Info Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-1">
              <div className="text-[11px] text-slate-300 font-medium">কাস্টমার ও কাজ:</div>
              <div className="font-bold text-sm text-white">{paymentModalDue.customerName}</div>
              <div className="text-xs text-emerald-300 font-medium">{paymentModalDue.description}</div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-700/80 text-xs">
                <span className="text-slate-300">বর্তমান বাকি পাওনা:</span>
                <span className="font-extrabold text-rose-400 text-sm">
                  ৳{Math.max(0, (Number(paymentModalDue.totalAmount) || 0) - (Number(paymentModalDue.paidAmount) || 0)).toLocaleString()}
                </span>
              </div>
            </div>

            {paymentError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Payment Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                পরিশোধকৃত টাকার পরিমাণ (৳) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="যেমন: ৳৩০০০"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            {/* Payment Date & Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পেমেন্টের তারিখ
                </label>
                <input
                  type="date"
                  required
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পেমেন্ট মেথড
                </label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-medium"
                >
                  <option value="bKash">bKash (বিকাশ)</option>
                  <option value="Nagad">Nagad (নগদ)</option>
                  <option value="Bank Transfer">Bank Transfer (ব্যাংক)</option>
                  <option value="Cash">Cash (নগদ ক্যাশ)</option>
                  <option value="Rocket">Rocket (রকেট)</option>
                </select>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                পেমেন্ট নোট / রেফারেন্স (ঐচ্ছিক)
              </label>
              <input
                type="text"
                placeholder="যেমন: ৩য় কিস্তি / ট্রানজেকশন আইডি"
                value={paymentForm.note}
                onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            {/* Automatic Income Tracker Sync Notice */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-800 font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>এই পেমেন্টটি স্বয়ংক্রিয়ভাবে ইনকাম ট্র্যাকার (Income Tracker)-এ আয় হিসেবে যুক্ত হবে।</span>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPaymentModalDue(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                disabled={isSubmittingPayment}
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                disabled={isSubmittingPayment}
              >
                {isSubmittingPayment ? 'প্রসেস হচ্ছে...' : 'পেমেন্ট জমা নিশ্চিত করুন'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 7. VIEW DUE DETAILS & PAYMENT HISTORY MODAL */}
      {/* ========================================================================= */}
      {viewingDue && (
        <Modal
          isOpen={Boolean(viewingDue)}
          onClose={() => setViewingDue(null)}
          title="📋 পাওনা ও পেমেন্ট ইতিহাস"
        >
          <div className="space-y-4 pt-1">
            {/* Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{viewingDue.customerName}</h3>
                  <p className="text-xs text-slate-500 font-medium">{viewingDue.description}</p>
                </div>
                <div>{renderStatusBadge(getComputedStatus(viewingDue))}</div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 text-center">
                <div className="bg-white p-2 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-medium">মোট কাজ/বিল</div>
                  <div className="text-xs font-bold text-slate-900">৳{Number(viewingDue.totalAmount).toLocaleString()}</div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-medium">পরিশোধিত</div>
                  <div className="text-xs font-bold text-emerald-600">৳{Number(viewingDue.paidAmount).toLocaleString()}</div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-medium">অবশিষ্ট বাকি</div>
                  <div className="text-xs font-extrabold text-rose-600">
                    ৳{Math.max(0, (Number(viewingDue.totalAmount) || 0) - (Number(viewingDue.paidAmount) || 0)).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History List */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
                <span>পেমেন্ট হিস্ট্রি (Payment History)</span>
                <span className="text-[11px] font-medium text-slate-500">
                  মোট {duePayments.filter(p => String(p.dueId) === String(viewingDue.id)).length}টি পেমেন্ট
                </span>
              </h4>

              {duePayments.filter(p => String(p.dueId) === String(viewingDue.id)).length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  এখনো কোনো পেমেন্ট রেকর্ড করা হয়নি।
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {duePayments
                    .filter(p => String(p.dueId) === String(viewingDue.id))
                    .map((p, idx) => (
                      <div key={p.id || idx} className="p-3 rounded-xl bg-white border border-slate-200 text-xs flex justify-between items-center">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>৳{Number(p.amount).toLocaleString()}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                              {p.paymentMethod || 'bKash'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500">{p.paymentDate} {p.note && `• ${p.note}`}</div>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
                          ✓ ইনকাম ট্র্যাকার-এ সিঙ্কড
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-between items-center border-t border-slate-100">
              {Math.max(0, (Number(viewingDue.totalAmount) || 0) - (Number(viewingDue.paidAmount) || 0)) > 0 && (
                <button
                  onClick={() => {
                    const dueToPay = viewingDue;
                    setViewingDue(null);
                    handleOpenPaymentModal(dueToPay);
                  }}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>+ পরিশোধ নিন</span>
                </button>
              )}
              <button
                onClick={() => setViewingDue(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors ml-auto"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <ConfirmModal
          isOpen={Boolean(deleteConfirmId)}
          onClose={() => setDeleteConfirmId(null)}
          onConfirm={() => {
            onDeleteDue(deleteConfirmId);
            setDeleteConfirmId(null);
          }}
          title="পাওনা রেকর্ড মুছে ফেলতে চান?"
          message="এই পাওনাটি ডিলিট করলে গ্রাহকের হিসাব তালিকা থেকে বাদ যাবে।"
        />
      )}

    </div>
  );
}
