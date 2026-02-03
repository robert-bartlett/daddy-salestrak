import { useMemo } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

import { Box, VStack, HStack, Surface, BottomNav, TAB_BAR_HEIGHT } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { getWorkflowById } from '@/lib/mock-data';
import { useProjects } from '@/lib/projects-context';

export default function WorkflowStagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { workflowId } = useLocalSearchParams<{ workflowId: string }>();
  const { projects } = useProjects();

  const workflow = useMemo(
    () => (workflowId ? getWorkflowById(workflowId) : null),
    [workflowId]
  );

  // Get project counts per stage
  const stageCounts = useMemo(() => {
    if (!workflow) return {};
    const counts: Record<string, number> = {};
    for (const stage of workflow.stages) {
      counts[stage.id] = projects.filter(
        (p) => p.workflowId === workflow.id && p.stageId === stage.id
      ).length;
    }
    return counts;
  }, [workflow, projects]);

  if (!workflow) {
    return (
      <Box fill background="default">
        <Text>Workflow not found</Text>
      </Box>
    );
  }

  const handleStagePress = (stageId: string) => {
    router.push(`/workflows/${workflowId}/${stageId}` as any);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <Box fill background="default">
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
            {workflow.name}
          </Text>
        </Box>

        <VStack gap="sm">
          {workflow.stages.map((stage) => {
            const count = stageCounts[stage.id] ?? 0;

            return (
              <Pressable key={stage.id} onPress={() => handleStagePress(stage.id)}>
                {({ pressed }) => (
                  <View style={{ opacity: pressed ? 0.7 : 1 }}>
                    <Surface variant="card" padding="md">
                      <HStack justify="between" align="center">
                        <Badge variant="color" color={stage.color} size="lg">
                          <Text>{stage.name}</Text>
                        </Badge>
                        <HStack gap="sm" align="center">
                          <Text tone="muted">{count}</Text>
                          <Icon as={ChevronRight} size={20} />
                        </HStack>
                      </HStack>
                    </Surface>
                  </View>
                )}
              </Pressable>
            );
          })}
        </VStack>
      </ScrollView>

      <BottomNav
        left={
          <Button variant="ghost" size="sm" onPress={handleBack}>
            <Icon as={ChevronLeft} size={18} />
            <Text>Back</Text>
          </Button>
        }
      />
    </Box>
  );
}
