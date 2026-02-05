import { useCallback } from 'react';
import { View, Pressable } from 'react-native';
import { MapPin } from 'lucide-react-native';

import { BottomSheetBody } from '@/components/ui/bottom-sheet';
import { VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useProjects } from '@/lib/projects-context';
import { useMapSheet } from '@/lib/map-sheet-context';
import { useSheetContext } from '@/lib/sheet-context';
import { useAccentColors } from '@/lib/theme-context';
import { ProjectCard } from './_project-card';

type ProjectPreviewContentProps = {
  projectId: string;
};

export function ProjectPreviewContent({ projectId }: ProjectPreviewContentProps) {
  const { getProjectById, getProjectActivities, updateProjectAge, updateProjectOwners } = useProjects();
  const { expandProject } = useMapSheet();
  const { openAgeUpdateSheet, openTeamMemberSheet } = useSheetContext();
  const accentColors = useAccentColors();
  const accentColor = accentColors?.primary ?? '#0A84FF';

  const project = getProjectById(projectId);

  if (!project) {
    return (
      <BottomSheetBody>
        <Text style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Project not found</Text>
      </BottomSheetBody>
    );
  }

  const activityCount = getProjectActivities(project.id).length;

  const handlePress = useCallback(() => {
    expandProject(projectId);
  }, [expandProject, projectId]);

  const handleAddProject = () => {
    // TODO: Open add project sheet with this address pre-filled
    console.log('Add project at:', project.address);
  };

  const handleAgeTap = useCallback(() => {
    openAgeUpdateSheet({
      projectId: project.id,
      project,
      onSubmit: (status, reason, note) => {
        updateProjectAge(project.id, status, reason, note);
      },
    });
  }, [project, openAgeUpdateSheet, updateProjectAge]);

  const handleActivityTap = useCallback(() => {
    expandProject(projectId, true); // true = show activity tab
  }, [expandProject, projectId]);

  const handleOwnerTap = useCallback(() => {
    openTeamMemberSheet({
      role: 'owners',
      currentMembers: project.owners,
      projectName: project.name,
      onSave: (newOwners) => {
        updateProjectOwners(project.id, newOwners);
      },
    });
  }, [project, openTeamMemberSheet, updateProjectOwners]);

  return (
    <BottomSheetBody>
      <View style={{ paddingBottom: 16 }}>
        <VStack gap="md">
          {/* Address Header */}
          <HStack gap="sm" align="center">
            <Icon as={MapPin} size={18} color="rgba(255, 255, 255, 0.6)" />
            <Text
              size="sm"
              weight="medium"
              numberOfLines={1}
              style={{ flex: 1, color: 'rgba(255, 255, 255, 0.6)' }}
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
        </VStack>
      </View>
    </BottomSheetBody>
  );
}
