import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useAuthStore } from '@/store/useAuthStore';
import { useInitializeApp } from '@/hooks/useInitializeApp';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { ThemeProvider, useAppTheme } from '@/contexts/ThemeContext';
import { getAppTheme } from '@/contexts/ThemeContext';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
};

function RootLayoutContent() {
  const { isInitialized } = useInitializeApp();
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);
  const { isDarkMode } = useAppTheme();
  
  const theme = getAppTheme(isDarkMode);

  if (!isInitialized) {
    return null; // Show splash screen while initializing
  }

  return (
    <NavigationThemeProvider value={theme}>
      <Stack>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="login" 
              options={{ 
                headerShown: false,
                animationTypeForReplace: 'pop',
              }} 
            />
            <Stack.Screen 
              name="signup" 
              options={{ 
                headerShown: false,
                animationTypeForReplace: 'pop',
              }} 
            />
            <Stack.Screen 
              name="verification" 
              options={{ 
                headerShown: false,
                animationTypeForReplace: 'pop',
              }} 
            />
          </>
        )}
      </Stack>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}