import { hasActivePaidSubscription, hasActiveTrial } from './subscriptionHelper';
import { PLANS } from './plans';

/**
 * PLAN MODULE PERMISSIONS MATRIX
 * 
 * 1. Starter (৳499):
 *    - Core (Dashboard, Tasks, Plan, Weekly, Income, Expense, Tuition)
 * 
 * 2. Pro Business (৳999) [Most Popular]:
 *    - All Starter features + CRM + Customer Dues + Services
 * 
 * 3. Business Plus (৳1,999):
 *    - All Pro Business features + Liabilities & Banking EMI
 */

export const PLAN_FEATURE_PERMISSIONS = {
  starter: [
    'dashboard',
    'tasks',
    'plan',
    'weekly',
    'income',
    'expense',
    'tuition',
    'settings'
  ],
  monthly_pro: [
    // Legacy mapping: treated as Pro Business
    'dashboard',
    'tasks',
    'plan',
    'weekly',
    'income',
    'expense',
    'tuition',
    'crm',
    'dues',
    'services',
    'settings'
  ],
  pro_business: [
    'dashboard',
    'tasks',
    'plan',
    'weekly',
    'income',
    'expense',
    'tuition',
    'crm',
    'dues',
    'services',
    'settings'
  ],
  agency: [
    'dashboard',
    'tasks',
    'plan',
    'weekly',
    'income',
    'expense',
    'tuition',
    'crm',
    'dues',
    'services',
    'liabilities',
    'settings'
  ]
};

/**
 * Metadata for locked features (used in Upgrade Modals/Prompts)
 */
export const FEATURE_METADATA = {
  crm: {
    name: 'ক্লায়েন্ট CRM (Lead Pipeline)',
    requiredPlanId: 'pro_business',
    requiredPlanName: 'Pro Business',
    requiredPlanPrice: 999,
    description: 'লিড পাইপলাইন, ডিল ভ্যালু, অ্যাডভান্স এবং ক্লায়েন্ট ফলো-আপ পরিচালনা করার জন্য Pro Business প্ল্যানে আপগ্রেড করুন।'
  },
  dues: {
    name: 'পাওনা ম্যানেজমেন্ট (Customer Dues)',
    requiredPlanId: 'pro_business',
    requiredPlanName: 'Pro Business',
    requiredPlanPrice: 999,
    description: 'কোন কাস্টমারের কাছে কত বাকি আছে এবং কিস্তির বকেয়া আদায় ট্র্যাক করতে Pro Business প্ল্যানে আপগ্রেড করুন।'
  },
  services: {
    name: 'সার্ভিস ও অফার ক্যাটালগ (Services)',
    requiredPlanId: 'pro_business',
    requiredPlanName: 'Pro Business',
    requiredPlanPrice: 999,
    description: 'আপনার এজেন্সির সার্ভিস এবং প্রাইসিং প্যাকেজ ক্যাটালগ সাজাতে Pro Business প্ল্যানে আপগ্রেড করুন।'
  },
  liabilities: {
    name: 'দেনা ও কিস্তি (Liabilities & EMI)',
    requiredPlanId: 'agency',
    requiredPlanName: 'Business Plus',
    requiredPlanPrice: 1999,
    description: 'ব্যাংক লোন, ডিপিএস এবং ব্যক্তিগত দেনার কিস্তি ও পরিশোধের হিসাব রাখতে Business Plus প্ল্যানে আপগ্রেড করুন।'
  }
};

/**
 * Determine user's effective plan ID.
 * - If Admin: bypass (returns 'admin')
 * - If Active Paid: returns subscription.planId (default 'starter')
 * - If Active Free Trial: returns 'pro_business' (to give them high-converting trial experience)
 * - Otherwise: 'starter'
 */
export const getEffectivePlanId = (subscription, isAdmin = false) => {
  if (isAdmin) return 'agency'; // Admin has full access to all features

  if (hasActivePaidSubscription(subscription)) {
    return subscription.planId || 'starter';
  }

  if (hasActiveTrial(subscription)) {
    // Free trial users get Pro Business to explore CRM & Dues!
    return 'pro_business';
  }

  return 'starter';
};

/**
 * Check if a specific module/feature is unlocked for the current subscription.
 */
export const isFeatureAllowed = (featureId, subscription, isAdmin = false) => {
  if (isAdmin) return true; // Admins bypass all limits

  try {
    const planId = getEffectivePlanId(subscription, isAdmin);
    const allowedFeatures = PLAN_FEATURE_PERMISSIONS[planId] || PLAN_FEATURE_PERMISSIONS.starter || [];

    return Array.isArray(allowedFeatures) ? allowedFeatures.includes(featureId) : false;
  } catch {
    return false;
  }
};
