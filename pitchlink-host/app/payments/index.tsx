import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePaymentStore } from '@/store/usePaymentStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/dateUtils';

export default function PaymentsScreen() {
  const payments = usePaymentStore((state: any) => state.payments);
  const getTotalRevenue = usePaymentStore((state: any) => state.getTotalRevenue);
  const getOutstandingPayments = usePaymentStore((state: any) => state.getOutstandingPayments);
  
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
  
  const totalRevenue = getTotalRevenue();
  const outstandingPayments = getOutstandingPayments();
  
  const filteredPayments = payments.filter((payment: any) => {
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
            <Text style={styles.summaryValue}>${totalRevenue.toFixed(2)}</Text>
          </CardContent>
        </Card>
        
        <Card style={styles.summaryCard}>
          <CardContent style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>Outstanding</Text>
            <Text style={styles.summaryValue}>${outstandingPayments.reduce((sum: number, payment: any) => sum + payment.amount, 0).toFixed(2)}</Text>
          </CardContent>
        </Card>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <Button 
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          variant={filter === 'all' ? 'default' : 'outline'}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
        </Button>
        <Button 
          style={[styles.filterButton, filter === 'paid' && styles.activeFilter]}
          variant={filter === 'paid' ? 'default' : 'outline'}
          onPress={() => setFilter('paid')}
        >
          <Text style={[styles.filterText, filter === 'paid' && styles.activeFilterText]}>Paid</Text>
        </Button>
        <Button 
          style={[styles.filterButton, filter === 'pending' && styles.activeFilter]}
          variant={filter === 'pending' ? 'default' : 'outline'}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.activeFilterText]}>Pending</Text>
        </Button>
      </View>

      {filteredPayments.length === 0 ? (
        <View style={styles.emptyContainer}>
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
            {filteredPayments.map((payment: any) => (
              <Card key={payment.id} style={styles.paymentCard}>
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
                  <Text style={styles.paymentAmount}>${payment.amount.toFixed(2)}</Text>
                  <Text style={styles.paymentMethod}>
                    Method: {payment.paymentMethod}
                  </Text>
                  <Text style={styles.paymentDate}>
                    {formatDate(new Date(payment.createdAt))}
                  </Text>
                </CardContent>
              </Card>
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    height: 36,
  },
  activeFilter: {
    backgroundColor: '#00FF88',
  },
  filterText: {
    color: '#FFFFFF',
  },
  activeFilterText: {
    color: '#000000',
  },
  paymentsContainer: {
    padding: 16,
    gap: 16,
  },
  paymentCard: {
    backgroundColor: '#1E1E1E',
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
    color: '#FFFFFF',
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 24,
  },
});