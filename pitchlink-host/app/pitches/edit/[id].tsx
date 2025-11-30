import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, TouchableOpacity, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePitchStore } from '@/store/usePitchStore';
import { Pitch } from '@/store/usePitchStore';

// Define facility types
type Facility = 'lights' | 'parking' | 'seating' | 'dressingRoom' | 'water' | 'turfType';

export default function EditPitchScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const pitches = usePitchStore((state) => state.pitches);
  const updatePitch = usePitchStore((state) => state.updatePitch);
  
  const pitch = pitches.find((p) => p.id === id);
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  
  // Step 1: Basic Details
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  
  // Step 2: Pricing
  const [pricePerHour, setPricePerHour] = useState('');
  const [nightPricing, setNightPricing] = useState('');
  const [discounts, setDiscounts] = useState(false);
  
  // Step 3: Availability
  const [availability, setAvailability] = useState({
    monday: { available: true, startTime: '08:00', endTime: '22:00' },
    tuesday: { available: true, startTime: '08:00', endTime: '22:00' },
    wednesday: { available: true, startTime: '08:00', endTime: '22:00' },
    thursday: { available: true, startTime: '08:00', endTime: '22:00' },
    friday: { available: true, startTime: '08:00', endTime: '22:00' },
    saturday: { available: true, startTime: '08:00', endTime: '22:00' },
    sunday: { available: true, startTime: '08:00', endTime: '22:00' },
  });
  const [fullyBookedDays, setFullyBookedDays] = useState<string[]>([]);
  
  // Step 4: Facilities
  const [facilities, setFacilities] = useState<Record<Facility, boolean>>({
    lights: false,
    parking: false,
    seating: false,
    dressingRoom: false,
    water: false,
    turfType: false,
  });
  const [turfType, setTurfType] = useState<'natural' | 'artificial' | 'hybrid'>('natural');
  
  // Step 5: Images
  const [images, setImages] = useState<string[]>([]);
  
  // Step 6: Preview
  const [loading, setLoading] = useState(false);

  // Initialize form with existing pitch data
  useEffect(() => {
    if (pitch) {
      setName(pitch.name);
      setDescription(pitch.description);
      setLocation(pitch.location);
      setPricePerHour(pitch.pricePerHour.toString());
      
      // Parse amenities to facilities
      const initialFacilities: Record<Facility, boolean> = {
        lights: false,
        parking: false,
        seating: false,
        dressingRoom: false,
        water: false,
        turfType: false,
      };
      
      pitch.amenities.forEach(amenity => {
        const lowerAmenity = amenity.toLowerCase();
        if (lowerAmenity.includes('lights')) initialFacilities.lights = true;
        if (lowerAmenity.includes('parking')) initialFacilities.parking = true;
        if (lowerAmenity.includes('seating')) initialFacilities.seating = true;
        if (lowerAmenity.includes('dressing')) initialFacilities.dressingRoom = true;
        if (lowerAmenity.includes('water')) initialFacilities.water = true;
        
        if (lowerAmenity.includes('turf')) {
          if (lowerAmenity.includes('artificial')) setTurfType('artificial');
          else if (lowerAmenity.includes('hybrid')) setTurfType('hybrid');
          else setTurfType('natural');
        }
      });
      
      setFacilities(initialFacilities);
    }
  }, [pitch]);

  // Navigation functions
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!name || !description || !location || !pricePerHour) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    const price = parseFloat(pricePerHour);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    
    setLoading(true);
    
    try {
      // Convert facilities to amenities array
      const amenities: string[] = [];
      Object.entries(facilities).forEach(([facility, enabled]) => {
        if (enabled) {
          amenities.push(facility.charAt(0).toUpperCase() + facility.slice(1).replace(/([A-Z])/g, ' $1'));
        }
      });
      
      if (turfType !== 'natural') {
        amenities.push(`Turf: ${turfType}`);
      }
      
      updatePitch(pitch!.id, {
        name,
        description,
        pricePerHour: price,
        location,
        amenities,
        surfaceType: turfType,
        size: pitch?.size || 'Standard',
        status: pitch?.status || 'available',
      });
      
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update pitch');
    } finally {
      setLoading(false);
    }
  };

  // Toggle day availability
  const toggleDayAvailability = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        available: !prev[day].available
      }
    }));
  };

  // Toggle fully booked day
  const toggleFullyBookedDay = (day: string) => {
    setFullyBookedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };

  // Toggle facility
  const toggleFacility = (facility: Facility) => {
    setFacilities(prev => ({
      ...prev,
      [facility]: !prev[facility]
    }));
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
            <Text style={styles.stepTitle}>Basic Details</Text>
            
            <Text style={styles.label}>Pitch Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter pitch name"
              placeholderTextColor="#888888"
              value={name}
              onChangeText={setName}
            />
            
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the pitch"
              placeholderTextColor="#888888"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
            
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter location"
              placeholderTextColor="#888888"
              value={location}
              onChangeText={setLocation}
            />
            
            <TouchableOpacity style={styles.mapPickerButton}>
              <Text style={styles.mapPickerText}>Select on Map</Text>
            </TouchableOpacity>
          </View>
        );
      
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Pricing</Text>
            
            <Text style={styles.label}>Price per Hour (₦) *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#888888"
              value={pricePerHour}
              onChangeText={setPricePerHour}
              keyboardType="decimal-pad"
            />
            
            <Text style={styles.label}>Night Pricing (After 6 PM)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#888888"
              value={nightPricing}
              onChangeText={setNightPricing}
              keyboardType="decimal-pad"
            />
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Offer Discounts</Text>
              <Switch
                value={discounts}
                onValueChange={setDiscounts}
                trackColor={{ false: '#333333', true: '#00FF88' }}
                thumbColor={discounts ? '#FFFFFF' : '#888888'}
              />
            </View>
          </View>
        );
      
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Availability</Text>
            
            <ScrollView style={styles.availabilityScroll}>
              {Object.entries(availability).map(([day, schedule]) => (
                <View key={day} style={styles.dayContainer}>
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayName}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                    <Switch
                      value={schedule.available}
                      onValueChange={() => toggleDayAvailability(day)}
                      trackColor={{ false: '#333333', true: '#00FF88' }}
                      thumbColor={schedule.available ? '#FFFFFF' : '#888888'}
                    />
                  </View>
                  
                  {schedule.available && (
                    <View style={styles.timeContainer}>
                      <View style={styles.timeInputContainer}>
                        <Text style={styles.timeLabel}>Start</Text>
                        <TextInput
                          style={styles.timeInput}
                          value={schedule.startTime}
                          placeholder="08:00"
                          placeholderTextColor="#888888"
                        />
                      </View>
                      
                      <View style={styles.timeInputContainer}>
                        <Text style={styles.timeLabel}>End</Text>
                        <TextInput
                          style={styles.timeInput}
                          value={schedule.endTime}
                          placeholder="22:00"
                          placeholderTextColor="#888888"
                        />
                      </View>
                    </View>
                  )}
                  
                  <TouchableOpacity 
                    style={[
                      styles.fullyBookedButton,
                      fullyBookedDays.includes(day) && styles.fullyBookedButtonActive
                    ]}
                    onPress={() => toggleFullyBookedDay(day)}
                  >
                    <Text style={[
                      styles.fullyBookedText,
                      fullyBookedDays.includes(day) && styles.fullyBookedTextActive
                    ]}>
                      {fullyBookedDays.includes(day) ? 'Marked as Fully Booked' : 'Mark as Fully Booked'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.maintenanceContainer}>
              <Text style={styles.maintenanceLabel}>Maintenance Mode</Text>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Auto close pitch for maintenance</Text>
                <Switch
                  value={pitch?.status === 'maintenance'}
                  onValueChange={(value) => {
                    updatePitch(pitch!.id, {
                      status: value ? 'maintenance' : 'available'
                    });
                  }}
                  trackColor={{ false: '#333333', true: '#00FF88' }}
                  thumbColor={pitch?.status === 'maintenance' ? '#FFFFFF' : '#888888'}
                />
              </View>
            </View>
          </View>
        );
      
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Facilities</Text>
            
            <View style={styles.facilitiesGrid}>
              {Object.entries(facilities).map(([facility, enabled]) => (
                <TouchableOpacity
                  key={facility}
                  style={[
                    styles.facilityButton,
                    enabled && styles.facilityButtonActive
                  ]}
                  onPress={() => toggleFacility(facility as Facility)}
                >
                  <Text style={[
                    styles.facilityText,
                    enabled && styles.facilityTextActive
                  ]}>
                    {facility.charAt(0).toUpperCase() + facility.slice(1).replace(/([A-Z])/g, ' $1')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.label}>Turf Type</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segment,
                  turfType === 'natural' && styles.selectedSegment
                ]}
                onPress={() => setTurfType('natural')}
              >
                <Text style={[
                  styles.segmentText,
                  turfType === 'natural' && styles.selectedSegmentText
                ]}>
                  Natural
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.segment,
                  turfType === 'artificial' && styles.selectedSegment
                ]}
                onPress={() => setTurfType('artificial')}
              >
                <Text style={[
                  styles.segmentText,
                  turfType === 'artificial' && styles.selectedSegmentText
                ]}>
                  Artificial
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.segment,
                  turfType === 'hybrid' && styles.selectedSegment
                ]}
                onPress={() => setTurfType('hybrid')}
              >
                <Text style={[
                  styles.segmentText,
                  turfType === 'hybrid' && styles.selectedSegmentText
                ]}>
                  Hybrid
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      
      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Images</Text>
            
            <Text style={styles.imageInstruction}>
              Upload 3-6 pictures of your pitch (minimum 3 required)
            </Text>
            
            <View style={styles.imageUploadContainer}>
              {images.length < 6 ? (
                <TouchableOpacity style={styles.imageUploadButton}>
                  <Text style={styles.imageUploadText}>+</Text>
                  <Text style={styles.imageUploadSubtext}>Add Photo</Text>
                </TouchableOpacity>
              ) : null}
              
              {images.map((image, index) => (
                <View key={index} style={styles.imagePreviewContainer}>
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeImageButton}>
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            
            <Text style={styles.imageHint}>
              Tap and hold to reorganize photos. First photo will be used as cover.
            </Text>
          </View>
        );
      
      case 6:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Preview</Text>
            
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>{name || 'Pitch Name'}</Text>
              <Text style={styles.previewDescription}>{description || 'Pitch description'}</Text>
              <Text style={styles.previewLocation}>{location || 'Location'}</Text>
              <Text style={styles.previewPrice}>₦{pricePerHour || '0.00'}/hour</Text>
              
              <View style={styles.previewFacilities}>
                {Object.entries(facilities).filter(([_, enabled]) => enabled).map(([facility]) => (
                  <View key={facility} style={styles.previewFacilityTag}>
                    <Text style={styles.previewFacilityText}>
                      {facility.charAt(0).toUpperCase() + facility.slice(1).replace(/([A-Z])/g, ' $1')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Current Status</Text>
              <View style={[
                styles.statusBadge,
                pitch?.status === 'available' && styles.statusAvailable,
                pitch?.status === 'booked' && styles.statusBooked,
                pitch?.status === 'maintenance' && styles.statusMaintenance,
              ]}>
                <Text style={styles.statusText}>{pitch?.status || 'available'}</Text>
              </View>
            </View>
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
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (!pitch) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.title}>Pitch not found</Text>
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Pitch</Text>
        <Text style={styles.stepInfo}>Step {currentStep} of {totalSteps}</Text>
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
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
    backgroundColor: '#1E1E1E',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  mapPickerButton: {
    height: 50,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00FF88',
  },
  mapPickerText: {
    color: '#00FF88',
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  availabilityScroll: {
    maxHeight: 350,
  },
  dayContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  timeInputContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 4,
  },
  timeInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    backgroundColor: '#0A0A0A',
  },
  fullyBookedButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  fullyBookedButtonActive: {
    borderColor: '#FF4444',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  fullyBookedText: {
    color: '#888888',
    fontWeight: '600',
  },
  fullyBookedTextActive: {
    color: '#FF4444',
  },
  maintenanceContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
  },
  maintenanceLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  facilityButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
  },
  facilityButtonActive: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  facilityText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  facilityTextActive: {
    color: '#000000',
  },
  segmentedControl: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectedSegment: {
    backgroundColor: '#00FF88',
  },
  segmentText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectedSegmentText: {
    color: '#000000',
  },
  imageInstruction: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageUploadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageUploadButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#00FF88',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageUploadText: {
    fontSize: 32,
    color: '#00FF88',
    lineHeight: 32,
  },
  imageUploadSubtext: {
    fontSize: 12,
    color: '#00FF88',
    marginTop: 4,
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageHint: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  previewCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    gap: 12,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  previewDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 22,
  },
  previewLocation: {
    fontSize: 14,
    color: '#888888',
  },
  previewPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00FF88',
  },
  previewFacilities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 8,
  },
  previewFacilityTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#333333',
  },
  previewFacilityText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusAvailable: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  statusBooked: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
  },
  statusMaintenance: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
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
});