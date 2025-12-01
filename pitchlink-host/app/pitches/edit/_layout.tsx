import { Stack } from 'expo-router';

export default function PitchesEditLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}