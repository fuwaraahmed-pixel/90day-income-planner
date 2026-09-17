/**
 * Simple, safe LocalStorage Persistence Utility for Income Manager App
 * Versioning Key: STORAGE_VERSION_V1
 */

const STORAGE_PREFIX = 'income_manager_v1_';

export const STORAGE_KEYS = {
  APP_DATA: `${STORAGE_PREFIX}appData`,
  PLAN_DATA: `${STORAGE_PREFIX}planData`,
  TASKS: `${STORAGE_PREFIX}tasks`,
  LEADS: `${STORAGE_PREFIX}leads`,
  INCOMES: `${STORAGE_PREFIX}incomes`,
  EXPENSES: `${STORAGE_PREFIX}expenses`,
  REVIEWS: `${STORAGE_PREFIX}reviews`,
  SERVICES: `${STORAGE_PREFIX}services`,
  CRM_PAYMENTS: `${STORAGE_PREFIX}crm_payments`,
};

/**
 * Safely load data from LocalStorage
 * @param {string} key 
 * @param {any} defaultValue 
 * @returns {any}
 */
export const loadData = (key, defaultValue) => {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) {
      return defaultValue;
    }
    return JSON.parse(serialized);
  } catch (error) {
    console.error(`Error loading key "${key}" from localStorage:`, error);
    return defaultValue;
  }
};

/**
 * Safely save data to LocalStorage
 * @param {string} key 
 * @param {any} value 
 */
export const saveData = (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`Error saving key "${key}" to localStorage:`, error);
  }
};

/**
 * Remove data from LocalStorage
 * @param {string} key 
 */
export const removeData = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing key "${key}" from localStorage:`, error);
  }
};

/**
 * Export all app data as a single JSON snapshot
 * (Useful for backup or future Google Sheets API sync)
 */
export const exportAppSnapshot = (stateSnapshot) => {
  return {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    data: stateSnapshot
  };
};
