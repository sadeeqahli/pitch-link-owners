import { Stack } from 'expo-router';

export default function PaymentsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="activities" options={{ headerShown: false }} />
      <Stack.Screen name="receipts" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}