import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/useAuthStore';
import { useInitializeApp } from '@/hooks/useInitializeApp';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isInitialized } = useInitializeApp();
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);

  if (!isInitialized) {
    return null; // Show splash screen while initializing
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </>
        ) : (
          <Stack.Screen 
            name="login" 
            options={{ 
              headerShown: false,
              animationTypeForReplace: 'pop',
            }} 
          />
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}