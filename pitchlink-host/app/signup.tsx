import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// African countries and states data
const AFRICAN_COUNTRIES = [
  { 
    code: 'NG', 
    name: 'Nigeria', 
    states: ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT']
  },
  { 
    code: 'KE', 
    name: 'Kenya', 
    states: ['Central', 'Coast', 'Eastern', 'Nairobi', 'North Eastern', 'Nyanza', 'Rift Valley', 'Western']
  },
  { 
    code: 'ZA', 
    name: 'South Africa', 
    states: ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape']
  },
  { 
    code: 'GH', 
    name: 'Ghana', 
    states: ['Ashanti', 'Brong-Ahafo', 'Central', 'Eastern', 'Greater Accra', 'Northern', 'Upper East', 'Upper West', 'Volta', 'Western']
  },
  { 
    code: 'EG', 
    name: 'Egypt', 
    states: ['Alexandria', 'Aswan', 'Cairo', 'Giza', 'Luxor', 'Port Said', 'Suez', 'Red Sea', 'Beheira', 'Minya', 'Qena', 'Sohag', 'Beni Suef', 'Dakahlia', 'Damietta', 'Faiyum', 'Gharbia', 'Ismailia', 'Kafr El Sheikh', 'Matrouh', 'Menofia', 'Monufia', 'New Valley', 'North Sinai', 'Qalyubia', 'Sharqia', 'South Sinai']
  },
  { 
    code: 'ET', 
    name: 'Ethiopia', 
    states: ['Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Dire Dawa', 'Gambela', 'Harari', 'Oromia', 'Somali', 'Southern Nations', 'Tigray']
  },
  { 
    code: 'TZ', 
    name: 'Tanzania', 
    states: ['Arusha', 'Dar es Salaam', 'Dodoma', 'Geita', 'Iringa', 'Kagera', 'Katavi', 'Kigoma', 'Kilimanjaro', 'Lindi', 'Manyara', 'Mara', 'Mbeya', 'Morogoro', 'Mtwara', 'Mwanza', 'Njombe', 'Pemba North', 'Pemba South', 'Pwani', 'Rukwa', 'Ruvuma', 'Shinyanga', 'Simiyu', 'Singida', 'Songwe', 'Tabora', 'Tanga', 'Unguja North', 'Unguja South']
  },
  { 
    code: 'UG', 
    name: 'Uganda', 
    states: ['Central', 'Eastern', 'Northern', 'Western', 'Kampala']
  },
  { 
    code: 'DZ', 
    name: 'Algeria', 
    states: ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Djelfa', 'Sétif', 'Sidi Bel Abbès', 'Biskra', 'Tébessa', 'El Oued', 'Tlemcen', 'Tiaret', 'Béjaïa', 'Tizi Ouzou', 'Chlef', 'Souk Ahras', 'Mostaganem', 'Medea', 'Guelma', 'Ouargla', 'Khenchela', 'Saïda', 'Mascara', 'Jijel', 'Bordj Bou Arréridj', 'Skikda', 'El Bayadh', 'Illizi', 'Boumerdès', 'Relizane', 'Tipaza', 'Adrar', 'Tindouf', 'Naama', 'Aïn Defla', 'Aïn Témouchent', 'Ghardaïa', 'Mila', 'Oum El Bouaghi', 'Khenchela']
  },
  { 
    code: 'SD', 
    name: 'Sudan', 
    states: ['Khartoum', 'North Kordofan', 'West Kordofan', 'South Kordofan', 'White Nile', 'Blue Nile', 'Northern', 'River Nile', 'Kassala', 'Red Sea', 'Al Jazirah', 'Sennar', 'North Darfur', 'West Darfur', 'South Darfur', 'East Darfur', 'Central Darfur']
  },
  { 
    code: 'MA', 
    name: 'Morocco', 
    states: ['Casablanca-Settat', 'Rabat-Salé-Kénitra', 'Fès-Meknès', 'Marrakech-Safi', 'Tanger-Tétouan-Al Hoceïma', 'Oriental', 'Souss-Massa', 'Drâa-Tafilalet', 'Béni Mellal-Khénifra', 'Guelmim-Oued Noun', 'Laâyoune-Sakia El Hamra', 'Dakhla-Oued Ed-Dahab']
  },
  { 
    code: 'AO', 
    name: 'Angola', 
    states: ['Luanda', 'Huambo', 'Benguela', 'Huíla', 'Kwanza Norte', 'Kwanza Sul', 'Namibe', 'Moxico', 'Bié', 'Cabinda', 'Uíge', 'Zaire', 'Malanje', 'Lunda Norte', 'Lunda Sul', 'Bengo', 'Cuando Cubango', 'Cuanza Norte']
  },
  { 
    code: 'CM', 
    name: 'Cameroon', 
    states: ['Adamaoua', 'Centre', 'East', 'Far North', 'Littoral', 'North', 'Northwest', 'South', 'Southwest', 'West']
  },
  { 
    code: 'CI', 
    name: 'Côte d\'Ivoire', 
    states: ['Abidjan', 'Bas-Sassandra', 'Comoé', 'Denguélé', 'Gôh-Djiboua', 'Lacs', 'Lagunes', 'Montagnes', 'Sassandra-Marahoué', 'Savanes', 'Vallée du Bandama', 'Woroba', 'Yamoussoukro', 'Zanzan']
  },
  { 
    code: 'MW', 
    name: 'Malawi', 
    states: ['Central Region', 'Northern Region', 'Southern Region']
  }
];

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [numberOfPitches, setNumberOfPitches] = useState('');
  const [ownerType, setOwnerType] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [filteredStates, setFilteredStates] = useState<string[]>([]);
  
  const register = useAuthStore((state: any) => state.register);

  const handleSignup = async () => {
    // Validate all required fields
    if (!name || !businessName || !email || !phone || !password || !confirmPassword || 
        !country || !state || !numberOfPitches || !ownerType) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    // Validate phone number (simple validation)
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    
    // Validate passwords
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    
    // Validate number of pitches
    const pitches = parseInt(numberOfPitches);
    if (isNaN(pitches) || pitches <= 0) {
      Alert.alert('Error', 'Please enter a valid number of pitches');
      return;
    }
    
    setLoading(true);
    try {
      // Pass all user data to the register function (without country)
      const success = await register({
        name,
        email,
        phone,
        password,
        location: state,
        businessName,
        numberOfPitches,
        ownerType,
      });
      
      if (success) {
        Alert.alert('Success', 'Account created successfully', [
          { text: 'OK', onPress: () => router.push('/verification') }
        ]);
      } else {
        Alert.alert('Error', 'Signup failed. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo at the top */}
        <View style={styles.logoContainerTop}>
          <Text style={styles.logoText}>PitchLink</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join PitchLink to manage your pitches</Text>
          
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Full Name *"
              placeholderTextColor="#888888"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email *"
              placeholderTextColor="#888888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone Number *"
              placeholderTextColor="#888888"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            
            <Text style={styles.sectionTitle}>Business Information</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Business/Pitch Name *"
              placeholderTextColor="#888888"
              value={businessName}
              onChangeText={setBusinessName}
            />
            
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowCountryDropdown(!showCountryDropdown)}>
              <Text style={{ color: country ? '#FFFFFF' : '#888888' }}>
                {country ? country : 'Country *'}
              </Text>
            </TouchableOpacity>
            {showCountryDropdown && (
              <View style={styles.dropdownList}>
                {AFRICAN_COUNTRIES.map((c) => (
                  <TouchableOpacity key={c.code} style={styles.dropdownItem} onPress={() => {
                    setCountry(c.name);
                    setFilteredStates(c.states);
                    setState(''); // Reset state selection when country changes
                    setShowCountryDropdown(false);
                  }}>
                    <Text style={{ color: '#FFFFFF' }}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {country ? (
              <TouchableOpacity style={styles.dropdown} onPress={() => setShowStateDropdown(!showStateDropdown)}>
                <Text style={{ color: state ? '#FFFFFF' : '#888888' }}>
                  {state ? state : 'State *'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.dropdown, { opacity: 0.5 }]}>
                <Text style={{ color: '#888888' }}>State *</Text>
              </View>
            )}
            {showStateDropdown && country && (
              <View style={styles.dropdownList}>
                {filteredStates.map((s) => (
                  <TouchableOpacity key={s} style={styles.dropdownItem} onPress={() => {
                    setState(s);
                    setShowStateDropdown(false);
                  }}>
                    <Text style={{ color: '#FFFFFF' }}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Number of Pitches *"
              placeholderTextColor="#888888"
              value={numberOfPitches}
              onChangeText={setNumberOfPitches}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Owner Type *"
              placeholderTextColor="#888888"
              value={ownerType}
              onChangeText={setOwnerType}
            />
            
            <Text style={styles.sectionTitle}>Account Security</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Password *"
              placeholderTextColor="#888888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <TextInput
              style={styles.input}
              placeholder="Confirm Password *"
              placeholderTextColor="#888888"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            
            <Button 
              style={styles.signupButton} 
              variant="default"
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.signupButtonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </Button>
            
            <Button 
              style={styles.loginButton} 
              variant="outline"
              onPress={() => router.push('/login')}
            >
              <Text style={styles.loginButtonText}>Already have an account? Log in</Text>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
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
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00FF88',
    marginTop: 10,
    marginBottom: 10,
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
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#1E1E1E',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    marginTop: 5,
  },
  dropdownItem: {
    padding: 12,
  },
  logoContainerTop: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00FF88',
  },
  signupButton: {
    height: 50,
    marginTop: 10,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  loginButton: {
    height: 50,
    borderColor: '#00FF88',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#00FF88',
    fontWeight: '600',
    fontSize: 16,
  },
});