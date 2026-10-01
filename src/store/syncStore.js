import { useState, useEffect } from 'react';

let listeners = [];
let state = {
  status: navigator.onLine ? 'synced' : 'offline', // 'synced', 'syncing', 'error', 'offline'
  lastSyncedAt: Date.now(),
  inFlight: 0,
  hasUnsavedFailure: false
};

const notify = () => listeners.forEach(l => l(state));

export const getSyncState = () => state;

// Only used for internal offline/online events or updating state
export const updateSyncState = (updater) => {
  const next = typeof updater === 'function' ? updater(state) : updater;
  if (next !== state) {
    state = { ...state, ...next };
    notify();
  }
};

export const resetSyncState = () => {
  state = {
    status: 'syncing',
    lastSyncedAt: null,
    inFlight: 0,
    hasUnsavedFailure: false
  };
  notify();
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    updateSyncState(prev => ({ ...prev, status: prev.inFlight > 0 ? 'syncing' : (prev.hasUnsavedFailure || prev.status === 'error' ? 'error' : 'synced') }));
  });
  window.addEventListener('offline', () => {
    updateSyncState(prev => ({ ...prev, status: 'offline' }));
  });
}

export const isFailedResult = (r) => {
  if (r === null || r === false || r === undefined) return true;
  if (r && typeof r === 'object' && r.error) return true;
  if (r && typeof r === 'object' && r.success === false && !r.businessRejection) return true;
  return false;
};

/**
 * Wraps a promise to track sync status.
 * @param {Promise} promise 
 * @param {Object} options 
 * @param {boolean} options.isOptimistic - if true, failure is sticky (hasUnsavedFailure = true)
 * @param {boolean} options.isLoadUserData - if true, success clears sticky failures
 * @param {Function} options.isFailure - optional custom failure checking function
 * @returns {Promise}
 */
export const withSync = (promise, { isOptimistic = false, isLoadUserData = false, isFailure: customIsFailure } = {}) => {
  if (!promise) return promise;
  
  if (!navigator.onLine) {
    if (isOptimistic) {
      updateSyncState(prev => ({ ...prev, hasUnsavedFailure: true, status: 'offline' }));
    }
    return promise;
  }

  updateSyncState(prev => ({ ...prev, inFlight: prev.inFlight + 1, status: 'syncing' }));

  return promise
    .then(res => {
      let isFailed = false;
      
      if (customIsFailure) {
        isFailed = customIsFailure(res);
      } else if (Array.isArray(res)) {
        isFailed = res.some(isFailedResult);
      } else {
        isFailed = isFailedResult(res);
      }

      if (isFailed && import.meta.env.DEV) {
        console.warn('withSync resolved with failure:', res);
      }

      updateSyncState(prev => {
        const nextInFlight = Math.max(0, prev.inFlight - 1);
        
        if (isFailed) {
          return { 
            ...prev, 
            inFlight: nextInFlight, 
            status: 'error',
            hasUnsavedFailure: isOptimistic ? true : prev.hasUnsavedFailure
          };
        }

        // Success path
        let nextHasUnsaved = prev.hasUnsavedFailure;
        if (isLoadUserData) {
          nextHasUnsaved = false; // Only full reload clears optimistic failures
        }

        const nextStatus = nextInFlight > 0 ? 'syncing' : (nextHasUnsaved ? 'error' : 'synced');
        const nextLastSyncedAt = (nextInFlight === 0 && !nextHasUnsaved) ? Date.now() : prev.lastSyncedAt;

        return {
          ...prev,
          inFlight: nextInFlight,
          status: nextStatus,
          hasUnsavedFailure: nextHasUnsaved,
          lastSyncedAt: nextLastSyncedAt
        };
      });
      return res;
    })
    .catch(err => {
      if (import.meta.env.DEV) {
        console.warn('withSync caught failure:', err);
      }
      updateSyncState(prev => ({ 
        ...prev, 
        inFlight: Math.max(0, prev.inFlight - 1), 
        status: 'error',
        hasUnsavedFailure: isOptimistic ? true : prev.hasUnsavedFailure
      }));
      throw err;
    });
};

export const useSyncStore = () => {
  const [localState, setLocalState] = useState(state);
  
  useEffect(() => {
    listeners.push(setLocalState);
    return () => {
      listeners = listeners.filter(l => l !== setLocalState);
    };
  }, []);
  
  return localState;
};
