import AsyncStorage from '@react-native-async-storage/async-storage';

const clearAllData = async () => {
  try {
    // Clear all data from AsyncStorage
    await AsyncStorage.clear();
    console.log('All data cleared successfully');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// Run the function
clearAllData();