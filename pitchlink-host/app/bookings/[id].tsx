import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBookingStore } from '@/store/useBookingStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/dateUtils';

export default function BookingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const bookings = useBookingStore((state: any) => state.bookings);
  
  const booking = bookings.find((b: any) => b.id === id);
  
  if (!booking) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.title}>Booking not found</Text>
          <Button 
            style={styles.backButton} 
            variant="default"
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Booking Details</Text>
        </View>

        <Card style={styles.infoCard}>
          <CardContent style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Customer:</Text>
              <Text style={styles.value}>{booking.customerName}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{booking.customerEmail}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{booking.customerPhone}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>
                {formatDate(new Date(booking.bookingDate))}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Time:</Text>
              <Text style={styles.value}>
                {booking.startTime} - {booking.endTime}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Status:</Text>
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
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Total Price:</Text>
              <Text style={styles.price}>${booking.totalPrice.toFixed(2)}</Text>
            </View>
          </CardContent>
        </Card>

        <View style={styles.actionsContainer}>
          <Button style={styles.actionButton} variant="default">
            <Text style={styles.actionButtonText}>Confirm Booking</Text>
          </Button>
          <Button style={styles.actionButton} variant="outline">
            <Text style={styles.actionButtonText}>Cancel Booking</Text>
          </Button>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
  backButton: {
    height: 44,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  infoCard: {
    margin: 16,
    backgroundColor: '#1E1E1E',
  },
  cardContent: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  label: {
    fontSize: 16,
    color: '#888888',
  },
  value: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00FF88',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    height: 44,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});