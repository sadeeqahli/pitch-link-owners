import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Calendar, CreditCard } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  
  // Notification settings state
  const [pushNotifications, setPushNotifications] = useState(true);
  
  // Booking notifications
  const [bookingReminders, setBookingReminders] = useState(true);
  const [bookingConfirmations, setBookingConfirmations] = useState(true);
  const [bookingCancellations, setBookingCancellations] = useState(true);
  
  // Payment notifications
  const [paymentReceived, setPaymentReceived] = useState(true);
  const [paymentFailed, setPaymentFailed] = useState(true);
  
  // Time-based settings
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStartHour, setQuietStartHour] = useState('22:00');
  const [quietEndHour, setQuietEndHour] = useState('08:00');

  // Load saved notification settings
  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setPushNotifications(settings.pushNotifications ?? true);
        setBookingReminders(settings.bookingReminders ?? true);
        setBookingConfirmations(settings.bookingConfirmations ?? true);
        setBookingCancellations(settings.bookingCancellations ?? true);
        setPaymentReceived(settings.paymentReceived ?? true);
        setPaymentFailed(settings.paymentFailed ?? true);
        setQuietHoursEnabled(settings.quietHoursEnabled ?? false);
        setQuietStartHour(settings.quietStartHour ?? '22:00');
        setQuietEndHour(settings.quietEndHour ?? '08:00');
      }
    } catch (error) {
      console.log('Error loading notification settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const settings = {
        pushNotifications,
        bookingReminders,
        bookingConfirmations,
        bookingCancellations,
        paymentReceived,
        paymentFailed,
        quietHoursEnabled,
        quietStartHour,
        quietEndHour,
      };
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
      Alert.alert('Success', 'Notification settings saved successfully');
    } catch (error) {
      console.log('Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save notification settings');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={handleSaveSettings}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Notification Channels */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Notification Channels</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Bell color="#00FF88" size={20} />
                <View>
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                  <Text style={styles.settingDescription}>Receive notifications on your device</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#00FF88' }}
                thumbColor={pushNotifications ? '#FFFFFF' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setPushNotifications}
                value={pushNotifications}
              />
            </View>
          </CardContent>
        </Card>
        
        {/* Booking Notifications */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Booking Notifications</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Calendar color="#00FF88" size={20} />
                <View>
                  <Text style={styles.settingLabel}>Booking Reminders</Text>
                  <Text style={styles.settingDescription}>Get reminders before bookings</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#00FF88' }}
                thumbColor={bookingReminders ? '#FFFFFF' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setBookingReminders}
                value={bookingReminders}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Calendar color="#00FF88" size={20} />
                <View>
                  <Text style={styles.settingLabel}>Booking Confirmations</Text>
                  <Text style={styles.settingDescription}>Get notified when bookings are confirmed</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#00FF88' }}
                thumbColor={bookingConfirmations ? '#FFFFFF' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setBookingConfirmations}
                value={bookingConfirmations}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Calendar color="#00FF88" size={20} />
                <View>
                  <Text style={styles.settingLabel}>Booking Cancellations</Text>
                  <Text style={styles.settingDescription}>Get notified when bookings are cancelled</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#00FF88' }}
                thumbColor={bookingCancellations ? '#FFFFFF' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setBookingCancellations}
                value={bookingCancellations}
              />
            </View>
          </CardContent>
        </Card>
        
        {/* Payment Notifications */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Payment Notifications</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <CreditCard color="#00FF88" size={20} />
                <View>
                  <Text style={styles.settingLabel}>Payment Received</Text>
                  <Text style={styles.settingDescription}>Get notified when payments are received</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#00FF88' }}
                thumbColor={paymentReceived ? '#FFFFFF' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setPaymentReceived}
                value={paymentReceived}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <CreditCard color="#00FF88" size={20} />
                <View>
                  <Text style={styles.settingLabel}>Payment Failed</Text>
                  <Text style={styles.settingDescription}>Get notified when payments fail</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#00FF88' }}
                thumbColor={paymentFailed ? '#FFFFFF' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setPaymentFailed}
                value={paymentFailed}
              />
            </View>
          </CardContent>
        </Card>
        
        {/* Quiet Hours */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Quiet Hours</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View>
                  <Text style={styles.settingLabel}>Enable Quiet Hours</Text>
                  <Text style={styles.settingDescription}>Pause notifications during specified hours</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#00FF88' }}
                thumbColor={quietHoursEnabled ? '#FFFFFF' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setQuietHoursEnabled}
                value={quietHoursEnabled}
              />
            </View>
            
            {quietHoursEnabled && (
              <>
                <View style={styles.timeSettingRow}>
                  <Text style={styles.timeLabel}>Start Time</Text>
                  <TouchableOpacity style={styles.timeButton}>
                    <Text style={styles.timeText}>{quietStartHour}</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.timeSettingRow}>
                  <Text style={styles.timeLabel}>End Time</Text>
                  <TouchableOpacity style={styles.timeButton}>
                    <Text style={styles.timeText}>{quietEndHour}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  timeSettingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  timeLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  timeButton: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});