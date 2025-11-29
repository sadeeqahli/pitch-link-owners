import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (email: string, password: string) => {
    // Mock authentication - in a real app, this would be an API call
    if (email && password) {
      const user = {
        id: '1',
        name: 'John Doe',
        email: email,
      };
      
      set({ user, isAuthenticated: true });
      await AsyncStorage.setItem('user', JSON.stringify(user));
      return true;
    }
    return false;
  },
  
  logout: () => {
    set({ user: null, isAuthenticated: false });
    AsyncStorage.removeItem('user');
  },
  
  register: async (name: string, email: string, password: string) => {
    // Mock registration - in a real app, this would be an API call
    if (name && email && password) {
      const user = {
        id: Date.now().toString(),
        name,
        email,
      };
      
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
        set({ user: JSON.parse(storedUser), isAuthenticated: true });
      }
    } catch (error) {
      console.log('Error loading stored auth:', error);
    }
  },
}));