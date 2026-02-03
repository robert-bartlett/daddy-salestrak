import '@/global.css';

import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider, useTheme } from '@/lib/theme-context';
import { ProjectsProvider } from '@/lib/projects-context';
import { MapSheetProvider } from '@/lib/map-sheet-context';
import { ScreenNavigationProvider } from '@/lib/screen-navigation-context';

export default function AppLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const { colorMode, themeClass } = useTheme();

  return (
    <View className={`flex-1 ${themeClass}`}>
      <NavThemeProvider value={NAV_THEME[colorMode]}>
        <ProjectsProvider>
          <MapSheetProvider>
            <ScreenNavigationProvider>
              <StatusBar style={colorMode === 'dark' ? 'light' : 'dark'} />
              <Stack screenOptions={{ headerShown: false }} />
            </ScreenNavigationProvider>
          </MapSheetProvider>
        </ProjectsProvider>
      </NavThemeProvider>
    </View>
  );
}
