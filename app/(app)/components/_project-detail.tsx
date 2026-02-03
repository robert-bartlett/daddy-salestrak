import { useState } from 'react';
import { Linking, Platform, View, Pressable } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import {
  MapPin,
  Navigation,
  ChevronRight,
  Clock,
  Users,
  Send,
  Star,
  MoreHorizontal,
  Archive,
} from 'lucide-react-native';

import { BottomSheetScrollBody, BottomSheetFooter } from '@/components/ui/bottom-sheet';
import { useAccentColors } from '@/lib/theme-context';
import { VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProjects } from '@/lib/projects-context';
import { getWorkflowById, getStageById, type Activity as ActivityType } from '@/lib/mock-data';
import { formatAge, getStatusFromAge, getStatusHexColor } from '@/lib/age-utils';
import { getPinColor } from '@/lib/map-colors';
import { AgeUpdateSheet } from './_age-update-sheet';
import { StageSelectSheet } from './_stage-select-sheet';
import { WorkflowSelectSheet } from './_workflow-select-sheet';
import { TeamMemberSheet } from './_team-member-sheet';
import { ProjectActionsSheet } from './_project-actions-sheet';

type ProjectDetailContentProps = {
  projectId: string;
  /** If true, show activity view instead of widgets */
  showActivity?: boolean;
  /** If true, hide the inline footer (use when providing footer separately) */
  hideFooter?: boolean;
  /** Callback when the active tab changes (details/activity) */
  onActiveTabChange?: (tab: 'details' | 'activity') => void;
};

// Exported footer component for external use
type NoteInputFooterProps = {
  projectId: string;
  /** Called when the input is focused (e.g., to expand the sheet) */
  onFocus?: () => void;
  /** Hide the footer content but keep it mounted to prevent layout shift */
  hidden?: boolean;
};

export function NoteInputFooter({ projectId, onFocus, hidden = false }: NoteInputFooterProps) {
  const { addNote } = useProjects();
  const [noteText, setNoteText] = useState('');

  const handleSendNote = () => {
    if (!noteText.trim()) return;
    addNote(projectId, noteText.trim());
    setNoteText('');
  };

  return (
    <View style={{ opacity: hidden ? 0 : 1 }} pointerEvents={hidden ? 'none' : 'auto'}>
      <HStack gap="sm" align="center">
        <View style={{ flex: 1 }}>
          <Input
            placeholder="Add a note..."
            value={noteText}
            onChangeText={setNoteText}
            onSubmitEditing={handleSendNote}
            onFocus={onFocus}
            returnKeyType="send"
          />
        </View>
        <Button
          variant={noteText.trim() ? 'default' : 'ghost'}
          size="icon"
          onPress={handleSendNote}
          disabled={!noteText.trim()}
        >
          <Icon as={Send} size={18} />
        </Button>
      </HStack>
    </View>
  );
}

export function ProjectDetailContent({ projectId, showActivity = false, hideFooter = false, onActiveTabChange }: ProjectDetailContentProps) {
  const {
    getProjectById,
    getProjectActivities,
    updateProjectAge,
    updateProjectStage,
    updateProjectWorkflow,
    updateProjectOwners,
    updateProjectAssignees,
    addNote,
    toggleFavorite,
    unarchiveProject,
  } = useProjects();
  const accentColors = useAccentColors();
  const accentColor = accentColors?.primary ?? '#0A84FF';

  const project = getProjectById(projectId);

  // Sheet states
  const [ageSheetOpen, setAgeSheetOpen] = useState(false);
  const [stageSheetOpen, setStageSheetOpen] = useState(false);
  const [workflowSheetOpen, setWorkflowSheetOpen] = useState(false);
  const [ownersSheetOpen, setOwnersSheetOpen] = useState(false);
  const [assigneesSheetOpen, setAssigneesSheetOpen] = useState(false);
  const [actionsSheetOpen, setActionsSheetOpen] = useState(false);

  // Tab state - initialize based on showActivity prop
  const [activeTab, setActiveTab] = useState(showActivity ? 'activity' : 'details');
  const [noteText, setNoteText] = useState('');

  const handleSendNote = () => {
    if (!project || !noteText.trim()) return;
    addNote(project.id, noteText.trim());
    setNoteText('');
  };

  if (!project) {
    return (
      <BottomSheetScrollBody>
        <Text style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Project not found</Text>
      </BottomSheetScrollBody>
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
    if (url) Linking.openURL(url);
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

  const handleToggleFavorite = () => {
    toggleFavorite(project.id);
  };

  const handleUnarchive = () => {
    unarchiveProject(project.id);
  };

  // Dark theme colors for the sheet
  const colors = {
    text: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.5)',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.1)',
    accent: accentColor,
  };

  const stageColor = stage ? getPinColor(stage.color) : colors.textMuted;

  return (
    <>

      <BottomSheetScrollBody contentContainerStyle={{ paddingBottom: 40 }}>
        <VStack gap="lg">
          {/* Project Header */}
          <HStack justify="between" align="start">
            <View style={{ flex: 1 }}>
              <VStack gap="sm">
                <Text size="2xl" weight="semibold" style={{ color: colors.text }}>
                  {project.name}
                </Text>
                <HStack gap="xs" align="center">
                  <Icon as={MapPin} size={14} color={colors.textMuted} />
                  <Text size="sm" style={{ color: colors.textMuted, flex: 1 }} numberOfLines={1}>
                    {project.address}
                  </Text>
                </HStack>
              </VStack>
            </View>

            {/* Favorite Button */}
            <Button variant="ghost" size="icon" onPress={handleToggleFavorite}>
              <Icon
                as={Star}
                size={20}
                color={project.isFavorite ? '#FFD700' : colors.textMuted}
                fill={project.isFavorite ? '#FFD700' : 'none'}
              />
            </Button>
          </HStack>

          {/* Archived Banner */}
          {project.isArchived ? (
            <Pressable onPress={handleUnarchive}>
              <View
                style={{
                  backgroundColor: 'rgba(107, 114, 128, 0.3)',
                  borderRadius: 8,
                  padding: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Icon as={Archive} size={18} color={colors.textSecondary} />
                <View style={{ flex: 1 }}>
                  <Text size="sm" weight="medium" style={{ color: colors.text }}>
                    This project is archived
                  </Text>
                  <Text size="xs" style={{ color: colors.textMuted }}>
                    Tap to restore
                  </Text>
                </View>
                <Icon as={ChevronRight} size={16} color={colors.textMuted} />
              </View>
            </Pressable>
          ) : null}

          {/* Tabs for Details/Activity */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              onActiveTabChange?.(value as 'details' | 'activity');
            }}
          >
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">
                Details
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex-1">
                Activity
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Widget Grid - shown when viewing details */}
          {activeTab === 'details' && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {/* Age Widget - Half width */}
              <Pressable
                onPress={() => setAgeSheetOpen(true)}
                style={{
                  width: '47%',
                  backgroundColor: colors.cardBg,
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <VStack gap="sm">
                  <HStack justify="between" align="center">
                    <Icon as={Clock} size={20} color={getStatusHexColor(getStatusFromAge(project.ageResetAt))} />
                    <Icon as={ChevronRight} size={16} color={colors.textMuted} />
                  </HStack>
                  <VStack gap="xs">
                    <Text size="xs" style={{ color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Age
                    </Text>
                    <Text size="xl" weight="bold" style={{ color: getStatusHexColor(getStatusFromAge(project.ageResetAt)) }}>
                      {formatAge(project.ageResetAt)}
                    </Text>
                  </VStack>
                </VStack>
              </Pressable>

              {/* Stage Widget - Half width */}
              <Pressable
                onPress={() => setStageSheetOpen(true)}
                style={{
                  width: '47%',
                  backgroundColor: colors.cardBg,
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <VStack gap="sm">
                  <HStack justify="between" align="center">
                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: stageColor }} />
                    <Icon as={ChevronRight} size={16} color={colors.textMuted} />
                  </HStack>
                  <VStack gap="xs">
                    <Text size="xs" style={{ color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Stage
                    </Text>
                    <Text size="lg" weight="semibold" style={{ color: colors.text }} numberOfLines={1}>
                      {stage?.name ?? 'None'}
                    </Text>
                  </VStack>
                </VStack>
              </Pressable>

              {/* Workflow Widget - Full width */}
              <Pressable
                onPress={() => setWorkflowSheetOpen(true)}
                style={{
                  width: '100%',
                  backgroundColor: colors.cardBg,
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <HStack justify="between" align="center">
                  <VStack gap="xs">
                    <Text size="xs" style={{ color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Workflow
                    </Text>
                    <Text size="lg" weight="semibold" style={{ color: colors.text }}>
                      {workflow?.name ?? 'None'}
                    </Text>
                  </VStack>
                  <Icon as={ChevronRight} size={16} color={colors.textMuted} />
                </HStack>
              </Pressable>

              {/* Owners Widget - Half width */}
              <Pressable
                onPress={() => setOwnersSheetOpen(true)}
                style={{
                  width: '47%',
                  backgroundColor: colors.cardBg,
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <VStack gap="sm">
                  <HStack justify="between" align="center">
                    <Icon as={Users} size={20} color={colors.accent} />
                    <Icon as={ChevronRight} size={16} color={colors.textMuted} />
                  </HStack>
                  <VStack gap="xs">
                    <Text size="xs" style={{ color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Owners
                    </Text>
                    {project.owners.length > 0 ? (
                      <HStack gap="xs">
                        {project.owners.slice(0, 3).map((owner) => (
                          <Avatar key={owner.id} size="sm" alt={owner.name}>
                            <AvatarFallback>
                              <Text size="xs" style={{ color: colors.text }}>{owner.initials}</Text>
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {project.owners.length > 3 && (
                          <Text size="sm" style={{ color: colors.textMuted }}>+{project.owners.length - 3}</Text>
                        )}
                      </HStack>
                    ) : (
                      <Text size="sm" style={{ color: colors.textMuted }}>None</Text>
                    )}
                  </VStack>
                </VStack>
              </Pressable>

              {/* Assignees Widget - Half width */}
              <Pressable
                onPress={() => setAssigneesSheetOpen(true)}
                style={{
                  width: '47%',
                  backgroundColor: colors.cardBg,
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <VStack gap="sm">
                  <HStack justify="between" align="center">
                    <Icon as={Users} size={20} color={colors.textSecondary} />
                    <Icon as={ChevronRight} size={16} color={colors.textMuted} />
                  </HStack>
                  <VStack gap="xs">
                    <Text size="xs" style={{ color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Assignees
                    </Text>
                    {project.assignees.length > 0 ? (
                      <HStack gap="xs">
                        {project.assignees.slice(0, 3).map((assignee) => (
                          <Avatar key={assignee.id} size="sm" alt={assignee.name}>
                            <AvatarFallback>
                              <Text size="xs" style={{ color: colors.text }}>{assignee.initials}</Text>
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {project.assignees.length > 3 && (
                          <Text size="sm" style={{ color: colors.textMuted }}>+{project.assignees.length - 3}</Text>
                        )}
                      </HStack>
                    ) : (
                      <Text size="sm" style={{ color: colors.textMuted }}>None</Text>
                    )}
                  </VStack>
                </VStack>
              </Pressable>

              {/* Map Preview Widget - Full width */}
              <Pressable
                onPress={handleNavigate}
                style={{
                  width: '100%',
                  height: 140,
                  borderRadius: 16,
                  overflow: 'hidden',
                }}
              >
                <MapView
                  style={{ flex: 1 }}
                  provider={PROVIDER_DEFAULT}
                  initialRegion={{
                    latitude: project.latitude,
                    longitude: project.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                  pointerEvents="none"
                >
                  <Marker
                    coordinate={{
                      latitude: project.latitude,
                      longitude: project.longitude,
                    }}
                    pinColor={stageColor}
                  />
                </MapView>
                {/* Navigate overlay hint */}
                <View
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                  }}
                >
                  <Icon as={Navigation} size={12} color="#fff" />
                  <Text size="xs" style={{ color: '#fff' }}>Tap to navigate</Text>
                </View>
              </Pressable>

              {/* More Actions - at bottom of details */}
              <Pressable
                onPress={() => setActionsSheetOpen(true)}
                style={{
                  width: '100%',
                  backgroundColor: colors.cardBg,
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <HStack justify="between" align="center">
                  <HStack gap="sm" align="center">
                    <Icon as={MoreHorizontal} size={18} color={colors.textSecondary} />
                    <Text style={{ color: colors.text }}>More Actions</Text>
                  </HStack>
                  <Icon as={ChevronRight} size={16} color={colors.textMuted} />
                </HStack>
              </Pressable>
            </View>
          )}

          {/* Activity View - shown when viewing activity */}
          {activeTab === 'activity' && (
            <VStack gap="sm">
              {activities.length === 0 ? (
                <View style={{ backgroundColor: colors.cardBg, borderRadius: 12, padding: 24 }}>
                  <Text style={{ color: colors.textMuted, textAlign: 'center' }}>No activity yet</Text>
                </View>
              ) : (
                activities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} colors={colors} />
                ))
              )}
            </VStack>
          )}
        </VStack>
      </BottomSheetScrollBody>

      {/* Note input footer (when viewing activity and not hidden) */}
      {activeTab === 'activity' && !hideFooter && (
        <BottomSheetFooter>
          <HStack gap="sm" align="center">
            <View style={{ flex: 1 }}>
              <Input
                placeholder="Add a note..."
                value={noteText}
                onChangeText={setNoteText}
                onSubmitEditing={handleSendNote}
                returnKeyType="send"
              />
            </View>
            <Button
              variant={noteText.trim() ? 'default' : 'ghost'}
              size="icon"
              onPress={handleSendNote}
              disabled={!noteText.trim()}
            >
              <Icon as={Send} size={18} />
            </Button>
          </HStack>
        </BottomSheetFooter>
      )}

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

      <ProjectActionsSheet
        open={actionsSheetOpen}
        onOpenChange={setActionsSheetOpen}
        project={project}
      />
    </>
  );
}

type ActivityColors = {
  text: string;
  textMuted: string;
  textSecondary: string;
  cardBg: string;
  border: string;
  accent: string;
};

function ActivityItem({ activity, colors }: { activity: ActivityType; colors: ActivityColors }) {
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
    <View style={{ backgroundColor: colors.cardBg, borderRadius: 8, padding: 12 }}>
      <HStack gap="sm" align="start">
        <Avatar size="sm" alt={activity.user.name}>
          <AvatarFallback>
            <Text size="xs" style={{ color: colors.text }}>{activity.user.initials}</Text>
          </AvatarFallback>
        </Avatar>
        <View style={{ flex: 1 }}>
          <VStack gap="xs">
            <HStack justify="between">
              <Text size="sm" weight="medium" style={{ color: colors.text }}>
                {activity.user.name}
              </Text>
              <Text size="xs" style={{ color: colors.textMuted }}>
                {formatTimestamp(activity.timestamp)}
              </Text>
            </HStack>
            <Text size="sm" style={{ color: colors.textMuted }}>
              {activity.description}
            </Text>
          </VStack>
        </View>
      </HStack>
    </View>
  );
}
