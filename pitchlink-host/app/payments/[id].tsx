import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePaymentStore } from '@/store/usePaymentStore';
import { useBookingStore } from '@/store/useBookingStore';
import { usePitchStore } from '@/store/usePitchStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { formatDate, formatTime } from '@/utils/dateUtils';

export default function PaymentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const payments = usePaymentStore((state) => state.payments);
  const bookings = useBookingStore((state) => state.bookings);
  const pitches = usePitchStore((state) => state.pitches);
  
  // Fix: id from useLocalSearchParams is a string, so we need to convert it properly
  const payment = payments.find((p: any) => p.id === id);
  
  if (!payment) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.title}>Payment not found</Text>
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
  
  // Get booking and pitch information
  const booking = bookings.find((b: any) => b.id === payment.bookingId);
  const pitch = booking ? pitches.find((p: any) => p.id === booking.pitchId) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Payment Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Payment Summary */}
        <Card style={styles.summaryCard}>
          <CardContent style={styles.summaryCardContent}>
            <Text style={styles.summaryTitle}>Payment Summary</Text>
            <Text style={styles.amount}>₦{(payment.amount * 0.9).toFixed(2)}</Text>
            <Text style={styles.originalAmount}>Original: ₦{payment.amount.toFixed(2)}</Text>
            <View style={styles.feeInfo}>
              <Text style={styles.feeText}>10% platform fee deducted</Text>
            </View>
          </CardContent>
        </Card>
        
        {/* Payment Information */}
        <Card style={styles.infoCard}>
          <CardContent style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Payment ID:</Text>
              <Text style={styles.value}>#{payment.id.substring(0, 8)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Status:</Text>
              <View style={[
                styles.statusBadge,
                payment.status === 'pending' && styles.statusPending,
                payment.status === 'paid' && styles.statusPaid,
                payment.status === 'failed' && styles.statusFailed,
                payment.status === 'refunded' && styles.statusRefunded,
              ]}>
                <Text style={styles.statusText}>{payment.status}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Payment Method:</Text>
              <Text style={styles.value}>
                {payment.paymentMethod === 'card' ? 'Card Payment' : 
                 payment.paymentMethod === 'transfer' ? 'Bank Transfer' : 'Cash'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Transaction ID:</Text>
              <Text style={styles.value}>
                {payment.transactionId || 'N/A'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Date & Time:</Text>
              <Text style={styles.value}>
                {formatDate(new Date(payment.createdAt))} at {formatTime(new Date(payment.createdAt))}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Source:</Text>
              <View style={styles.sourceBadge}>
                <Text style={styles.sourceText}>
                  {payment.source === 'player-app' ? 'Player App Payment' : 'Manual Booking'}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>
        
        {/* Booking Information */}
        {booking && (
          <Card style={styles.infoCard}>
            <CardContent style={styles.cardContent}>
              <Text style={styles.sectionTitle}>Booking Information</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Customer:</Text>
                <Text style={styles.value}>{booking.customerName}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Pitch:</Text>
                <Text style={styles.value}>{pitch ? pitch.name : 'Unknown Pitch'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Booking Date:</Text>
                <Text style={styles.value}>{formatDate(new Date(booking.bookingDate))}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Time:</Text>
                <Text style={styles.value}>{booking.startTime} - {booking.endTime}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Duration:</Text>
                <Text style={styles.value}>{booking.duration || 1} hour{booking.duration > 1 ? 's' : ''}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Total Price:</Text>
                <Text style={styles.price}>₦{booking.totalPrice.toFixed(2)}</Text>
              </View>
            </CardContent>
          </Card>
        )}
        
        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Button 
            style={styles.actionButton} 
            variant="outline"
            onPress={() => console.log('Download receipt')}
          >
            <IconSymbol name="arrow.down" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Download Receipt</Text>
          </Button>
          
          {payment.status === 'paid' && (
            <Button 
              style={styles.actionButton} 
              variant="outline"
              onPress={() => console.log('Issue refund')}
            >
              <IconSymbol name="arrow.counterclockwise" size={20} color="#FF4444" />
              <Text style={styles.actionButtonText}>Issue Refund</Text>
            </Button>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
  backButton: {
    height: 44,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  summaryCard: {
    margin: 16,
    backgroundColor: '#1E1E1E',
  },
  summaryCardContent: {
    padding: 24,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00FF88',
    marginBottom: 4,
  },
  originalAmount: {
    fontSize: 16,
    color: '#888888',
    textDecorationLine: 'line-through',
    marginBottom: 16,
  },
  feeInfo: {
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  feeText: {
    fontSize: 14,
    color: '#FFA500',
    fontWeight: '600',
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#1E1E1E',
  },
  cardContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
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
  statusPaid: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  statusFailed: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
  },
  statusRefunded: {
    backgroundColor: 'rgba(100, 100, 255, 0.2)',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  sourceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  sourceText: {
    fontSize: 14,
    color: '#00FF88',
    fontWeight: '600',
  },
  price: {
    fontSize: 18,
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
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});