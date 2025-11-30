import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking } from './useBookingStore';

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'cash' | 'card' | 'transfer';
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
  // Added source to distinguish between player app and manual bookings
  source: 'player-app' | 'manual';
}

interface PaymentState {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  loadPayments: () => Promise<void>;
  getPaymentsByBooking: (bookingId: string) => Payment[];
  getTotalRevenue: () => number;
  getOutstandingPayments: () => Payment[];
  // New methods for the payments module
  getPlayerAppPayments: () => Payment[];
  getManualPayments: () => Payment[];
  getPaymentsByDateRange: (startDate: Date, endDate: Date) => Payment[];
  getPaymentsByPitch: (pitchId: string, bookings: Booking[]) => Payment[];
}

export const usePaymentStore = create<PaymentState>()((set, get) => ({
  payments: [],
  
  addPayment: (paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPayment: Payment = {
      id: Date.now().toString(),
      ...paymentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => {
      const updatedPayments = [...state.payments, newPayment];
      // Save to AsyncStorage
      AsyncStorage.setItem('payments', JSON.stringify(updatedPayments));
      return { payments: updatedPayments };
    });
  },
  
  updatePayment: (id: string, updates: Partial<Payment>) => {
    set((state) => {
      const updatedPayments = state.payments.map((payment) => 
        payment.id === id ? { ...payment, ...updates, updatedAt: new Date() } : payment
      );
      // Save to AsyncStorage
      AsyncStorage.setItem('payments', JSON.stringify(updatedPayments));
      return { payments: updatedPayments };
    });
  },
  
  deletePayment: (id: string) => {
    set((state) => {
      const updatedPayments = state.payments.filter((payment) => payment.id !== id);
      // Save to AsyncStorage
      AsyncStorage.setItem('payments', JSON.stringify(updatedPayments));
      return { payments: updatedPayments };
    });
  },
  
  loadPayments: async () => {
    try {
      const storedPayments = await AsyncStorage.getItem('payments');
      if (storedPayments) {
        const parsedPayments = JSON.parse(storedPayments).map((payment: any) => ({
          ...payment,
          createdAt: new Date(payment.createdAt),
          updatedAt: new Date(payment.updatedAt),
          // Set default source if not present
          source: payment.source || 'manual',
        }));
        set({ payments: parsedPayments });
      }
    } catch (error) {
      console.log('Error loading payments:', error);
    }
  },
  
  getPaymentsByBooking: (bookingId: string) => {
    const { payments } = get();
    return payments.filter((payment) => payment.bookingId === bookingId);
  },
  
  getTotalRevenue: () => {
    const { payments } = get();
    // Only count paid player app payments (after 10% fee)
    return payments
      .filter((payment) => payment.status === 'paid' && payment.source === 'player-app')
      .reduce((total, payment) => total + (payment.amount * 0.9), 0);
  },
  
  getOutstandingPayments: () => {
    const { payments } = get();
    return payments.filter((payment) => payment.status === 'pending');
  },
  
  // New methods for the payments module
  getPlayerAppPayments: () => {
    const { payments } = get();
    return payments.filter((payment) => payment.source === 'player-app');
  },
  
  getManualPayments: () => {
    const { payments } = get();
    return payments.filter((payment) => payment.source === 'manual');
  },
  
  getPaymentsByDateRange: (startDate: Date, endDate: Date) => {
    const { payments } = get();
    return payments.filter((payment) => {
      const paymentDate = new Date(payment.createdAt);
      return paymentDate >= startDate && paymentDate <= endDate;
    });
  },
  
  getPaymentsByPitch: (pitchId: string, bookings: Booking[]) => {
    const { payments } = get();
    // Filter bookings by pitchId and get their IDs
    const bookingIds = bookings
      .filter(booking => booking.pitchId === pitchId)
      .map(booking => booking.id);
    
    // Return payments that match those booking IDs
    return payments.filter(payment => bookingIds.includes(payment.bookingId));
  },
}));