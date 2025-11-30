import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, Key, User, Settings } from 'lucide-react-native';
import { User as UserType } from '@/store/useAuthStore';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Info */}
        <Card style={styles.profileCard}>
          <CardContent style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            </View>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          </CardContent>
        </Card>

        {/* Account Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionCard}>
            <Card style={styles.card}>
              <CardContent style={styles.optionContent}>
                <View style={styles.optionLeft}>
                  <User color="#00FF88" size={20} />
                  <Text style={styles.optionText}>Account Information</Text>
                </View>
              </CardContent>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard}>
            <Card style={styles.card}>
              <CardContent style={styles.optionContent}>
                <View style={styles.optionLeft}>
                  <Key color="#00FF88" size={20} />
                  <Text style={styles.optionText}>Change Password</Text>
                </View>
              </CardContent>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard}>
            <Card style={styles.card}>
              <CardContent style={styles.optionContent}>
                <View style={styles.optionLeft}>
                  <Settings color="#00FF88" size={20} />
                  <Text style={styles.optionText}>App Settings</Text>
                </View>
              </CardContent>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut color="#FF4444" size={20} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
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
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileCard: {
    margin: 16,
    backgroundColor: '#1E1E1E',
  },
  card: {
    backgroundColor: '#1E1E1E',
  },
  profileContent: {
    alignItems: 'center',
    padding: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00FF88',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  optionsContainer: {
    padding: 16,
    gap: 16,
  },
  optionCard: {
    // TouchableOpacity wrapper
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    gap: 12,
    height: 50,
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