import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Plan from './components/Plan';
import Tasks from './components/Tasks';
import Crm from './components/Crm';
import IncomeTracker from './components/IncomeTracker';
import ExpenseTracker from './components/ExpenseTracker';
import WeeklyReview from './components/WeeklyReview';
import Services from './components/Services';
import Settings from './components/Settings';
import Auth from './components/Auth';
import SubscriptionModal from './components/SubscriptionModal';
import AdminPanel from './components/AdminPanel';
import Tuition from './components/Tuition';


import { supabase, isSupabaseConfigured } from './lib/supabase';
import * as api from './lib/supabaseService';
import { loadData, STORAGE_KEYS } from './utils/storage';
import { RefreshCw, AlertCircle, CloudOff } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loadingData, setLoadingData] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  // Subscription & Admin State
  const [subscription, setSubscription] = useState(null);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loadingSub, setLoadingSub] = useState(true);

  // Admin Check
  const isAdmin = session?.user?.email === 'fuwaraahmed@gmail.com';

  // Subscription Validity Check (Enforces status = 'active' AND expiresAt > NOW)
  const isSubscribed = (sub) => {
    if (isAdmin) return true; // Admin bypasses subscription locks
    if (!sub) return false;
    const isActive = sub.status === 'active';
    const notExpired = sub.expiresAt && new Date(sub.expiresAt) > new Date();
    return isActive && notExpired;
  };

  // Initial Defaults
  const defaultAppData = {
    targetIncome: 100000,
    installment: 80000,
    dailyOutreachTarget: 10,
    currency: '৳',
  };

  const defaultTasks = [
    { id: 1, name: '৫টি স্কুলে ইমেইল ও কোল্ড কল করা', category: 'Sales', priority: 'High', date: new Date().toISOString().split('T')[0], targetMetric: '৫টি কল', status: 'InProgress', notes: 'হেডমাস্টারের সাথে কথা বলা' },
    { id: 2, name: 'পোর্টফোলিও সাইটের হোমপেজ ডিজাইন সম্পন্ন করা', category: 'Portfolio', priority: 'High', date: new Date().toISOString().split('T')[0], targetMetric: '১টি হোমপেজ', status: 'NotStarted', notes: 'Tailwind CSS দিয়ে লেআউট' }
  ];

  const defaultLeads = [
    { 
      id: 1, 
      clientName: 'মোঃ শফিকুল ইসলাম', 
      businessName: 'আইডিয়াল মডেল স্কুল', 
      contact: '01711223344', 
      service: 'Business Website (৳১০,০০০)', 
      quotedPrice: 15000, 
      advance: 5000, 
      status: 'Negotiation', 
      nextFollowUp: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      date: new Date().toISOString().split('T')[0],
      notes: 'হেডমাস্টারের সাথে কথা চলছে'
    },
    { 
      id: 2, 
      clientName: 'ইঞ্জিনিয়ার তানভীর', 
      businessName: 'প্রোগ্রেস কোচিং সেন্টার', 
      contact: '01899887766', 
      service: 'Starter Landing Page (৳৫,০০০)', 
      quotedPrice: 8000, 
      advance: 4000, 
      status: 'Advance Paid', 
      nextFollowUp: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      date: new Date().toISOString().split('T')[0],
      notes: 'ল্যান্ডিং পেজ কনটেন্ট রেডি'
    }
  ];

  const defaultIncomes = [
    { 
      id: 1, 
      date: new Date().toISOString().split('T')[0], 
      source: 'Salary (স্থায়ী বেতন/আয়)', 
      clientDetails: 'নিয়মিত মাসিক বেতন', 
      amount: 40000, 
      paymentType: 'Bank Transfer', 
      month: 'Month 1', 
      notes: 'অফিস বেতন' 
    },
    { 
      id: 2, 
      date: new Date().toISOString().split('T')[0], 
      source: 'Landing Page (ল্যান্ডিং পেজ)', 
      clientDetails: 'প্রোগ্রেস কোচিং সেন্টার অ্যাডভান্স', 
      amount: 4000, 
      paymentType: 'bKash', 
      month: 'Month 1', 
      notes: 'অ্যাডভান্স প্রাপ্তি' 
    }
  ];

  const defaultExpenses = [
    { 
      id: 1, 
      date: new Date().toISOString().split('T')[0], 
      category: 'Installment (মাসিক কিস্তি ৳৮০,০০০)', 
      description: 'মাসিক কিস্তি প্রদান', 
      amount: 80000, 
      month: 'Month 1', 
      notes: 'ব্যাংক ডিপিএস/কিস্তি' 
    },
    { 
      id: 2, 
      date: new Date().toISOString().split('T')[0], 
      category: 'Household (সংসার খরচ)', 
      description: 'বাসা ভাড়া ও নিত্যপণ্য খরচ', 
      amount: 25000, 
      month: 'Month 1', 
      notes: 'সংসার খরচ' 
    }
  ];

  const defaultReviews = [
    {
      id: 1,
      weekTitle: 'Week 1 (১ম সপ্তাহ)',
      outreachCount: 25,
      repliesCount: 6,
      interestedCount: 3,
      clientsWonCount: 1,
      newIncome: 5000,
      mainAchievement: '৩টি ডেমো সাইট তৈরি সম্পন্ন ও প্রথম ক্লায়েন্ট অ্যাডভান্স প্রাপ্তি',
      mainProblem: 'কোল্ড কলে ফলো-আপ মিস হওয়া',
      nextWeekPriority: '৫০টি স্কুলে সরাসরি কন্টাক্ট করা',
      notes: ''
    }
  ];

  const defaultServices = [
    {
      id: 1,
      title: 'Starter Landing Page',
      price: '৳৫,০০০',
      deliveryTime: '৩ - ৫ দিন',
      includes: ['১টি হাই-কনভার্টিং ল্যান্ডিং পেজ', 'মোবাইল ও ট্যাবলেট রেসপন্সিভ', 'কন্টাক্ট/হোয়াটসঅ্যাপ ফর্ম', 'ডোমেন সেটআপ সহায়তা'],
      notes: 'কোচিং সেন্টার, ট্রেনিং ও সিগেল প্রোডাক্টের জন্য সেরা'
    },
    {
      id: 2,
      title: 'Business Website',
      price: '৳১০,০০০',
      deliveryTime: '৫ - ৭ দিন',
      includes: ['৫টি ডাইনামিক পেজ (Home, About, Services, Gallery, Contact)', 'রেসপন্সিভ আধুনিক ডিজাইন', 'এসইও ফ্রেন্ডলি স্ট্রাকচার', 'সোশ্যাল মিডিয়া ইন্টিগ্রেশন'],
      notes: 'স্কুল, মডেল মাদ্রাসা, লোকাল বিজনেস ও ছোট কোম্পানির জন্য উপযুক্ত'
    },
    {
      id: 3,
      title: 'Professional Website',
      price: '৳২০,০০০+',
      deliveryTime: '৭ - ১২ দিন',
      includes: ['১০+ পেজ বা কাস্টম রিকোয়ারমেন্ট', 'অ্যাডভান্সড ডিজাইন ও এনিমেশন', 'ব্লগ / নোটিশ বোর্ড সিস্টেম', '১ বছরের ফ্রি টেকনিক্যাল সাপোর্ট'],
      notes: 'বড় ইন্সটিটিউট, রিয়েল এস্টেট ও আইটি এজেন্সির জন্য সেরা'
    },
    {
      id: 4,
      title: 'Monthly Maintenance',
      price: '৳১,০০০ – ৳৩,০০০/মাস',
      deliveryTime: 'মাসিক রিকারিং',
      includes: ['মাসিক কন্টেন্ট ও নোটিশ আপডেট', 'সিকিউরিটি চেক ও নিয়মিত ব্যাকআপ', 'স্পিড অপটিমাইজেশন', 'টেকনিক্যাল প্রবলেম ফিক্স'],
      notes: 'স্থায়ী রিকারিং প্যাসিভ ইনকামের জন্য সবচেয়ে কার্যকরী'
    },
    {
      id: 5,
      title: 'E-commerce Website',
      price: '৳২০,০০০+',
      deliveryTime: '১০ - ১৫ দিন',
      includes: ['অনলাইন শপ ও প্রোডাক্ট ক্যাটালগ', 'বিকাশ/নগদ/কার্ড পেমেন্ট গেটওয়ে', 'অর্ডার ম্যানেজমেন্ট ড্যাশবোর্ড', 'গ্রাহক ইনভয়েস জেনারেটর'],
      notes: 'অনলাইন শপ, বুটিক ও ই-কমার্স বিজনেসের জন্য'
    }
  ];

  // Persistent React States
  const [appData, setAppDataState] = useState(defaultAppData);
  const [tasks, setTasksState] = useState(defaultTasks);
  const [leads, setLeadsState] = useState(defaultLeads);
  const [incomes, setIncomesState] = useState(defaultIncomes);
  const [expenses, setExpensesState] = useState(defaultExpenses);
  const [reviews, setReviewsState] = useState(defaultReviews);
  const [services, setServicesState] = useState(defaultServices);
  const [planData, setPlanDataState] = useState(null);
  const [tuitionStudents, setTuitionStudents] = useState([]);
  const [tuitionPayments, setTuitionPayments] = useState([]);

  // 1. Session Setup & Auth Monitoring
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecking(false);
    }).catch(err => {
      console.error('Session get error:', err);
      setAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch Subscription & User Data from Supabase when Session Changes
  useEffect(() => {
    if (!session?.user?.id || !isSupabaseConfigured) return;

    let isMounted = true;
    setLoadingData(true);
    setLoadingSub(true);

    const loadUserData = async () => {
      const userId = session.user.id;

      try {
        const [
          subRes,
          payReqRes,
          settingsRes,
          tasksRes,
          leadsRes,
          incomesRes,
          expensesRes,
          reviewsRes,
          servicesRes,
          planRes,
          tuitionStsRes,
          tuitionPaysRes
        ] = await Promise.all([
          api.getSubscription(userId),
          api.getPaymentRequests(userId),
          api.getSettings(userId),
          api.getTasks(userId),
          api.getCRMClients(userId),
          api.getIncome(userId),
          api.getExpenses(userId),
          api.getWeeklyReviews(userId),
          api.getServices(userId),
          api.get90DayPlan(userId),
          api.getTuitionStudents(userId),
          api.getTuitionPayments(userId)
        ]);

        if (!isMounted) return;

        setSubscription(subRes);
        setPaymentRequests(payReqRes || []);
        setLoadingSub(false);

        if (settingsRes) setAppDataState(settingsRes);
        if (tasksRes && tasksRes.length > 0) setTasksState(tasksRes);
        if (leadsRes && leadsRes.length > 0) setLeadsState(leadsRes);
        if (incomesRes && incomesRes.length > 0) setIncomesState(incomesRes);
        if (expensesRes && expensesRes.length > 0) setExpensesState(expensesRes);
        if (reviewsRes && reviewsRes.length > 0) setReviewsState(reviewsRes);
        if (servicesRes && servicesRes.length > 0) setServicesState(servicesRes);
        if (planRes && planRes.length > 0) setPlanDataState(planRes);
        if (tuitionStsRes) setTuitionStudents(tuitionStsRes);
        if (tuitionPaysRes) setTuitionPayments(tuitionPaysRes);

      } catch (err) {
        if (isMounted) {
          setLoadingData(false);
          setLoadingSub(false);
        }
      }
    };

    loadUserData();

    return () => { isMounted = false; };
  }, [session?.user?.id]);


  // Auth Logout Action
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // Submit Payment Request Handler
  const handleSubmitPayment = async (details) => {
    if (!session?.user?.id) return { success: false, message: 'ইউজার লগইন করা নেই' };
    const res = await api.submitPaymentRequest(session.user.id, session.user.email, details);
    if (res && res.success) {
      const [subRes, payReqRes] = await Promise.all([
        api.getSubscription(session.user.id),
        api.getPaymentRequests(session.user.id)
      ]);
      setSubscription(subRes);
      setPaymentRequests(payReqRes || []);
    }
    return res;
  };


  // State Mutators with Supabase Sync
  const handleSetAppData = (newSettings) => {
    setAppDataState(newSettings);
    if (session?.user?.id) {
      api.updateSettings(session.user.id, newSettings);
    }
  };

  const handleSetTasks = (newTasksOrFn) => {
    setTasksState(prev => {
      const nextTasks = typeof newTasksOrFn === 'function' ? newTasksOrFn(prev) : newTasksOrFn;
      if (session?.user?.id) {
        if (nextTasks.length > prev.length) {
          const added = nextTasks.find(t => !prev.some(p => p.id === t.id));
          if (added) api.createTask(session.user.id, added);
        } else if (nextTasks.length < prev.length) {
          const deleted = prev.find(p => !nextTasks.some(t => t.id === p.id));
          if (deleted) api.deleteTask(session.user.id, deleted.id);
        } else {
          nextTasks.forEach(t => {
            const old = prev.find(p => p.id === t.id);
            if (old && old.status !== t.status) {
              api.updateTaskStatus(session.user.id, t.id, t.status);
            }
          });
        }
      }
      return nextTasks;
    });
  };

  const handleSetLeads = (newLeadsOrFn) => {
    setLeadsState(prev => {
      const nextLeads = typeof newLeadsOrFn === 'function' ? newLeadsOrFn(prev) : newLeadsOrFn;
      if (session?.user?.id) {
        if (nextLeads.length > prev.length) {
          const added = nextLeads.find(l => !prev.some(p => p.id === l.id));
          if (added) api.createCRMClient(session.user.id, added);
        } else if (nextLeads.length < prev.length) {
          const deleted = prev.find(p => !nextLeads.some(l => l.id === p.id));
          if (deleted) api.deleteCRMClient(session.user.id, deleted.id);
        } else {
          nextLeads.forEach(l => {
            const old = prev.find(p => p.id === l.id);
            if (old && old.status !== l.status) {
              api.updateCRMClientStatus(session.user.id, l.id, l.status);
            }
          });
        }
      }
      return nextLeads;
    });
  };

  const handleSetIncomes = (newIncomesOrFn) => {
    setIncomesState(prev => {
      const nextIncomes = typeof newIncomesOrFn === 'function' ? newIncomesOrFn(prev) : newIncomesOrFn;
      if (session?.user?.id) {
        if (nextIncomes.length > prev.length) {
          const added = nextIncomes.find(i => !prev.some(p => p.id === i.id));
          if (added) api.createIncome(session.user.id, added);
        } else if (nextIncomes.length < prev.length) {
          const deleted = prev.find(p => !nextIncomes.some(i => i.id === p.id));
          if (deleted) api.deleteIncome(session.user.id, deleted.id);
        }
      }
      return nextIncomes;
    });
  };

  const handleSetExpenses = (newExpensesOrFn) => {
    setExpensesState(prev => {
      const nextExpenses = typeof newExpensesOrFn === 'function' ? newExpensesOrFn(prev) : newExpensesOrFn;
      if (session?.user?.id) {
        if (nextExpenses.length > prev.length) {
          const added = nextExpenses.find(e => !prev.some(p => p.id === e.id));
          if (added) api.createExpense(session.user.id, added);
        } else if (nextExpenses.length < prev.length) {
          const deleted = prev.find(p => !nextExpenses.some(e => e.id === p.id));
          if (deleted) api.deleteExpense(session.user.id, deleted.id);
        }
      }
      return nextExpenses;
    });
  };

  const handleSetReviews = (newReviewsOrFn) => {
    setReviewsState(prev => {
      const nextReviews = typeof newReviewsOrFn === 'function' ? newReviewsOrFn(prev) : newReviewsOrFn;
      if (session?.user?.id) {
        if (nextReviews.length > prev.length) {
          const added = nextReviews.find(r => !prev.some(p => p.id === r.id));
          if (added) api.createWeeklyReview(session.user.id, added);
        } else if (nextReviews.length < prev.length) {
          const deleted = prev.find(p => !nextReviews.some(r => r.id === p.id));
          if (deleted) api.deleteWeeklyReview(session.user.id, deleted.id);
        }
      }
      return nextReviews;
    });
  };

  const handleSetServices = (newServicesOrFn) => {
    setServicesState(prev => {
      const nextServices = typeof newServicesOrFn === 'function' ? newServicesOrFn(prev) : newServicesOrFn;
      if (session?.user?.id) {
        if (nextServices.length > prev.length) {
          const added = nextServices.find(s => !prev.some(p => p.id === s.id));
          if (added) api.createService(session.user.id, added);
        } else if (nextServices.length < prev.length) {
          const deleted = prev.find(p => !nextServices.some(s => s.id === p.id));
          if (deleted) api.deleteService(session.user.id, deleted.id);
        }
      }
      return nextServices;
    });
  };

  const handleSetPlanData = (newPlanOrFn) => {
    setPlanDataState(prev => {
      const nextPlan = typeof newPlanOrFn === 'function' ? newPlanOrFn(prev) : newPlanOrFn;
      if (session?.user?.id && nextPlan) {
        api.update90DayPlan(session.user.id, nextPlan);
      }
      return nextPlan;
    });
  };

  // Trigger Safe Migration Action
  const handleMigrate = async () => {
    if (!session?.user?.id) return { success: false, message: 'ইউজার লগইন করা নেই' };
    setIsMigrating(true);
    const res = await api.migrateLocalStorageToSupabase(session.user.id);
    
    if (res.success) {
      const [t, l, inc, exp, rev, srv, pl, setts] = await Promise.all([
        api.getTasks(session.user.id),
        api.getCRMClients(session.user.id),
        api.getIncome(session.user.id),
        api.getExpenses(session.user.id),
        api.getWeeklyReviews(session.user.id),
        api.getServices(session.user.id),
        api.get90DayPlan(session.user.id),
        api.getSettings(session.user.id)
      ]);
      if (t) setTasksState(t);
      if (l) setLeadsState(l);
      if (inc) setIncomesState(inc);
      if (exp) setExpensesState(exp);
      if (rev) setReviewsState(rev);
      if (srv) setServicesState(srv);
      if (pl) setPlanDataState(pl);
      if (setts) setAppDataState(setts);
    }

    setIsMigrating(false);
    return res;
  };

  // Tuition Handlers
  const handleAddTuitionStudent = async (studentData) => {
    if (session?.user?.id) {
      const added = await api.addTuitionStudent(session.user.id, studentData);
      if (added) {
        setTuitionStudents(prev => [added, ...prev]);
      }
    } else {
      const newSt = { id: Date.now(), ...studentData };
      setTuitionStudents(prev => [newSt, ...prev]);
    }
  };

  const handleUpdateTuitionStudent = async (studentId, studentData) => {
    if (session?.user?.id) {
      const updated = await api.updateTuitionStudent(studentId, studentData);
      if (updated) {
        setTuitionStudents(prev => prev.map(s => String(s.id) === String(studentId) ? updated : s));
      }
    } else {
      setTuitionStudents(prev => prev.map(s => String(s.id) === String(studentId) ? { ...s, ...studentData } : s));
    }
  };

  const handleRecordTuitionPayment = async (paymentData) => {
    if (session?.user?.id) {
      const res = await api.recordTuitionPayment(paymentData);
      if (res && res.success !== false) {
        // Refresh tuition payments & income list atomically
        const [paysRes, incsRes] = await Promise.all([
          api.getTuitionPayments(session.user.id),
          api.getIncome(session.user.id)
        ]);
        if (paysRes) setTuitionPayments(paysRes);
        if (incsRes) setIncomesState(incsRes);
      }
      return res;
    } else {
      const mockPay = { id: Date.now(), ...paymentData };
      setTuitionPayments(prev => [mockPay, ...prev]);
      return { success: true };
    }
  };

  // Dynamic Financial Calculations
  const salarySum = incomes.filter(i => i.source.includes('Salary')).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const newIncomeSum = incomes.filter(i => !i.source.includes('Salary')).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const updatedAppData = {
    ...appData,
    currentIncome: salarySum || 40000,
    newIncome: newIncomeSum,
    incomes: incomes,
    expenses: expenses,
    tasks: tasks,
    leads: leads,
    tuitionPayments: tuitionPayments,
    tuitionStudents: tuitionStudents,
    user: session?.user
  };

  // Loading Splash Screen
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
          <span className="text-sm font-semibold text-slate-700">অনুমোদন যাচাই করা হচ্ছে...</span>
        </div>
      </div>
    );
  }

  // 1. Auth Guard: Unauthenticated user gets Auth component
  if (!session) {
    return <Auth />;
  }

  // 2. Subscription Guard: Unsubscribed non-admin user gets SubscriptionModal
  if (!loadingSub && !isSubscribed(subscription) && activeTab !== 'admin') {
    return (
      <SubscriptionModal
        subscription={subscription}
        paymentRequests={paymentRequests}
        onSubmitPayment={handleSubmitPayment}
        user={session.user}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={session.user} 
        onLogout={handleLogout} 
      />
      
      {/* Top Subtle Animated Sync Progress Line */}
      {loadingData && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 z-50 animate-pulse"></div>
      )}

      <main className="flex-1 md:ml-64 p-4 sm:p-6 md:p-8 w-full min-w-0 max-w-[1600px] mx-auto">
        {/* Sleek Floating Glass Cloud Sync Badge */}
        {loadingData && (
          <div className="mb-4 inline-flex items-center gap-2 bg-white/90 backdrop-blur-md border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
            <span className="text-slate-600">লাইভ ক্লাউড ডাটা সিঙ্ক চলছে...</span>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <Dashboard data={updatedAppData} setActiveTab={setActiveTab} />
        )}

        {activeTab === 'plan' && (
          <Plan planData={planData} setPlanData={handleSetPlanData} />
        )}

        {activeTab === 'tasks' && (
          <Tasks tasks={tasks} setTasks={handleSetTasks} />
        )}

        {activeTab === 'tuition' && (
          <Tuition
            students={tuitionStudents}
            payments={tuitionPayments}
            onAddStudent={handleAddTuitionStudent}
            onUpdateStudent={handleUpdateTuitionStudent}
            onRecordPayment={handleRecordTuitionPayment}
            currency={appData.currency}
          />
        )}

        {activeTab === 'crm' && (
          <Crm leads={leads} setLeads={handleSetLeads} />
        )}

        {activeTab === 'income' && (
          <IncomeTracker 
            incomes={incomes} 
            setIncomes={handleSetIncomes} 
            targetIncome={appData.targetIncome}
            currentSalary={updatedAppData.currentIncome}
          />
        )}


        {activeTab === 'expense' && (
          <ExpenseTracker 
            expenses={expenses} 
            setExpenses={handleSetExpenses} 
            totalIncome={salarySum + newIncomeSum}
          />
        )}

        {activeTab === 'weekly' && (
          <WeeklyReview reviews={reviews} setReviews={handleSetReviews} />
        )}

        {activeTab === 'services' && (
          <Services services={services} setServices={handleSetServices} />
        )}

        {activeTab === 'settings' && (
          <Settings 
            appData={appData} 
            setAppData={handleSetAppData} 
            user={session.user}
            onMigrate={handleMigrate}
            isMigrating={isMigrating}
          />
        )}

        {activeTab === 'admin' && isAdmin && (
          <AdminPanel adminUser={session.user} />
        )}
      </main>
    </div>
  );
}
