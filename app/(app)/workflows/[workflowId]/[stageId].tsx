import { useMemo, useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Plus, Briefcase, MessageSquare, Clock } from 'lucide-react-native';

import { Box, VStack, HStack, Center, Surface, BottomNav, TAB_BAR_HEIGHT } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { getWorkflowById } from '@/lib/mock-data';
import { useProjects } from '@/lib/projects-context';
import { formatAge, getStatusFromAge, getStatusHexColor } from '@/lib/age-utils';
import { NewProjectSheet } from '../../components/_new-project-sheet';

export default function StageProjectsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { workflowId, stageId } = useLocalSearchParams<{
    workflowId: string;
    stageId: string;
  }>();
  const { projects, getProjectActivities, addProject } = useProjects();
  const [newProjectSheetOpen, setNewProjectSheetOpen] = useState(false);

  const workflow = useMemo(
    () => (workflowId ? getWorkflowById(workflowId) : null),
    [workflowId]
  );

  const stage = useMemo(
    () => workflow?.stages.find((s) => s.id === stageId),
    [workflow, stageId]
  );

  const stageProjects = useMemo(
    () => projects.filter((p) => p.stageId === stageId),
    [projects, stageId]
  );

  if (!workflow || !stage) {
    return (
      <Box fill background="default">
        <Text>Stage not found</Text>
      </Box>
    );
  }

  const handleBack = () => {
    router.back();
  };

  const handleAddProject = () => {
    setNewProjectSheetOpen(true);
  };

  const handleProjectCreated = (projectData: {
    name: string;
    address: string;
    workflowId: string;
    stageId: string;
  }) => {
    addProject(projectData);
  };

  return (
    <Box fill background="default">
      {stageProjects.length === 0 ? (
        <ScrollView
          contentContainerStyle={{
            flex: 1,
            paddingTop: insets.top + 32,
            paddingHorizontal: 16,
            paddingBottom: TAB_BAR_HEIGHT + 16,
          }}
        >
          {/* Header */}
          <Text size="xl" weight="semibold" numberOfLines={2}>
            {stage.name}
          </Text>

          <Center fill>
            <VStack gap="md" align="center">
              <Icon as={Briefcase} size={48} />
              <Text size="lg" weight="medium">
                No Projects
              </Text>
              <Text tone="muted" align="center">
                Use the button below to add one
              </Text>
            </VStack>
          </Center>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 32,
            paddingHorizontal: 16,
            paddingBottom: TAB_BAR_HEIGHT + 16,
          }}
        >
          {/* Header */}
          <Box paddingY="sm">
            <Text size="xl" weight="semibold" numberOfLines={2}>
              {stage.name}
            </Text>
          </Box>

          <VStack gap="sm">
            {stageProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} asChild>
                <Pressable>
                  {({ pressed }) => (
                    <View style={{ opacity: pressed ? 0.7 : 1 }}>
                      <Surface variant="card" padding="md">
                        <VStack gap="sm">
                          <VStack gap="xs">
                            <Text weight="semibold" size="lg">
                              {project.name}
                            </Text>
                            <Text size="sm" tone="muted" numberOfLines={1}>
                              {project.address}
                            </Text>
                          </VStack>

                          <HStack justify="between" align="center">
                            <Button variant="secondary" size="xs">
                              <Icon as={Clock} size={14} color={getStatusHexColor(getStatusFromAge(project.ageResetAt))} />
                              <Text>{formatAge(project.ageResetAt)}</Text>
                            </Button>
                            <HStack gap="xs" align="center">
                              <Icon as={MessageSquare} size={14} />
                              <Text size="sm" tone="muted">
                                {getProjectActivities(project.id).length}
                              </Text>
                            </HStack>
                          </HStack>
                        </VStack>
                      </Surface>
                    </View>
                  )}
                </Pressable>
              </Link>
            ))}
          </VStack>
        </ScrollView>
      )}

      <BottomNav
        left={
          <Button variant="ghost" size="sm" onPress={handleBack}>
            <Icon as={ChevronLeft} size={18} />
            <Text>Back</Text>
          </Button>
        }
        center={
          <Button variant="default" size="icon" onPress={handleAddProject}>
            <Icon as={Plus} size={20} />
          </Button>
        }
      />

      <NewProjectSheet
        open={newProjectSheetOpen}
        onOpenChange={setNewProjectSheetOpen}
        defaultWorkflowId={workflowId}
        defaultStageId={stageId}
        onProjectCreated={handleProjectCreated}
      />
    </Box>
  );
}
