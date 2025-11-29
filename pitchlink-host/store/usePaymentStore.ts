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
}

export const usePaymentStore = create<PaymentState>((set: any, get: any) => ({
  payments: [],
  
  addPayment: (paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPayment: Payment = {
      id: Date.now().toString(),
      ...paymentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state: any) => {
      const updatedPayments = [...state.payments, newPayment];
      // Save to AsyncStorage
      AsyncStorage.setItem('payments', JSON.stringify(updatedPayments));
      return { payments: updatedPayments };
    });
  },
  
  updatePayment: (id: string, updates: Partial<Payment>) => {
    set((state: any) => {
      const updatedPayments = state.payments.map((payment: Payment) => 
        payment.id === id ? { ...payment, ...updates, updatedAt: new Date() } : payment
      );
      // Save to AsyncStorage
      AsyncStorage.setItem('payments', JSON.stringify(updatedPayments));
      return { payments: updatedPayments };
    });
  },
  
  deletePayment: (id: string) => {
    set((state: any) => {
      const updatedPayments = state.payments.filter((payment: Payment) => payment.id !== id);
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
        }));
        set({ payments: parsedPayments });
      }
    } catch (error) {
      console.log('Error loading payments:', error);
    }
  },
  
  getPaymentsByBooking: (bookingId: string) => {
    const { payments } = get();
    return payments.filter((payment: Payment) => payment.bookingId === bookingId);
  },
  
  getTotalRevenue: () => {
    const { payments } = get();
    return payments
      .filter((payment: Payment) => payment.status === 'paid')
      .reduce((total: number, payment: Payment) => total + payment.amount, 0);
  },
  
  getOutstandingPayments: () => {
    const { payments } = get();
    return payments.filter((payment: Payment) => payment.status === 'pending');
  },
}));