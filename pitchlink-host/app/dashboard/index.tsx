import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePitchStore } from '@/store/usePitchStore';
import { useBookingStore } from '@/store/useBookingStore';
import { usePaymentStore } from '@/store/usePaymentStore';
import { formatDate, isToday } from '@/utils/dateUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Booking } from '@/store/useBookingStore';
import { Payment } from '@/store/usePaymentStore';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const pitches = usePitchStore((state: any) => state.pitches);
  const bookings = useBookingStore((state: any) => state.bookings);
  const payments = usePaymentStore((state: any) => state.payments);
  
  const today = new Date();
  const todaysBookings = bookings.filter((booking: Booking) => isToday(new Date(booking.bookingDate)));
  const totalRevenue = payments
    .filter((payment: Payment) => payment.status === 'paid')
    .reduce((sum: number, payment: Payment) => sum + payment.amount, 0);
  const outstandingPayments = payments.filter((payment: Payment) => payment.status === 'pending');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // In a real app, this would refresh data from the server
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Today's Overview</Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <Card style={styles.metricCard}>
            <CardContent style={styles.metricContent}>
              <Text style={styles.metricValue}>{pitches.length}</Text>
              <Text style={styles.metricLabel}>Total Pitches</Text>
            </CardContent>
          </Card>
          
          <Card style={styles.metricCard}>
            <CardContent style={styles.metricContent}>
              <Text style={styles.metricValue}>{todaysBookings.length}</Text>
              <Text style={styles.metricLabel}>Today's Bookings</Text>
            </CardContent>
          </Card>
          
          <Card style={styles.metricCard}>
            <CardContent style={styles.metricContent}>
              <Text style={styles.metricValue}>${totalRevenue.toFixed(2)}</Text>
              <Text style={styles.metricLabel}>Total Revenue</Text>
            </CardContent>
          </Card>
          
          <Card style={styles.metricCard}>
            <CardContent style={styles.metricContent}>
              <Text style={styles.metricValue}>{outstandingPayments.length}</Text>
              <Text style={styles.metricLabel}>Pending Payments</Text>
            </CardContent>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <Button style={styles.actionButton} variant="default">
              <Text style={styles.actionButtonText}>Add Pitch</Text>
            </Button>
            <Button style={styles.actionButton} variant="default">
              <Text style={styles.actionButtonText}>New Booking</Text>
            </Button>
            <Button style={styles.actionButton} variant="outline">
              <Text style={styles.actionButtonText}>View Payments</Text>
            </Button>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          {todaysBookings.slice(0, 3).map((booking: Booking) => (
            <Card key={booking.id} style={styles.activityCard}>
              <CardContent style={styles.activityContent}>
                <Text style={styles.activityTitle}>{booking.customerName}</Text>
                <Text style={styles.activitySubtitle}>
                  {booking.startTime} - {booking.endTime}
                </Text>
                <Text style={styles.activityDate}>
                  {formatDate(new Date(booking.bookingDate))}
                </Text>
              </CardContent>
            </Card>
          ))}
          {todaysBookings.length === 0 && (
            <Card style={styles.emptyCard}>
              <CardContent style={styles.emptyContent}>
                <Text style={styles.emptyText}>No bookings today</Text>
              </CardContent>
            </Card>
          )}
        </View>
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
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#1E1E1E',
  },
  metricContent: {
    padding: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FF88',
  },
  metricLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 4,
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 44,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  activityCard: {
    backgroundColor: '#1E1E1E',
    marginBottom: 12,
  },
  activityContent: {
    padding: 16,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 4,
  },
  activityDate: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: '#1E1E1E',
  },
  emptyContent: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888888',
    fontSize: 16,
  },
});