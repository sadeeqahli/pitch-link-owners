import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Clears all user-specific data from AsyncStorage
 * This ensures new users start with a completely clean slate
 */
export const clearUserData = async (): Promise<void> => {
  try {
    // List of all keys that store user data
    const userDataKeys = [
      'pitches',
      'bookings',
      'payments',
    ];
    
    // Remove all user data
    await AsyncStorage.multiRemove(userDataKeys);
    
    console.log('User data cleared successfully');
  } catch (error) {
    console.error('Error clearing user data:', error);
    throw error;
  }
};

/**
 * Clears all application data including user authentication
 * This is used for complete app reset
 */
export const clearAllAppData = async (): Promise<void> => {
  try {
    // List of all keys that store app data
    const allDataKeys = [
      'user',
      'pitches',
      'bookings',
      'payments',
      'hasClearedSampleData'
    ];
    
    // Remove all app data
    await AsyncStorage.multiRemove(allDataKeys);
    
    console.log('All app data cleared successfully');
  } catch (error) {
    console.error('Error clearing all app data:', error);
    throw error;
  }
};