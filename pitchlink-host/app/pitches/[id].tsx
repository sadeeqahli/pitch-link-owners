import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePitchStore } from '@/store/usePitchStore';
import { Card, CardContent } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Edit, Trash, Calendar } from 'lucide-react-native';

export default function PitchDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const pitches = usePitchStore((state) => state.pitches);
  const deletePitch = usePitchStore((state) => state.deletePitch);
  const updatePitch = usePitchStore((state) => state.updatePitch);
  
  const pitch = pitches.find((p) => p.id === id);
  
  // Availability state for the calendar view
  const [viewMode, setViewMode] = useState<'details' | 'calendar'>('details');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [unavailableDays, setUnavailableDays] = useState<string[]>([]);
  
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

  // Toggle unavailable day
  const toggleUnavailableDay = (dateString: string) => {
    setUnavailableDays(prev => 
      prev.includes(dateString) 
        ? prev.filter(d => d !== dateString) 
        : [...prev, dateString]
    );
  };

  // Toggle maintenance mode
  const toggleMaintenanceMode = () => {
    const newStatus = pitch.status === 'maintenance' ? 'available' : 'maintenance';
    updatePitch(pitch.id, { status: newStatus });
  };

  // Render calendar view
  const renderCalendarView = () => {
    // Generate dates for the current month
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const dates = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Days of the week
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => {
            const newDate = new Date(selectedDate);
            newDate.setMonth(newDate.getMonth() - 1);
            setSelectedDate(newDate);
          }}>
            <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={styles.calendarMonth}>
            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
          
          <TouchableOpacity onPress={() => {
            const newDate = new Date(selectedDate);
            newDate.setMonth(newDate.getMonth() + 1);
            setSelectedDate(newDate);
          }}>
            <IconSymbol name="chevron.right" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.daysOfWeek}>
          {daysOfWeek.map(day => (
            <Text key={day} style={styles.dayOfWeek}>{day}</Text>
          ))}
        </View>
        
        <View style={styles.calendarGrid}>
          {dates.map((date, index) => {
            const isCurrentMonth = date.getMonth() === month;
            const dateString = date.toISOString().split('T')[0];
            const isUnavailable = unavailableDays.includes(dateString);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  !isCurrentMonth && styles.otherMonthDay,
                  isToday && styles.today,
                  isUnavailable && styles.unavailableDay
                ]}
                onPress={() => toggleUnavailableDay(dateString)}
                disabled={!isCurrentMonth}
              >
                <Text style={[
                  styles.calendarDayText,
                  !isCurrentMonth && styles.otherMonthDayText,
                  isToday && styles.todayText,
                  isUnavailable && styles.unavailableDayText
                ]}>
                  {date.getDate()}
                </Text>
                
                {isUnavailable && (
                  <View style={styles.unavailableIndicator} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.availableColor]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.unavailableColor]} />
            <Text style={styles.legendText}>Unavailable</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.todayColor]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render detail view
  const renderDetailView = () => (
    <>
      <Card style={styles.infoCard}>
        <CardContent style={styles.cardContent}>
          <Text style={styles.sectionTitle}>Description</Text>
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

      <Card style={styles.availabilityCard}>
        <CardContent style={styles.cardContent}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <TouchableOpacity 
              style={styles.toggleViewButton}
              onPress={() => setViewMode('calendar')}
            >
              <Calendar color="#00FF88" size={20} />
              <Text style={styles.toggleViewText}>Calendar View</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.maintenanceToggle}>
            <Text style={styles.maintenanceLabel}>Maintenance Mode</Text>
            <Switch
              value={pitch.status === 'maintenance'}
              onValueChange={toggleMaintenanceMode}
              trackColor={{ false: '#333333', true: '#00FF88' }}
              thumbColor={pitch.status === 'maintenance' ? '#FFFFFF' : '#888888'}
            />
          </View>
          
          <Text style={styles.availabilityNote}>
            Use the calendar view to mark specific days as unavailable or fully booked.
          </Text>
        </CardContent>
      </Card>
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{pitch.name}</Text>
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

      {viewMode === 'details' ? (
        <ScrollView style={styles.scrollView}>
          {renderDetailView()}
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push(`/bookings?pitchId=${id}`)}
            >
              <Text style={styles.actionButtonText}>View Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonOutline]}
              onPress={() => router.push(`/pitches/edit/${id}`)}
            >
              <Text style={styles.actionButtonTextOutline}>Edit Details</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.calendarViewContainer}>
          <View style={styles.calendarHeaderView}>
            <TouchableOpacity 
              style={styles.backToDetailsButton}
              onPress={() => setViewMode('details')}
            >
              <IconSymbol name="chevron.left" size={20} color="#00FF88" />
              <Text style={styles.backToDetailsText}>Back to Details</Text>
            </TouchableOpacity>
          </View>
          
          {renderCalendarView()}
        </View>
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
    fontSize: 24,
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
  infoCard: {
    margin: 16,
    backgroundColor: '#1E1E1E',
  },
  availabilityCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#1E1E1E',
  },
  cardContent: {
    padding: 20,
  },
  sectionHeader: {
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
  maintenanceToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    marginBottom: 16,
  },
  maintenanceLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  availabilityNote: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginTop: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#00FF88',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonOutline: {
    backgroundColor: 'transparent',
    borderColor: '#00FF88',
    borderWidth: 1,
  },
  actionButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
  actionButtonTextOutline: {
    color: '#00FF88',
  },
  toggleViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderRadius: 8,
  },
  toggleViewText: {
    color: '#00FF88',
    fontWeight: '600',
  },
  calendarViewContainer: {
    flex: 1,
  },
  calendarHeaderView: {
    padding: 20,
    paddingBottom: 0,
  },
  backToDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backToDetailsText: {
    color: '#00FF88',
    fontWeight: '600',
  },
  calendarContainer: {
    flex: 1,
    padding: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarMonth: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  daysOfWeek: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayOfWeek: {
    flex: 1,
    textAlign: 'center',
    color: '#888888',
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  today: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    borderRadius: 20,
  },
  unavailableDay: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    borderRadius: 20,
  },
  calendarDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  otherMonthDayText: {
    color: '#888888',
  },
  todayText: {
    color: '#00FF88',
  },
  unavailableDayText: {
    color: '#FF4444',
  },
  unavailableIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF4444',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  availableColor: {
    backgroundColor: '#00FF88',
  },
  unavailableColor: {
    backgroundColor: '#FF4444',
  },
  todayColor: {
    backgroundColor: '#00FF88',
  },
  legendText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});