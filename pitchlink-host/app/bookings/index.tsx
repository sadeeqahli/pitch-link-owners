import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBookingStore } from '@/store/useBookingStore';
import { usePitchStore } from '@/store/usePitchStore';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react-native';

export default function BookingsIndexScreen() {
  const router = useRouter();
  const bookings = useBookingStore((state) => state.bookings);
  const pitches = usePitchStore((state) => state.pitches);
  const updateBooking = useBookingStore((state) => state.updateBooking);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'ongoing' | 'history'>('upcoming');

  // Auto-update booking statuses based on time
  useEffect(() => {
    const updateBookingStatuses = () => {
      const now = new Date();
      
      bookings.forEach((booking) => {
        try {
          const bookingDate = new Date(booking.bookingDate);
          const bookingStart = new Date(bookingDate);
          const [startHours, startMinutes] = booking.startTime.split(':').map(Number);
          bookingStart.setHours(startHours, startMinutes, 0, 0);
          
          const bookingEnd = new Date(bookingStart);
          bookingEnd.setHours(bookingEnd.getHours() + (booking.duration || 1));
          
          // Update status based on time if it's still confirmed
          if (booking.status === 'confirmed') {
            if (bookingStart <= now && bookingEnd > now) {
              // Booking is currently ongoing
              updateBooking(booking.id, { status: 'ongoing' });
            } else if (bookingEnd <= now) {
              // Booking has ended
              updateBooking(booking.id, { status: 'completed' });
            }
          }
        } catch (error) {
          console.error('Error updating booking status:', error);
        }
      });
    };
    
    // Check immediately on mount
    updateBookingStatuses();
    
    // Check every minute
    const interval = setInterval(updateBookingStatuses, 60000);
    
    return () => clearInterval(interval);
  }, [bookings, updateBooking]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Get pitch name by ID
  const getPitchName = (pitchId: string) => {
    const pitch = pitches.find(p => p.id === pitchId);
    return pitch ? pitch.name : 'Unknown Pitch';
  };

  // Filter bookings based on active tab and current time
  const filteredBookings = bookings.filter((booking) => {
    try {
      const now = new Date();
      const bookingDate = new Date(booking.bookingDate);
      const bookingStart = new Date(bookingDate);
      const [startHours, startMinutes] = booking.startTime.split(':').map(Number);
      bookingStart.setHours(startHours, startMinutes, 0, 0);
      
      const bookingEnd = new Date(bookingStart);
      bookingEnd.setHours(bookingEnd.getHours() + (booking.duration || 1));

      switch (activeTab) {
        case 'upcoming':
          // Show confirmed bookings that haven't started yet
          return booking.status === 'confirmed' && bookingStart > now;
        case 'ongoing':
          // Show ongoing bookings or confirmed bookings that are currently happening
          return booking.status === 'ongoing' || 
                 (booking.status === 'confirmed' && bookingStart <= now && bookingEnd > now);
        case 'history':
          // Show completed or cancelled bookings, or past bookings
          return booking.status === 'completed' || 
                 booking.status === 'cancelled' || 
                 (booking.status === 'confirmed' && bookingEnd <= now);
        default:
          return true;
      }
    } catch (error) {
      console.error('Error filtering bookings:', error);
      return false;
    }
  });

  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    try {
      const dateA = new Date(a.bookingDate);
      const dateB = new Date(b.bookingDate);
      const [hoursA, minutesA] = a.startTime.split(':').map(Number);
      const [hoursB, minutesB] = b.startTime.split(':').map(Number);
      dateA.setHours(hoursA, minutesA, 0, 0);
      dateB.setHours(hoursB, minutesB, 0, 0);
      return dateB.getTime() - dateA.getTime();
    } catch (error) {
      console.error('Error sorting bookings:', error);
      return 0;
    }
  });

  // Render booking card based on tab
  const renderBookingCard = (booking: any) => {
    try {
      const now = new Date();
      const bookingDate = new Date(booking.bookingDate);
      const bookingStart = new Date(bookingDate);
      const [startHours, startMinutes] = booking.startTime.split(':').map(Number);
      bookingStart.setHours(startHours, startMinutes, 0, 0);
      
      const bookingEnd = new Date(bookingStart);
      bookingEnd.setHours(bookingEnd.getHours() + (booking.duration || 1));

      switch (activeTab) {
        case 'upcoming':
          return (
            <TouchableOpacity 
              key={booking.id} 
              style={styles.bookingCard}
              onPress={() => router.push(`/bookings/${booking.id}`)}
            >
              <Card style={styles.card}>
                <CardContent style={styles.cardContent}>
                  <View style={styles.bookingHeader}>
                    <Text style={styles.customerName}>{booking.customerName}</Text>
                    <View style={styles.paymentStatusContainer}>
                      <Text style={[
                        styles.paymentStatus,
                        booking.amountPaid >= booking.totalPrice && styles.paymentStatusPaid,
                        booking.amountPaid > 0 && booking.amountPaid < booking.totalPrice && styles.paymentStatusPartial,
                        booking.amountPaid === 0 && styles.paymentStatusPending,
                      ]}>
                        {booking.amountPaid >= booking.totalPrice ? 'Fully Paid' : 
                         booking.amountPaid > 0 ? 'Half Paid' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.pitchName}>{getPitchName(booking.pitchId)}</Text>
                  <Text style={styles.bookingDate}>
                    {bookingDate.toLocaleDateString()} • {booking.startTime} - {booking.endTime}
                  </Text>
                  <Text style={styles.duration}>{booking.duration || 1} hour{booking.duration > 1 ? 's' : ''}</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.totalPrice}>₦{booking.totalPrice.toFixed(2)}</Text>
                    <TouchableOpacity 
                      style={styles.viewDetailsButton}
                      onPress={() => router.push(`/bookings/${booking.id}`)}
                    >
                      <Text style={styles.viewDetailsText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </CardContent>
              </Card>
            </TouchableOpacity>
          );
        
        case 'ongoing':
          // Calculate time remaining
          const timeRemaining = Math.max(0, (bookingEnd.getTime() - now.getTime()) / 60000); // in minutes
          const hoursRemaining = Math.floor(timeRemaining / 60);
          const minutesRemaining = Math.floor(timeRemaining % 60);
          
          return (
            <TouchableOpacity 
              key={booking.id} 
              style={styles.bookingCard}
              onPress={() => router.push(`/bookings/${booking.id}`)}
            >
              <Card style={styles.card}>
                <CardContent style={styles.cardContent}>
                  <View style={styles.bookingHeader}>
                    <Text style={styles.customerName}>{booking.customerName}</Text>
                    <View style={styles.timerContainer}>
                      <Clock color="#00FF88" size={16} />
                      <Text style={styles.timerText}>
                        {hoursRemaining > 0 ? `${hoursRemaining}h ${minutesRemaining}m` : `${minutesRemaining}m`}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.pitchName}>{getPitchName(booking.pitchId)}</Text>
                  <Text style={styles.bookingDate}>
                    Started: {bookingStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Text style={styles.expectedEnd}>
                    Expected End: {bookingEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.totalPrice}>₦{booking.totalPrice.toFixed(2)}</Text>
                    <TouchableOpacity 
                      style={styles.viewDetailsButton}
                      onPress={() => router.push(`/bookings/${booking.id}`)}
                    >
                      <Text style={styles.viewDetailsText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </CardContent>
              </Card>
            </TouchableOpacity>
          );
        
        case 'history':
          // Determine if this is a past booking that should show as completed
          const isPastBooking = booking.status === 'confirmed' && bookingEnd <= now;
          const finalStatus = isPastBooking ? 'completed' : booking.status;
          
          return (
            <TouchableOpacity 
              key={booking.id} 
              style={styles.bookingCard}
              onPress={() => router.push(`/bookings/${booking.id}`)}
            >
              <Card style={styles.card}>
                <CardContent style={styles.cardContent}>
                  <View style={styles.bookingHeader}>
                    <Text style={styles.customerName}>{booking.customerName}</Text>
                    <View style={[
                      styles.statusBadge,
                      finalStatus === 'completed' && styles.statusCompleted,
                      finalStatus === 'cancelled' && styles.statusCancelled,
                    ]}>
                      {finalStatus === 'completed' ? (
                        <CheckCircle color="#00FF88" size={16} />
                      ) : (
                        <XCircle color="#FF4444" size={16} />
                      )}
                      <Text style={styles.statusText}>{finalStatus}</Text>
                    </View>
                  </View>
                  <Text style={styles.pitchName}>{getPitchName(booking.pitchId)}</Text>
                  <Text style={styles.bookingDate}>
                    {bookingDate.toLocaleDateString()} • {booking.startTime}
                  </Text>
                  <Text style={styles.timestamp}>
                    Booked: {new Date(booking.createdAt).toLocaleDateString()}
                  </Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.totalPrice}>₦{booking.totalPrice.toFixed(2)}</Text>
                    <Text style={styles.amountPaid}>Paid: ₦{booking.amountPaid.toFixed(2)}</Text>
                  </View>
                </CardContent>
              </Card>
            </TouchableOpacity>
          );
        
        default:
          return null;
      }
    } catch (error) {
      console.error('Error rendering booking card:', error);
      return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/bookings/new')}
        >
          <Plus color="#FFFFFF" size={20} />
          <Text style={styles.addButtonText}>Add Booking</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'ongoing' && styles.activeTab]}
          onPress={() => setActiveTab('ongoing')}
        >
          <Text style={[styles.tabText, activeTab === 'ongoing' && styles.activeTabText]}>Ongoing</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
        </TouchableOpacity>
      </View>

      {sortedBookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Calendar color="#333333" size={64} />
          <Text style={styles.emptyText}>
            {activeTab === 'upcoming' && 'No upcoming bookings'}
            {activeTab === 'ongoing' && 'No ongoing bookings'}
            {activeTab === 'history' && 'No booking history'}
          </Text>
          <Text style={styles.emptySubtext}>
            {activeTab === 'upcoming' 
              ? 'Create a new booking to get started' 
              : activeTab === 'ongoing'
              ? 'Currently no matches in progress'
              : 'Completed or cancelled bookings will appear here'}
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => router.push('/bookings/new')}
          >
            <Text style={styles.emptyButtonText}>Add Booking</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00FF88" />
          }
        >
          <View style={styles.bookingsContainer}>
            {sortedBookings.map(renderBookingCard)}
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    gap: 8,
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: '#00FF88',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    justifyContent: 'center',
    gap: 8,
  },
  tab: {
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 35,
  },
  activeTab: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  tabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#000000',
  },
  bookingsContainer: {
    padding: 16,
    gap: 20,
  },
  bookingCard: {
    // TouchableOpacity wrapper
  },
  card: {
    backgroundColor: '#1E1E1E',
  },
  cardContent: {
    padding: 16,
    gap: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  paymentStatusContainer: {
    // Container for payment status
  },
  paymentStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888888',
    textTransform: 'uppercase',
  },
  paymentStatusPaid: {
    color: '#00FF88',
  },
  paymentStatusPartial: {
    color: '#FFA500',
  },
  paymentStatusPending: {
    color: '#FF4444',
  },
  pitchName: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  bookingDate: {
    fontSize: 14,
    color: '#888888',
  },
  duration: {
    fontSize: 14,
    color: '#888888',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 14,
    color: '#00FF88',
    fontWeight: '600',
  },
  expectedEnd: {
    fontSize: 14,
    color: '#888888',
  },
  timestamp: {
    fontSize: 14,
    color: '#888888',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00FF88',
  },
  amountPaid: {
    fontSize: 14,
    color: '#888888',
  },
  viewDetailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#00FF88',
    borderRadius: 4,
  },
  viewDetailsText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 14,
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
  emptyButton: {
    height: 44,
    paddingHorizontal: 24,
    backgroundColor: '#00FF88',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
});