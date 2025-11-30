import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePitchStore } from '@/store/usePitchStore';
import { useBookingStore } from '@/store/useBookingStore';
import { Card, CardContent } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function EditBookingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const bookings = useBookingStore((state) => state.bookings);
  const pitches = usePitchStore((state) => state.pitches);
  const updateBooking = useBookingStore((state) => state.updateBooking);
  
  const booking = bookings.find((b) => b.id === id);
  
  // Form state
  const [selectedPitchId, setSelectedPitchId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [duration, setDuration] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentType, setPaymentType] = useState<'full' | 'half' | 'later' | 'offline' | 'transfer'>('later');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with booking data
  useEffect(() => {
    if (booking) {
      setSelectedPitchId(booking.pitchId);
      setSelectedDate(new Date(booking.bookingDate));
      setSelectedTime(booking.startTime);
      setDuration(booking.duration);
      setCustomerName(booking.customerName);
      setCustomerEmail(booking.customerEmail);
      setCustomerPhone(booking.customerPhone);
      setPaymentType(booking.paymentType);
    }
  }, [booking]);
  
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
  
  // Get available time slots
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 22; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      slots.push(time);
      if (hour < 22) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };
  
  // Check for booking conflicts
  const checkForConflicts = () => {
    if (!selectedPitchId) return false;
    
    const allBookings = useBookingStore.getState().bookings;
    const selectedPitchBookings = allBookings.filter(b => 
      b.pitchId === selectedPitchId && b.id !== booking.id
    );
    
    const newStartTime = selectedTime;
    const [startHours, startMinutes] = newStartTime.split(':').map(Number);
    const newStartDateTime = new Date(selectedDate);
    newStartDateTime.setHours(startHours, startMinutes, 0, 0);
    
    const newEndTime = new Date(newStartDateTime);
    newEndTime.setHours(newEndTime.getHours() + duration);
    
    return selectedPitchBookings.some(b => {
      const existingStart = new Date(b.bookingDate);
      const [existingStartHours, existingStartMinutes] = b.startTime.split(':').map(Number);
      existingStart.setHours(existingStartHours, existingStartMinutes, 0, 0);
      
      const existingEnd = new Date(b.bookingDate);
      const [existingEndHours, existingEndMinutes] = b.endTime.split(':').map(Number);
      existingEnd.setHours(existingEndHours, existingEndMinutes, 0, 0);
      
      return (
        existingStart < newEndTime && 
        existingEnd > newStartDateTime
      );
    });
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!selectedPitchId || !customerName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    // Check for conflicts
    if (checkForConflicts()) {
      Alert.alert('Conflict', 'This slot is already booked. Choose another time.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const selectedPitch = pitches.find(pitch => pitch.id === selectedPitchId);
      if (!selectedPitch) {
        throw new Error('Selected pitch not found');
      }
      
      // Calculate end time
      const [startHours, startMinutes] = selectedTime.split(':').map(Number);
      const endTime = new Date(selectedDate);
      endTime.setHours(startHours + duration, startMinutes, 0, 0);
      const endTimeString = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
      
      // Calculate price based on duration
      const totalPrice = selectedPitch.pricePerHour * duration;
      
      updateBooking(booking.id, {
        pitchId: selectedPitchId,
        customerName,
        customerEmail,
        customerPhone,
        bookingDate: selectedDate,
        startTime: selectedTime,
        endTime: endTimeString,
        duration,
        totalPrice,
        paymentType,
      });
      
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update booking');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Booking</Text>
        <View style={{ width: 24 }} /> {/* Spacer for alignment */}
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Pitch Information</Text>
          <Card style={styles.card}>
            <CardContent style={styles.cardContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Pitch *</Text>
                {pitches.map((pitch) => (
                  <TouchableOpacity
                    key={pitch.id}
                    style={[
                      styles.pitchOption,
                      selectedPitchId === pitch.id && styles.selectedPitchOption
                    ]}
                    onPress={() => setSelectedPitchId(pitch.id)}
                  >
                    <View style={styles.pitchInfo}>
                      <Text style={styles.pitchName}>{pitch.name}</Text>
                      <Text style={styles.pitchLocation}>{pitch.location}</Text>
                    </View>
                    <Text style={styles.pitchPrice}>₦{pitch.pricePerHour.toFixed(2)}/hr</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </CardContent>
          </Card>
          
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <Card style={styles.card}>
            <CardContent style={styles.cardContent}>
              <View style={styles.dateSelector}>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() - 1);
                    setSelectedDate(newDate);
                  }}
                >
                  <IconSymbol name="chevron.left" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                
                <View style={styles.dateDisplay}>
                  <Text style={styles.dateText}>
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() + 1);
                    setSelectedDate(newDate);
                  }}
                >
                  <IconSymbol name="chevron.right" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.timeContainer}>
                <Text style={styles.label}>Start Time</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeSlots}>
                  {getTimeSlots().map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeSlot,
                        selectedTime === time && styles.selectedTimeSlot
                      ]}
                      onPress={() => setSelectedTime(time)}
                    >
                      <Text style={[
                        styles.timeText,
                        selectedTime === time && styles.selectedTimeText
                      ]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.durationContainer}>
                <Text style={styles.label}>Duration</Text>
                <View style={styles.durationOptions}>
                  {[1, 2].map((hours) => (
                    <TouchableOpacity
                      key={hours}
                      style={[
                        styles.durationButton,
                        duration === hours && styles.selectedDurationButton
                      ]}
                      onPress={() => setDuration(hours)}
                    >
                      <Text style={[
                        styles.durationText,
                        duration === hours && styles.selectedDurationText
                      ]}>
                        {hours} hour{hours > 1 ? 's' : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </CardContent>
          </Card>
          
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <Card style={styles.card}>
            <CardContent style={styles.cardContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter customer name"
                  placeholderTextColor="#888888"
                  value={customerName}
                  onChangeText={setCustomerName}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter email (optional)"
                  placeholderTextColor="#888888"
                  value={customerEmail}
                  onChangeText={setCustomerEmail}
                  keyboardType="email-address"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter phone number"
                  placeholderTextColor="#888888"
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </CardContent>
          </Card>
          
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <Card style={styles.card}>
            <CardContent style={styles.cardContent}>
              <View style={styles.paymentOptions}>
                {[
                  { id: 'full', label: 'Full Payment', description: 'Complete payment now' },
                  { id: 'half', label: 'Half Payment', description: '50% deposit now' },
                  { id: 'later', label: 'Pay Later', description: 'Customer pays at pitch' },
                  { id: 'offline', label: 'Paid Offline', description: 'Payment collected in person' },
                  { id: 'transfer', label: 'Transfer Received', description: 'Bank transfer confirmed' }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.paymentOption,
                      paymentType === option.id && styles.selectedPaymentOption
                    ]}
                    onPress={() => setPaymentType(option.id as any)}
                  >
                    <View style={styles.paymentOptionContent}>
                      <Text style={styles.paymentOptionLabel}>{option.label}</Text>
                      <Text style={styles.paymentOptionDescription}>{option.description}</Text>
                    </View>
                    {paymentType === option.id && (
                      <IconSymbol name="checkmark.circle.fill" size={24} color="#00FF88" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.saveButtonText}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>
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
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
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
  form: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#1E1E1E',
  },
  cardContent: {
    padding: 16,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    backgroundColor: '#0A0A0A',
  },
  pitchOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  selectedPitchOption: {
    borderColor: '#00FF88',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  pitchInfo: {
    gap: 4,
  },
  pitchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pitchLocation: {
    fontSize: 14,
    color: '#888888',
  },
  pitchPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00FF88',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButton: {
    padding: 10,
  },
  dateDisplay: {
    padding: 10,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeContainer: {
    gap: 8,
  },
  timeSlots: {
    flexDirection: 'row',
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  selectedTimeSlot: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  timeText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectedTimeText: {
    color: '#000000',
  },
  durationContainer: {
    gap: 8,
  },
  durationOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  selectedDurationButton: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  durationText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectedDurationText: {
    color: '#000000',
  },
  paymentOptions: {
    gap: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  selectedPaymentOption: {
    borderColor: '#00FF88',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  paymentOptionContent: {
    gap: 4,
  },
  paymentOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  paymentOptionDescription: {
    fontSize: 14,
    color: '#888888',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    padding: 20,
    paddingTop: 10,
  },
  cancelButton: {
    flex: 1,
    height: 50,
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
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#00FF88',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
  },
});