import { useState } from 'react';
import { View, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import { ChevronLeft, MessageSquare, Send } from 'lucide-react-native';

import {
  BottomSheetScrollBody,
  BottomSheetHeader,
  BottomSheetFooter,
} from '@/components/ui/bottom-sheet';
import { VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useProjects } from '@/lib/projects-context';
import { useMapSheet } from '@/lib/map-sheet-context';
import { useAccentColors } from '@/lib/theme-context';
import { type Activity } from '@/lib/mock-data';

type ProjectActivityContentProps = {
  projectId: string;
  /** If true, hide the inline footer (use when providing footer separately) */
  hideFooter?: boolean;
};

export function ProjectActivityContent({ projectId, hideFooter = false }: ProjectActivityContentProps) {
  const { getProjectById, getProjectActivities, addNote } = useProjects();
  const { exitActivity } = useMapSheet();
  const [noteText, setNoteText] = useState('');
  const accentColors = useAccentColors();
  const accentColor = accentColors?.primary ?? '#0A84FF';

  const project = getProjectById(projectId);
  const activities = project ? getProjectActivities(project.id) : [];

  // Dark theme colors for the sheet
  const colors = {
    text: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.5)',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.1)',
    accent: accentColor,
  };

  const handleSendNote = () => {
    if (!project || !noteText.trim()) return;
    addNote(project.id, noteText.trim());
    setNoteText('');
  };

  if (!project) {
    return (
      <BottomSheetScrollBody>
        <Text style={{ color: colors.textMuted }}>Project not found</Text>
      </BottomSheetScrollBody>
    );
  }

  return (
    <>
      <BottomSheetHeader>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          <Pressable
            onPress={() => exitActivity(projectId)}
            hitSlop={8}
            style={{
              padding: 4,
              marginLeft: -4,
            }}
          >
            <Icon as={ChevronLeft} size={24} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text size="lg" weight="semibold" style={{ color: colors.text }}>
              Activity
            </Text>
            <Text size="sm" style={{ color: colors.textMuted, marginTop: 2 }} numberOfLines={1}>
              {project.name}
            </Text>
          </View>
        </View>
      </BottomSheetHeader>

      <BottomSheetScrollBody contentContainerStyle={{ paddingBottom: 100 }}>
        <VStack gap="md">
          {activities.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.cardBg,
                borderRadius: 16,
                padding: 32,
                alignItems: 'center',
              }}
            >
              <Icon as={MessageSquare} size={32} color={colors.textMuted} />
              <Text
                size="lg"
                weight="medium"
                style={{ color: colors.textSecondary, marginTop: 12, textAlign: 'center' }}
              >
                No activity yet
              </Text>
              <Text
                size="sm"
                style={{ color: colors.textMuted, marginTop: 4, textAlign: 'center' }}
              >
                Updates and notes will appear here
              </Text>
            </View>
          ) : (
            <VStack gap="sm">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} colors={colors} />
              ))}
            </VStack>
          )}
        </VStack>
      </BottomSheetScrollBody>

      {/* Note input footer (when not hidden) */}
      {!hideFooter && (
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

function ActivityItem({ activity, colors }: { activity: Activity; colors: ActivityColors }) {
  const formatTimestamp = (date: Date): string => {
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
  };

  const getActivityTypeLabel = (type: Activity['type']): string => {
    switch (type) {
      case 'note':
        return 'Note';
      case 'age_update':
        return 'Age Update';
      case 'stage_change':
        return 'Stage Change';
      case 'assignment':
        return 'Assignment';
      case 'created':
        return 'Created';
      default:
        return 'Update';
    }
  };

  return (
    <View style={{ backgroundColor: colors.cardBg, borderRadius: 12, padding: 16 }}>
      <HStack gap="sm" align="start">
        <Avatar size="default" alt={activity.user.name}>
          <AvatarFallback>
            <Text size="sm" style={{ color: colors.text }}>
              {activity.user.initials}
            </Text>
          </AvatarFallback>
        </Avatar>
        <View style={{ flex: 1 }}>
          <VStack gap="xs">
            <HStack justify="between" align="center">
              <Text size="sm" weight="semibold" style={{ color: colors.text }}>
                {activity.user.name}
              </Text>
              <Text size="xs" style={{ color: colors.textMuted }}>
                {formatTimestamp(activity.timestamp)}
              </Text>
            </HStack>
            <Text size="xs" style={{ color: colors.accent }}>
              {getActivityTypeLabel(activity.type)}
            </Text>
            <Text size="sm" style={{ color: colors.textSecondary, marginTop: 4 }}>
              {activity.description}
            </Text>
          </VStack>
        </View>
      </HStack>
    </View>
  );
}
