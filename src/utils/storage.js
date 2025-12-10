import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility function to clear all AsyncStorage data
 * Use this if you encounter persistent storage-related errors
 */
export const clearAllStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('AsyncStorage cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing AsyncStorage:', error);
    return false;
  }
};

/**
 * Clear only authentication-related storage
 */
export const clearAuthStorage = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
    console.log('Auth storage cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing auth storage:', error);
    return false;
  }
};

/**
 * Get all keys in AsyncStorage (for debugging)
 */
export const getAllStorageKeys = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log('AsyncStorage keys:', keys);
    return keys;
  } catch (error) {
    console.error('Error getting storage keys:', error);
    return [];
  }
};

/**
 * Get all data in AsyncStorage (for debugging)
 */
export const getAllStorageData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const data = await AsyncStorage.multiGet(keys);
    const storageData = {};
    data.forEach(([key, value]) => {
      storageData[key] = value;
    });
    console.log('AsyncStorage data:', storageData);
    return storageData;
  } catch (error) {
    console.error('Error getting storage data:', error);
    return {};
  }
};
