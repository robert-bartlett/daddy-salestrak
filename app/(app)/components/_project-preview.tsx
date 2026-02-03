import { View, Pressable } from 'react-native';
import { MapPin, Clock, MessageSquare, Plus, ChevronRight } from 'lucide-react-native';

import { BottomSheetBody } from '@/components/ui/bottom-sheet';
import { VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useProjects } from '@/lib/projects-context';
import { useMapSheet } from '@/lib/map-sheet-context';
import { useAccentColors } from '@/lib/theme-context';
import { getWorkflowById, getStageById } from '@/lib/mock-data';
import { formatAge, getStatusFromAge, getStatusHexColor } from '@/lib/age-utils';
import { getPinColor } from '@/lib/map-colors';

type ProjectPreviewContentProps = {
  projectId: string;
};

export function ProjectPreviewContent({ projectId }: ProjectPreviewContentProps) {
  const { getProjectById, getProjectActivities } = useProjects();
  const { expandProject } = useMapSheet();
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

  const workflow = getWorkflowById(project.workflowId);
  const stage = getStageById(project.workflowId, project.stageId);
  const activityCount = getProjectActivities(project.id).length;
  const stageColor = stage ? getPinColor(stage.color) : '#6B7280';

  const handleExpand = () => {
    console.log('=== Project card tapped, expanding to detail ===');
    console.log('projectId:', projectId);
    expandProject(projectId);
  };

  const handleAddProject = () => {
    // TODO: Open add project sheet with this address pre-filled
    console.log('Add project at:', project.address);
  };

  return (
    <BottomSheetBody>
      <VStack gap="md" style={{ paddingBottom: 16 }}>
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

        {/* Project Card - Tappable to expand */}
        <Pressable onPress={handleExpand}>
          {({ pressed }) => (
            <View
              style={{
                opacity: pressed ? 0.7 : 1,
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
                padding: 14,
              }}
            >
              <HStack align="center">
                <View style={{ flex: 1 }}>
                  <VStack gap="xs">
                    {/* Name */}
                    <Text weight="semibold" size="lg" style={{ color: '#fff' }}>
                      {project.name}
                    </Text>

                    {/* Stage indicator */}
                    {stage && (
                      <HStack gap="xs" align="center">
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: stageColor,
                          }}
                        />
                        <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          {workflow?.name} · {stage.name}
                        </Text>
                      </HStack>
                    )}

                    {/* Age and Activity count */}
                    <HStack gap="md" align="center">
                      <HStack gap="xs" align="center">
                        <Icon as={Clock} size={14} color={getStatusHexColor(getStatusFromAge(project.ageResetAt))} />
                        <Text
                          size="sm"
                          weight="medium"
                          style={{ color: getStatusHexColor(getStatusFromAge(project.ageResetAt)) }}
                        >
                          {formatAge(project.ageResetAt)}
                        </Text>
                      </HStack>
                      <HStack gap="xs" align="center">
                        <Icon as={MessageSquare} size={14} color="rgba(255, 255, 255, 0.4)" />
                        <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          {activityCount}
                        </Text>
                      </HStack>
                    </HStack>
                  </VStack>
                </View>

                {/* Chevron */}
                <Icon as={ChevronRight} size={20} color="rgba(255, 255, 255, 0.3)" />
              </HStack>
            </View>
          )}
        </Pressable>

        {/* Add Project Button */}
        <Pressable onPress={handleAddProject}>
          {({ pressed }) => (
            <View
              style={{
                opacity: pressed ? 0.7 : 1,
                backgroundColor: accentColors?.secondary ?? 'rgba(59, 130, 246, 0.15)',
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: accentColors?.muted ?? 'rgba(59, 130, 246, 0.25)',
              }}
            >
              <HStack gap="sm" align="center" justify="center">
                <Icon as={Plus} size={18} color={accentColor} />
                <Text weight="medium" style={{ color: accentColor }}>
                  Add Project at This Address
                </Text>
              </HStack>
            </View>
          )}
        </Pressable>
      </VStack>
    </BottomSheetBody>
  );
}
