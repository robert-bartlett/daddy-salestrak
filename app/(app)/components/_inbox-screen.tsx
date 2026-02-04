import { useState, useMemo } from 'react';
import { Pressable, View, FlatList } from 'react-native';
import {
  MessageSquare,
  ArrowRightLeft,
  Calendar,
  UserPlus,
  Plus,
  SlidersHorizontal,
  Check,
  Star,
  Archive,
} from 'lucide-react-native';

import { Box, VStack, HStack, Header } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { BottomSheetModal } from '@/components/ui/bottom-sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useProjects } from '@/lib/projects-context';
import { useAccentColors } from '@/lib/theme-context';
import { type Activity, type ActivityType } from '@/lib/mock-data';
import { ProjectDetailContent, NoteInputFooter } from './_project-detail';

type InboxTab = 'all' | 'notes' | 'activity';

type InboxScreenProps = {
  /** Callback when back button is pressed */
  onBackPress: () => void;
  /** External control to open filter sheet */
  filterSheetOpen?: boolean;
  /** Callback when filter sheet open state changes */
  onFilterSheetOpenChange?: (open: boolean) => void;
};

const ACTIVITY_ICONS: Record<ActivityType, typeof MessageSquare> = {
  note: MessageSquare,
  stage_change: ArrowRightLeft,
  age_update: Calendar,
  assignment: UserPlus,
  created: Plus,
  favorite: Star,
  archive: Archive,
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  note: 'text-blue-500',
  stage_change: 'text-amber-500',
  age_update: 'text-emerald-500',
  assignment: 'text-purple-500',
  created: 'text-primary',
  favorite: 'text-yellow-500',
  archive: 'text-gray-500',
};

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
    }
    return `${diffHours}h ago`;
  }

  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getActivityTitle(activity: Activity): string {
  const userName = activity.user.name;
  switch (activity.type) {
    case 'note':
      return `${userName} added a note`;
    case 'stage_change':
      return `${userName} moved stage`;
    case 'age_update':
      return `${userName} updated age`;
    case 'assignment':
      return `${userName} assigned someone`;
    case 'created':
      return `${userName} created project`;
    default:
      return `${userName} made an update`;
  }
}

function ActivityIcon({ type }: { type: ActivityType }) {
  const IconComponent = ACTIVITY_ICONS[type];
  const colorClass = ACTIVITY_COLORS[type];

  return (
    <View className="absolute -bottom-0.5 -right-0.5 h-5 w-5 items-center justify-center rounded-full bg-background">
      <Icon as={IconComponent} size={12} className={colorClass} />
    </View>
  );
}

type ActivityItemProps = {
  activity: Activity;
  projectName?: string;
  onPress: () => void;
};

function ActivityItem({ activity, projectName, onPress }: ActivityItemProps) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          className={`px-4 py-3 ${activity.read ? 'bg-background' : 'bg-muted/50'}`}
          style={{ opacity: pressed ? 0.7 : 1 }}
        >
          <HStack gap="md" align="start">
            {/* Avatar with type icon overlay */}
            <View className="relative">
              <Avatar size="default" alt={activity.user.name}>
                <AvatarFallback>
                  <Text size="sm" weight="medium">
                    {activity.user.initials}
                  </Text>
                </AvatarFallback>
              </Avatar>
              <ActivityIcon type={activity.type} />
            </View>

            {/* Content */}
            <View style={{ flex: 1 }}>
              <VStack gap="xs">
                {/* Title row with unread indicator */}
                <HStack gap="sm" align="center">
                  <View style={{ flex: 1 }}>
                    <Text
                      size="sm"
                      weight={activity.read ? 'regular' : 'medium'}
                      tone={activity.read ? 'muted' : 'default'}
                      numberOfLines={1}
                    >
                      {getActivityTitle(activity)}
                    </Text>
                  </View>
                  {!activity.read && (
                    <View className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </HStack>

                {/* Description */}
                <Text size="sm" tone="muted" numberOfLines={1}>
                  {activity.description}
                </Text>

                {/* Project name and timestamp */}
                <HStack gap="sm" align="center">
                  {projectName && (
                    <>
                      <Text size="xs" tone="muted" numberOfLines={1}>
                        {projectName}
                      </Text>
                      <Text size="xs" tone="muted">
                        ·
                      </Text>
                    </>
                  )}
                  <Text size="xs" tone="muted">
                    {formatTimestamp(activity.timestamp)}
                  </Text>
                </HStack>
              </VStack>
            </View>
          </HStack>
        </View>
      )}
    </Pressable>
  );
}

const ALL_ACTIVITY_TYPES: ActivityType[] = ['note', 'stage_change', 'age_update', 'assignment', 'created', 'favorite', 'archive'];

const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  note: 'Notes',
  stage_change: 'Stage moved',
  age_update: 'Age updated',
  assignment: 'Assignments',
  created: 'Project created',
  favorite: 'Favorited',
  archive: 'Archived',
};

export function InboxScreen({
  onBackPress,
  filterSheetOpen: externalFilterSheetOpen,
  onFilterSheetOpenChange,
}: InboxScreenProps) {
  const [activeTab, setActiveTab] = useState<InboxTab>('all');
  const [internalFilterSheetOpen, setInternalFilterSheetOpen] = useState(false);

  // Use external control if provided, otherwise use internal state
  const filterSheetOpen = externalFilterSheetOpen ?? internalFilterSheetOpen;
  const setFilterSheetOpen = onFilterSheetOpenChange ?? setInternalFilterSheetOpen;
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<ActivityType>>(new Set(ALL_ACTIVITY_TYPES));
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectSheetOpen, setProjectSheetOpen] = useState(false);
  const { activities, getProjectById, markAllActivitiesRead, markActivityRead } = useProjects();
  const accentColors = useAccentColors();

  // Sort activities by timestamp (newest first)
  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [activities]);

  // Calculate unread counts
  const unreadAll = useMemo(() => sortedActivities.filter((a) => !a.read).length, [sortedActivities]);
  const unreadNotes = useMemo(
    () => sortedActivities.filter((a) => a.type === 'note' && !a.read).length,
    [sortedActivities]
  );

  // Filter activities based on active tab and filters
  const filteredActivities = useMemo(() => {
    let result = sortedActivities;

    // Apply tab filter
    if (activeTab === 'notes') {
      result = result.filter((a) => a.type === 'note');
    } else if (activeTab === 'activity') {
      result = result.filter((a) => a.type !== 'note');
    }

    // Apply unread filter
    if (showUnreadOnly) {
      result = result.filter((a) => !a.read);
    }

    // Apply activity type filter
    if (selectedTypes.size < ALL_ACTIVITY_TYPES.length) {
      result = result.filter((a) => selectedTypes.has(a.type));
    }

    return result;
  }, [sortedActivities, activeTab, showUnreadOnly, selectedTypes]);

  const hasActiveFilters = showUnreadOnly || selectedTypes.size < ALL_ACTIVITY_TYPES.length;

  const toggleActivityType = (type: ActivityType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        // Don't allow deselecting all types
        if (next.size > 1) {
          next.delete(type);
        }
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setShowUnreadOnly(false);
    setSelectedTypes(new Set(ALL_ACTIVITY_TYPES));
  };

  const handleActivityPress = (activity: Activity) => {
    // Mark as read
    if (!activity.read) {
      markActivityRead(activity.id);
    }
    // Open project detail sheet within inbox
    setSelectedProjectId(activity.projectId);
    setProjectSheetOpen(true);
  };

  const handleMarkAllRead = () => {
    markAllActivitiesRead?.();
  };

  const renderActivity = ({ item: activity }: { item: Activity }) => {
    const projectName = getProjectById(activity.projectId)?.name;

    return (
      <ActivityItem
        activity={activity}
        projectName={projectName}
        onPress={() => handleActivityPress(activity)}
      />
    );
  };

  return (
    <Box fill background="default">
      {/* Header */}
      <Header
        title="Inbox"
        safeAreaTop
        background="default"
        right={
          unreadAll > 0 ? (
            <Button variant="ghost" size="sm" onPress={handleMarkAllRead}>
              <Text size="sm" tone="primary">
                Mark all read
              </Text>
            </Button>
          ) : undefined
        }
      />

      {/* Tab bar */}
      <Box paddingX="md" paddingY="sm" background="default">
        <HStack justify="between" align="center">
          <HStack gap="xs">
            <Button
              variant={activeTab === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onPress={() => setActiveTab('all')}
            >
              <HStack gap="xs" align="center">
                <Text size="sm">All</Text>
                {unreadAll > 0 && (
                  <Badge
                    variant={activeTab === 'all' ? 'default' : 'secondary'}
                    size="sm"
                  >
                    <Text>{unreadAll}</Text>
                  </Badge>
                )}
              </HStack>
            </Button>
            <Button
              variant={activeTab === 'notes' ? 'secondary' : 'ghost'}
              size="sm"
              onPress={() => setActiveTab('notes')}
            >
              <HStack gap="xs" align="center">
                <Text size="sm">Notes</Text>
                {unreadNotes > 0 && (
                  <Badge
                    variant={activeTab === 'notes' ? 'default' : 'secondary'}
                    size="sm"
                  >
                    <Text>{unreadNotes}</Text>
                  </Badge>
                )}
              </HStack>
            </Button>
            <Button
              variant={activeTab === 'activity' ? 'secondary' : 'ghost'}
              size="sm"
              onPress={() => setActiveTab('activity')}
            >
              <Text size="sm">Activity</Text>
            </Button>
          </HStack>

          {/* Filter button */}
          <View className="relative">
            <Button variant="ghost" size="icon" onPress={() => setFilterSheetOpen(true)}>
              <Icon as={SlidersHorizontal} size={18} />
            </Button>
            {hasActiveFilters && (
              <View className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary" />
            )}
          </View>
        </HStack>
      </Box>

      {/* Activity list */}
      <FlatList
        data={filteredActivities}
        keyExtractor={(item) => item.id}
        renderItem={renderActivity}
        ItemSeparatorComponent={() => (
          <View className="mx-4 h-px bg-border" />
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Box padding="xl">
            <VStack gap="sm" align="center">
              <Icon as={MessageSquare} size={48} className="text-muted-foreground opacity-50" />
              <Text tone="muted">No notifications</Text>
            </VStack>
          </Box>
        }
      />

      {/* Filter Sheet */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="bottom" showCloseButton={false}>
          <Box padding="lg">
            <VStack gap="lg">
              {/* Header */}
              <Text size="lg" weight="semibold">Filters</Text>

              {/* Unread only filter */}
              <Pressable onPress={() => setShowUnreadOnly(!showUnreadOnly)}>
                {({ pressed }) => (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.7 : 1 }}>
                    <View className="flex-1">
                      <Text weight="medium">Unread only</Text>
                      <Text size="sm" tone="muted">
                        Show only unread notifications
                      </Text>
                    </View>
                    <View
                      className="h-6 w-6 items-center justify-center rounded-md"
                      style={{
                        backgroundColor: showUnreadOnly ? accentColors?.primary : 'transparent',
                        borderWidth: showUnreadOnly ? 0 : 1,
                        borderColor: showUnreadOnly ? 'transparent' : 'rgba(255,255,255,0.2)',
                      }}
                    >
                      {showUnreadOnly && <Icon as={Check} size={16} color="#fff" />}
                    </View>
                  </View>
                )}
              </Pressable>

              {/* Activity type filters */}
              <VStack gap="sm">
                <Text size="sm" weight="medium" tone="muted">
                  Activity types
                </Text>
                {ALL_ACTIVITY_TYPES.map((type) => {
                  const IconComponent = ACTIVITY_ICONS[type];
                  const colorClass = ACTIVITY_COLORS[type];
                  const isSelected = selectedTypes.has(type);

                  return (
                    <Pressable key={type} onPress={() => toggleActivityType(type)}>
                      {({ pressed }) => (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.7 : 1 }}>
                          <View className="h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <Icon as={IconComponent} size={16} className={colorClass} />
                          </View>
                          <View className="flex-1">
                            <Text weight="medium">{ACTIVITY_TYPE_LABELS[type]}</Text>
                          </View>
                          <View
                            className="h-6 w-6 items-center justify-center rounded-md"
                            style={{
                              backgroundColor: isSelected ? accentColors?.primary : 'transparent',
                              borderWidth: isSelected ? 0 : 1,
                              borderColor: isSelected ? 'transparent' : 'rgba(255,255,255,0.2)',
                            }}
                          >
                            {isSelected && <Icon as={Check} size={16} color="#fff" />}
                          </View>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </VStack>

              {/* Footer buttons */}
              <HStack gap="sm">
                <Button
                  variant="outline"
                  onPress={clearFilters}
                  disabled={!hasActiveFilters}
                  style={{ flex: 1, opacity: hasActiveFilters ? 1 : 0.5 }}
                >
                  <Text>Clear all</Text>
                </Button>
                <Button
                  variant="default"
                  onPress={() => setFilterSheetOpen(false)}
                  style={{
                    flex: 1,
                    backgroundColor: accentColors?.primary,
                  }}
                >
                  <Text style={{ color: '#fff' }}>Done</Text>
                </Button>
              </HStack>
            </VStack>
          </Box>
        </SheetContent>
      </Sheet>

      {/* Project Detail Sheet - opens when clicking an inbox item */}
      <BottomSheetModal
        open={projectSheetOpen}
        onOpenChange={setProjectSheetOpen}
        snapPoints={['50%', '90%']}
        footer={selectedProjectId ? <NoteInputFooter projectId={selectedProjectId} /> : undefined}
      >
        {selectedProjectId && (
          <ProjectDetailContent projectId={selectedProjectId} showActivity hideFooter />
        )}
      </BottomSheetModal>
    </Box>
  );
}
