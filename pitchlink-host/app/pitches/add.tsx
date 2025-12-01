import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, TouchableOpacity, Switch, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { usePitchStore } from '@/store/usePitchStore';
import { Pitch } from '@/store/usePitchStore';

// Define facility types
type Facility = 'lights' | 'parking' | 'seating' | 'dressingRoom' | 'water' | 'turfType';

export default function AddPitchScreen() {
  const router = useRouter();
  const addPitch = usePitchStore((state) => state.addPitch);
  
  // Single step form state
  const [showDaysDropdown, setShowDaysDropdown] = useState(false);
  const [showFacilitiesDropdown, setShowFacilitiesDropdown] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [nightPricing, setNightPricing] = useState('');
  
  // Availability
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Facilities
  const [selectedFacilities, setSelectedFacilities] = useState<Facility[]>([]);
  const facilityOptions: Facility[] = ['lights', 'parking', 'seating', 'dressingRoom', 'water', 'turfType'];
  
  // Turf type
  const [turfType, setTurfType] = useState<'grass' | 'artificial' | 'concrete' | 'other'>('grass');
  
  // Images
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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
    
    if (images.length < 3) {
      Alert.alert('Error', 'Please upload at least 3 photos of your pitch');
      return;
    }
    
    setLoading(true);
    
    try {
      // Convert facilities to amenities array
      const amenities: string[] = selectedFacilities.map(facility => 
        facility.charAt(0).toUpperCase() + facility.slice(1).replace(/([A-Z])/g, ' $1')
      );
      
      if (turfType !== 'grass') {
        amenities.push(`Turf: ${turfType}`);
      }
      
      addPitch({
        name,
        description,
        pricePerHour: price,
        size: 'Standard', // Default size
        surfaceType: turfType,
        location,
        amenities,
        status: 'available', // Set default status to available instead of booked
      });
      
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add pitch');
    } finally {
      setLoading(false);
    }
  };

  // Function to pick image from camera or gallery
  const pickImage = async (fromCamera: boolean) => {
    try {
      if (fromCamera) {
        // Request camera permission
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Camera permission is required to take photos');
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
      } else {
        // Request gallery permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Gallery permission is required to select photos');
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
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Function to remove an image
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Toggle day selection
  const toggleDaySelection = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };

  // Toggle facility selection
  const toggleFacilitySelection = (facility: Facility) => {
    setSelectedFacilities(prev => 
      prev.includes(facility) 
        ? prev.filter(f => f !== facility) 
        : [...prev, facility]
    );
  };

  // Render dropdown for days selection
  const renderDaysDropdown = () => (
    <Modal
      visible={showDaysDropdown}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Available Days</Text>
          <ScrollView>
            {daysOfWeek.map(day => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dropdownOption,
                  selectedDays.includes(day) && styles.selectedDropdownOption
                ]}
                onPress={() => toggleDaySelection(day)}
              >
                <Text style={[
                  styles.dropdownOptionText,
                  selectedDays.includes(day) && styles.selectedDropdownOptionText
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowDaysDropdown(false)}
          >
            <Text style={styles.modalCloseButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Render dropdown for facilities selection
  const renderFacilitiesDropdown = () => (
    <Modal
      visible={showFacilitiesDropdown}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Facilities</Text>
          <ScrollView>
            {facilityOptions.map(facility => (
              <TouchableOpacity
                key={facility}
                style={[
                  styles.dropdownOption,
                  selectedFacilities.includes(facility) && styles.selectedDropdownOption
                ]}
                onPress={() => toggleFacilitySelection(facility)}
              >
                <Text style={[
                  styles.dropdownOptionText,
                  selectedFacilities.includes(facility) && styles.selectedDropdownOptionText
                ]}>
                  {facility.charAt(0).toUpperCase() + facility.slice(1).replace(/([A-Z])/g, ' $1')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowFacilitiesDropdown(false)}
          >
            <Text style={styles.modalCloseButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Render image source selection modal
  const renderImageSourceModal = () => (
    <Modal
      visible={showImageSourceModal}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Image Source</Text>
          
          <TouchableOpacity
            style={styles.imageSourceButton}
            onPress={() => {
              setShowImageSourceModal(false);
              pickImage(true); // from camera
            }}
          >
            <Text style={styles.imageSourceButtonText}>Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.imageSourceButton}
            onPress={() => {
              setShowImageSourceModal(false);
              pickImage(false); // from gallery
            }}
          >
            <Text style={styles.imageSourceButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowImageSourceModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // State for image source modal
  const [showImageSourceModal, setShowImageSourceModal] = useState(false);

  // Render step content as single form
  const renderStepContent = () => {
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>Add New Pitch</Text>
        
        {/* Pitch Name */}
        <Text style={styles.label}>Pitch Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter pitch name"
          placeholderTextColor="#888888"
          value={name}
          onChangeText={setName}
        />
        
        {/* Description */}
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
        
        {/* Location */}
        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter location"
          placeholderTextColor="#888888"
          value={location}
          onChangeText={setLocation}
        />
        
        {/* Price per Hour */}
        <Text style={styles.label}>Price per Hour (₦) *</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor="#888888"
          value={pricePerHour}
          onChangeText={setPricePerHour}
          keyboardType="decimal-pad"
        />
        
        {/* Night Pricing */}
        <Text style={styles.label}>Night Pricing (After 6 PM) (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor="#888888"
          value={nightPricing}
          onChangeText={setNightPricing}
          keyboardType="decimal-pad"
        />
        
        {/* Days Available */}
        <Text style={styles.label}>Days Available</Text>
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => setShowDaysDropdown(true)}
        >
          <Text style={styles.dropdownButtonText}>
            {selectedDays.length > 0 
              ? `${selectedDays.length} day(s) selected` 
              : 'Select Available Days'}
          </Text>
          <Text style={styles.dropdownChevron}>▼</Text>
        </TouchableOpacity>
        
        {/* Facilities */}
        <Text style={styles.label}>Facilities</Text>
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => setShowFacilitiesDropdown(true)}
        >
          <Text style={styles.dropdownButtonText}>
            {selectedFacilities.length > 0 
              ? `${selectedFacilities.length} facility(s) selected` 
              : 'Select Facilities'}
          </Text>
          <Text style={styles.dropdownChevron}>▼</Text>
        </TouchableOpacity>
        
        {/* Turf Type */}
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
        
        {/* Image Upload */}
        <Text style={styles.label}>Photos</Text>
        <Text style={styles.imageInstruction}>
          Upload 3-6 pictures of your pitch (minimum 3 required)
        </Text>
        
        <View style={styles.imageUploadContainer}>
          {images.length < 6 ? (
            <TouchableOpacity 
              style={styles.imageUploadButton}
              onPress={() => setShowImageSourceModal(true)}
            >
              <Text style={styles.imageUploadText}>+</Text>
              <Text style={styles.imageUploadSubtext}>Add Photo</Text>
            </TouchableOpacity>
          ) : null}
          
          {images.map((image, index) => (
            <View key={index} style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => removeImage(index)}
              >
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
  };

  // Render navigation buttons
  const renderNavigationButtons = () => (
    <View style={styles.buttonContainer}>
      <TouchableOpacity 
        style={[styles.navButton, styles.submitButton]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Submitting...' : 'Submit for Verification'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Add New Pitch</Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {renderStepContent()}
      </ScrollView>
      
      {renderNavigationButtons()}
      
      {renderDaysDropdown()}
      {renderFacilitiesDropdown()}
      {renderImageSourceModal()}
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
  dropdownButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1E1E1E',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  dropdownChevron: {
    color: '#888888',
    fontSize: 16,
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
  submitButton: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  submitButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  dropdownOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  selectedDropdownOption: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  selectedDropdownOptionText: {
    color: '#00FF88',
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#00FF88',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
  },
  imageSourceButton: {
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  imageSourceButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});