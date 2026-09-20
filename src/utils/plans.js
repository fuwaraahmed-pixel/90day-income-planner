export const PLANS = {
  STARTER: {
    id: 'starter',
    name: 'Starter',
    price: 499,
    cycle: 'monthly',
  },
  MONTHLY_PRO: {
    id: 'monthly_pro',
    name: 'Monthly Pro',
    price: 500, // Legacy/historical plan, preserved for backward compatibility
    cycle: 'monthly',
  },
  PRO_BUSINESS: {
    id: 'pro_business',
    name: 'Pro Business',
    price: 999,
    cycle: 'monthly',
  },
  AGENCY: {
    id: 'agency',
    name: 'Agency',
    price: 1999,
    cycle: 'monthly',
  }
};

export const DEFAULT_PLAN = PLANS.STARTER;
