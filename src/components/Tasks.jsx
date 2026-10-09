import React, { useState } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Filter, 
  Trash2, 
  Calendar,
  Target,
  Tag,
  CheckSquare
} from 'lucide-react';

import EmptyState from './ui/EmptyState';
import ConfirmModal from './ui/ConfirmModal';
import TruncatedText from './ui/TruncatedText';

export default function Tasks({ tasks, setTasks, planData, taskActions }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Extract Plan Weeks for Goal Linkage
  const planWeeks = planData?.months 
    ? planData.months.flatMap(m => (m.weeks || []).map(w => ({ id: w.id, title: `${w.week}: ${w.title}` })))
    : [
        { id: 'w1', title: 'Week 1: ৩টি ডেমো ওয়েবসাইট তৈরি' },
        { id: 'w2', title: 'Week 2: সার্ভিস প্যাকেজ ও আউটরিচ লিস্ট' },
        { id: 'w3', title: 'Week 3: প্রতিদিন ১০টি আউটরিচ/কোল্ড কল' },
        { id: 'w4', title: 'Week 4: ক্লায়েন্ট ডেলিভারি ও ইনভয়েস' }
      ];

  // Form State
  const [newTask, setNewTask] = useState({
    name: '',
    category: 'Sales',
    priority: 'High',
    date: new Date().toISOString().split('T')[0],
    targetMetric: '',
    planGoalId: '',
    status: 'NotStarted',
    notes: ''
  });

  const categories = ['Sales', 'Client Work', 'Learning', 'Portfolio', 'Admin', 'Follow-up'];
  const priorities = ['High', 'Medium', 'Low'];
  const statuses = [
    { value: 'NotStarted', label: 'শুরু হয়নি', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    { value: 'InProgress', label: 'চলছে', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'Done', label: 'সম্পন্ন', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { value: 'Blocked', label: 'আটকে আছে', color: 'bg-rose-50 text-rose-700 border-rose-200' }
  ];

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.name.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const payload = {
        name: newTask.name,
        category: newTask.category,
        priority: newTask.priority,
        date: newTask.date,
        targetMetric: newTask.targetMetric,
        status: newTask.status,
        notes: newTask.notes
      };

      const success = await taskActions.add(payload);
      
      if (success) {
        setNewTask({
          name: '',
          category: 'Sales',
          priority: 'High',
          date: new Date().toISOString().split('T')[0],
          targetMetric: '',
          status: 'NotStarted',
          notes: ''
        });
        setShowAddForm(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    taskActions.updateStatus(taskId, newStatus);
  };

  const handleDeleteTask = async (taskId) => {
    await taskActions.remove(taskId);
    setSelectedTaskIds(prev => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
  };

  const toggleTaskSelect = (taskId) => {
    setSelectedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedTaskIds.size === filteredTasks.length) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(filteredTasks.map(t => t.id)));
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedTaskIds);
    setShowBulkDeleteConfirm(false);
    setSelectedTaskIds(new Set());
    for (const id of ids) {
      await taskActions.remove(id);
    }
  };

  // Filtered Tasks
  const filteredTasks = tasks.filter(t => {
    const matchCat = filterCategory === 'All' || t.category === filterCategory;
    const matchPri = filterPriority === 'All' || t.priority === filterPriority;
    const matchStat = filterStatus === 'All' || t.status === filterStatus;
    return matchCat && matchPri && matchStat;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner (Executive Dark Slate with Emerald Glow) */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold mb-1 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            দৈনিক টাস্ক ম্যানেজমেন্ট
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            ☑️ আজকের ও দৈনিক কাজের ট্র্যাকার
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            প্রতিদিনের প্রায়োরিটি অনুযায়ী কাজ গুছিয়ে রাখুন ও সম্পন্ন করুন
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="relative z-10 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-emerald-950/40 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>নতুন কাজ যোগ করুন</span>
        </button>
      </div>

      {/* Add Task Form Collapsible */}
      {showAddForm && (
        <form onSubmit={handleAddTask} className="bg-white border border-emerald-200 rounded-2xl p-5 md:p-6 shadow-md space-y-4">
          <h3 className="text-base font-bold text-slate-800 border-b pb-3">নতুন কাজ এন্টি করুন</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">কাজের নাম (Task Name) *</label>
              <input
                type="text"
                required
                placeholder="যেমন: ৫টি নতুন স্কুলে ফন করা বা মিটিং সেট করা"
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ক্যাটাগরি (Category)</label>
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">প্রায়োরিটি (Priority)</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">তারিখ (Date)</label>
              <input
                type="date"
                value={newTask.date}
                onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">টার্গেট/মেট্রিক (Target/Metric)</label>
              <input
                type="text"
                placeholder="যেমন: ১০টি আউটরিচ, ৩টি পেজ"
                value={newTask.targetMetric}
                onChange={(e) => setNewTask({ ...newTask, targetMetric: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">নোটস (Notes - ঐচ্ছিক)</label>
              <input
                type="text"
                placeholder="অতিরিক্ত কোনো বিষয় লিখে রাখতে পারেন"
                value={newTask.notes}
                onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      )}

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filteredTasks.length > 0 && selectedTaskIds.size === filteredTasks.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-600">সব সিলেক্ট</span>
          </label>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">ফিল্টার:</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none"
          >
            <option value="All">সব ক্যাটাগরি</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">সব প্রায়োরিটি</option>
            {priorities.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          {/* Status Filter (Task Completion Status) */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-emerald-500 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          >
            <option value="All">সব স্ট্যাটাস</option>
            {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {(filterCategory !== 'All' || filterPriority !== 'All' || filterStatus !== 'All') && (
            <button
              onClick={() => { setFilterCategory('All'); setFilterPriority('All'); setFilterStatus('All'); }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
            >
              রিসেট
            </button>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className={`bg-white border rounded-2xl p-4 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                task.status === 'Done' ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Bulk Select Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedTaskIds.has(task.id)}
                  onChange={() => toggleTaskSelect(task.id)}
                  className="mt-1.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />

                {/* Status Toggle Circle */}
                <button
                  onClick={() => handleStatusChange(task.id, task.status === 'Done' ? 'NotStarted' : 'Done')}
                  disabled={task._pending}
                  className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                    task.status === 'Done' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 hover:border-emerald-500'
                  }`}
                >
                  {task.status === 'Done' && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-sm font-bold ${task.status === 'Done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {task.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      task.priority === 'High' ? 'bg-rose-100 text-rose-700' : task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {task.category}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5 w-full min-w-0">
                    {task.targetMetric && (
                      <span className="flex items-center gap-1 font-medium text-emerald-700 shrink-0">
                        <Target className="w-3.5 h-3.5" /> {task.targetMetric}
                      </span>
                    )}
                    <span className="flex items-center gap-1 shrink-0">
                      <Calendar className="w-3.5 h-3.5" /> {task.date}
                    </span>
                    {task.notes && (
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <span className="shrink-0">•</span>
                        <TruncatedText text={task.notes} className="flex-1" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Selector & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  disabled={task._pending}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {statuses.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>

                <button
                  onClick={() => setDeleteConfirmId(task.id)}
                  disabled={task._pending}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={CheckSquare}
            title={filterCategory !== 'All' || filterPriority !== 'All' ? 'কোনো মেলানো কাজ পাওয়া যায়নি' : 'আজকের কোনো কাজ যোগ করা হয়নি'}
            description={filterCategory !== 'All' || filterPriority !== 'All' ? 'আপনার নির্বাচিত ফিল্টারের সাথে মিলিয়ে কোনো কাজ খুঁজে পাওয়া যায়নি।' : 'আপনার ৯০ দিনের লক্ষ্য অর্জনে আজকের প্রধান কাজগুলো তালিকাভুক্ত করুন।'}
            actionLabel={filterCategory !== 'All' || filterPriority !== 'All' ? 'ফিল্টার রিসেট করুন' : 'নতুন কাজ যোগ করুন'}
            actionIcon={filterCategory !== 'All' || filterPriority !== 'All' ? undefined : Plus}
            onAction={filterCategory !== 'All' || filterPriority !== 'All' ? () => { setFilterCategory('All'); setFilterPriority('All'); } : () => setShowAddForm(true)}
          />
        )}
      </div>

      {/* Floating Sticky Bulk Actions Bar */}
      {selectedTaskIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="text-xs font-semibold">
            <span className="bg-emerald-500 text-slate-900 px-2 py-0.5 rounded-full font-bold mr-1.5">
              {selectedTaskIds.size}
            </span>
            টি কাজ নির্বাচিত
          </div>

          <div className="h-4 w-[1px] bg-slate-700" />

          <button
            onClick={() => setShowBulkDeleteConfirm(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>নির্বাচিত কাজগুলো মুছুন</span>
          </button>

          <button
            onClick={() => setSelectedTaskIds(new Set())}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 transition-colors"
          >
            বাতিল
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            const id = deleteConfirmId;
            setDeleteConfirmId(null);
            handleDeleteTask(id);
          }
        }}
        title="কাজটি মুছে ফেলতে চান?"
        description="এই কাজটি আপনার তালিকা থেকে স্থায়ীভাবে মুছে যাবে।"
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title={`${selectedTaskIds.size}টি কাজ একসাথে মুছে ফেলতে চান?`}
        description="নির্বাচিত সমস্ত কাজ স্থায়ীভাবে মুছে যাবে। আপনি কি নিশ্চিত?"
      />
    </div>
  );
}
