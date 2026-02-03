import { Pressable, View } from 'react-native';
import { Clock, MessageSquare, User } from 'lucide-react-native';

import { VStack, HStack, Surface } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getWorkflowById, getStageById, type Project } from '@/lib/mock-data';
import { formatAge, getStatusFromAge, getStatusHexColor } from '@/lib/age-utils';
import { getPinColor } from '@/lib/map-colors';

type ProjectCardProps = {
  project: Project;
  activityCount: number;
  onPress: () => void;
  onAgeTap: () => void;
  onActivityTap: () => void;
  onOwnerTap: () => void;
};

export function ProjectCard({
  project,
  activityCount,
  onPress,
  onAgeTap,
  onActivityTap,
  onOwnerTap,
}: ProjectCardProps) {
  const ageText = formatAge(project.ageResetAt);
  const status = getStatusFromAge(project.ageResetAt);
  const statusColor = getStatusHexColor(status);

  const workflow = getWorkflowById(project.workflowId);
  const stage = getStageById(project.workflowId, project.stageId);
  const stageColor = stage ? getPinColor(stage.color) : '#6B7280';

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View style={{ opacity: pressed ? 0.7 : 1 }}>
          <Surface variant="outline" padding="md">
            <VStack gap="xs">
              {/* Project Name */}
              <Text weight="semibold" size="lg" numberOfLines={1}>
                {project.name}
              </Text>

              {/* Stage indicator */}
              {stage ? (
                <HStack gap="xs" align="center">
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: stageColor,
                    }}
                  />
                  <Text size="sm" tone="muted" numberOfLines={1}>
                    {workflow?.name} · {stage.name}
                  </Text>
                </HStack>
              ) : null}

              {/* Separator */}
              <View
                className="bg-border"
                style={{
                  height: 1,
                  marginVertical: 4,
                }}
              />

              {/* Age, Activity count, and Owner - all tappable */}
              <HStack gap="sm" align="center" justify="between">
                <HStack gap="sm" align="center">
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      onAgeTap();
                    }}
                    style={{ paddingVertical: 4, paddingHorizontal: 8, marginLeft: -8, borderRadius: 6 }}
                  >
                    <HStack gap="xs" align="center">
                      <Icon as={Clock} size={14} color={statusColor} />
                      <Text size="sm" weight="medium" style={{ color: statusColor }}>
                        {ageText}
                      </Text>
                    </HStack>
                  </Pressable>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      onActivityTap();
                    }}
                    style={{ paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 }}
                  >
                    <HStack gap="xs" align="center">
                      <Icon as={MessageSquare} size={14} />
                      <Text size="sm" tone="muted">
                        {activityCount}
                      </Text>
                    </HStack>
                  </Pressable>
                </HStack>

                {/* Primary Owner */}
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    onOwnerTap();
                  }}
                  style={{ paddingVertical: 4, paddingHorizontal: 8, marginRight: -8, borderRadius: 6 }}
                >
                  <HStack gap="xs" align="center">
                    {project.owners.length > 0 ? (
                      <>
                        <Avatar size="sm" alt={project.owners[0].name}>
                          <AvatarFallback>
                            <Text size="xs">{project.owners[0].initials}</Text>
                          </AvatarFallback>
                        </Avatar>
                        <Text size="sm" tone="muted">
                          {project.owners[0].name.split(' ')[0]}
                        </Text>
                      </>
                    ) : (
                      <Icon as={User} size={16} />
                    )}
                  </HStack>
                </Pressable>
              </HStack>
            </VStack>
          </Surface>
        </View>
      )}
    </Pressable>
  );
}
