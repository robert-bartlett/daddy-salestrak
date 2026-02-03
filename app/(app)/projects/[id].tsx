import { useState } from 'react';
import { Linking, Platform, View, Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, router } from 'expo-router';
import {
  MapPin,
  Calendar,
  Users,
  Briefcase,
  Navigation,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Link2,
  MoreHorizontal,
  Clock,
} from 'lucide-react-native';

import { Box, VStack, HStack, Center, Screen, Surface, BottomNav, TAB_BAR_HEIGHT } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getWorkflowById, getStageById, type Activity } from '@/lib/mock-data';
import { useProjects } from '@/lib/projects-context';
import { formatAge, getStatusFromAge, getStatusHexColor } from '@/lib/age-utils';
import { AgeUpdateSheet } from '../components/_age-update-sheet';
import { StageSelectSheet } from '../components/_stage-select-sheet';
import { WorkflowSelectSheet } from '../components/_workflow-select-sheet';
import { TeamMemberSheet } from '../components/_team-member-sheet';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getProjectById,
    getProjectActivities,
    updateProjectAge,
    updateProjectStage,
    updateProjectWorkflow,
    updateProjectOwners,
    updateProjectAssignees,
  } = useProjects();
  const project = getProjectById(id);

  // Sheet states
  const [ageSheetOpen, setAgeSheetOpen] = useState(false);
  const [stageSheetOpen, setStageSheetOpen] = useState(false);
  const [workflowSheetOpen, setWorkflowSheetOpen] = useState(false);
  const [ownersSheetOpen, setOwnersSheetOpen] = useState(false);
  const [assigneesSheetOpen, setAssigneesSheetOpen] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState('details');

  if (!project) {
    return (
      <Screen>
        <Center fill>
          <VStack gap="md" align="center">
            <Text size="lg">Project not found</Text>
            <Button onPress={() => router.back()}>Go Back</Button>
          </VStack>
        </Center>
      </Screen>
    );
  }

  const workflow = getWorkflowById(project.workflowId);
  const stage = getStageById(project.workflowId, project.stageId);
  const activities = getProjectActivities(project.id);

  const handleNavigate = () => {
    const address = encodeURIComponent(project.address);
    const url = Platform.select({
      ios: `maps://app?daddr=${address}`,
      android: `google.navigation:q=${address}`,
      default: `https://maps.google.com/maps?daddr=${address}`,
    });
    Linking.openURL(url);
  };

  const handleAgeUpdate = (
    status: Parameters<typeof updateProjectAge>[1],
    reason: Parameters<typeof updateProjectAge>[2],
    note?: string
  ) => {
    updateProjectAge(project.id, status, reason, note);
  };

  const handleStageChange = (stageId: string) => {
    updateProjectStage(project.id, stageId);
  };

  const handleWorkflowChange = (workflowId: string, stageId: string) => {
    updateProjectWorkflow(project.id, workflowId, stageId);
  };

  const handleOwnersChange = (owners: typeof project.owners) => {
    updateProjectOwners(project.id, owners);
  };

  const handleAssigneesChange = (assignees: typeof project.assignees) => {
    updateProjectAssignees(project.id, assignees);
  };

  const handleCopyLink = async () => {
    const link = `salestrak://projects/${project.id}`;
    await Clipboard.setStringAsync(link);
  };

  const handleMore = () => {
    // TODO: Open more options menu
  };

  return (
    <Screen safeArea="none">
      <Screen scroll safeArea="top" paddingX="md" topPadding={16} bottomPadding={TAB_BAR_HEIGHT + 16}>
        <VStack gap="lg">
          {/* Project Header */}
          <VStack gap="sm">
            <HStack justify="between" align="start">
              <View style={{ flex: 1 }}>
                <VStack gap="xs">
                  <Text size="2xl" weight="semibold">
                    {project.name}
                  </Text>
                  <HStack gap="xs" align="center">
                    <Icon as={MapPin} size={14} />
                    <Text size="sm" tone="muted">
                      {project.address}
                    </Text>
                  </HStack>
                </VStack>
              </View>
            </HStack>

            {/* Quick Actions */}
            <HStack gap="sm">
              <Button variant="secondary" size="xs" onPress={handleNavigate}>
                <Icon as={Navigation} size={14} />
                Navigate
              </Button>
              <Button variant="secondary" size="xs" onPress={() => {}}>
                <Icon as={MessageSquare} size={14} />
                Note
              </Button>
            </HStack>
          </VStack>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList variant="outline">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details">
              <VStack gap="lg">
                {/* Status Card */}
                <Surface variant="card" padding="md">
                  <VStack gap="md">
                    {/* Workflow - Tappable */}
                    <Pressable onPress={() => setWorkflowSheetOpen(true)}>
                      <HStack justify="between" align="center">
                        <Text size="sm" tone="muted">Workflow</Text>
                        <HStack gap="xs" align="center">
                          <Text weight="medium">{workflow?.name}</Text>
                          <Icon as={ChevronRight} size={16} />
                        </HStack>
                      </HStack>
                    </Pressable>

                    <Separator />

                    {/* Stage - Tappable */}
                    <Pressable onPress={() => setStageSheetOpen(true)}>
                      <HStack justify="between" align="center">
                        <Text size="sm" tone="muted">Stage</Text>
                        <HStack gap="xs" align="center">
                          {stage && (
                            <Badge variant="color" color={stage.color} size="lg">
                              <Text>{stage.name}</Text>
                            </Badge>
                          )}
                          <Icon as={ChevronRight} size={16} />
                        </HStack>
                      </HStack>
                    </Pressable>

                    <Separator />

                    {/* Age - Tappable */}
                    <HStack justify="between" align="center">
                      <Text size="sm" tone="muted">Age</Text>
                      <HStack gap="sm" align="center">
                        <Button variant="secondary" size="xs" onPress={() => setAgeSheetOpen(true)}>
                          <Icon as={Clock} size={14} color={getStatusHexColor(getStatusFromAge(project.ageResetAt))} />
                          <Text>{formatAge(project.ageResetAt)}</Text>
                        </Button>
                        <Icon as={ChevronRight} size={16} tone="muted" />
                      </HStack>
                    </HStack>
                  </VStack>
                </Surface>

                {/* Team */}
                <VStack gap="sm">
                  <HStack justify="between" align="center">
                    <Text weight="semibold">Team</Text>
                    <Button variant="ghost" size="sm" onPress={() => setOwnersSheetOpen(true)}>
                      <Icon as={Users} size={16} />
                      Manage
                    </Button>
                  </HStack>
                  <Surface variant="card" padding="md">
                    <VStack gap="md">
                      {/* Owners */}
                      <Pressable onPress={() => setOwnersSheetOpen(true)}>
                        <HStack justify="between" align="center">
                          <VStack gap="xs">
                            <Text size="sm" tone="muted">
                              Owners
                            </Text>
                            <HStack gap="sm" wrap>
                              {project.owners.length > 0 ? (
                                project.owners.map((owner) => (
                                  <HStack key={owner.id} gap="xs" align="center">
                                    <Avatar size="sm" alt={owner.name}>
                                      <AvatarFallback>
                                        <Text size="xs">{owner.initials}</Text>
                                      </AvatarFallback>
                                    </Avatar>
                                    <Text size="sm">{owner.name}</Text>
                                  </HStack>
                                ))
                              ) : (
                                <Text size="sm" tone="muted">
                                  No owners assigned
                                </Text>
                              )}
                            </HStack>
                          </VStack>
                          <Icon as={ChevronRight} size={16} />
                        </HStack>
                      </Pressable>

                      <Separator />

                      {/* Assignees */}
                      <Pressable onPress={() => setAssigneesSheetOpen(true)}>
                        <HStack justify="between" align="center">
                          <VStack gap="xs">
                            <Text size="sm" tone="muted">
                              Assignees
                            </Text>
                            <HStack gap="sm" wrap>
                              {project.assignees.length > 0 ? (
                                project.assignees.map((assignee) => (
                                  <HStack key={assignee.id} gap="xs" align="center">
                                    <Avatar size="sm" alt={assignee.name}>
                                      <AvatarFallback>
                                        <Text size="xs">{assignee.initials}</Text>
                                      </AvatarFallback>
                                    </Avatar>
                                    <Text size="sm">{assignee.name}</Text>
                                  </HStack>
                                ))
                              ) : (
                                <Text size="sm" tone="muted">
                                  No assignees
                                </Text>
                              )}
                            </HStack>
                          </VStack>
                          <Icon as={ChevronRight} size={16} />
                        </HStack>
                      </Pressable>
                    </VStack>
                  </Surface>
                </VStack>
              </VStack>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <VStack gap="md">
                {activities.length === 0 ? (
                  <Surface variant="muted" padding="lg">
                    <Text tone="muted" align="center">
                      No activity yet
                    </Text>
                  </Surface>
                ) : (
                  <VStack gap="xs">
                    {activities.map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </VStack>
                )}
              </VStack>
            </TabsContent>
          </Tabs>
        </VStack>
      </Screen>

      {/* Bottom Navigation */}
      <BottomNav
        left={
          <Button variant="ghost" size="sm" onPress={() => router.back()}>
            <Icon as={ChevronLeft} size={18} />
            <Text>Back</Text>
          </Button>
        }
        center={
          <Button variant="ghost" size="icon" onPress={handleCopyLink}>
            <Icon as={Link2} size={20} />
          </Button>
        }
        right={
          <Button variant="ghost" size="icon" onPress={handleMore}>
            <Icon as={MoreHorizontal} size={20} />
          </Button>
        }
      />

      {/* Sheets */}
      <AgeUpdateSheet
        open={ageSheetOpen}
        onOpenChange={setAgeSheetOpen}
        project={project}
        onSubmit={handleAgeUpdate}
      />

      {workflow && (
        <StageSelectSheet
          open={stageSheetOpen}
          onOpenChange={setStageSheetOpen}
          workflow={workflow}
          currentStageId={project.stageId}
          onSelectStage={handleStageChange}
        />
      )}

      <WorkflowSelectSheet
        open={workflowSheetOpen}
        onOpenChange={setWorkflowSheetOpen}
        currentWorkflowId={project.workflowId}
        currentStageId={project.stageId}
        onSelectWorkflow={handleWorkflowChange}
      />

      <TeamMemberSheet
        open={ownersSheetOpen}
        onOpenChange={setOwnersSheetOpen}
        role="owners"
        currentMembers={project.owners}
        onSave={handleOwnersChange}
        projectName={project.name}
      />

      <TeamMemberSheet
        open={assigneesSheetOpen}
        onOpenChange={setAssigneesSheetOpen}
        role="assignees"
        currentMembers={project.assignees}
        onSave={handleAssigneesChange}
        projectName={project.name}
      />
    </Screen>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Surface variant="card" padding="sm" rounded="md">
      <HStack gap="sm" align="start">
        <Avatar size="sm" alt={activity.user.name}>
          <AvatarFallback>
            <Text size="xs">{activity.user.initials}</Text>
          </AvatarFallback>
        </Avatar>
        <View style={{ flex: 1 }}>
          <VStack gap="xs">
            <HStack justify="between">
              <Text size="sm" weight="medium">
                {activity.user.name}
              </Text>
              <Text size="xs" tone="muted">
                {formatTimestamp(activity.timestamp)}
              </Text>
            </HStack>
            <Text size="sm" tone="muted">
              {activity.description}
            </Text>
          </VStack>
        </View>
      </HStack>
    </Surface>
  );
}
