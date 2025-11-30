import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePaymentStore } from '@/store/usePaymentStore';
import { useBookingStore } from '@/store/useBookingStore';
import { usePitchStore } from '@/store/usePitchStore';
import { Card, CardContent } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ReceiptsScreen() {
  const router = useRouter();
  const payments = usePaymentStore((state) => state.payments);
  const bookings = useBookingStore((state) => state.bookings);
  const pitches = usePitchStore((state) => state.pitches);
  
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [filterByPitch, setFilterByPitch] = useState<string>('all');
  
  // Filter only paid player app payments
  const playerAppPayments = payments.filter(payment => payment.status === 'paid' && payment.source === 'player-app');
  
  // Get unique pitches from bookings
  const bookingPitches = [...new Set(bookings.map(booking => booking.pitchId))];
  const availablePitches = pitches.filter(pitch => bookingPitches.includes(pitch.id));
  
  // Sort and filter payments
  const sortedFilteredPayments = [...playerAppPayments]
    .filter(payment => {
      if (filterByPitch === 'all') return true;
      const booking = bookings.find(b => b.id === payment.bookingId);
      return booking?.pitchId === filterByPitch;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return b.amount - a.amount;
      }
    });
  
  // Get pitch name by ID
  const getPitchName = (pitchId: string) => {
    const pitch = pitches.find(p => p.id === pitchId);
    return pitch ? pitch.name : 'Unknown Pitch';
  };
  
  // Get customer name by booking ID
  const getCustomerName = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    return booking ? booking.customerName : 'Unknown Customer';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Receipts</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Sort by:</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity 
              style={[styles.filterButton, sortBy === 'date' && styles.activeFilter]}
              onPress={() => setSortBy('date')}
            >
              <Text style={[styles.filterText, sortBy === 'date' && styles.activeFilterText]}>
                Date
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, sortBy === 'amount' && styles.activeFilter]}
              onPress={() => setSortBy('amount')}
            >
              <Text style={[styles.filterText, sortBy === 'amount' && styles.activeFilterText]}>
                Amount
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Pitch:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pitchFilterScroll}>
            <View style={styles.pitchFilters}>
              <TouchableOpacity 
                style={[styles.pitchFilter, filterByPitch === 'all' && styles.activePitchFilter]}
                onPress={() => setFilterByPitch('all')}
              >
                <Text style={[styles.pitchFilterText, filterByPitch === 'all' && styles.activePitchFilterText]}>
                  All
                </Text>
              </TouchableOpacity>
              {availablePitches.map(pitch => (
                <TouchableOpacity 
                  key={pitch.id}
                  style={[styles.pitchFilter, filterByPitch === pitch.id && styles.activePitchFilter]}
                  onPress={() => setFilterByPitch(pitch.id)}
                >
                  <Text style={[styles.pitchFilterText, filterByPitch === pitch.id && styles.activePitchFilterText]}>
                    {pitch.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
      
      {sortedFilteredPayments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="doc.text" size={64} color="#333333" />
          <Text style={styles.emptyText}>No receipts found</Text>
          <Text style={styles.emptySubtext}>Player app payments will appear here</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.receiptsContainer}>
            {sortedFilteredPayments.map((payment) => {
              const booking = bookings.find(b => b.id === payment.bookingId);
              const pitch = booking ? pitches.find(p => p.id === booking.pitchId) : null;
              
              return (
                <Card key={payment.id} style={styles.receiptCard}>
                  <CardContent style={styles.receiptCardContent}>
                    <View style={styles.receiptHeader}>
                      <View>
                        <Text style={styles.receiptId}>Payment ID: {payment.id.substring(0, 8)}</Text>
                        <Text style={styles.customerName}>{getCustomerName(payment.bookingId)}</Text>
                      </View>
                      <View style={styles.amountContainer}>
                        <Text style={styles.amount}>₦{(payment.amount * 0.9).toFixed(2)}</Text>
                        <Text style={styles.originalAmount}>₦{payment.amount.toFixed(2)}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.receiptDetails}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Pitch:</Text>
                        <Text style={styles.detailValue}>{pitch ? pitch.name : 'Unknown'}</Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Date:</Text>
                        <Text style={styles.detailValue}>
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Time:</Text>
                        <Text style={styles.detailValue}>
                          {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Payment Type:</Text>
                        <Text style={styles.detailValue}>
                          {payment.paymentMethod === 'card' ? 'Card Payment' : 
                           payment.paymentMethod === 'transfer' ? 'Bank Transfer' : 'Cash'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.receiptFooter}>
                      <View style={styles.sourceBadge}>
                        <Text style={styles.sourceText}>
                          {payment.source === 'player-app' ? 'Player App Payment' : 'Manual Booking'}
                        </Text>
                      </View>
                      <TouchableOpacity style={styles.downloadButton}>
                        <IconSymbol name="arrow.down" size={16} color="#00FF88" />
                        <Text style={styles.downloadText}>Download</Text>
                      </TouchableOpacity>
                    </View>
                  </CardContent>
                </Card>
              );
            })}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 24,
  },
  filtersContainer: {
    padding: 16,
    gap: 16,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
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
  pitchFilterScroll: {
    flexGrow: 0,
  },
  pitchFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  pitchFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    minWidth: 60,
    alignItems: 'center',
  },
  activePitchFilter: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  pitchFilterText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  activePitchFilterText: {
    color: '#000000',
  },
  receiptsContainer: {
    padding: 16,
    gap: 16,
  },
  receiptCard: {
    backgroundColor: '#1E1E1E',
  },
  receiptCardContent: {
    padding: 16,
    gap: 16,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptId: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00FF88',
  },
  originalAmount: {
    fontSize: 12,
    color: '#888888',
    textDecorationLine: 'line-through',
  },
  receiptDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: '#888888',
  },
  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  receiptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  sourceBadge: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sourceText: {
    fontSize: 12,
    color: '#00FF88',
    fontWeight: '600',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderRadius: 4,
  },
  downloadText: {
    fontSize: 12,
    color: '#00FF88',
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
  },
});