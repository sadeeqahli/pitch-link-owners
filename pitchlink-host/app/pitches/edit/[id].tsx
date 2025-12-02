import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, TouchableOpacity, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePitchStore } from '@/store/usePitchStore';
import { Pitch } from '@/store/usePitchStore';
import * as ImagePicker from 'expo-image-picker';

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
  const totalSteps = 3;
  
  // Step 1 form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [nightPricing, setNightPricing] = useState('');
  const [pitchSize, setPitchSize] = useState<'5-a-side' | '7-a-side' | '9-a-side'>('5-a-side');
  
  // Step 2 form state
  // Availability
  const [isAvailabilityExpanded, setIsAvailabilityExpanded] = useState(false);
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
  
  // Facilities
  const [facilities, setFacilities] = useState<Record<Facility, boolean>>({
    lights: false,
    parking: false,
    seating: false,
    dressingRoom: false,
    water: false,
    turfType: false,
  });
  
  // Step 3 form state
  const [turfType, setTurfType] = useState<'grass' | 'artificial' | 'concrete' | 'other'>('grass');
  
  // Images
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Drag and drop state
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  
  // Function to pick image from camera or gallery
  const pickImage = async () => {
    try {
      // Show options to user
      Alert.alert(
        'Select Image Source',
        'Choose an option',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
              // Request camera permission
              const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
              if (cameraPermission.status !== 'granted') {
                Alert.alert('Permission denied', 'Camera permission is required to take photos.');
                return;
              }
              
              // Launch camera
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });
              
              if (!result.canceled && result.assets && result.assets.length > 0) {
                setImages(prev => [...prev, result.assets[0].uri]);
              }
            },
          },
          {
            text: 'Choose from Gallery',
            onPress: async () => {
              // Request gallery permission
              const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (galleryPermission.status !== 'granted') {
                Alert.alert('Permission denied', 'Gallery permission is required to select photos.');
                return;
              }
              
              // Launch image library
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });
              
              if (!result.canceled && result.assets && result.assets.length > 0) {
                setImages(prev => [...prev, result.assets[0].uri]);
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };
  useEffect(() => {
    if (pitch) {
      setName(pitch.name);
      setDescription(pitch.description);
      setLocation(pitch.location);
      setPricePerHour(pitch.pricePerHour.toString());
      setPitchSize(pitch.size || '5-a-side');
      
      // Initialize images - load all images from the pitch
      if (pitch.images && pitch.images.length > 0) {
        setImages(pitch.images);
      } else if (pitch.imageUrl) {
        // Fallback to imageUrl if images array is not available
        setImages([pitch.imageUrl]);
      } else {
        // Initialize with empty array if no images
        setImages([]);
      }
      
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
          else if (lowerAmenity.includes('concrete')) setTurfType('concrete');
          else if (lowerAmenity.includes('other')) setTurfType('other');
          else setTurfType('grass');
        }
      });
      
      setFacilities(initialFacilities);
    }
  }, [pitch]);

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
      
      if (turfType !== 'grass') {
        amenities.push(`Turf: ${turfType}`);
      }
      
      updatePitch(pitch!.id, {
        name,
        description,
        pricePerHour: price,
        location,
        amenities,
        surfaceType: turfType as 'grass' | 'artificial' | 'concrete' | 'other',
        size: pitchSize,
        status: pitch?.status || 'available',
        imageUrl: images.length > 0 ? images[0] : pitch?.imageUrl,
        images, // Add all images to the pitch
      });
      
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update pitch');
    } finally {
      setLoading(false);
    }
  };

  // Toggle day availability
  const toggleDayAvailability = (day: keyof typeof availability) => {
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
    
  // Reorder images
  const reorderImages = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
      
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setImages(newImages);
  };
  
  // Move image to a specific position
  const moveImageToPosition = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setImages(newImages);
    setSelectedImageIndex(null);
  };
  const renderStepContent = () => {
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>Edit Pitch - Step {currentStep} of {totalSteps}</Text>
        
        {currentStep === 1 && (
          <>
            {/* Basic Details */}
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
            
            {/* Pricing */}
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
            
            {/* Pitch Size */}
            <Text style={styles.label}>Pitch Size</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segment,
                  pitchSize === '5-a-side' && styles.selectedSegment
                ]}
                onPress={() => setPitchSize('5-a-side')}
              >
                <Text style={[
                  styles.segmentText,
                  pitchSize === '5-a-side' && styles.selectedSegmentText
                ]}>
                  5-a-side
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.segment,
                  pitchSize === '7-a-side' && styles.selectedSegment
                ]}
                onPress={() => setPitchSize('7-a-side')}
              >
                <Text style={[
                  styles.segmentText,
                  pitchSize === '7-a-side' && styles.selectedSegmentText
                ]}>
                  7-a-side
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.segment,
                  pitchSize === '9-a-side' && styles.selectedSegment
                ]}
                onPress={() => setPitchSize('9-a-side')}
              >
                <Text style={[
                  styles.segmentText,
                  pitchSize === '9-a-side' && styles.selectedSegmentText
                ]}>
                  9-a-side
                </Text>
              </TouchableOpacity>
            </View>

          </>
        )}
        
        {currentStep === 2 && (
          <>
            {/* Availability Section - Expandable */}
            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.sectionHeader}
                onPress={() => setIsAvailabilityExpanded(!isAvailabilityExpanded)}
              >
                <Text style={styles.sectionTitle}>Availability</Text>
                <Text style={styles.tapToExpand}>
                  {isAvailabilityExpanded ? 'Tap to collapse' : 'Tap to expand'}
                </Text>
              </TouchableOpacity>
              
              {isAvailabilityExpanded && (
                <View style={styles.scrollContainer}>
                  <ScrollView 
                    style={styles.availabilityScroll}
                    showsVerticalScrollIndicator={true}
                    persistentScrollbar={true}
                    indicatorStyle="white"
                  >
                  {Object.entries(availability).map(([day, schedule]) => (
                    <View key={day} style={styles.dayContainer}>
                      <View style={styles.dayHeader}>
                        <Text style={styles.dayName}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                        <Switch
                          value={schedule.available}
                          onValueChange={() => toggleDayAvailability(day as keyof typeof availability)}
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
                {/* Custom scrollbar track for visual enhancement */}
                <View style={styles.customScrollbarTrack}>
                  <View style={styles.customScrollbarThumb} />
                </View>
              </View>
            )}
            </View>
            
            {/* Facilities */}
            <Text style={styles.label}>Facilities</Text>
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
          </>
        )}
        
        {currentStep === 3 && (
          <>
            <Text style={styles.label}>Turf Type</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segment,
                  turfType === 'grass' && styles.selectedSegment
                ]}
                onPress={() => setTurfType('grass')}
              >
                <Text style={[
                  styles.segmentText,
                  turfType === 'grass' && styles.selectedSegmentText
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
                  turfType === 'concrete' && styles.selectedSegment
                ]}
                onPress={() => setTurfType('concrete')}
              >
                <Text style={[
                  styles.segmentText,
                  turfType === 'concrete' && styles.selectedSegmentText
                ]}>
                  Concrete
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.segment,
                  turfType === 'other' && styles.selectedSegment
                ]}
                onPress={() => setTurfType('other')}
              >
                <Text style={[
                  styles.segmentText,
                  turfType === 'other' && styles.selectedSegmentText
                ]}>
                  Other
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Images */}
            <Text style={styles.label}>Images</Text>
            <Text style={styles.imageInstruction}>
              Upload 3-6 pictures of your pitch (minimum 3 required)
            </Text>
            
            <View style={styles.imageUploadContainer}>
              {images.length < 6 ? (
                <TouchableOpacity style={styles.imageUploadButton} onPress={pickImage}>
                  <Text style={styles.imageUploadText}>+</Text>
                  <Text style={styles.imageUploadSubtext}>Add Photo</Text>
                </TouchableOpacity>
              ) : null}
              
              {images.map((image, index) => (
                <View key={index} style={styles.imagePreviewContainer}>
                  <TouchableOpacity 
                    onPress={() => {
                      if (selectedImageIndex === null) {
                        // First selection - mark this image as selected
                        setSelectedImageIndex(index);
                      } else if (selectedImageIndex === index) {
                        // Clicking the same image again - deselect
                        setSelectedImageIndex(null);
                      } else {
                        // Moving selected image to this position
                        moveImageToPosition(selectedImageIndex, index);
                      }
                    }}
                  >
                    <Image source={{ uri: image }} style={styles.imagePreview} />
                    {selectedImageIndex === index && (
                      <View style={styles.selectedImageOverlay} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => {
                      setImages(prev => prev.filter((_, i) => i !== index));
                      if (selectedImageIndex === index) {
                        setSelectedImageIndex(null);
                      } else if (selectedImageIndex !== null && selectedImageIndex > index) {
                        setSelectedImageIndex(selectedImageIndex - 1);
                      }
                    }}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                  {/* Drag handle for reordering */}
                  <TouchableOpacity 
                    style={styles.dragHandle}
                    onLongPress={() => {
                      // In a real implementation, this would start the drag operation
                      console.log('Drag started for image at index:', index);
                    }}
                  >
                    <Text style={styles.dragHandleText}>⋮⋮</Text>
                  </TouchableOpacity>
                </View>
              ))}
              
              {selectedImageIndex !== null && (
                <View style={styles.moveInstructions}>
                  <Text style={styles.moveInstructionsText}>
                    Tap another position to move the selected image there
                  </Text>
                  <TouchableOpacity 
                    style={styles.cancelMoveButton}
                    onPress={() => setSelectedImageIndex(null)}
                  >
                    <Text style={styles.cancelMoveText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            
            <Text style={styles.imageHint}>
              Tap and hold to reorganize photos. First photo will be used as cover.
            </Text>
          </>
        )}
      </View>
    );
  };

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
      </View>
      
      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        {[1, 2, 3].map((step) => (
          <View key={step} style={styles.stepIndicatorItem}>
            <View style={[
              styles.stepIndicatorCircle,
              step <= currentStep && styles.stepIndicatorCircleActive
            ]}>
              <Text style={[
                styles.stepIndicatorText,
                step <= currentStep && styles.stepIndicatorTextActive
              ]}>
                {step}
              </Text>
            </View>
            {step < 3 && (
              <View style={[
                styles.stepIndicatorLine,
                step < currentStep && styles.stepIndicatorLineActive
              ]} />
            )}
          </View>
        ))}
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {renderStepContent()}
      </ScrollView>
      
      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {currentStep > 1 && (
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        {currentStep < totalSteps ? (
          <TouchableOpacity 
            style={[styles.navButton, styles.nextButton]}
            onPress={() => setCurrentStep(currentStep + 1)}
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
  // Step Indicator Styles
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  stepIndicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIndicatorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicatorCircleActive: {
    backgroundColor: '#00FF88',
  },
  stepIndicatorText: {
    color: '#888888',
    fontWeight: 'bold',
  },
  stepIndicatorTextActive: {
    color: '#000000',
  },
  stepIndicatorLine: {
    width: 30,
    height: 2,
    backgroundColor: '#333333',
  },
  stepIndicatorLineActive: {
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
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    backgroundColor: '#1E1E1E',
    marginBottom: 16,
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
    marginBottom: 16,
  },
  mapPickerText: {
    color: '#00FF88',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tapToExpand: {
    fontSize: 14,
    color: '#00FF88',
    fontWeight: '600',
  },
  availabilityScroll: {
    maxHeight: 300,
    marginBottom: 20,
  },
  scrollContainer: {
    position: 'relative',
  },
  customScrollbarTrack: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 16,
    height: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
  },
  customScrollbarThumb: {
    width: 16,
    height: 80,
    backgroundColor: '#00FF88',
    borderRadius: 8,
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
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
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
    marginBottom: 20,
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
  // Drag Handle Styles
  dragHandle: {
    position: 'absolute',
    top: -8,
    left: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00FF88',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragHandleText: {
    color: '#000000',
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
  // Selected Image Overlay
  selectedImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 3,
    borderColor: '#00FF88',
    borderRadius: 8,
  },
  // Move Instructions
  moveInstructions: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    alignItems: 'center',
  },
  moveInstructionsText: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  cancelMoveButton: {
    padding: 8,
    backgroundColor: '#FF4444',
    borderRadius: 4,
  },
  cancelMoveText: {
    color: '#FFFFFF',
    fontWeight: '600',
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