import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePaymentStore } from './usePaymentStore';

export interface Booking {
  id: string;
  customerName: string;
  customerEmail?: string; // Make it optional to avoid breaking changes
  customerPhone: string;
  pitchId: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  duration: number; // Duration in hours
  totalPrice: number;
  status: 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  // New fields for payment tracking
  amountPaid: number;
  paymentType: 'full' | 'partial' | 'later';
  // New field for booking source
  source: 'player-app' | 'manual';
}

interface BookingState {
  bookings: Booking[];
  addBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
  cancelBooking: (id: string) => void; // Add cancelBooking to the interface
  loadBookings: () => Promise<void>;
  getBookingsByPitch: (pitchId: string) => Booking[];
  getBookingsByDate: (date: Date) => Booking[];
  getBookingsByStatus: (status: Booking['status']) => Booking[];
  // New methods for payment tracking
  addPayment: (bookingId: string, amount: number) => void;
  // New methods for the payments module
  getPlayerAppBookings: () => Booking[];
  getManualBookings: () => Booking[];
  // Check for booking conflicts (updated to allow manual bookings for cancelled slots)
  checkForConflicts: (pitchId: string, startTime: string, endTime: string, date: Date, excludeBookingId?: string) => boolean;
}

export const useBookingStore = create<BookingState>()((set, get) => ({
  bookings: [], // Always initialize with empty array
  
  addBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Ensure correct initial status based on current time
    const now = new Date();
    const bookingDate = new Date(bookingData.bookingDate);
    const [startHours, startMinutes] = bookingData.startTime.split(':').map(Number);
    bookingDate.setHours(startHours, startMinutes, 0, 0);
    
    const bookingEnd = new Date(bookingDate);
    bookingEnd.setHours(bookingEnd.getHours() + (bookingData.duration || 1));
    
    // Set initial status based on time
    let initialStatus: 'confirmed' | 'ongoing' | 'completed' | 'cancelled' = 'confirmed';
    
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
      status: initialStatus as 'confirmed' | 'ongoing' | 'completed' | 'cancelled',
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
        const parsedBookings: Booking[] = JSON.parse(storedBookings).map((booking: any) => {
          // Convert status with explicit typing
          let status: 'confirmed' | 'ongoing' | 'completed' | 'cancelled' = 'confirmed';
          if (booking.status === 'pending') {
            status = 'confirmed';
          } else if (booking.status === 'ongoing') {
            status = 'ongoing';
          } else if (booking.status === 'completed') {
            status = 'completed';
          } else if (booking.status === 'cancelled') {
            status = 'cancelled';
          } else {
            status = 'confirmed'; // default fallback
          }
          
          return {
            ...booking,
            bookingDate: new Date(booking.bookingDate),
            createdAt: new Date(booking.createdAt),
            updatedAt: new Date(booking.updatedAt),
            // Set default values for new fields
            amountPaid: booking.amountPaid || 0,
            paymentType: booking.paymentType || 'later',
            duration: booking.duration || 1,
            // Use explicitly typed status
            status,
            // Set default source if not present
            source: booking.source || 'manual',
          };
        });
        set({ bookings: parsedBookings });
      }
      // If no bookings found, state remains with empty array (already initialized)
    } catch (error) {
      console.log('Error loading bookings:', error);
      // State remains with empty array (already initialized)
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
  
  // Check for booking conflicts (updated to allow manual bookings for cancelled slots)
  checkForConflicts: (pitchId: string, startTime: string, endTime: string, date: Date, excludeBookingId?: string) => {
    const { bookings } = get();
    const selectedPitchBookings = bookings.filter(booking => 
      booking.pitchId === pitchId && 
      booking.id !== excludeBookingId &&
      booking.status !== 'cancelled' // Allow booking over cancelled slots
    );
    
    const newStartDateTime = new Date(date);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    newStartDateTime.setHours(startHours, startMinutes, 0, 0);
    
    const newEndDateTime = new Date(date);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    newEndDateTime.setHours(endHours, endMinutes, 0, 0);
    
    return selectedPitchBookings.some(booking => {
      const existingStart = new Date(booking.bookingDate);
      const [existingStartHours, existingStartMinutes] = booking.startTime.split(':').map(Number);
      existingStart.setHours(existingStartHours, existingStartMinutes, 0, 0);
      
      const existingEnd = new Date(booking.bookingDate);
      const [existingEndHours, existingEndMinutes] = booking.endTime.split(':').map(Number);
      existingEnd.setHours(existingEndHours, existingEndMinutes, 0, 0);
      
      return (
        existingStart < newEndDateTime && 
        existingEnd > newStartDateTime
      );
    });
  },
  
  // Add cancelBooking method
  cancelBooking: (id: string) => {
    set((state) => {
      const updatedBookings = state.bookings.map((booking) => 
        booking.id === id ? { ...booking, status: 'cancelled' as 'cancelled', updatedAt: new Date() } : booking
      );
      // Save to AsyncStorage
      AsyncStorage.setItem('bookings', JSON.stringify(updatedBookings));
      return { bookings: updatedBookings };
    });
  },

}));