import { useState, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import { MapPin } from 'lucide-react-native';

import { BottomSheetBody } from '@/components/ui/bottom-sheet';
import { VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useProjects } from '@/lib/projects-context';
import { useMapSheet } from '@/lib/map-sheet-context';
import { useAccentColors } from '@/lib/theme-context';
import { type User } from '@/lib/mock-data';
import { AgeUpdateSheet } from './_age-update-sheet';
import { TeamMemberSheet } from './_team-member-sheet';
import { ProjectCard } from './_project-card';

type ProjectPreviewContentProps = {
  projectId: string;
};

export function ProjectPreviewContent({ projectId }: ProjectPreviewContentProps) {
  const { getProjectById, getProjectActivities, updateProjectAge, updateProjectOwners } = useProjects();
  const { expandProject } = useMapSheet();
  const accentColors = useAccentColors();
  const accentColor = accentColors?.primary ?? '#0A84FF';

  // Age sheet state
  const [ageSheetOpen, setAgeSheetOpen] = useState(false);

  // Owner sheet state
  const [ownerSheetOpen, setOwnerSheetOpen] = useState(false);

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
    setAgeSheetOpen(true);
  }, []);

  const handleActivityTap = useCallback(() => {
    expandProject(projectId, true); // true = show activity tab
  }, [expandProject, projectId]);

  const handleOwnerTap = useCallback(() => {
    setOwnerSheetOpen(true);
  }, []);

  const handleAgeUpdate = useCallback(
    (
      status: Parameters<typeof updateProjectAge>[1],
      reason: Parameters<typeof updateProjectAge>[2],
      note?: string
    ) => {
      updateProjectAge(project.id, status, reason, note);
    },
    [project.id, updateProjectAge]
  );

  const handleOwnersChange = useCallback(
    (newOwners: User[]) => {
      updateProjectOwners(project.id, newOwners);
    },
    [project.id, updateProjectOwners]
  );

  return (
    <>
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

      {/* Age Update Sheet */}
      <AgeUpdateSheet
        open={ageSheetOpen}
        onOpenChange={setAgeSheetOpen}
        project={project}
        onSubmit={handleAgeUpdate}
      />

      {/* Owner Sheet */}
      <TeamMemberSheet
        open={ownerSheetOpen}
        onOpenChange={setOwnerSheetOpen}
        role="owners"
        currentMembers={project.owners}
        onSave={handleOwnersChange}
        projectName={project.name}
      />
    </>
  );
}
