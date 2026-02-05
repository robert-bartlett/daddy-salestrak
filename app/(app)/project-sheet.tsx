import { useState, useCallback, useEffect } from 'react';
import { View, useColorScheme, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin } from 'lucide-react-native';

import { HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useProjects } from '@/lib/projects-context';
import { getIOSSheetColors } from '@/lib/ios-colors';
import { useSheetContext } from '@/lib/sheet-context';
import { ProjectDetailContent, NoteInputFooter } from './components/_project-detail';
import { ProjectCard } from './components/_project-card';
import type { User } from '@/lib/mock-data';

type ViewState = 'preview' | 'detail';

/**
 * Native iOS Project Sheet
 *
 * Presented as a native formSheet with:
 * - Native iOS frosted glass blur effect
 * - Native detent snapping (50%, 100%)
 * - Native drag handle
 * - iOS system colors
 */
export default function ProjectSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string; view?: string }>();
  const projectId = params.id;
  const initialView = params.view === 'detail' ? 'detail' : 'preview';

  const {
    getProjectById,
    getProjectActivities,
    updateProjectAge,
    updateProjectOwners,
  } = useProjects();

  // Get color scheme for iOS styling
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);
  const isDark = colorScheme === 'dark';

  // Get sheet context for opening native sheets
  const { openAgeUpdateSheet, openTeamMemberSheet } = useSheetContext();

  // View state
  const [viewState, setViewState] = useState<ViewState>(initialView);
  const [showActivity, setShowActivity] = useState(false);

  // Mount delay for native sheet timing
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const project = getProjectById(projectId);

  const handleDismiss = useCallback(() => {
    router.back();
  }, [router]);

  const handleBack = useCallback(() => {
    if (viewState === 'detail') {
      setViewState('preview');
      setShowActivity(false);
    } else {
      handleDismiss();
    }
  }, [viewState, handleDismiss]);

  const handleExpandToDetail = useCallback(() => {
    setViewState('detail');
  }, []);

  const handleExpandToActivity = useCallback(() => {
    setViewState('detail');
    setShowActivity(true);
  }, []);

  const handleAgeUpdate = useCallback(
    (
      status: Parameters<typeof updateProjectAge>[1],
      reason: Parameters<typeof updateProjectAge>[2],
      note?: string
    ) => {
      if (project) {
        updateProjectAge(project.id, status, reason, note);
      }
    },
    [project, updateProjectAge]
  );

  const handleOwnersChange = useCallback(
    (newOwners: User[]) => {
      if (project) {
        updateProjectOwners(project.id, newOwners);
      }
    },
    [project, updateProjectOwners]
  );

  const handleAgeTap = useCallback(() => {
    if (!project) return;
    openAgeUpdateSheet({
      projectId: project.id,
      project,
      onSubmit: handleAgeUpdate,
    });
  }, [project, openAgeUpdateSheet, handleAgeUpdate]);

  const handleOwnerTap = useCallback(() => {
    if (!project) return;
    openTeamMemberSheet({
      role: 'owners',
      currentMembers: project.owners,
      projectName: project.name,
      onSave: handleOwnersChange,
    });
  }, [project, openTeamMemberSheet, handleOwnersChange]);

  const handleAddProject = useCallback(() => {
    // TODO: Open add project sheet with this address pre-filled
    console.log('Add project at:', project?.address);
  }, [project?.address]);

  // Placeholder while mounting
  if (!isMounted) {
    const placeholderBg = isDark ? '#000000' : '#f2f2f7';
    return <View style={{ flex: 1, backgroundColor: placeholderBg }} />;
  }

  // Project not found
  if (!project) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}>
        <Text style={{ color: colors.subtitle }}>Project not found</Text>
      </View>
    );
  }

  const activityCount = getProjectActivities(project.id).length;

  // Preview View - Compact card-style preview
  if (viewState === 'preview') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ padding: 16, paddingTop: 20, gap: 16 }}>
          {/* Address Header */}
          <HStack gap="sm" align="center">
            <Icon as={MapPin} size={18} color={colors.subtitle} />
            <Text
              size="sm"
              weight="medium"
              numberOfLines={1}
              style={{ flex: 1, color: colors.subtitle }}
            >
              {project.address}
            </Text>
          </HStack>

          {/* Project Card */}
          <ProjectCard
            project={project}
            activityCount={activityCount}
            onPress={handleExpandToDetail}
            onAgeTap={handleAgeTap}
            onActivityTap={handleExpandToActivity}
            onOwnerTap={handleOwnerTap}
          />

          {/* Add Project Button */}
          <Pressable onPress={handleAddProject}>
            {({ pressed }) => (
              <View
                style={{
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: 'rgba(10, 132, 255, 0.12)',
                  borderRadius: 10,
                  borderCurve: 'continuous',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                }}
              >
                <HStack gap="xs" align="center" justify="center">
                  <Text weight="semibold" style={{ color: '#0A84FF', fontSize: 15 }}>
                    + Add project
                  </Text>
                </HStack>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  // Detail View - Full project details with tabs
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Back Button Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          paddingTop: 8,
          paddingBottom: 4,
        }}
      >
        <Button variant="ghost" size="icon" onPress={handleBack}>
          <Icon as={ChevronLeft} size={22} />
        </Button>
        <Text
          size="lg"
          weight="semibold"
          style={{ color: colors.title, flex: 1 }}
          numberOfLines={1}
        >
          {project.name}
        </Text>
      </View>

      {/* Project Detail Content */}
      <View style={{ flex: 1 }}>
        <ProjectDetailContent
          projectId={project.id}
          showActivity={showActivity}
          hideFooter
          useNativeScroll
          onActiveTabChange={(tab) => setShowActivity(tab === 'activity')}
        />
      </View>

      {/* Note Input Footer (when in activity view) */}
      {showActivity ? (
        <View
          style={{
            borderTopWidth: 0.5,
            borderTopColor: colors.separator,
            backgroundColor: colors.background,
            padding: 16,
            paddingBottom: 16 + insets.bottom,
          }}
        >
          <NoteInputFooter projectId={project.id} />
        </View>
      ) : null}
    </View>
  );
}
