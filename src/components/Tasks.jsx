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

export default function Tasks({ tasks, setTasks }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');

  // Form State
  const [newTask, setNewTask] = useState({
    name: '',
    category: 'Sales',
    priority: 'High',
    date: new Date().toISOString().split('T')[0],
    targetMetric: '',
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

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.name.trim()) return;

    const created = {
      ...newTask,
      id: Date.now()
    };

    setTasks([created, ...tasks]);
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
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  // Filtered Tasks
  const filteredTasks = tasks.filter(t => {
    const matchCat = filterCategory === 'All' || t.category === filterCategory;
    const matchPri = filterPriority === 'All' || t.priority === filterPriority;
    return matchCat && matchPri;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            ☑️ আজকের ও দৈনিক কাজের ট্র্যাকার
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            প্রতিদিনের প্রায়োরিটি অনুযায়ী কাজ গুছিয়ে রাখুন ও সম্পন্ন করুন
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
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
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      )}

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">ফিল্টার:</span>
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
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none"
          >
            <option value="All">সব প্রায়োরিটি</option>
            {priorities.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
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
              <div className="flex items-start gap-3.5">
                {/* Status Toggle Circle */}
                <button
                  onClick={() => handleStatusChange(task.id, task.status === 'Done' ? 'NotStarted' : 'Done')}
                  className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
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

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5">
                    {task.targetMetric && (
                      <span className="flex items-center gap-1 font-medium text-emerald-700">
                        <Target className="w-3.5 h-3.5" /> {task.targetMetric}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {task.date}
                    </span>
                    {task.notes && <span>• {task.notes}</span>}
                  </div>
                </div>
              </div>

              {/* Status Selector & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                >
                  {statuses.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
            কোনো কাজ পাওয়া যায়নি! নতুন একটি কাজ তৈরি করতে "নতুন কাজ যোগ করুন" বাটনে ক্লিক করুন।
          </div>
        )}
      </div>
    </div>
  );
}
