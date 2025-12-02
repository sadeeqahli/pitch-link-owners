import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';

export default function VerificationScreen() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Create refs for each input field
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Countdown timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setTimeout> | null = null;
    if (timer > 0) {
      interval = setTimeout(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setResendDisabled(false);
    }
    
    return () => {
      if (interval) clearTimeout(interval);
    };
  }, [timer]);

  const handleCodeChange = (text: string, index: number) => {
    // Allow only numeric input
    if (isNaN(Number(text)) && text !== '') return;
    
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    
    // Move to next input if a digit is entered
    if (text !== '' && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace key
    if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }
    
    setLoading(true);
    try {
      // In a real app, this would call your API to verify the code
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, accept any 6-digit code
      Alert.alert('Success', 'Verification successful!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    // Reset timer
    setTimer(30);
    setResendDisabled(true);
    
    // In a real app, this would call your API to resend the code
    Alert.alert('Success', 'Verification code resent to your email/phone');
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Verify Your Account</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to your email/phone
          </Text>
          
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <View key={index} style={styles.codeInputContainer}>
                <TextInput
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={styles.codeInput}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  maxLength={1}
                  keyboardType="numeric"
                  textAlign="center"
                  autoFocus={index === 0}
                />
              </View>
            ))}
          </View>
          
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              Resend code in <Text style={styles.timerValue}>{timer}s</Text>
            </Text>
          </View>
          
          <Button 
            style={styles.submitButton} 
            variant="default"
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Verifying...' : 'Verify Account'}
            </Text>
          </Button>
          
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <TouchableOpacity 
              onPress={handleResendCode} 
              disabled={resendDisabled}
            >
              <Text style={[styles.resendLink, resendDisabled && styles.resendLinkDisabled]}>
                Resend Code
              </Text>
            </TouchableOpacity>
          </View>
          
          <Button 
            style={styles.backButton} 
            variant="outline"
            onPress={handleBackToLogin}
          >
            <Text style={styles.backButtonText}>Back to Login</Text>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 30,
  },
  codeInputContainer: {
    width: 50,
    height: 60,
  },
  codeInput: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  timerContainer: {
    marginBottom: 30,
  },
  timerText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  timerValue: {
    color: '#00FF88',
    fontWeight: 'bold',
  },
  submitButton: {
    height: 50,
    width: '100%',
    maxWidth: 300,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginRight: 8,
  },
  resendLink: {
    fontSize: 16,
    color: '#00FF88',
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: '#888888',
  },
  backButton: {
    height: 50,
    borderColor: '#00FF88',
    width: '100%',
    maxWidth: 300,
  },
  backButtonText: {
    color: '#00FF88',
    fontWeight: '600',
    fontSize: 16,
  },
});