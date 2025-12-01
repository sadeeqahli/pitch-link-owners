import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, Key, User, Settings, Edit3, Phone, Mail, MapPin, HelpCircle, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [location, setLocation] = useState('');

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  const handleSave = () => {
    // In a real app, this would update the user data
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Edit3 color="#00FF88" size={20} />
          <Text style={styles.editButtonText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Picture */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </View>

        {/* Name */}
        <View style={styles.nameContainer}>
          <Text style={styles.userName}>{name || 'User'}</Text>
        </View>

        {/* Bio */}
        <View style={styles.bioContainer}>
          <TextInput
            style={styles.bioInput}
            value={bio}
            onChangeText={setBio}
            placeholder="Add a bio..."
            placeholderTextColor="#888888"
            multiline
            editable={isEditing}
          />
        </View>

        {/* Bookings Section */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Bookings</Text>
            <Text style={styles.sectionDescription}>Manage your bookings and reservations</Text>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <User color="#00FF88" size={16} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <TextInput
                  style={styles.infoInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor="#888888"
                  editable={isEditing}
                />
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Phone color="#00FF88" size={16} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <TextInput
                  style={styles.infoInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#888888"
                  keyboardType="phone-pad"
                  editable={isEditing}
                />
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Mail color="#00FF88" size={16} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <TextInput
                  style={styles.infoInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#888888"
                  keyboardType="email-address"
                  editable={isEditing}
                />
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <MapPin color="#00FF88" size={16} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Location</Text>
                <TextInput
                  style={styles.infoInput}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Enter your location"
                  placeholderTextColor="#888888"
                  editable={isEditing}
                />
              </View>
            </View>
            
            {isEditing && (
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            )}
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionContent}>
            <TouchableOpacity style={styles.settingsRow} onPress={() => router.push('/profile/notifications')}>
              <View style={styles.settingsLeft}>
                <Bell color="#00FF88" size={20} />
                <Text style={styles.settingsText}>Notifications</Text>
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
  },
  editButtonText: {
    color: '#00FF88',
    fontWeight: '600',
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00FF88',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000000',
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bioContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  bioInput: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    minHeight: 40,
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
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#888888',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIconContainer: {
    width: 30,
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  infoInput: {
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  saveButton: {
    height: 50,
    backgroundColor: '#00FF88',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
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
    gap: 12,
    height: 50,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#FF4444',
    fontWeight: '600',
  },
});