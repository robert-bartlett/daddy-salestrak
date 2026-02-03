import { useState, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import {
  MessageSquare,
  ArrowRightLeft,
  Calendar,
  UserPlus,
  Plus,
  Star,
  Archive,
} from 'lucide-react-native';

import {
  BottomSheetScrollBody,
  BottomSheetHeader,
} from '@/components/ui/bottom-sheet';
import { Box, VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useProjects } from '@/lib/projects-context';
import { useMapSheet } from '@/lib/map-sheet-context';
import { type Activity, type ActivityType } from '@/lib/mock-data';

type InboxTab = 'all' | 'notes' | 'activity';

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

export function InboxSheetContent() {
  const [activeTab, setActiveTab] = useState<InboxTab>('all');
  const { activities, getProjectById, markAllActivitiesRead } = useProjects();
  const { expandProject } = useMapSheet();

  // Sort activities by timestamp (newest first)
  const sortedActivities = useMemo(() => {
    return [...activities].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, [activities]);

  // Calculate unread counts
  const unreadAll = useMemo(
    () => sortedActivities.filter((a) => !a.read).length,
    [sortedActivities]
  );
  const unreadNotes = useMemo(
    () => sortedActivities.filter((a) => a.type === 'note' && !a.read).length,
    [sortedActivities]
  );

  // Filter activities based on active tab
  const filteredActivities = useMemo(() => {
    if (activeTab === 'all') return sortedActivities;
    if (activeTab === 'notes')
      return sortedActivities.filter((a) => a.type === 'note');
    // 'activity' tab shows non-note activities
    return sortedActivities.filter((a) => a.type !== 'note');
  }, [sortedActivities, activeTab]);

  const handleActivityPress = (projectId: string) => {
    expandProject(projectId);
  };

  const handleMarkAllRead = () => {
    markAllActivitiesRead?.();
  };

  return (
    <>
      <BottomSheetHeader>
        <HStack justify="between" align="center">
          <Text size="lg" weight="semibold">
            Inbox
          </Text>
          {unreadAll > 0 && (
            <Button variant="ghost" size="sm" onPress={handleMarkAllRead}>
              <Text size="sm" tone="primary">
                Mark all read
              </Text>
            </Button>
          )}
        </HStack>
      </BottomSheetHeader>

      {/* Tab bar */}
      <Box paddingX="md" paddingY="sm">
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
      </Box>

      <BottomSheetScrollBody contentContainerStyle={{ paddingBottom: 40 }}>
        {filteredActivities.length === 0 ? (
          <Box padding="xl">
            <VStack gap="sm" align="center">
              <Icon
                as={MessageSquare}
                size={48}
                className="text-muted-foreground opacity-50"
              />
              <Text tone="muted">No notifications</Text>
            </VStack>
          </Box>
        ) : (
          <VStack>
            {filteredActivities.map((activity, index) => (
              <View key={activity.id}>
                <ActivityItem
                  activity={activity}
                  projectName={getProjectById(activity.projectId)?.name}
                  onPress={() => handleActivityPress(activity.projectId)}
                />
                {index < filteredActivities.length - 1 && (
                  <View className="mx-4 h-px bg-border" />
                )}
              </View>
            ))}
          </VStack>
        )}
      </BottomSheetScrollBody>
    </>
  );
}
