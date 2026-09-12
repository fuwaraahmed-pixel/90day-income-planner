import React, { useState } from 'react';
import { 
  Tag, 
  Plus, 
  Check, 
  Clock, 
  DollarSign, 
  Trash2, 
  Edit3, 
  Copy, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function Services({ services, setServices }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const [newService, setNewService] = useState({
    title: '',
    price: '',
    deliveryTime: '',
    includes: '',
    targetClient: '',
    notes: ''
  });

  const handleAddService = (e) => {
    e.preventDefault();
    if (!newService.title.trim() || !newService.price) return;

    const created = {
      ...newService,
      id: Date.now(),
      includes: newService.includes.split(',').map(item => item.trim()).filter(Boolean)
    };

    setServices([...services, created]);
    setNewService({
      title: '',
      price: '',
      deliveryTime: '',
      includes: '',
      targetClient: '',
      notes: ''
    });
    setShowAddForm(false);
  };

  const handleDeleteService = (id) => {
    setServices(services.filter(s => s.id !== id));
  };

  const handleCopyQuote = (service) => {
    const text = `📌 ${service.title}\n💰 মূল্য: ${service.price}\n⏱️ ডেলিভারি সময়: ${service.deliveryTime}\n✅ যা অন্তর্ভুক্ত:\n${service.includes.map(inc => ` • ${inc}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(service.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            🏷️ সার্ভিস ও প্রাইসিং প্যাকেজ (Services & Pricing)
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            আপনার অফারকৃত সার্ভিস রেটকার্ড ও ফিচার তালিকা
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন সার্ভিস প্যাকেজ যোগ করুন</span>
        </button>
      </div>

      {/* Add Service Form */}
      {showAddForm && (
        <form onSubmit={handleAddService} className="bg-white border border-emerald-200 rounded-2xl p-5 md:p-6 shadow-md space-y-4">
          <h3 className="text-base font-bold text-slate-800 border-b pb-3">নতুন কাস্টম সার্ভিস প্যাকেজ তৈরি করুন</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">সার্ভিসের নাম (Service Title) *</label>
              <input
                type="text"
                required
                placeholder="যেমন: Custom Business Website"
                value={newService.title}
                onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">প্রস্তাবিত বাজেট / মূল্য (Price) *</label>
              <input
                type="text"
                required
                placeholder="যেমন: ৳১০,০০০"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ডেলিভারির সময় (Delivery Time)</label>
              <input
                type="text"
                placeholder="যেমন: ৫-৭ দিন"
                value={newService.deliveryTime}
                onChange={(e) => setNewService({ ...newService, deliveryTime: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">কী কী অন্তর্ভুক্ত থাকবে? (What's Included - কমা দিয়ে লিখুন)</label>
              <input
                type="text"
                placeholder="যেমন: ৫টি পেজ, মোবাইল রেসপন্সিভ, কন্টাক্ট ফর্ম, লোগো সেটআপ"
                value={newService.includes}
                onChange={(e) => setNewService({ ...newService, includes: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">টার্গেট ক্লায়েন্ট / নোটস</label>
              <input
                type="text"
                placeholder="যেমন: স্কুল, কোচিং সেন্টার ও স্থানীয় ব্যবসায়ী"
                value={newService.notes}
                onChange={(e) => setNewService({ ...newService, notes: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
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

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((srv) => (
          <div key={srv.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{srv.title}</h3>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5" /> ডেলিভারি: {srv.deliveryTime}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-emerald-600">{srv.price}</div>
                  <span className="text-[10px] text-slate-400 font-medium">প্রস্তাবিত রেট</span>
                </div>
              </div>

              {/* Includes List */}
              <div className="space-y-2 mt-4">
                <div className="text-xs font-bold text-slate-700">প্যাকেজে অন্তর্ভুক্ত:</div>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {srv.includes.map((inc, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {srv.notes && (
                <div className="text-xs text-slate-500 italic mt-3 pt-3 border-t border-slate-100">
                  💡 টার্গেট: {srv.notes}
                </div>
              )}
            </div>

            {/* Card Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => handleCopyQuote(srv)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedId === srv.id ? 'কপি হয়েছে! ✓' : 'প্রস্তাবনা কপি করুন'}</span>
              </button>

              <button
                onClick={() => handleDeleteService(srv.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="মুছে ফেলুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
