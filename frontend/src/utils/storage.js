// Utility functions for localStorage operations with error handling

import { applyMigration } from './dataMigration';

export const storageKeys = {
  TASKS: 'tasks',
  EVENTS: 'events',
  PROFILE: 'profile',
  PROFILE_NOTIFICATIONS: 'profile_notifications',
  PROFILE_STATS: 'profile_stats',
  DASHBOARD_STATS: 'dashboard_stats',
  FCM_TOKEN: 'fcmToken',
  AUTH_TOKEN: 'token'
};

// Get a namespaced key for user-specific data
export const getUserKey = (baseKey, userId) => {
  return `${baseKey}_${userId}`;
};

// Save data to localStorage with error handling
export const saveToStorage = (key, data, userId = null) => {
  try {
    const storageKey = userId ? getUserKey(key, userId) : key;
    localStorage.setItem(storageKey, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
};

// Load data from localStorage with error handling and migration
export const loadFromStorage = (key, userId = null, defaultValue = null, dataType = null) => {
  try {
    const storageKey = userId ? getUserKey(key, userId) : key;
    const data = localStorage.getItem(storageKey);
    if (data === null) {
      return defaultValue;
    }
    
    const parsedData = JSON.parse(data);
    
    // Apply migration if data type is specified
    if (dataType && parsedData) {
      const migratedData = applyMigration(parsedData, dataType);
      // Save migrated data back to storage
      if (migratedData !== parsedData) {
        saveToStorage(key, migratedData, userId);
      }
      return migratedData.data || migratedData;
    }
    
    return parsedData;
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

// Remove data from localStorage
export const removeFromStorage = (key, userId = null) => {
  try {
    const storageKey = userId ? getUserKey(key, userId) : key;
    localStorage.removeItem(storageKey);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
};

// Clear all user-specific data
export const clearUserData = (userId) => {
  if (!userId) return;
  
  Object.values(storageKeys).forEach(key => {
    if (key !== storageKeys.FCM_TOKEN && key !== storageKeys.AUTH_TOKEN) {
      removeFromStorage(key, userId);
    }
  });
};

// Check if localStorage is available
export const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
};

// Get storage usage information
export const getStorageInfo = () => {
  try {
    const used = new Blob(Object.values(localStorage)).size;
    const total = 5 * 1024 * 1024; // 5MB typical limit
    return {
      used,
      total,
      percentage: (used / total) * 100
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return null;
  }
};

// Export data for backup
export const exportUserData = (userId) => {
  if (!userId) return null;
  
  const exportData = {};
  Object.values(storageKeys).forEach(key => {
    if (key !== storageKeys.FCM_TOKEN && key !== storageKeys.AUTH_TOKEN) {
      const data = loadFromStorage(key, userId);
      if (data) {
        exportData[key] = data;
      }
    }
  });
  
  return exportData;
};

// Import data from backup
export const importUserData = (userId, data) => {
  if (!userId || !data) return false;
  
  try {
    Object.entries(data).forEach(([key, value]) => {
      if (Object.values(storageKeys).includes(key)) {
        saveToStorage(key, value, userId);
      }
    });
    return true;
  } catch (error) {
    console.error('Error importing user data:', error);
    return false;
  }
}; 