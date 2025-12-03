import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBookingStore } from '@/store/useBookingStore';
import { usePitchStore } from '@/store/usePitchStore';
import { Card, CardContent } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Edit, Trash, CreditCard } from 'lucide-react-native';
import { Booking } from '@/store/useBookingStore';

export default function BookingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const bookings = useBookingStore((state) => state.bookings);
  const pitches = usePitchStore((state) => state.pitches);
  const updateBooking = useBookingStore((state) => state.updateBooking);
  const deleteBooking = useBookingStore((state) => state.deleteBooking);
  const cancelBooking = useBookingStore((state) => state.cancelBooking);
  const addPayment = useBookingStore((state) => state.addPayment);
  
  const booking = bookings.find((b) => b.id === id);
  
  // Payment state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  
  if (!booking) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.title}>Booking not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // Get pitch information
  const pitch = pitches.find(p => p.id === booking.pitchId);
  
  const handleStatusChange = (newStatus: Booking['status']) => {
    updateBooking(booking.id, { status: newStatus });
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Booking',
      'Are you sure you want to delete this booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteBooking(booking.id);
            router.back();
          }
        },
      ]
    );
  };
  
  const handleAddPayment = () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    if (amount > (booking.totalPrice - booking.amountPaid)) {
      Alert.alert('Error', 'Payment amount exceeds remaining balance');
      return;
    }
    
    addPayment(booking.id, amount);
    setPaymentAmount('');
    setShowPaymentForm(false);
  };
  
  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: () => {
            cancelBooking(booking.id);
            router.back();
          }
        },
      ]
    );
  };
  
  // Calculate remaining balance
  const remainingBalance = booking.totalPrice - booking.amountPaid;
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Booking Details</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => router.push(`/bookings/edit/${id}`)}
            >
              <Edit color="#00FF88" size={20} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Trash color="#FF4444" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <Card style={styles.infoCard}>
          <CardContent style={styles.cardContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{booking.customerName}</Text>
              </View>
              {booking.customerEmail ? (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Email:</Text>
                  <Text style={styles.value}>{booking.customerEmail}</Text>
                </View>
              ) : null}
              {booking.customerPhone ? (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Phone:</Text>
                  <Text style={styles.value}>{booking.customerPhone}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Booking Details</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Pitch:</Text>
                <Text style={styles.value}>{pitch?.name || 'Unknown Pitch'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>{new Date(booking.bookingDate).toLocaleDateString()}</Text>
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
                <Text style={styles.priceValue}>₦{booking.totalPrice.toFixed(2)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Booking Source:</Text>
                <View style={styles.sourceBadge}>
                  <Text style={styles.sourceText}>
                    {booking.source === 'player-app' ? 'Player App' : 'Manual Booking'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Payment Information</Text>
                <TouchableOpacity 
                  style={styles.addPaymentButton}
                  onPress={() => setShowPaymentForm(!showPaymentForm)}
                >
                  <CreditCard color="#00FF88" size={16} />
                  <Text style={styles.addPaymentText}>Add Payment</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.paymentInfo}>
                <View style={styles.paymentRow}>
                  <Text style={styles.label}>Payment Type:</Text>
                  <Text style={styles.value}>
                    {booking.paymentType === 'full' && 'Full Payment'}
                    {booking.paymentType === 'partial' && 'Partial Payment'}
                    {booking.paymentType === 'later' && 'Pay Later'}
                  </Text>
                </View>

                <View style={styles.paymentRow}>
                  <Text style={styles.label}>Amount Paid:</Text>
                  <Text style={styles.paidValue}>₦{booking.amountPaid.toFixed(2)}</Text>
                </View>
                
                <View style={styles.paymentRow}>
                  <Text style={styles.label}>Remaining Balance:</Text>
                  <Text style={styles.balanceValue}>₦{remainingBalance.toFixed(2)}</Text>
                </View>
                
                <View style={styles.paymentRow}>
                  <Text style={styles.label}>Payment Status:</Text>
                  <View style={[
                    styles.paymentStatusBadge,
                    booking.amountPaid >= booking.totalPrice && styles.paymentStatusPaid,
                    booking.amountPaid > 0 && booking.amountPaid < booking.totalPrice && styles.paymentStatusPartial,
                    booking.amountPaid === 0 && styles.paymentStatusPending,
                  ]}>
                    <Text style={styles.paymentStatusText}>
                      {booking.amountPaid >= booking.totalPrice ? 'Fully Paid' : 
                       booking.amountPaid > 0 ? 'Half Paid' : 'Pending Payment'}
                    </Text>
                  </View>
                </View>
              </View>
              
              {showPaymentForm && (
                <View style={styles.paymentForm}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Payment Amount (₦)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter amount"
                      placeholderTextColor="#888888"
                      value={paymentAmount}
                      onChangeText={setPaymentAmount}
                      keyboardType="decimal-pad"
                    />
                    <Text style={styles.remainingText}>
                      Remaining: ₦{remainingBalance.toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={styles.paymentActions}>
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={() => setShowPaymentForm(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.saveButton}
                      onPress={handleAddPayment}
                    >
                      <Text style={styles.saveButtonText}>Add Payment</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Status</Text>
              {booking.source === 'manual' ? (
                // For manual bookings, show status as read-only
                <View style={styles.statusContainer}>
                  <View 
                    style={[
                      styles.statusOption,
                      booking.status === 'confirmed' && styles.statusOptionSelected
                    ]}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      booking.status === 'confirmed' && styles.statusOptionTextSelected
                    ]}>Confirmed</Text>
                  </View>
                  
                  <View 
                    style={[
                      styles.statusOption,
                      booking.status === 'ongoing' && styles.statusOptionSelected
                    ]}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      booking.status === 'ongoing' && styles.statusOptionTextSelected
                    ]}>Ongoing</Text>
                  </View>
                  
                  <View 
                    style={[
                      styles.statusOption,
                      booking.status === 'completed' && styles.statusOptionSelected
                    ]}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      booking.status === 'completed' && styles.statusOptionTextSelected
                    ]}>Completed</Text>
                  </View>
                  
                  <View 
                    style={[
                      styles.statusOption,
                      booking.status === 'cancelled' && styles.statusOptionSelected
                    ]}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      booking.status === 'cancelled' && styles.statusOptionTextSelected
                    ]}>Cancelled</Text>
                  </View>
                </View>
              ) : (
                // For player app bookings, keep the interactive status options
                <View style={styles.statusContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.statusOption,
                      booking.status === 'confirmed' && styles.statusOptionSelected
                    ]}
                    onPress={() => handleStatusChange('confirmed')}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      booking.status === 'confirmed' && styles.statusOptionTextSelected
                    ]}>Confirmed</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.statusOption,
                      booking.status === 'ongoing' && styles.statusOptionSelected
                    ]}
                    onPress={() => handleStatusChange('ongoing')}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      booking.status === 'ongoing' && styles.statusOptionTextSelected
                    ]}>Ongoing</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.statusOption,
                      booking.status === 'completed' && styles.statusOptionSelected
                    ]}
                    onPress={() => handleStatusChange('completed')}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      booking.status === 'completed' && styles.statusOptionTextSelected
                    ]}>Completed</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.statusOption,
                      booking.status === 'cancelled' && styles.statusOptionSelected
                    ]}
                    onPress={() => handleStatusChange('cancelled')}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      booking.status === 'cancelled' && styles.statusOptionTextSelected
                    ]}>Cancelled</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </CardContent>
        </Card>

        <View style={styles.actionsContainer}>
          {booking.status !== 'cancelled' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelActionButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelActionButtonText}>Cancel Booking</Text>
            </TouchableOpacity>
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    height: 44,
    paddingHorizontal: 24,
    backgroundColor: '#00FF88',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
  infoCard: {
    margin: 16,
    backgroundColor: '#1E1E1E',
  },
  cardContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
  priceValue: {
    fontSize: 18,
    color: '#00FF88',
    fontWeight: 'bold',
  },
  sourceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  sourceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderRadius: 6,
  },
  addPaymentText: {
    color: '#00FF88',
    fontWeight: '600',
    fontSize: 14,
  },
  paymentInfo: {
    gap: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paidValue: {
    fontSize: 16,
    color: '#00FF88',
    fontWeight: '600',
  },
  balanceValue: {
    fontSize: 16,
    color: '#FFA500',
    fontWeight: '600',
  },
  paymentStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  paymentStatusPaid: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  paymentStatusPartial: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
  },
  paymentStatusPending: {
    backgroundColor: 'rgba(100, 100, 255, 0.2)',
  },
  paymentStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  paymentForm: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#0A0A0A',
    borderRadius: 8,
  },
  inputGroup: {
    gap: 8,
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    backgroundColor: '#1E1E1E',
  },
  remainingText: {
    fontSize: 14,
    color: '#888888',
  },
  paymentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FF4444',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#00FF88',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
  },
  statusOptionSelected: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  statusOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusOptionTextSelected: {
    color: '#000000',
  },
  actionsContainer: {
    padding: 16,
  },
  actionButton: {
    height: 44,
    backgroundColor: '#00FF88',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
  cancelActionButton: {
    backgroundColor: '#FF4444',
    marginBottom: 12,
  },
  cancelActionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

});
