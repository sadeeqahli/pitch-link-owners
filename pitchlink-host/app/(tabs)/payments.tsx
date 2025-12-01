import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePaymentStore } from '@/store/usePaymentStore';
import { useBookingStore } from '@/store/useBookingStore';
import { Card, CardContent } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function PaymentsScreen() {
  const router = useRouter();
  const payments = usePaymentStore((state) => state.payments);
  const bookings = useBookingStore((state) => state.bookings);
  const getTotalRevenue = usePaymentStore((state) => state.getTotalRevenue);
  
  // Calculate earnings from player app payments (10% fee deducted)
  const playerAppPayments = payments.filter(payment => payment.status === 'paid');
  const totalPlayerAppRevenue = playerAppPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalEarnings = totalPlayerAppRevenue * 0.9; // After 10% platform fee
  
  // Calculate this week, month, and year earnings
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  
  const weeklyEarnings = playerAppPayments
    .filter(payment => new Date(payment.createdAt) >= startOfWeek)
    .reduce((sum, payment) => sum + (payment.amount * 0.9), 0);
    
  const monthlyEarnings = playerAppPayments
    .filter(payment => new Date(payment.createdAt) >= startOfMonth)
    .reduce((sum, payment) => sum + (payment.amount * 0.9), 0);
    
  const yearlyEarnings = playerAppPayments
    .filter(payment => new Date(payment.createdAt) >= startOfYear)
    .reduce((sum, payment) => sum + (payment.amount * 0.9), 0);
  
  // Get latest 3 player app payments
  const latestPayments = [...playerAppPayments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  
  // Prepare data for charts
  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: Array(7).fill(0).map((_, i) => {
        const day = new Date(now);
        day.setDate(now.getDate() - now.getDay() + i);
        return playerAppPayments
          .filter(payment => {
            const paymentDate = new Date(payment.createdAt);
            return paymentDate.toDateString() === day.toDateString();
          })
          .reduce((sum, payment) => sum + (payment.amount * 0.9), 0);
      })
    }]
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Earnings</Text>
        <Text style={styles.subtitle}>Track your revenue</Text>
      </View>
      
      {/* Summary Cards */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.summaryContainer}>
          <Card style={styles.summaryCard}>
            <CardContent style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>Total Earnings</Text>
              <Text style={styles.summaryValue}>₦{totalEarnings.toFixed(2)}</Text>
              <Text style={styles.summarySubtext}>After 10% platform fee</Text>
            </CardContent>
          </Card>
        </View>
        
        <Card style={styles.combinedPeriodCard}>
          <CardContent style={styles.combinedPeriodCardContent}>
            <View style={styles.periodRow}>
              <View style={styles.periodItem}>
                <Text style={styles.periodLabel}>This Week</Text>
                <Text style={styles.periodValue}>₦{weeklyEarnings.toFixed(2)}</Text>
              </View>
              
              <View style={styles.periodItem}>
                <Text style={styles.periodLabel}>This Month</Text>
                <Text style={styles.periodValue}>₦{monthlyEarnings.toFixed(2)}</Text>
              </View>
              
              <View style={styles.periodItem}>
                <Text style={styles.periodLabel}>This Year</Text>
                <Text style={styles.periodValue}>₦{yearlyEarnings.toFixed(2)}</Text>
              </View>
            </View>
          </CardContent>
        </Card>
        
        {/* Important Notice */}
        <View style={styles.noticeContainer}>
          <Text style={styles.noticeText}>Important Notice</Text>
          <Text style={styles.noticeDescription}>PitchLink charges a 10% platform fee on bookings done through the Player App.</Text>
        </View>
        
        {/* Receipts Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Receipts</Text>
          <TouchableOpacity onPress={() => router.push('/payments/receipts')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {latestPayments.length === 0 ? (
          <Card style={styles.emptyCard}>
            <CardContent style={styles.emptyCardContent}>
              <Text style={styles.emptyText}>No receipts yet</Text>
              <Text style={styles.emptySubtext}>Player app payments will appear here</Text>
            </CardContent>
          </Card>
        ) : (
          <View style={styles.receiptsContainer}>
            {latestPayments.map((payment) => {
              const booking = bookings.find(b => b.id === payment.bookingId);
              return (
                <TouchableOpacity 
                  key={payment.id} 
                  style={styles.receiptCard}
                  onPress={() => router.push(`/payments/${payment.id}`)}
                >
                  <Card style={styles.receiptCardContent}>
                    <CardContent>
                      <View style={styles.receiptHeader}>
                        <Text style={styles.receiptId} numberOfLines={1}>#{payment.id.substring(0, 8)}</Text>
                        <Text style={styles.receiptAmount} numberOfLines={1}>₦{(payment.amount * 0.9).toFixed(2)}</Text>
                      </View>
                      <Text style={styles.receiptPitch} numberOfLines={1}>{booking?.customerName || 'Unknown Customer'}</Text>
                      <Text style={styles.receiptDate} numberOfLines={1}>
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </Text>
                      <View style={styles.receiptFooter}>
                        <Text style={styles.receiptSource} numberOfLines={1}>Player App Payment</Text>
                      </View>
                    </CardContent>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
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
  contentContainer: {
    paddingBottom: 32,
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
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginTop: 4,
  },
  summaryContainer: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#1E1E1E',
  },
  summaryContent: {
    padding: 20,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00FF88',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
    color: '#888888',
  },
  periodLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  periodValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  combinedPeriodCard: {
    marginHorizontal: 16,
    backgroundColor: '#1E1E1E',
  },
  combinedPeriodCardContent: {
    padding: 16,
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodItem: {
    alignItems: 'center',
    flex: 1,
  },
  // Important Notice Styles
  noticeContainer: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(234, 188, 21, 0.1)',
    elevation: 4,
    marginTop: 16,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  noticeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  noticeDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  // Receipts Section Styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  viewAllText: {
    fontSize: 16,
    color: '#00FF88',
    fontWeight: '600',
  },
  receiptsContainer: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  receiptCard: {
    // TouchableOpacity wrapper
  },
  receiptCardContent: {
    backgroundColor: '#1E1E1E',
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptId: {
    fontSize: 14,
    color: '#888888',
    flex: 1,
  },
  receiptAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00FF88',
    flex: 1,
    textAlign: 'right',
  },
  receiptPitch: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  receiptDate: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 8,
  },
  receiptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptSource: {
    fontSize: 12,
    color: '#00FF88',
    fontWeight: '600',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  emptyCard: {
    marginHorizontal: 16,
    backgroundColor: '#1E1E1E',
  },
  emptyCardContent: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
});