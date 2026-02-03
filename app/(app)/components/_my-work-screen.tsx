import { useState, useMemo, useCallback } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import {
  Map,
  User,
  CalendarCheck,
  FolderKanban,
  Activity,
  GitBranch,
  MapPin,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Clock,
} from 'lucide-react-native';

import { Box, VStack, HStack, Surface, Header } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BottomSheetModal,
  BottomSheetScrollBody,
  BottomSheetHeader,
  BottomSheetTitle,
} from '@/components/ui/bottom-sheet';
import { useScreenNavigation } from '@/lib/screen-navigation-context';
import { useProjects } from '@/lib/projects-context';
import { AgeUpdateSheet } from './_age-update-sheet';
import { ProjectDetailContent } from './_project-detail';
import {
  formatAge,
  getStatusFromAge,
  getStatusBadgeColor,
  getStatusHexColor,
  type BadgeColor,
} from '@/lib/age-utils';
import { getPinColor } from '@/lib/map-colors';
import {
  MOCK_WORKFLOWS,
  getWorkflowById,
  getStageById,
  type Project,
  type ProjectStatus,
  type AgeUpdateReason,
  type Activity as ActivityType,
  type Workflow,
  type WorkflowStage,
} from '@/lib/mock-data';

type TabValue = 'today' | 'projects' | 'activities' | 'workflows';

// Workflows tab drill-down state
type WorkflowsViewState =
  | { level: 'workflows' }
  | { level: 'stages'; workflowId: string }
  | { level: 'projects'; workflowId: string; stageId: string };

type MyWorkScreenProps = {
  /** Callback when back button is pressed */
  onBackPress: () => void;
};

// Helper function to format timestamps for activities
function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'Just now';
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ============================================================================
// Today Tab: Project Row (age-focused, tap opens age sheet)
// ============================================================================

type ProjectRowProps = {
  project: Project;
  onPress: () => void;
};

function ProjectRow({ project, onPress }: ProjectRowProps) {
  const ageText = formatAge(project.ageResetAt);
  const status = getStatusFromAge(project.ageResetAt);
  const badgeColor = getStatusBadgeColor(status);

  return (
    <Pressable onPress={onPress}>
      <Surface variant="outline" padding="md">
        <HStack justify="between" align="center">
          <View style={{ flex: 1, marginRight: 12 }}>
            <VStack gap="xs">
              <Text weight="medium">{project.name}</Text>
              <Text size="sm" tone="muted" numberOfLines={1}>
                {project.address}
              </Text>
            </VStack>
          </View>
          <Badge variant="color" color={badgeColor as BadgeColor} size="default">
            <Text>{ageText}</Text>
          </Badge>
        </HStack>
      </Surface>
    </Pressable>
  );
}

// ============================================================================
// Projects Tab: Project Card (matches map sheet style)
// ============================================================================

type ProjectCardProps = {
  project: Project;
  activityCount: number;
  onPress: () => void;
};

function ProjectCard({ project, activityCount, onPress }: ProjectCardProps) {
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
          <Surface variant="card" padding="md">
            <HStack align="center">
              <View style={{ flex: 1 }}>
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

                  {/* Age and Activity count */}
                  <HStack gap="md" align="center">
                    <HStack gap="xs" align="center">
                      <Icon as={Clock} size={14} color={statusColor} />
                      <Text size="sm" weight="medium" style={{ color: statusColor }}>
                        {ageText}
                      </Text>
                    </HStack>
                    <HStack gap="xs" align="center">
                      <Icon as={MessageSquare} size={14} />
                      <Text size="sm" tone="muted">
                        {activityCount}
                      </Text>
                    </HStack>
                  </HStack>
                </VStack>
              </View>

              {/* Chevron */}
              <Icon as={ChevronRight} size={20} />
            </HStack>
          </Surface>
        </View>
      )}
    </Pressable>
  );
}

// ============================================================================
// Activities Tab: Activity Item (light theme)
// ============================================================================

type ActivityItemLightProps = {
  activity: ActivityType;
  projectName: string;
};

function ActivityItemLight({ activity, projectName }: ActivityItemLightProps) {
  return (
    <Surface variant="outline" padding="md">
      <HStack gap="sm" align="start">
        <Avatar size="sm" alt={activity.user.name}>
          <AvatarFallback>
            <Text size="xs">{activity.user.initials}</Text>
          </AvatarFallback>
        </Avatar>
        <View style={{ flex: 1 }}>
          <VStack gap="xs">
            <HStack justify="between" align="center">
              <Text size="sm" weight="semibold">
                {activity.user.name}
              </Text>
              <Text size="xs" tone="muted">
                {formatTimestamp(activity.timestamp)}
              </Text>
            </HStack>
            <Text size="xs" tone="muted">
              {projectName}
            </Text>
            <Text size="sm">{activity.description}</Text>
          </VStack>
        </View>
      </HStack>
    </Surface>
  );
}

// ============================================================================
// Workflows Tab: Workflow Row
// ============================================================================

type WorkflowRowProps = {
  workflow: Workflow;
  projectCount: number;
  onPress: () => void;
};

function WorkflowRow({ workflow, projectCount, onPress }: WorkflowRowProps) {
  return (
    <Pressable onPress={onPress}>
      <Surface variant="outline" padding="md">
        <HStack justify="between" align="center">
          <Text weight="medium">{workflow.name}</Text>
          <HStack gap="sm" align="center">
            <Badge variant="secondary">
              <Text size="xs">{projectCount}</Text>
            </Badge>
            <Icon as={ChevronRight} size={16} />
          </HStack>
        </HStack>
      </Surface>
    </Pressable>
  );
}

// ============================================================================
// Workflows Tab: Stage Row
// ============================================================================

type StageRowProps = {
  stage: WorkflowStage;
  projectCount: number;
  onPress: () => void;
};

function StageRow({ stage, projectCount, onPress }: StageRowProps) {
  const stageColor = getPinColor(stage.color);

  return (
    <Pressable onPress={onPress}>
      <Surface variant="outline" padding="md">
        <HStack justify="between" align="center">
          <HStack gap="sm" align="center">
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: stageColor,
              }}
            />
            <Text weight="medium">{stage.name}</Text>
          </HStack>
          <HStack gap="sm" align="center">
            <Badge variant="secondary">
              <Text size="xs">{projectCount}</Text>
            </Badge>
            <Icon as={ChevronRight} size={16} />
          </HStack>
        </HStack>
      </Surface>
    </Pressable>
  );
}

export function MyWorkScreen({ onBackPress }: MyWorkScreenProps) {
  const { navigateToProfile } = useScreenNavigation();
  const { projects, activities, updateProjectAge, getProjectById, getProjectActivities } = useProjects();

  const [activeTab, setActiveTab] = useState<TabValue>('today');

  // Today tab: age update sheet state
  const [selectedProjectForAge, setSelectedProjectForAge] = useState<Project | null>(null);
  const [ageSheetOpen, setAgeSheetOpen] = useState(false);

  // Projects/Workflows tabs: project detail sheet state
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  // Workflows tab: drill-down navigation state
  const [workflowsView, setWorkflowsView] = useState<WorkflowsViewState>({ level: 'workflows' });

  // Sort projects by age (oldest first, based on ageResetAt)
  const sortedProjectsByAge = useMemo(() => {
    return [...projects].sort(
      (a, b) => a.ageResetAt.getTime() - b.ageResetAt.getTime()
    );
  }, [projects]);

  // Sort projects alphabetically for Projects tab
  const sortedProjectsAlphabetically = useMemo(() => {
    return [...projects].sort((a, b) => a.name.localeCompare(b.name));
  }, [projects]);

  // Sort activities by newest first
  const sortedActivities = useMemo(() => {
    return [...activities].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, [activities]);

  // Workflow counts for Workflows tab level 1
  const workflowCounts = useMemo(() => {
    return MOCK_WORKFLOWS.map((workflow) => ({
      workflow,
      count: projects.filter((p) => p.workflowId === workflow.id).length,
    }));
  }, [projects]);

  // Stage counts for current workflow (level 2)
  const currentWorkflowStageCounts = useMemo(() => {
    if (workflowsView.level === 'workflows') return [];
    const workflow = getWorkflowById(workflowsView.workflowId);
    if (!workflow) return [];
    return workflow.stages.map((stage) => ({
      stage,
      count: projects.filter(
        (p) => p.workflowId === workflow.id && p.stageId === stage.id
      ).length,
    }));
  }, [workflowsView, projects]);

  // Projects for current stage (level 3)
  const currentStageProjects = useMemo(() => {
    if (workflowsView.level !== 'projects') return [];
    return projects.filter(
      (p) =>
        p.workflowId === workflowsView.workflowId &&
        p.stageId === workflowsView.stageId
    );
  }, [workflowsView, projects]);

  // Get activity counts for each project (memoized map)
  const projectActivityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      counts[p.id] = getProjectActivities(p.id).length;
    });
    return counts;
  }, [projects, getProjectActivities]);

  // Today tab: handle project press (opens age update sheet)
  const handleTodayProjectPress = useCallback((project: Project) => {
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

  // Projects/Workflows tab: handle project card press (opens detail sheet)
  const handleProjectCardPress = useCallback((project: Project) => {
    setDetailProject(project);
    setDetailSheetOpen(true);
  }, []);

  // Workflows tab: navigation handlers
  const handleWorkflowPress = useCallback((workflowId: string) => {
    setWorkflowsView({ level: 'stages', workflowId });
  }, []);

  const handleStagePress = useCallback(
    (stageId: string) => {
      if (workflowsView.level === 'stages') {
        setWorkflowsView({
          level: 'projects',
          workflowId: workflowsView.workflowId,
          stageId,
        });
      }
    },
    [workflowsView]
  );

  const handleWorkflowsBack = useCallback(() => {
    if (workflowsView.level === 'projects') {
      setWorkflowsView({ level: 'stages', workflowId: workflowsView.workflowId });
    } else if (workflowsView.level === 'stages') {
      setWorkflowsView({ level: 'workflows' });
    }
  }, [workflowsView]);

  // Get current workflow/stage names for header
  const getCurrentWorkflowTitle = useCallback(() => {
    if (workflowsView.level === 'workflows') return 'Workflows';
    const workflow = getWorkflowById(workflowsView.workflowId);
    if (workflowsView.level === 'stages') return workflow?.name ?? 'Workflow';
    if (workflowsView.level === 'projects') {
      const stage = getStageById(workflowsView.workflowId, workflowsView.stageId);
      return stage?.name ?? 'Stage';
    }
    return 'Workflows';
  }, [workflowsView]);

  // Render functions
  const renderTodayProjectRow = useCallback(
    ({ item }: { item: Project }) => (
      <ProjectRow project={item} onPress={() => handleTodayProjectPress(item)} />
    ),
    [handleTodayProjectPress]
  );

  const renderProjectCard = useCallback(
    ({ item }: { item: Project }) => (
      <ProjectCard
        project={item}
        activityCount={projectActivityCounts[item.id] ?? 0}
        onPress={() => handleProjectCardPress(item)}
      />
    ),
    [handleProjectCardPress, projectActivityCounts]
  );

  const renderActivityItem = useCallback(
    ({ item }: { item: ActivityType }) => {
      const project = getProjectById(item.projectId);
      return (
        <ActivityItemLight
          activity={item}
          projectName={project?.name ?? 'Unknown Project'}
        />
      );
    },
    [getProjectById]
  );

  const renderWorkflowRow = useCallback(
    ({ item }: { item: { workflow: Workflow; count: number } }) => (
      <WorkflowRow
        workflow={item.workflow}
        projectCount={item.count}
        onPress={() => handleWorkflowPress(item.workflow.id)}
      />
    ),
    [handleWorkflowPress]
  );

  const renderStageRow = useCallback(
    ({ item }: { item: { stage: WorkflowStage; count: number } }) => (
      <StageRow
        stage={item.stage}
        projectCount={item.count}
        onPress={() => handleStagePress(item.stage.id)}
      />
    ),
    [handleStagePress]
  );

  const keyExtractor = useCallback((item: Project) => item.id, []);
  const activityKeyExtractor = useCallback((item: ActivityType) => item.id, []);
  const workflowKeyExtractor = useCallback(
    (item: { workflow: Workflow; count: number }) => item.workflow.id,
    []
  );
  const stageKeyExtractor = useCallback(
    (item: { stage: WorkflowStage; count: number }) => item.stage.id,
    []
  );

  // Reset workflows view when switching tabs
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as TabValue);
    if (value !== 'workflows') {
      setWorkflowsView({ level: 'workflows' });
    }
  }, []);

  return (
    <Box fill background="default">
      <Header
        title="My Work"
        safeAreaTop
        background="default"
        left={
          <Button variant="ghost" size="icon" onPress={navigateToProfile}>
            <Icon as={User} size={22} />
          </Button>
        }
        right={
          <Button variant="ghost" size="icon" onPress={onBackPress}>
            <Icon as={Map} size={22} />
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1">
        <Box paddingX="md" paddingY="sm">
          <ScrollArea orientation="horizontal" showScrollbar="never">
            <TabsList variant="outline">
              <TabsTrigger value="today">
                <Icon as={CalendarCheck} size={16} />
                <Text>Today</Text>
              </TabsTrigger>
              <TabsTrigger value="projects">
                <Icon as={FolderKanban} size={16} />
                <Text>Projects</Text>
              </TabsTrigger>
              <TabsTrigger value="activities">
                <Icon as={Activity} size={16} />
                <Text>Activities</Text>
              </TabsTrigger>
              <TabsTrigger value="workflows">
                <Icon as={GitBranch} size={16} />
                <Text>Workflows</Text>
              </TabsTrigger>
            </TabsList>
          </ScrollArea>
        </Box>

        {/* Today Tab: Projects sorted by age (oldest first) */}
        <TabsContent value="today">
          <Box fill>
            {sortedProjectsByAge.length === 0 ? (
              <Box fill paddingX="md" paddingY="lg">
                <VStack gap="md" align="center">
                  <Surface variant="muted" padding="xl">
                    <VStack gap="sm" align="center">
                      <Icon as={CalendarCheck} size={32} />
                      <Text size="lg" weight="semibold" align="center">
                        All Caught Up
                      </Text>
                      <Text tone="muted" align="center">
                        No projects need attention today
                      </Text>
                    </VStack>
                  </Surface>
                </VStack>
              </Box>
            ) : (
              <FlatList
                data={sortedProjectsByAge}
                renderItem={renderTodayProjectRow}
                keyExtractor={keyExtractor}
                contentContainerStyle={{ padding: 16, gap: 8 }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </Box>
        </TabsContent>

        {/* Projects Tab: Project cards with activity counts */}
        <TabsContent value="projects">
          <Box fill>
            {sortedProjectsAlphabetically.length === 0 ? (
              <Box fill paddingX="md" paddingY="lg">
                <VStack gap="md" align="center">
                  <Surface variant="muted" padding="xl">
                    <VStack gap="sm" align="center">
                      <Icon as={FolderKanban} size={32} />
                      <Text size="lg" weight="semibold" align="center">
                        No Projects
                      </Text>
                      <Text tone="muted" align="center">
                        Create your first project to get started
                      </Text>
                    </VStack>
                  </Surface>
                </VStack>
              </Box>
            ) : (
              <FlatList
                data={sortedProjectsAlphabetically}
                renderItem={renderProjectCard}
                keyExtractor={keyExtractor}
                contentContainerStyle={{ padding: 16, gap: 8 }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </Box>
        </TabsContent>

        {/* Activities Tab: Recent activities with project names */}
        <TabsContent value="activities">
          <Box fill>
            {sortedActivities.length === 0 ? (
              <Box fill paddingX="md" paddingY="lg">
                <VStack gap="md" align="center">
                  <Surface variant="muted" padding="xl">
                    <VStack gap="sm" align="center">
                      <Icon as={Activity} size={32} />
                      <Text size="lg" weight="semibold" align="center">
                        No Activity
                      </Text>
                      <Text tone="muted" align="center">
                        Activity from your projects will appear here
                      </Text>
                    </VStack>
                  </Surface>
                </VStack>
              </Box>
            ) : (
              <FlatList
                data={sortedActivities}
                renderItem={renderActivityItem}
                keyExtractor={activityKeyExtractor}
                contentContainerStyle={{ padding: 16, gap: 8 }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </Box>
        </TabsContent>

        {/* Workflows Tab: Drill-down navigation */}
        <TabsContent value="workflows">
          <Box fill>
            {/* Back header for drill-down navigation */}
            {workflowsView.level !== 'workflows' && (
              <Box paddingX="md" paddingY="sm">
                <HStack gap="sm" align="center">
                  <Button variant="ghost" size="icon" onPress={handleWorkflowsBack}>
                    <Icon as={ChevronLeft} size={20} />
                  </Button>
                  <Text weight="semibold">{getCurrentWorkflowTitle()}</Text>
                </HStack>
              </Box>
            )}

            {/* Level 1: Workflows list */}
            {workflowsView.level === 'workflows' && (
              workflowCounts.length === 0 ? (
                <Box fill paddingX="md" paddingY="lg">
                  <VStack gap="md" align="center">
                    <Surface variant="muted" padding="xl">
                      <VStack gap="sm" align="center">
                        <Icon as={GitBranch} size={32} />
                        <Text size="lg" weight="semibold" align="center">
                          No Workflows
                        </Text>
                        <Text tone="muted" align="center">
                          Workflows will appear here
                        </Text>
                      </VStack>
                    </Surface>
                  </VStack>
                </Box>
              ) : (
                <FlatList
                  data={workflowCounts}
                  renderItem={renderWorkflowRow}
                  keyExtractor={workflowKeyExtractor}
                  contentContainerStyle={{ padding: 16, gap: 8 }}
                  showsVerticalScrollIndicator={false}
                />
              )
            )}

            {/* Level 2: Stages list */}
            {workflowsView.level === 'stages' && (
              currentWorkflowStageCounts.length === 0 ? (
                <Box fill paddingX="md" paddingY="lg">
                  <VStack gap="md" align="center">
                    <Surface variant="muted" padding="xl">
                      <VStack gap="sm" align="center">
                        <Icon as={GitBranch} size={32} />
                        <Text size="lg" weight="semibold" align="center">
                          No Stages
                        </Text>
                        <Text tone="muted" align="center">
                          This workflow has no stages
                        </Text>
                      </VStack>
                    </Surface>
                  </VStack>
                </Box>
              ) : (
                <FlatList
                  data={currentWorkflowStageCounts}
                  renderItem={renderStageRow}
                  keyExtractor={stageKeyExtractor}
                  contentContainerStyle={{ padding: 16, gap: 8 }}
                  showsVerticalScrollIndicator={false}
                />
              )
            )}

            {/* Level 3: Projects in stage */}
            {workflowsView.level === 'projects' && (
              currentStageProjects.length === 0 ? (
                <Box fill paddingX="md" paddingY="lg">
                  <VStack gap="md" align="center">
                    <Surface variant="muted" padding="xl">
                      <VStack gap="sm" align="center">
                        <Icon as={FolderKanban} size={32} />
                        <Text size="lg" weight="semibold" align="center">
                          No Projects
                        </Text>
                        <Text tone="muted" align="center">
                          No projects in this stage
                        </Text>
                      </VStack>
                    </Surface>
                  </VStack>
                </Box>
              ) : (
                <FlatList
                  data={currentStageProjects}
                  renderItem={renderProjectCard}
                  keyExtractor={keyExtractor}
                  contentContainerStyle={{ padding: 16, gap: 8 }}
                  showsVerticalScrollIndicator={false}
                />
              )
            )}
          </Box>
        </TabsContent>
      </Tabs>

      {/* Age Update Sheet (for Today tab) */}
      {selectedProjectForAge ? (
        <AgeUpdateSheet
          open={ageSheetOpen}
          onOpenChange={setAgeSheetOpen}
          project={selectedProjectForAge}
          onSubmit={handleAgeSubmit}
        />
      ) : null}

      {/* Project Detail Sheet (for Projects/Workflows tabs) */}
      {detailProject ? (
        <BottomSheetModal
          open={detailSheetOpen}
          onOpenChange={setDetailSheetOpen}
          snapPoints={['50%', '90%']}
        >
          <ProjectDetailContent projectId={detailProject.id} />
        </BottomSheetModal>
      ) : null}
    </Box>
  );
}
