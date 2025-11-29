import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookingStore } from '@/store/useBookingStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react-native';
import { formatDate } from '@/utils/dateUtils';

export default function BookingsScreen() {
  const bookings = useBookingStore((state: any) => state.bookings);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'pending'>('all');

  const filteredBookings = bookings.filter((booking: any) => {
    const bookingDate = new Date(booking.bookingDate);
    const today = new Date();
    
    switch (filter) {
      case 'today':
        return bookingDate.toDateString() === today.toDateString();
      case 'upcoming':
        return bookingDate > today;
      case 'pending':
        return booking.status === 'pending';
      default:
        return true;
    }
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <Button style={styles.addButton} variant="default">
          <Plus color="#FFFFFF" size={20} />
          <Text style={styles.addButtonText}>New Booking</Text>
        </Button>
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
          style={[styles.filterButton, filter === 'today' && styles.activeFilter]}
          variant={filter === 'today' ? 'default' : 'outline'}
          onPress={() => setFilter('today')}
        >
          <Text style={[styles.filterText, filter === 'today' && styles.activeFilterText]}>Today</Text>
        </Button>
        <Button 
          style={[styles.filterButton, filter === 'upcoming' && styles.activeFilter]}
          variant={filter === 'upcoming' ? 'default' : 'outline'}
          onPress={() => setFilter('upcoming')}
        >
          <Text style={[styles.filterText, filter === 'upcoming' && styles.activeFilterText]}>Upcoming</Text>
        </Button>
        <Button 
          style={[styles.filterButton, filter === 'pending' && styles.activeFilter]}
          variant={filter === 'pending' ? 'default' : 'outline'}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.activeFilterText]}>Pending</Text>
        </Button>
      </View>

      {filteredBookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No bookings found</Text>
          <Text style={styles.emptySubtext}>
            {filter === 'all' 
              ? 'Create your first booking to get started' 
              : `No ${filter} bookings`}
          </Text>
          <Button style={styles.emptyButton} variant="default">
            <Text style={styles.emptyButtonText}>Add Booking</Text>
          </Button>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.bookingsContainer}>
            {filteredBookings.map((booking: any) => (
              <Card key={booking.id} style={styles.bookingCard}>
                <CardContent style={styles.cardContent}>
                  <View style={styles.bookingHeader}>
                    <Text style={styles.customerName}>{booking.customerName}</Text>
                    <View style={[
                      styles.statusBadge,
                      booking.status === 'pending' && styles.statusPending,
                      booking.status === 'confirmed' && styles.statusConfirmed,
                      booking.status === 'cancelled' && styles.statusCancelled,
                      booking.status === 'completed' && styles.statusCompleted,
                    ]}>
                      <Text style={styles.statusText}>{booking.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.bookingDate}>
                    {formatDate(new Date(booking.bookingDate))} • {booking.startTime} - {booking.endTime}
                  </Text>
                  <Text style={styles.pitchInfo}>Pitch #{booking.pitchId.substring(0, 8)}</Text>
                  <View style={styles.bookingFooter}>
                    <Text style={styles.totalPrice}>${booking.totalPrice.toFixed(2)}</Text>
                  </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    gap: 8,
    height: 40,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  bookingsContainer: {
    padding: 16,
    gap: 16,
  },
  bookingCard: {
    backgroundColor: '#1E1E1E',
  },
  cardContent: {
    padding: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 18,
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
  statusConfirmed: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  statusCancelled: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
  },
  statusCompleted: {
    backgroundColor: 'rgba(100, 100, 255, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  bookingDate: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  pitchInfo: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 12,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00FF88',
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
  emptyButton: {
    height: 44,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});