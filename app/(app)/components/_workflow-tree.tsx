import { useMemo } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { Briefcase, ChevronRight } from 'lucide-react-native';

import { VStack, HStack, Surface } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { MOCK_WORKFLOWS, getWorkflowStats } from '@/lib/mock-data';
import { useProjects } from '@/lib/projects-context';

/**
 * WorkflowTree - Displays list of workflows that navigate to stages screen
 */
export function WorkflowTree() {
  const { projects } = useProjects();

  // Get workflows with project counts
  const workflowsWithCounts = useMemo(() => {
    return MOCK_WORKFLOWS.map((workflow) => {
      const stats = getWorkflowStats(workflow.id);
      const totalProjects = stats.reduce((sum, s) => sum + s.count, 0);
      return { workflow, totalProjects };
    });
  }, [projects]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <VStack gap="sm">
        {workflowsWithCounts.map(({ workflow, totalProjects }) => (
          <Link
            key={workflow.id}
            href={`/workflows/${workflow.id}` as any}
            asChild
          >
            <Pressable>
              {({ pressed }) => (
                <View style={{ opacity: pressed ? 0.7 : 1 }}>
                  <Surface variant="card" padding="md">
                    <HStack justify="between" align="center">
                      <HStack gap="md" align="center">
                        <Icon as={Briefcase} size={20} />
                        <Text weight="medium">{workflow.name}</Text>
                      </HStack>
                      <HStack gap="sm" align="center">
                        <Text tone="muted">{totalProjects}</Text>
                        <Icon as={ChevronRight} size={20} />
                      </HStack>
                    </HStack>
                  </Surface>
                </View>
              )}
            </Pressable>
          </Link>
        ))}
      </VStack>
    </ScrollView>
  );
}
