import { Box } from '@/components/ui/layout';
import { Stack } from 'expo-router';

export default function MobileTestPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Box fill />
    </>
  );
}
