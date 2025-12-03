import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, CardContent } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function BlankDashboardScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Welcome to PitchLink!</Text>
        </View>

        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome to your PitchLink dashboard</Text>
          <Text style={styles.welcomeSubtext}>
            Get started by adding your first pitch, booking, or payment.
          </Text>
        </View>

        {/* Stats Cards - All Zero */}
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, styles.wideStatCard]}>
            <CardContent style={styles.statCardContent}>
              <Text style={styles.statValue}>₦0.00</Text>
              <Text style={styles.statLabel}>Total Earnings</Text>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent style={styles.statCardContent}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Bookings Today</Text>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent style={styles.statCardContent}>
              <Text style={styles.statValue}>Closed</Text>
              <Text style={styles.statLabel}>Pitch Status</Text>
              <View style={styles.statusIndicatorContainer}>
                <View style={[styles.statusIndicator, styles.statusClosed]} />
                <Text style={styles.statusText}>0 pitches open</Text>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Quick Actions */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.sectionCardContent}>
            <Text style={styles.sectionTitle}>Get Started</Text>
            <Text style={styles.sectionSubtitle}>
              Begin managing your football pitches by adding your first pitch.
            </Text>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/pitches/add')}
            >
              <Text style={styles.actionButtonText}>Add Your First Pitch</Text>
            </TouchableOpacity>
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
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#888888',
    marginTop: 4,
  },
  welcomeContainer: {
    padding: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#1E1E1E',
  },
  wideStatCard: {
    flex: 2,
    minWidth: 200,
  },
  statCardContent: {
    padding: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 8,
  },
  statusIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusClosed: {
    backgroundColor: '#FF4444',
  },
  statusText: {
    fontSize: 12,
    color: '#888888',
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#1E1E1E',
  },
  sectionCardContent: {
    padding: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#00FF88',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  actionButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
  },
});