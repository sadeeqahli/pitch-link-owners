import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePitchStore } from '@/store/usePitchStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash } from 'lucide-react-native';

export default function PitchesScreen() {
  const pitches = usePitchStore((state: any) => state.pitches);
  const deletePitch = usePitchStore((state: any) => state.deletePitch);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleDeletePitch = (id: string) => {
    deletePitch(id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Pitches</Text>
        <View style={styles.headerActions}>
          <Button style={styles.addButton} variant="default">
            <Plus color="#FFFFFF" size={20} />
            <Text style={styles.addButtonText}>Add Pitch</Text>
          </Button>
        </View>
      </View>

      {pitches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pitches yet</Text>
          <Text style={styles.emptySubtext}>Add your first pitch to get started</Text>
          <Button style={styles.emptyButton} variant="default">
            <Text style={styles.emptyButtonText}>Add Pitch</Text>
          </Button>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={viewMode === 'grid' ? styles.gridContainer : styles.listContainer}>
            {pitches.map((pitch: any) => (
              <Card key={pitch.id} style={viewMode === 'grid' ? styles.gridCard : styles.listCard}>
                <CardContent style={styles.cardContent}>
                  <Text style={styles.pitchName}>{pitch.name}</Text>
                  <Text style={styles.pitchDescription} numberOfLines={2}>
                    {pitch.description}
                  </Text>
                  <View style={styles.pitchInfo}>
                    <Text style={styles.pitchPrice}>${pitch.pricePerHour}/hour</Text>
                    <View style={[
                      styles.statusBadge,
                      pitch.status === 'available' && styles.statusAvailable,
                      pitch.status === 'booked' && styles.statusBooked,
                      pitch.status === 'maintenance' && styles.statusMaintenance,
                    ]}>
                      <Text style={styles.statusText}>{pitch.status}</Text>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Edit color="#00FF88" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleDeletePitch(pitch.id)}
                    >
                      <Trash color="#FF4444" size={20} />
                    </TouchableOpacity>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        </ScrollView>
      )}
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    flexDirection: 'row',
    gap: 8,
    height: 40,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  gridCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#1E1E1E',
  },
  listCard: {
    backgroundColor: '#1E1E1E',
  },
  cardContent: {
    padding: 16,
  },
  pitchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  pitchDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 12,
  },
  pitchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pitchPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00FF88',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    height: 44,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});