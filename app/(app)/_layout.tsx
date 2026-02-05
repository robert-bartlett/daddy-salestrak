import '@/global.css';

import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider, useTheme } from '@/lib/theme-context';
import { MapSheetProvider } from '@/lib/map-sheet-context';
import { ScreenNavigationProvider } from '@/lib/screen-navigation-context';
import { UniversalSearchProvider } from '@/lib/universal-search-context';
import { SheetProvider } from '@/lib/sheet-context';
import { NATIVE_SHEET_DETENTS } from '@/lib/sheet-config';
import { getIOSSheetColors } from '@/lib/ios-colors';

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
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);

  // Common formSheet options for native iOS sheets
  // contentStyle sets the background of the sheet content area
  const nativeSheetOptions = {
    presentation: 'formSheet' as const,
    headerShown: false,
    sheetAllowedDetents: [...NATIVE_SHEET_DETENTS.standard],
    sheetInitialDetentIndex: 0,
    sheetGrabberVisible: true,
    sheetExpandsWhenScrolledToEdge: true,
    sheetCornerRadius: -1,
    contentStyle: { backgroundColor: colors.background },
  };

  // Compact sheet options (for selection sheets that stack)
  const compactSheetOptions = {
    ...nativeSheetOptions,
    sheetAllowedDetents: [...NATIVE_SHEET_DETENTS.compact],
  };

  return (
    <View className={`flex-1 ${themeClass}`}>
      <NavThemeProvider value={NAV_THEME[colorMode]}>
        <SheetProvider>
          <MapSheetProvider>
            <ScreenNavigationProvider>
              <UniversalSearchProvider>
                <StatusBar style={colorMode === 'dark' ? 'light' : 'dark'} />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />

                  {/* Main sheets */}
                  <Stack.Screen name="add-sheet" options={nativeSheetOptions} />
                  <Stack.Screen name="project-sheet" options={nativeSheetOptions} />

                  {/* Age update flow */}
                  <Stack.Screen name="age-update-sheet" options={nativeSheetOptions} />
                  <Stack.Screen name="status-select-sheet" options={compactSheetOptions} />
                  <Stack.Screen name="reason-select-sheet" options={compactSheetOptions} />

                  {/* Team member selection */}
                  <Stack.Screen name="team-member-sheet" options={nativeSheetOptions} />

                  {/* Stage and workflow selection */}
                  <Stack.Screen name="stage-select-sheet" options={nativeSheetOptions} />
                  <Stack.Screen name="workflow-select-sheet" options={nativeSheetOptions} />

                  {/* Project actions */}
                  <Stack.Screen name="project-actions-sheet" options={compactSheetOptions} />

                  {/* Activity filter */}
                  <Stack.Screen name="activity-filter-sheet" options={nativeSheetOptions} />

                  {/* Map filter sheets */}
                  <Stack.Screen name="map-filter-sheet" options={nativeSheetOptions} />
                  <Stack.Screen name="user-select-sheet" options={compactSheetOptions} />
                  <Stack.Screen name="age-status-select-sheet" options={compactSheetOptions} />
                  <Stack.Screen name="saved-filter-select-sheet" options={compactSheetOptions} />

                  {/* Inbox filter */}
                  <Stack.Screen name="inbox-filter-sheet" options={nativeSheetOptions} />

                  {/* Generic list selection */}
                  <Stack.Screen name="list-select-sheet" options={compactSheetOptions} />
                </Stack>
              </UniversalSearchProvider>
            </ScreenNavigationProvider>
          </MapSheetProvider>
        </SheetProvider>
      </NavThemeProvider>
    </View>
  );
}
