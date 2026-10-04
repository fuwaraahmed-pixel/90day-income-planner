import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Plan, { TEMPLATES } from './components/Plan';
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
import FeatureLockCard from './components/ui/FeatureLockCard';
import { isFeatureAllowed } from './utils/planPermissions';


import { supabase, isSupabaseConfigured } from './lib/supabase';
import * as api from './lib/supabaseService';
import { loadData, saveData, removeData, STORAGE_KEYS } from './utils/storage';
import { RefreshCw, AlertCircle, CloudOff } from 'lucide-react';

import Toast from './components/ui/Toast';
import SyncStatusPill from './components/ui/SyncStatusPill';
import { useSyncStore, withSync, resetSyncState, getSyncState, isFailedResult } from './store/syncStore';
import { isSubscribed, hasActiveTrial } from './utils/subscriptionHelper';
import { Sparkles, Crown, Clock } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [publicView, setPublicView] = useState('landing'); // 'landing' | 'auth_login' | 'auth_signup'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  // Sync State
  const syncStatus = useSyncStore();
  const loadUserDataRef = useRef(null);
  const prevUserIdRef = useRef(null);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (getSyncState().hasUnsavedFailure) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

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
  const tasksRef = useRef(tasks);
  useEffect(() => { tasksRef.current = tasks; }, [tasks]);
  const [leads, setLeadsState] = useState([]);
  const leadsRef = useRef(leads);
  useEffect(() => { leadsRef.current = leads; }, [leads]);
  const [incomes, setIncomesState] = useState([]);
  const incomesRef = useRef(incomes);
  useEffect(() => { incomesRef.current = incomes; }, [incomes]);
  const [expenses, setExpensesState] = useState([]);
  const expensesRef = useRef(expenses);
  useEffect(() => { expensesRef.current = expenses; }, [expenses]);
  const [reviews, setReviewsState] = useState([]);
  const reviewsRef = useRef(reviews);
  useEffect(() => { reviewsRef.current = reviews; }, [reviews]);
  const [services, setServicesState] = useState(defaultServices);
  const servicesRef = useRef(services);
  useEffect(() => { servicesRef.current = services; }, [services]);
  const [planData, setPlanDataState] = useState(null);
  const [tuitionStudents, setTuitionStudents] = useState([]);
  const [tuitionPayments, setTuitionPayments] = useState([]);
  const [crmPayments, setCrmPayments] = useState([]);
  const [customerDues, setCustomerDuesState] = useState(() => loadData(STORAGE_KEYS.CUSTOMER_DUES, defaultCustomerDues));
  const customerDuesRef = useRef(customerDues);
  useEffect(() => { customerDuesRef.current = customerDues; }, [customerDues]);

  const [duePayments, setDuePaymentsState] = useState(() => loadData(STORAGE_KEYS.DUE_PAYMENTS, defaultDuePayments));
  const duePaymentsRef = useRef(duePayments);
  useEffect(() => { duePaymentsRef.current = duePayments; }, [duePayments]);

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
      if (session?.user?.id) {
        prevUserIdRef.current = session.user.id;
      }
      setSession(session);
      setAuthChecking(false);
    }).catch(err => {
      console.error('Session get error:', err);
      setAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_OUT') {
        resetSyncState();
        prevUserIdRef.current = null;
      } else if (session?.user?.id && prevUserIdRef.current && session.user.id !== prevUserIdRef.current) {
        resetSyncState();
        prevUserIdRef.current = session.user.id;
      } else if (session?.user?.id) {
        prevUserIdRef.current = session.user.id;
      }
      
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
        const pAll = Promise.all([
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
        const isFailure = (resList) => {
            const [
              adminRes, subRes, payReqRes, settingsRes, tasksRes, leadsRes, incomesRes,
              expensesRes, reviewsRes, servicesRes, planRes, tuitionStsRes, tuitionPaysRes,
              crmPaysRes, duesRes, duePaysRes, liabRes, liabPaysRes, emiInstallmentsRes
            ] = resList;
            const dataFetches = [
              tasksRes, leadsRes, incomesRes, expensesRes, reviewsRes, servicesRes,
              tuitionStsRes, tuitionPaysRes, crmPaysRes, duesRes, duePaysRes,
              liabRes, liabPaysRes, emiInstallmentsRes
            ];
            return dataFetches.some(res => res === null || res === false);
          };
          const results = await withSync(pAll, { isLoadUserData: true, isFailure });
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
        ] = results;

        if (!isMounted) return;

        setIsAdmin(Boolean(adminRes));
        setSubscription(subRes);
        if (payReqRes !== null) setPaymentRequests(payReqRes);
        setLoadingSub(false);

        if (settingsRes !== null) setAppDataState(settingsRes);
        if (tasksRes !== null) setTasksState(tasksRes);
        if (leadsRes !== null) setLeadsState(leadsRes);
        if (incomesRes !== null) setIncomesState(incomesRes);
        if (expensesRes !== null) setExpensesState(expensesRes);
        if (reviewsRes !== null) setReviewsState(reviewsRes);
        if (servicesRes !== null) setServicesState(servicesRes.length > 0 ? servicesRes : defaultServices);
        if (planRes !== null) setPlanDataState(planRes);
        if (tuitionStsRes !== null) setTuitionStudents(tuitionStsRes);
        if (tuitionPaysRes !== null) setTuitionPayments(tuitionPaysRes);
        if (crmPaysRes !== null) setCrmPayments(crmPaysRes);
        if (duesRes !== null) setCustomerDuesState(duesRes);
        if (duePaysRes !== null) setDuePaymentsState(duePaysRes);
        if (liabRes !== null) setLiabilitiesState(liabRes);
        if (liabPaysRes !== null) setLiabilityPaymentsState(liabPaysRes);
        if (emiInstallmentsRes !== null) setEmiInstallments(emiInstallmentsRes);

        const hasError = [
          payReqRes, settingsRes, tasksRes, leadsRes, incomesRes, expensesRes, reviewsRes, 
          servicesRes, planRes, tuitionStsRes, tuitionPaysRes, crmPaysRes, 
          duesRes, duePaysRes, liabRes, liabPaysRes, emiInstallmentsRes
        ].some(res => res === null);
        
        if (hasError) {
          setGlobalError('নেটওয়ার্ক সমস্যার কারণে কিছু ডেটা লোড করা সম্ভব হয়নি — সর্বশেষ সেভ করা ডেটা দেখানো হচ্ছে।');
        }

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

    loadUserDataRef.current = loadUserData;
    loadUserData();

    return () => { isMounted = false; };
  }, [session?.user?.id]);


  // Auth Logout Action
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout error");
      setGlobalError('লগআউট করতে সমস্যা হয়েছে, তবে আপনার তথ্য মুছে ফেলা হয়েছে।');
    } finally {
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
      setCrmPayments([]);
      setCustomerDuesState([]);
      setDuePaymentsState([]);
      setActiveTab('dashboard');
      removeData(STORAGE_KEYS.CUSTOMER_DUES);
      removeData(STORAGE_KEYS.DUE_PAYMENTS);
    }
  };

  // Submit Payment Request Handler
  const handleSubmitPayment = async (details) => {
    if (!session?.user?.id) return { success: false, message: 'ইউজার লগইন করা নেই' };
    const res = await withSync(api.submitPaymentRequest(session.user.id, session.user.email, details));
    if (res && res.success) {
      const [subRes, payReqRes] = await withSync(
        Promise.all([
          api.getSubscription(session.user.id),
          api.getPaymentRequests(session.user.id)
        ]),
        {
          isFailure: (resList) => {
            const [s, p] = resList;
            return p === null || p === false;
          }
        }
      );
      setSubscription(subRes);
      if (payReqRes !== null) setPaymentRequests(payReqRes);
    }
    return res;
  };

  // Start Free Trial Handler
  const handleStartTrial = async () => {
    if (!session?.user?.id) return { success: false, message: 'ইউজার লগইন করা নেই' };
    const res = await withSync(api.rpcStartSelfServiceTrial());
    if (res && res.success) {
      const subRes = await api.getSubscription(session.user.id);
      setSubscription(subRes);
    }
    return res;
  };


  // State Mutators with Supabase Sync
  const handleSetAppData = (newSettings) => {
    setAppDataState(newSettings);
    if (session?.user?.id) {
      withSync(api.updateSettings(session.user.id, newSettings), { isOptimistic: true });
    }
  };

  const handleSetTasks = (newTasksOrFn) => {
    setTasksState(prev => {
      const nextTasks = typeof newTasksOrFn === 'function' ? newTasksOrFn(prev) : newTasksOrFn;
      if (session?.user?.id) {
        if (nextTasks.length > prev.length) {
          const added = nextTasks.find(t => !prev.some(p => p.id === t.id));
          if (added) withSync(api.createTask(session.user.id, added), { isOptimistic: true });
        } else if (nextTasks.length < prev.length) {
          const deleted = prev.find(p => !nextTasks.some(t => t.id === p.id));
          if (deleted) withSync(api.deleteTask(session.user.id, deleted.id), { isOptimistic: true });
        } else {
          nextTasks.forEach(t => {
            const old = prev.find(p => p.id === t.id);
            if (old && old.status !== t.status) {
              withSync(api.updateTaskStatus(session.user.id, t.id, t.status), { isOptimistic: true });
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
          if (added) withSync(api.createCRMClient(session.user.id, added), { isOptimistic: true });
        } else if (nextLeads.length < prev.length) {
          const deleted = prev.find(p => !nextLeads.some(l => l.id === p.id));
          if (deleted) withSync(api.deleteCRMClient(session.user.id, deleted.id), { isOptimistic: true });
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
          if (added) withSync(api.createIncome(session.user.id, added), { isOptimistic: true });
        } else if (nextIncomes.length < prev.length) {
          const deleted = prev.find(p => !nextIncomes.some(i => i.id === p.id));
          if (deleted) withSync(api.deleteIncome(session.user.id, deleted.id), { isOptimistic: true });
        } else {
          nextIncomes.forEach(i => {
            const old = prev.find(p => p.id === i.id);
            if (old && (old.amount !== i.amount || old.source !== i.source || old.clientDetails !== i.clientDetails || old.date !== i.date || old.paymentType !== i.paymentType || old.notes !== i.notes || old.month !== i.month)) {
              withSync(api.updateIncome(session.user.id, i.id, i), { isOptimistic: true });
            }
          });
        }
      }
      return nextIncomes;
    });
  };

  const incomeActions = {
    add: async (payload) => {
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, সংরক্ষণ করা যায়নি।');
        return false;
      }
      if (!session?.user?.id) return false;
      
      const pendingItem = { ...payload, _pending: true };
      setIncomesState(prev => [pendingItem, ...prev]);
      
      try {
        const res = await withSync(api.createIncome(session.user.id, payload), { isOptimistic: false });
        if (isFailedResult(res)) throw new Error();
        
        setIncomesState(prev => prev.map(i => i.id === payload.id ? { ...i, id: res.id, _pending: false } : i));
        return true;
      } catch (err) {
        setIncomesState(prev => {
          const exists = prev.some(i => i.id === payload.id);
          if (!exists) return prev;
          return prev.filter(i => i.id !== payload.id);
        });
        setGlobalError(`"${payload.clientDetails}" সেভ করা যায়নি।`);
        return false;
      }
    },
    update: async (payload) => {
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, সংরক্ষণ করা যায়নি।');
        return false;
      }
      if (!session?.user?.id) return false;
      
      const originalItem = incomesRef.current.find(i => i.id === payload.id);
      
      setIncomesState(prev => prev.map(i => i.id === payload.id ? payload : i));
      
      try {
        const res = await withSync(api.updateIncome(session.user.id, payload.id, payload), { isOptimistic: false });
        if (isFailedResult(res)) throw new Error();
        return true;
      } catch (err) {
        if (originalItem) {
          setIncomesState(prev => prev.map(i => i.id === payload.id ? originalItem : i));
        }
        setGlobalError('আপডেট ব্যর্থ হয়েছে।');
        return false;
      }
    },
    remove: async (id) => {
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, মুছে ফেলা যায়নি।');
        return false;
      }
      if (!session?.user?.id) return false;
      
      const index = incomesRef.current.findIndex(i => i.id === id);
      const originalItem = index !== -1 ? incomesRef.current[index] : null;
      
      setIncomesState(prev => prev.filter(i => i.id !== id));
      
      try {
        const res = await withSync(api.deleteIncome(session.user.id, id), { isOptimistic: false });
        if (isFailedResult(res)) throw new Error();
        return true;
      } catch (err) {
        if (originalItem) {
          setIncomesState(prev => {
            const next = [...prev];
            next.splice(index, 0, originalItem);
            return next;
          });
        }
        setGlobalError('মুছে ফেলা যায়নি।');
        return false;
      }
    }
  };

  const expenseActions = {
    add: async (payload) => {
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, সংরক্ষণ করা যায়নি।');
        return false;
      }
      if (!session?.user?.id) return false;
      
      const tempId = Date.now();
      const pendingItem = { ...payload, id: tempId, _pending: true };
      setExpensesState(prev => [pendingItem, ...prev]);
      
      const { id, _pending, ...apiPayload } = payload;
      
      try {
        const res = await withSync(api.createExpense(session.user.id, apiPayload), { isOptimistic: false });
        if (isFailedResult(res) || !res.id) throw new Error();
        
        setExpensesState(prev => prev.map(e => {
          if (e.id === tempId) {
            const { _pending: pendingFlag, ...rest } = e;
            return { ...rest, id: res.id };
          }
          return e;
        }));
        return true;
      } catch (err) {
        setExpensesState(prev => {
          const exists = prev.some(e => e.id === tempId);
          if (!exists) return prev;
          return prev.filter(e => e.id !== tempId);
        });
        setGlobalError(`"${payload.description}" সেভ করা যায়নি।`);
        return false;
      }
    },
    update: async (payload) => {
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, সংরক্ষণ করা যায়নি।');
        return false;
      }
      if (!session?.user?.id) return false;
      
      const originalItem = expensesRef.current.find(e => e.id === payload.id);
      if (!originalItem) return false;
      if (originalItem._pending) return false;
      
      const { _pending, ...apiPayload } = payload;
      setExpensesState(prev => prev.map(e => e.id === payload.id ? { ...payload, _pending: true } : e));
      
      try {
        const res = await withSync(api.updateExpense(session.user.id, payload.id, apiPayload), { isOptimistic: false });
        if (isFailedResult(res)) throw new Error();
        
        setExpensesState(prev => prev.map(e => {
          if (e.id === payload.id) {
            const { _pending: pendingFlag, ...rest } = e;
            return rest;
          }
          return e;
        }));
        return true;
      } catch (err) {
        setExpensesState(prev => prev.map(e => e.id === payload.id ? originalItem : e));
        setGlobalError('আপডেট ব্যর্থ হয়েছে।');
        return false;
      }
    },
    remove: async (id) => {
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, মুছে ফেলা যায়নি।');
        return false;
      }
      if (!session?.user?.id) return false;
      
      const index = expensesRef.current.findIndex(e => e.id === id);
      if (index === -1) return false;
      
      const originalItem = expensesRef.current[index];
      if (originalItem._pending) return false;
      
      setExpensesState(prev => prev.filter(e => e.id !== id));
      
      try {
        const res = await withSync(api.deleteExpense(session.user.id, id), { isOptimistic: false });
        if (isFailedResult(res)) throw new Error();
        return true;
      } catch (err) {
        setExpensesState(prev => {
          if (prev.some(e => e.id === originalItem.id)) return prev;
          const next = [...prev];
          const insertIndex = Math.min(index, next.length);
          next.splice(insertIndex, 0, originalItem);
          return next;
        });
        setGlobalError('মুছে ফেলা যায়নি।');
        return false;
      }
    }
  };

  const taskActions = {
    add: async (task) => {
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, সংরক্ষণ করা যায়নি।');
        return false;
      }
      if (!session?.user?.id) return false;
      
      const tempId = Date.now();
      const pendingItem = { ...task, id: tempId, _pending: true };
      setTasksState(prev => [pendingItem, ...prev]);
      
      const { id, _pending, ...apiPayload } = task;
      
      try {
        const res = await withSync(api.createTask(session.user.id, apiPayload), { isOptimistic: false });
        if (isFailedResult(res) || !res.id) throw new Error();
        
        setTasksState(prev => prev.map(t => {
          if (t.id === tempId) {
            const { _pending: pendingFlag, ...rest } = t;
            return { ...rest, id: res.id };
          }
          return t;
        }));
        return true;
      } catch (err) {
        setTasksState(prev => {
          const exists = prev.some(t => t.id === tempId);
          if (!exists) return prev;
          return prev.filter(t => t.id !== tempId);
        });
        setGlobalError(`"${task.name}" সেভ করা যায়নি।`);
        return false;
      }
    },
    updateStatus: async (taskId, newStatus) => {
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, সংরক্ষণ করা যায়নি।');
        return false;
      }
      if (!session?.user?.id) return false;
      
      const originalItem = tasksRef.current.find(t => t.id === taskId);
      if (!originalItem) return false;
      if (originalItem._pending) return false;
      
      setTasksState(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus, _pending: true } : t));
      
      try {
        const res = await withSync(api.updateTaskStatus(session.user.id, taskId, newStatus), { isOptimistic: false });
        if (isFailedResult(res)) throw new Error();
        
        setTasksState(prev => prev.map(t => {
          if (t.id === taskId) {
            const { _pending: pendingFlag, ...rest } = t;
            return rest;
          }
          return t;
        }));
        return true;
      } catch (err) {
        setTasksState(prev => prev.map(t => t.id === taskId ? originalItem : t));
        setGlobalError('আপডেট ব্যর্থ হয়েছে।');
        return false;
      }
    },
    remove: async (taskId) => {
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, মুছে ফেলা যায়নি।');
        return false;
      }
      if (!session?.user?.id) return false;
      
      const index = tasksRef.current.findIndex(t => t.id === taskId);
      if (index === -1) return false;
      
      const originalItem = tasksRef.current[index];
      if (originalItem._pending) return false;
      
      setTasksState(prev => prev.filter(t => t.id !== taskId));
      
      try {
        const res = await withSync(api.deleteTask(session.user.id, taskId), { isOptimistic: false });
        if (isFailedResult(res)) throw new Error();
        return true;
      } catch (err) {
        setTasksState(prev => {
          if (prev.some(t => t.id === originalItem.id)) return prev;
          const next = [...prev];
          const insertIndex = Math.min(index, next.length);
          next.splice(insertIndex, 0, originalItem);
          return next;
        });
        setGlobalError('মুছে ফেলা যায়নি।');
        return false;
      }
    }
  };

  const leadActions = {
    add: async (lead) => {
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, সংরক্ষণ করা যায়নি।');
        return false;
      }
      if (!session?.user?.id) return false;
      
      const tempId = Date.now();
      const pendingItem = { ...lead, id: tempId, _pending: true };
      setLeadsState(prev => [pendingItem, ...prev]);
      
      const { id, _pending, ...apiPayload } = lead;
      
      try {
        const res = await withSync(api.createCRMClient(session.user.id, apiPayload), { isOptimistic: false });
        if (isFailedResult(res) || !res.id) throw new Error();
        
        setLeadsState(prev => {
          if (prev.some(l => l.id === res.id)) {
            return prev.filter(l => l.id !== tempId);
          }
          return prev.map(l => {
            if (l.id === tempId) {
              const { _pending: pendingFlag, ...rest } = l;
              return { ...rest, id: res.id };
            }
            return l;
          });
        });
        return true;
      } catch (err) {
        setLeadsState(prev => {
          const exists = prev.some(l => l.id === tempId);
          if (!exists) return prev;
          return prev.filter(l => l.id !== tempId);
        });
        setGlobalError(`"${lead.clientName}" সেভ করা যায়নি।`);
        return false;
      }
    },
    remove: async (leadId) => {
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, মুছে ফেলা যায়নি।');
        return false;
      }
      if (!session?.user?.id) return false;
      
      const index = leadsRef.current.findIndex(l => l.id === leadId);
      if (index === -1) return false;
      
      const originalItem = leadsRef.current[index];
      if (originalItem._pending) return false;
      
      setLeadsState(prev => prev.filter(l => l.id !== leadId));
      
      try {
        const res = await withSync(api.deleteCRMClient(session.user.id, leadId), { isOptimistic: false });
        if (isFailedResult(res)) throw new Error();
        return true;
      } catch (err) {
        setLeadsState(prev => {
          if (prev.some(l => l.id === originalItem.id)) return prev;
          const next = [...prev];
          const insertIndex = Math.min(index, next.length);
          next.splice(insertIndex, 0, originalItem);
          return next;
        });
        setGlobalError('মুছে ফেলা যায়নি।');
        return false;
      }
    }
  };

  const reviewActions = {
    add: async (review) => {
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, সংরক্ষণ করা যায়নি।');
        return false;
      }
      if (!session?.user?.id) return false;
      
      const tempId = Date.now();
      const pendingItem = { ...review, id: tempId, _pending: true };
      setReviewsState(prev => [pendingItem, ...prev]);
      
      const { id, _pending, ...apiPayload } = review;
      
      try {
        const res = await withSync(api.createWeeklyReview(session.user.id, apiPayload), { isOptimistic: false });
        if (isFailedResult(res) || !res.id) throw new Error();
        
        setReviewsState(prev => {
          if (prev.some(r => r.id === res.id)) {
            return prev.filter(r => r.id !== tempId);
          }
          return prev.map(r => {
            if (r.id === tempId) {
              const { _pending: pendingFlag, ...rest } = r;
              return { ...rest, id: res.id };
            }
            return r;
          });
        });
        return true;
      } catch (err) {
        setReviewsState(prev => {
          const exists = prev.some(r => r.id === tempId);
          if (!exists) return prev;
          return prev.filter(r => r.id !== tempId);
        });
        setGlobalError(`রিভিউ সেভ করা যায়নি।`);
        return false;
      }
    },
    remove: async (reviewId) => {
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, মুছে ফেলা যায়নি।');
        return false;
      }
      if (!session?.user?.id) return false;
      
      const index = reviewsRef.current.findIndex(r => r.id === reviewId);
      if (index === -1) return false;
      
      const originalItem = reviewsRef.current[index];
      if (originalItem._pending) return false;
      
      setReviewsState(prev => prev.filter(r => r.id !== reviewId));
      
      try {
        const res = await withSync(api.deleteWeeklyReview(session.user.id, reviewId), { isOptimistic: false });
        if (isFailedResult(res) || res === false) throw new Error();
        return true;
      } catch (err) {
        setReviewsState(prev => {
          if (prev.some(r => r.id === originalItem.id)) return prev;
          const next = [...prev];
          const insertIndex = Math.min(index, next.length);
          next.splice(insertIndex, 0, originalItem);
          return next;
        });
        setGlobalError('মুছে ফেলা যায়নি।');
        return false;
      }
    }
  };

  const serviceActions = {
    add: async (service) => {
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, সংরক্ষণ করা যায়নি।');
        return false;
      }
      if (!session?.user?.id) return false;
      
      const tempId = Date.now();
      const pendingItem = { ...service, id: tempId, _pending: true };
      setServicesState(prev => [...prev, pendingItem]);
      
      const { id, _pending, ...apiPayload } = service;
      
      try {
        const res = await withSync(api.createService(session.user.id, apiPayload), { isOptimistic: false });
        if (isFailedResult(res) || !res.id) throw new Error();
        
        setServicesState(prev => {
          if (prev.some(s => s.id === res.id)) {
            return prev.filter(s => s.id !== tempId);
          }
          return prev.map(s => {
            if (s.id === tempId) {
              const { _pending: pendingFlag, ...rest } = s;
              return { ...rest, id: res.id };
            }
            return s;
          });
        });
        return true;
      } catch (err) {
        setServicesState(prev => {
          const exists = prev.some(s => s.id === tempId);
          if (!exists) return prev;
          return prev.filter(s => s.id !== tempId);
        });
        setGlobalError(`সার্ভিস সেভ করা যায়নি।`);
        return false;
      }
    },
    remove: async (serviceId) => {
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, মুছে ফেলা যায়নি।');
        return false;
      }
      if (!session?.user?.id) return false;
      
      const index = servicesRef.current.findIndex(s => s.id === serviceId);
      if (index === -1) return false;
      
      const originalItem = servicesRef.current[index];
      if (originalItem._pending) return false;
      
      setServicesState(prev => prev.filter(s => s.id !== serviceId));
      
      try {
        const res = await withSync(api.deleteService(session.user.id, serviceId), { isOptimistic: false });
        if (isFailedResult(res) || res === false) throw new Error();
        return true;
      } catch (err) {
        setServicesState(prev => {
          if (prev.some(s => s.id === originalItem.id)) return prev;
          const next = [...prev];
          const insertIndex = Math.min(index, next.length);
          next.splice(insertIndex, 0, originalItem);
          return next;
        });
        setGlobalError('মুছে ফেলা যায়নি।');
        return false;
      }
    }
  };

  const handleSetExpenses = (newExpensesOrFn) => {
    setExpensesState(prev => {
      const nextExpenses = typeof newExpensesOrFn === 'function' ? newExpensesOrFn(prev) : newExpensesOrFn;
      if (session?.user?.id) {
        if (nextExpenses.length > prev.length) {
          const added = nextExpenses.find(e => !prev.some(p => p.id === e.id));
          if (added) withSync(api.createExpense(session.user.id, added), { isOptimistic: true });
        } else if (nextExpenses.length < prev.length) {
          const deleted = prev.find(p => !nextExpenses.some(e => e.id === p.id));
          if (deleted) withSync(api.deleteExpense(session.user.id, deleted.id), { isOptimistic: true });
        } else {
          nextExpenses.forEach(e => {
            const old = prev.find(p => p.id === e.id);
            if (old && (old.amount !== e.amount || old.category !== e.category || old.description !== e.description || old.date !== e.date || old.notes !== e.notes || old.month !== e.month)) {
              withSync(api.updateExpense(session.user.id, e.id, e), { isOptimistic: true });
            }
          });
        }
      }
      return nextExpenses;
    });
  };

  const planDataRef = useRef(null);
  const lastSavedPlanRef = useRef(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  useEffect(() => {
    planDataRef.current = planData;
    // Initial sync of lastSavedPlanRef when data loads from server
    if (planData !== null && lastSavedPlanRef.current === null) {
      lastSavedPlanRef.current = planData;
    }
  }, [planData]);

  const planActions = {
    update: async (updater) => {
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ বিচ্ছিন্ন।');
        return false;
      }
      if (isSavingPlan) return false;

      const prevPlan = planDataRef.current || TEMPLATES.freelancer.months;
      const nextPlan = typeof updater === 'function' ? updater(prevPlan) : updater;

      setPlanDataState(nextPlan);
      setIsSavingPlan(true);

      try {
        const res = await withSync(api.update90DayPlan(session.user.id, nextPlan), { isOptimistic: false });
        if (isFailedResult(res) || res === false) throw new Error();
        lastSavedPlanRef.current = nextPlan;
        return true;
      } catch (err) {
        setPlanDataState(lastSavedPlanRef.current);
        setGlobalError('সেভ করা যায়নি।');
        return false;
      } finally {
        setIsSavingPlan(false);
      }
    }
  };

  // Trigger Safe Migration Action
  const handleMigrate = async () => {
    if (!session?.user?.id) return { success: false, message: 'ইউজার লগইন করা নেই' };
    setIsMigrating(true);
    const res = await api.migrateLocalStorageToSupabase(session.user.id);
    
    if (res.success) {
      const pAll = withSync(Promise.all([api.getTasks(session.user.id),
        api.getCRMClients(session.user.id),
        api.getIncome(session.user.id),
        api.getExpenses(session.user.id),
        api.getWeeklyReviews(session.user.id),
        api.getServices(session.user.id),
        api.get90DayPlan(session.user.id),
        api.getSettings(session.user.id)
      ]));
      const [t, l, inc, exp, rev, srv, pl, setts] = await withSync(pAll, { isLoadUserData: true });
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

  // --- Tuition Optimistic UI Helpers & Actions ---
  const activeTuitionTempIdsRef = useRef(new Set());
  const tuitionLocksRef = useRef(new Set());
  const tuitionRefetchSeqRef = useRef(0);
  
  const tuitionStudentsRef = useRef(tuitionStudents);
  const tuitionPaymentsRef = useRef(tuitionPayments);
  const tuitionIncomesStateRef = useRef(incomes);
  const sessionRef = useRef(session);

  useEffect(() => { tuitionStudentsRef.current = tuitionStudents; }, [tuitionStudents]);
  useEffect(() => { tuitionPaymentsRef.current = tuitionPayments; }, [tuitionPayments]);
  useEffect(() => { tuitionIncomesStateRef.current = incomes; }, [incomes]);
  useEffect(() => { sessionRef.current = session; }, [session]);

  const makeTuitionTempId = () => `temp-tuition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const isTuitionTempId = (id) => typeof id === 'string' && id.startsWith('temp-tuition-');
  const stripTuitionPending = (obj) => {
    const { id, _pending, ...rest } = obj;
    return isTuitionTempId(id) ? rest : { ...rest, id };
  };

  const acquireTuitionLock = (key) => {
    if (tuitionLocksRef.current.has(key)) return false;
    tuitionLocksRef.current.add(key);
    return true;
  };
  const releaseTuitionLock = (key) => tuitionLocksRef.current.delete(key);

  const performTuitionSafeMerge = (setState, serverData, isPaymentOrIncome) => {
    setState(prev => {
      const serverIds = new Set(serverData.map(s => String(s.id)));
      const preservedPending = prev.filter(item => 
        item._pending && (
          !isPaymentOrIncome ||
          !isTuitionTempId(item.id) || 
          activeTuitionTempIdsRef.current.has(item.id)
        )
      );
      const filteredPending = preservedPending.filter(item => !serverIds.has(String(item.id)));
      return [...filteredPending, ...serverData];
    });
  };

  const executeTuitionRefetch = async () => {
    const seq = ++tuitionRefetchSeqRef.current;
    try {
      const [paysRes, incsRes] = await withSync(Promise.all([
        api.getTuitionPayments(sessionRef.current.user.id),
        api.getIncome(sessionRef.current.user.id)
      ]));
      if (seq !== tuitionRefetchSeqRef.current) return true;

      if (paysRes !== null && paysRes !== false && incsRes !== null && incsRes !== false) {
        performTuitionSafeMerge(setTuitionPayments, paysRes, true);
        performTuitionSafeMerge(setIncomesState, incsRes, true);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const handleTuitionRefetchWithRetry = async (tempIdsToDeactivate) => {
    tempIdsToDeactivate.forEach(id => activeTuitionTempIdsRef.current.delete(id));
    
    let success = await executeTuitionRefetch();
    if (!success) {
      await new Promise(r => setTimeout(r, 1500));
      success = await executeTuitionRefetch();
    }
    return success;
  };

  const tuitionStudentActions = {
    add: async (studentData) => {
      if (!sessionRef.current?.user?.id) {
        await handleAddTuitionStudent(studentData);
        return true;
      }
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, সংরক্ষণ করা যায়নি।');
        return false;
      }
      const lockKey = 'student:add';
      if (!acquireTuitionLock(lockKey)) return false;

      const tempId = makeTuitionTempId();
      try {
        const pendingItem = { ...studentData, id: tempId, _pending: true };
        setTuitionStudents(prev => [pendingItem, ...prev]);

        const apiPayload = stripTuitionPending(pendingItem);
        const res = await withSync(api.addTuitionStudent(sessionRef.current.user.id, apiPayload), { isOptimistic: false });
        
        if (isFailedResult(res) || !res?.id) throw new Error();

        setTuitionStudents(prev => prev.map(s => {
          if (String(s.id) === String(tempId)) {
            const { _pending, ...rest } = res;
            return rest;
          }
          return s;
        }));
        return true;
      } catch (err) {
        setTuitionStudents(prev => prev.filter(s => String(s.id) !== String(tempId)));
        setGlobalError('সংরক্ষণ করা যায়নি।');
        return false;
      } finally {
        releaseTuitionLock(lockKey);
      }
    },
    update: async (studentId, changes) => {
      if (!sessionRef.current?.user?.id) {
        await handleUpdateTuitionStudent(studentId, changes);
        return true;
      }
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, সংরক্ষণ করা যায়নি।');
        return false;
      }
      if (isTuitionTempId(studentId)) return false;

      const lockKey = `student:update:${studentId}`;
      if (!acquireTuitionLock(lockKey)) return false;

      const prevRecord = tuitionStudentsRef.current.find(s => String(s.id) === String(studentId));
      if (!prevRecord || prevRecord._pending) {
        releaseTuitionLock(lockKey);
        return false;
      }

      try {
        setTuitionStudents(prev => prev.map(s => String(s.id) === String(studentId) ? { ...s, ...changes, _pending: true } : s));
        const apiPayload = { ...changes };
        delete apiPayload._pending;
        const res = await withSync(api.updateTuitionStudent(studentId, apiPayload), { isOptimistic: false });
        
        if (isFailedResult(res)) throw new Error();
        
        setTuitionStudents(prev => prev.map(s => {
          if (String(s.id) === String(studentId)) {
            if (res?.id) {
              const { _pending, ...rest } = res;
              return rest;
            } else {
              const { _pending, ...rest } = { ...s, ...changes };
              return rest;
            }
          }
          return s;
        }));
        return true;
      } catch (err) {
        setTuitionStudents(prev => prev.map(s => String(s.id) === String(studentId) ? prevRecord : s));
        setGlobalError('আপডেট ব্যর্থ হয়েছে।');
        return false;
      } finally {
        releaseTuitionLock(lockKey);
      }
    }
  };

  const tuitionPaymentActions = {
    add: async (paymentDataArray) => {
      if (!sessionRef.current?.user?.id) {
        const res = await handleRecordTuitionPayment(paymentDataArray);
        return res?.success !== false;
      }
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, সংরক্ষণ করা যায়নি।');
        return false;
      }

      const pArr = Array.isArray(paymentDataArray) ? paymentDataArray : [paymentDataArray];
      if (pArr.some(p => isTuitionTempId(p.studentId) || isNaN(Number(p.studentId)))) {
        setGlobalError('স্টুডেন্ট ডাটা এখনো সেভ হচ্ছে, দয়া করে একটু পর আবার চেষ্টা করুন।');
        return false;
      }

      const firstStudentId = pArr[0]?.studentId || 'unknown';
      const lockKey = `payment:add:${firstStudentId}`;
      if (!acquireTuitionLock(lockKey)) return false;

      const tempRecords = [];
      pArr.forEach(pData => {
        const tempPayId = makeTuitionTempId();
        const tempIncId = makeTuitionTempId();
        tempRecords.push({ tempPayId, tempIncId, pData });
      });

      try {
        tempRecords.forEach(r => {
          activeTuitionTempIdsRef.current.add(r.tempPayId);
          activeTuitionTempIdsRef.current.add(r.tempIncId);
        });

        setTuitionPayments(prev => {
          const next = [...prev];
          tempRecords.forEach(r => {
            next.unshift({ ...r.pData, id: r.tempPayId, income_id: null, _pending: true });
          });
          return next;
        });

        setIncomesState(prev => {
          const nextIncomes = [...prev];
          tempRecords.forEach(r => {
             nextIncomes.unshift({
                id: r.tempIncId,
                amount: Number(r.pData.amount),
                date: r.pData.paymentDate || new Date().toISOString().split('T')[0],
                category: 'Tuition',
                description: 'Tuition Payment',
                _pending: true
             });
          });
          return nextIncomes;
        });

        const results = [];
        let i = 0;
        for (const pData of pArr) {
          const r = tempRecords[i];
          try {
            const apiPayload = stripTuitionPending(pData);
            const res = await withSync(api.recordTuitionPayment(apiPayload), { isOptimistic: false });
            if (!isFailedResult(res)) {
              results.push({ ...r, success: true });
            } else {
              results.push({ ...r, success: false });
            }
          } catch (err) {
            results.push({ ...r, success: false });
          }
          i++;
        }

        const successRecords = results.filter(r => r.success);
        const failedRecords = results.filter(r => !r.success);
        const successCount = successRecords.length;
        const failedCount = failedRecords.length;

        // Immediately remove failed temp records
        const failedTempIds = failedRecords.flatMap(r => [r.tempPayId, r.tempIncId]);
        failedTempIds.forEach(id => activeTuitionTempIdsRef.current.delete(id));
        if (failedCount > 0) {
          setTuitionPayments(prev => prev.filter(p => !failedTempIds.includes(p.id)));
          setIncomesState(prev => prev.filter(i => !failedTempIds.includes(i.id)));
        }

        const successTempIds = successRecords.flatMap(r => [r.tempPayId, r.tempIncId]);
        
        let refetchSuccess = true;
        if (successCount > 0) {
          refetchSuccess = await handleTuitionRefetchWithRetry(successTempIds);
        }

        if (failedCount > 0) {
          if (!refetchSuccess && successCount > 0) {
             setGlobalError(`${successCount} টি পেমেন্ট সেভ হয়েছে। বাকি ${failedCount} টি সেভ হয়নি এবং তালিকা রিফ্রেশ করা যায়নি। অনুগ্রহ করে পেজটি রিলোড করে তালিকা চেক করুন।`);
          } else {
             setGlobalError(`${successCount} টি পেমেন্ট সেভ হয়েছে। বাকি ${failedCount} টি সেভ হয়নি, চেক করে পুনরায় চেষ্টা করুন।`);
          }
          return false;
        }

        if (!refetchSuccess) {
          setGlobalError('ডেটা সেভ হয়েছে, কিন্তু তালিকা রিফ্রেশ করা যায়নি। অনুগ্রহ করে পেজটি রিলোড করুন।');
        }
        return true;

      } catch (err) {
        const tempIdsToRemove = tempRecords.flatMap(r => [r.tempPayId, r.tempIncId]);
        tempIdsToRemove.forEach(id => activeTuitionTempIdsRef.current.delete(id));
        setTuitionPayments(prev => prev.filter(p => !tempIdsToRemove.includes(p.id)));
        setIncomesState(prev => prev.filter(i => !tempIdsToRemove.includes(i.id)));
        
        const refetchSuccess = await handleTuitionRefetchWithRetry([]);
        if (!refetchSuccess) {
          setGlobalError('সংরক্ষণ করা যায়নি এবং তালিকা রিফ্রেশ করা যায়নি। অনুগ্রহ করে পেজটি রিলোড করে তালিকা চেক করুন।');
        } else {
          setGlobalError('সংরক্ষণ করা যায়নি। অনুগ্রহ করে তালিকাটি চেক করুন।');
        }
        return false;
      } finally {
        releaseTuitionLock(lockKey);
      }
    },
    remove: async (paymentId) => {
      if (!sessionRef.current?.user?.id) {
        const res = await handleDeleteTuitionPayment(paymentId);
        return res?.success !== false;
      }
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, মুছে ফেলা যায়নি।');
        return false;
      }
      if (isTuitionTempId(paymentId)) return false;

      const lockKey = `payment:remove:${paymentId}`;
      if (!acquireTuitionLock(lockKey)) return false;

      const paymentRecord = tuitionPaymentsRef.current.find(p => String(p.id) === String(paymentId));
      if (!paymentRecord || paymentRecord._pending) {
        releaseTuitionLock(lockKey);
        return false;
      }
      const incomeRecord = paymentRecord.income_id 
        ? tuitionIncomesStateRef.current.find(i => String(i.id) === String(paymentRecord.income_id))
        : null;

      try {
        setTuitionPayments(prev => prev.filter(p => String(p.id) !== String(paymentId)));
        if (incomeRecord) {
          setIncomesState(prev => prev.filter(i => String(i.id) !== String(incomeRecord.id)));
        }

        const res = await withSync(api.deleteTuitionPayment(paymentId, sessionRef.current.user.id), { isOptimistic: false });
        if (!isFailedResult(res)) {
          await handleTuitionRefetchWithRetry([]);
          return true;
        } else {
          throw new Error();
        }
      } catch (err) {
        setTuitionPayments(prev => {
          if (prev.some(p => String(p.id) === String(paymentId))) return prev;
          const next = [paymentRecord, ...prev];
          next.sort((a, b) => new Date(b.paymentDate || 0) - new Date(a.paymentDate || 0));
          return next;
        });
        if (incomeRecord) {
          setIncomesState(prev => {
            if (prev.some(i => String(i.id) === String(incomeRecord.id))) return prev;
            const next = [incomeRecord, ...prev];
            next.sort((a, b) => new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0));
            return next;
          });
        }
        const refetchSuccess = await handleTuitionRefetchWithRetry([]);
        if (!refetchSuccess) {
          setGlobalError('মুছে ফেলা যায়নি এবং তালিকা রিফ্রেশ করা যায়নি। অনুগ্রহ করে পেজটি রিলোড করুন।');
        } else {
          setGlobalError('মুছে ফেলা যায়নি।');
        }
        return false;
      } finally {
        releaseTuitionLock(lockKey);
      }
    }
  };

  // Tuition Handlers
  const handleAddTuitionStudent = async (studentData) => {
    if (session?.user?.id) {
      const added = await withSync(api.addTuitionStudent(session.user.id, studentData));
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
      const updated = await withSync(api.updateTuitionStudent(studentId, studentData));
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
        const results = [];
        for (const pData of paymentData) {
          try {
            const res = await withSync(api.recordTuitionPayment(pData));
            if (res && res.success !== false) {
               results.push({ studentId: pData.studentId, paymentMonth: pData.paymentMonth, success: true });
            } else {
               results.push({ studentId: pData.studentId, paymentMonth: pData.paymentMonth, success: false, error: res?.message });
            }
          } catch (err) {
            results.push({ studentId: pData.studentId, paymentMonth: pData.paymentMonth, success: false, error: err.message });
          }
        }
        
        const successCount = results.filter(r => r.success).length;
        const failedCount = results.length - successCount;
        
        if (successCount > 0) {
          const pAll = withSync(Promise.all([api.getTuitionPayments(session.user.id),
            api.getIncome(session.user.id)
          ]));
          const [paysRes, incsRes] = await withSync(pAll);
          if (paysRes !== null) {
            setTuitionPayments(paysRes);
          } else {
            setGlobalError("Couldn't refresh data — check your connection. Showing last known data.");
          }
          if (incsRes !== null) {
            setIncomesState(incsRes);
          } else {
            setGlobalError("Couldn't refresh data — check your connection. Showing last known data.");
          }
        }
        
        if (failedCount === 0) {
          return { success: true, message: 'All payments successfully recorded' };
        } else if (successCount > 0) {
          const failedIds = results.filter(r => !r.success).map(r => String(r.studentId));
          const successfulMonths = results.filter(r => r.success).map(r => r.paymentMonth);
          const failedNames = tuitionStudents
            .filter(s => failedIds.includes(String(s.id)))
            .map(s => s.studentName);
          const failedText = failedNames.length > 0 ? failedNames.join(', ') : failedIds.join(', ');
          return { success: false, partial: true, message: `${successCount} of ${results.length} payments recorded. Failed: ${failedText} — please retry these.`, successfulMonths };
        } else {
          return { success: false, message: 'All payments failed to record.' };
        }
      } else {
        const mockPays = paymentData.map(pData => ({ id: Date.now() + Math.random(), ...pData }));
        setTuitionPayments(prev => [...mockPays, ...prev]);
        return { success: true };
      }
    }

    if (session?.user?.id) {
      const res = await withSync(api.recordTuitionPayment(paymentData));
      if (res && res.success !== false) {
        // Refresh tuition payments & income list atomically
        const [paysRes, incsRes] = await withSync(Promise.all([api.getTuitionPayments(session.user.id),
          api.getIncome(session.user.id)
        ]));
        if (paysRes !== null) {
          setTuitionPayments(paysRes);
        } else {
          setGlobalError("Couldn't refresh data — check your connection. Showing last known data.");
        }
        if (incsRes !== null) {
          setIncomesState(incsRes);
        } else {
          setGlobalError("Couldn't refresh data — check your connection. Showing last known data.");
        }
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
      const res = await withSync(api.deleteTuitionPayment(paymentId, session.user.id));
      if (res && res.success !== false) {
        const [paysRes, incsRes] = await withSync(Promise.all([api.getTuitionPayments(session.user.id),
          api.getIncome(session.user.id)
        ]));
        if (paysRes !== null) {
          setTuitionPayments(paysRes);
        } else {
          setGlobalError("Couldn't refresh data — check your connection. Showing last known data.");
        }
        if (incsRes !== null) {
          setIncomesState(incsRes);
        } else {
          setGlobalError("Couldn't refresh data — check your connection. Showing last known data.");
        }
      }
      return res;
    } else {
      setTuitionPayments(prev => prev.filter(p => p.id !== paymentId && String(p.id) !== String(paymentId)));
      return { success: true };
    }
  };

  const handleRecordCrmPayment = async (paymentData) => {
    const paymentId = paymentData.paymentId || `pay_${Date.now()}`;
    const amountNum = Number(paymentData.amount);
    const client = leadsRef.current.find(l => String(l.id) === String(paymentData.crmClientId));

    if (session?.user?.id) {
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, পেমেন্ট রেকর্ড করা যায়নি।');
        return { success: false, message: 'No internet' };
      }

      const newPayment = {
        id: paymentId,
        paymentId: paymentId,
        crmClientId: Number(paymentData.crmClientId),
        paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
        amount: amountNum,
        paymentMethod: paymentData.paymentMethod || 'bKash',
        notes: paymentData.notes || '',
        _pending: true
      };

      const newIncome = {
        id: Date.now(),
        date: newPayment.paymentDate,
        source: 'CRM / Service',
        clientDetails: client ? `${client.clientName} (${client.businessName})` : 'CRM Client',
        amount: amountNum,
        paymentType: newPayment.paymentMethod,
        month: 'Month 1',
        notes: newPayment.notes,
        crmPaymentId: paymentId,
        _pending: true
      };

      setCrmPayments(prev => [newPayment, ...prev]);
      setIncomesState(prev => [newIncome, ...prev]);

      if (client) {
        const newAdvance = (Number(client.advance) || 0) + amountNum;
        let newStatus = client.status;
        if (Number(client.quotedPrice) > 0 && newAdvance >= Number(client.quotedPrice)) {
          newStatus = 'Paid';
        } else if (newAdvance > 0 && (client.status === 'New' || client.status === 'Negotiation' || client.status === 'Proposal Sent')) {
          newStatus = 'Advance Paid';
        }
        setLeadsState(prev => prev.map(l => String(l.id) === String(client.id) ? { ...l, advance: newAdvance, status: newStatus, _pending: true } : l));
      }

      try {
        const res = await withSync(api.rpcRecordCrmPayment(paymentData), { isOptimistic: false });
        if (isFailedResult(res) || res?.success === false) {
           throw new Error(res?.message || 'পেমেন্ট রেকর্ড করা যায়নি');
        }

        setCrmPayments(prev => prev.map(p => p.paymentId === paymentId ? { ...p, _pending: false } : p));
        setIncomesState(prev => prev.map(i => i.crmPaymentId === paymentId ? { ...i, _pending: false } : i));
        if (client) {
          setLeadsState(prev => prev.map(l => String(l.id) === String(client.id) ? { ...l, _pending: false } : l));
        }

        api.getCrmPayments(session.user.id).then(crmPaysRes => { if (crmPaysRes) setCrmPayments(crmPaysRes); });
        api.getCRMClients(session.user.id).then(leadsRes => {
          if (leadsRes) {
            setLeadsState(prev => {
              const pendingItems = prev.filter(l => l._pending);
              return pendingItems.length ? [...pendingItems, ...leadsRes] : leadsRes;
            });
          }
        });
        api.getIncome(session.user.id).then(incsRes => { if (incsRes) setIncomesState(incsRes); });

        return res;
      } catch (err) {
        setCrmPayments(prev => prev.filter(p => p.paymentId !== paymentId));
        setIncomesState(prev => prev.filter(i => i.crmPaymentId !== paymentId));
        if (client) {
           setLeadsState(prev => prev.map(l => String(l.id) === String(client.id) ? client : l));
        }
        setGlobalError('পেমেন্ট রেকর্ড করা ব্যর্থ হয়েছে।');
        throw err;
      }
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

    const tempId = Date.now();
    const newDue = {
      id: tempId,
      customerId: dueData.customerId ? Number(dueData.customerId) : null,
      customerName: dueData.customerName,
      description: dueData.description || 'পাওনা বিবরণী',
      totalAmount: total,
      paidAmount: initialPaid,
      dueAmount: Math.max(0, total - initialPaid),
      dueDate: dueData.dueDate || null,
      status: initialPaid >= total && total > 0 ? 'Paid' : initialPaid > 0 ? 'Partially Paid' : 'Unpaid',
      note: dueData.note || '',
      createdAt: new Date().toISOString(),
      _pending: true
    };

    if (session?.user?.id) {
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, সংরক্ষণ করা যায়নি।');
        throw new Error('No internet');
      }

      setCustomerDuesState(prev => [newDue, ...prev]);

      try {
        const res = await withSync(api.createCustomerDue(session.user.id, dueData), { isOptimistic: false });
        if (isFailedResult(res) || !res.data) throw new Error(res?.error || 'Supabase-এ পাওনা সংরক্ষণ করা সম্ভব হয়নি।');
        const created = res.data;
        
        setCustomerDuesState(prev => prev.map(d => d.id === tempId ? created : d));

        if (initialPaid > 0) {
          const uniquePayId = typeof crypto !== 'undefined' && crypto.randomUUID 
            ? crypto.randomUUID() 
            : '00000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0');
            
          const pendingPayment = {
             id: uniquePayId,
             dueId: created.id,
             customerId: created.customerId,
             amount: initialPaid,
             paymentDate: new Date().toISOString().split('T')[0],
             paymentMethod: 'bKash',
             note: 'প্রাথমিক পেমেন্ট প্রাপ্তি',
             _pending: true
          };
          setDuePaymentsState(prev => [pendingPayment, ...prev]);

          api.rpcRecordCustomerDuePayment({
            paymentId: uniquePayId,
            dueId: created.id,
            paymentDate: new Date().toISOString().split('T')[0],
            amount: initialPaid,
            paymentMethod: 'bKash',
            note: 'প্রাথমিক পেমেন্ট প্রাপ্তি'
          }).then(payRes => {
            if (payRes?.success !== false) {
              Promise.all([
                api.getCustomerDues(session.user.id),
                api.getCustomerDuePayments(session.user.id),
                api.getIncome(session.user.id)
              ]).then(([duesRes, paysRes, incsRes]) => {
                if (duesRes !== null) setCustomerDuesState(duesRes);
                if (paysRes !== null) setDuePaymentsState(paysRes);
                if (incsRes !== null) setIncomesState(incsRes);
              });
            }
          }).catch(() => {
            setGlobalError('প্রাথমিক পেমেন্ট সেভ করা যায়নি।');
          });
        }
        return created;
      } catch (err) {
        setCustomerDuesState(prev => prev.filter(d => d.id !== tempId));
        setGlobalError(`"${dueData.customerName}" এর পাওনা সেভ করা যায়নি।`);
        throw err;
      }
    } else {
      delete newDue._pending;
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
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, সংরক্ষণ করা যায়নি।');
        throw new Error('No internet');
      }
      
      const originalItem = customerDuesRef.current.find(d => String(d.id) === String(dueId));
      if (!originalItem) throw new Error('Not found');
      
      setCustomerDuesState(prev => prev.map(d => {
        if (String(d.id) === String(dueId)) {
          const total = Number(dueData.totalAmount) || d.totalAmount;
          const paid = d.paidAmount;
          const due = Math.max(0, total - paid);
          const status = due <= 0 ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Unpaid';
          return { ...d, ...dueData, totalAmount: total, dueAmount: due, status, _pending: true };
        }
        return d;
      }));

      try {
        const res = await withSync(api.updateCustomerDue(session.user.id, dueId, dueData), { isOptimistic: false });
        if (isFailedResult(res) || !res.data) throw new Error(res?.error || 'Supabase-এ পাওনা আপডেট করতে সমস্যা হয়েছে।');
        
        setCustomerDuesState(prev => prev.map(d => {
          if (String(d.id) === String(dueId)) {
             const { _pending, ...rest } = d;
             return rest;
          }
          return d;
        }));
        
        api.getCustomerDues(session.user.id).then(duesRes => {
          if (duesRes !== null) setCustomerDuesState(duesRes);
        });
        return res.data;
      } catch (err) {
        setCustomerDuesState(prev => prev.map(d => String(d.id) === String(dueId) ? originalItem : d));
        setGlobalError('পাওনা আপডেট ব্যর্থ হয়েছে।');
        throw err;
      }
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
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, মুছে ফেলা যায়নি।');
        throw new Error('No internet');
      }
      const originalItem = customerDuesRef.current.find(d => String(d.id) === String(dueId));
      if (!originalItem) return;

      setCustomerDuesState(prev => prev.filter(d => String(d.id) !== String(dueId)));

      try {
        const res = await withSync(api.deleteCustomerDue(session.user.id, dueId), { isOptimistic: false });
        if (isFailedResult(res) || res?.success === false) {
          throw new Error(res?.error || 'Supabase থেকে মুছে ফেলতে সমস্যা হয়েছে।');
        }
      } catch (err) {
        setCustomerDuesState(prev => {
           if (prev.some(d => String(d.id) === String(dueId))) return prev;
           return [originalItem, ...prev];
        });
        setGlobalError('পাওনা মুছে ফেলা যায়নি।');
        throw err;
      }
    } else {
      handleSetCustomerDues(prev => prev.filter(d => String(d.id) !== String(dueId)));
    }
  };

  const handleRecordCustomerDuePayment = async (paymentData) => {
    const dueItem = customerDuesRef.current.find(d => String(d.id) === String(paymentData.dueId));
    if (!dueItem) return { success: false, message: 'পাওনা রেকর্ড পাওয়া যায়নি' };

    const amountNum = Number(paymentData.amount);
    const newPaid = (Number(dueItem.paidAmount) || 0) + amountNum;
    const newDue = Math.max(0, (Number(dueItem.totalAmount) || 0) - newPaid);
    const newStatus = newDue <= 0 ? 'Paid' : 'Partially Paid';
    const paymentId = paymentData.paymentId || `pay_due_${Date.now()}`;

    if (session?.user?.id) {
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, পেমেন্ট রেকর্ড করা যায়নি।');
        return { success: false, message: 'No internet' };
      }

      setCustomerDuesState(prev => prev.map(d => String(d.id) === String(paymentData.dueId) ? {
        ...d,
        paidAmount: newPaid,
        dueAmount: newDue,
        status: newStatus,
        _pending: true
      } : d));

      const pendingPayment = {
        id: paymentId,
        dueId: paymentData.dueId,
        customerId: dueItem.customerId,
        amount: amountNum,
        paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
        paymentMethod: paymentData.paymentMethod || 'bKash',
        note: paymentData.note || '',
        createdAt: new Date().toISOString(),
        _pending: true
      };
      setDuePaymentsState(prev => [pendingPayment, ...prev]);

      try {
        const res = await withSync(api.rpcRecordCustomerDuePayment(paymentData), { isOptimistic: false });
        if (isFailedResult(res) || res?.success === false) {
           throw new Error(res?.message || 'পেমেন্ট রেকর্ড করা যায়নি');
        }
        
        setCustomerDuesState(prev => prev.map(d => {
           if (String(d.id) === String(paymentData.dueId)) {
              const { _pending, ...rest } = d;
              return rest;
           }
           return d;
        }));
        setDuePaymentsState(prev => prev.map(p => {
           if (p.id === paymentId) {
              const { _pending, ...rest } = p;
              return rest;
           }
           return p;
        }));

        api.getCustomerDues(session.user.id).then(duesRes => {
          if (duesRes !== null) setCustomerDuesState(duesRes);
        });
        api.getCustomerDuePayments(session.user.id).then(paysRes => {
          if (paysRes !== null) setDuePaymentsState(paysRes);
        });
        api.getIncome(session.user.id).then(incsRes => {
          if (incsRes !== null) setIncomesState(incsRes);
        });

        return res;
      } catch (err) {
        setCustomerDuesState(prev => prev.map(d => String(d.id) === String(paymentData.dueId) ? dueItem : d));
        setDuePaymentsState(prev => prev.filter(p => p.id !== paymentId));
        setGlobalError('পেমেন্ট রেকর্ড করা ব্যর্থ হয়েছে।');
        throw err;
      }
    } else {
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
      if (!navigator.onLine) {
        return { success: false, message: 'ইন্টারনেট সংযোগ নেই, সংরক্ষণ করা যায়নি।' };
      }
      
      const tempId = `temp_liab_${Date.now()}`;
      const optimisticLiability = {
        ...liabilityData,
        id: tempId,
        remainingAmount: Number(liabilityData.totalAmount) || 0,
        status: 'Active',
        _pending: true
      };

      setLiabilitiesState(prev => [optimisticLiability, ...prev]);

      try {
        const res = await withSync(api.createLiability(session.user.id, liabilityData), { isOptimistic: false });
        if (isFailedResult(res) || !res?.data) {
          throw new Error(res?.error || 'Supabase-এ দেনা সংরক্ষণ করা সম্ভব হয়নি।');
        }
        
        const newLiability = res.data;
        setLiabilitiesState(prev => prev.map(l => String(l.id) === String(tempId) ? newLiability : l));

        if (newLiability.liabilityType === 'EMI' && newLiability.durationMonths > 0) {
          const installments = [];
          const startDate = newLiability.startDate ? new Date(newLiability.startDate) : new Date();
          const dueDay = newLiability.dueDay || startDate.getDate();
          
          const addMonthsSafely = (date, monthsToAdd, targetDay) => {
            const result = new Date(date.getFullYear(), date.getMonth() + monthsToAdd, 1);
            const daysInMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
            result.setDate(Math.min(targetDay, daysInMonth));
            return result;
          };

          for (let i = 1; i <= newLiability.durationMonths; i++) {
            const dueDate = addMonthsSafely(startDate, i, dueDay);
            const yyyy = dueDate.getFullYear();
            const mm = String(dueDate.getMonth() + 1).padStart(2, '0');
            const dd = String(dueDate.getDate()).padStart(2, '0');

            installments.push({
              liabilityId: newLiability.id,
              installmentNumber: i,
              dueDate: `${yyyy}-${mm}-${dd}`,
              expectedAmount: newLiability.emiAmount
            });
          }

          api.createEmiInstallments(session.user.id, installments).then(emiRes => {
            if (emiRes.success) {
              api.getEmiInstallments(session.user.id).then(freshEmis => {
                if (freshEmis) setEmiInstallments(freshEmis);
              });
            }
          });
        }

        return { success: true, data: newLiability };
      } catch (err) {
        setLiabilitiesState(prev => prev.filter(l => String(l.id) !== String(tempId)));
        return { success: false, message: err.message };
      }
    }
    return { success: false, message: 'লগইন করা নেই' };
  };

  const handleDeleteLiability = async (liabilityId) => {
    if (session?.user?.id) {
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, ডিলিট করা যায়নি।');
        return;
      }
      
      const originalLiabilities = liabilities;
      setLiabilitiesState(prev => prev.filter(l => String(l.id) !== String(liabilityId)));
      
      try {
        const deleted = await withSync(api.deleteLiability(session.user.id, liabilityId), { isOptimistic: false });
        if (!deleted) throw new Error('Deletion failed');
      } catch (err) {
        setLiabilitiesState(originalLiabilities);
        setGlobalError('দেনা মুছে ফেলা সম্ভব হয়নি।');
      }
    }
  };

  const handleRecordLiabilityPayment = async (paymentData) => {
    if (session?.user?.id) {
      if (!navigator.onLine) {
        setGlobalError('ইন্টারনেট সংযোগ নেই, পেমেন্ট রেকর্ড করা যায়নি।');
        return { success: false, message: 'No internet' };
      }

      const amountNum = Number(paymentData.amount);
      const liabilityItem = liabilities.find(l => String(l.id) === String(paymentData.liabilityId));
      if (!liabilityItem) return { success: false, message: 'Liability not found' };

      const newPaidAmount = (Number(liabilityItem.paidAmount) || 0) + amountNum;
      const newRemaining = Math.max(0, (Number(liabilityItem.totalAmount) || 0) - newPaidAmount);
      const newStatus = newRemaining <= 0 ? 'Paid Off' : liabilityItem.status;

      setLiabilitiesState(prev => prev.map(l => String(l.id) === String(paymentData.liabilityId) ? {
        ...l,
        paidAmount: newPaidAmount,
        remainingAmount: newRemaining,
        status: newStatus,
        _pending: true
      } : l));

      const paymentId = paymentData.paymentId || `pay_liab_${Date.now()}`;
      setLiabilityPaymentsState(prev => [{
        id: paymentId,
        liabilityId: paymentData.liabilityId,
        amount: amountNum,
        paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
        paymentMethod: paymentData.paymentMethod || 'Cash',
        _pending: true
      }, ...prev]);

      if (paymentData.addToExpense) {
        setExpensesState(prev => [{
          id: Date.now(),
          date: paymentData.paymentDate || new Date().toISOString().split('T')[0],
          category: 'Debt Repayment',
          title: `Payment for ${liabilityItem.creditorName}`,
          amount: amountNum,
          paymentMethod: paymentData.paymentMethod || 'Cash',
          _pending: true
        }, ...prev]);
      }

      try {
        const res = await withSync(api.rpcRecordLiabilityPayment(paymentData), { isOptimistic: false });
        if (isFailedResult(res) || res?.success === false) {
           throw new Error(res?.message || 'পেমেন্ট রেকর্ড করা যায়নি');
        }

        setLiabilitiesState(prev => prev.map(l => String(l.id) === String(paymentData.liabilityId) ? { ...l, _pending: false } : l));
        setLiabilityPaymentsState(prev => prev.map(p => p.id === paymentId ? { ...p, _pending: false } : p));
        if (paymentData.addToExpense) {
           // Refetching expenses will fix the temporary ID
        }

        api.getLiabilities(session.user.id).then(liabRes => { if (liabRes) setLiabilitiesState(liabRes); });
        api.getLiabilityPayments(session.user.id).then(liabPaysRes => { if (liabPaysRes) setLiabilityPaymentsState(liabPaysRes); });
        if (paymentData.addToExpense) {
          api.getExpenses(session.user.id).then(expRes => { if (expRes) setExpensesState(expRes); });
        }

        return res;
      } catch (err) {
        setLiabilitiesState(prev => prev.map(l => String(l.id) === String(paymentData.liabilityId) ? liabilityItem : l));
        setLiabilityPaymentsState(prev => prev.filter(p => p.id !== paymentId));
        if (paymentData.addToExpense) {
           api.getExpenses(session.user.id).then(expRes => { if (expRes) setExpensesState(expRes); });
        }
        setGlobalError('পেমেন্ট রেকর্ড করা ব্যর্থ হয়েছে।');
        throw err;
      }
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
        onStartTrial={handleStartTrial}
        user={session.user}
        onLogout={handleLogout}
        selectedPlanId={localStorage.getItem('dremoy_selected_plan')}
      />
    );
  }

  const hasTrial = !isAdmin && hasActiveTrial(subscription);
  const trialDaysRemaining = hasTrial 
    ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={session.user} 
        onLogout={handleLogout}
        isAdmin={isAdmin}
        subscription={subscription}
        onOpenUpgrade={() => setShowUpgradeModal(true)}
      />
      
      {/* Top Subtle Animated Sync Progress Line */}
      {loadingData && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 z-50 animate-pulse"></div>
      )}

      <main className="flex-1 md:ml-64 p-4 sm:p-6 md:p-8 w-full min-w-0 max-w-[1600px] mx-auto space-y-4">
        {/* Top Header Trial Status Banner (Dismissable / Actionable) */}
        {hasTrial && (
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:px-6 shadow-sm border border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    ১৪ দিনের ফ্রি ট্রায়াল চালু রয়েছে
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {trialDaysRemaining} দিন বাকি
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  ট্রায়াল চলাকালীন সমস্ত ফিচার সম্পূর্ণ ফ্রি। ট্রায়াল শেষ হলেও ডেটা সুরক্ষিত থাকবে।
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              <Crown className="w-4 h-4 text-slate-950" />
              <span>এখনই পেইড সাবস্ক্রাইব করুন</span>
            </button>
          </div>
        )}

        {session?.user && (
          <SyncStatusPill 
            status={syncStatus.status} 
            lastSyncedAt={syncStatus.lastSyncedAt} 
            onRetry={() => {
              if (window.confirm("কিছু পরিবর্তন সার্ভারে সেভ হয়নি। রিলোড করলে সেগুলো হারিয়ে যেতে পারে। তবুও রিলোড করবেন?")) {
                if (loadUserDataRef.current) loadUserDataRef.current();
              }
            }} 
          />
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
          <Plan planData={planData} planActions={planActions} isSavingPlan={isSavingPlan} />
        )}

        {activeTab === 'tasks' && (
          <Tasks tasks={tasks} setTasks={handleSetTasks} taskActions={taskActions} />
        )}

        {activeTab === 'tuition' && (
          <Tuition
            students={tuitionStudents}
            payments={tuitionPayments}
            onAddStudent={handleAddTuitionStudent}
            onUpdateStudent={handleUpdateTuitionStudent}
            onRecordPayment={handleRecordTuitionPayment}
            onDeletePayment={handleDeleteTuitionPayment}
            tuitionStudentActions={tuitionStudentActions}
            tuitionPaymentActions={tuitionPaymentActions}
            currency={appData.currency}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'dues' && (
          !isFeatureAllowed('dues', subscription, isAdmin) ? (
            <FeatureLockCard
              featureId="dues"
              onUpgrade={(planId) => {
                localStorage.setItem('dremoy_selected_plan', planId);
                setShowUpgradeModal(true);
              }}
            />
          ) : (
            <CustomerDues
              dues={customerDues}
              duePayments={duePayments}
              crmClients={leads}
              onAddDue={handleAddCustomerDue}
              onUpdateDue={handleUpdateCustomerDue}
              onDeleteDue={handleDeleteCustomerDue}
              onRecordPayment={handleRecordCustomerDuePayment}
            />
          )
        )}

        {activeTab === 'liabilities' && (
          !isFeatureAllowed('liabilities', subscription, isAdmin) ? (
            <FeatureLockCard
              featureId="liabilities"
              onUpgrade={(planId) => {
                localStorage.setItem('dremoy_selected_plan', planId);
                setShowUpgradeModal(true);
              }}
            />
          ) : (
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
                if (!navigator.onLine) {
                  setGlobalError('ইন্টারনেট সংযোগ নেই, পেমেন্ট রেকর্ড করা যায়নি।');
                  return { success: false, message: 'No internet' };
                }

                const amountNum = Number(paymentData.amount);
                const liabilityItem = liabilities.find(l => String(l.id) === String(paymentData.liabilityId));
                const installmentItem = emiInstallments.find(e => String(e.id) === String(paymentData.installmentId));
                if (!liabilityItem || !installmentItem) return { success: false, message: 'Liability or Installment not found' };

                const newPaidAmount = (Number(liabilityItem.paidAmount) || 0) + amountNum;
                const newRemaining = Math.max(0, (Number(liabilityItem.totalAmount) || 0) - newPaidAmount);
                const newLiabStatus = newRemaining <= 0 ? 'Paid Off' : liabilityItem.status;

                const instNewPaid = (Number(installmentItem.paidAmount) || 0) + amountNum;
                const instStatus = instNewPaid >= Number(installmentItem.expectedAmount) ? 'Paid' : 'Partial';

                setLiabilitiesState(prev => prev.map(l => String(l.id) === String(paymentData.liabilityId) ? {
                  ...l,
                  paidAmount: newPaidAmount,
                  remainingAmount: newRemaining,
                  status: newLiabStatus,
                  _pending: true
                } : l));

                setEmiInstallments(prev => prev.map(e => String(e.id) === String(paymentData.installmentId) ? {
                  ...e,
                  paidAmount: instNewPaid,
                  status: instStatus,
                  _pending: true
                } : e));

                const paymentId = paymentData.paymentId || `pay_emi_${Date.now()}`;
                setLiabilityPaymentsState(prev => [{
                  id: paymentId,
                  liabilityId: paymentData.liabilityId,
                  emiInstallmentId: paymentData.installmentId,
                  amount: amountNum,
                  paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
                  paymentMethod: paymentData.paymentMethod || 'Cash',
                  _pending: true
                }, ...prev]);

                try {
                  const res = await withSync(api.rpcRecordEmiPayment(paymentData), { isOptimistic: false });
                  if (isFailedResult(res) || res?.success === false) {
                    throw new Error(res?.message || 'Failed');
                  }

                  setLiabilitiesState(prev => prev.map(l => String(l.id) === String(paymentData.liabilityId) ? { ...l, _pending: false } : l));
                  setEmiInstallments(prev => prev.map(e => String(e.id) === String(paymentData.installmentId) ? { ...e, _pending: false } : e));
                  setLiabilityPaymentsState(prev => prev.map(p => p.id === paymentId ? { ...p, _pending: false } : p));

                  api.getLiabilities(session.user.id).then(liabRes => { if (liabRes) setLiabilitiesState(liabRes); });
                  api.getLiabilityPayments(session.user.id).then(liabPaysRes => { if (liabPaysRes) setLiabilityPaymentsState(liabPaysRes); });
                  api.getEmiInstallments(session.user.id).then(emiRes => { if (emiRes) setEmiInstallments(emiRes); });

                  return res;
                } catch (err) {
                  setLiabilitiesState(prev => prev.map(l => String(l.id) === String(paymentData.liabilityId) ? liabilityItem : l));
                  setEmiInstallments(prev => prev.map(e => String(e.id) === String(paymentData.installmentId) ? installmentItem : e));
                  setLiabilityPaymentsState(prev => prev.filter(p => p.id !== paymentId));
                  setGlobalError('পেমেন্ট রেকর্ড করা ব্যর্থ হয়েছে।');
                  throw err;
                }
              }}
            />
          )
        )}

        {activeTab === 'crm' && (
          !isFeatureAllowed('crm', subscription, isAdmin) ? (
            <FeatureLockCard
              featureId="crm"
              onUpgrade={(planId) => {
                localStorage.setItem('dremoy_selected_plan', planId);
                setShowUpgradeModal(true);
              }}
            />
          ) : (
            <Crm 
              leads={leads} 
              setLeads={handleSetLeads} 
              leadActions={leadActions} 
              crmPayments={crmPayments}
              customerDues={customerDues}
              duePayments={duePayments}
              onRecordPayment={handleRecordCrmPayment}
              onNavigateToDues={() => setActiveTab('dues')}
              onRecordIncome={(incomeItem) => {
                handleSetIncomes(prev => [incomeItem, ...prev]);
              }}
            />
          )
        )}

        {activeTab === 'income' && (
          <IncomeTracker 
            incomes={incomes} 
            setIncomes={handleSetIncomes} 
            incomeActions={incomeActions}
            targetIncome={appData.targetIncome}
            currentSalary={updatedAppData.currentIncome}
          />
        )}


        {activeTab === 'expense' && (
          <ExpenseTracker 
            expenses={expenses} 
            setExpenses={handleSetExpenses} 
            expenseActions={expenseActions}
            totalIncome={salarySum + newIncomeSum}
            appData={appData}
          />
        )}

        {activeTab === 'weekly' && (
          <WeeklyReview reviews={reviews} reviewActions={reviewActions} />
        )}

        {activeTab === 'services' && (
          !isFeatureAllowed('services', subscription, isAdmin) ? (
            <FeatureLockCard
              featureId="services"
              onUpgrade={(planId) => {
                localStorage.setItem('dremoy_selected_plan', planId);
                setShowUpgradeModal(true);
              }}
            />
          ) : (
            <Services services={services} serviceActions={serviceActions} />
          )
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

      {/* Upgrade / Subscription Modal for Active Trial Users */}
      {showUpgradeModal && (
        <SubscriptionModal
          subscription={subscription}
          paymentRequests={paymentRequests}
          onSubmitPayment={handleSubmitPayment}
          onStartTrial={handleStartTrial}
          user={session.user}
          onLogout={handleLogout}
          onClose={() => setShowUpgradeModal(false)}
          selectedPlanId={localStorage.getItem('dremoy_selected_plan')}
        />
      )}
    </div>
  );
}
