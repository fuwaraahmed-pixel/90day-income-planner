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
import LandingPage from './components/LandingPage';
import SubscriptionModal from './components/SubscriptionModal';
import AdminPanel from './components/AdminPanel';
import Tuition from './components/Tuition';
import CustomerDues from './components/CustomerDues';
import Liabilities from './components/Liabilities';


import { supabase, isSupabaseConfigured } from './lib/supabase';
import * as api from './lib/supabaseService';
import { loadData, STORAGE_KEYS } from './utils/storage';
import { RefreshCw, AlertCircle, CloudOff } from 'lucide-react';

import Toast from './components/ui/Toast';
import { isSubscribed } from './utils/subscriptionHelper';

export default function App() {
  const [session, setSession] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [publicView, setPublicView] = useState('landing'); // 'landing' | 'auth_login' | 'auth_signup'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loadingData, setLoadingData] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  // Subscription & Admin State
  const [subscription, setSubscription] = useState(null);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loadingSub, setLoadingSub] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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

  const defaultCustomerDues = [
    { 
      id: 1, 
      customerId: 1, 
      customerName: 'মোঃ শফিকুল ইসলাম (আইডিয়াল মডেল স্কুল)', 
      description: 'Business Website Project', 
      totalAmount: 20000, 
      paidAmount: 12000, 
      dueAmount: 8000, 
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      status: 'Partially Paid',
      note: 'ওয়েবসাইট প্রস্তুত, বাকি টাকা ৩০ সেপ্টেম্বরের মধ্যে দেবেন'
    },
    { 
      id: 2, 
      customerId: 2, 
      customerName: 'ইঞ্জিনিয়ার তানভীর (প্রোগ্রেস কোচিং সেন্টার)', 
      description: 'Starter Landing Page', 
      totalAmount: 8000, 
      paidAmount: 4000, 
      dueAmount: 4000, 
      dueDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      status: 'Overdue',
      note: 'ল্যান্ডিং পেজ প্রস্তুত'
    }
  ];

  const defaultDuePayments = [
    {
      id: 'pay_due_init_1',
      dueId: 1,
      customerId: 1,
      amount: 12000,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'bKash',
      note: '১ম কিস্তি পেমেন্ট'
    },
    {
      id: 'pay_due_init_2',
      dueId: 2,
      customerId: 2,
      amount: 4000,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Nagad',
      note: 'প্রাথমিক পেমেন্ট'
    }
  ];

  // Persistent React States
  const [appData, setAppDataState] = useState(defaultAppData);
  const [tasks, setTasksState] = useState([]);
  const [leads, setLeadsState] = useState([]);
  const [incomes, setIncomesState] = useState([]);
  const [expenses, setExpensesState] = useState([]);
  const [reviews, setReviewsState] = useState([]);
  const [services, setServicesState] = useState(defaultServices);
  const [planData, setPlanDataState] = useState(null);
  const [tuitionStudents, setTuitionStudents] = useState([]);
  const [tuitionPayments, setTuitionPayments] = useState([]);
  const [crmPayments, setCrmPayments] = useState([]);
  const [customerDues, setCustomerDuesState] = useState(() => loadData(STORAGE_KEYS.CUSTOMER_DUES, defaultCustomerDues));
  const [duePayments, setDuePaymentsState] = useState(() => loadData(STORAGE_KEYS.DUE_PAYMENTS, defaultDuePayments));
  const [liabilities, setLiabilitiesState] = useState([]);
  const [liabilityPayments, setLiabilityPaymentsState] = useState([]);
  const [emiInstallments, setEmiInstallments] = useState([]);

  const handleSetCustomerDues = (valueOrFn) => {
    setCustomerDuesState(prev => {
      const next = typeof valueOrFn === 'function' ? valueOrFn(prev) : valueOrFn;
      saveData(STORAGE_KEYS.CUSTOMER_DUES, next);
      return next;
    });
  };

  const handleSetDuePayments = (valueOrFn) => {
    setDuePaymentsState(prev => {
      const next = typeof valueOrFn === 'function' ? valueOrFn(prev) : valueOrFn;
      saveData(STORAGE_KEYS.DUE_PAYMENTS, next);
      return next;
    });
  };

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

  // 2. Fetch Subscription, Admin Role & User Data from Supabase when Session Changes
  useEffect(() => {
    if (!session?.user?.id) {
      setIsAdmin(false);
      return;
    }

    let isMounted = true;
    setLoadingData(true);
    setLoadingSub(true);

    const loadUserData = async () => {
      const userId = session.user.id;

      try {
        const [
          adminRes,
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
          tuitionPaysRes,
          crmPaysRes,
          duesRes,
          duePaysRes,
          liabRes,
          liabPaysRes,
          emiInstallmentsRes
        ] = await Promise.all([
          api.checkIsAdmin(userId, session.user.email),
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
          api.getTuitionPayments(userId),
          api.getCrmPayments(userId),
          api.getCustomerDues(userId),
          api.getCustomerDuePayments(userId),
          api.getLiabilities(userId),
          api.getLiabilityPayments(userId),
          api.getEmiInstallments(userId)
        ]);

        if (!isMounted) return;

        setIsAdmin(Boolean(adminRes));
        setSubscription(subRes);
        setPaymentRequests(payReqRes || []);
        setLoadingSub(false);

        setAppDataState(settingsRes || defaultAppData);
        setTasksState(tasksRes || []);
        setLeadsState(leadsRes || []);
        setIncomesState(incomesRes || []);
        setExpensesState(expensesRes || []);
        setReviewsState(reviewsRes || []);
        setServicesState(servicesRes && servicesRes.length > 0 ? servicesRes : defaultServices);
        setPlanDataState(planRes || null);
        setTuitionStudents(tuitionStsRes || []);
        setTuitionPayments(tuitionPaysRes || []);
        setCrmPayments(crmPaysRes || []);
        setCustomerDuesState(duesRes || []);
        setDuePaymentsState(duePaysRes || []);
        setLiabilitiesState(liabRes || []);
        setLiabilityPaymentsState(liabPaysRes || []);
        setEmiInstallments(emiInstallmentsRes || []);

        setLoadingData(false);
      } catch (err) {
        console.error('Failed to load user data:', err);
        if (isMounted) {
          setGlobalError('ডেটা লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট কানেকশন চেক করে পুনঃচেষ্টা করুন।');
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
    setIsAdmin(false);
    setSubscription(null);
    setPaymentRequests([]);
    setTasksState([]);
    setLeadsState([]);
    setIncomesState([]);
    setExpensesState([]);
    setReviewsState([]);
    setServicesState([]);
    setAppDataState(defaultAppData);
    setPlanDataState(null);
    setTuitionStudents([]);
    setTuitionPayments([]);
    setLiabilitiesState([]);
    setLiabilityPaymentsState([]);
    setEmiInstallments([]);
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
        } else {
          nextIncomes.forEach(i => {
            const old = prev.find(p => p.id === i.id);
            if (old && (old.amount !== i.amount || old.source !== i.source || old.clientDetails !== i.clientDetails || old.date !== i.date || old.paymentType !== i.paymentType || old.notes !== i.notes || old.month !== i.month)) {
              api.updateIncome(session.user.id, i.id, i);
            }
          });
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
        } else {
          nextExpenses.forEach(e => {
            const old = prev.find(p => p.id === e.id);
            if (old && (old.amount !== e.amount || old.category !== e.category || old.description !== e.description || old.date !== e.date || old.notes !== e.notes || old.month !== e.month)) {
              api.updateExpense(session.user.id, e.id, e);
            }
          });
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
    if (Array.isArray(paymentData)) {
      if (session?.user?.id) {
        let hasSuccess = false;
        let lastRes = null;
        for (const pData of paymentData) {
          const res = await api.recordTuitionPayment(pData);
          if (res && res.success !== false) {
             hasSuccess = true;
          }
          lastRes = res;
        }
        if (hasSuccess) {
          const [paysRes, incsRes] = await Promise.all([
            api.getTuitionPayments(session.user.id),
            api.getIncome(session.user.id)
          ]);
          if (paysRes) setTuitionPayments(paysRes);
          if (incsRes) setIncomesState(incsRes);
        }
        return lastRes || { success: true };
      } else {
        const mockPays = paymentData.map(pData => ({ id: Date.now() + Math.random(), ...pData }));
        setTuitionPayments(prev => [...mockPays, ...prev]);
        return { success: true };
      }
    }

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

  const handleDeleteTuitionPayment = async (paymentId) => {
    if (session?.user?.id) {
      const res = await api.deleteTuitionPayment(paymentId, session.user.id);
      if (res && res.success !== false) {
        const [paysRes, incsRes] = await Promise.all([
          api.getTuitionPayments(session.user.id),
          api.getIncome(session.user.id)
        ]);
        if (paysRes) setTuitionPayments(paysRes);
        if (incsRes) setIncomesState(incsRes);
      }
      return res;
    } else {
      setTuitionPayments(prev => prev.filter(p => p.id !== paymentId && String(p.id) !== String(paymentId)));
      return { success: true };
    }
  };

  const handleRecordCrmPayment = async (paymentData) => {
    if (session?.user?.id) {
      const res = await api.rpcRecordCrmPayment(paymentData);
      if (res && res.success !== false) {
        // Refresh crmPayments, leads, and incomes atomically
        const [crmPaysRes, leadsRes, incsRes] = await Promise.all([
          api.getCrmPayments(session.user.id),
          api.getCRMClients(session.user.id),
          api.getIncome(session.user.id)
        ]);
        if (crmPaysRes) setCrmPayments(crmPaysRes);
        if (leadsRes) setLeadsState(leadsRes);
        if (incsRes) setIncomesState(incsRes);
      }
      return res;
    } else {
      // LocalStorage fallback mode with payment_id idempotency check
      const existing = crmPayments.find(p => p.paymentId === paymentData.paymentId || p.id === paymentData.paymentId);
      if (existing) {
        return { success: true, idempotentRetry: true, message: 'Payment already recorded' };
      }

      const paymentId = paymentData.paymentId || `pay_${Date.now()}`;
      const newPayment = {
        id: paymentId,
        paymentId: paymentId,
        crmClientId: Number(paymentData.crmClientId),
        paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
        amount: Number(paymentData.amount),
        paymentMethod: paymentData.paymentMethod || 'bKash',
        notes: paymentData.notes || ''
      };

      const client = leads.find(l => String(l.id) === String(paymentData.crmClientId));
      const clientDetails = client ? `${client.clientName} (${client.businessName})` : 'CRM Client';

      const newIncome = {
        id: Date.now(),
        date: newPayment.paymentDate,
        source: 'CRM / Service',
        clientDetails: clientDetails,
        amount: newPayment.amount,
        paymentType: newPayment.paymentMethod,
        month: 'Month 1',
        notes: newPayment.notes,
        crmPaymentId: paymentId
      };

      setCrmPayments(prev => [newPayment, ...prev]);
      setIncomesState(prev => [newIncome, ...prev]);

      if (client) {
        const newAdvance = (Number(client.advance) || 0) + newPayment.amount;
        let newStatus = client.status;
        if (Number(client.quotedPrice) > 0 && newAdvance >= Number(client.quotedPrice)) {
          newStatus = 'Paid';
        } else if (newAdvance > 0 && (client.status === 'New' || client.status === 'Negotiation' || client.status === 'Proposal Sent')) {
          newStatus = 'Advance Paid';
        }
        handleSetLeads(prev => prev.map(l => String(l.id) === String(client.id) ? { ...l, advance: newAdvance, status: newStatus } : l));
      }

      return { success: true, idempotentRetry: false };
    }
  };

  // Customer Dues Handlers
  const handleAddCustomerDue = async (dueData) => {
    const total = Number(dueData.totalAmount) || 0;
    const initialPaid = Number(dueData.paidAmount) || 0;

    if (session?.user?.id) {
      const res = await api.createCustomerDue(session.user.id, dueData);
      if (res?.error || !res?.data) {
        throw new Error(res?.error || 'Supabase-এ পাওনা সংরক্ষণ করা সম্ভব হয়নি।');
      }
      const created = res.data;
      setCustomerDuesState(prev => [created, ...prev]);

      if (initialPaid > 0) {
        const uniquePayId = typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : '00000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0');
        const payRes = await api.rpcRecordCustomerDuePayment({
          paymentId: uniquePayId,
          dueId: created.id,
          paymentDate: new Date().toISOString().split('T')[0],
          amount: initialPaid,
          paymentMethod: 'bKash',
          note: 'প্রাথমিক পেমেন্ট প্রাপ্তি'
        });
        if (payRes?.success === false) {
          console.warn('Initial payment recording issue:', payRes.message);
        }
        const [duesRes, paysRes, incsRes] = await Promise.all([
          api.getCustomerDues(session.user.id),
          api.getCustomerDuePayments(session.user.id),
          api.getIncome(session.user.id)
        ]);
        if (duesRes) setCustomerDuesState(duesRes);
        if (paysRes) setDuePaymentsState(paysRes);
        if (incsRes) setIncomesState(incsRes);
      }
      return created;
    } else {
      const newDue = {
        id: Date.now(),
        customerId: dueData.customerId ? Number(dueData.customerId) : null,
        customerName: dueData.customerName,
        description: dueData.description || 'পাওনা বিবরণী',
        totalAmount: total,
        paidAmount: initialPaid,
        dueAmount: Math.max(0, total - initialPaid),
        dueDate: dueData.dueDate || null,
        status: initialPaid >= total && total > 0 ? 'Paid' : initialPaid > 0 ? 'Partially Paid' : 'Unpaid',
        note: dueData.note || '',
        createdAt: new Date().toISOString()
      };

      handleSetCustomerDues(prev => [newDue, ...prev]);

      if (initialPaid > 0) {
        const paymentId = `pay_due_${Date.now()}`;
        const newPayment = {
          id: paymentId,
          dueId: newDue.id,
          customerId: newDue.customerId,
          amount: initialPaid,
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'bKash',
          note: 'প্রাথমিক পেমেন্ট'
        };
        handleSetDuePayments(prev => [newPayment, ...prev]);

        const newIncome = {
          id: Date.now(),
          date: newPayment.paymentDate,
          source: 'Customer Payment',
          clientDetails: `${dueData.customerName} (${dueData.description || 'পাওনা বিবরণী'})`,
          amount: initialPaid,
          paymentType: 'bKash',
          month: 'Month 1',
          notes: 'প্রাথমিক পেমেন্ট'
        };
        setIncomesState(prev => [newIncome, ...prev]);
      }
      return newDue;
    }
  };

  const handleUpdateCustomerDue = async (dueId, dueData) => {
    if (session?.user?.id) {
      const res = await api.updateCustomerDue(session.user.id, dueId, dueData);
      if (res?.error || !res?.data) {
        throw new Error(res?.error || 'Supabase-এ পাওনা আপডেট করতে সমস্যা হয়েছে।');
      }
      const duesRes = await api.getCustomerDues(session.user.id);
      if (duesRes) setCustomerDuesState(duesRes);
      return res.data;
    } else {
      handleSetCustomerDues(prev => prev.map(d => {
        if (String(d.id) === String(dueId)) {
          const total = Number(dueData.totalAmount) || d.totalAmount;
          const paid = d.paidAmount;
          const due = Math.max(0, total - paid);
          const status = due <= 0 ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Unpaid';
          return { ...d, ...dueData, totalAmount: total, dueAmount: due, status };
        }
        return d;
      }));
    }
  };

  const handleDeleteCustomerDue = async (dueId) => {
    if (session?.user?.id) {
      const res = await api.deleteCustomerDue(session.user.id, dueId);
      if (res?.error || res?.success === false) {
        throw new Error(res?.error || 'Supabase থেকে মুছে ফেলতে সমস্যা হয়েছে।');
      }
      setCustomerDuesState(prev => prev.filter(d => String(d.id) !== String(dueId)));
    } else {
      handleSetCustomerDues(prev => prev.filter(d => String(d.id) !== String(dueId)));
    }
  };

  const handleRecordCustomerDuePayment = async (paymentData) => {
    if (session?.user?.id) {
      const res = await api.rpcRecordCustomerDuePayment(paymentData);
      if (res && res.success !== false) {
        const [duesRes, paysRes, incsRes] = await Promise.all([
          api.getCustomerDues(session.user.id),
          api.getCustomerDuePayments(session.user.id),
          api.getIncome(session.user.id)
        ]);
        if (duesRes) setCustomerDuesState(duesRes);
        if (paysRes) setDuePaymentsState(paysRes);
        if (incsRes) setIncomesState(incsRes);
      }
      return res;
    } else {
      const dueItem = customerDues.find(d => String(d.id) === String(paymentData.dueId));
      if (!dueItem) return { success: false, message: 'Pawn record not found' };

      const amountNum = Number(paymentData.amount);
      const newPaid = (Number(dueItem.paidAmount) || 0) + amountNum;
      const newDue = Math.max(0, (Number(dueItem.totalAmount) || 0) - newPaid);
      const newStatus = newDue <= 0 ? 'Paid' : 'Partially Paid';

      const paymentId = paymentData.paymentId || `pay_due_${Date.now()}`;
      const newPayment = {
        id: paymentId,
        dueId: paymentData.dueId,
        customerId: dueItem.customerId,
        amount: amountNum,
        paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
        paymentMethod: paymentData.paymentMethod || 'bKash',
        note: paymentData.note || '',
        createdAt: new Date().toISOString()
      };

      const newIncome = {
        id: Date.now(),
        date: newPayment.paymentDate,
        source: 'Customer Payment',
        clientDetails: `${dueItem.customerName} (${dueItem.description})`,
        amount: amountNum,
        paymentType: newPayment.paymentMethod,
        month: 'Month 1',
        notes: paymentData.note || ''
      };

      handleSetCustomerDues(prev => prev.map(d => String(d.id) === String(paymentData.dueId) ? {
        ...d,
        paidAmount: newPaid,
        dueAmount: newDue,
        status: newStatus
      } : d));

      handleSetDuePayments(prev => [newPayment, ...prev]);
      setIncomesState(prev => [newIncome, ...prev]);

      return { success: true };
    }
  };

  // Liabilities Handlers
  const handleCreateLiability = async (liabilityData) => {
    if (session?.user?.id) {
      const res = await api.createLiability(session.user.id, liabilityData);
      if (res?.error || !res?.data) {
        return { success: false, message: res?.error || 'Supabase-এ দেনা সংরক্ষণ করা সম্ভব হয়নি।' };
      }
      
      const newLiability = res.data;
      setLiabilitiesState(prev => [newLiability, ...prev]);

      // If it's an EMI, generate and create the schedule
      if (newLiability.liabilityType === 'EMI' && newLiability.durationMonths > 0) {
        const installments = [];
        const startDate = newLiability.startDate ? new Date(newLiability.startDate) : new Date();
        const dueDay = newLiability.dueDay || startDate.getDate();
        
        for (let i = 1; i <= newLiability.durationMonths; i++) {
          // Calculate due date for this installment
          const dueDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, dueDay);
          
          // Handle month overflow (e.g. Feb 31 -> Feb 28)
          if (dueDate.getMonth() !== (startDate.getMonth() + i) % 12) {
            dueDate.setDate(0); // Move to last day of previous month
          }

          installments.push({
            liabilityId: newLiability.id,
            installmentNumber: i,
            dueDate: dueDate.toISOString().split('T')[0],
            expectedAmount: newLiability.emiAmount
          });
        }

        const emiRes = await api.createEmiInstallments(session.user.id, installments);
        if (emiRes.success) {
          // Fetch updated EMI installments to ensure state is synchronized
          const freshEmis = await api.getEmiInstallments(session.user.id);
          setEmiInstallments(freshEmis || []);
        }
      }

      return { success: true, data: newLiability };
    }
    return { success: false, message: 'লগইন করা নেই' };
  };

  const handleDeleteLiability = async (liabilityId) => {
    if (session?.user?.id) {
      const deleted = await api.deleteLiability(session.user.id, liabilityId);
      if (deleted) {
        setLiabilitiesState(prev => prev.filter(l => String(l.id) !== String(liabilityId)));
      }
    }
  };

  const handleRecordLiabilityPayment = async (paymentData) => {
    if (session?.user?.id) {
      const res = await api.rpcRecordLiabilityPayment(paymentData);
      if (res && res.success !== false) {
        const [liabRes, liabPaysRes, expRes] = await Promise.all([
          api.getLiabilities(session.user.id),
          api.getLiabilityPayments(session.user.id),
          api.getExpenses(session.user.id)
        ]);
        if (liabRes) setLiabilitiesState(liabRes);
        if (liabPaysRes) setLiabilityPaymentsState(liabPaysRes);
        if (expRes) setExpensesState(expRes);
      }
      return res;
    }
    return { success: false, message: 'লগইন করা নেই' };
  };

  // Dynamic Financial Calculations
  const salarySum = incomes.filter(i => i.source.includes('Salary')).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const newIncomeSum = incomes.filter(i => !i.source.includes('Salary')).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const updatedAppData = {
    ...appData,
    currentIncome: salarySum,
    newIncome: newIncomeSum,
    incomes: incomes,
    expenses: expenses,
    tasks: tasks,
    leads: leads,
    services: services,
    planData: planData,
    crmPayments: crmPayments,
    tuitionPayments: tuitionPayments,
    tuitionStudents: tuitionStudents,
    customerDues: customerDues,
    duePayments: duePayments,
    liabilities: liabilities,
    liabilityPayments: liabilityPayments,
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

  // 1. Auth Guard: Unauthenticated user gets Public Landing Page or Auth screen
  if (!session) {
    if (publicView === 'landing') {
      return (
        <LandingPage
          onNavigateToAuth={(mode) => setPublicView(mode === 'signup' ? 'auth_signup' : 'auth_login')}
        />
      );
    }
    return (
      <Auth
        initialSignUp={publicView === 'auth_signup'}
        onBackToLanding={() => setPublicView('landing')}
      />
    );
  }

  // 2. Subscription Guard: Unsubscribed non-admin user gets SubscriptionModal
  if (!loadingSub && !isSubscribed(subscription, isAdmin) && activeTab !== 'admin') {
    return (
      <SubscriptionModal
        subscription={subscription}
        paymentRequests={paymentRequests}
        onSubmitPayment={handleSubmitPayment}
        user={session.user}
        onLogout={handleLogout}
        selectedPlanId={localStorage.getItem('dremoy_selected_plan')}
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
        isAdmin={isAdmin}
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
          <Dashboard 
            data={updatedAppData} 
            setActiveTab={setActiveTab}
            onRecordLiabilityPayment={handleRecordLiabilityPayment}
          />
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
            onDeletePayment={handleDeleteTuitionPayment}
            currency={appData.currency}
          />
        )}

        {activeTab === 'dues' && (
          <CustomerDues
            dues={customerDues}
            duePayments={duePayments}
            crmClients={leads}
            onAddDue={handleAddCustomerDue}
            onUpdateDue={handleUpdateCustomerDue}
            onDeleteDue={handleDeleteCustomerDue}
            onRecordPayment={handleRecordCustomerDuePayment}
          />
        )}

        {activeTab === 'liabilities' && (
          <Liabilities
            liabilities={liabilities}
            setLiabilities={setLiabilitiesState}
            liabilityPayments={liabilityPayments}
            emiInstallments={emiInstallments}
            onCreateLiability={handleCreateLiability}
            onDeleteLiability={handleDeleteLiability}
            onRecordPayment={handleRecordLiabilityPayment}
            onRecordEmiPayment={async (paymentData) => {
              if (!session?.user?.id) return { success: false, message: 'Not logged in' };
              const res = await api.rpcRecordEmiPayment(paymentData);
              if (res && res.success) {
                // Refresh data
                const [liabRes, liabPaysRes, emiRes] = await Promise.all([
                  api.getLiabilities(session.user.id),
                  api.getLiabilityPayments(session.user.id),
                  api.getEmiInstallments(session.user.id)
                ]);
                setLiabilitiesState(liabRes || []);
                setLiabilityPaymentsState(liabPaysRes || []);
                setEmiInstallments(emiRes || []);
              }
              return res;
            }}
          />
        )}

        {activeTab === 'crm' && (
          <Crm 
            leads={leads} 
            setLeads={handleSetLeads} 
            crmPayments={crmPayments}
            customerDues={customerDues}
            duePayments={duePayments}
            onRecordPayment={handleRecordCrmPayment}
            onNavigateToDues={() => setActiveTab('dues')}
            onRecordIncome={(incomeItem) => {
              handleSetIncomes(prev => [incomeItem, ...prev]);
            }}
          />
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
            appData={appData}
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

      {/* Global Toast Error & Notification System */}
      <Toast
        message={globalError}
        type="error"
        onClose={() => setGlobalError(null)}
      />
    </div>
  );
}
