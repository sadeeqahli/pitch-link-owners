import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, CardContent } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useBookingStore } from '@/store/useBookingStore';

export default function BookingSuccessScreen() {
  const router = useRouter();
  const bookings = useBookingStore((state) => state.bookings);
  const latestBooking = bookings[bookings.length - 1]; // Get the most recent booking

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <IconSymbol name="checkmark.circle.fill" size={80} color="#00FF88" />
        
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>Your booking has been successfully created</Text>
        
        {latestBooking && (
          <Card style={styles.card}>
            <CardContent style={styles.cardContent}>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Booking Reference:</Text>
                <Text style={styles.value}>#{latestBooking.id.substring(0, 8)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.label}>Date & Time:</Text>
                <Text style={styles.value}>
                  {new Date(latestBooking.bookingDate).toLocaleDateString()} • {latestBooking.startTime}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.label}>Total Amount:</Text>
                <Text style={styles.value}>₦{latestBooking.totalPrice.toFixed(2)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.label}>Payment Status:</Text>
                <View style={[
                  styles.statusBadge,
                  latestBooking.amountPaid >= latestBooking.totalPrice && styles.statusPaid,
                  latestBooking.amountPaid > 0 && latestBooking.amountPaid < latestBooking.totalPrice && styles.statusPartial,
                  latestBooking.amountPaid === 0 && styles.statusPending,
                ]}>
                  <Text style={styles.statusText}>
                    {latestBooking.amountPaid >= latestBooking.totalPrice ? 'Fully Paid' : 
                     latestBooking.amountPaid > 0 ? 'Half Paid' : 'Pending Payment'}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>
        )}
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/bookings')}
          >
            <Text style={styles.actionButtonText}>View All Bookings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => router.push('/bookings/new')}
          >
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Add Another Booking</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1E1E1E',
    width: '100%',
  },
  cardContent: {
    padding: 20,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statusPaid: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  statusPartial: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
  },
  statusPending: {
    backgroundColor: 'rgba(100, 100, 255, 0.2)',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actions: {
    width: '100%',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    height: 50,
    backgroundColor: '#00FF88',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333333',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
  },
});