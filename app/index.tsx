import { Redirect } from 'expo-router';
import { Platform } from 'react-native';

/**
 * Root index that routes based on platform:
 * - Web: Design System demos (for component development)
 * - Native (iOS/Android): Sales App prototype
 */
export default function RootIndex() {
  if (Platform.OS === 'web') {
    return <Redirect href="/(design-system)" />;
  }

  return <Redirect href="/(app)" />;
}
