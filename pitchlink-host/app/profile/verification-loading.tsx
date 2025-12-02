import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VerificationLoadingScreen() {
  const router = useRouter();
  const [businessStatus, setBusinessStatus] = useState<'not_started' | 'incomplete' | 'under_review' | 'approved' | 'rejected'>('under_review');
  const [loading, setLoading] = useState(true);
  const [intervalId, setIntervalId] = useState<any>(null);

  // Load business verification status
  useEffect(() => {
    loadBusinessStatus();
    
    // Simulate checking for status updates periodically
    const interval = setInterval(() => {
      loadBusinessStatus();
    }, 30000); // Check every 30 seconds
    
    setIntervalId(interval);
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  const loadBusinessStatus = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('businessSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setBusinessStatus(settings.businessStatus || 'under_review');
        
        // If verification is complete, navigate to appropriate screen
        if (settings.businessStatus === 'approved' || settings.businessStatus === 'rejected') {
          if (intervalId) {
            clearInterval(intervalId);
          }
          router.replace('/(tabs)/pitches'); // Navigate to pitches screen
        }
      }
    } catch (error) {
      console.log('Error loading business settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadBusinessStatus();
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'For urgent inquiries about your verification status, please contact our support team.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Go to Support', onPress: () => router.push('/profile/support') },
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
      default: return 'Under Review';
    }
  };

  const getStatusIcon = () => {
    switch (businessStatus) {
      case 'approved': return <CheckCircle color={getStatusColor()} size={40} />;
      case 'rejected': return <XCircle color={getStatusColor()} size={40} />;
      default: return <AlertCircle color={getStatusColor()} size={40} />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Verification Status</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <RefreshCw color="#00FF88" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Card style={styles.statusCard}>
            <CardContent style={styles.statusCardContent}>
              {getStatusIcon()}
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
              
              <View style={styles.statusBadge}>
                <Text style={[styles.statusBadgeText, { color: getStatusColor() }]}>
                  {getStatusText()}
                </Text>
              </View>
            </CardContent>
          </Card>

          <Card style={styles.infoCard}>
            <CardContent style={styles.infoCardContent}>
              <Text style={styles.infoTitle}>Verification in Progress</Text>
              <Text style={styles.infoText}>
                Your business information is currently under review. This process typically takes 24-48 hours.
              </Text>
              <Text style={styles.infoText}>
                Our team is verifying your business details and documents to ensure the security and trustworthiness of our platform.
              </Text>
            </CardContent>
          </Card>

          <Card style={styles.timelineCard}>
            <CardContent style={styles.timelineCardContent}>
              <Text style={styles.timelineTitle}>What happens next?</Text>
              
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, businessStatus !== 'not_started' && styles.timelineDotCompleted]}>
                  <Text style={styles.timelineDotText}>1</Text>
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineItemTitle}>Document Submission</Text>
                  <Text style={styles.timelineItemText}>You've submitted all required documents</Text>
                </View>
              </View>
              
              <View style={styles.timelineSeparator} />
              
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, (businessStatus === 'under_review' || businessStatus === 'approved' || businessStatus === 'rejected') && styles.timelineDotCompleted]}>
                  <Text style={styles.timelineDotText}>2</Text>
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineItemTitle}>Review Process</Text>
                  <Text style={styles.timelineItemText}>Our team is reviewing your information</Text>
                </View>
              </View>
              
              <View style={styles.timelineSeparator} />
              
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, (businessStatus === 'approved' || businessStatus === 'rejected') && styles.timelineDotCompleted]}>
                  <Text style={styles.timelineDotText}>3</Text>
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineItemTitle}>Verification Complete</Text>
                  <Text style={styles.timelineItemText}>You'll receive a notification with the result</Text>
                </View>
              </View>
            </CardContent>
          </Card>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
              <Text style={styles.supportButtonText}>Contact Support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/profile/business-settings')}>
              <Text style={styles.settingsButtonText}>View Business Settings</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    padding: 16,
    gap: 20,
  },
  statusCard: {
    backgroundColor: '#1E1E1E',
  },
  statusCardContent: {
    padding: 32,
    alignItems: 'center',
    gap: 20,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFA500',
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
  },
  statusBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFA500',
  },
  infoCard: {
    backgroundColor: '#1E1E1E',
  },
  infoCardContent: {
    padding: 20,
    gap: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infoText: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 24,
  },
  timelineCard: {
    backgroundColor: '#1E1E1E',
  },
  timelineCardContent: {
    padding: 20,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 16,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333333',
  },
  timelineDotCompleted: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  timelineDotText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  timelineContent: {
    flex: 1,
    paddingVertical: 2,
  },
  timelineItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  timelineItemText: {
    fontSize: 14,
    color: '#888888',
  },
  timelineSeparator: {
    width: 2,
    backgroundColor: '#333333',
    marginLeft: 15,
    marginVertical: 8,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  supportButton: {
    flex: 1,
    backgroundColor: '#00FF88',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  supportButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
  },
  settingsButton: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});