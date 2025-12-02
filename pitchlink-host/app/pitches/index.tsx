import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput, Alert, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePitchStore } from '@/store/usePitchStore';
import { Card, CardContent } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Plus, Edit, Trash, Search, BarChart } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PitchesScreen() {
  const router = useRouter();
  const pitches = usePitchStore((state) => state.pitches);
  const searchPitches = usePitchStore((state) => state.searchPitches);
  const updatePitch = usePitchStore((state) => state.updatePitch);
  const deletePitch = usePitchStore((state) => state.deletePitch);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [businessStatus, setBusinessStatus] = useState<'not_started' | 'incomplete' | 'under_review' | 'approved' | 'rejected'>('not_started');
  const [currentImageIndices, setCurrentImageIndices] = useState<Record<string, number>>({}); // Track current image for each pitch

  // Load business verification status
  useEffect(() => {
    loadBusinessStatus();
  }, []);

  // Load pitches
  useEffect(() => {
    usePitchStore.getState().loadPitches();
  }, []);

  // Debug log to see what pitches are loaded
  useEffect(() => {
    console.log('Loaded pitches:', pitches);
    // Log images for each pitch
    pitches.forEach(pitch => {
      console.log(`Pitch ${pitch.id}:`, {
        name: pitch.name,
        hasImages: !!pitch.images,
        imagesCount: pitch.images ? pitch.images.length : 0,
        images: pitch.images,
        hasImageUrl: !!pitch.imageUrl,
        imageUrl: pitch.imageUrl
      });
    });
  }, [pitches]);

  const loadBusinessStatus = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('businessSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setBusinessStatus(settings.businessStatus || 'not_started');
      }
    } catch (error) {
      console.log('Error loading business settings:', error);
    }
  };

  const handleAddPitch = () => {
    // Check business verification status before allowing to add pitch
    if (businessStatus !== 'approved') {
      showVerificationBlockingModal();
      return;
    }
    
    router.push('/pitches/add');
  };

  const showVerificationBlockingModal = () => {
    Alert.alert(
      'Business Verification Required',
      'Your business is not yet verified. Complete your Business Settings to start listing pitches.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Complete Verification',
          onPress: () => router.push('/profile/business-settings'),
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeletePitch = (id: string) => {
    Alert.alert(
      'Delete Pitch',
      'Are you sure you want to delete this pitch? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePitch(id);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Toggle pitch status between available and maintenance
  const togglePitchStatus = (id: string, currentStatus: 'available' | 'maintenance') => {
    const newStatus = currentStatus === 'available' ? 'maintenance' : 'available';
    updatePitch(id, { status: newStatus });
  };

  // Filter and search pitches
  const filteredPitches = useMemo(() => {
    return searchQuery ? searchPitches(searchQuery) : pitches;
  }, [pitches, searchQuery, searchPitches]);

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const totalPitches = pitches.length;
    const availablePitches = pitches.filter(p => p.status === 'available').length;
    const maintenancePitches = pitches.filter(p => p.status === 'maintenance').length;
    
    return {
      totalPitches,
      availablePitches,
      maintenancePitches,
    };
  }, [pitches]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Pitches</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddPitch}
        >
          <Plus color="#FFFFFF" size={20} />
          <Text style={styles.addButtonText}>Add Pitch</Text>
        </TouchableOpacity>
      </View>

      {/* Analytics Summary Cards */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.analyticsScroll}
        contentContainerStyle={styles.analyticsContainer}
      >
        <Card style={styles.analyticsCard}>
          <CardContent style={styles.analyticsCardContent}>
            <Text style={styles.analyticsValue}>{analyticsData.totalPitches}</Text>
            <Text style={styles.analyticsLabel}>Total Pitches</Text>
          </CardContent>
        </Card>
        
        <Card style={styles.analyticsCard}>
          <CardContent style={styles.analyticsCardContent}>
            <Text style={styles.analyticsValue}>{analyticsData.availablePitches}</Text>
            <Text style={styles.analyticsLabel}>Available</Text>
          </CardContent>
        </Card>
        
        <Card style={styles.analyticsCard}>
          <CardContent style={styles.analyticsCardContent}>
            <Text style={styles.analyticsValue}>{analyticsData.maintenancePitches}</Text>
            <Text style={styles.analyticsLabel}>Maintenance</Text>
          </CardContent>
        </Card>
      </ScrollView>

      {/* Search */}
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
            onPress={handleAddPitch}
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
                  
                  {/* Pitch Image Gallery */}
                  {pitch.images && pitch.images.length > 0 && (
                    <View style={styles.pitchImageContainer}>
                      <ScrollView 
                        horizontal 
                        pagingEnabled 
                        showsHorizontalScrollIndicator={false}
                        style={styles.pitchImageGallery}
                        contentContainerStyle={{ flexDirection: 'row' }}
                        onScroll={(event) => {
                          const offsetX = event.nativeEvent.contentOffset.x;
                          const containerWidth = event.nativeEvent.layoutMeasurement.width;
                          const index = Math.round(offsetX / containerWidth);
                          setCurrentImageIndices(prev => ({
                            ...prev,
                            [pitch.id]: index
                          }));
                        }}
                        scrollEventThrottle={16}
                      >
                        {pitch.images.map((image, index) => (
                          <View key={index} style={{ width: Dimensions.get('window').width - 64, height: '100%' }}>
                            <Image 
                              source={{ uri: image }} 
                              style={styles.pitchImage} 
                              resizeMode="cover"
                              onError={(error) => console.log('Image load error for pitch', pitch.id, 'image', image, ':', error)}
                              onLoad={() => console.log('Image loaded successfully for pitch', pitch.id, 'image', image)}
                            />
                          </View>
                        ))}
                      </ScrollView>
                      {pitch.images.length > 1 && (
                        <View style={styles.indicatorContainer}>
                          {pitch.images.map((_, index) => (
                            <View 
                              key={index} 
                              style={[
                                styles.indicator,
                                index === (currentImageIndices[pitch.id] || 0) && styles.activeIndicator
                              ]} 
                            />
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                  
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
                    
                    {/* Touchable Status - Toggles between available and maintenance */}
                    <TouchableOpacity 
                      style={styles.detailRow}
                      onPress={() => togglePitchStatus(pitch.id, pitch.status)}
                    >
                      <Text style={styles.detailLabel}>Status:</Text>
                      <View style={[
                        styles.statusBadge,
                        pitch.status === 'available' && styles.statusAvailable,
                        pitch.status === 'maintenance' && styles.statusMaintenance,
                      ]}>
                        <Text style={styles.statusText}>{pitch.status}</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.cardActions}>
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => router.push(`/pitches/${pitch.id}`)}
                    >
                      <BarChart color="#00FF88" size={16} />
                      <Text style={styles.viewButtonText}>Analytics</Text>
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
  analyticsScroll: {
    flexGrow: 0,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  analyticsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  analyticsCard: {
    backgroundColor: '#1E1E1E',
    minWidth: 120,
  },
  analyticsCardContent: {
    padding: 16,
    alignItems: 'center',
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FF88',
  },
  analyticsLabel: {
    fontSize: 14,
    color: '#888888',
    marginTop: 4,
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
  pitchesList: {
    padding: 11,
    gap: 20,
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
  pitchImageContainer: {
    height: 200, // Increased from 150 to 200
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  pitchImageGallery: {
    width: '100%',
    height: '100%',
  },
  pitchImageWrapper: {
    height: '100%',
  },
  pitchImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 3,
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
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