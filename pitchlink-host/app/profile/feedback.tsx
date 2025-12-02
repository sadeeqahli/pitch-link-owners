import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, CardContent } from '@/components/ui/card';

export default function FeedbackScreen() {
  const router = useRouter();
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'other'>('bug');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // In a real app, this would send the feedback to a server
    console.log('Feedback submitted:', { feedbackType, subject, description });
    
    Alert.alert(
      'Feedback Submitted',
      'Thank you for your feedback! We appreciate your input.',
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Send Feedback</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.description}>
            Help us improve by reporting bugs, suggesting features, or sharing your experience.
          </Text>

          <Card style={styles.sectionCard}>
            <CardContent style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Feedback Type</Text>
              
              <View style={styles.typeContainer}>
                <TouchableOpacity 
                  style={[
                    styles.typeButton, 
                    feedbackType === 'bug' && styles.selectedTypeButton
                  ]}
                  onPress={() => setFeedbackType('bug')}
                >
                  <Text style={[
                    styles.typeButtonText,
                    feedbackType === 'bug' && styles.selectedTypeButtonText
                  ]}>
                    Report a Bug
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.typeButton, 
                    feedbackType === 'feature' && styles.selectedTypeButton
                  ]}
                  onPress={() => setFeedbackType('feature')}
                >
                  <Text style={[
                    styles.typeButtonText,
                    feedbackType === 'feature' && styles.selectedTypeButtonText
                  ]}>
                    Feature Request
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.typeButton, 
                    feedbackType === 'other' && styles.selectedTypeButton
                  ]}
                  onPress={() => setFeedbackType('other')}
                >
                  <Text style={[
                    styles.typeButtonText,
                    feedbackType === 'other' && styles.selectedTypeButtonText
                  ]}>
                    Other Feedback
                  </Text>
                </TouchableOpacity>
              </View>
            </CardContent>
          </Card>

          <Card style={styles.sectionCard}>
            <CardContent style={styles.sectionContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Subject *</Text>
                <TextInput
                  style={styles.input}
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="Briefly describe your feedback"
                  placeholderTextColor="#888888"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Please provide detailed information..."
                  placeholderTextColor="#888888"
                  multiline
                  numberOfLines={6}
                />
              </View>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
              </TouchableOpacity>
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
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedTypeButton: {
    backgroundColor: '#00FF88',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectedTypeButtonText: {
    color: '#000000',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  textArea: {
    height: 120,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  submitButton: {
    height: 50,
    backgroundColor: '#00FF88',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
  },
});