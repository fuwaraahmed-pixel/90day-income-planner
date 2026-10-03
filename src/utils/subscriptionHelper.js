export const hasActivePaidSubscription = (subscription) => {
  if (!subscription) return false;

  const isActive = subscription.status === 'active';
  const notExpired =
    subscription.expiresAt &&
    new Date(subscription.expiresAt) > new Date();

  return Boolean(isActive && notExpired);
};

export const hasActiveTrial = (subscription) => {
  if (!subscription) return false;

  const hasValidEnd =
    subscription.trialEndsAt &&
    new Date(subscription.trialEndsAt) > new Date();

  const notEnded = !subscription.trialEndedAt;

  return Boolean(hasValidEnd && notEnded);
};

export const isSubscribed = (subscription, isAdmin) => {
  if (isAdmin) return true; // Admin bypasses subscription locks

  return (
    hasActivePaidSubscription(subscription) ||
    hasActiveTrial(subscription)
  );
};
