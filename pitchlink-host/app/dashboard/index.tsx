import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { useBookingStore } from '@/store/useBookingStore';
import { usePaymentStore } from '@/store/usePaymentStore';
import { usePitchStore } from '@/store/usePitchStore';
import { Card, CardContent } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';

// Simple Bar Chart Component
const BarChart = ({ data }: { data: { label: string; value: number }[] }) => {
  const maxValue = Math.max(...data.map(item => item.value), 1);
  
  return (
    <View style={styles.chartContainer}>
      {data.map((item, index) => (
        <View key={index} style={styles.chartBarItem}>
          <View style={styles.chartBarValueContainer}>
            <Text style={styles.chartBarValue}>₦{item.value.toFixed(0)}</Text>
          </View>
          <View style={styles.chartBarContainer}>
            <View 
              style={[
                styles.chartBar, 
                { height: `${(item.value / maxValue) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.chartBarLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

// Helper function to format time ago
const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
};

export default function DashboardScreen() {
  const router = useRouter();
  const bookings = useBookingStore((state) => state.bookings);
  const payments = usePaymentStore((state) => state.payments);
  const pitches = usePitchStore((state) => state.pitches);
  const [refreshing, setRefreshing] = useState(false);

  // Combine bookings and payments into a single recent activity feed
  const recentActivity = React.useMemo(() => {
    // Create activity items from payments
    const paymentActivities = payments.map(payment => ({
      id: `payment-${payment.id}`,
      type: 'payment' as const,
      title: 'Payment received',
      amount: payment.amount,
      timestamp: payment.createdAt,
      onPress: () => router.push(`/payments/${payment.id}`)
    }));
    
    // Create activity items from bookings
    const bookingActivities = bookings.map(booking => ({
      id: `booking-${booking.id}`,
      type: 'booking' as const,
      title: 'Booking confirmed',
      amount: booking.totalPrice,
      pitchId: booking.pitchId,
      timestamp: booking.createdAt,
      onPress: () => router.push(`/bookings/${booking.id}`)
    }));
    
    // Combine and sort by timestamp (most recent first)
    const combinedActivities = [...paymentActivities, ...bookingActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5); // Show only the 5 most recent activities
    
    return combinedActivities;
  }, [bookings, payments, router]);

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
  
  // Calculate weekly earnings data for the chart
  const weeklyEarningsData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Adjust so Monday is the first day of the week (0)
    const startOfWeekIndex = todayIndex === 0 ? 6 : todayIndex - 1;
    
    return days.map((day, index) => {
      // Calculate the date for each day of the week
      const dayDate = new Date(today);
      const dayOffset = index - startOfWeekIndex;
      dayDate.setDate(today.getDate() + dayOffset);
      
      // Filter payments for this specific day
      const dayPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate.toDateString() === dayDate.toDateString();
      });
      
      // Calculate total earnings for this day (assuming 90% goes to owner)
      const dayEarnings = dayPayments.reduce((sum, payment) => sum + (payment.amount * 0.9), 0);
      
      return {
        label: day,
        value: dayEarnings
      };
    });
  };
  
  const chartData = weeklyEarningsData();

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
          <Card style={[styles.statCard, styles.wideStatCard]}>
            <CardContent style={styles.statCardContent}>
              <Text style={styles.statValue}>₦{totalEarnings.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Total Earnings</Text>
              <View style={styles.trendContainer}>
                <IconSymbol name="arrow.up" size={12} color="#00FF88" />
                <Text style={styles.trendText}>12% from last month</Text>
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

        {/* Earnings Chart */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionCardContent}>
            <Text style={styles.sectionTitle}>Weekly Earnings</Text>
            <Text style={styles.sectionSubtitle}>Last 7 days revenue</Text>
            <BarChart data={chartData} />
          </CardContent>
        </Card>

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

        {/* Quick Actions */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionCardContent}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => router.push('/bookings/new')}
              >
                <View style={[styles.quickActionIconContainer, { backgroundColor: 'rgba(0, 255, 136, 0.2)' }]}>
                  <IconSymbol name="calendar.badge.plus" size={32} color="#00FF88" />
                </View>
                <Text style={styles.quickActionText}>Add Booking</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => router.push('/pitches')}
              >
                <View style={styles.quickActionIconContainer}>
                  <IconSymbol name="sportscourt.fill" size={24} color="#00FF88" />
                </View>
                <Text style={styles.quickActionText}>Manage Pitches</Text>
              </TouchableOpacity>
            </View>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionCardContent}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            
            <View style={styles.activityList}>
              {recentActivity.map(activity => (
                <TouchableOpacity 
                  key={activity.id} 
                  style={styles.activityItem}
                  onPress={activity.onPress}
                >
                  <View style={styles.activityIconContainer}>
                    <IconSymbol 
                      name={activity.type === 'payment' ? 'creditcard.fill' : 'calendar.badge.clock'} 
                      size={16} 
                      color="#00FF88" 
                    />
                  </View>
                  <View style={styles.activityDetails}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityAmount}>
                      {activity.type === 'payment' 
                        ? `₦${activity.amount.toFixed(2)}` 
                        : `Pitch #${activity.pitchId}`}
                    </Text>
                  </View>
                  <Text style={styles.activityTime}>
                    {formatTimeAgo(activity.timestamp)}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {recentActivity.length === 0 && (
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
  wideStatCard: {
    flex: 2,
    minWidth: 200,
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
  sectionSubtitle: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 16,
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
    gap: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
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
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 4,
    height: 120,
  },
  chartBarItem: {
    alignItems: 'center',
    gap: 4,
  },
  chartBarValueContainer: {
    width: '100%',
    alignItems: 'center',
  },
  chartBarValue: {
    fontSize: 12,
    color: '#888888',
  },
  chartBarContainer: {
    width: '100%',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  chartBar: {
    width: '100%',
    backgroundColor: '#00FF88',
  },
  chartBarLabel: {
    fontSize: 12,
    color: '#888888',
  },
});
