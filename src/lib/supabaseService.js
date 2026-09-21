import { supabase, isSupabaseConfigured } from './supabase';
import { STORAGE_KEYS, loadData } from '../utils/storage';

// Helper to convert snake_case object keys to camelCase
const toCamel = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamel);
  
  const camelObj = {};
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    camelObj[camelKey] = obj[key];
  }
  return camelObj;
};

// ====================================================================
// SUBSCRIPTION & PAYMENT REQUEST SERVICES
// ====================================================================
export const getSubscription = async (userId) => {
  if (!isSupabaseConfigured || !userId) return null;
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching subscription:', error);
    return null;
  }
  return data ? toCamel(data) : null;
};

export const getPaymentRequests = async (userId) => {
  if (!isSupabaseConfigured || !userId) return [];
  const { data, error } = await supabase
    .from('payment_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching payment requests:', error);
    return [];
  }
  return data ? data.map(toCamel) : [];
};

export const submitPaymentRequest = async (userId, userEmail, paymentDetails) => {
  if (!isSupabaseConfigured || !userId) {
    return { success: false, message: 'Supabase সঠিকভাবে কনফিগার করা হয়নি।' };
  }

  const payload = {
    user_id: userId,
    user_email: userEmail,
    plan_id: paymentDetails.planId || 'starter',
    plan_name: paymentDetails.planName || 'Starter',
    amount: Number(paymentDetails.amount) || 499,
    payment_method: paymentDetails.paymentMethod || 'bKash',
    sender_number: paymentDetails.senderNumber,
    trx_id: paymentDetails.trxId,
    status: 'pending'
  };

  // 1. Insert into payment_requests
  const { error: reqErr } = await supabase
    .from('payment_requests')
    .insert(payload);

  if (reqErr) {
    console.error('Error submitting payment request:', reqErr);
    if (reqErr.message.includes('relation "public.payment_requests" does not exist') || reqErr.code === '42P01') {
      return { success: false, message: 'Supabase-এ payment_requests টেবিল পাওয়া যায়নি। দয়া করে Supabase SQL Editor-এ supabase_schema.sql এর নতুন কোডটি Run করুন।' };
    }
    return { success: false, message: 'পেমেন্ট রিকোয়েস্ট জমা দেওয়া যায়নি: ' + reqErr.message };
  }

  // 2. Update or insert subscription status to pending
  const { error: subErr } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      user_email: userEmail,
      status: 'pending',
      plan_id: payload.plan_id,
      plan_name: payload.plan_name,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  if (subErr) {
    console.error('Error updating subscription status to pending:', subErr);
  }

  return { success: true };
};

export const getPendingPaymentRequestsForAdmin = async () => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('payment_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all payment requests for admin:', error);
    return [];
  }
  return data ? data.map(toCamel) : [];
};

export const getAllSubscriptionsForAdmin = async () => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching all subscriptions for admin:', error);
    return [];
  }
  return data ? data.map(toCamel) : [];
};

export const rpcApprovePaymentRequest = async (requestId) => {
  if (!isSupabaseConfigured) return { success: false, message: 'Supabase Config missing' };
  const { data, error } = await supabase.rpc('approve_payment_request', { request_id: requestId });

  if (error) {
    console.error('RPC Approve Error:', error);
    return { success: false, message: error.message };
  }
  return data;
};

export const rpcRejectPaymentRequest = async (requestId, reason = '') => {
  if (!isSupabaseConfigured) return { success: false, message: 'Supabase Config missing' };
  const { data, error } = await supabase.rpc('reject_payment_request', { request_id: requestId, rejection_reason: reason });

  if (error) {
    console.error('RPC Reject Error:', error);
    return { success: false, message: error.message };
  }
  return data;
};

export const checkIsAdmin = async (userId, userEmail = '') => {
  if (!isSupabaseConfigured || !userId) return false;
  try {
    const { data, error } = await supabase.rpc('is_admin', { p_user_id: userId });
    if (!error && typeof data === 'boolean') {
      return data;
    }
    const { data: roleData, error: roleErr } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleErr && roleData) {
      return true;
    }
  } catch (err) {
    console.error('Error checking admin role:', err);
  }

  // Fallback while Supabase user_roles migration SQL is waiting to be run in SQL Editor
  if (userEmail === 'fuwaraahmed@gmail.com') {
    return true;
  }
  return false;
};

// ====================================================================
// SETTINGS SERVICE
// ====================================================================
export const getSettings = async (userId) => {
  if (!isSupabaseConfigured || !userId) return null;
  
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching settings:', error);
    return null;
  }
  
  if (!data) return null;

  return {
    targetIncome: Number(data.target_income) || 100000,
    installment: Number(data.installment) || 80000,
    dailyOutreachTarget: Number(data.daily_outreach_target) || 10,
    currency: data.currency || '৳',
  };
};

export const updateSettings = async (userId, settingsData) => {
  if (!isSupabaseConfigured || !userId) return false;

  const payload = {
    user_id: userId,
    target_income: Number(settingsData.targetIncome) || 100000,
    installment: Number(settingsData.installment) || 80000,
    daily_outreach_target: Number(settingsData.dailyOutreachTarget) || 10,
    currency: settingsData.currency || '৳',
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('settings')
    .upsert(payload, { onConflict: 'user_id' });

  if (error) {
    console.error('Error updating settings:', error);
    return false;
  }
  return true;
};

// ====================================================================
// TASKS SERVICE
// ====================================================================
export const getTasks = async (userId) => {
  if (!isSupabaseConfigured || !userId) return null;
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    return null;
  }
  return data ? data.map(toCamel) : [];
};

export const createTask = async (userId, task) => {
  if (!isSupabaseConfigured || !userId) return null;
  const payload = {
    user_id: userId,
    name: task.name,
    category: task.category || 'Sales',
    priority: task.priority || 'High',
    date: task.date || new Date().toISOString().split('T')[0],
    target_metric: task.targetMetric || '',
    status: task.status || 'NotStarted',
    notes: task.notes || ''
  };

  const { data, error } = await supabase
    .from('tasks')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    return null;
  }
  return toCamel(data);
};

export const updateTaskStatus = async (userId, taskId, newStatus) => {
  if (!isSupabaseConfigured || !userId) return false;
  const { error } = await supabase
    .from('tasks')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating task status:', error);
    return false;
  }
  return true;
};

export const deleteTask = async (userId, taskId) => {
  if (!isSupabaseConfigured || !userId) return false;
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting task:', error);
    return false;
  }
  return true;
};

// ====================================================================
// CRM CLIENTS SERVICE
// ====================================================================
export const getCRMClients = async (userId) => {
  if (!isSupabaseConfigured || !userId) return null;
  const { data, error } = await supabase
    .from('crm_clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching CRM clients:', error);
    return null;
  }
  return data ? data.map(toCamel) : [];
};

export const createCRMClient = async (userId, lead) => {
  if (!isSupabaseConfigured || !userId) return null;
  const payload = {
    user_id: userId,
    date: lead.date || new Date().toISOString().split('T')[0],
    client_name: lead.clientName,
    business_name: lead.businessName,
    contact: lead.contact || '',
    service: lead.service || '',
    quoted_price: Number(lead.quotedPrice) || 0,
    advance: Number(lead.advance) || 0,
    status: lead.status || 'New',
    next_follow_up: lead.nextFollowUp || null,
    notes: lead.notes || ''
  };

  const { data, error } = await supabase
    .from('crm_clients')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creating CRM client:', error);
    return null;
  }
  return toCamel(data);
};

export const updateCRMClientStatus = async (userId, leadId, newStatus) => {
  if (!isSupabaseConfigured || !userId) return false;
  const { error } = await supabase
    .from('crm_clients')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', leadId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating CRM client status:', error);
    return false;
  }
  return true;
};

export const deleteCRMClient = async (userId, leadId) => {
  if (!isSupabaseConfigured || !userId) return false;
  const { error } = await supabase
    .from('crm_clients')
    .delete()
    .eq('id', leadId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting CRM client:', error);
    return false;
  }
  return true;
};

// ====================================================================
// INCOME SERVICE
// ====================================================================
export const getIncome = async (userId) => {
  if (!isSupabaseConfigured || !userId) return null;
  const { data, error } = await supabase
    .from('income')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching income:', error);
    return null;
  }
  return data ? data.map(toCamel) : [];
};

export const createIncome = async (userId, incomeItem) => {
  if (!isSupabaseConfigured || !userId) return null;
  const payload = {
    user_id: userId,
    date: incomeItem.date || new Date().toISOString().split('T')[0],
    source: incomeItem.source,
    client_details: incomeItem.clientDetails,
    amount: Number(incomeItem.amount) || 0,
    payment_type: incomeItem.paymentType || 'bKash',
    month: incomeItem.month || 'Month 1',
    notes: incomeItem.notes || ''
  };

  const { data, error } = await supabase
    .from('income')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creating income entry:', error);
    return null;
  }
  return toCamel(data);
};

export const updateIncome = async (userId, incomeId, incomeItem) => {
  if (!isSupabaseConfigured || !userId || !incomeId) return null;
  const payload = {
    date: incomeItem.date || new Date().toISOString().split('T')[0],
    source: incomeItem.source,
    client_details: incomeItem.clientDetails,
    amount: Number(incomeItem.amount) || 0,
    payment_type: incomeItem.paymentType || 'bKash',
    month: incomeItem.month || 'Month 1',
    notes: incomeItem.notes || '',
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('income')
    .update(payload)
    .eq('id', incomeId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating income entry:', error);
    return null;
  }
  return toCamel(data);
};

export const deleteIncome = async (userId, incomeId) => {
  if (!isSupabaseConfigured || !userId) return false;
  const { error } = await supabase
    .from('income')
    .delete()
    .eq('id', incomeId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting income:', error);
    return false;
  }
  return true;
};

// ====================================================================
// EXPENSES SERVICE
// ====================================================================
export const getExpenses = async (userId) => {
  if (!isSupabaseConfigured || !userId) return null;
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error);
    return null;
  }
  return data ? data.map(toCamel) : [];
};

export const createExpense = async (userId, expenseItem) => {
  if (!isSupabaseConfigured || !userId) return null;
  const payload = {
    user_id: userId,
    date: expenseItem.date || new Date().toISOString().split('T')[0],
    category: expenseItem.category,
    description: expenseItem.description,
    amount: Number(expenseItem.amount) || 0,
    month: expenseItem.month || 'Month 1',
    notes: expenseItem.notes || ''
  };

  const { data, error } = await supabase
    .from('expenses')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creating expense entry:', error);
    return null;
  }
  return toCamel(data);
};

export const updateExpense = async (userId, expenseId, expenseItem) => {
  if (!isSupabaseConfigured || !userId || !expenseId) return null;
  const payload = {
    date: expenseItem.date || new Date().toISOString().split('T')[0],
    category: expenseItem.category,
    description: expenseItem.description,
    amount: Number(expenseItem.amount) || 0,
    month: expenseItem.month || 'Month 1',
    notes: expenseItem.notes || '',
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('expenses')
    .update(payload)
    .eq('id', expenseId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating expense entry:', error);
    return null;
  }
  return toCamel(data);
};

export const deleteExpense = async (userId, expenseId) => {
  if (!isSupabaseConfigured || !userId) return false;
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting expense:', error);
    return false;
  }
  return true;
};

// ====================================================================
// WEEKLY REVIEWS SERVICE
// ====================================================================
export const getWeeklyReviews = async (userId) => {
  if (!isSupabaseConfigured || !userId) return null;
  const { data, error } = await supabase
    .from('weekly_reviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching weekly reviews:', error);
    return null;
  }
  return data ? data.map(toCamel) : [];
};

export const createWeeklyReview = async (userId, review) => {
  if (!isSupabaseConfigured || !userId) return null;
  const payload = {
    user_id: userId,
    week_title: review.weekTitle,
    outreach_count: Number(review.outreachCount) || 0,
    replies_count: Number(review.repliesCount) || 0,
    interested_count: Number(review.interestedCount) || 0,
    clients_won_count: Number(review.clientsWonCount) || 0,
    new_income: Number(review.newIncome) || 0,
    main_achievement: review.mainAchievement || '',
    main_problem: review.mainProblem || '',
    next_week_priority: review.nextWeekPriority || '',
    notes: review.notes || ''
  };

  const { data, error } = await supabase
    .from('weekly_reviews')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creating weekly review:', error);
    return null;
  }
  return toCamel(data);
};

export const deleteWeeklyReview = async (userId, reviewId) => {
  if (!isSupabaseConfigured || !userId) return false;
  const { error } = await supabase
    .from('weekly_reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting weekly review:', error);
    return false;
  }
  return true;
};

// ====================================================================
// SERVICES SERVICE
// ====================================================================
export const getServices = async (userId) => {
  if (!isSupabaseConfigured || !userId) return null;
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('user_id', userId)
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching services:', error);
    return null;
  }
  return data ? data.map(toCamel) : [];
};

export const createService = async (userId, srv) => {
  if (!isSupabaseConfigured || !userId) return null;
  const payload = {
    ...(srv.id ? { id: Number(srv.id) } : {}),
    user_id: userId,
    title: srv.title,
    price: srv.price,
    delivery_time: srv.deliveryTime || '',
    includes: Array.isArray(srv.includes) ? srv.includes : [],
    notes: srv.notes || '',
    active: true
  };

  const { data, error } = await supabase
    .from('services')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creating service:', error);
    return null;
  }
  return toCamel(data);
};

export const deleteService = async (userId, serviceId) => {
  if (!isSupabaseConfigured || !userId) return false;
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', serviceId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting service:', error);
    return false;
  }
  return true;
};

// ====================================================================
// 90-DAY PLAN SERVICE
// ====================================================================
export const get90DayPlan = async (userId) => {
  if (!isSupabaseConfigured || !userId) return null;
  const { data, error } = await supabase
    .from('ninety_day_plan')
    .select('*')
    .eq('user_id', userId)
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching 90-day plan:', error);
    return null;
  }
  if (!data || data.length === 0) return null;

  return data.map(m => ({
    id: m.id,
    monthTitle: m.month_title,
    targetIncome: m.target_income,
    newIncomeTarget: m.new_income_target,
    focus: m.focus,
    weeks: m.weeks || []
  }));
};

export const update90DayPlan = async (userId, planMonths) => {
  if (!isSupabaseConfigured || !userId || !Array.isArray(planMonths)) return false;

  const payload = planMonths.map(m => ({
    id: m.id,
    user_id: userId,
    month_title: m.monthTitle,
    target_income: m.targetIncome || '',
    new_income_target: m.newIncomeTarget || '',
    focus: m.focus || '',
    weeks: m.weeks || [],
    updated_at: new Date().toISOString()
  }));

  const { error } = await supabase
    .from('ninety_day_plan')
    .upsert(payload, { onConflict: 'id,user_id' });

  if (error) {
    console.error('Error updating 90-day plan:', error);
    return false;
  }
  return true;
};

// ====================================================================
// SAFE & GRANULAR LOCALSTORAGE MIGRATION TOOL
// ====================================================================
export const migrateLocalStorageToSupabase = async (userId) => {
  if (!isSupabaseConfigured || !userId) {
    return { success: false, message: 'Supabase সঠিকভাবে কনফিগার করা হয়নি।' };
  }

  let importedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  try {
    const [existingTasks, existingLeads, existingIncome, existingExpenses, existingReviews, existingServices] = await Promise.all([
      supabase.from('tasks').select('id').eq('user_id', userId),
      supabase.from('crm_clients').select('id').eq('user_id', userId),
      supabase.from('income').select('id').eq('user_id', userId),
      supabase.from('expenses').select('id').eq('user_id', userId),
      supabase.from('weekly_reviews').select('id').eq('user_id', userId),
      supabase.from('services').select('id').eq('user_id', userId)
    ]);

    const taskIds = new Set((existingTasks.data || []).map(r => r.id));
    const leadIds = new Set((existingLeads.data || []).map(r => r.id));
    const incomeIds = new Set((existingIncome.data || []).map(r => r.id));
    const expenseIds = new Set((existingExpenses.data || []).map(r => r.id));
    const reviewIds = new Set((existingReviews.data || []).map(r => r.id));
    const serviceIds = new Set((existingServices.data || []).map(r => r.id));

    const localTasks = loadData(STORAGE_KEYS.TASKS, []);
    const localLeads = loadData(STORAGE_KEYS.LEADS, []);
    const localIncomes = loadData(STORAGE_KEYS.INCOMES, []);
    const localExpenses = loadData(STORAGE_KEYS.EXPENSES, []);
    const localReviews = loadData(STORAGE_KEYS.REVIEWS, []);
    const localServices = loadData(STORAGE_KEYS.SERVICES, []);
    const localPlan = loadData(STORAGE_KEYS.PLAN_DATA, null);
    const localAppData = loadData(STORAGE_KEYS.APP_DATA, null);

    for (const task of localTasks) {
      if (taskIds.has(Number(task.id))) {
        skippedCount++;
      } else {
        const res = await createTask(userId, task);
        if (res) importedCount++; else failedCount++;
      }
    }

    for (const lead of localLeads) {
      if (leadIds.has(Number(lead.id))) {
        skippedCount++;
      } else {
        const res = await createCRMClient(userId, lead);
        if (res) importedCount++; else failedCount++;
      }
    }

    for (const inc of localIncomes) {
      if (incomeIds.has(Number(inc.id))) {
        skippedCount++;
      } else {
        const res = await createIncome(userId, inc);
        if (res) importedCount++; else failedCount++;
      }
    }

    for (const exp of localExpenses) {
      if (expenseIds.has(Number(exp.id))) {
        skippedCount++;
      } else {
        const res = await createExpense(userId, exp);
        if (res) importedCount++; else failedCount++;
      }
    }

    for (const rev of localReviews) {
      if (reviewIds.has(Number(rev.id))) {
        skippedCount++;
      } else {
        const res = await createWeeklyReview(userId, rev);
        if (res) importedCount++; else failedCount++;
      }
    }

    for (const srv of localServices) {
      if (serviceIds.has(Number(srv.id))) {
        skippedCount++;
      } else {
        const res = await createService(userId, srv);
        if (res) importedCount++; else failedCount++;
      }
    }

    if (localPlan && Array.isArray(localPlan)) {
      const planRes = await update90DayPlan(userId, localPlan);
      if (planRes) importedCount++;
    }

    if (localAppData) {
      await updateSettings(userId, localAppData);
    }

    return {
      success: true,
      importedCount,
      skippedCount,
      failedCount,
      message: `ইমপোর্ট সম্পন্ন! ${importedCount}টি রেকর্ড নতুন আপলোড হয়েছে, ${skippedCount}টি রেকর্ড আগে থেকেই ক্লাউডে সংরক্ষিত ছিল (Skipped)।`
    };
  } catch (err) {
    console.error('Error during migration:', err);
    return {
      success: false,
      importedCount,
      skippedCount,
      failedCount,
      message: 'মাইগ্রেশন করার সময় সমস্যা দেখা দিয়েছে: ' + err.message
    };
  }
};

// ====================================================================
// TUITION MANAGEMENT SERVICES
// ====================================================================
const formatTuitionStudent = (raw) => {
  if (!raw) return null;
  const item = toCamel(raw);
  if (!item.billingStartMonth && item.notes) {
    const match = item.notes.match(/\[BSM:(\d{4}-\d{2})\]/);
    if (match) {
      item.billingStartMonth = match[1];
    }
  }
  return item;
};

export const getTuitionStudents = async (userId) => {
  if (!isSupabaseConfigured || !userId) return [];
  const { data, error } = await supabase
    .from('tuition_students')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tuition students:', error);
    return [];
  }
  return data ? data.map(formatTuitionStudent) : [];
};

export const addTuitionStudent = async (userId, studentData) => {
  if (!isSupabaseConfigured || !userId) return null;
  const payload = {
    user_id: userId,
    student_name: studentData.studentName,
    guardian_name: studentData.guardianName || '',
    mobile: studentData.mobile || '',
    class_name: studentData.className || studentData.class || '',
    batch: studentData.batch || '',
    monthly_fee: Number(studentData.monthlyFee),
    joining_date: studentData.joiningDate,
    status: studentData.status || 'Active',
    leaving_date: studentData.leavingDate || null,
    leaving_reason: studentData.leavingReason || '',
    notes: studentData.notes || ''
  };

  if (studentData.billingStartMonth) {
    payload.billing_start_month = studentData.billingStartMonth;
  }

  let { data, error } = await supabase
    .from('tuition_students')
    .insert(payload)
    .select()
    .single();

  // If column doesn't exist in Supabase DB yet, embed BSM tag in notes fallback & retry insert!
  if (error && (error.message?.includes('billing_start_month') || error.code === 'PGRST204' || error.code === '42703')) {
    delete payload.billing_start_month;
    const cleanNotes = (payload.notes || '').replace(/\[BSM:\d{4}-\d{2}\]/g, '').trim();
    payload.notes = studentData.billingStartMonth ? `${cleanNotes} [BSM:${studentData.billingStartMonth}]`.trim() : cleanNotes;

    const retry = await supabase
      .from('tuition_students')
      .insert(payload)
      .select()
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error('Error adding tuition student:', error);
    if (error.message?.includes('schema cache') || error.message?.includes('does not exist') || error.code === '42P01' || error.code === 'PGRST204') {
      throw new Error('Supabase-এ tuition_students টেবিলটি পাওয়া যায়নি। দয়া করে Supabase SQL Editor-এ নতুন SQL কোডটি Run করুন।');
    }
    throw new Error(error.message);
  }
  return data ? formatTuitionStudent(data) : null;
};

export const updateTuitionStudent = async (studentId, studentData) => {
  if (!isSupabaseConfigured) return null;
  const payload = {
    student_name: studentData.studentName,
    guardian_name: studentData.guardianName || '',
    mobile: studentData.mobile || '',
    class_name: studentData.className || studentData.class || '',
    batch: studentData.batch || '',
    monthly_fee: Number(studentData.monthlyFee),
    joining_date: studentData.joiningDate,
    status: studentData.status,
    leaving_date: studentData.leavingDate || null,
    leaving_reason: studentData.leavingReason || '',
    notes: studentData.notes || '',
    updated_at: new Date().toISOString()
  };

  if (studentData.billingStartMonth) {
    payload.billing_start_month = studentData.billingStartMonth;
  }

  let { data, error } = await supabase
    .from('tuition_students')
    .update(payload)
    .eq('id', studentId)
    .select()
    .single();

  // If column doesn't exist in Supabase DB yet, embed BSM tag in notes fallback & retry update!
  if (error && (error.message?.includes('billing_start_month') || error.code === 'PGRST204' || error.code === '42703')) {
    delete payload.billing_start_month;
    const cleanNotes = (payload.notes || '').replace(/\[BSM:\d{4}-\d{2}\]/g, '').trim();
    payload.notes = studentData.billingStartMonth ? `${cleanNotes} [BSM:${studentData.billingStartMonth}]`.trim() : cleanNotes;

    const retry = await supabase
      .from('tuition_students')
      .update(payload)
      .eq('id', studentId)
      .select()
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error('Error updating tuition student:', error);
    if (error.message?.includes('schema cache') || error.message?.includes('does not exist') || error.code === '42P01') {
      throw new Error('Supabase-এ tuition_students টেবিলটি পাওয়া যায়নি। দয়া করে Supabase SQL Editor-এ SQL কোডটি Run করুন।');
    }
    throw new Error(error.message);
  }
  return data ? formatTuitionStudent(data) : null;
};

export const getTuitionPayments = async (userId) => {
  if (!isSupabaseConfigured || !userId) return [];
  const { data, error } = await supabase
    .from('tuition_payments')
    .select('*')
    .eq('user_id', userId)
    .order('payment_date', { ascending: false });

  if (error) {
    console.error('Error fetching tuition payments:', error);
    return [];
  }
  return data ? data.map(toCamel) : [];
};

export const recordTuitionPayment = async (paymentData) => {
  if (!isSupabaseConfigured) {
    return { success: false, message: 'Supabase is not configured' };
  }

  const { data, error } = await supabase.rpc('record_tuition_payment', {
    p_student_id: Number(paymentData.studentId),
    p_payment_date: paymentData.paymentDate,
    p_payment_month: paymentData.paymentMonth, // 'YYYY-MM'
    p_amount: Number(paymentData.amount),
    p_payment_method: paymentData.paymentMethod || 'Cash',
    p_note: paymentData.note || ''
  });

  if (error) {
    console.error('RPC record_tuition_payment Error:', error);
    if (error.message?.includes('function') || error.message?.includes('does not exist') || error.code === '42883') {
      return { success: false, message: 'Supabase-এ record_tuition_payment ফাংশনটি পাওয়া যায়নি। দয়া করে Supabase SQL Editor-এ SQL কোডটি Run করুন।' };
    }
    return { success: false, message: error.message };
  }

  return data;
};

export const deleteTuitionPayment = async (paymentId, userId) => {
  if (!isSupabaseConfigured || !userId) {
    return { success: true };
  }

  // 1. Fetch payment record to find associated income_id
  const { data: payRecord } = await supabase
    .from('tuition_payments')
    .select('id, income_id')
    .eq('id', paymentId)
    .eq('user_id', userId)
    .maybeSingle();

  // 2. Delete tuition payment
  const { error } = await supabase
    .from('tuition_payments')
    .delete()
    .eq('id', paymentId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting tuition payment:', error);
    return { success: false, message: error.message };
  }

  // 3. Delete linked income record if exists
  if (payRecord?.income_id) {
    await supabase
      .from('income')
      .delete()
      .eq('id', payRecord.income_id)
      .eq('user_id', userId);
  }

  return { success: true };
};

// ====================================================================
// CRM PAYMENTS SERVICES
// ====================================================================
export const getCrmPayments = async (userId) => {
  if (!isSupabaseConfigured || !userId) return [];
  const { data, error } = await supabase
    .from('crm_payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code !== '42P01') {
      console.error('Error fetching CRM payments:', error);
    }
    return [];
  }
  return data ? data.map(toCamel) : [];
};

export const rpcRecordCrmPayment = async (paymentData) => {
  if (!isSupabaseConfigured) {
    return { success: false, message: 'Supabase is not configured' };
  }

  const { data, error } = await supabase.rpc('record_crm_payment', {
    p_payment_id: paymentData.paymentId,
    p_crm_client_id: Number(paymentData.crmClientId),
    p_payment_date: paymentData.paymentDate || new Date().toISOString().split('T')[0],
    p_amount: Number(paymentData.amount),
    p_payment_method: paymentData.paymentMethod || 'bKash',
    p_notes: paymentData.notes || ''
  });

  if (error) {
    console.error('RPC record_crm_payment Error:', error);
    if (error.message?.includes('function') || error.message?.includes('does not exist') || error.code === '42883') {
      return { success: false, message: 'Supabase-এ record_crm_payment ফাংশনটি পাওয়া যায়নি। দয়া করে Supabase SQL Editor-এ নতুন SQL কোডটি Run করুন।' };
    }
    return { success: false, message: error.message };
  }

  return data;
};

// ====================================================================
// CUSTOMER DUES SERVICES
// ====================================================================
export const getCustomerDues = async (userId) => {
  if (!isSupabaseConfigured || !userId) return [];
  const { data, error } = await supabase
    .from('customer_dues')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code !== '42P01' && error.code !== 'PGRST205') {
      console.error('Error fetching customer dues:', error);
    }
    return [];
  }
  return data ? data.map(toCamel) : [];
};

export const createCustomerDue = async (userId, dueData) => {
  if (!isSupabaseConfigured || !userId) {
    return { data: null, error: 'Supabase সঠিকভাবে কনফিগার করা হয়নি অথবা ব্যবহারকারী লগইন করেননি।' };
  }
  const total = Number(dueData.totalAmount) || 0;
  const initial = Number(dueData.paidAmount) || 0;
  const due = Math.max(0, total - initial);

  let initialStatus = 'Unpaid';
  if (initial >= total && total > 0) {
    initialStatus = 'Paid';
  } else if (initial > 0) {
    initialStatus = 'Partially Paid';
  }

  const payload = {
    user_id: userId,
    customer_id: dueData.customerId ? Number(dueData.customerId) : null,
    customer_name: dueData.customerName,
    description: dueData.description || 'পাওনা বিবরণী',
    total_amount: total,
    paid_amount: initial,
    due_amount: due,
    due_date: dueData.dueDate || null,
    status: dueData.status || initialStatus,
    note: dueData.note || ''
  };

  const { data, error } = await supabase
    .from('customer_dues')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creating customer due:', error);
    let errMsg = error.message;
    if (error.code === '42P01' || error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
      errMsg = 'Supabase-এ customer_dues টেবিল পাওয়া যায়নি। দয়া করে Supabase SQL Editor-এ supabase_schema.sql-এর কোড রান করুন।';
    }
    return { data: null, error: errMsg };
  }
  return { data: data ? toCamel(data) : null, error: null };
};

export const updateCustomerDue = async (userId, dueId, dueData) => {
  if (!isSupabaseConfigured || !userId || !dueId) {
    return { data: null, error: 'Supabase সঠিকভাবে কনফিগার করা হয়নি অথবা আইডি পাওয়া যায়নি।' };
  }
  const payload = {
    customer_name: dueData.customerName,
    description: dueData.description || 'পাওনা বিবরণী',
    total_amount: Number(dueData.totalAmount) || 0,
    due_date: dueData.dueDate || null,
    note: dueData.note || '',
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('customer_dues')
    .update(payload)
    .eq('id', dueId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating customer due:', error);
    let errMsg = error.message;
    if (error.code === '42P01' || error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
      errMsg = 'Supabase-এ customer_dues টেবিল পাওয়া যায়নি। দয়া করে Supabase SQL Editor-এ supabase_schema.sql-এর কোড রান করুন।';
    }
    return { data: null, error: errMsg };
  }
  return { data: data ? toCamel(data) : null, error: null };
};

export const deleteCustomerDue = async (userId, dueId) => {
  if (!isSupabaseConfigured || !userId || !dueId) {
    return { success: false, error: 'Supabase সঠিকভাবে কনফিগার করা হয়নি।' };
  }
  const { error } = await supabase
    .from('customer_dues')
    .delete()
    .eq('id', dueId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting customer due:', error);
    let errMsg = error.message;
    if (error.code === '42P01' || error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
      errMsg = 'Supabase-এ customer_dues টেবিল পাওয়া যায়নি।';
    }
    return { success: false, error: errMsg };
  }
  return { success: true, error: null };
};

export const getCustomerDuePayments = async (userId) => {
  if (!isSupabaseConfigured || !userId) return [];
  const { data, error } = await supabase
    .from('customer_due_payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code !== '42P01' && error.code !== 'PGRST205') {
      console.error('Error fetching customer due payments:', error);
    }
    return [];
  }
  return data ? data.map(toCamel) : [];
};

export const rpcRecordCustomerDuePayment = async (paymentData) => {
  if (!isSupabaseConfigured) {
    return { success: false, message: 'Supabase Config missing' };
  }

  // Ensure paymentId is a valid UUID
  const paymentId = paymentData.paymentId && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(paymentData.paymentId)
    ? paymentData.paymentId
    : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0'));

  const { data, error } = await supabase.rpc('record_customer_due_payment', {
    p_payment_id: paymentId,
    p_due_id: Number(paymentData.dueId),
    p_payment_date: paymentData.paymentDate || new Date().toISOString().split('T')[0],
    p_amount: Number(paymentData.amount),
    p_payment_method: paymentData.paymentMethod || 'bKash',
    p_note: paymentData.note || ''
  });

  if (error) {
    console.error('RPC record_customer_due_payment Error:', error);
    if (error.message?.includes('function') || error.message?.includes('does not exist') || error.code === '42883' || error.code === '42P01' || error.code === 'PGRST205') {
      return { success: false, message: 'Supabase-এ record_customer_due_payment ফাংশন বা টেবিল পাওয়া যায়নি। দয়া করে Supabase SQL Editor-এ supabase_schema.sql রান করুন।' };
    }
    return { success: false, message: error.message };
  }

  return data || { success: true };
};

// ====================================================================
// LIABILITY MANAGEMENT SERVICES
// ====================================================================
export const getLiabilities = async (userId) => {
  if (!isSupabaseConfigured || !userId) return [];
  const { data, error } = await supabase
    .from('liabilities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code !== '42P01') {
      console.error('Error fetching liabilities:', error);
    }
    return [];
  }
  return data ? data.map(toCamel) : [];
};

export const createLiability = async (userId, liabilityData) => {
  if (!isSupabaseConfigured || !userId) return { data: null, error: 'Supabase is not configured' };
  
  const payload = {
    user_id: userId,
    creditor_name: liabilityData.creditorName,
    liability_type: liabilityData.liabilityType || 'Hawlad',
    total_amount: Number(liabilityData.totalAmount) || 0,
    paid_amount: Number(liabilityData.paidAmount) || 0,
    remaining_amount: Math.max(0, (Number(liabilityData.totalAmount) || 0) - (Number(liabilityData.paidAmount) || 0)),
    due_date: liabilityData.dueDate || null,
    emi_amount: Number(liabilityData.emiAmount) || 0,
    duration_months: Number(liabilityData.durationMonths) || 0,
    start_date: liabilityData.startDate || null,
    due_day: Number(liabilityData.dueDay) || null,
    status: liabilityData.status || 'Active',
    notes: liabilityData.notes || ''
  };

  const { data, error } = await supabase
    .from('liabilities')
    .insert(payload)
    .select()
    .single();

  return { data: data ? toCamel(data) : null, error: error?.message };
};

export const deleteLiability = async (userId, liabilityId) => {
  if (!isSupabaseConfigured || !userId) return false;
  const { error } = await supabase
    .from('liabilities')
    .delete()
    .eq('id', liabilityId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting liability:', error);
    return false;
  }
  return true;
};

export const getLiabilityPayments = async (userId) => {
  if (!isSupabaseConfigured || !userId) return [];
  const { data, error } = await supabase
    .from('liability_payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code !== '42P01') {
      console.error('Error fetching liability payments:', error);
    }
    return [];
  }
  return data ? data.map(toCamel) : [];
};

export const rpcRecordLiabilityPayment = async (paymentData) => {
  if (!isSupabaseConfigured) {
    return { success: false, message: 'Supabase is not configured' };
  }

  const { data, error } = await supabase.rpc('record_liability_payment', {
    p_payment_id: paymentData.paymentId,
    p_liability_id: Number(paymentData.liabilityId),
    p_payment_date: paymentData.paymentDate || new Date().toISOString().split('T')[0],
    p_amount: Number(paymentData.amount),
    p_payment_method: paymentData.paymentMethod || 'Cash',
    p_notes: paymentData.notes || '',
    p_add_to_expense: paymentData.addToExpense !== undefined ? paymentData.addToExpense : true
  });

  if (error) {
    console.error('RPC record_liability_payment Error:', error);
    if (error.message?.includes('function') || error.message?.includes('does not exist') || error.code === '42883') {
      return { success: false, message: 'Supabase-এ record_liability_payment ফাংশনটি পাওয়া যায়নি। দয়া করে Supabase SQL Editor-এ নতুন SQL কোডটি Run করুন।' };
    }
    return { success: false, message: error.message };
  }

  return data;
};

export const getEmiInstallments = async (userId) => {
  if (!isSupabaseConfigured || !userId) return [];
  const { data, error } = await supabase
    .from('emi_installments')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });

  if (error) {
    if (error.code !== '42P01') {
      console.error('Error fetching emi_installments:', error);
    }
    return [];
  }
  return data ? data.map(toCamel) : [];
};

export const createEmiInstallments = async (userId, installmentsData) => {
  if (!isSupabaseConfigured || !userId) return { success: false, error: 'Supabase is not configured' };
  
  const payload = installmentsData.map(inst => ({
    user_id: userId,
    liability_id: inst.liabilityId,
    installment_number: inst.installmentNumber,
    due_date: inst.dueDate,
    expected_amount: inst.expectedAmount,
    status: 'Upcoming'
  }));

  const { error } = await supabase
    .from('emi_installments')
    .insert(payload);

  if (error) {
    console.error('Error creating emi_installments:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
};

export const rpcRecordEmiPayment = async (paymentData) => {
  if (!isSupabaseConfigured) {
    return { success: false, message: 'Supabase is not configured' };
  }

  const { data, error } = await supabase.rpc('record_emi_payment', {
    p_payment_id: paymentData.paymentId,
    p_liability_id: Number(paymentData.liabilityId),
    p_installment_id: paymentData.installmentId,
    p_payment_date: paymentData.paymentDate || new Date().toISOString().split('T')[0],
    p_amount: Number(paymentData.amount),
    p_payment_method: paymentData.paymentMethod || 'Cash',
    p_notes: paymentData.notes || '',
    p_add_to_expense: paymentData.addToExpense !== undefined ? paymentData.addToExpense : true
  });

  if (error) {
    console.error('RPC record_emi_payment Error:', error);
    if (error.message?.includes('function') || error.message?.includes('does not exist') || error.code === '42883') {
      return { success: false, message: 'Supabase-à¦ record_emi_payment à¦«à¦¾à¦‚à¦¶à¦¨à¦Ÿà¦¿ à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤ à¦¦à§Ÿà¦¾ à¦•à¦°à§‡ Supabase SQL Editor-à¦ à¦¨à¦¤à§à¦¨ SQL à¦•à§‹à¦¡à¦Ÿà¦¿ Run à¦•à¦°à§à¦¨à¥¤' };
    }
    return { success: false, message: error.message };
  }

  return data;
};
