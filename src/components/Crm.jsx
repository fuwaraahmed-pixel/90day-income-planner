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
  Clock
} from 'lucide-react';

export default function Crm({ leads, setLeads }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // New Lead Form State
  const [newLead, setNewLead] = useState({
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    businessName: '',
    contact: '',
    service: 'Business Website',
    quotedPrice: '',
    advance: '',
    status: 'New',
    nextFollowUp: '',
    notes: ''
  });

  const statuses = [
    { value: 'New', label: 'New (নতুন লিড)', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    { value: 'Contacted', label: 'Contacted (যোগাযোগ হয়েছে)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'Interested', label: 'Interested (আগ্রহী)', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { value: 'Negotiation', label: 'Negotiation (দরদাম চলছে)', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { value: 'Advance Paid', label: 'Advance Paid (অ্যাডভান্স প্রাপ্ত)', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    { value: 'Working', label: 'Working (কাজ চলছে)', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { value: 'Delivered', label: 'Delivered (ডেলিভারি সম্পন্ন)', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    { value: 'Paid', label: 'Paid (সম্পূর্ণ পেমেন্ট)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { value: 'Lost', label: 'Lost (হাতছাড়া হয়েছে)', color: 'bg-rose-50 text-rose-700 border-rose-200' }
  ];

  const servicesList = [
    'Starter Landing Page (৳৫,০০০)',
    'Business Website (৳১০,০০০)',
    'Professional Website (৳২০,০০০+)',
    'Monthly Maintenance (৳১,০০০–৳৩,০০০/মাস)',
    'E-commerce Website (৳২০,০০০+)',
    'Small Technical Task'
  ];

  const handleAddLead = (e) => {
    e.preventDefault();
    if (!newLead.clientName.trim() || !newLead.businessName.trim()) return;

    const created = {
      ...newLead,
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
      quotedPrice: '',
      advance: '',
      status: 'New',
      nextFollowUp: '',
      notes: ''
    });
    setShowAddModal(false);
  };

  const handleStatusChange = (leadId, newStatus) => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
  };

  const handleDeleteLead = (leadId) => {
    setLeads(leads.filter(l => l.id !== leadId));
  };

  // Filter & Search Logic
  const filteredLeads = leads.filter(lead => {
    const query = searchQuery.toLowerCase();
    const matchSearch = 
      lead.clientName.toLowerCase().includes(query) ||
      lead.businessName.toLowerCase().includes(query) ||
      lead.service.toLowerCase().includes(query) ||
      lead.contact.toLowerCase().includes(query);
    
    const matchStatus = filterStatus === 'All' || lead.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Calculate Pipeline Metrics
  const activeLeadsCount = leads.filter(l => l.status !== 'Lost' && l.status !== 'Paid').length;
  const wonClientsCount = leads.filter(l => l.status === 'Paid' || l.status === 'Working' || l.status === 'Advance Paid').length;
  const totalPipelineValue = leads.filter(l => l.status !== 'Lost').reduce((acc, curr) => acc + (Number(curr.quotedPrice) || 0), 0);
  const totalAdvanceCollected = leads.reduce((acc, curr) => acc + (Number(curr.advance) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            👥 ক্লায়েন্ট CRM ও সেলস পাইপলাইন
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            সম্ভাব্য ক্লায়েন্ট ম্যানেজ করুন, ডিল ট্র্যাকিং ও অ্যাডভান্স পেমেন্ট হিসাব রাখুন
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন ক্লায়েন্ট / লিড যোগ করুন</span>
        </button>
      </div>

      {/* CRM Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">সক্রিয় ক্লায়েন্ট / ডিল</div>
          <div className="text-2xl font-bold text-blue-600 mt-0.5">{activeLeadsCount} জন</div>
          <div className="text-[11px] text-slate-400 mt-1">কথা ও কাজ চলছে</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">সম্পন্ন / অর্জিত ক্লায়েন্ট</div>
          <div className="text-2xl font-bold text-emerald-600 mt-0.5">{wonClientsCount} জন</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">কনফার্মড ক্লায়েন্ট</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">পাইপলাইনের মোট ভ্যালু</div>
          <div className="text-2xl font-bold text-slate-800 mt-0.5">৳{totalPipelineValue.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">সম্ভাব্য মোট প্রজেক্ট মূল্য</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">সংগৃহীত অগ্রিম (Advance)</div>
          <div className="text-2xl font-bold text-teal-600 mt-0.5">৳{totalAdvanceCollected.toLocaleString()}</div>
          <div className="text-[11px] text-teal-600 font-medium mt-1">ক্যাশ প্রাপ্তি</div>
        </div>
      </div>

      {/* Add Lead Modal Form */}
      {showAddModal && (
        <form onSubmit={handleAddLead} className="bg-white border border-emerald-200 rounded-2xl p-5 md:p-6 shadow-md space-y-4">
          <h3 className="text-base font-bold text-slate-800 border-b pb-3">নতুন লিড / ক্লায়েন্ট এন্টি করুন</h3>

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
              <label className="block text-xs font-semibold text-slate-700 mb-1">সার্ভিস (Service)</label>
              <select
                value={newLead.service}
                onChange={(e) => setNewLead({ ...newLead, service: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {servicesList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

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
              <label className="block text-xs font-semibold text-slate-700 mb-1">প্রাপ্ত অগ্রিম / অ্যাডভান্স (Advance ৳)</label>
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
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
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
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none"
          >
            <option value="All">সব স্ট্যাটাস</option>
            {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* CRM Pipeline Cards / Grid */}
      <div className="space-y-3">
        {filteredLeads.length > 0 ? (
          filteredLeads.map((lead) => {
            const statusObj = statuses.find(s => s.value === lead.status) || statuses[0];
            return (
              <div 
                key={lead.id} 
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition-all space-y-3"
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

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${statusObj.color} focus:outline-none`}
                    >
                      {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>

                    <button
                      onClick={() => handleDeleteLead(lead.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
                      <span className="font-bold text-slate-800">৳{(lead.quotedPrice || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">অ্যাডভান্স পেমেন্ট: </span>
                      <span className="font-bold text-emerald-600">৳{(lead.advance || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">বাকি টাকা: </span>
                      <span className="font-bold text-amber-600">
                        ৳{Math.max(0, (lead.quotedPrice || 0) - (lead.advance || 0)).toLocaleString()}
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
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
            কোনো ক্লায়েন্ট বা লিড পাওয়া যায়নি! নতুন লিড যোগ করতে "নতুন ক্লায়েন্ট / লিড যোগ করুন" বাটনে ক্লিক করুন।
          </div>
        )}
      </div>
    </div>
  );
}
