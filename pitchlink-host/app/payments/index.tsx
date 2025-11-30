import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePaymentStore } from '@/store/usePaymentStore';
import { useBookingStore } from '@/store/useBookingStore';
import { Card, CardContent } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { formatDate } from '@/utils/dateUtils';

export default function PaymentsScreen() {
  const router = useRouter();
  const payments = usePaymentStore((state) => state.payments);
  const bookings = useBookingStore((state) => state.bookings);
  const getTotalRevenue = usePaymentStore((state) => state.getTotalRevenue);
  const getOutstandingPayments = usePaymentStore((state) => state.getOutstandingPayments);
  
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
  
  const totalRevenue = getTotalRevenue();
  const outstandingPayments = getOutstandingPayments();
  
  // Filter payments based on selected filter
  const filteredPayments = payments.filter((payment) => {
    // Only show player app payments in this screen
    if (payment.source !== 'player-app') return false;
    
    switch (filter) {
      case 'paid':
        return payment.status === 'paid';
      case 'pending':
        return payment.status === 'pending';
      case 'failed':
        return payment.status === 'failed';
      default:
        return true;
    }
  });
  
  // Get customer name by booking ID
  const getCustomerName = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    return booking ? booking.customerName : 'Unknown Customer';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Payments</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <CardContent style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
            <Text style={styles.summaryValue}>₦{totalRevenue.toFixed(2)}</Text>
            <Text style={styles.summarySubtext}>After 10% platform fee</Text>
          </CardContent>
        </Card>
        
        <Card style={styles.summaryCard}>
          <CardContent style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>Outstanding</Text>
            <Text style={styles.summaryValue}>₦{outstandingPayments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}</Text>
          </CardContent>
        </Card>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'paid' && styles.activeFilter]}
          onPress={() => setFilter('paid')}
        >
          <Text style={[styles.filterText, filter === 'paid' && styles.activeFilterText]}>Paid</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'pending' && styles.activeFilter]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.activeFilterText]}>Pending</Text>
        </TouchableOpacity>
      </View>

      {filteredPayments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="creditcard.fill" size={64} color="#333333" />
          <Text style={styles.emptyText}>No payments found</Text>
          <Text style={styles.emptySubtext}>
            {filter === 'all' 
              ? 'No payment records yet' 
              : `No ${filter} payments`}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.paymentsContainer}>
            {filteredPayments.map((payment) => (
              <TouchableOpacity 
                key={payment.id} 
                style={styles.paymentCard}
                onPress={() => router.push(`/payments/${payment.id}`)}
              >
                <Card style={styles.card}>
                  <CardContent style={styles.cardContent}>
                    <View style={styles.paymentHeader}>
                      <Text style={styles.paymentTitle}>Payment #{payment.id.substring(0, 8)}</Text>
                      <View style={[
                        styles.statusBadge,
                        payment.status === 'pending' && styles.statusPending,
                        payment.status === 'paid' && styles.statusPaid,
                        payment.status === 'failed' && styles.statusFailed,
                        payment.status === 'refunded' && styles.statusRefunded,
                      ]}>
                        <Text style={styles.statusText}>{payment.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.customerName}>{getCustomerName(payment.bookingId)}</Text>
                    <Text style={styles.paymentAmount}>₦{(payment.amount * 0.9).toFixed(2)}</Text>
                    <Text style={styles.originalAmount}>₦{payment.amount.toFixed(2)}</Text>
                    <Text style={styles.paymentMethod}>
                      Method: {payment.paymentMethod === 'card' ? 'Card Payment' : 
                               payment.paymentMethod === 'transfer' ? 'Bank Transfer' : 'Cash'}
                    </Text>
                    <Text style={styles.paymentDate}>
                      {formatDate(new Date(payment.createdAt))}
                    </Text>
                    <View style={styles.sourceBadge}>
                      <Text style={styles.sourceText}>
                        {payment.source === 'player-app' ? 'Player App Payment' : 'Manual Booking'}
                      </Text>
                    </View>
                  </CardContent>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  card: {
    backgroundColor: '#1E1E1E',
  },
  summaryContent: {
    padding: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00FF88',
  },
  summarySubtext: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  filterText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#000000',
  },
  paymentsContainer: {
    padding: 16,
    gap: 16,
  },
  paymentCard: {
    // TouchableOpacity wrapper
  },
  cardContent: {
    padding: 16,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  customerName: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusPending: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
  },
  statusPaid: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  statusFailed: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
  },
  statusRefunded: {
    backgroundColor: 'rgba(100, 100, 255, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  paymentAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FF88',
    marginBottom: 4,
  },
  originalAmount: {
    fontSize: 14,
    color: '#888888',
    textDecorationLine: 'line-through',
    marginBottom: 8,
  },
  paymentMethod: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 8,
  },
  sourceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  sourceText: {
    fontSize: 12,
    color: '#00FF88',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 24,
  },
});