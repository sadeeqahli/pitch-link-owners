import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '@/contexts/ThemeContext';

export default function GeneralSettingsScreen() {
  const router = useRouter();
  const { isDarkMode, fontSize: currentFontSize, toggleDarkMode, setFontSize } = useAppTheme();
  
  // Default behaviors - Removed autoConfirmBookings
  const [sendBookingReminders, setSendBookingReminders] = useState(true);
  
  // Refund settings
  const [allowRefunds, setAllowRefunds] = useState(false);
  
  // Maximum early booking time (in days)
  const [maxEarlyBookingDays, setMaxEarlyBookingDays] = useState('30');

  // Load saved general settings
  useEffect(() => {
    loadGeneralSettings();
  }, []);

  const loadGeneralSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('generalSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setSendBookingReminders(settings.sendBookingReminders ?? true);
        setAllowRefunds(settings.allowRefunds ?? false);
        setMaxEarlyBookingDays(settings.maxEarlyBookingDays ?? '30');
      }
    } catch (error) {
      console.log('Error loading general settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const settings = {
        sendBookingReminders,
        allowRefunds,
        maxEarlyBookingDays,
      };
      await AsyncStorage.setItem('generalSettings', JSON.stringify(settings));
      
      Alert.alert('Success', 'General settings saved successfully');
    } catch (error) {
      console.log('Error saving general settings:', error);
      Alert.alert('Error', 'Failed to save general settings');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>General Settings</Text>
        <TouchableOpacity onPress={handleSaveSettings}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Default Behaviors - Removed Auto-confirm Bookings */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Default Behaviors</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Clock color="#00FF88" size={20} />
                <View>
                  <Text style={styles.settingLabel}>Send Booking Reminders</Text>
                  <Text style={styles.settingDescription}>Send automatic reminders before bookings</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#00FF88' }}
                thumbColor={sendBookingReminders ? '#FFFFFF' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setSendBookingReminders}
                value={sendBookingReminders}
              />
            </View>
          </CardContent>
        </Card>
        
        {/* Refund Policy */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Refund Policy</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View>
                  <Text style={styles.settingLabel}>Allow Refunds</Text>
                  <Text style={styles.settingDescription}>Enable refund processing for bookings</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#00FF88' }}
                thumbColor={allowRefunds ? '#FFFFFF' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setAllowRefunds}
                value={allowRefunds}
              />
            </View>
          </CardContent>
        </Card>
        
        {/* Booking Settings */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Booking Settings</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View>
                  <Text style={styles.settingLabel}>Maximum Early Booking</Text>
                  <Text style={styles.settingDescription}>Maximum days in advance bookings can be made</Text>
                </View>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.numberInput}
                  value={maxEarlyBookingDays}
                  onChangeText={setMaxEarlyBookingDays}
                  keyboardType="numeric"
                  placeholder="30"
                />
                <Text style={styles.daysText}>days</Text>
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
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 2,
  },
  segment: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  activeSegment: {
    backgroundColor: '#00FF88',
  },
  segmentText: {
    fontSize: 14,
    color: '#888888',
  },
  activeSegmentText: {
    color: '#000000',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  numberInput: {
    width: 60,
    height: 40,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  daysText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});