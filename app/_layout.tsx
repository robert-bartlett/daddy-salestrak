import '@/global.css';

import { PortalHost } from '@rn-primitives/portal';
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ProjectsProvider } from '@/lib/projects-context';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ProjectsProvider>
        <BottomSheetModalProvider>
          <Slot />
          <PortalHost />
        </BottomSheetModalProvider>
      </ProjectsProvider>
    </GestureHandlerRootView>
  );
}
