export const isSubscribed = (subscription, isAdmin) => {
  if (isAdmin) return true; // Admin bypasses subscription locks
  if (!subscription) return false;
  
  const isActive = subscription.status === 'active';
  const notExpired = subscription.expiresAt && new Date(subscription.expiresAt) > new Date();
  
  return isActive && notExpired;
};
