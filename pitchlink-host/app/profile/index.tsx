import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent } from '@/components/ui/card';
import { User, Settings, Bell, HelpCircle, LogOut, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [businessStatus, setBusinessStatus] = useState<'not_started' | 'incomplete' | 'under_review' | 'approved' | 'rejected'>('not_started');

  // Load business verification status
  useEffect(() => {
    loadBusinessStatus();
  }, []);

  const loadBusinessStatus = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('businessSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setBusinessStatus(settings.businessStatus || 'not_started');
      }
    } catch (error) {
      console.log('Error loading business settings:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
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
      case 'not_started': return 'Not Started';
      case 'incomplete': return 'Incomplete';
      case 'under_review': return 'Under Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Not Started';
    }
  };

  const getStatusIcon = () => {
    switch (businessStatus) {
      case 'approved': return <CheckCircle color={getStatusColor()} size={20} />;
      case 'rejected': return <XCircle color={getStatusColor()} size={20} />;
      default: return <AlertCircle color={getStatusColor()} size={20} />;
    }
  };

  const handleViewVerificationStatus = () => {
    if (businessStatus === 'under_review') {
      router.push('/profile/verification-loading');
    } else {
      router.push('/profile/business-settings');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <User color="#FFFFFF" size={40} />
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
        </View>

        {/* Business Verification Status */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Business Verification</Text>
            
            <TouchableOpacity 
              style={styles.statusContainer}
              onPress={handleViewVerificationStatus}
            >
              <View style={styles.statusLeft}>
                {getStatusIcon()}
                <View>
                  <Text style={styles.statusText}>{getStatusText()}</Text>
                  <Text style={styles.statusDescription}>
                    {businessStatus === 'under_review' 
                      ? 'Tap to view progress'
                      : businessStatus === 'approved'
                      ? 'Business verified'
                      : 'Complete verification to list pitches'}
                  </Text>
                </View>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            
            <TouchableOpacity style={styles.settingsRow} onPress={() => router.push('/profile/notifications')}>
              <View style={styles.settingsLeft}>
                <Bell color="#00FF88" size={20} />
                <Text style={styles.settingsText}>Notifications</Text>
              </View>
              <Text style={styles.settingsArrow}>›</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsRow} onPress={() => router.push('/profile/general-settings')}>
              <View style={styles.settingsLeft}>
                <Settings color="#00FF88" size={20} />
                <Text style={styles.settingsText}>General Settings</Text>
              </View>
              <Text style={styles.settingsArrow}>›</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsRow} onPress={() => router.push('/profile/business-settings')}>
              <View style={styles.settingsLeft}>
                <Settings color="#00FF88" size={20} />
                <Text style={styles.settingsText}>Business Settings</Text>
              </View>
              <Text style={styles.settingsArrow}>›</Text>
            </TouchableOpacity>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionContent}>
            <TouchableOpacity style={styles.supportRow} onPress={() => router.push('/profile/support')}>
              <View style={styles.supportLeft}>
                <HelpCircle color="#00FF88" size={20} />
                <Text style={styles.supportText}>Support</Text>
              </View>
              <Text style={styles.supportArrow}>›</Text>
            </TouchableOpacity>
          </CardContent>
        </Card>

        {/* Sign Out Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut color="#FF4444" size={20} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 16,
    color: '#888888',
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
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  statusDescription: {
    fontSize: 14,
    color: '#888888',
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: '#888888',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  settingsArrow: {
    fontSize: 24,
    color: '#888888',
  },
  supportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  supportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  supportText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  supportArrow: {
    fontSize: 24,
    color: '#888888',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    margin: 16,
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF4444',
    fontWeight: '600',
  },
});