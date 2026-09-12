import React, { useState } from 'react';
import { 
  CalendarCheck, 
  Plus, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  Award, 
  AlertTriangle, 
  Target, 
  Trash2,
  CheckCircle2
} from 'lucide-react';

export default function WeeklyReview({ reviews, setReviews }) {
  const [showAddForm, setShowAddForm] = useState(false);

  const [newReview, setNewReview] = useState({
    weekTitle: `Week ${reviews.length + 1} (সপ্তাহ ${reviews.length + 1})`,
    outreachCount: '',
    repliesCount: '',
    interestedCount: '',
    clientsWonCount: '',
    newIncome: '',
    mainAchievement: '',
    mainProblem: '',
    nextWeekPriority: '',
    notes: ''
  });

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReview.weekTitle.trim()) return;

    const created = {
      ...newReview,
      id: Date.now(),
      outreachCount: Number(newReview.outreachCount) || 0,
      repliesCount: Number(newReview.repliesCount) || 0,
      interestedCount: Number(newReview.interestedCount) || 0,
      clientsWonCount: Number(newReview.clientsWonCount) || 0,
      newIncome: Number(newReview.newIncome) || 0
    };

    setReviews([created, ...reviews]);
    setNewReview({
      weekTitle: `Week ${reviews.length + 2} (সপ্তাহ ${reviews.length + 2})`,
      outreachCount: '',
      repliesCount: '',
      interestedCount: '',
      clientsWonCount: '',
      newIncome: '',
      mainAchievement: '',
      mainProblem: '',
      nextWeekPriority: '',
      notes: ''
    });
    setShowAddForm(false);
  };

  const handleDeleteReview = (id) => {
    setReviews(reviews.filter(r => r.id !== id));
  };

  // Calculations across all reviews
  const totalOutreach = reviews.reduce((sum, r) => sum + (Number(r.outreachCount) || 0), 0);
  const totalReplies = reviews.reduce((sum, r) => sum + (Number(r.repliesCount) || 0), 0);
  const totalInterested = reviews.reduce((sum, r) => sum + (Number(r.interestedCount) || 0), 0);
  const totalClientsWon = reviews.reduce((sum, r) => sum + (Number(r.clientsWonCount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            📅 সাপ্তাহিক পারফরম্যান্স রিভিউ (Weekly Review)
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            প্রতি সপ্তাহের কাজের হিসেব, সাফল্য ও সমস্যা বিশ্লেষণ ট্র্যাকার
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন সপ্তাহের রিভিউ যোগ করুন</span>
        </button>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">মোট ক্লায়েন্ট আউটরিচ</div>
          <div className="text-2xl font-bold text-slate-800 mt-0.5">{totalOutreach} টি</div>
          <div className="text-[11px] text-slate-400 mt-1">কোল্ড কল / মেইল পাঠানো</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">মোট রিপ্লাই প্রাপ্তি</div>
          <div className="text-2xl font-bold text-blue-600 mt-0.5">{totalReplies} টি</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">উত্তর এসেছে</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">আগ্রহী লিড (Interested)</div>
          <div className="text-2xl font-bold text-teal-600 mt-0.5">{totalInterested} জন</div>
          <div className="text-[11px] text-teal-600 font-medium mt-1">মিটিং / প্রস্তাবনা</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">অর্জিত মোট ক্লায়েন্ট</div>
          <div className="text-2xl font-bold text-emerald-600 mt-0.5">{totalClientsWon} জন</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">সফল কনভার্সন</div>
        </div>
      </div>

      {/* Add Review Form */}
      {showAddForm && (
        <form onSubmit={handleAddReview} className="bg-white border border-emerald-200 rounded-2xl p-5 md:p-6 shadow-md space-y-4">
          <h3 className="text-base font-bold text-slate-800 border-b pb-3">নতুন সপ্তাহের রিভিউ যোগ করুন</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">সপ্তাহের নাম (Week Title) *</label>
              <input
                type="text"
                required
                value={newReview.weekTitle}
                onChange={(e) => setNewReview({ ...newReview, weekTitle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">আউটরিচ সংখ্যা (Outreach Count)</label>
              <input
                type="number"
                placeholder="যেমন: 30"
                value={newReview.outreachCount}
                onChange={(e) => setNewReview({ ...newReview, outreachCount: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">রিপ্লাই সংখ্যা (Replies)</label>
              <input
                type="number"
                placeholder="যেমন: 8"
                value={newReview.repliesCount}
                onChange={(e) => setNewReview({ ...newReview, repliesCount: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">আগ্রহী লিড (Interested Leads)</label>
              <input
                type="number"
                placeholder="যেমন: 4"
                value={newReview.interestedCount}
                onChange={(e) => setNewReview({ ...newReview, interestedCount: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">কনফার্মড ক্লায়েন্ট (Clients Won)</label>
              <input
                type="number"
                placeholder="যেমন: 1"
                value={newReview.clientsWonCount}
                onChange={(e) => setNewReview({ ...newReview, clientsWonCount: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">নতুন ইনকাম (New Income ৳)</label>
              <input
                type="number"
                placeholder="যেমন: 15000"
                value={newReview.newIncome}
                onChange={(e) => setNewReview({ ...newReview, newIncome: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">প্রধান অর্জন (Main Achievement)</label>
              <input
                type="text"
                placeholder="যেমন: ৩টি পোর্টফোলিও ওয়েবসাইট সম্পন্ন ও প্রথম ডিল ডান"
                value={newReview.mainAchievement}
                onChange={(e) => setNewReview({ ...newReview, mainAchievement: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">প্রধান বাধা / সমস্যা (Main Problem/Blocker)</label>
              <input
                type="text"
                placeholder="যেমন: ফোন কল ধরতে দেরি হওয়া বা ডোমেন ট্রান্সফার লেট"
                value={newReview.mainProblem}
                onChange={(e) => setNewReview({ ...newReview, mainProblem: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">পরবর্তী সপ্তাহের ফোকাস (Next Week's Priority)</label>
              <input
                type="text"
                placeholder="যেমন: স্কুলগুলোতে সরাসরি ভিজিট করে ডেমো দেখানো"
                value={newReview.nextWeekPriority}
                onChange={(e) => setNewReview({ ...newReview, nextWeekPriority: e.target.value })}
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

      {/* Review Cards List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((rev) => (
            <div key={rev.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold flex items-center justify-center text-sm">
                    📅
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{rev.weekTitle}</h3>
                    <p className="text-xs text-slate-500">পারফরম্যান্স ও অগ্রগতি লগ</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {rev.newIncome > 0 && (
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                      +৳{rev.newIncome.toLocaleString()}
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Outreach Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">আউটরিচ: </span>
                  <span className="font-bold text-slate-800">{rev.outreachCount} টি</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">রিপ্লাই: </span>
                  <span className="font-bold text-blue-600">{rev.repliesCount} টি</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">আগ্রহী: </span>
                  <span className="font-bold text-teal-600">{rev.interestedCount} জন</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">ক্লায়েন্ট অর্জিত: </span>
                  <span className="font-bold text-emerald-600">{rev.clientsWonCount} জন</span>
                </div>
              </div>

              {/* Achievements, Problems & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-emerald-50/60 border border-emerald-200/60 p-3 rounded-xl">
                  <div className="font-bold text-emerald-800 flex items-center gap-1.5 mb-1">
                    <Award className="w-3.5 h-3.5 text-emerald-600" /> প্রধান অর্জন
                  </div>
                  <div className="text-slate-700">{rev.mainAchievement || 'নির্ধারিত লক্ষ্য পূরণ'}</div>
                </div>

                <div className="bg-rose-50/60 border border-rose-200/60 p-3 rounded-xl">
                  <div className="font-bold text-rose-800 flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> প্রধান বাধা / সমস্যা
                  </div>
                  <div className="text-slate-700">{rev.mainProblem || 'কোনো সমস্যা নেই'}</div>
                </div>

                <div className="bg-blue-50/60 border border-blue-200/60 p-3 rounded-xl">
                  <div className="font-bold text-blue-800 flex items-center gap-1.5 mb-1">
                    <Target className="w-3.5 h-3.5 text-blue-600" /> আগামী সপ্তাহের ফোকাস
                  </div>
                  <div className="text-slate-700">{rev.nextWeekPriority || 'নতুন আউটরিচ বৃদ্ধি'}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
            কোনো সপ্তাহের রিভিউ যুক্ত করা হয়নি। "নতুন সপ্তাহের রিভিউ যোগ করুন" বাটনে ক্লিক করুন।
          </div>
        )}
      </div>
    </div>
  );
}
