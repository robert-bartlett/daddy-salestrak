import '@/global.css';

import { PortalHost } from '@rn-primitives/portal';
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ProjectsProvider } from '@/lib/projects-context';
import { WorkspaceProvider } from '@/lib/workspace-context';
import { UserProvider } from '@/lib/user-context';
import { SettingsProvider } from '@/lib/settings-context';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <WorkspaceProvider>
        <UserProvider>
          <SettingsProvider>
            <ProjectsProvider>
              <BottomSheetModalProvider>
                <Slot />
                <PortalHost />
              </BottomSheetModalProvider>
            </ProjectsProvider>
          </SettingsProvider>
        </UserProvider>
      </WorkspaceProvider>
    </GestureHandlerRootView>
  );
}
