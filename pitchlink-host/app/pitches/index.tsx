import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePitchStore } from '@/store/usePitchStore';
import { Card, CardContent } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Plus, Edit, Trash, Search, Calendar } from 'lucide-react-native';

export default function PitchesScreen() {
  const router = useRouter();
  const pitches = usePitchStore((state) => state.pitches);
  const searchPitches = usePitchStore((state) => state.searchPitches);
  const getPitchesByStatus = usePitchStore((state) => state.getPitchesByStatus);
  const deletePitch = usePitchStore((state) => state.deletePitch);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'booked' | 'maintenance'>('all');

  const handleDeletePitch = (id: string) => {
    deletePitch(id);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Filter and search pitches
  const filteredPitches = useMemo(() => {
    let result = searchQuery ? searchPitches(searchQuery) : pitches;
    
    if (filterStatus !== 'all') {
      result = result.filter(pitch => pitch.status === filterStatus);
    }
    
    return result;
  }, [pitches, searchQuery, filterStatus, searchPitches]);

  const statusFilters = [
    { label: 'All', value: 'all' },
    { label: 'Available', value: 'available' },
    { label: 'Booked', value: 'booked' },
    { label: 'Maintenance', value: 'maintenance' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Pitches</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/pitches/add')}
        >
          <Plus color="#FFFFFF" size={20} />
          <Text style={styles.addButtonText}>Add Pitch</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search color="#888888" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search pitches..."
            placeholderTextColor="#888888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterButton,
                filterStatus === filter.value && styles.activeFilter
              ]}
              onPress={() => setFilterStatus(filter.value as any)}
            >
              <Text style={[
                styles.filterText,
                filterStatus === filter.value && styles.activeFilterText
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filteredPitches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="sportscourt.fill" size={64} color="#333333" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No pitches found' : 'No pitches yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery 
              ? 'Try a different search term' 
              : 'Add your first pitch to get started'}
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => router.push('/pitches/add')}
          >
            <Text style={styles.emptyButtonText}>Add Pitch</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00FF88" />
          }
        >
          <View style={styles.pitchesList}>
            {filteredPitches.map((pitch) => (
              <Card key={pitch.id} style={styles.pitchCard}>
                <CardContent style={styles.cardContent}>
                  <View style={styles.pitchHeader}>
                    <View style={styles.pitchIconContainer}>
                      <IconSymbol name="sportscourt.fill" size={24} color="#00FF88" />
                    </View>
                    <View style={styles.pitchInfo}>
                      <Text style={styles.pitchName}>{pitch.name}</Text>
                      <Text style={styles.pitchDescription} numberOfLines={2}>
                        {pitch.description}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.pitchDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Price:</Text>
                      <Text style={styles.detailValue}>₦{pitch.pricePerHour.toFixed(2)}/hour</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Size:</Text>
                      <Text style={styles.detailValue}>{pitch.size}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Location:</Text>
                      <Text style={styles.detailValue} numberOfLines={1}>{pitch.location}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status:</Text>
                      <View style={[
                        styles.statusBadge,
                        pitch.status === 'available' && styles.statusAvailable,
                        pitch.status === 'booked' && styles.statusBooked,
                        pitch.status === 'maintenance' && styles.statusMaintenance,
                      ]}>
                        <Text style={styles.statusText}>{pitch.status}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.cardActions}>
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => router.push(`/pitches/${pitch.id}`)}
                    >
                      <Calendar color="#00FF88" size={16} />
                      <Text style={styles.viewButtonText}>View</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => router.push(`/pitches/edit/${pitch.id}`)}
                    >
                      <Edit color="#00FF88" size={16} />
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeletePitch(pitch.id)}
                    >
                      <Trash color="#FF4444" size={16} />
                      <Text style={styles.deleteButtonText}>Delete</Text>
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
  addButton: {
    flexDirection: 'row',
    gap: 8,
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: '#00FF88',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
  searchContainer: {
    padding: 20,
    paddingTop: 0,
    gap: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
  },
  activeFilter: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  filterText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#000000',
  },
  pitchesList: {
    padding: 16,
    gap: 16,
  },
  pitchCard: {
    backgroundColor: '#1E1E1E',
  },
  cardContent: {
    padding: 16,
    gap: 16,
  },
  pitchHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  pitchIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pitchInfo: {
    flex: 1,
    gap: 4,
  },
  pitchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pitchDescription: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  pitchDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#888888',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
    gap: 8,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    height: 40,
    borderColor: '#00FF88',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#00FF88',
    fontWeight: '600',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    height: 40,
    borderColor: '#00FF88',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#00FF88',
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    height: 40,
    borderColor: '#FF4444',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FF4444',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    height: 44,
    paddingHorizontal: 24,
    backgroundColor: '#00FF88',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
});