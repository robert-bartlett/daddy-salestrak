import { useState, useMemo, useCallback } from 'react';
import { View } from 'react-native';
import { X } from 'lucide-react-native';

import { BottomSheetScrollBody, BottomSheetHeader } from '@/components/ui/bottom-sheet';
import { VStack, HStack, Surface } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useProjects } from '@/lib/projects-context';
import { useMapSheet } from '@/lib/map-sheet-context';
import { useSheetContext } from '@/lib/sheet-context';
import { type Project, type ProjectStatus, type AgeUpdateReason, type User } from '@/lib/mock-data';
import { ProjectCard } from './_project-card';

export function ProjectsSheetContent() {
  const { projects, updateProjectAge, updateProjectOwners, getProjectActivities } = useProjects();
  const { expandProject } = useMapSheet();
  const { openAgeUpdateSheet, openTeamMemberSheet } = useSheetContext();
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

  // Get activity counts for each project (memoized map)
  const projectActivityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      counts[p.id] = getProjectActivities(p.id).length;
    });
    return counts;
  }, [projects, getProjectActivities]);

  const handleProjectPress = useCallback((project: Project) => {
    expandProject(project.id);
  }, [expandProject]);

  const handleAgeTap = useCallback((project: Project) => {
    openAgeUpdateSheet({
      projectId: project.id,
      project,
      onSubmit: (status, reason, note) => {
        updateProjectAge(project.id, status, reason, note);
      },
    });
  }, [openAgeUpdateSheet, updateProjectAge]);

  const handleActivityTap = useCallback((project: Project) => {
    expandProject(project.id, true); // true = show activity tab
  }, [expandProject]);

  const handleOwnerTap = useCallback((project: Project) => {
    openTeamMemberSheet({
      role: 'owners',
      currentMembers: project.owners,
      projectName: project.name,
      onSave: (newOwners) => {
        updateProjectOwners(project.id, newOwners);
      },
    });
  }, [openTeamMemberSheet, updateProjectOwners]);

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
          {searchQuery.length > 0 ? (
            <Button variant="ghost" size="icon" onPress={() => setSearchQuery('')}>
              <Icon as={X} size={18} />
            </Button>
          ) : null}
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
            filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                activityCount={projectActivityCounts[project.id] ?? 0}
                onPress={() => handleProjectPress(project)}
                onAgeTap={() => handleAgeTap(project)}
                onActivityTap={() => handleActivityTap(project)}
                onOwnerTap={() => handleOwnerTap(project)}
              />
            ))
          )}
        </VStack>
      </BottomSheetScrollBody>
    </>
  );
}
