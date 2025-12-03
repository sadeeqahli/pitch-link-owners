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
        // Load all stored data
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