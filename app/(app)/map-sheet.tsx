import { useState, useCallback, useEffect } from 'react';
import { View, Pressable, useColorScheme } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { MapPin } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { HStack } from '@/components/ui/layout';
import { useProjects } from '@/lib/projects-context';
import { useSheetContext } from '@/lib/sheet-context';
import { getIOSSheetColors } from '@/lib/ios-colors';
import { useAccentColors } from '@/lib/theme-context';
import { ProjectCard } from './components/_project-card';

/**
 * Native iOS Map Sheet — Pin Preview
 *
 * Shown when tapping a map pin. Displays:
 * - Address header
 * - Project card (tappable → opens project-sheet)
 * - Add project button
 *
 * Presented as a native formSheet (50% / 100% detents).
 */
export default function MapSheet() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const projectId = params.id;

  const { getProjectById, getProjectActivities, updateProjectAge, updateProjectOwners } =
    useProjects();
  const { openAgeUpdateSheet, openTeamMemberSheet } = useSheetContext();
  const accentColors = useAccentColors();
  const accentColor = accentColors?.primary ?? '#0A84FF';

  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);

  // Mount delay for native sheet timing
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const project = getProjectById(projectId);
  const activityCount = project ? getProjectActivities(project.id).length : 0;

  // Tap project card → open full project details sheet
  const handlePress = useCallback(() => {
    router.push({
      pathname: '/project-sheet',
      params: { id: projectId },
    });
  }, [router, projectId]);

  const handleAgeTap = useCallback(() => {
    if (!project) return;
    openAgeUpdateSheet({
      projectId: project.id,
      project,
      onSubmit: (status, reason, note) => {
        updateProjectAge(project.id, status, reason, note);
      },
    });
  }, [project, openAgeUpdateSheet, updateProjectAge]);

  const handleActivityTap = useCallback(() => {
    // Go straight to project sheet with activity tab
    router.push({
      pathname: '/project-sheet',
      params: { id: projectId },
    });
  }, [router, projectId]);

  const handleOwnerTap = useCallback(() => {
    if (!project) return;
    openTeamMemberSheet({
      role: 'owners',
      currentMembers: project.owners,
      projectName: project.name,
      onSave: (newOwners) => {
        updateProjectOwners(project.id, newOwners);
      },
    });
  }, [project, openTeamMemberSheet, updateProjectOwners]);

  const handleAddProject = useCallback(() => {
    if (!project) return;
    router.push({
      pathname: '/add-sheet',
      params: { lat: project.latitude.toString(), lng: project.longitude.toString() },
    });
  }, [router, project]);

  // Placeholder while mounting
  if (!isMounted) {
    return (
      <BlurView
        intensity={100}
        tint="dark"
        style={{ flex: 1, backgroundColor: 'rgba(30, 30, 30, 0.25)' }}
      />
    );
  }

  // Project not found
  if (!project) {
    return (
      <BlurView
        intensity={100}
        tint="dark"
        style={{ flex: 1, backgroundColor: 'rgba(30, 30, 30, 0.25)', padding: 20 }}
      >
        <Text style={{ color: colors.subtitle }}>Project not found</Text>
      </BlurView>
    );
  }

  return (
    <BlurView
      intensity={100}
      tint="dark"
      style={{ flex: 1, backgroundColor: 'rgba(30, 30, 30, 0.25)' }}
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 20, gap: 16 }}>
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
          onPress={handlePress}
          onAgeTap={handleAgeTap}
          onActivityTap={handleActivityTap}
          onOwnerTap={handleOwnerTap}
        />

        {/* Add Project Button */}
        <Pressable onPress={handleAddProject}>
          {({ pressed }) => (
            <View
              style={{
                opacity: pressed ? 0.7 : 1,
                backgroundColor: accentColors?.secondary ?? 'rgba(59, 130, 246, 0.15)',
                borderRadius: 8,
                borderCurve: 'continuous',
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: accentColors?.muted ?? 'rgba(59, 130, 246, 0.25)',
              }}
            >
              <HStack gap="xs" align="center" justify="center">
                <Text weight="medium" style={{ color: accentColor }}>
                  + Add project
                </Text>
              </HStack>
            </View>
          )}
        </Pressable>
      </View>
    </BlurView>
  );
}
