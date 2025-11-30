import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { usePitchStore } from '@/store/usePitchStore';
import { useBookingStore } from '@/store/useBookingStore';
import { usePaymentStore } from '@/store/usePaymentStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useInitializeApp = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const loadStoredAuth = useAuthStore((state: any) => state.loadStoredAuth);
  const loadPitches = usePitchStore((state: any) => state.loadPitches);
  const loadBookings = useBookingStore((state: any) => state.loadBookings);
  const loadPayments = usePaymentStore((state: any) => state.loadPayments);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Check if we've already cleared the sample data
        const hasClearedSampleData = await AsyncStorage.getItem('hasClearedSampleData');
        
        if (!hasClearedSampleData) {
          // Clear existing sample/fake data
          await Promise.all([
            AsyncStorage.removeItem('pitches'),
            AsyncStorage.removeItem('bookings'),
            AsyncStorage.removeItem('payments'),
          ]);
          
          // Mark that we've cleared the sample data
          await AsyncStorage.setItem('hasClearedSampleData', 'true');
        }
        
        // Load all stored data (which should now be empty)
        await Promise.all([
          loadStoredAuth(),
          loadPitches(),
          loadBookings(),
          loadPayments(),
        ]);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsInitialized(true); // Still set to true to avoid infinite loading
      }
    };

    initialize();
  }, [loadStoredAuth, loadPitches, loadBookings, loadPayments]);

  return { isInitialized };
};