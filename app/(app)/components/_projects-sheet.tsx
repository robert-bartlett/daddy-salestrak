import { useState, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { MapPin, Search, X } from 'lucide-react-native';

import { BottomSheetScrollBody, BottomSheetHeader } from '@/components/ui/bottom-sheet';
import { Box, VStack, HStack, Surface } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useProjects } from '@/lib/projects-context';
import { useMapSheet } from '@/lib/map-sheet-context';
import { getWorkflowById, getStageById } from '@/lib/mock-data';
import { formatAge, getStatusFromAge, getStatusHexColor } from '@/lib/age-utils';
import { getPinColor } from '@/lib/map-colors';

export function ProjectsSheetContent() {
  const { projects } = useProjects();
  const { selectProject, expandProject, closeSheet } = useMapSheet();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter projects by search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.address.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  const handleProjectPress = (projectId: string) => {
    // Expand directly to project detail
    expandProject(projectId);
  };

  return (
    <>
      <BottomSheetHeader>
        <HStack justify="between" align="center">
          <Text size="lg" weight="semibold">
            Projects
          </Text>
          <Text size="sm" tone="muted">
            {filteredProjects.length} total
          </Text>
        </HStack>

        {/* Search Input */}
        <HStack gap="sm" align="center">
          <View style={{ flex: 1 }}>
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              width="full"
            />
          </View>
          {searchQuery.length > 0 && (
            <Button variant="ghost" size="icon" onPress={() => setSearchQuery('')}>
              <Icon as={X} size={18} />
            </Button>
          )}
        </HStack>
      </BottomSheetHeader>

      <BottomSheetScrollBody contentContainerStyle={{ paddingBottom: 40 }}>
        <VStack gap="sm">
          {filteredProjects.length === 0 ? (
            <Surface variant="muted" padding="xl">
              <Text tone="muted" align="center">
                {searchQuery ? 'No projects match your search' : 'No projects yet'}
              </Text>
            </Surface>
          ) : (
            filteredProjects.map((project) => {
              const workflow = getWorkflowById(project.workflowId);
              const stage = getStageById(project.workflowId, project.stageId);
              const stageColor = stage ? getPinColor(stage.color) : '#6B7280';

              return (
                <Pressable key={project.id} onPress={() => handleProjectPress(project.id)}>
                  {({ pressed }) => (
                    <View style={{ opacity: pressed ? 0.7 : 1 }}>
                      <Surface variant="card" padding="md">
                        <VStack gap="xs">
                          <HStack justify="between" align="center">
                            <Text weight="semibold" numberOfLines={1} style={{ flex: 1 }}>
                              {project.name}
                            </Text>
                            <Text
                              size="sm"
                              weight="semibold"
                              style={{ color: getStatusHexColor(getStatusFromAge(project.ageResetAt)) }}
                            >
                              {formatAge(project.ageResetAt)}
                            </Text>
                          </HStack>
                          <HStack gap="xs" align="center">
                            <Icon as={MapPin} size={12} />
                            <Text size="sm" tone="muted" numberOfLines={1} style={{ flex: 1 }}>
                              {project.address}
                            </Text>
                          </HStack>
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
                              <Text size="xs" tone="muted">
                                {workflow?.name} · {stage.name}
                              </Text>
                            </HStack>
                          )}
                        </VStack>
                      </Surface>
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </VStack>
      </BottomSheetScrollBody>
    </>
  );
}
