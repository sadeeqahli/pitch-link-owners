import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookingStore } from '@/store/useBookingStore';
import { usePaymentStore } from '@/store/usePaymentStore';
import { usePitchStore } from '@/store/usePitchStore';
import { Card, CardContent } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';

export default function DashboardScreen() {
  const bookings = useBookingStore((state) => state.bookings);
  const payments = usePaymentStore((state) => state.payments);
  const pitches = usePitchStore((state) => state.pitches);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate dashboard metrics
  const totalEarnings = usePaymentStore((state) => state.getTotalRevenue());
  const totalBookings = bookings.length;
  
  // Get today's bookings
  const today = new Date();
  const bookingsToday = bookings.filter(booking => {
    const bookingDate = new Date(booking.bookingDate);
    return bookingDate.toDateString() === today.toDateString();
  }).length;
  
  // Get next upcoming match
  const upcomingMatches = bookings
    .filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate >= today && booking.status === 'confirmed';
    })
    .sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
  
  const nextMatch = upcomingMatches.length > 0 ? upcomingMatches[0] : null;
  
  // Get open pitches
  const openPitches = pitches.filter(pitch => pitch.status === 'available').length;
  const pitchStatus = openPitches > 0 ? 'Open' : 'Closed';

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00FF88" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText type="title" style={styles.headerTitle}>Dashboard</ThemedText>
            <ThemedText style={styles.headerSubtitle}>Welcome back!</ThemedText>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <IconSymbol name="bell.fill" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <CardContent style={styles.statCardContent}>
              <Text style={styles.statValue}>${totalEarnings.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Total Earnings</Text>
              <View style={styles.trendContainer}>
                <IconSymbol name="arrow.up" size={12} color="#00FF88" />
                <Text style={styles.trendText}>12% from last month</Text>
              </View>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent style={styles.statCardContent}>
              <Text style={styles.statValue}>{totalBookings}</Text>
              <Text style={styles.statLabel}>Total Bookings</Text>
              <View style={styles.trendContainer}>
                <IconSymbol name="arrow.up" size={12} color="#00FF88" />
                <Text style={styles.trendText}>8% from last month</Text>
              </View>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent style={styles.statCardContent}>
              <Text style={styles.statValue}>{bookingsToday}</Text>
              <Text style={styles.statLabel}>Bookings Today</Text>
              <View style={styles.trendContainer}>
                <IconSymbol name="arrow.down" size={12} color="#FF4444" />
                <Text style={styles.trendText}>2% from yesterday</Text>
              </View>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent style={styles.statCardContent}>
              <Text style={styles.statValue}>{pitchStatus}</Text>
              <Text style={styles.statLabel}>Pitch Status</Text>
              <View style={styles.statusIndicatorContainer}>
                <View style={[
                  styles.statusIndicator,
                  pitchStatus === 'Open' ? styles.statusOpen : styles.statusClosed
                ]} />
                <Text style={styles.statusText}>{openPitches} pitches open</Text>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Next Match */}
        {nextMatch && (
          <Card style={styles.sectionCard}>
            <CardContent style={styles.sectionCardContent}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <IconSymbol name="calendar" size={20} color="#00FF88" />
                  <View>
                    <Text style={styles.nextMatchTitle}>Next Upcoming Match</Text>
                    <Text style={styles.nextMatchDetails}>
                      {new Date(nextMatch.bookingDate).toLocaleDateString()} at {nextMatch.startTime}
                    </Text>
                    <Text style={styles.nextMatchPitch}>Pitch #{nextMatch.pitchId}</Text>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>
        )}

        {/* My Pitches */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionCardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Pitches</Text>
              <TouchableOpacity>
                <IconSymbol name="plus" size={20} color="#00FF88" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.pitchesList}>
              {pitches.slice(0, 3).map((pitch) => (
                <TouchableOpacity key={pitch.id} style={styles.pitchItem}>
                  <View style={styles.pitchInfo}>
                    <View style={styles.pitchIconContainer}>
                      <IconSymbol name="sportscourt.fill" size={20} color="#00FF88" />
                    </View>
                    <View style={styles.pitchDetails}>
                      <Text style={styles.pitchName}>{pitch.name}</Text>
                      <Text style={styles.pitchPrice}>${pitch.pricePerHour}/hr</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.pitchStatusBadge,
                    pitch.status === 'available' && styles.pitchStatusAvailable,
                    pitch.status === 'booked' && styles.pitchStatusBooked,
                    pitch.status === 'maintenance' && styles.pitchStatusMaintenance,
                  ]}>
                    <Text style={styles.pitchStatusText}>{pitch.status}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              
              {pitches.length === 0 && (
                <View style={styles.emptyPitches}>
                  <Text style={styles.emptyPitchesText}>No pitches added yet</Text>
                  <TouchableOpacity style={styles.addPitchButton}>
                    <Text style={styles.addPitchButtonText}>Add Your First Pitch</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionCardContent}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            
            <View style={styles.activityList}>
              {payments.slice(0, 3).map((payment) => (
                <View key={payment.id} style={styles.activityItem}>
                  <View style={styles.activityIconContainer}>
                    <IconSymbol name="creditcard.fill" size={16} color="#00FF88" />
                  </View>
                  <View style={styles.activityDetails}>
                    <Text style={styles.activityTitle}>Payment received</Text>
                    <Text style={styles.activityAmount}>${payment.amount.toFixed(2)}</Text>
                  </View>
                  <Text style={styles.activityTime}>2h ago</Text>
                </View>
              ))}
              
              {bookings.slice(0, 3).map((booking) => (
                <View key={booking.id} style={styles.activityItem}>
                  <View style={styles.activityIconContainer}>
                    <IconSymbol name="calendar.badge.clock" size={16} color="#00FF88" />
                  </View>
                  <View style={styles.activityDetails}>
                    <Text style={styles.activityTitle}>Booking confirmed</Text>
                    <Text style={styles.activityAmount}>Pitch #{booking.pitchId}</Text>
                  </View>
                  <Text style={styles.activityTime}>5h ago</Text>
                </View>
              ))}
              
              {payments.length === 0 && bookings.length === 0 && (
                <View style={styles.emptyActivity}>
                  <Text style={styles.emptyActivityText}>No recent activity</Text>
                </View>
              )}
            </View>
          </CardContent>
        </Card>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#888888',
  },
  notificationButton: {
    position: 'relative',
    padding: 10,
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#1E1E1E',
  },
  statCardContent: {
    padding: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    color: '#888888',
  },
  statusIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusOpen: {
    backgroundColor: '#00FF88',
  },
  statusClosed: {
    backgroundColor: '#FF4444',
  },
  statusText: {
    fontSize: 12,
    color: '#888888',
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#1E1E1E',
  },
  sectionCardContent: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  nextMatchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  nextMatchDetails: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 2,
  },
  nextMatchPitch: {
    fontSize: 14,
    color: '#00FF88',
  },
  pitchesList: {
    gap: 12,
  },
  pitchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  pitchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pitchIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pitchDetails: {
    gap: 2,
  },
  pitchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pitchPrice: {
    fontSize: 14,
    color: '#888888',
  },
  pitchStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pitchStatusAvailable: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  pitchStatusBooked: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
  },
  pitchStatusMaintenance: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
  },
  pitchStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  emptyPitches: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyPitchesText: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 16,
  },
  addPitchButton: {
    backgroundColor: '#00FF88',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addPitchButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
  activityList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityDetails: {
    flex: 1,
    gap: 2,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activityAmount: {
    fontSize: 12,
    color: '#888888',
  },
  activityTime: {
    fontSize: 12,
    color: '#888888',
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyActivityText: {
    fontSize: 16,
    color: '#888888',
  },
});