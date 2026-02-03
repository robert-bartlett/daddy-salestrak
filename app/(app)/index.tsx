import { useCallback, useRef, useMemo, useState, useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import * as Location from 'expo-location';
import { Crosshair, SlidersHorizontal, Search, Plus, Inbox, Briefcase } from 'lucide-react-native';

import { Box, Surface } from '@/components/ui/layout';
import { HorizontalScreenContainer } from '@/components/ui/layout/horizontal-screen-container';
import { FloatingTabBar, type FloatingTab, PILL_HEIGHT } from '@/components/ui/layout/floating-tabs';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { PersistentBottomSheet } from '@/components/ui/bottom-sheet';
import { useMapSheet, getSnapPointsArray, getSnapIndex } from '@/lib/map-sheet-context';
import { useScreenNavigation } from '@/lib/screen-navigation-context';
import { useProjects } from '@/lib/projects-context';
import { useAccentColors } from '@/lib/theme-context';
import { getStageById } from '@/lib/mock-data';
import { getPinColor } from '@/lib/map-colors';
import { getStatusFromAge } from '@/lib/age-utils';
import { MapFilterSheet, DEFAULT_FILTERS, type MapFilters } from './components/_map-filter-sheet';
import { AddSheetContent } from './components/_add-sheet';
import { ProjectPreviewContent } from './components/_project-preview';
import { ProjectDetailContent, NoteInputFooter } from './components/_project-detail';
import { ProjectActivityContent } from './components/_project-activity';
import { SearchScreen } from './components/_search-screen';
import { SearchSheet } from './components/_search-sheet';
import { InboxScreen } from './components/_inbox-screen';
import { ProfileScreen } from './components/_profile-screen';
import { MyWorkScreen } from './components/_my-work-screen';

// Default region centered on Boise, ID (user's actual location)
const DEFAULT_REGION: Region = {
  latitude: 43.6339,
  longitude: -116.2942,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// Sheet takes up roughly 40% of screen, so offset the pin to be in the top 60%
const PIN_CENTER_OFFSET = 0.35;

// Tab definitions
const TABS: FloatingTab[] = [
  { id: 'mywork', label: 'My Work', icon: <Briefcase /> },
  { id: 'add', label: 'Add', icon: <Plus /> },
  { id: 'inbox', label: 'Inbox', icon: <Inbox /> },
];

export default function MapFirstScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const mapRef = useRef<MapView>(null);
  const { projects } = useProjects();
  const {
    appState,
    snapPoint,
    isSheetVisible,
    openTab,
    selectProject,
    expandProject,
    closeSheet,
    setSnapPoint,
  } = useMapSheet();
  const {
    activeScreen,
    skipAnimation,
    navigateToSearch,
    navigateToInbox,
    navigateToProfile,
    navigateToMyWork,
    navigateToHome,
    clearSkipAnimation,
  } = useScreenNavigation();
  const accentColors = useAccentColors();
  const accentColor = accentColors?.primary ?? '#3b82f6';

  // Local state
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>({
    latitude: 43.6339,
    longitude: -116.2942,
  });
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [searchSheetOpen, setSearchSheetOpen] = useState(false);
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS);
  const [isActivityViewActive, setIsActivityViewActive] = useState(false);

  // My Work animation
  const myWorkProgress = useSharedValue(0);

  useEffect(() => {
    myWorkProgress.value = withTiming(activeScreen === 'mywork' ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [activeScreen, myWorkProgress]);

  // Main content (map + nav bar) slides right when My Work is active
  const mainContentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(myWorkProgress.value, [0, 1], [0, screenWidth]) }],
  }));

  // My Work slides in from left
  const myWorkStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(myWorkProgress.value, [0, 1], [-screenWidth, 0]) }],
  }));

  // Count active filters for display
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.workflows.length > 0) count++;
    if (filters.ageStatuses.length > 0) count++;
    if (filters.assignees.length > 0) count++;
    if (filters.owners.length > 0) count++;
    if (filters.showArchived) count++;
    return count;
  }, [filters]);

  // Filter projects based on current filters
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (filters.workflows.length > 0 && !filters.workflows.includes(project.workflowId)) {
        return false;
      }
      if (filters.ageStatuses.length > 0) {
        const projectStatus = getStatusFromAge(project.ageResetAt);
        if (!filters.ageStatuses.includes(projectStatus)) {
          return false;
        }
      }
      if (filters.assignees.length > 0) {
        const hasMatchingAssignee = project.assignees.some((a) =>
          filters.assignees.includes(a.id)
        );
        if (!hasMatchingAssignee) {
          return false;
        }
      }
      if (filters.owners.length > 0) {
        const hasMatchingOwner = project.owners.some((o) => filters.owners.includes(o.id));
        if (!hasMatchingOwner) {
          return false;
        }
      }
      if (!filters.showArchived && project.status === 'disabled') {
        return false;
      }
      return true;
    });
  }, [projects, filters]);

  // Request location permissions (for the blue dot on map)
  // Don't update userLocation state - keep Boise default for development
  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync();
    })();
  }, []);

  // Sync activity view state when appState changes
  useEffect(() => {
    if (appState.type === 'project-activity') {
      setIsActivityViewActive(true);
    } else if (appState.type === 'project-detail') {
      setIsActivityViewActive(appState.showActivity ?? false);
    } else {
      setIsActivityViewActive(false);
    }
  }, [appState]);

  const handleCenterOnUser = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...userLocation,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        300
      );
    }
  }, [userLocation]);

  // Track when marker was last pressed to prevent map press from closing sheet
  const lastMarkerPressTime = useRef(0);

  // Handle marker press - show preview card first
  const handleMarkerPress = useCallback(
    (projectId: string) => {
      lastMarkerPressTime.current = Date.now();

      const project = projects.find((p) => p.id === projectId);
      if (!project) {
        return;
      }

      if (mapRef.current) {
        const latitudeDelta = 0.02;
        const offsetLatitude = project.latitude - latitudeDelta * PIN_CENTER_OFFSET;
        mapRef.current.animateToRegion(
          {
            latitude: offsetLatitude,
            longitude: project.longitude,
            latitudeDelta: latitudeDelta,
            longitudeDelta: 0.02,
          },
          300
        );
      }
      selectProject(projectId);
    },
    [projects, selectProject]
  );

  // Handle map press to create new project at location
  const handleMapPress = useCallback(
    (event: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
      // Don't open if a marker was pressed within the last 500ms
      const timeSinceMarkerPress = Date.now() - lastMarkerPressTime.current;
      if (timeSinceMarkerPress < 500) {
        return;
      }

      const { latitude, longitude } = event.nativeEvent.coordinate;
      openTab('add', { latitude, longitude });
    },
    [openTab]
  );

  // Handle tab press - routes to screen navigation or opens sheet
  const handleTabPress = useCallback(
    (tabId: string) => {
      switch (tabId) {
        case 'mywork':
          navigateToMyWork();
          break;
        case 'add':
          openTab('add');
          break;
        case 'inbox':
          navigateToInbox();
          break;
      }
    },
    [navigateToMyWork, navigateToInbox, openTab]
  );

  const handleSearchPress = useCallback(() => {
    console.log('Search button pressed, opening sheet');
    setSearchSheetOpen(true);
  }, []);

  const handleFilter = useCallback(() => {
    setFilterSheetOpen(true);
  }, []);

  // Get active tab for tab bar based on current app state
  const activeTab = appState.type === 'tab' ? appState.tab : null;

  // Preview sheet content (only add and pin preview now)
  const renderPreviewContent = () => {
    switch (appState.type) {
      case 'tab':
        if (appState.tab === 'add') {
          return <AddSheetContent />;
        }
        return null;
      case 'pin-preview':
        return <ProjectPreviewContent projectId={appState.projectId} />;
      default:
        return null;
    }
  };

  // Check which sheet should be visible
  const showDetailSheet = appState.type === 'project-detail' || appState.type === 'project-activity';

  // Handle sheet snap changes
  const handleSnapIndexChange = useCallback(
    (index: number) => {
      const snapPoints: Array<'peek' | 'half' | 'full'> = ['peek', 'half', 'full'];
      if (index >= 0 && index < snapPoints.length) {
        setSnapPoint(snapPoints[index]);
      }
    },
    [setSnapPoint]
  );

  // Convert activeScreen to index for HorizontalScreenContainer
  const screenIndex = activeScreen === 'search' ? -1 : activeScreen === 'inbox' ? 1 : 0;

  // Hide tab bar when not on home screen
  const tabBarHidden = activeScreen !== 'home';

  // Home screen content (map + overlays)
  const homeContent = (
    <Box fill background="default">
      {/* Full screen map */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_DEFAULT}
        initialRegion={DEFAULT_REGION}
        showsMyLocationButton={false}
        onPress={handleMapPress}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: 'rgba(0, 122, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: '#007AFF',
                  borderWidth: 2,
                  borderColor: '#FFFFFF',
                }}
              />
            </View>
          </Marker>
        )}

        {filteredProjects.map((project) => {
          const stage = getStageById(project.workflowId, project.stageId);
          const pinColor = stage ? getPinColor(stage.color) : '#6B7280';

          return (
            <Marker
              key={project.id}
              identifier={project.id}
              coordinate={{
                latitude: project.latitude,
                longitude: project.longitude,
              }}
              pinColor={pinColor}
              onPress={() => handleMarkerPress(project.id)}
            />
          );
        })}
      </MapView>

      {/* Filter button - top right */}
      <View style={{ position: 'absolute', top: insets.top + 12, right: 16 }}>
        <View style={{ position: 'relative' }}>
          <Surface variant="card" padding="none" rounded="lg">
            <Button variant="ghost" size="sm" onPress={handleFilter}>
              <Icon as={SlidersHorizontal} size={18} />
            </Button>
          </Surface>
          {activeFilterCount > 0 && (
            <View
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                backgroundColor: accentColor,
                borderRadius: 8,
                minWidth: 16,
                height: 16,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 3,
              }}
            >
              <Text size="xs" style={{ color: '#fff', fontWeight: '600', fontSize: 10 }}>
                {activeFilterCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Center on user button - below filter */}
      <View style={{ position: 'absolute', top: insets.top + 60, right: 16 }}>
        <Surface variant="card" padding="none" rounded="lg">
          <Button
            variant="ghost"
            size="icon"
            onPress={handleCenterOnUser}
            disabled={!userLocation}
          >
            <Icon as={Crosshair} size={20} />
          </Button>
        </Surface>
      </View>

      {/* Search button - below center on user */}
      <View style={{ position: 'absolute', top: insets.top + 108, right: 16 }}>
        <Surface variant="card" padding="none" rounded="lg">
          <Button variant="ghost" size="icon" onPress={handleSearchPress}>
            <Icon as={Search} size={20} />
          </Button>
        </Surface>
      </View>

      {/* Bottom Tab Bar */}
      <FloatingTabBar
        tabs={TABS}
        activeTab={activeTab}
        onTabPress={handleTabPress}
        hidden={tabBarHidden}
      />

      {/* Bottom Sheet - only for Add tab and project previews/details */}
      <PersistentBottomSheet
        open={isSheetVisible}
        onOpenChange={(open) => {
          if (!open) {
            closeSheet();
            setIsActivityViewActive(false);
          }
        }}
        snapPoints={getSnapPointsArray()}
        snapIndex={getSnapIndex(snapPoint)}
        onSnapIndexChange={handleSnapIndexChange}
        enablePanDownToClose
        bottomInset={showDetailSheet ? 0 : PILL_HEIGHT + insets.bottom}
        contentKey={
          appState.type === 'pin-preview' || appState.type === 'project-detail' || appState.type === 'project-activity'
            ? appState.projectId
            : appState.type === 'tab'
              ? appState.tab
              : 'default'
        }
        footer={
          // Only show footer when viewing activity tab (isActivityViewActive) or project-activity state
          // Don't render footer at all when hidden to avoid the gray background showing over modal sheets
          (appState.type === 'project-detail' || appState.type === 'project-activity') &&
          (isActivityViewActive || appState.type === 'project-activity')
            ? <NoteInputFooter
                projectId={appState.projectId}
                onFocus={() => setSnapPoint('full')}
              />
            : undefined
        }
      >
        {appState.type === 'project-activity' ? (
          <ProjectActivityContent projectId={appState.projectId} hideFooter />
        ) : appState.type === 'project-detail' ? (
          <ProjectDetailContent
            projectId={appState.projectId}
            showActivity={appState.showActivity}
            hideFooter
            onActiveTabChange={(tab) => {
              setIsActivityViewActive(tab === 'activity');
            }}
          />
        ) : (
          renderPreviewContent()
        )}
      </PersistentBottomSheet>

      {/* Filter Sheet */}
      <MapFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </Box>
  );

  // Profile is rendered as an overlay
  if (activeScreen === 'profile') {
    return <ProfileScreen onBackPress={() => navigateToMyWork()} />;
  }

  return (
    <>
      <View style={{ flex: 1 }}>
        {/* My Work Screen - slides in from left */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: activeScreen === 'mywork' ? 1 : 0,
            },
            myWorkStyle,
          ]}
          pointerEvents={activeScreen === 'mywork' ? 'auto' : 'none'}
        >
          <MyWorkScreen onBackPress={navigateToHome} />
        </Animated.View>

        {/* Main content (map + horizontal screens) - slides right when My Work is active */}
        <Animated.View style={[{ flex: 1 }, mainContentStyle]}>
          <HorizontalScreenContainer
            activeIndex={screenIndex}
            skipAnimation={skipAnimation}
            onTransitionComplete={clearSkipAnimation}
            leftScreen={
              <SearchScreen
                onBackPress={navigateToHome}
                isActive={activeScreen === 'search'}
              />
            }
            centerScreen={homeContent}
            rightScreen={<InboxScreen onBackPress={navigateToHome} />}
          />
        </Animated.View>
      </View>

      {/* Search Sheet - rendered at root level for proper portal behavior */}
      <SearchSheet open={searchSheetOpen} onOpenChange={setSearchSheetOpen} />
    </>
  );
}
