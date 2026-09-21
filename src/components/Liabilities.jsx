import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle,
  Clock,
  Landmark,
  CreditCard,
  Briefcase
} from 'lucide-react';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Input from './ui/Input';
import Modal from './ui/Modal';
import EmptyState from './ui/EmptyState';
import Toast from './ui/Toast';
import UniversalPaymentModal from './ui/UniversalPaymentModal';
import ConfirmModal from './ui/ConfirmModal';

export default function Liabilities({ 
  liabilities = [], 
  setLiabilities, 
  liabilityPayments = [],
  emiInstallments = [],
  onRecordPayment,
  onRecordEmiPayment,
  onCreateLiability,
  onDeleteLiability,
  onRecordExpense
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newLiability, setNewLiability] = useState({
    creditorName: '',
    liabilityType: 'Hawlad',
    totalAmount: '',
    paidAmount: '',
    dueDate: '',
    emiAmount: '',
    durationMonths: '',
    startDate: new Date().toISOString().split('T')[0],
    dueDay: new Date().getDate(),
    notes: '',
    addToExpense: true
  });

  // Payment Modal State
  const [paymentModalLiability, setPaymentModalLiability] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentId: '',
    installmentId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    amount: '',
    paymentMethod: 'Cash',
    notes: '',
    addToExpense: true
  });
  const [paymentError, setPaymentError] = useState(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const liabilityTypes = ['Hawlad', 'Bank Loan', 'EMI', 'Other'];
  const paymentMethods = ['Cash', 'bKash', 'Nagad', 'Rocket', 'Bank Transfer'];

  const filteredLiabilities = liabilities.filter(l => {
    return l.creditorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           l.liabilityType.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activeLiabilities = filteredLiabilities.filter(l => l.status !== 'Paid Off');
  const completedLiabilities = filteredLiabilities.filter(l => l.status === 'Paid Off');

  const totalDebt = activeLiabilities.reduce((sum, l) => sum + (Number(l.totalAmount) || 0), 0);
  const totalPaid = activeLiabilities.reduce((sum, l) => sum + (Number(l.paidAmount) || 0), 0);
  const totalRemaining = activeLiabilities.reduce((sum, l) => sum + (Number(l.remainingAmount) || 0), 0);

  const handleAddLiability = async (e) => {
    e.preventDefault();
    if (!newLiability.creditorName.trim() || !newLiability.totalAmount) return;

    const res = await onCreateLiability(newLiability);
    if (res && res.success) {
      if (newLiability.addToExpense && Number(newLiability.paidAmount) > 0 && res.data?.id) {
        const uniquePaymentId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pay_${Date.now()}`;
        if (onRecordPayment) {
          await onRecordPayment({
            paymentId: uniquePaymentId,
            liabilityId: res.data.id,
            paymentDate: new Date().toISOString().split('T')[0],
            amount: Number(newLiability.paidAmount),
            paymentMethod: 'Cash',
            notes: 'Initial Payment',
            addToExpense: true
          });
        }
      }

      setShowAddModal(false);
      setNewLiability({
        creditorName: '',
        liabilityType: 'Hawlad',
        totalAmount: '',
        paidAmount: '',
        dueDate: '',
        emiAmount: '',
        durationMonths: '',
        startDate: new Date().toISOString().split('T')[0],
        dueDay: new Date().getDate(),
        notes: '',
        addToExpense: true
      });
    } else {
      alert(res?.message || 'Error adding liability');
    }
  };

  // Auto-calculate total amount for EMI
  useEffect(() => {
    if (newLiability.liabilityType === 'EMI' && newLiability.emiAmount && newLiability.durationMonths) {
      setNewLiability(prev => ({
        ...prev,
        totalAmount: String(Number(prev.emiAmount) * Number(prev.durationMonths))
      }));
    }
  }, [newLiability.emiAmount, newLiability.durationMonths, newLiability.liabilityType]);

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await onDeleteLiability(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleOpenPaymentModal = (liability) => {
    const uniquePaymentId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pay_${Date.now()}`;
    setPaymentModalLiability(liability);
    
    let defaultAmount = liability.remainingAmount > 0 ? liability.remainingAmount : '';
    let targetInstallmentId = '';
    
    if (liability.liabilityType === 'EMI') {
      const activeInstallment = emiInstallments.find(i => i.liabilityId === liability.id && ['Upcoming', 'Due', 'Partial', 'Overdue'].includes(i.status));
      if (activeInstallment) {
        defaultAmount = activeInstallment.expectedAmount - activeInstallment.paidAmount;
        targetInstallmentId = activeInstallment.id;
      }
    }
    
    setPaymentForm({
      paymentId: uniquePaymentId,
      installmentId: targetInstallmentId,
      paymentDate: new Date().toISOString().split('T')[0],
      amount: defaultAmount,
      paymentMethod: 'Cash',
      notes: '',
      addToExpense: true
    });
    setPaymentError(null);
  };

  const handleRecordPaymentSubmit = async (paymentData) => {
    if (!paymentModalLiability) return;

    const amountNum = Number(paymentData.amount);
    if (!amountNum || amountNum <= 0) {
      setPaymentError('Payment amount must be greater than zero.');
      return;
    }

    if (amountNum > Number(paymentModalLiability.remainingAmount)) {
      setPaymentError(`Cannot pay more than remaining amount (৳${Number(paymentModalLiability.remainingAmount).toLocaleString()})`);
      return;
    }

    setIsSubmittingPayment(true);
    setPaymentError(null);

    try {
      let res;
      if (paymentModalLiability.liabilityType === 'EMI') {
        if (!paymentData.installmentId && !paymentForm.installmentId) {
          setPaymentError('No active EMI installment found to pay.');
          setIsSubmittingPayment(false);
          return;
        }
        res = await onRecordEmiPayment({
          paymentId: paymentData.paymentId || paymentForm.paymentId,
          liabilityId: paymentModalLiability.id,
          installmentId: paymentData.installmentId || paymentForm.installmentId,
          paymentDate: paymentData.paymentDate,
          amount: amountNum,
          paymentMethod: paymentData.paymentMethod,
          notes: paymentData.notes,
          addToExpense: paymentForm.addToExpense
        });
      } else {
        res = await onRecordPayment({
          paymentId: paymentData.paymentId || paymentForm.paymentId,
          liabilityId: paymentModalLiability.id,
          paymentDate: paymentData.paymentDate,
          amount: amountNum,
          paymentMethod: paymentData.paymentMethod,
          notes: paymentData.notes,
          addToExpense: paymentForm.addToExpense
        });
      }

      if (res && res.success !== false) {
        setPaymentModalLiability(null);
      } else {
        setPaymentError(res?.message || 'Failed to record payment.');
      }
    } catch (err) {
      setPaymentError(err.message || 'Network error.');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Paid Off') return <Badge variant="success">Paid Off</Badge>;
    return <Badge variant="warning">Active</Badge>;
  };

  const getTypeIcon = (type) => {
    if (type === 'Bank Loan') return <Landmark className="w-4 h-4 text-slate-500" />;
    if (type === 'EMI') return <CreditCard className="w-4 h-4 text-slate-500" />;
    return <Briefcase className="w-4 h-4 text-slate-500" />;
  };

  const renderEmiProgress = (liability) => {
    if (liability.liabilityType !== 'EMI') return null;
    const emis = emiInstallments.filter(e => String(e.liabilityId) === String(liability.id));
    const paid = emis.filter(e => e.status === 'Paid').length;
    const partial = emis.filter(e => e.status === 'Partial').length;
    const total = liability.durationMonths || emis.length || 0;
    const remaining = total - paid - partial;

    return (
      <div className="text-xs mt-1.5 space-y-0.5">
        <div className="text-emerald-600 font-medium">Paid: {paid}/{total}</div>
        {partial > 0 && <div className="text-amber-600 font-medium">Partial: {partial}</div>}
        <div className="text-rose-600 font-medium">Remaining: {remaining}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Liabilities & Debts</h2>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage your loans, EMI, and Hawlads securely.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} icon={Plus} className="w-full sm:w-auto">
          Add Liability
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <p className="text-sm text-slate-500 font-medium mb-1">Total Active Debt</p>
          <p className="text-2xl font-bold text-slate-800">৳{totalDebt.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <p className="text-sm text-slate-500 font-medium mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-emerald-600">৳{totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-rose-100 flex flex-col justify-center bg-rose-50/30">
          <p className="text-sm text-rose-600 font-medium mb-1">Remaining Balance</p>
          <p className="text-2xl font-bold text-rose-700">৳{totalRemaining.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search liabilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {liabilities.length === 0 ? (
          <EmptyState 
            icon={Landmark}
            title="No Liabilities Found"
            description="You haven't added any debts or loans yet. Click 'Add Liability' to start tracking."
            actionLabel="Add Liability"
            onAction={() => setShowAddModal(true)}
          />
        ) : filteredLiabilities.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No results match your search.</div>
        ) : (
          <div className="w-full">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-sm font-medium text-slate-500">
                    <th className="px-6 py-4">Creditor Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4">Paid</th>
                    <th className="px-6 py-4 text-rose-600">Remaining</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeLiabilities.map(liability => (
                    <tr key={liability.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 whitespace-normal min-w-[150px]">{liability.creditorName}</div>
                        {liability.dueDate && (
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" /> Due: {new Date(liability.dueDate).toLocaleDateString('en-GB')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          {getTypeIcon(liability.liabilityType)}
                          {liability.liabilityType}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        ৳{Number(liability.totalAmount).toLocaleString()}
                        {liability.liabilityType === 'EMI' && renderEmiProgress(liability)}
                      </td>
                      <td className="px-6 py-4 font-medium text-emerald-600">৳{Number(liability.paidAmount).toLocaleString()}</td>
                      <td className="px-6 py-4 font-bold text-rose-600">৳{Number(liability.remainingAmount).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        {getStatusBadge(liability.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => handleOpenPaymentModal(liability)}
                          >
                            Pay
                          </Button>
                          <button 
                            onClick={() => setDeleteConfirmId(liability.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Liability"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {completedLiabilities.length > 0 && (
                    <tr>
                      <td colSpan="7" className="bg-slate-50 py-3 px-6 text-sm font-semibold text-slate-500">
                        Completed / Paid Off
                      </td>
                    </tr>
                  )}

                  {completedLiabilities.map(liability => (
                    <tr key={liability.id} className="hover:bg-slate-50/50 transition-colors opacity-75">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 line-through decoration-slate-300 whitespace-normal min-w-[150px]">{liability.creditorName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          {getTypeIcon(liability.liabilityType)}
                          {liability.liabilityType}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-500">৳{Number(liability.totalAmount).toLocaleString()}</td>
                      <td className="px-6 py-4 font-medium text-slate-500">৳{Number(liability.paidAmount).toLocaleString()}</td>
                      <td className="px-6 py-4 font-medium text-slate-500">৳0</td>
                      <td className="px-6 py-4">
                        {getStatusBadge(liability.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setDeleteConfirmId(liability.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col divide-y divide-slate-100">
              {activeLiabilities.map(liability => (
                <div key={liability.id} className="p-4 space-y-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-800 truncate">{liability.creditorName}</div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1">
                        {getTypeIcon(liability.liabilityType)}
                        <span>{liability.liabilityType}</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(liability.status)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                    <div>
                      <div className="text-slate-500 text-xs mb-1">Total Amount</div>
                      <div className="font-medium text-slate-700">৳{Number(liability.totalAmount).toLocaleString()}</div>
                      {liability.liabilityType === 'EMI' && renderEmiProgress(liability)}
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs mb-1">Paid Amount</div>
                      <div className="font-medium text-emerald-600">৳{Number(liability.paidAmount).toLocaleString()}</div>
                    </div>
                    <div className="col-span-2 pt-3 mt-1 border-t border-slate-200/60">
                      <div className="text-slate-500 text-xs mb-1">Remaining Balance</div>
                      <div className="font-bold text-rose-600 text-lg">৳{Number(liability.remainingAmount).toLocaleString()}</div>
                    </div>
                  </div>

                  {liability.dueDate && (
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Due: {new Date(liability.dueDate).toLocaleDateString('en-GB')}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="secondary" 
                      className="flex-1 justify-center"
                      onClick={() => handleOpenPaymentModal(liability)}
                    >
                      Record Payment
                    </Button>
                    <button 
                      onClick={() => setDeleteConfirmId(liability.id)}
                      className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              {completedLiabilities.length > 0 && (
                <div className="bg-slate-50/80 py-3 px-4 text-sm font-semibold text-slate-500 border-y border-slate-100">
                  Completed / Paid Off
                </div>
              )}

              {completedLiabilities.map(liability => (
                <div key={liability.id} className="p-4 space-y-4 opacity-75">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-800 line-through decoration-slate-300 truncate">{liability.creditorName}</div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1">
                        {getTypeIcon(liability.liabilityType)}
                        <span>{liability.liabilityType}</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(liability.status)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                    <div>
                      <div className="text-slate-500 text-xs mb-1">Total Amount</div>
                      <div className="font-medium text-slate-500">৳{Number(liability.totalAmount).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs mb-1">Paid Amount</div>
                      <div className="font-medium text-slate-500">৳{Number(liability.paidAmount).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex pt-2">
                    <button 
                      onClick={() => setDeleteConfirmId(liability.id)}
                      className="w-full flex justify-center items-center gap-2 p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Delete Record</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Liability Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Liability">
        <form onSubmit={handleAddLiability} className="space-y-4">
          <Input 
            label="Creditor / Source Name *" 
            placeholder="e.g. Bank, Friend's Name" 
            value={newLiability.creditorName}
            onChange={(e) => setNewLiability({...newLiability, creditorName: e.target.value})}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Liability Type *</label>
              <select
                value={newLiability.liabilityType}
                onChange={(e) => setNewLiability({...newLiability, liabilityType: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                required
              >
                {liabilityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <Input 
              label="Total Amount (৳) *" 
              type="number" 
              placeholder="e.g. 50000" 
              value={newLiability.totalAmount}
              onChange={(e) => setNewLiability({...newLiability, totalAmount: e.target.value})}
              required
              disabled={newLiability.liabilityType === 'EMI'}
            />
          </div>
          
          {newLiability.liabilityType === 'EMI' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <Input 
                label="Monthly EMI Amount (৳) *" 
                type="number" 
                placeholder="e.g. 5000" 
                value={newLiability.emiAmount}
                onChange={(e) => setNewLiability({...newLiability, emiAmount: e.target.value})}
                required={newLiability.liabilityType === 'EMI'}
              />
              <Input 
                label="Duration (Months) *" 
                type="number" 
                placeholder="e.g. 12" 
                value={newLiability.durationMonths}
                onChange={(e) => setNewLiability({...newLiability, durationMonths: e.target.value})}
                required={newLiability.liabilityType === 'EMI'}
              />
              <Input 
                label="Start Date *" 
                type="date" 
                value={newLiability.startDate}
                onChange={(e) => setNewLiability({...newLiability, startDate: e.target.value})}
                required={newLiability.liabilityType === 'EMI'}
              />
              <Input 
                label="Due Day (1-31) *" 
                type="number" 
                min="1" max="31"
                placeholder="e.g. 15" 
                value={newLiability.dueDay}
                onChange={(e) => setNewLiability({...newLiability, dueDay: e.target.value})}
                required={newLiability.liabilityType === 'EMI'}
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label="Already Paid (৳)" 
              type="number" 
              placeholder="e.g. 10000" 
              value={newLiability.paidAmount}
              onChange={(e) => setNewLiability({...newLiability, paidAmount: e.target.value})}
            />
            {newLiability.liabilityType !== 'EMI' && (
              <Input 
                label="Due Date (Optional)" 
                type="date" 
                value={newLiability.dueDate}
                onChange={(e) => setNewLiability({...newLiability, dueDate: e.target.value})}
              />
            )}
          </div>
          <Input 
            label="Notes" 
            placeholder="Any specific details..." 
            value={newLiability.notes}
            onChange={(e) => setNewLiability({...newLiability, notes: e.target.value})}
          />
          {Number(newLiability.paidAmount) > 0 && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 mt-2">
              <input 
                type="checkbox" 
                id="newLiabilityAddToExpense" 
                checked={newLiability.addToExpense}
                onChange={(e) => setNewLiability({...newLiability, addToExpense: e.target.checked})}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <label htmlFor="newLiabilityAddToExpense" className="text-sm font-medium text-slate-700 cursor-pointer">
                Add already paid amount to Expense Tracker (খরচ হিসেবে যুক্ত করুন)
              </label>
            </div>
          )}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setShowAddModal(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" className="w-full sm:w-auto">Save Liability</Button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <UniversalPaymentModal
        isOpen={Boolean(paymentModalLiability)}
        onClose={() => setPaymentModalLiability(null)}
        onSubmit={handleRecordPaymentSubmit}
        title="Record Repayment"
        description="পেমেন্ট রেকর্ড করলে তা সরাসরি খরচ (Expense)-এ যুক্ত করা যাবে।"
        isSubmitting={isSubmittingPayment}
        submitLabel="Confirm Payment"
        paymentId={paymentForm.paymentId}
        error={paymentError}
        headerContent={
          paymentModalLiability ? (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Creditor: <span className="font-medium text-slate-800">{paymentModalLiability.creditorName}</span></span>
              <span className="text-slate-500">Remaining: <span className="font-bold text-rose-600">৳{Number(paymentModalLiability.remainingAmount).toLocaleString()}</span></span>
            </div>
          ) : null
        }
      >
        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 mt-2">
          <input 
            type="checkbox" 
            id="addToExpense" 
            checked={paymentForm.addToExpense}
            onChange={(e) => setPaymentForm({...paymentForm, addToExpense: e.target.checked})}
            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
          />
          <label htmlFor="addToExpense" className="text-sm font-medium text-slate-700 cursor-pointer">
            Add this payment to Expense Tracker (খরচ হিসেবে যুক্ত করুন)
          </label>
        </div>
      </UniversalPaymentModal>

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Liability"
        message="Are you sure you want to delete this liability? All associated payment records will also be deleted. This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
