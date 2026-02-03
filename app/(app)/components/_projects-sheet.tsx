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
import { type Project, type ProjectStatus, type AgeUpdateReason, type User } from '@/lib/mock-data';
import { AgeUpdateSheet } from './_age-update-sheet';
import { TeamMemberSheet } from './_team-member-sheet';
import { ProjectCard } from './_project-card';

export function ProjectsSheetContent() {
  const { projects, updateProjectAge, updateProjectOwners, getProjectActivities } = useProjects();
  const { expandProject } = useMapSheet();
  const [searchQuery, setSearchQuery] = useState('');

  // Age sheet state
  const [selectedProjectForAge, setSelectedProjectForAge] = useState<Project | null>(null);
  const [ageSheetOpen, setAgeSheetOpen] = useState(false);

  // Owner sheet state
  const [selectedProjectForOwner, setSelectedProjectForOwner] = useState<Project | null>(null);
  const [ownerSheetOpen, setOwnerSheetOpen] = useState(false);

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
    setSelectedProjectForAge(project);
    setAgeSheetOpen(true);
  }, []);

  const handleAgeSubmit = useCallback(
    (status: ProjectStatus, reason: AgeUpdateReason, note?: string) => {
      if (selectedProjectForAge) {
        updateProjectAge(selectedProjectForAge.id, status, reason, note);
      }
    },
    [selectedProjectForAge, updateProjectAge]
  );

  const handleActivityTap = useCallback((project: Project) => {
    expandProject(project.id, true); // true = show activity tab
  }, [expandProject]);

  const handleOwnerTap = useCallback((project: Project) => {
    setSelectedProjectForOwner(project);
    setOwnerSheetOpen(true);
  }, []);

  const handleOwnersChange = useCallback(
    (newOwners: User[]) => {
      if (selectedProjectForOwner) {
        updateProjectOwners(selectedProjectForOwner.id, newOwners);
      }
    },
    [selectedProjectForOwner, updateProjectOwners]
  );

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

      {/* Age Update Sheet */}
      {selectedProjectForAge ? (
        <AgeUpdateSheet
          open={ageSheetOpen}
          onOpenChange={setAgeSheetOpen}
          project={selectedProjectForAge}
          onSubmit={handleAgeSubmit}
        />
      ) : null}

      {/* Owner Sheet */}
      {selectedProjectForOwner ? (
        <TeamMemberSheet
          open={ownerSheetOpen}
          onOpenChange={setOwnerSheetOpen}
          role="owners"
          currentMembers={selectedProjectForOwner.owners}
          onSave={handleOwnersChange}
          projectName={selectedProjectForOwner.name}
        />
      ) : null}
    </>
  );
}
