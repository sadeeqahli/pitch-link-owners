import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pitch } from './usePitchStore';

export interface Booking {
  id: string;
  pitchId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: Date;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

interface BookingState {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
  loadBookings: () => Promise<void>;
  getBookingsByPitch: (pitchId: string) => Booking[];
  getBookingsByDate: (date: Date) => Booking[];
}

export const useBookingStore = create<BookingState>((set: any, get: any) => ({
  bookings: [],
  
  addBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBooking: Booking = {
      id: Date.now().toString(),
      ...bookingData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state: any) => {
      const updatedBookings = [...state.bookings, newBooking];
      // Save to AsyncStorage
      AsyncStorage.setItem('bookings', JSON.stringify(updatedBookings));
      return { bookings: updatedBookings };
    });
  },
  
  updateBooking: (id: string, updates: Partial<Booking>) => {
    set((state: any) => {
      const updatedBookings = state.bookings.map((booking: Booking) => 
        booking.id === id ? { ...booking, ...updates, updatedAt: new Date() } : booking
      );
      // Save to AsyncStorage
      AsyncStorage.setItem('bookings', JSON.stringify(updatedBookings));
      return { bookings: updatedBookings };
    });
  },
  
  deleteBooking: (id: string) => {
    set((state: any) => {
      const updatedBookings = state.bookings.filter((booking: Booking) => booking.id !== id);
      // Save to AsyncStorage
      AsyncStorage.setItem('bookings', JSON.stringify(updatedBookings));
      return { bookings: updatedBookings };
    });
  },
  
  loadBookings: async () => {
    try {
      const storedBookings = await AsyncStorage.getItem('bookings');
      if (storedBookings) {
        const parsedBookings = JSON.parse(storedBookings).map((booking: any) => ({
          ...booking,
          bookingDate: new Date(booking.bookingDate),
          createdAt: new Date(booking.createdAt),
          updatedAt: new Date(booking.updatedAt),
        }));
        set({ bookings: parsedBookings });
      }
    } catch (error) {
      console.log('Error loading bookings:', error);
    }
  },
  
  getBookingsByPitch: (pitchId: string) => {
    const { bookings } = get();
    return bookings.filter((booking: Booking) => booking.pitchId === pitchId);
  },
  
  getBookingsByDate: (date: Date) => {
    const { bookings } = get();
    return bookings.filter((booking: Booking) => 
      booking.bookingDate.toDateString() === date.toDateString()
    );
  },
}));