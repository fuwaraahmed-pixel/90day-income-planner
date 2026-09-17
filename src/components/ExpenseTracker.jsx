import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Trash2, 
  DollarSign, 
  AlertCircle,
  CreditCard,
  PieChart,
  Edit2
} from 'lucide-react';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Input from './ui/Input';
import Modal from './ui/Modal';

export default function ExpenseTracker({ expenses, setExpenses, totalIncome }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const categories = [
    'Installment (মাসিক কিস্তি ৳৮০,০০০)',
    'Household (সংসার খরচ)',
    'Business (ব্যবসা খরচ / ডোমেন-হোস্টিং)',
    'Transport (যাতায়াত)',
    'Food (খাবার)',
    'Education (শিক্ষা)',
    'Tools (সফটওয়্যার/টুলস)',
    'Other (অন্যান্য)'
  ];

  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Household (সংসার খরচ)',
    description: '',
    amount: '',
    month: 'Month 1',
    notes: ''
  });

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.description.trim() || !newExpense.amount) return;

    const created = {
      ...newExpense,
      id: Date.now(),
      amount: Number(newExpense.amount) || 0
    };

    setExpenses([created, ...expenses]);
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      category: 'Household (সংসার খরচ)',
      description: '',
      amount: '',
      month: 'Month 1',
      notes: ''
    });
    setShowAddForm(false);
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // Calculations
  const totalExpense = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const installmentPaid = expenses.filter(e => e.category.includes('Installment')).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const householdExpense = expenses.filter(e => e.category.includes('Household')).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const netCashRemaining = totalIncome - totalExpense;

  // Filter & Search
  const filteredExpenses = expenses.filter(exp => {
    const q = searchQuery.toLowerCase();
    const matchQ = exp.description.toLowerCase().includes(q) || exp.notes.toLowerCase().includes(q);
    const matchC = filterCategory === 'All' || exp.category === filterCategory;
    return matchQ && matchC;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            🧾 খরচের ট্র্যাকার (Expense Tracker)
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            সংসার খরচ, কিস্তি ও ব্যবসার যাবতীয় খরচের নির্ভুল ট্র্যাকার
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন খরচ এন্ট্রি করুন</span>
        </button>
      </div>

      {/* 4 Expense Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">সর্বমোট খরচ</div>
          <div className="text-2xl font-bold text-rose-600 mt-0.5">৳{totalExpense.toLocaleString()}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">মোট ব্যয়</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">মাসিক কিস্তি পরিশোধ</div>
          <div className="text-2xl font-bold text-amber-600 mt-0.5">৳{installmentPaid.toLocaleString()}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Installment</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">সংসার খরচ (Household)</div>
          <div className="text-2xl font-bold text-slate-800 mt-0.5">৳{householdExpense.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">পারিবারিক খরচ</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">খরচ বাদে অবশিষ্ট ক্যাশ</div>
          <div className={`text-2xl font-bold mt-0.5 ${netCashRemaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            ৳{netCashRemaining.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">নিট অবশিষ্ট জমানো টাকা</div>
        </div>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <form onSubmit={handleAddExpense} className="bg-white border border-rose-200 rounded-2xl p-5 md:p-6 shadow-md space-y-4">
          <h3 className="text-base font-bold text-slate-800 border-b pb-3">নতুন খরচ এন্ট্রি করুন</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ক্যাটাগরি (Category) *</label>
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">খরচের বিবরণ (Description) *</label>
              <input
                type="text"
                required
                placeholder="যেমন: ডোমেন কেনা বা চলতি কিস্তি প্রদান"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">টাকার পরিমাণ (Amount ৳) *</label>
              <input
                type="number"
                required
                placeholder="যেমন: 80000"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">মাস (Month)</label>
              <input
                type="text"
                placeholder="যেমন: Month 1"
                value={newExpense.month}
                onChange={(e) => setNewExpense({ ...newExpense, month: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">তারিখ (Date)</label>
              <input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">নোটস (Notes)</label>
              <input
                type="text"
                placeholder="অতিরিক্ত কোনো তথ্য"
                value={newExpense.notes}
                onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
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
              className="px-5 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors shadow-sm"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      )}

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="বিবরণ দিয়ে খরচ খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none"
          >
            <option value="All">সব ক্যাটাগরি</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Expense List */}
      <div className="space-y-3">
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map((exp) => (
            <div key={exp.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  ৳
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{exp.description}</h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      {exp.category}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {exp.date} ({exp.month})
                    </span>
                    {exp.notes && <span>• {exp.notes}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-right">
                  <div className="text-base font-extrabold text-rose-600">-৳{exp.amount.toLocaleString()}</div>
                  <div className="text-[11px] text-slate-400">ব্যয়িত টাকা</div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingExpense({ ...exp })}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="সম্পাদনা করুন (Edit)"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
            কোনো খরচ এন্ট্রি পাওয়া যায়নি!
          </div>
        )}
      </div>

      {/* Edit Expense Modal */}
      <Modal
        isOpen={Boolean(editingExpense)}
        onClose={() => setEditingExpense(null)}
        title="খরচ এন্ট্রি সংশোধন (Edit Expense)"
        icon={Edit2}
        maxWidth="lg"
      >
        {editingExpense && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!editingExpense.description.trim() || !editingExpense.amount || Number(editingExpense.amount) <= 0) return;

              const updated = {
                ...editingExpense,
                amount: Number(editingExpense.amount)
              };

              setExpenses(expenses.map(exp => exp.id === editingExpense.id ? updated : exp));
              setEditingExpense(null);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="তারিখ (Date)"
                type="date"
                value={editingExpense.date}
                onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                required
              />

              <Input
                label="ক্যাটাগরি (Category)"
                as="select"
                value={editingExpense.category}
                onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
                options={categories}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="খরচের বিবরণ (Description)"
                type="text"
                value={editingExpense.description}
                onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                placeholder="যেমন: ঘর ভাড়া / ডোমেন বিল"
                required
              />

              <Input
                label="টাকার পরিমাণ (Amount ৳)"
                type="number"
                value={editingExpense.amount}
                onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })}
                placeholder="২৫০০০"
                min="1"
                required
              />
            </div>

            <Input
              label="মাস (Month tag)"
              type="text"
              value={editingExpense.month}
              onChange={(e) => setEditingExpense({ ...editingExpense, month: e.target.value })}
              placeholder="Month 1"
            />

            <Input
              label="নোট / মন্তব্য (Optional Notes)"
              type="text"
              value={editingExpense.notes || ''}
              onChange={(e) => setEditingExpense({ ...editingExpense, notes: e.target.value })}
              placeholder="অতিরিক্ত তথ্য..."
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingExpense(null)}
              >
                বাতিল (Cancel)
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
              >
                আপডেট করুন (Save Changes)
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
