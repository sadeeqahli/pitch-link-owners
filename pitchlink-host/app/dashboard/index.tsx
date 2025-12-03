import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBookingStore } from '@/store/useBookingStore';
import { usePaymentStore } from '@/store/usePaymentStore';
import { usePitchStore } from '@/store/usePitchStore';
import { Card, CardContent } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BarChart } from 'lucide-react-native';

// Define types for activity items
type ActivityType = 'payment' | 'booking' | 'receipt';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  amount: number;
  timestamp: Date;
  pitchId?: string;
  onPress: () => void;
}

// Simple Bar Chart Component
const BarChartComponent = ({ data }: { data: { label: string; value: number }[] }) => {
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

export default function DashboardScreen() {
  const router = useRouter();
  const bookings = useBookingStore((state) => state.bookings);
  const payments = usePaymentStore((state) => state.payments);
  const pitches = usePitchStore((state) => state.pitches);
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is new (no data)
  const isNewUser = bookings.length === 0 && payments.length === 0 && pitches.length === 0;

  // Combine bookings, payments, and receipts into a single recent activity feed
  const recentActivity = React.useMemo<ActivityItem[]>(() => {
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
    
    // Create activity items specifically for receipts (paid player app payments)
    const receiptActivities = payments
      .filter(payment => payment.status === 'paid' && payment.source === 'player-app')
      .map(payment => ({
        id: `receipt-${payment.id}`,
        type: 'receipt' as const,
        title: 'New receipt generated',
        amount: payment.amount * 0.9, // After 10% platform fee
        timestamp: payment.createdAt,
        onPress: () => router.push(`/payments/${payment.id}`)
      }));
    
    // Combine and sort by timestamp (most recent first)
    const combinedActivities = [...paymentActivities, ...bookingActivities, ...receiptActivities]
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
        {isNewUser ? (
          // Blank Dashboard Content (inlined to avoid hook count mismatch)
          <>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Dashboard</Text>
              <Text style={styles.headerSubtitle}>Welcome to PitchLink!</Text>
            </View>

            {/* Welcome Message */}
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome to your PitchLink dashboard</Text>
              <Text style={styles.welcomeSubtext}>
                Get started by adding your first pitch, booking, or payment.
              </Text>
            </View>

            {/* Stats Cards - All Zero */}
            <View style={styles.statsContainer}>
              <Card style={[styles.statCard, styles.wideStatCard]}>
                <CardContent style={styles.statCardContent}>
                  <Text style={styles.statValue}>₦0.00</Text>
                  <Text style={styles.statLabel}>Total Earnings</Text>
                </CardContent>
              </Card>

              <Card style={styles.statCard}>
                <CardContent style={styles.statCardContent}>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>Bookings Today</Text>
                </CardContent>
              </Card>

              <Card style={styles.statCard}>
                <CardContent style={styles.statCardContent}>
                  <Text style={styles.statValue}>Closed</Text>
                  <Text style={styles.statLabel}>Pitch Status</Text>
                  <View style={styles.statusIndicatorContainer}>
                    <View style={[styles.statusIndicator, styles.statusClosed]} />
                    <Text style={styles.statusText}>0 pitches open</Text>
                  </View>
                </CardContent>
              </Card>
            </View>

            {/* Get Started Card - Keep this for new users */}
            <Card style={styles.sectionCard}>
              <CardContent style={styles.sectionCardContent}>
                <Text style={styles.sectionTitle}>Get Started</Text>
                <Text style={styles.sectionSubtitle}>
                  Begin managing your football pitches by adding your first pitch.
                </Text>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push('/pitches/add')}
                >
                  <Text style={styles.actionButtonText}>Add Your First Pitch</Text>
                </TouchableOpacity>
              </CardContent>
            </Card>
          </>
        ) : (
          // Regular Dashboard Content
          <>
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
                <BarChartComponent data={chartData} />
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
            
            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <Card style={styles.sectionCard}>
                <CardContent style={styles.sectionCardContent}>
                  <Text style={styles.sectionTitle}>Recent Activity</Text>
                  <Text style={styles.sectionSubtitle}>Latest transactions and bookings</Text>
                  
                  <View style={styles.activityList}>
                    {recentActivity.map((activity) => (
                      <TouchableOpacity 
                        key={activity.id} 
                        style={styles.activityItem}
                        onPress={activity.onPress}
                      >
                        <View style={styles.activityIconContainer}>
                          <IconSymbol 
                            name={
                              activity.type === 'payment' ? 'creditcard.fill' :
                              activity.type === 'receipt' ? 'doc.text.fill' :
                              'calendar'
                            } 
                            size={20} 
                            color="#00FF88" 
                          />
                        </View>
                        
                        <View style={styles.activityContent}>
                          <Text style={styles.activityTitle}>{activity.title}</Text>
                          <Text style={styles.activityTimestamp}>
                            {new Date(activity.timestamp).toLocaleString()}
                          </Text>
                        </View>
                        
                        <Text style={styles.activityAmount}>
                          ₦{activity.amount.toFixed(2)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </CardContent>
              </Card>
            )}
          </>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#888888',
    marginTop: 4,
  },
  notificationButton: {
    padding: 8,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nextMatchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  nextMatchDetails: {
    fontSize: 14,
    color: '#888888',
    marginTop: 4,
  },
  nextMatchPitch: {
    fontSize: 14,
    color: '#00FF88',
    marginTop: 2,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    marginTop: 16,
  },
  chartBarItem: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarValueContainer: {
    marginBottom: 4,
  },
  chartBarValue: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  chartBarContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    width: 20,
  },
  chartBar: {
    backgroundColor: '#00FF88',
    width: '100%',
    borderRadius: 2,
  },
  chartBarLabel: {
    fontSize: 10,
    color: '#888888',
    marginTop: 4,
  },
  welcomeContainer: {
    padding: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#00FF88',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  actionButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
  },
  activityList: {
    marginTop: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activityTimestamp: {
    fontSize: 12,
    color: '#888888',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00FF88',
  },
});