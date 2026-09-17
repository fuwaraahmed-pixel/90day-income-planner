import React, { useState } from 'react';
import { 
  Plus, 
  Check, 
  Clock, 
  Trash2, 
  Copy, 
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Layers,
  X,
  Target,
  Globe,
  Building2,
  RefreshCw,
  ShoppingBag,
  LayoutGrid,
  Shield,
  Star
} from 'lucide-react';

export default function Services({ services, setServices }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

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
      includes: typeof newService.includes === 'string' 
        ? newService.includes.split(',').map(item => item.trim()).filter(Boolean)
        : newService.includes
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

  // Helper to determine service icon based on title
  const getServiceIcon = (title = '') => {
    const t = title.toLowerCase();
    if (t.includes('landing')) return Zap;
    if (t.includes('business')) return Globe;
    if (t.includes('professional') || t.includes('custom') || t.includes('enterprise')) return Building2;
    if (t.includes('maintenance') || t.includes('monthly') || t.includes('রিকারিং')) return RefreshCw;
    if (t.includes('commerce') || t.includes('shop') || t.includes('ই-কমার্স')) return ShoppingBag;
    return Shield;
  };

  // Color Palette Themes with soft header gradients and glowing icon badges
  const colorThemes = [
    {
      headerBg: 'bg-gradient-to-b from-emerald-100/60 via-teal-50/30 to-white',
      bgIcon: 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/35 ring-4 ring-emerald-500/10',
      checkColor: 'text-emerald-500',
      btnBg: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      headerBg: 'bg-gradient-to-b from-blue-100/60 via-indigo-50/30 to-white',
      bgIcon: 'bg-gradient-to-tr from-blue-600 to-indigo-400 text-white shadow-lg shadow-blue-500/35 ring-4 ring-blue-500/10',
      checkColor: 'text-blue-600',
      btnBg: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      headerBg: 'bg-gradient-to-b from-amber-100/60 via-orange-50/30 to-white',
      bgIcon: 'bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-lg shadow-amber-500/35 ring-4 ring-amber-500/10',
      checkColor: 'text-amber-500',
      btnBg: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      headerBg: 'bg-gradient-to-b from-sky-100/60 via-cyan-50/30 to-white',
      bgIcon: 'bg-gradient-to-tr from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-500/35 ring-4 ring-sky-500/10',
      checkColor: 'text-sky-500',
      btnBg: 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200'
    },
    {
      headerBg: 'bg-gradient-to-b from-purple-100/60 via-violet-50/30 to-white',
      bgIcon: 'bg-gradient-to-tr from-purple-600 to-violet-400 text-white shadow-lg shadow-purple-500/35 ring-4 ring-purple-500/10',
      checkColor: 'text-purple-600',
      btnBg: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  ];

  // Filter services if category selected
  const filteredServices = services.filter((srv) => {
    if (activeFilter === 'recurring') {
      return srv.price?.includes('মাস') || srv.title?.toLowerCase().includes('maintenance');
    }
    if (activeFilter === 'fixed') {
      return !srv.price?.includes('মাস') && !srv.title?.toLowerCase().includes('maintenance');
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>সার্ভিস রেটকার্ড ও প্রাইসিং</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          আপনার সার্ভিস প্যাকেজ বেছে নিন
        </h1>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          আপনার ক্লায়েন্টদের জন্য প্রস্তুতকৃত সার্ভিস প্যাকেজসমূহ। ১-ক্লিকে প্রফেশনাল প্রস্তাবনা কপি করে সরাসরি ক্লায়েন্টকে পাঠান।
        </p>

        {/* Action Button & Filter */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              সকল ({services.length})
            </button>
            <button
              onClick={() => setActiveFilter('fixed')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'fixed' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ফিক্সড প্রজেক্ট
            </button>
            <button
              onClick={() => setActiveFilter('recurring')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'recurring' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              মাসিক প্যাকেজ
            </button>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-5 py-2.5 font-bold rounded-2xl text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs"
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 text-emerald-400" />}
            <span>{showAddForm ? 'ফর্ম বন্ধ করুন' : 'নতুন প্যাকেজ যোগ করুন'}</span>
          </button>
        </div>
      </div>

      {/* Add Service Form */}
      {showAddForm && (
        <form onSubmit={handleAddService} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-md space-y-5 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              নতুন কাস্টম সার্ভিস প্যাকেজ তৈরি করুন
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">সার্ভিসের নাম (Title) *</label>
              <input
                type="text"
                required
                placeholder="যেমন: Custom Business Website"
                value={newService.title}
                onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">মূল্য (Price) *</label>
              <input
                type="text"
                required
                placeholder="যেমন: ৳১০,০০০"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">ডেলিভারি সময় (Time)</label>
              <input
                type="text"
                placeholder="যেমন: ৫-৭ দিন"
                value={newService.deliveryTime}
                onChange={(e) => setNewService({ ...newService, deliveryTime: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">ফিচারসমূহ (কমা দিয়ে লিখুন)</label>
              <input
                type="text"
                placeholder="যেমন: ৫টি পেজ, মোবাইল রেসপন্সিভ, কন্টাক্ট ফর্ম"
                value={newService.includes}
                onChange={(e) => setNewService({ ...newService, includes: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">নোটস / টার্গেট ক্লায়েন্ট</label>
              <input
                type="text"
                placeholder="যেমন: ছোট বিজনেস ও স্টার্টআপের জন্য উপযুক্ত"
                value={newService.notes}
                onChange={(e) => setNewService({ ...newService, notes: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-xs"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      )}

      {/* Services Grid (Stexo Reference Style - 3 Cards per Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {filteredServices.map((srv, idx) => {
          const theme = colorThemes[idx % colorThemes.length];
          const ServiceIcon = getServiceIcon(srv.title);

          return (
            <div 
              key={srv.id} 
              className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-center relative group"
            >
              {/* TOP HEADER SECTION WITH SOFT GRADIENT */}
              <div className={`p-6 pb-4 border-b border-slate-100 ${theme.headerBg}`}>
                {/* Floating Center Circle Icon (Glowing Gradient & Ring) */}
                <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-3.5 transition-all duration-300 group-hover:scale-110 ${theme.bgIcon}`}>
                  <ServiceIcon className="w-6 h-6 stroke-[2.5]" />
                </div>

                {/* Plan Name / Title */}
                <h3 className="text-sm sm:text-base font-black tracking-wider text-slate-800 uppercase mb-1">
                  {srv.title}
                </h3>

                {/* Price Display */}
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight my-1">
                  {srv.price}
                </div>

                {/* Delivery Time Badge */}
                {srv.deliveryTime && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-white/80 px-3 py-1 rounded-full border border-slate-200/60 shadow-2xs mt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 stroke-[2.5]" />
                    <span>{srv.deliveryTime}</span>
                  </div>
                )}
              </div>

              {/* CARD BODY (WHITE SURFACE) */}
              <div className="p-6 pt-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Features List */}
                  <ul className="space-y-3 text-left mb-6">
                    {srv.includes && srv.includes.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-slate-700 leading-snug">
                        <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 stroke-[3] ${theme.checkColor}`} />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Target Notes */}
                  {srv.notes && (
                    <div className="text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-left mb-4">
                      💡 <span className="text-slate-700">{srv.notes}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleCopyQuote(srv)}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all shadow-xs hover:shadow active:scale-[0.98] ${
                      copiedId === srv.id
                        ? 'bg-slate-900 text-white'
                        : theme.btnBg
                    }`}
                  >
                    {copiedId === srv.id ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> কপি হয়েছে! ✓
                      </span>
                    ) : (
                      <span>প্রস্তাবনা কপি করুন</span>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteService(srv.id)}
                    className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}




