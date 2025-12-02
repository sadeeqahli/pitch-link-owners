import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, TextInput, Modal, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Calendar, Users, Clock, Smartphone, FileText, Shield, UserPlus, UserMinus, CheckCircle, XCircle, AlertCircle, MapPin, Building, Phone, Mail, Globe, Upload, Banknote, Home, Camera, Image as ImageIcon } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

// Define business categories
const BUSINESS_CATEGORIES = [
  'Football Center',
  'School Pitch',
  'Private Turf',
  'Community Ground',
  'Sports Club',
  'Other'
];

// Define pitch sizes
const PITCH_SIZES = [
  '5-a-side',
  '7-a-side',
  '9-a-side'
];

// Define Nigerian banks
const NIGERIAN_BANKS = [
  'Access Bank',
  'Citibank Nigeria',
  'Ecobank Nigeria',
  'Fidelity Bank',
  'First Bank of Nigeria',
  'First City Monument Bank',
  'Guaranty Trust Bank',
  'Heritage Bank',
  'Keystone Bank',
  'Polaris Bank',
  'Providus Bank',
  'Stanbic IBTC Bank',
  'Standard Chartered Bank',
  'Sterling Bank',
  'SunTrust Bank',
  'Union Bank of Nigeria',
  'United Bank for Africa',
  'Wema Bank',
  'Zenith Bank'
];

// Required documents for verification
const REQUIRED_DOCUMENTS = [
  { id: 'business_license', name: 'Business License', description: 'Valid business registration certificate' },
  { id: 'id_card', name: 'Owner ID Card', description: 'Government issued identification' },
];

// Define alert button type
type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

export default function BusinessSettingsScreen() {
  const router = useRouter();
  
  // Business verification state
  const [businessStatus, setBusinessStatus] = useState<'not_started' | 'incomplete' | 'under_review' | 'approved' | 'rejected'>('not_started');
  const [documentsUploaded, setDocumentsUploaded] = useState(false);
  
  // Business profile state
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  
  // Bank account state
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  
  // Address confirmation state
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [coordinates, setCoordinates] = useState<{latitude: number, longitude: number} | null>(null);
  
  // Document upload state
  const [uploadedDocuments, setUploadedDocuments] = useState<{[key: string]: string}>({});
  
  // Business settings state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [defaultPitchSize, setDefaultPitchSize] = useState<'5-a-side' | '7-a-side' | '9-a-side'>('5-a-side');
  const [maxManualBookings, setMaxManualBookings] = useState('10');

  // Load saved business settings
  useEffect(() => {
    loadBusinessSettings();
  }, []);

  const loadBusinessSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('businessSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setBusinessStatus(settings.businessStatus || 'not_started');
        setDocumentsUploaded(settings.documentsUploaded || false);
        setBusinessName(settings.businessName || '');
        setBusinessCategory(settings.businessCategory || '');
        setBusinessAddress(settings.businessAddress || '');
        setState(settings.state || '');
        setCity(settings.city || '');
        setPhoneNumber(settings.phoneNumber || '');
        setEmail(settings.email || '');
        setWebsite(settings.website || '');
        setLogo(settings.logo || null);
        setAccountName(settings.accountName || '');
        setAccountNumber(settings.accountNumber || '');
        setBankName(settings.bankName || '');
        setAddressConfirmed(settings.addressConfirmed || false);
        setCoordinates(settings.coordinates || null);
        setUploadedDocuments(settings.uploadedDocuments || {});
        setMaintenanceMode(settings.maintenanceMode || false);
        setDefaultPitchSize(settings.defaultPitchSize || '5-a-side');
        setMaxManualBookings(settings.maxManualBookings || '10');
      }
    } catch (error) {
      console.log('Error loading business settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const settings = {
        businessStatus,
        documentsUploaded,
        businessName,
        businessCategory,
        businessAddress,
        state,
        city,
        phoneNumber,
        email,
        website,
        logo,
        accountName,
        accountNumber,
        bankName,
        addressConfirmed,
        coordinates,
        uploadedDocuments,
        maintenanceMode,
        defaultPitchSize,
        maxManualBookings,
      };
      await AsyncStorage.setItem('businessSettings', JSON.stringify(settings));
      Alert.alert('Success', 'Business settings saved successfully');
    } catch (error) {
      console.log('Error saving business settings:', error);
      Alert.alert('Error', 'Failed to save business settings');
    }
  };

  const pickDocumentImage = async (documentId: string) => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Launch image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setUploadedDocuments(prev => ({
        ...prev,
        [documentId]: result.assets[0].uri
      }));
    }
  };

  const takeDocumentPhoto = async (documentId: string) => {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera permissions to make this work!');
      return;
    }

    // Launch camera
    let result = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.back,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setUploadedDocuments(prev => ({
        ...prev,
        [documentId]: result.assets[0].uri
      }));
    }
  };

  const handleUploadDocuments = () => {
    // In a real app, this would open a file picker
    const buttons: AlertButton[] = [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Simulate Upload',
        onPress: () => {
          setDocumentsUploaded(true);
          Alert.alert('Success', 'Documents uploaded successfully. Your business is now pending approval.');
        },
      },
    ];
    
    Alert.alert(
      'Upload Documents',
      'In a real implementation, this would allow you to upload required business documents for verification.',
      buttons
    );
  };

  const handleSubmitForReview = () => {
    // Validate required fields
    if (!businessName || !businessCategory || !businessAddress || !state || !city || 
        !phoneNumber || !accountName || !accountNumber || !bankName) {
      Alert.alert('Error', 'Please fill in all required fields in Business Profile and Bank Account sections');
      return;
    }
    
    // Check if address is confirmed
    if (!addressConfirmed) {
      Alert.alert('Error', 'Please confirm your business address on the map');
      return;
    }
    
    // Check if all required documents are uploaded
    const allDocumentsUploaded = REQUIRED_DOCUMENTS.every(doc => uploadedDocuments[doc.id]);
    if (!allDocumentsUploaded) {
      Alert.alert('Error', 'Please upload all required documents');
      return;
    }
    
    // Update status to under review
    setBusinessStatus('under_review');
    setDocumentsUploaded(true);
    handleSaveSettings();
    
    // Navigate to verification loading screen
    router.push('/profile/verification-loading');
  };

  const getStatusColor = () => {
    switch (businessStatus) {
      case 'approved': return '#00FF88';
      case 'rejected': return '#FF4444';
      default: return '#FFA500';
    }
  };

  const getStatusText = () => {
    switch (businessStatus) {
      case 'not_started': return 'Not Started';
      case 'incomplete': return 'Incomplete';
      case 'under_review': return 'Under Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Not Started';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Business Settings</Text>
        <TouchableOpacity onPress={handleSaveSettings}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Business Verification Status */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Business Verification</Text>
            
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { borderColor: getStatusColor() }]}>
                {businessStatus === 'approved' ? (
                  <CheckCircle color={getStatusColor()} size={20} />
                ) : businessStatus === 'rejected' ? (
                  <XCircle color={getStatusColor()} size={20} />
                ) : (
                  <AlertCircle color={getStatusColor()} size={20} />
                )}
                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                  {getStatusText()}
                </Text>
              </View>
              
              <Text style={styles.statusDescription}>
                {businessStatus === 'not_started' 
                  ? 'Your business verification has not been started. Complete your Business Profile and upload documents to begin.'
                  : businessStatus === 'incomplete'
                  ? 'Your business profile is incomplete. Please complete all required fields and upload documents.'
                  : businessStatus === 'under_review'
                  ? 'Your business is under review. This usually takes 24-48 hours.'
                  : businessStatus === 'approved'
                  ? 'Your business has been approved and is active.'
                  : 'Your business verification was rejected. Please contact support for more information.'}
              </Text>
              
              {(businessStatus === 'not_started' || businessStatus === 'incomplete') && (
                <TouchableOpacity 
                  style={styles.submitButton} 
                  onPress={handleSubmitForReview}
                >
                  <Text style={styles.submitButtonText}>Submit for Review</Text>
                </TouchableOpacity>
              )}
            </View>
          </CardContent>
        </Card>

        {/* Business Profile */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Business Profile</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business / Pitch Name *</Text>
              <View style={styles.inputContainer}>
                <Building color="#888888" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter business name"
                  placeholderTextColor="#888888"
                  value={businessName}
                  onChangeText={setBusinessName}
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Category *</Text>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => {
                    const buttons: AlertButton[] = [
                      ...BUSINESS_CATEGORIES.map(category => ({
                        text: category,
                        onPress: () => setBusinessCategory(category)
                      })),
                      { text: 'Cancel', style: 'cancel' }
                    ];
                    
                    Alert.alert(
                      'Select Business Category',
                      'Choose a business category',
                      buttons
                    );
                  }}
                >
                  <Text style={[styles.dropdownText, !businessCategory && styles.inputPlaceholder]}>
                    {businessCategory || 'Select category'}
                  </Text>
                  <Text style={styles.dropdownChevron}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Address *</Text>
              <View style={styles.inputContainer}>
                <MapPin color="#888888" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter full address"
                  placeholderTextColor="#888888"
                  value={businessAddress}
                  onChangeText={setBusinessAddress}
                />
              </View>
            </View>
            
            <View style={styles.doubleInputRow}>
              <View style={styles.halfInputGroup}>
                <Text style={styles.label}>State *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter state"
                  placeholderTextColor="#888888"
                  value={state}
                  onChangeText={setState}
                />
              </View>
              
              <View style={styles.halfInputGroup}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter city"
                  placeholderTextColor="#888888"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <View style={styles.inputContainer}>
                <Phone color="#888888" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter phone number"
                  placeholderTextColor="#888888"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email (Optional)</Text>
              <View style={styles.inputContainer}>
                <Mail color="#888888" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter email address"
                  placeholderTextColor="#888888"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Website / Social Media (Optional)</Text>
              <View style={styles.inputContainer}>
                <Globe color="#888888" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter website or social media link"
                  placeholderTextColor="#888888"
                  value={website}
                  onChangeText={setWebsite}
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Logo (Optional)</Text>
              <TouchableOpacity style={styles.uploadLogoButton}>
                <Upload color="#00FF88" size={20} />
                <Text style={styles.uploadLogoText}>Upload Logo</Text>
              </TouchableOpacity>
            </View>

          </CardContent>
        </Card>

        {/* Ownership Documents */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Ownership Documents</Text>
            <Text style={styles.sectionSubtitle}>Please upload clear images of the following documents</Text>
            
            {REQUIRED_DOCUMENTS.map((document) => (
              <View key={document.id} style={styles.documentRow}>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName}>{document.name} *</Text>
                  <Text style={styles.documentDescription}>{document.description}</Text>
                </View>
                
                <View style={styles.documentActions}>
                  {uploadedDocuments[document.id] ? (
                    <View style={styles.documentPreview}>
                      <Image 
                        source={{ uri: uploadedDocuments[document.id] }} 
                        style={styles.documentThumbnail} 
                      />
                      <Text style={styles.documentUploadedText}>Uploaded</Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.uploadDocumentButton}
                      onPress={() => {
                        const buttons: AlertButton[] = [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Take Photo', onPress: () => takeDocumentPhoto(document.id) },
                          { text: 'Choose from Library', onPress: () => pickDocumentImage(document.id) }
                        ];
                        
                        Alert.alert(
                          'Upload Document',
                          `Upload ${document.name}`,
                          buttons
                        );
                      }}
                    >
                      <Upload color="#00FF88" size={20} />
                      <Text style={styles.uploadDocumentText}>Upload</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </CardContent>
        </Card>

        {/* Address Confirmation */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Address Confirmation</Text>
            <Text style={styles.sectionSubtitle}>Confirm your business location on the map</Text>
            
            <TouchableOpacity style={styles.mapPlaceholder} onPress={() => Alert.alert('Map Integration', 'In a real app, this would open a map for location selection')}>
              <MapPin color="#00FF88" size={40} />
              <Text style={styles.mapPlaceholderText}>Map View</Text>
              <Text style={styles.mapPlaceholderSubtext}>Tap to select location</Text>
            </TouchableOpacity>
            
            <View style={styles.addressConfirmation}>
              <Text style={styles.currentAddressLabel}>Current Address:</Text>
              <Text style={styles.currentAddress}>
                {businessAddress}, {city}, {state}
              </Text>
              
              <View style={styles.confirmationRow}>
                <TouchableOpacity 
                  style={[styles.confirmButton, addressConfirmed && styles.confirmedButton]}
                  onPress={() => setAddressConfirmed(!addressConfirmed)}
                >
                  <Text style={styles.confirmButtonText}>
                    {addressConfirmed ? 'Address Confirmed' : 'Confirm Address'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.changeLocationButton}
                  onPress={() => Alert.alert('Change Location', 'In a real app, this would open a map for location selection')}
                >
                  <Text style={styles.changeLocationText}>Change Location</Text>
                </TouchableOpacity>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Bank Account Setup */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Bank Account Setup</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Name *</Text>
              <View style={styles.inputContainer}>
                <UserPlus color="#888888" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter account holder name"
                  placeholderTextColor="#888888"
                  value={accountName}
                  onChangeText={setAccountName}
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Number *</Text>
              <View style={styles.inputContainer}>
                <Banknote color="#888888" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter account number"
                  placeholderTextColor="#888888"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bank Name *</Text>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => {
                    const buttons: AlertButton[] = [
                      ...NIGERIAN_BANKS.map(bank => ({
                        text: bank,
                        onPress: () => setBankName(bank)
                      })),
                      { text: 'Cancel', style: 'cancel' }
                    ];
                    
                    Alert.alert(
                      'Select Bank',
                      'Choose your bank',
                      buttons
                    );
                  }}
                >
                  <Text style={[styles.dropdownText, !bankName && styles.inputPlaceholder]}>
                    {bankName || 'Select bank'}
                  </Text>
                  <Text style={styles.dropdownChevron}>▼</Text>
                </TouchableOpacity>

              </View>
            </View>
          </CardContent>
        </Card>

        {/* Temporary Closure/Maintenance Mode */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Business Operations</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Lock color="#00FF88" size={20} />
                <View>
                  <Text style={styles.settingLabel}>Temporary Closure</Text>
                  <Text style={styles.settingDescription}>Prevents new bookings when enabled</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#00FF88' }}
                thumbColor={maintenanceMode ? '#FFFFFF' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setMaintenanceMode}
                value={maintenanceMode}
              />
            </View>
          </CardContent>
        </Card>

        {/* Default Settings */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Default Settings</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View>
                  <Text style={styles.settingLabel}>Default Pitch Size</Text>
                  <Text style={styles.settingDescription}>Used when creating new pitches</Text>
                </View>
              </View>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => {
                    const buttons: AlertButton[] = [
                      { text: '5-a-side', onPress: () => setDefaultPitchSize('5-a-side') },
                      { text: '7-a-side', onPress: () => setDefaultPitchSize('7-a-side') },
                      { text: '9-a-side', onPress: () => setDefaultPitchSize('9-a-side') },
                      { text: 'Cancel', style: 'cancel' }
                    ];
                    
                    Alert.alert(
                      'Select Pitch Size',
                      'Choose a default pitch size',
                      buttons
                    );
                  }}
                >
                  <Text style={[styles.dropdownText, !defaultPitchSize && styles.inputPlaceholder]}>
                    {defaultPitchSize || 'Select pitch size'}
                  </Text>
                  <Text style={styles.dropdownChevron}>▼</Text>
                </TouchableOpacity>

              </View>
            </View>
          </CardContent>
        </Card>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    fontSize: 24,
    color: '#00FF88',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  saveButton: {
    fontSize: 16,
    color: '#00FF88',
    fontWeight: '600',
  },
  sectionCard: {
    margin: 12,
    marginTop: 0,
    backgroundColor: '#1E1E1E',
  },
  sectionContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  inputContainer: {
    width: '100%',
  },
  numberInput: {
    height: 40,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'left',
  },

  dropdownContainer: {
    width: '100%',
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
  dropdownText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  dropdownChevron: {
    color: '#888888',
    fontSize: 16,
  },
  statusContainer: {
    alignItems: 'center',
    gap: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#00FF88',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  uploadButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#00FF88',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
  },
  statusDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  halfInputGroup: {
    flex: 1,
    marginBottom: 20,
  },
  doubleInputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 15,
    zIndex: 1,
  },
  inputPlaceholder: {
    color: '#888888',
  },

  uploadLogoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  uploadLogoText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  documentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  documentDescription: {
    fontSize: 14,
    color: '#888888',
    marginTop: 2,
  },
  documentActions: {
    width: 100,
    alignItems: 'flex-end',
  },
  uploadDocumentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  uploadDocumentText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  documentPreview: {
    alignItems: 'center',
  },
  documentThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  documentUploadedText: {
    fontSize: 12,
    color: '#00FF88',
    marginTop: 4,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  mapPlaceholderText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 10,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#888888',
    marginTop: 5,
  },
  addressConfirmation: {
    gap: 16,
  },
  currentAddressLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  currentAddress: {
    fontSize: 16,
    color: '#CCCCCC',
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 8,
  },
  confirmationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmedButton: {
    backgroundColor: '#00FF88',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  changeLocationButton: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  changeLocationText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },

});