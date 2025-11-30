import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pitch } from './usePitchStore';
import { usePaymentStore } from './usePaymentStore';

export interface Booking {
  id: string;
  pitchId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: Date;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  status: 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
  totalPrice: number;
  amountPaid: number; // Track partial payments
  paymentType: 'full' | 'half' | 'later' | 'offline' | 'transfer';
  duration: number; // in hours
  createdAt: Date;
  updatedAt: Date;
  // Added source to distinguish between player app and manual bookings
  source: 'player-app' | 'manual';
}

interface BookingState {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
  loadBookings: () => Promise<void>;
  getBookingsByPitch: (pitchId: string) => Booking[];
  getBookingsByDate: (date: Date) => Booking[];
  getBookingsByStatus: (status: Booking['status']) => Booking[];
  // New methods for payment tracking
  addPayment: (bookingId: string, amount: number) => void;
  // New methods for the payments module
  getPlayerAppBookings: () => Booking[];
  getManualBookings: () => Booking[];
}

export const useBookingStore = create<BookingState>()((set, get) => ({
  bookings: [],
  
  addBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Ensure correct initial status based on current time
    const now = new Date();
    const bookingDate = new Date(bookingData.bookingDate);
    const [startHours, startMinutes] = bookingData.startTime.split(':').map(Number);
    bookingDate.setHours(startHours, startMinutes, 0, 0);
    
    const bookingEnd = new Date(bookingDate);
    bookingEnd.setHours(bookingEnd.getHours() + (bookingData.duration || 1));
    
    // Set initial status based on time
    let initialStatus: 'confirmed' | 'ongoing' | 'completed' = 'confirmed';
    
    if (bookingDate > now) {
      // Future booking
      initialStatus = 'confirmed';
    } else if (bookingDate <= now && bookingEnd > now) {
      // Currently ongoing
      initialStatus = 'ongoing';
    } else if (bookingEnd <= now) {
      // Already completed
      initialStatus = 'completed';
    }
    
    const newBooking: Booking = {
      id: Date.now().toString(),
      ...bookingData,
      status: initialStatus,
      source: bookingData.source || 'manual', // Default to manual if not specified
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => {
      const updatedBookings = [...state.bookings, newBooking];
      // Save to AsyncStorage
      AsyncStorage.setItem('bookings', JSON.stringify(updatedBookings));
      
      // If this is a player app booking, automatically create a payment
      if (newBooking.source === 'player-app' && newBooking.totalPrice > 0) {
        // Add a small delay to ensure the booking is saved first
        setTimeout(() => {
          const paymentStore = usePaymentStore.getState();
          paymentStore.addPayment({
            bookingId: newBooking.id,
            amount: newBooking.totalPrice,
            status: 'paid', // Assume player app payments are immediately paid
            paymentMethod: 'card', // Default to card for player app
            source: 'player-app',
          });
        }, 100);
      }
      
      return { bookings: updatedBookings };
    });
  },
  
  updateBooking: (id: string, updates: Partial<Booking>) => {
    set((state) => {
      const updatedBookings = state.bookings.map((booking) => 
        booking.id === id ? { ...booking, ...updates, updatedAt: new Date() } : booking
      );
      // Save to AsyncStorage
      AsyncStorage.setItem('bookings', JSON.stringify(updatedBookings));
      return { bookings: updatedBookings };
    });
  },
  
  deleteBooking: (id: string) => {
    set((state) => {
      const updatedBookings = state.bookings.filter((booking) => booking.id !== id);
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
          // Set default values for new fields
          amountPaid: booking.amountPaid || 0,
          paymentType: booking.paymentType || 'later',
          duration: booking.duration || 1,
          // Convert pending status to confirmed for backward compatibility
          status: booking.status === 'pending' ? 'confirmed' : booking.status,
          // Set default source if not present
          source: booking.source || 'manual',
        }));
        set({ bookings: parsedBookings });
      }
    } catch (error) {
      console.log('Error loading bookings:', error);
    }
  },
  
  getBookingsByPitch: (pitchId: string) => {
    const { bookings } = get();
    return bookings.filter((booking) => booking.pitchId === pitchId);
  },
  
  getBookingsByDate: (date: Date) => {
    const { bookings } = get();
    return bookings.filter((booking) => 
      booking.bookingDate.toDateString() === date.toDateString()
    );
  },
  
  getBookingsByStatus: (status: Booking['status']) => {
    const { bookings } = get();
    return bookings.filter((booking) => booking.status === status);
  },
  
  // New method for payment tracking
  addPayment: (bookingId: string, amount: number) => {
    set((state) => {
      const updatedBookings = state.bookings.map((booking) => {
        if (booking.id === bookingId) {
          const newAmountPaid = booking.amountPaid + amount;
          return {
            ...booking,
            amountPaid: newAmountPaid,
            updatedAt: new Date(),
          };
        }
        return booking;
      });
      // Save to AsyncStorage
      AsyncStorage.setItem('bookings', JSON.stringify(updatedBookings));
      return { bookings: updatedBookings };
    });
  },
  
  // New methods for the payments module
  getPlayerAppBookings: () => {
    const { bookings } = get();
    return bookings.filter((booking) => booking.source === 'player-app');
  },
  
  getManualBookings: () => {
    const { bookings } = get();
    return bookings.filter((booking) => booking.source === 'manual');
  },
}));