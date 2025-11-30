import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePaymentStore } from '@/store/usePaymentStore';
import { useBookingStore } from '@/store/useBookingStore';
import { usePitchStore } from '@/store/usePitchStore';
import { Card, CardContent } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ActivitiesScreen() {
  const router = useRouter();
  const payments = usePaymentStore((state) => state.payments);
  const bookings = useBookingStore((state) => state.bookings);
  const pitches = usePitchStore((state) => state.pitches);
  
  const [filter, setFilter] = useState<'all' | 'payments' | 'bookings'>('all');
  
  // Combine payments and bookings into activity feed
  const getActivityFeed = () => {
    const activities: Array<{
      id: string;
      type: 'payment' | 'booking';
      payment?: any;
      booking?: any;
      timestamp: Date;
    }> = [];
    
    // Add payment activities
    payments.forEach(payment => {
      activities.push({
        id: `payment-${payment.id}`,
        type: 'payment',
        payment,
        timestamp: new Date(payment.createdAt), // Fix: Ensure timestamp is a Date object
      });
    });
    
    // Add booking activities
    bookings.forEach(booking => {
      activities.push({
        id: `booking-${booking.id}`,
        type: 'booking',
        booking,
        timestamp: new Date(booking.createdAt), // Fix: Ensure timestamp is a Date object
      });
    });
    
    // Sort by timestamp (newest first)
    return activities.sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  };
  
  const activityFeed = getActivityFeed();
  
  // Filter activities based on selected filter
  const filteredActivities = activityFeed.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'payments') return activity.type === 'payment';
    if (filter === 'bookings') return activity.type === 'booking';
    return true;
  });
  
  // Get pitch name by ID
  const getPitchName = (pitchId: string) => {
    const pitch = pitches.find(p => p.id === pitchId);
    return pitch ? pitch.name : 'Unknown Pitch';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Activities</Text>
        <View style={styles.headerSpacer} />
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
          style={[styles.filterButton, filter === 'payments' && styles.activeFilter]}
          onPress={() => setFilter('payments')}
        >
          <Text style={[styles.filterText, filter === 'payments' && styles.activeFilterText]}>Payments</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'bookings' && styles.activeFilter]}
          onPress={() => setFilter('bookings')}
        >
          <Text style={[styles.filterText, filter === 'bookings' && styles.activeFilterText]}>Bookings</Text>
        </TouchableOpacity>
      </View>
      
      {filteredActivities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="list.bullet" size={64} color="#333333" />
          <Text style={styles.emptyText}>No activities found</Text>
          <Text style={styles.emptySubtext}>Financial activities will appear here</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.activitiesContainer}>
            {filteredActivities.map((activity) => (
              <Card key={activity.id} style={styles.activityCard}>
                <CardContent style={styles.activityCardContent}>
                  {activity.type === 'payment' ? (
                    // Payment Activity
                    <View style={styles.activityContent}>
                      <View style={styles.activityIconContainer}>
                        <View style={styles.paymentIcon}>
                          <IconSymbol name="creditcard.fill" size={20} color="#00FF88" />
                        </View>
                      </View>
                      <View style={styles.activityDetails}>
                        <Text style={styles.activityTitle} numberOfLines={1}>Payment Received</Text>
                        <Text style={styles.activityDescription} numberOfLines={1}>
                          {activity.payment?.amount ? `₦${(activity.payment.amount * 0.9).toFixed(2)}` : 'Unknown amount'}
                        </Text>
                        <Text style={styles.activityTime} numberOfLines={1}>
                          {activity.timestamp.toLocaleString()}
                        </Text>
                      </View>
                      <View style={styles.activityStatus}>
                        <View style={[
                          styles.statusBadge,
                          activity.payment?.status === 'paid' && styles.statusPaid,
                          activity.payment?.status === 'pending' && styles.statusPending,
                          activity.payment?.status === 'failed' && styles.statusFailed,
                          activity.payment?.status === 'refunded' && styles.statusRefunded,
                        ]}>
                          <Text style={styles.statusText} numberOfLines={1}>
                            {activity.payment?.status || 'Unknown'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    // Booking Activity
                    <View style={styles.activityContent}>
                      <View style={styles.activityIconContainer}>
                        <View style={styles.bookingIcon}>
                          <IconSymbol name="calendar.badge.clock" size={20} color="#00FF88" />
                        </View>
                      </View>
                      <View style={styles.activityDetails}>
                        <Text style={styles.activityTitle} numberOfLines={1}>New Booking</Text>
                        <Text style={styles.activityDescription} numberOfLines={1}>
                          {activity.booking ? getPitchName(activity.booking.pitchId) : 'Unknown pitch'}
                        </Text>
                        <Text style={styles.activityTime} numberOfLines={1}>
                          {activity.timestamp.toLocaleString()}
                        </Text>
                      </View>
                      <View style={styles.activityStatus}>
                        <View style={[
                          styles.statusBadge,
                          activity.booking?.status === 'confirmed' && styles.statusConfirmed,
                          activity.booking?.status === 'ongoing' && styles.statusOngoing,
                          activity.booking?.status === 'completed' && styles.statusCompleted,
                          activity.booking?.status === 'cancelled' && styles.statusCancelled,
                        ]}>
                          <Text style={styles.statusText} numberOfLines={1}>
                            {activity.booking?.status || 'Unknown'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 24,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
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
  activitiesContainer: {
    padding: 16,
    gap: 12,
  },
  activityCard: {
    backgroundColor: '#1E1E1E',
  },
  activityCardContent: {
    padding: 16,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIconContainer: {
    marginRight: 16,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#888888',
  },
  activityStatus: {
    marginLeft: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusPaid: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  statusPending: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
  },
  statusFailed: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
  },
  statusRefunded: {
    backgroundColor: 'rgba(100, 100, 255, 0.2)',
  },
  statusConfirmed: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  statusOngoing: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  statusCompleted: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  statusCancelled: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
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
  },
});