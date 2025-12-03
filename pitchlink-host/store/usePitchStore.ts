import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Pitch {
  id: string;
  name: string;
  description: string;
  pricePerHour: number;
  imageUrl?: string;
  images?: string[]; // Add support for multiple images
  status: 'available' | 'maintenance'; // Remove 'booked' status
  amenities: string[];
  size: '5-a-side' | '7-a-side' | '9-a-side'; // Updated to use specific pitch sizes
  surfaceType: 'grass' | 'artificial' | 'concrete' | 'other';
  location: string;
  createdAt: Date;
  updatedAt: Date;
  // Availability features
  availability?: {
    [day: string]: {
      available: boolean;
      startTime: string;
      endTime: string;
    };
  };
  unavailableDates?: string[]; // ISO date strings
}

interface PitchState {
  pitches: Pitch[];
  addPitch: (pitchData: Omit<Pitch, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePitch: (id: string, updates: Partial<Pitch>) => void;
  deletePitch: (id: string) => void;
  loadPitches: () => Promise<void>;
  savePitches: () => Promise<void>;
  getPitchesByStatus: (status: Pitch['status']) => Pitch[];
  searchPitches: (query: string) => Pitch[];
  // New methods for availability
  updatePitchAvailability: (id: string, availability: Pitch['availability']) => void;
  markDateAsUnavailable: (id: string, date: string) => void;
  markDateAsAvailable: (id: string, date: string) => void;
}

export const usePitchStore = create<PitchState>()((set, get) => ({
  pitches: [], // Always initialize with empty array
  
  addPitch: (pitchData: Omit<Pitch, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPitch: Pitch = {
      id: Date.now().toString(),
      ...pitchData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => {
      const updatedPitches = [...state.pitches, newPitch];
      // Save to AsyncStorage
      AsyncStorage.setItem('pitches', JSON.stringify(updatedPitches));
      return { pitches: updatedPitches };
    });
  },
  
  updatePitch: (id: string, updates: Partial<Pitch>) => {
    set((state) => {
      const updatedPitches = state.pitches.map((pitch) => 
        pitch.id === id ? { ...pitch, ...updates, updatedAt: new Date() } : pitch
      );
      // Save to AsyncStorage
      AsyncStorage.setItem('pitches', JSON.stringify(updatedPitches));
      return { pitches: updatedPitches };
    });
  },
  
  deletePitch: (id: string) => {
    set((state) => {
      const updatedPitches = state.pitches.filter((pitch) => pitch.id !== id);
      // Save to AsyncStorage
      AsyncStorage.setItem('pitches', JSON.stringify(updatedPitches));
      return { pitches: updatedPitches };
    });
  },
  
  loadPitches: async () => {
    try {
      const storedPitches = await AsyncStorage.getItem('pitches');
      if (storedPitches) {
        const parsedPitches = JSON.parse(storedPitches).map((pitch: any) => ({
          ...pitch,
          // Ensure all required fields are present with default values if missing
          amenities: pitch.amenities || [],
          size: pitch.size || '',
          surfaceType: pitch.surfaceType || 'grass',
          location: pitch.location || '',
          createdAt: new Date(pitch.createdAt),
          updatedAt: new Date(pitch.updatedAt),
          availability: pitch.availability || {},
          unavailableDates: pitch.unavailableDates || [],
          images: pitch.images || [], // Ensure images array is properly initialized
        }));
        set({ pitches: parsedPitches });
      }
      // If no pitches found, state remains with empty array (already initialized)
    } catch (error) {
      console.log('Error loading pitches:', error);
      // State remains with empty array (already initialized)
    }
  },
  
  savePitches: async () => {
    try {
      const { pitches } = get();
      await AsyncStorage.setItem('pitches', JSON.stringify(pitches));
    } catch (error) {
      console.log('Error saving pitches:', error);
    }
  },
  
  getPitchesByStatus: (status: Pitch['status']) => {
    const { pitches } = get();
    return pitches.filter(pitch => pitch.status === status);
  },
  
  searchPitches: (query: string) => {
    const { pitches } = get();
    if (!query) return pitches;
    
    const lowerQuery = query.toLowerCase();
    return pitches.filter(pitch => 
      pitch.name.toLowerCase().includes(lowerQuery) ||
      pitch.description.toLowerCase().includes(lowerQuery) ||
      pitch.location.toLowerCase().includes(lowerQuery)
    );
  },
  
  // New methods for availability
  updatePitchAvailability: (id: string, availability: Pitch['availability']) => {
    set((state) => {
      const updatedPitches = state.pitches.map((pitch) => 
        pitch.id === id ? { ...pitch, availability, updatedAt: new Date() } : pitch
      );
      // Save to AsyncStorage
      AsyncStorage.setItem('pitches', JSON.stringify(updatedPitches));
      return { pitches: updatedPitches };
    });
  },
  
  markDateAsUnavailable: (id: string, date: string) => {
    set((state) => {
      const updatedPitches = state.pitches.map((pitch) => {
        if (pitch.id === id) {
          const unavailableDates = pitch.unavailableDates || [];
          if (!unavailableDates.includes(date)) {
            unavailableDates.push(date);
          }
          return { ...pitch, unavailableDates, updatedAt: new Date() };
        }
        return pitch;
      });
      // Save to AsyncStorage
      AsyncStorage.setItem('pitches', JSON.stringify(updatedPitches));
      return { pitches: updatedPitches };
    });
  },
  
  markDateAsAvailable: (id: string, date: string) => {
    set((state) => {
      const updatedPitches = state.pitches.map((pitch) => {
        if (pitch.id === id) {
          const unavailableDates = (pitch.unavailableDates || []).filter(d => d !== date);
          return { ...pitch, unavailableDates, updatedAt: new Date() };
        }
        return pitch;
      });
      // Save to AsyncStorage
      AsyncStorage.setItem('pitches', JSON.stringify(updatedPitches));
      return { pitches: updatedPitches };
    });
  },
}));