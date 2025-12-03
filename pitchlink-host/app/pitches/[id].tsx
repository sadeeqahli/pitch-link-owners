import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePitchStore } from '@/store/usePitchStore';
import { Card, CardContent } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Edit, Trash, BarChart } from 'lucide-react-native';

export default function PitchAnalyticsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const pitches = usePitchStore((state) => state.pitches);
  const deletePitch = usePitchStore((state) => state.deletePitch);
  const updatePitch = usePitchStore((state) => state.updatePitch);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const pitch = pitches.find((p) => p.id === id);
  
  // Reset current image index when images change
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [pitch?.images]);

  if (!pitch) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.title}>Pitch not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
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

  // Toggle maintenance mode
  const toggleMaintenanceMode = () => {
    const newStatus = pitch.status === 'maintenance' ? 'available' : 'maintenance';
    updatePitch(pitch.id, { status: newStatus });
  };

  // Mock analytics data - in a real app this would come from actual booking data
  const analyticsData = {
    totalBookings: 24,
    revenue: 48000,
    avgBookingDuration: 1.5,
    utilizationRate: 65,
    peakHours: ['18:00', '19:00', '20:00'],
    popularDays: ['Saturday', 'Sunday', 'Friday']
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{pitch.name} Analytics</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => router.push(`/pitches/edit/${id}`)}
          >
            <Edit color="#00FF88" size={20} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Trash color="#FF4444" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Image Gallery */}
        {pitch.images && pitch.images.length > 0 && (
          <View style={styles.imageGalleryContainer}>
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              style={styles.imageGallery}
              onScroll={(event) => {
                const offsetX = event.nativeEvent.contentOffset.x;
                const containerWidth = Dimensions.get('window').width - 32;
                const index = Math.round(offsetX / containerWidth);
                setCurrentImageIndex(index);
              }}
              scrollEventThrottle={16}
            >
              {pitch.images.map((image, index) => (
                <View key={index} style={{ width: Dimensions.get('window').width - 32, height: 300 }}>
                  <Image 
                    source={{ uri: image }} 
                    style={{ width: '100%', height: '100%' }} 
                    resizeMode="cover"
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
                      index === currentImageIndex && styles.activeIndicator
                    ]} 
                  />
                ))}
              </View>
            )}
          </View>
        )}
        
        {/* Status Toggle */}
        <Card style={styles.statusCard}>
          <CardContent style={styles.cardContent}>
            <View style={styles.statusHeader}>
              <Text style={styles.sectionTitle}>Pitch Status</Text>
              <TouchableOpacity 
                style={styles.toggleStatusButton}
                onPress={toggleMaintenanceMode}
              >
                <Text style={styles.toggleStatusText}>
                  {pitch.status === 'maintenance' ? 'Set Available' : 'Set Maintenance'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.statusInfo}>
              <View style={[
                styles.statusBadge,
                pitch.status === 'available' && styles.statusAvailable,
                pitch.status === 'maintenance' && styles.statusMaintenance,
              ]}>
                <Text style={styles.statusText}>{pitch.status}</Text>
              </View>
              <Text style={styles.statusDescription}>
                {pitch.status === 'maintenance' 
                  ? 'Pitch is currently under maintenance and not available for bookings.'
                  : 'Pitch is available for bookings.'}
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Analytics Summary */}
        <Card style={styles.analyticsCard}>
          <CardContent style={styles.cardContent}>
            <Text style={styles.sectionTitle}>Performance Overview</Text>
            
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>{analyticsData.totalBookings}</Text>
                <Text style={styles.analyticsLabel}>Total Bookings</Text>
              </View>
              
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>₦{analyticsData.revenue.toLocaleString()}</Text>
                <Text style={styles.analyticsLabel}>Revenue</Text>
              </View>
              
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>{analyticsData.utilizationRate}%</Text>
                <Text style={styles.analyticsLabel}>Utilization</Text>
              </View>
              
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>{analyticsData.avgBookingDuration}h</Text>
                <Text style={styles.analyticsLabel}>Avg Duration</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Detailed Analytics */}
        <Card style={styles.detailCard}>
          <CardContent style={styles.cardContent}>
            <Text style={styles.sectionTitle}>Detailed Insights</Text>
            
            <View style={styles.insightSection}>
              <Text style={styles.insightTitle}>Peak Hours</Text>
              <View style={styles.tagsContainer}>
                {analyticsData.peakHours.map((hour, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{hour}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.insightSection}>
              <Text style={styles.insightTitle}>Popular Days</Text>
              <View style={styles.tagsContainer}>
                {analyticsData.popularDays.map((day, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{day}</Text>
                  </View>
                ))}
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Pitch Info */}
        <Card style={styles.infoCard}>
          <CardContent style={styles.cardContent}>
            <Text style={styles.sectionTitle}>Pitch Information</Text>
            <Text style={styles.description}>{pitch.description}</Text>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Price per hour:</Text>
                <Text style={styles.value}>₦{pitch.pricePerHour.toFixed(2)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Size:</Text>
                <Text style={styles.value}>{pitch.size}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Surface Type:</Text>
                <Text style={styles.value}>{pitch.surfaceType}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Location:</Text>
                <Text style={styles.value}>{pitch.location}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Created:</Text>
                <Text style={styles.value}>
                  {new Date(pitch.createdAt).toLocaleDateString()}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Last Updated:</Text>
                <Text style={styles.value}>
                  {new Date(pitch.updatedAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
            
            {pitch.amenities && pitch.amenities.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Amenities</Text>
                <View style={styles.amenitiesContainer}>
                  {pitch.amenities.map((amenity, index) => (
                    <View key={index} style={styles.amenityTag}>
                      <Text style={styles.amenityTagText}>{amenity}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    height: 44,
    paddingHorizontal: 24,
    backgroundColor: '#00FF88',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
  statusCard: {
    margin: 16,
    backgroundColor: '#1E1E1E',
  },
  analyticsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#1E1E1E',
  },
  detailCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#1E1E1E',
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#1E1E1E',
  },
  cardContent: {
    padding: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  toggleStatusButton: {
    padding: 8,
    backgroundColor: '#00FF88',
    borderRadius: 6,
  },
  toggleStatusText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 14,
  },
  statusInfo: {
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  statusDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticsItem: {
    width: '48%',
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00FF88',
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 14,
    color: '#888888',
  },
  insightSection: {
    marginBottom: 20,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#333333',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 24,
    lineHeight: 24,
  },
  infoGrid: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#888888',
  },
  value: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityTag: {
    backgroundColor: '#333333',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  amenityTagText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  imageGalleryContainer: {
    width: '100%',
    height: 300,
    marginBottom: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageGallery: {
    width: '100%',
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },

  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#888888',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#00FF88',
    width: 12,
    height: 12,
    borderRadius: 6,
  },

});
