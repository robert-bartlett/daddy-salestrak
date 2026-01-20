import { Stack } from 'expo-router';

export default function DemosLayout() {
  // Hide the nested stack's header since the root layout provides the persistent nav
  return <Stack screenOptions={{ headerShown: false }} />;
}
