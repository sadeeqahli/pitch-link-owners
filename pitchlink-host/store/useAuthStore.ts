import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearUserData } from '@/utils/clearUserData';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  businessName?: string;
  numberOfPitches?: string;
  ownerType?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    location: string;
    businessName: string;
    numberOfPitches: string;
    ownerType: string;
  }) => Promise<boolean>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (email: string, password: string) => {
    // Mock authentication - in a real app, this would be an API call
    if (email && password) {
      try {
        // Check if user exists in storage
        const storedUser = await AsyncStorage.getItem('user');
        
        if (storedUser) {
          const user = JSON.parse(storedUser);
          
          // Normalize emails for comparison (trim whitespace and convert to lowercase)
          const normalizedStoredEmail = user.email?.trim().toLowerCase() || '';
          const normalizedInputEmail = email.trim().toLowerCase();
          
          // In a real app, you would validate the password here
          // For demo, we'll just check if the email matches
          if (normalizedStoredEmail === normalizedInputEmail) {
            set({ user, isAuthenticated: true });
            return true;
          } else {
            // User exists but email doesn't match
            return false;
          }
        } else {
          // No user found in storage
          return false;
        }
      } catch (error) {
        console.log('Login error:', error);
        return false;
      }
    }
    return false;
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    AsyncStorage.removeItem('user');
  },
  
  register: async (userData) => {
    const { name, email, phone, password, location, businessName, numberOfPitches, ownerType } = userData;
    
    // Mock registration - in a real app, this would be an API call
    if (name && email && phone && password && location && businessName && numberOfPitches && ownerType) {
      // Normalize email before storing (but keep original case for display)
      const normalizedEmail = email.trim().toLowerCase();
      
      const user = {
        id: Date.now().toString(),
        name,
        email: normalizedEmail, // Store normalized email for comparison
        phone,
        location,
        businessName,
        numberOfPitches,
        ownerType,
      };
      
      // Clear all existing data for the new user to ensure a clean start
      await clearUserData();
      
      set({ user, isAuthenticated: true });
      await AsyncStorage.setItem('user', JSON.stringify(user));
      return true;
    }
    return false;
  },

  loadStoredAuth: async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        set({ user: userData, isAuthenticated: true });
      }
    } catch (error) {
      console.log('Error loading stored auth:', error);
    }
  },

}));