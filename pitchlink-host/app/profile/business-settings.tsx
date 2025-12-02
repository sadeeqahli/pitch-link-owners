import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, TextInput, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Calendar, Users, Clock, Smartphone, FileText, Shield, UserPlus, UserMinus, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BusinessSettingsScreen() {
  const router = useRouter();
  
  // Business verification state
  const [businessStatus, setBusinessStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [documentsUploaded, setDocumentsUploaded] = useState(false);
  
  // Business settings state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [defaultPitchSize, setDefaultPitchSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [maxManualBookings, setMaxManualBookings] = useState('10');
  // Removed sessionTimeout state
  // Removed staff management and device access control states

  // Load saved business settings
  useEffect(() => {
    loadBusinessSettings();
  }, []);

  const loadBusinessSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('businessSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setBusinessStatus(settings.businessStatus || 'pending');
        setDocumentsUploaded(settings.documentsUploaded || false);
        setMaintenanceMode(settings.maintenanceMode || false);
        setDefaultPitchSize(settings.defaultPitchSize || 'medium');
        setMaxManualBookings(settings.maxManualBookings || '10');
        // Removed sessionTimeout loading
        // Removed staff management and device access control loading
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
        maintenanceMode,
        defaultPitchSize,
        maxManualBookings,
        // Removed sessionTimeout
        // Removed staff management and device access control
      };
      await AsyncStorage.setItem('businessSettings', JSON.stringify(settings));
      Alert.alert('Success', 'Business settings saved successfully');
    } catch (error) {
      console.log('Error saving business settings:', error);
      Alert.alert('Error', 'Failed to save business settings');
    }
  };

  const handleUploadDocuments = () => {
    // In a real app, this would open a file picker
    Alert.alert(
      'Upload Documents',
      'In a real implementation, this would allow you to upload required business documents for verification.',
      [
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
      ]
    );
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
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Pending Approval';
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
              
              {!documentsUploaded && (
                <TouchableOpacity style={styles.uploadButton} onPress={handleUploadDocuments}>
                  <FileText color="#00FF88" size={20} />
                  <Text style={styles.uploadButtonText}>Upload Documents</Text>
                </TouchableOpacity>
              )}
              
              <Text style={styles.statusDescription}>
                {businessStatus === 'pending' 
                  ? 'Your business is pending approval. Upload required documents to begin the verification process.'
                  : businessStatus === 'approved'
                  ? 'Your business has been approved and is active.'
                  : 'Your business verification was rejected. Please contact support for more information.'}
              </Text>
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
                  onPress={() => Alert.alert(
                    'Select Pitch Size',
                    'Choose a default pitch size',
                    [
                      { text: 'Small', onPress: () => setDefaultPitchSize('small') },
                      { text: 'Medium', onPress: () => setDefaultPitchSize('medium') },
                      { text: 'Large', onPress: () => setDefaultPitchSize('large') },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  )}
                >
                  <Text style={styles.dropdownText}>
                    {defaultPitchSize.charAt(0).toUpperCase() + defaultPitchSize.slice(1)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Calendar color="#00FF88" size={20} />
                <View>
                  <Text style={styles.settingLabel}>Max Manual Bookings/Day</Text>
                  <Text style={styles.settingDescription}>Limit for manually created bookings</Text>
                </View>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.numberInput}
                  value={maxManualBookings}
                  onChangeText={setMaxManualBookings}
                  keyboardType="numeric"
                  placeholder="10"
                />
              </View>
            </View>
            
            {/* Removed Session Timeout Setting */}
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
    margin: 16,
    marginTop: 0,
    backgroundColor: '#1E1E1E',
  },
  sectionContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    color: '#888888',
    marginTop: 2,
  },
  inputContainer: {
    width: 80,
  },
  numberInput: {
    height: 40,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  dropdownContainer: {
    minWidth: 100,
  },
  dropdownButton: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownText: {
    color: '#FFFFFF',
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
  statusDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  staffSection: {
    marginBottom: 20,
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  staffTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addButton: {
    padding: 8,
  },
  staffItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  staffName: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  noStaffText: {
    fontSize: 14,
    color: '#888888',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  deviceName: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    height: 50,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#333333',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#00FF88',
  },
  confirmButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
  },
});