import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePitchStore } from '@/store/usePitchStore';
import { useBookingStore } from '@/store/useBookingStore';
import { Card, CardContent } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Calendar, Clock, User, CreditCard } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddBookingScreen() {
  const router = useRouter();
  const pitches = usePitchStore((state) => state.pitches);
  const addBooking = useBookingStore((state) => state.addBooking);
  
  // Form state
  const [selectedPitchId, setSelectedPitchId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [duration, setDuration] = useState(1); // in hours
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentType, setPaymentType] = useState<'full' | 'half' | 'later' | 'offline' | 'transfer'>('later');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Settings state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maxManualBookingsPerDay, setMaxManualBookingsPerDay] = useState(10);
  const [maxEarlyBookingDays, setMaxEarlyBookingDays] = useState(30);
  
  // Dropdown states
  const [showPitchDropdown, setShowPitchDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  
  // Load settings
  useEffect(() => {
    loadSettings();
    
    // Add event listener to reload settings when they change
    const reloadSettings = () => {
      loadSettings();
    };
    
    // We'll simulate settings change detection by reloading every 5 seconds
    // In a real app, you might use a more sophisticated approach
    const interval = setInterval(reloadSettings, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const loadSettings = async () => {
    try {
      // Load business settings
      const businessSettings = await AsyncStorage.getItem('businessSettings');
      if (businessSettings) {
        const parsedSettings = JSON.parse(businessSettings);
        setMaintenanceMode(parsedSettings.maintenanceMode || false);
        setMaxManualBookingsPerDay(parseInt(parsedSettings.maxManualBookings) || 10);
      }
      
      // Load general settings
      const generalSettings = await AsyncStorage.getItem('generalSettings');
      if (generalSettings) {
        const parsedSettings = JSON.parse(generalSettings);
        setMaxEarlyBookingDays(parseInt(parsedSettings.maxEarlyBookingDays) || 30);
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };
  
  // Get available time slots for the selected pitch
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 22; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      slots.push(time);
    }
    return slots;
  };
  
  // Get available dates (next N days based on settings)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    // Use maxEarlyBookingDays from settings, default to 30 if not loaded
    const daysToShow = maxEarlyBookingDays || 30;
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };
  
  // Check for booking conflicts
  const checkForConflicts = () => {
    if (!selectedPitchId) return false;
    
    // Calculate end time
    const [startHours, startMinutes] = selectedTime.split(':').map(Number);
    const endTime = new Date(selectedDate);
    endTime.setHours(startHours + duration, startMinutes, 0, 0);
    const endTimeString = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
    
    const bookings = useBookingStore.getState();
    return bookings.checkForConflicts(selectedPitchId, selectedTime, endTimeString, selectedDate);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!selectedPitchId) {
      Alert.alert('Error', 'Please select a pitch');
      return;
    }
    
    if (!customerName.trim()) {
      Alert.alert('Error', 'Please enter customer name');
      return;
    }
    
    // Check if maintenance mode is enabled
    if (maintenanceMode) {
      Alert.alert('Maintenance Mode', 'New bookings cannot be created while the business is in maintenance mode. Please disable maintenance mode in business settings to create bookings.');
      return;
    }
    
    // Check if the selected date is beyond the maximum early booking days
    const today = new Date();
    const selectedDateTime = new Date(selectedDate);
    const timeDiff = selectedDateTime.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff > maxEarlyBookingDays) {
      Alert.alert('Booking Too Far', `Bookings can only be made up to ${maxEarlyBookingDays} days in advance. Please select an earlier date.`);
      return;
    }
    
    // Check if the maximum manual bookings per day limit has been reached
    const bookings = useBookingStore.getState().bookings;
    const manualBookingsForDate = bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      return (
        booking.source === 'manual' &&
        bookingDate.toDateString() === selectedDate.toDateString()
      );
    });
    
    if (manualBookingsForDate.length >= maxManualBookingsPerDay) {
      Alert.alert('Booking Limit Reached', `You have reached the maximum limit of ${maxManualBookingsPerDay} manual bookings per day. Please select a different date or adjust the limit in business settings.`);
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
  
  // Navigation functions (simplified for single step)
  const nextStep = () => {
    // Not used in single step flow
  };
  
  const prevStep = () => {
    // Not used in single step flow
  };
  
  // Render step content
  const renderStepContent = () => {
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>Create New Booking</Text>
        <Text style={styles.stepSubtitle}>Fill in all booking details</Text>
        
        <ScrollView style={styles.singleFormScrollView}>
          {/* Pitch Selection */}
          <Card style={styles.card}>
            <CardContent style={styles.cardContent}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="sportscourt.fill" size={20} color="#00FF88" />
                <Text style={styles.sectionTitle}>Select Pitch</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setShowPitchDropdown(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  {selectedPitchId 
                    ? pitches.find(p => p.id === selectedPitchId)?.name 
                    : 'Select a pitch'}
                </Text>
                <IconSymbol name="chevron.down" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              
              {/* Pitch Dropdown Modal */}
              <Modal
                visible={showPitchDropdown}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Select Pitch</Text>
                      <TouchableOpacity onPress={() => setShowPitchDropdown(false)}>
                        <IconSymbol name="xmark" size={24} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                    
                    <ScrollView>
                      {pitches.map((pitch) => (
                        <TouchableOpacity
                          key={pitch.id}
                          style={styles.modalOption}
                          onPress={() => {
                            setSelectedPitchId(pitch.id);
                            setShowPitchDropdown(false);
                          }}
                        >
                          <Text style={styles.modalOptionText}>{pitch.name}</Text>
                          <Text style={styles.modalOptionSubtext}>{pitch.location}</Text>
                        </TouchableOpacity>
                      ))}
                      
                      {pitches.length === 0 && (
                        <View style={styles.emptyPitches}>
                          <Text style={styles.emptyText}>No pitches available</Text>
                          <Text style={styles.emptySubtext}>Add a pitch first to create bookings</Text>
                          <TouchableOpacity 
                            style={styles.addButton}
                            onPress={() => {
                              setShowPitchDropdown(false);
                              router.push('/pitches/add');
                            }}
                          >
                            <Text style={styles.addButtonText}>Add Pitch</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                </View>
              </Modal>
            </CardContent>
          </Card>
          
          {/* Customer Name */}
          <Card style={styles.card}>
            <CardContent style={styles.cardContent}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="person.fill" size={20} color="#00FF88" />
                <Text style={styles.sectionTitle}>Customer Information</Text>
              </View>
              
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
            </CardContent>
          </Card>
          
          {/* Date Selection */}
          <Card style={styles.card}>
            <CardContent style={styles.cardContent}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="calendar" size={20} color="#00FF88" />
                <Text style={styles.sectionTitle}>Select Date</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setShowDateDropdown(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
                <IconSymbol name="chevron.down" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              
              {/* Date Dropdown Modal */}
              <Modal
                visible={showDateDropdown}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Select Date</Text>
                      <TouchableOpacity onPress={() => setShowDateDropdown(false)}>
                        <IconSymbol name="xmark" size={24} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.modalSubheader}>
                      <Text style={styles.modalSubtitle}>
                        Showing dates up to {maxEarlyBookingDays} days in advance
                      </Text>
                    </View>
                    
                    <ScrollView>
                      {getAvailableDates().map((date, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.modalOption}
                          onPress={() => {
                            setSelectedDate(date);
                            setShowDateDropdown(false);
                          }}
                        >
                          <Text style={styles.modalOptionText}>
                            {date.toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </Modal>
            </CardContent>
          </Card>
          
          {/* Time Slot Selection */}
          <Card style={styles.card}>
            <CardContent style={styles.cardContent}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="clock.fill" size={20} color="#00FF88" />
                <Text style={styles.sectionTitle}>Time Slot</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setShowTimeDropdown(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  {selectedTime || 'Select time slot'}
                </Text>
                <IconSymbol name="chevron.down" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              
              {/* Time Dropdown Modal */}
              <Modal
                visible={showTimeDropdown}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Select Time Slot</Text>
                      <TouchableOpacity onPress={() => setShowTimeDropdown(false)}>
                        <IconSymbol name="xmark" size={24} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                    
                    <ScrollView>
                      {getTimeSlots().map((time) => (
                        <TouchableOpacity
                          key={time}
                          style={styles.modalOption}
                          onPress={() => {
                            setSelectedTime(time);
                            setShowTimeDropdown(false);
                          }}
                        >
                          <Text style={styles.modalOptionText}>{time}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </Modal>
            </CardContent>
          </Card>
          
          {/* Payment Method */}
          <Card style={styles.card}>
            <CardContent style={styles.cardContent}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="creditcard.fill" size={20} color="#00FF88" />
                <Text style={styles.sectionTitle}>Payment Method</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setShowPaymentDropdown(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  {paymentType === 'full' && 'Full Payment'}
                  {paymentType === 'half' && '50% Deposit'}
                  {paymentType === 'later' && 'Pay After Game'}
                  {!paymentType && 'Select payment method'}
                </Text>
                <IconSymbol name="chevron.down" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              
              {/* Payment Dropdown Modal */}
              <Modal
                visible={showPaymentDropdown}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Select Payment Method</Text>
                      <TouchableOpacity onPress={() => setShowPaymentDropdown(false)}>
                        <IconSymbol name="xmark" size={24} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                    
                    <ScrollView>
                      {[
                        { id: 'later', label: 'Pay After Game', description: 'Customer pays at pitch' },
                        { id: 'half', label: '50% Deposit', description: '50% deposit now' },
                        { id: 'full', label: 'Full Payment', description: 'Complete payment now' }
                      ].map((option) => (
                        <TouchableOpacity
                          key={option.id}
                          style={styles.modalOption}
                          onPress={() => {
                            setPaymentType(option.id as any);
                            setShowPaymentDropdown(false);
                          }}
                        >
                          <Text style={styles.modalOptionText}>{option.label}</Text>
                          <Text style={styles.modalOptionSubtext}>{option.description}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </Modal>
            </CardContent>
          </Card>
        </ScrollView>
      </View>
    );
  };
  
  // Render navigation buttons
  const renderNavigationButtons = () => (
    <View style={styles.buttonContainer}>
      <TouchableOpacity 
        style={[styles.navButton, styles.submitButton]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Creating...' : 'Create Booking'}
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Booking</Text>
        <View style={styles.headerSpacer} />
      </View>
      
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
  headerSpacer: {
    width: 24,
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
    gap: 32,
    padding: 2,
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
  singleFormScrollView: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#0A0A0A',
  },
  dropdownButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalSubheader: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    backgroundColor: '#2A2A2A',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalOptionSubtext: {
    fontSize: 14,
    color: '#888888',
    marginTop: 4,
  },
  emptySummaryText: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    padding: 20,
  },
  pitchesList: {
    gap: 16,
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
    gap: 8,
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
    marginBottom: 24,
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
    gap: 20,
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
    gap: 20,
  },
  durationOptions: {
    flexDirection: 'row',
    gap: 16,
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
    gap: 16,
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
    gap: 20,
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
    gap: 8,
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