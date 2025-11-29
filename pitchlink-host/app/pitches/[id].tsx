import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePitchStore } from '@/store/usePitchStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react-native';

export default function PitchDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const pitches = usePitchStore((state: any) => state.pitches);
  const deletePitch = usePitchStore((state: any) => state.deletePitch);
  
  const pitch = pitches.find((p: any) => p.id === id);
  
  if (!pitch) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.title}>Pitch not found</Text>
          <Button 
            style={styles.backButton} 
            variant="default"
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Pitch',
      'Are you sure you want to delete this pitch?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deletePitch(pitch.id);
            router.back();
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{pitch.name}</Text>
          <View style={styles.headerActions}>
            <Button style={styles.editButton} variant="outline">
              <Edit color="#00FF88" size={20} />
            </Button>
            <Button 
              style={styles.deleteButton} 
              variant="outline"
              onPress={handleDelete}
            >
              <Trash color="#FF4444" size={20} />
            </Button>
          </View>
        </View>

        <Card style={styles.infoCard}>
          <CardContent style={styles.cardContent}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{pitch.description}</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Price per hour:</Text>
              <Text style={styles.value}>${pitch.pricePerHour.toFixed(2)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Status:</Text>
              <View style={[
                styles.statusBadge,
                pitch.status === 'available' && styles.statusAvailable,
                pitch.status === 'booked' && styles.statusBooked,
                pitch.status === 'maintenance' && styles.statusMaintenance,
              ]}>
                <Text style={styles.statusText}>{pitch.status}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Created:</Text>
              <Text style={styles.value}>
                {new Date(pitch.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </CardContent>
        </Card>

        <View style={styles.actionsContainer}>
          <Button style={styles.actionButton} variant="default">
            <Text style={styles.actionButtonText}>View Bookings</Text>
          </Button>
          <Button style={styles.actionButton} variant="outline">
            <Text style={styles.actionButtonText}>Edit Details</Text>
          </Button>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    width: 40,
    height: 40,
    padding: 0,
  },
  deleteButton: {
    width: 40,
    height: 40,
    padding: 0,
    borderColor: '#FF4444',
  },
  backButton: {
    height: 44,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  infoCard: {
    margin: 16,
    backgroundColor: '#1E1E1E',
  },
  cardContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 24,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  label: {
    fontSize: 16,
    color: '#888888',
  },
  value: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusAvailable: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  statusBooked: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
  },
  statusMaintenance: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    height: 44,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});