import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        const storedPassword = await AsyncStorage.getItem('password');
        
        if (storedUser && storedPassword) {
          const user = JSON.parse(storedUser);
          const savedPassword = JSON.parse(storedPassword);
          
          // Normalize emails for comparison (trim whitespace and convert to lowercase)
          const normalizedStoredEmail = user.email?.trim().toLowerCase() || '';
          const normalizedInputEmail = email.trim().toLowerCase();
          
          // Check if email matches and password is correct
          if (normalizedStoredEmail === normalizedInputEmail && savedPassword === password) {
            set({ user, isAuthenticated: true });
            return true;
          } else {
            // User exists but credentials don't match
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
    AsyncStorage.removeItem('password');
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
      
      set({ user, isAuthenticated: true });
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('password', JSON.stringify(password)); // Store password separately
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