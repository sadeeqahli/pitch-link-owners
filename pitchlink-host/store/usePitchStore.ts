import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Pitch {
  id: string;
  name: string;
  description: string;
  pricePerHour: number;
  imageUrl?: string;
  status: 'available' | 'booked' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

interface PitchState {
  pitches: Pitch[];
  addPitch: (pitchData: Omit<Pitch, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePitch: (id: string, updates: Partial<Pitch>) => void;
  deletePitch: (id: string) => void;
  loadPitches: () => Promise<void>;
  savePitches: () => Promise<void>;
}

export const usePitchStore = create<PitchState>((set: any, get: any) => ({
  pitches: [],
  
  addPitch: (pitchData: Omit<Pitch, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPitch: Pitch = {
      id: Date.now().toString(),
      ...pitchData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state: any) => {
      const updatedPitches = [...state.pitches, newPitch];
      // Save to AsyncStorage
      AsyncStorage.setItem('pitches', JSON.stringify(updatedPitches));
      return { pitches: updatedPitches };
    });
  },
  
  updatePitch: (id: string, updates: Partial<Pitch>) => {
    set((state: any) => {
      const updatedPitches = state.pitches.map((pitch: Pitch) => 
        pitch.id === id ? { ...pitch, ...updates, updatedAt: new Date() } : pitch
      );
      // Save to AsyncStorage
      AsyncStorage.setItem('pitches', JSON.stringify(updatedPitches));
      return { pitches: updatedPitches };
    });
  },
  
  deletePitch: (id: string) => {
    set((state: any) => {
      const updatedPitches = state.pitches.filter((pitch: Pitch) => pitch.id !== id);
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
          createdAt: new Date(pitch.createdAt),
          updatedAt: new Date(pitch.updatedAt),
        }));
        set({ pitches: parsedPitches });
      }
    } catch (error) {
      console.log('Error loading pitches:', error);
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
}));