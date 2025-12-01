import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MessageCircle } from 'lucide-react-native';

export default function SupportScreen() {
  const router = useRouter();

  const handleCallSupport = () => {
    // Initiate a phone call with the specific number
    const phoneUrl = 'tel:09130474356';
    Linking.openURL(phoneUrl).catch(() => {
      console.log('Failed to initiate phone call');
      // In a real app, you might want to show an alert or fallback option
    });
  };

  const handleEmailSupport = () => {
    // Open email client with the specific email address
    const emailUrl = 'mailto:pitchlinkapp@gmail.com';
    Linking.openURL(emailUrl).catch(() => {
      console.log('Failed to open email client');
      // In a real app, you might want to show an alert or fallback option
    });
  };

  const handleWhatsAppSupport = () => {
    // Open WhatsApp with the specific number
    const whatsappUrl = 'https://wa.me/2348109989733';
    Linking.openURL(whatsappUrl).catch(() => {
      console.log('Failed to open WhatsApp');
      // In a real app, you might want to show an alert or fallback option
    });
  };

  const handleReportBug = () => {
    // In a real app, this would open a bug reporting form
    console.log('Reporting a bug');
  };

  const handleRateApp = () => {
    // In a real app, this would open the app store rating page
    console.log('Rating the app');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.description}>
            Need help? Get in touch with our support team through any of the channels below.
          </Text>

          <Card style={styles.sectionCard}>
            <CardContent style={styles.sectionContent}>
              <TouchableOpacity style={styles.supportOption} onPress={handleCallSupport}>
                <View style={styles.supportOptionLeft}>
                  <Phone color="#00FF88" size={24} />
                  <View>
                    <Text style={styles.supportOptionTitle}>Call Support</Text>
                    <Text style={styles.supportOptionDescription}>Speak directly with our support team</Text>
                    <Text style={styles.supportOptionDescription}>091 304 74356</Text>
                  </View>
                </View>
                <Text style={styles.supportArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.supportOption} onPress={handleEmailSupport}>
                <View style={styles.supportOptionLeft}>
                  <Mail color="#00FF88" size={24} />
                  <View>
                    <Text style={styles.supportOptionTitle}>Email Support</Text>
                    <Text style={styles.supportOptionDescription}>Send us an email and we'll respond within 24 hours</Text>
                    <Text style={styles.supportOptionDescription}>pitchlinkapp@gmail.com</Text>
                  </View>
                </View>
                <Text style={styles.supportArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.supportOption} onPress={handleWhatsAppSupport}>
                <View style={styles.supportOptionLeft}>
                  <MessageCircle color="#25D366" size={24} />
                  <View>
                    <Text style={styles.supportOptionTitle}>WhatsApp Support</Text>
                    <Text style={styles.supportOptionDescription}>Chat with us on WhatsApp for instant support</Text>
                    <Text style={styles.supportOptionDescription}>+234 810 998 9733</Text>
                  </View>
                </View>
                <Text style={styles.supportArrow}>›</Text>
              </TouchableOpacity>
            </CardContent>
          </Card>

          <Card style={styles.sectionCard}>
            <CardContent style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              
              <View style={styles.quickActionsContainer}>
                <TouchableOpacity style={styles.quickActionButton} onPress={handleReportBug}>
                  <Text style={styles.quickActionText}>Report a Bug</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.quickActionButton} onPress={handleRateApp}>
                  <Text style={styles.quickActionText}>Rate the App</Text>
                </TouchableOpacity>
              </View>
            </CardContent>
          </Card>
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
    fontSize: 32,
    color: '#00FF88',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#1E1E1E',
    marginBottom: 16,
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
  supportOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  supportOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  supportOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  supportOptionDescription: {
    fontSize: 14,
    color: '#888888',
  },
  supportArrow: {
    fontSize: 24,
    color: '#888888',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 16,
    color: '#00FF88',
    fontWeight: '600',
  },
});