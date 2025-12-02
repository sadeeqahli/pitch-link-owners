import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

interface ThemeContextType {
  isDarkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  toggleDarkMode: () => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  getFontSizeMultiplier: () => number;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  useEffect(() => {
    loadThemeSettings();
  }, []);

  const loadThemeSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('generalSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setIsDarkMode(settings.darkMode ?? true);
        setFontSize(settings.fontSize ?? 'medium');
      }
    } catch (error) {
      console.log('Error loading theme settings:', error);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const updateFontSize = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
  };

  const getFontSizeMultiplier = () => {
    switch (fontSize) {
      case 'small': return 0.85;
      case 'large': return 1.15;
      default: return 1;
    }
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        isDarkMode, 
        fontSize, 
        toggleDarkMode, 
        setFontSize: updateFontSize,
        getFontSizeMultiplier
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};

export const getAppTheme = (isDarkMode: boolean) => {
  return isDarkMode ? DarkTheme : DefaultTheme;
};