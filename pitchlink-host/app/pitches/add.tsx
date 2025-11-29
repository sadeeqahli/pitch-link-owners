import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePitchStore } from '@/store/usePitchStore';
import { Button } from '@/components/ui/button';

export default function AddPitchScreen() {
  const router = useRouter();
  const addPitch = usePitchStore((state: any) => state.addPitch);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddPitch = () => {
    if (!name || !description || !pricePerHour) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    const price = parseFloat(pricePerHour);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    
    setLoading(true);
    
    try {
      addPitch({
        name,
        description,
        pricePerHour: price,
        status: 'available',
      });
      
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add pitch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Add New Pitch</Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.form}>
          <Text style={styles.label}>Pitch Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter pitch name"
            placeholderTextColor="#888888"
            value={name}
            onChangeText={setName}
          />
          
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the pitch"
            placeholderTextColor="#888888"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          
          <Text style={styles.label}>Price per Hour ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#888888"
            value={pricePerHour}
            onChangeText={setPricePerHour}
            keyboardType="decimal-pad"
          />
          
          <View style={styles.buttonContainer}>
            <Button 
              style={styles.cancelButton} 
              variant="outline"
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Button>
            
            <Button 
              style={styles.saveButton} 
              variant="default"
              onPress={handleAddPitch}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : 'Save Pitch'}
              </Text>
            </Button>
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
  contentContainer: {
    padding: 20,
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
  form: {
    gap: 20,
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    backgroundColor: '#1E1E1E',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderColor: '#FF4444',
  },
  cancelButtonText: {
    color: '#FF4444',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    height: 50,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});