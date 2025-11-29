import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePaymentStore } from '@/store/usePaymentStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/dateUtils';

export default function PaymentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const payments = usePaymentStore((state: any) => state.payments);
  
  const payment = payments.find((p: any) => p.id === id);
  
  if (!payment) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.title}>Payment not found</Text>
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Payment Details</Text>
        </View>

        <Card style={styles.infoCard}>
          <CardContent style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Payment ID:</Text>
              <Text style={styles.value}>#{payment.id.substring(0, 8)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Amount:</Text>
              <Text style={styles.price}>${payment.amount.toFixed(2)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Status:</Text>
              <View style={[
                styles.statusBadge,
                payment.status === 'pending' && styles.statusPending,
                payment.status === 'paid' && styles.statusPaid,
                payment.status === 'failed' && styles.statusFailed,
                payment.status === 'refunded' && styles.statusRefunded,
              ]}>
                <Text style={styles.statusText}>{payment.status}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Payment Method:</Text>
              <Text style={styles.value}>
                {payment.paymentMethod.charAt(0).toUpperCase() + payment.paymentMethod.slice(1)}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Transaction ID:</Text>
              <Text style={styles.value}>
                {payment.transactionId || 'N/A'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>
                {formatDate(new Date(payment.createdAt))}
              </Text>
            </View>
          </CardContent>
        </Card>

        <View style={styles.actionsContainer}>
          <Button style={styles.actionButton} variant="default">
            <Text style={styles.actionButtonText}>Process Payment</Text>
          </Button>
          <Button style={styles.actionButton} variant="outline">
            <Text style={styles.actionButtonText}>Issue Refund</Text>
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
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
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
  statusPending: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
  },
  statusPaid: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  statusFailed: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
  },
  statusRefunded: {
    backgroundColor: 'rgba(100, 100, 255, 0.2)',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00FF88',
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