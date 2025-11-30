import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePitchStore } from '@/store/usePitchStore';
import { useBookingStore } from '@/store/useBookingStore';
import { Card, CardContent } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Calendar, Clock, User, CreditCard } from 'lucide-react-native';

export default function AddBookingScreen() {
  const router = useRouter();
  const pitches = usePitchStore((state) => state.pitches);
  const addBooking = useBookingStore((state) => state.addBooking);
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  // Step 1: Select Pitch
  const [selectedPitchId, setSelectedPitchId] = useState<string | null>(null);
  
  // Step 2: Choose Date & Time
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [duration, setDuration] = useState(1); // in hours
  
  // Step 3: Player Information
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Step 4: Payment Method
  const [paymentType, setPaymentType] = useState<'full' | 'half' | 'later' | 'offline' | 'transfer'>('later');
  
  // Step 5: Review & Confirm
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get available time slots for the selected pitch
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
    
    const bookings = useBookingStore.getState().bookings;
    const selectedPitchBookings = bookings.filter(booking => booking.pitchId === selectedPitchId);
    
    const newStartTime = selectedTime;
    const [startHours, startMinutes] = newStartTime.split(':').map(Number);
    const newStartDateTime = new Date(selectedDate);
    newStartDateTime.setHours(startHours, startMinutes, 0, 0);
    
    const newEndTime = new Date(newStartDateTime);
    newEndTime.setHours(newEndTime.getHours() + duration);
    
    return selectedPitchBookings.some(booking => {
      const existingStart = new Date(booking.bookingDate);
      const [existingStartHours, existingStartMinutes] = booking.startTime.split(':').map(Number);
      existingStart.setHours(existingStartHours, existingStartMinutes, 0, 0);
      
      const existingEnd = new Date(booking.bookingDate);
      const [existingEndHours, existingEndMinutes] = booking.endTime.split(':').map(Number);
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
      const amountPaid = paymentType === 'full' ? totalPrice : 
                        paymentType === 'half' ? totalPrice / 2 : 0;
      
      // Determine initial status based on payment and time
      let initialStatus: 'confirmed' | 'ongoing' | 'completed' | 'cancelled' = 'confirmed';
      
      if (paymentType === 'offline' || amountPaid > 0) {
        initialStatus = 'confirmed';
      }
      
      // Check if booking should be ongoing or completed based on current time
      const now = new Date();
      const bookingStart = new Date(selectedDate);
      bookingStart.setHours(startHours, startMinutes, 0, 0);
      
      const bookingEnd = new Date(bookingStart);
      bookingEnd.setHours(bookingEnd.getHours() + duration);
      
      if (initialStatus === 'confirmed') {
        if (bookingStart <= now && bookingEnd > now) {
          initialStatus = 'ongoing';
        } else if (bookingEnd <= now) {
          initialStatus = 'completed';
        }
      }
      
      addBooking({
        pitchId: selectedPitchId,
        customerName,
        customerEmail,
        customerPhone,
        bookingDate: selectedDate,
        startTime: selectedTime,
        endTime: endTimeString,
        status: initialStatus,
        totalPrice,
        amountPaid,
        paymentType,
        duration,
        source: 'manual', // Manually created bookings
      });
      
      // Navigate to success screen
      router.push('/bookings/success');
    } catch (error) {
      Alert.alert('Error', 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Navigation functions
  const nextStep = () => {
    if (currentStep === 2 && checkForConflicts()) {
      Alert.alert('Conflict', 'This slot is already booked. Choose another time.');
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Render step indicator
  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View key={index} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            currentStep === index + 1 && styles.activeStepCircle
          ]}>
            <Text style={[
              styles.stepText,
              currentStep === index + 1 && styles.activeStepText
            ]}>
              {index + 1}
            </Text>
          </View>
          {index < totalSteps - 1 && (
            <View style={[
              styles.stepLine,
              currentStep > index + 1 && styles.completedStepLine
            ]} />
          )}
        </View>
      ))}
    </View>
  );
  
  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Select Pitch</Text>
            <Text style={styles.stepSubtitle}>Choose from your listed pitches</Text>
            
            <View style={styles.pitchesList}>
              {pitches.map((pitch) => (
                <TouchableOpacity
                  key={pitch.id}
                  style={[
                    styles.pitchCard,
                    selectedPitchId === pitch.id && styles.selectedPitchCard
                  ]}
                  onPress={() => setSelectedPitchId(pitch.id)}
                >
                  <View style={styles.pitchInfo}>
                    <Text style={styles.pitchName}>{pitch.name}</Text>
                    <Text style={styles.pitchLocation}>{pitch.location}</Text>
                  </View>
                  <View style={styles.pitchPrice}>
                    <Text style={styles.priceText}>₦{pitch.pricePerHour.toFixed(2)}/hr</Text>
                  </View>
                </TouchableOpacity>
              ))}
              
              {pitches.length === 0 && (
                <View style={styles.emptyPitches}>
                  <Text style={styles.emptyText}>No pitches available</Text>
                  <Text style={styles.emptySubtext}>Add a pitch first to create bookings</Text>
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => router.push('/pitches/add')}
                  >
                    <Text style={styles.addButtonText}>Add Pitch</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        );
      
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Choose Date & Time</Text>
            <Text style={styles.stepSubtitle}>Select when the booking will take place</Text>
            
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
          </View>
        );
      
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Player Information</Text>
            <Text style={styles.stepSubtitle}>Enter customer details</Text>
            
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
          </View>
        );
      
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Payment Method</Text>
            <Text style={styles.stepSubtitle}>Choose how the booking will be paid</Text>
            
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
          </View>
        );
      
      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review & Confirm</Text>
            <Text style={styles.stepSubtitle}>Check all details before confirming</Text>
            
            <Card style={styles.card}>
              <CardContent style={styles.cardContent}>
                <Text style={styles.sectionTitle}>Booking Details</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Pitch:</Text>
                  <Text style={styles.detailValue}>
                    {pitches.find(p => p.id === selectedPitchId)?.name || 'Unknown'}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>
                    {selectedDate.toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Time:</Text>
                  <Text style={styles.detailValue}>
                    {selectedTime} - {(() => {
                      const [hours, minutes] = selectedTime.split(':').map(Number);
                      const endTime = new Date(selectedDate);
                      endTime.setHours(hours + duration, minutes, 0, 0);
                      return `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
                    })()}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Duration:</Text>
                  <Text style={styles.detailValue}>{duration} hour{duration > 1 ? 's' : ''}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total Amount:</Text>
                  <Text style={styles.detailValue}>₦{(() => {
                    const pitch = pitches.find(p => p.id === selectedPitchId);
                    return pitch ? (pitch.pricePerHour * duration).toFixed(2) : '0.00';
                  })()}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Payment Type:</Text>
                  <Text style={styles.detailValue}>
                    {paymentType === 'full' && 'Full Payment'}
                    {paymentType === 'half' && 'Half Payment'}
                    {paymentType === 'later' && 'Pay Later'}
                    {paymentType === 'offline' && 'Paid Offline'}
                    {paymentType === 'transfer' && 'Transfer Received'}
                  </Text>
                </View>
                
                <View style={styles.divider} />
                
                <Text style={styles.sectionTitle}>Customer Information</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>{customerName}</Text>
                </View>
                
                {customerEmail ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>{customerEmail}</Text>
                  </View>
                ) : null}
                
                {customerPhone ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phone:</Text>
                    <Text style={styles.detailValue}>{customerPhone}</Text>
                  </View>
                ) : null}
              </CardContent>
            </Card>
          </View>
        );
      
      default:
        return null;
    }
  };
  
  // Render navigation buttons
  const renderNavigationButtons = () => (
    <View style={styles.buttonContainer}>
      {currentStep > 1 && (
        <TouchableOpacity 
          style={styles.navButton}
          onPress={prevStep}
        >
          <Text style={styles.navButtonText}>Back</Text>
        </TouchableOpacity>
      )}
      
      {currentStep < totalSteps ? (
        <TouchableOpacity 
          style={[styles.navButton, styles.nextButton]}
          onPress={nextStep}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={[styles.navButton, styles.submitButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Creating...' : 'Confirm Booking'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Booking</Text>
        <Text style={styles.stepInfo}>{currentStep}/{totalSteps}</Text>
      </View>
      
      {renderStepIndicator()}
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {renderStepContent()}
      </ScrollView>
      
      {renderNavigationButtons()}
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
  stepInfo: {
    fontSize: 16,
    color: '#888888',
  },
  stepIndicator: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStepCircle: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  stepText: {
    color: '#888888',
    fontWeight: '600',
  },
  activeStepText: {
    color: '#000000',
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333333',
  },
  completedStepLine: {
    backgroundColor: '#00FF88',
  },
  stepContent: {
    gap: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#888888',
  },
  pitchesList: {
    gap: 12,
  },
  pitchCard: {
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  selectedPitchCard: {
    borderColor: '#00FF88',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  pitchInfo: {
    gap: 4,
  },
  pitchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pitchLocation: {
    fontSize: 14,
    color: '#888888',
  },
  pitchPrice: {
    marginTop: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00FF88',
  },
  emptyPitches: {
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
  },
  addButton: {
    height: 44,
    paddingHorizontal: 24,
    backgroundColor: '#00FF88',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1E1E1E',
  },
  cardContent: {
    padding: 16,
    gap: 16,
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
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
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
  inputGroup: {
    gap: 8,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#888888',
  },
  detailValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    padding: 20,
    paddingTop: 10,
  },
  navButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  nextButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  submitButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
  },
});