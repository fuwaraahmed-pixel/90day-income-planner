import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Calendar, 
  DollarSign, 
  Trash2, 
  Briefcase, 
  TrendingUp, 
  CheckCircle,
  Clock,
  LayoutGrid,
  Table as TableIcon,
  GripVertical,
  XCircle,
  BarChart3
} from 'lucide-react';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Input from './ui/Input';
import Modal from './ui/Modal';
import UniversalPaymentModal from './ui/UniversalPaymentModal';
import EmptyState from './ui/EmptyState';
import ConfirmModal from './ui/ConfirmModal';

export default function Crm({ 
  leads, 
  setLeads, 
  services = [], 
  crmPayments = [], 
  customerDues = [],
  duePayments = [],
  onRecordPayment,
  onNavigateToDues
}) {
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'kanban'
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [selectedCustomerProfile, setSelectedCustomerProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [draggedLeadId, setDraggedLeadId] = useState(null);

  // Record Payment Modal State with Payment UUID Idempotency
  const [paymentModalLead, setPaymentModalLead] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    amount: '',
    paymentMethod: 'bKash',
    notes: ''
  });
  const [paymentError, setPaymentError] = useState(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // New Lead Form State
  const [newLead, setNewLead] = useState({
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    businessName: '',
    contact: '',
    service: 'Business Website',
    customService: '',
    quotedPrice: '',
    advance: '',
    status: 'New',
    nextFollowUp: '',
    notes: ''
  });

  const statuses = [
    { value: 'New', label: 'New (নতুন লিড)', badgeColor: 'bg-slate-100 text-slate-700 border-slate-200', colHeaderBg: 'bg-slate-100/80 border-slate-200 text-slate-700' },
    { value: 'Contacted', label: 'Contacted (যোগাযোগ হয়েছে)', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200', colHeaderBg: 'bg-blue-50/80 border-blue-200 text-blue-800' },
    { value: 'Interested', label: 'Interested (আগ্রহী)', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200', colHeaderBg: 'bg-indigo-50/80 border-indigo-200 text-indigo-800' },
    { value: 'Negotiation', label: 'Negotiation (দরদাম চলছে)', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200', colHeaderBg: 'bg-amber-50/80 border-amber-200 text-amber-800' },
    { value: 'Advance Paid', label: 'Advance Paid (অ্যাডভান্স প্রাপ্ত)', badgeColor: 'bg-teal-50 text-teal-700 border-teal-200', colHeaderBg: 'bg-teal-50/80 border-teal-200 text-teal-800' },
    { value: 'Working', label: 'Working (কাজ চলছে)', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200', colHeaderBg: 'bg-purple-50/80 border-purple-200 text-purple-800' },
    { value: 'Delivered', label: 'Delivered (ডেলিভারি সম্পন্ন)', badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200', colHeaderBg: 'bg-cyan-50/80 border-cyan-200 text-cyan-800' },
    { value: 'Paid', label: 'Paid (সম্পূর্ণ পেমেন্ট)', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', colHeaderBg: 'bg-emerald-50/80 border-emerald-200 text-emerald-800' },
    { value: 'Lost', label: 'Lost (হাতছাড়া হয়েছে)', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200', colHeaderBg: 'bg-rose-50/80 border-rose-200 text-rose-800' }
  ];

  // Services options combined with active catalog
  const catalogServiceTitles = services.map(s => s.title);
  const defaultServicesList = [
    'Starter Landing Page',
    'Business Website',
    'Professional Website',
    'Monthly Maintenance',
    'E-commerce Website',
    'Small Technical Task'
  ];
  const combinedServices = Array.from(new Set([...catalogServiceTitles, ...defaultServicesList]));

  const handleAddLead = (e) => {
    e.preventDefault();
    if (!newLead.clientName.trim() || !newLead.businessName.trim()) return;

    const selectedService = newLead.service === 'CUSTOM' ? newLead.customService.trim() : newLead.service;

    const created = {
      ...newLead,
      service: selectedService || 'Business Website',
      id: Date.now(),
      quotedPrice: Number(newLead.quotedPrice) || 0,
      advance: Number(newLead.advance) || 0
    };

    setLeads([created, ...leads]);
    setNewLead({
      date: new Date().toISOString().split('T')[0],
      clientName: '',
      businessName: '',
      contact: '',
      service: 'Business Website',
      customService: '',
      quotedPrice: '',
      advance: '',
      status: 'New',
      nextFollowUp: '',
      notes: ''
    });
    setShowAddModal(false);
  };

  // Status changes strictly update status without creating Income
  const handleStatusChange = (leadId, newStatus) => {
    setLeads(leads.map(l => String(l.id) === String(leadId) ? { ...l, status: newStatus } : l));
  };

  // Open Record Payment Modal with stable UUID
  const handleOpenPaymentModal = (lead) => {
    const existingPaymentsForClient = crmPayments.filter(p => String(p.crmClientId) === String(lead.id));
    const currentReceived = existingPaymentsForClient.reduce((sum, p) => sum + (Number(p.amount) || 0), Number(lead.advance) || 0);
    const dueAmount = Math.max(0, (Number(lead.quotedPrice) || 0) - currentReceived);

    // Generate unique UUID for this payment transaction session
    const uniquePaymentId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    setPaymentModalLead(lead);
    setPaymentForm({
      paymentId: uniquePaymentId,
      paymentDate: new Date().toISOString().split('T')[0],
      amount: dueAmount > 0 ? dueAmount : '',
      paymentMethod: 'bKash',
      notes: ''
    });
    setPaymentError(null);
  };

  const handleRecordPaymentSubmit = async (paymentData) => {
    if (!paymentModalLead) return;

    const amountNum = Number(paymentData.amount);
    if (!amountNum || amountNum <= 0) {
      setPaymentError('পেমেন্টের পরিমাণ শূন্যের চেয়ে বেশি হতে হবে।');
      return;
    }

    const lead = paymentModalLead;
    const existingPayments = crmPayments.filter(p => String(p.crmClientId) === String(lead.id));
    const currentReceived = existingPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), Number(lead.advance) || 0);
    const quotedPrice = Number(lead.quotedPrice) || 0;

    if (quotedPrice > 0 && (currentReceived + amountNum) > (quotedPrice + 0.01)) {
      setPaymentError(`পেমেন্টের পরিমাণ অতিরিক্ত! এই ডিলের সর্বোচ্চ বাজেট ৳${quotedPrice.toLocaleString()} (ইতিমধ্যে প্রাপ্ত: ৳${currentReceived.toLocaleString()})`);
      return;
    }

    setIsSubmittingPayment(true);
    setPaymentError(null);

    try {
      const res = await onRecordPayment({
        paymentId: paymentData.paymentId,
        crmClientId: lead.id,
        paymentDate: paymentData.paymentDate,
        amount: amountNum,
        paymentMethod: paymentData.paymentMethod,
        notes: paymentData.notes
      });

      if (res && res.success !== false) {
        setPaymentModalLead(null);
      } else {
        setPaymentError(res?.message || 'পেমেন্ট যুক্ত করতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      setPaymentError(err.message || 'নেটওয়ার্ক এরর। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleDeleteLead = (leadId) => {
    setLeads(leads.filter(l => String(l.id) !== String(leadId)));
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('text/plain', String(leadId));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedLeadId(leadId);
  };

  const handleDragEnd = () => {
    setDraggedLeadId(null);
    setDragOverStatus(null);
  };

  const handleDragOver = (e, statusValue) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStatus !== statusValue) {
      setDragOverStatus(statusValue);
    }
  };

  const handleDragLeave = (e, statusValue) => {
    if (dragOverStatus === statusValue) {
      setDragOverStatus(null);
    }
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    setDragOverStatus(null);
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    setDraggedLeadId(null);
    if (!leadId) return;

    handleStatusChange(leadId, targetStatus);
  };

  // Filter & Search Logic
  const filteredLeads = leads.filter(lead => {
    const query = searchQuery.toLowerCase();
    const matchSearch = 
      lead.clientName.toLowerCase().includes(query) ||
      lead.businessName.toLowerCase().includes(query) ||
      lead.service.toLowerCase().includes(query) ||
      (lead.contact && lead.contact.toLowerCase().includes(query));
    
    const matchStatus = filterStatus === 'All' || lead.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Calculate Dynamic Pipeline Metrics
  const totalLeadsCount = leads.length;
  const activeLeadsCount = leads.filter(l => l.status !== 'Lost' && l.status !== 'Paid').length;
  const wonClientsCount = leads.filter(l => l.status === 'Paid' || l.status === 'Working' || l.status === 'Advance Paid' || l.status === 'Delivered').length;
  const lostClientsCount = leads.filter(l => l.status === 'Lost').length;
  const totalPipelineValue = leads.filter(l => l.status !== 'Lost').reduce((acc, curr) => acc + (Number(curr.quotedPrice) || 0), 0);
  const totalAdvanceCollected = leads.reduce((acc, curr) => acc + (Number(curr.advance) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header with View Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            👥 ক্লায়েন্ট CRM ও সেলস পাইপলাইন
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            সম্ভাব্য ক্লায়েন্ট ম্যানেজ করুন, ডিল ট্র্যাকিং ও অ্যাডভান্স পেমেন্ট হিসাব রাখুন
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Table / Kanban View Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>টেবিল ভিউ</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-emerald-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>কানবান বোর্ড</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(!showAddModal)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">নতুন ক্লায়েন্ট / লিড</span>
            <span className="sm:hidden">নতুন</span>
          </button>
        </div>
      </div>

      {/* CRM Pipeline Summary Header */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>মোট লিড</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalLeadsCount} জন</div>
          <div className="text-[11px] text-slate-400 mt-0.5">সব ক্যাটাগরি</div>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
            <span>সক্রিয় ডিল</span>
          </div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{activeLeadsCount} জন</div>
          <div className="text-[11px] text-slate-400 mt-0.5">কথা ও কাজ চলছে</div>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>অর্জিত / Won</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{wonClientsCount} জন</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">কনফার্মড ক্লায়েন্ট</div>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>হাতছাড়া / Lost</span>
          </div>
          <div className="text-2xl font-bold text-rose-500 mt-1">{lostClientsCount} জন</div>
          <div className="text-[11px] text-rose-500 font-medium mt-0.5">বাতিলকৃত প্রজেক্ট</div>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
            <span>পাইপলাইন ভ্যালু</span>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-1">৳{totalPipelineValue.toLocaleString()}</div>
          <div className="text-[11px] text-teal-600 font-medium mt-0.5">অগ্রিম: ৳{totalAdvanceCollected.toLocaleString()}</div>
        </div>
      </div>

      {/* Add Lead Modal Form */}
      {showAddModal && (
        <form onSubmit={handleAddLead} className="bg-white border border-emerald-200 rounded-2xl p-5 md:p-6 shadow-md space-y-4">
          <h3 className="text-base font-bold text-slate-800 border-b pb-3">নতুন লিড / ক্লায়েন্ট এন্ট্রি করুন</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ক্লায়েন্টের নাম (Client Name) *</label>
              <input
                type="text"
                required
                placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                value={newLead.clientName}
                onChange={(e) => setNewLead({ ...newLead, clientName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">প্রতিষ্ঠানের নাম (Business Name) *</label>
              <input
                type="text"
                required
                placeholder="যেমন: স্কলারস একাটডেমি বা ডেন্টাল কেয়ার"
                value={newLead.businessName}
                onChange={(e) => setNewLead({ ...newLead, businessName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">যোগাযোগ (Contact Number/Email)</label>
              <input
                type="text"
                placeholder="যেমন: 01711XXXXXX"
                value={newLead.contact}
                onChange={(e) => setNewLead({ ...newLead, contact: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">সার্ভিস (Service Catalog)</label>
              <select
                value={newLead.service}
                onChange={(e) => setNewLead({ ...newLead, service: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {combinedServices.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="CUSTOM">+ কাস্টম সার্ভিস লিখুন...</option>
              </select>
            </div>

            {newLead.service === 'CUSTOM' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">কাস্টম সার্ভিসের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: Custom Web Application"
                  value={newLead.customService}
                  onChange={(e) => setNewLead({ ...newLead, customService: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">সম্ভাব্য/নির্ধারিত বাজেট (Quoted Price ৳)</label>
              <input
                type="number"
                placeholder="যেমন: 15000"
                value={newLead.quotedPrice}
                onChange={(e) => setNewLead({ ...newLead, quotedPrice: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">প্রাথমিক অগ্রিম / অ্যাডভান্স (Advance ৳)</label>
              <input
                type="number"
                placeholder="যেমন: 5000"
                value={newLead.advance}
                onChange={(e) => setNewLead({ ...newLead, advance: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">বর্তমান স্ট্যাটাস (Status)</label>
              <select
                value={newLead.status}
                onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">পরবর্তী ফলো-আপ (Next Follow-up)</label>
              <input
                type="date"
                value={newLead.nextFollowUp}
                onChange={(e) => setNewLead({ ...newLead, nextFollowUp: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">এন্টির তারিখ (Date)</label>
              <input
                type="date"
                value={newLead.date}
                onChange={(e) => setNewLead({ ...newLead, date: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">নোটস (Notes)</label>
              <input
                type="text"
                placeholder="ক্লায়েন্টের বিশেষ কোনো চাহিদার কথা লিখে রাখতে পারেন"
                value={newLead.notes}
                onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="ক্লায়েন্টের নাম, প্রতিষ্ঠানের নাম বা সার্ভিস দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">সব স্ট্যাটাস</option>
            {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {(searchQuery || filterStatus !== 'All') && (
            <button
              onClick={() => { setSearchQuery(''); setFilterStatus('All'); }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
            >
              রিসেট
            </button>
          )}
        </div>
      </div>

      {/* CRM Main Content Area: Table View OR Kanban View */}
      {viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="space-y-3">
          {filteredLeads.length > 0 ? (
            filteredLeads.map((lead) => {
              const statusObj = statuses.find(s => s.value === lead.status) || statuses[0];
              const leadPayments = crmPayments.filter(p => String(p.crmClientId) === String(lead.id));
              const totalReceived = leadPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), Number(lead.advance) || 0);
              const remainingDue = Math.max(0, (Number(lead.quotedPrice) || 0) - totalReceived);

              return (
                <div 
                  key={lead.id} 
                  className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{lead.businessName}</h3>
                        <span className="text-xs text-slate-500 font-medium">({lead.clientName})</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1 font-semibold text-emerald-700">
                          <Briefcase className="w-3.5 h-3.5" /> {lead.service}
                        </span>
                        {lead.contact && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" /> {lead.contact}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" /> এন্ট্রি: {lead.date}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
                      <button
                        onClick={() => setSelectedCustomerProfile(lead)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
                        title="কাস্টমার প্রোফাইল ও পাওনা দেখুন"
                      >
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>প্রোফাইল</span>
                      </button>

                      <button
                        onClick={() => handleOpenPaymentModal(lead)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>পেমেন্ট নিন</span>
                      </button>

                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${statusObj.badgeColor} focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[180px] sm:max-w-none text-ellipsis`}
                      >
                        {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>

                      <button
                        onClick={() => setDeleteConfirmId(lead.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-auto sm:ml-0"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Pricing & Follow-up Details */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-slate-400 font-medium">বাজেট: </span>
                        <span className="font-bold text-slate-800">৳{(Number(lead.quotedPrice) || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">মোট প্রাপ্তি: </span>
                        <span className="font-bold text-emerald-600">৳{totalReceived.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">অবশিষ্ট বাকি: </span>
                        <span className="font-bold text-amber-600">
                          ৳{remainingDue.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {lead.nextFollowUp && (
                      <div className="flex items-center gap-1.5 text-slate-600 font-semibold bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>ফলো-আপ: {lead.nextFollowUp}</span>
                      </div>
                    )}
                  </div>

                  {lead.notes && (
                    <div className="text-xs text-slate-500 italic pl-1">
                      নোটস: {lead.notes}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <EmptyState
              icon={Users}
              title={searchQuery || filterStatus !== 'All' ? 'কোনো মেলানো ক্লায়েন্ট বা লিড পাওয়া যায়নি' : 'কোনো ক্লায়েন্ট বা লিড নেই'}
              description={searchQuery || filterStatus !== 'All' ? 'আপনার সার্চ বা স্ট্যাটাস ফিল্টারের সাথে মিলিয়ে কোনো ক্লায়েন্ট পাওয়া যায়নি।' : 'আপনার পাইপলাইনে সম্ভাবনাময় ক্লায়েন্টদের ট্র্যাকিং শুরু করতে নতুন লিড যুক্ত করুন।'}
              actionLabel={searchQuery || filterStatus !== 'All' ? 'ফিল্টার রিসেট করুন' : 'নতুন ক্লায়েন্ট / লিড'}
              actionIcon={searchQuery || filterStatus !== 'All' ? undefined : Plus}
              onAction={searchQuery || filterStatus !== 'All' ? () => { setSearchQuery(''); setFilterStatus('All'); } : () => setShowAddModal(true)}
            />
          )}
        </div>
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="flex gap-4 min-w-[1200px]">
            {statuses.map(col => {
              const colLeads = filteredLeads.filter(l => l.status === col.value);
              const colTotalValue = colLeads.reduce((sum, l) => sum + (Number(l.quotedPrice) || 0), 0);
              const isTargetDrag = dragOverStatus === col.value;

              return (
                <div
                  key={col.value}
                  onDragOver={(e) => handleDragOver(e, col.value)}
                  onDragLeave={(e) => handleDragLeave(e, col.value)}
                  onDrop={(e) => handleDrop(e, col.value)}
                  className={`flex-1 min-w-[280px] max-w-[320px] rounded-2xl border transition-all duration-200 flex flex-col ${
                    isTargetDrag 
                      ? 'bg-emerald-50/60 border-emerald-400 ring-2 ring-emerald-300 ring-opacity-50' 
                      : 'bg-slate-50/80 border-slate-200'
                  }`}
                >
                  {/* Column Header */}
                  <div className={`p-3 rounded-t-2xl border-b ${col.colHeaderBg} flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{col.value}</span>
                      <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-white/80 border border-slate-200">
                        {colLeads.length}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold opacity-80">
                      ৳{colTotalValue.toLocaleString()}
                    </div>
                  </div>

                  {/* Cards Container */}
                  <div className="p-2.5 flex-1 space-y-2.5 min-h-[300px] overflow-y-auto max-h-[70vh]">
                    {colLeads.length > 0 ? (
                      colLeads.map(lead => {
                        const isBeingDragged = String(draggedLeadId) === String(lead.id);
                        const leadPayments = crmPayments.filter(p => String(p.crmClientId) === String(lead.id));
                        const totalReceived = leadPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), Number(lead.advance) || 0);

                        return (
                          <div
                            key={lead.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, lead.id)}
                            onDragEnd={handleDragEnd}
                            className={`bg-white border border-slate-200 rounded-xl p-3 shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing hover:border-emerald-300 group space-y-2 ${
                              isBeingDragged ? 'opacity-40 border-dashed border-emerald-400' : ''
                            }`}
                          >
                            {/* Card Top Header */}
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-slate-900 text-xs truncate" title={lead.businessName}>
                                  {lead.businessName}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate" title={lead.clientName}>
                                  {lead.clientName}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenPaymentModal(lead)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                  title="পেমেন্ট গ্রহণ করুন"
                                >
                                  <DollarSign className="w-3.5 h-3.5" />
                                </button>
                                <GripVertical className="w-3.5 h-3.5 text-slate-300" />
                                <button
                                  onClick={() => handleDeleteLead(lead.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Service Badge */}
                            <div className="text-[11px] text-emerald-800 font-semibold bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-100 truncate">
                              {lead.service}
                            </div>

                            {/* Pricing Details */}
                            <div className="grid grid-cols-2 gap-1 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <div>
                                <span className="text-slate-400">বাজেট: </span>
                                <span className="font-bold text-slate-800">৳{(lead.quotedPrice || 0).toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">প্রাপ্তি: </span>
                                <span className="font-bold text-emerald-600">৳{totalReceived.toLocaleString()}</span>
                              </div>
                            </div>

                            {/* Followup & Date */}
                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                              {lead.nextFollowUp ? (
                                <span className="flex items-center gap-1 font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                  <Clock className="w-3 h-3" /> {lead.nextFollowUp}
                                </span>
                              ) : (
                                <span>এন্ট্রি: {lead.date}</span>
                              )}

                              {/* Quick status dropdown on card */}
                              <select
                                value={lead.status}
                                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                className="text-[10px] font-semibold bg-transparent border-0 text-slate-500 focus:outline-none cursor-pointer hover:text-slate-900"
                              >
                                {statuses.map(s => <option key={s.value} value={s.value}>{s.value}</option>)}
                              </select>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full min-h-[140px] flex items-center justify-center border-2 border-dashed border-slate-200/80 rounded-xl p-4 text-center">
                        <p className="text-[11px] text-slate-400 font-medium">
                          {isTargetDrag ? 'এখানে ড্রপ করুন' : 'কোনো কার্ড নেই'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <UniversalPaymentModal
        isOpen={Boolean(paymentModalLead)}
        onClose={() => setPaymentModalLead(null)}
        onSubmit={handleRecordPaymentSubmit}
        title="CRM ডিল পেমেন্ট গ্রহণ করুন"
        description="পেমেন্ট রেকর্ড করলে তা সরাসরি ইনকাম ট্র্যাকার-এ যুক্ত হবে"
        isSubmitting={isSubmittingPayment}
        submitLabel="পেমেন্ট ও ইনকাম নিশ্চিত করুন"
        paymentId={paymentForm.paymentId}
        error={paymentError}
        headerContent={
          paymentModalLead ? (
            <>
              <div className="flex justify-between text-xs text-slate-600">
                <span>ক্লায়েন্ট: <strong>{paymentModalLead.clientName}</strong></span>
                <span>প্রতিষ্ঠান: <strong>{paymentModalLead.businessName}</strong></span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 text-center border-t border-slate-200 text-xs">
                <div>
                  <div className="text-slate-400">বাজেট</div>
                  <div className="font-bold text-slate-800">৳{(Number(paymentModalLead.quotedPrice) || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-400">মোট প্রাপ্তি</div>
                  <div className="font-bold text-emerald-600">
                    ৳{(crmPayments.filter(p => String(p.crmClientId) === String(paymentModalLead.id)).reduce((sum, p) => sum + Number(p.amount), Number(paymentModalLead.advance) || 0)).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">অবশিষ্ট বাকি</div>
                  <div className="font-bold text-amber-600">
                    ৳{Math.max(0, (Number(paymentModalLead.quotedPrice) || 0) - (crmPayments.filter(p => String(p.crmClientId) === String(paymentModalLead.id)).reduce((sum, p) => sum + Number(p.amount), Number(paymentModalLead.advance) || 0))).toLocaleString()}
                  </div>
                </div>
              </div>
            </>
          ) : null
        }
      />

      {/* CUSTOMER FINANCIAL PROFILE & DUES SUMMARY MODAL */}
      {selectedCustomerProfile && (
        <Modal
          isOpen={Boolean(selectedCustomerProfile)}
          onClose={() => setSelectedCustomerProfile(null)}
          title="👤 কাস্টমার ফাইন্যান্সিয়াল প্রোফাইল ও পাওনা"
        >
          {(() => {
            const client = selectedCustomerProfile;
            const clientDues = customerDues.filter(d => 
              String(d.customerId) === String(client.id) || 
              d.customerName?.toLowerCase().includes(client.clientName.toLowerCase()) ||
              d.customerName?.toLowerCase().includes(client.businessName.toLowerCase())
            );
            
            const totalDuesBusiness = clientDues.reduce((sum, d) => sum + (Number(d.totalAmount) || 0), 0);
            const totalDuesPaid = clientDues.reduce((sum, d) => sum + (Number(d.paidAmount) || 0), 0);
            
            const clientCrmPayments = crmPayments.filter(p => String(p.crmClientId) === String(client.id));
            const crmPaid = clientCrmPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), Number(client.advance) || 0);

            const totalBusiness = totalDuesBusiness > 0 ? totalDuesBusiness : (Number(client.quotedPrice) || 0);
            const totalPaid = totalDuesBusiness > 0 ? totalDuesPaid : crmPaid;
            const totalDue = Math.max(0, totalBusiness - totalPaid);

            return (
              <div className="space-y-4 pt-1">
                {/* Financial Summary Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3 shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-base text-white">{client.businessName}</h3>
                      <p className="text-xs text-slate-300 font-medium">
                        {client.clientName} {client.contact && `• ${client.contact}`}
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-1 rounded-full">
                      {client.service}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/80 text-center">
                    <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                      <div className="text-[10px] text-slate-300 font-medium">Total Business</div>
                      <div className="text-xs font-bold text-white">৳{totalBusiness.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                      <div className="text-[10px] text-slate-300 font-medium">Paid (পরিশোধিত)</div>
                      <div className="text-xs font-bold text-emerald-400">৳{totalPaid.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                      <div className="text-[10px] text-slate-300 font-medium">Due (বাকি পাওনা)</div>
                      <div className="text-xs font-extrabold text-rose-400">৳{totalDue.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Transactions History */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>পাওনা ও কাজ সমূহের তালিকা ({clientDues.length})</span>
                    {onNavigateToDues && (
                      <button
                        onClick={() => {
                          setSelectedCustomerProfile(null);
                          onNavigateToDues();
                        }}
                        className="text-[11px] text-emerald-600 font-bold hover:underline"
                      >
                        পাওনা পেজে যান →
                      </button>
                    )}
                  </h4>

                  {clientDues.length === 0 ? (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 text-center">
                      এই কাস্টমারের কোনো আলাদা পাওনা এন্ট্রি নেই (কোটেড প্রাইস: ৳{(Number(client.quotedPrice) || 0).toLocaleString()})।
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {clientDues.map(d => {
                        const dDue = Math.max(0, (Number(d.totalAmount) || 0) - (Number(d.paidAmount) || 0));
                        return (
                          <div key={d.id} className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs flex justify-between items-center">
                            <div>
                              <div className="font-bold text-slate-900">{d.description}</div>
                              <div className="text-[10px] text-slate-400">মেয়াদ: {d.dueDate || 'N/A'}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-slate-900">৳{Number(d.totalAmount).toLocaleString()}</div>
                              <div className="text-[10px] text-rose-600 font-bold">বাকি: ৳{dDue.toLocaleString()}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Follow-up Notes */}
                {client.notes && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700">ফলো-আপ নোটস: </span>
                    <span className="text-slate-600">{client.notes}</span>
                  </div>
                )}

                <div className="pt-3 flex justify-between items-center border-t border-slate-100">
                  <button
                    onClick={() => {
                      const leadToPay = client;
                      setSelectedCustomerProfile(null);
                      handleOpenPaymentModal(leadToPay);
                    }}
                    className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>+ পেমেন্ট জমা নিন</span>
                  </button>
                  <button
                    onClick={() => setSelectedCustomerProfile(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            handleDeleteLead(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        title="লিডটি মুছে ফেলতে চান?"
        description="এই ক্লায়েন্ট রেকর্ডটি আপনার CRM পাইপলাইন থেকে স্থায়ীভাবে মুছে যাবে।"
      />
    </div>
  );
}
