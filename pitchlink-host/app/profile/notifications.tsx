import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Calendar, CreditCard, MessageSquare, Info } from 'lucide-react-native';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  
  // Notification settings state
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  
  // Booking notifications
  const [bookingReminders, setBookingReminders] = useState(true);
  const [bookingConfirmations, setBookingConfirmations] = useState(true);
  const [bookingCancellations, setBookingCancellations] = useState(true);
  
  // Payment notifications
  const [paymentReceived, setPaymentReceived] = useState(true);
  const [paymentFailed, setPaymentFailed] = useState(true);
  
  // System notifications
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(true);
  const [promotionalOffers, setPromotionalOffers] = useState(false);
  
  // Time-based settings
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStartHour, setQuietStartHour] = useState('22:00');
  const [quietEndHour, setQuietEndHour] = useState('08:00');

  const handleSaveSettings = () => {
    // In a real app, this would save to a backend or local storage
    Alert.alert('Success', 'Notification settings saved successfully');
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
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MessageSquare color="#00FF88" size={20} />
                <View>
                  <Text style={styles.settingLabel}>Email Notifications</Text>
                  <Text style={styles.settingDescription}>Receive notifications via email</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#00FF88' }}
                thumbColor={emailNotifications ? '#FFFFFF' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setEmailNotifications}
                value={emailNotifications}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MessageSquare color="#00FF88" size={20} />
                <View>
                  <Text style={styles.settingLabel}>SMS Notifications</Text>
                  <Text style={styles.settingDescription}>Receive notifications via text message</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#00FF88' }}
                thumbColor={smsNotifications ? '#FFFFFF' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setSmsNotifications}
                value={smsNotifications}
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
        
        {/* System Notifications */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>System Notifications</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Info color="#00FF88" size={20} />
                <View>
                  <Text style={styles.settingLabel}>Maintenance Alerts</Text>
                  <Text style={styles.settingDescription}>Get notified about system maintenance</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#00FF88' }}
                thumbColor={maintenanceAlerts ? '#FFFFFF' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setMaintenanceAlerts}
                value={maintenanceAlerts}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Info color="#00FF88" size={20} />
                <View>
                  <Text style={styles.settingLabel}>Promotional Offers</Text>
                  <Text style={styles.settingDescription}>Receive promotional offers and updates</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#00FF88' }}
                thumbColor={promotionalOffers ? '#FFFFFF' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setPromotionalOffers}
                value={promotionalOffers}
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