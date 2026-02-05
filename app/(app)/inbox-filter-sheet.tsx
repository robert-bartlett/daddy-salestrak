import { useState, useCallback, useEffect } from 'react';
import { View, Pressable, ScrollView, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Check,
  MessageSquare,
  ArrowRightLeft,
  Calendar,
  UserPlus,
  Plus,
  Star,
  Archive,
} from 'lucide-react-native';

import { VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useSheetContext, type InboxFilters } from '@/lib/sheet-context';
import { getIOSSheetColors } from '@/lib/ios-colors';
import type { ActivityType } from '@/lib/mock-data';

const ALL_ACTIVITY_TYPES: ActivityType[] = ['note', 'stage_change', 'age_update', 'assignment', 'created', 'favorite', 'archive'];

const ACTIVITY_ICONS: Record<ActivityType, typeof MessageSquare> = {
  note: MessageSquare,
  stage_change: ArrowRightLeft,
  age_update: Calendar,
  assignment: UserPlus,
  created: Plus,
  favorite: Star,
  archive: Archive,
};

const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  note: 'Notes',
  stage_change: 'Stage moved',
  age_update: 'Age updated',
  assignment: 'Assignments',
  created: 'Project created',
  favorite: 'Favorited',
  archive: 'Archived',
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  note: '#3B82F6',
  stage_change: '#F59E0B',
  age_update: '#10B981',
  assignment: '#8B5CF6',
  created: '#0A84FF',
  favorite: '#EAB308',
  archive: '#6B7280',
};

export default function InboxFilterSheet() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);
  const { getInboxFilterData, clearInboxFilterData } = useSheetContext();

  const data = getInboxFilterData();
  const [showUnreadOnly, setShowUnreadOnly] = useState(data?.filters.showUnreadOnly ?? false);
  const [selectedTypes, setSelectedTypes] = useState<Set<ActivityType>>(
    new Set(data?.filters.selectedTypes ?? ALL_ACTIVITY_TYPES)
  );

  // Sync changes back to parent
  useEffect(() => {
    if (data?.onFiltersChange) {
      data.onFiltersChange({
        showUnreadOnly,
        selectedTypes: Array.from(selectedTypes),
      });
    }
  }, [showUnreadOnly, selectedTypes, data]);

  const hasActiveFilters = showUnreadOnly || selectedTypes.size < ALL_ACTIVITY_TYPES.length;

  const toggleActivityType = useCallback((type: ActivityType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) {
          next.delete(type);
        }
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setShowUnreadOnly(false);
    setSelectedTypes(new Set(ALL_ACTIVITY_TYPES));
  }, []);

  const handleDone = useCallback(() => {
    router.back();
  }, [router]);

  if (!data) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}>
        <Text style={{ color: colors.subtitle }}>No filter data available</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 12,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.separator,
        }}
      >
        <Text size="lg" weight="semibold" style={{ color: colors.title }}>
          Filters
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 24 }}
      >
        {/* Unread only filter */}
        <Pressable onPress={() => setShowUnreadOnly(!showUnreadOnly)}>
          {({ pressed }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                opacity: pressed ? 0.7 : 1,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text weight="medium" style={{ color: colors.title }}>Unread only</Text>
                <Text size="sm" style={{ color: colors.subtitle }}>
                  Show only unread notifications
                </Text>
              </View>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  backgroundColor: showUnreadOnly ? '#0A84FF' : 'transparent',
                  borderWidth: showUnreadOnly ? 0 : 1,
                  borderColor: colors.separator,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showUnreadOnly ? <Icon as={Check} size={16} color="#fff" /> : null}
              </View>
            </View>
          )}
        </Pressable>

        {/* Activity type filters */}
        <VStack gap="sm">
          <Text size="sm" weight="medium" style={{ color: colors.subtitle }}>
            Activity types
          </Text>
          {ALL_ACTIVITY_TYPES.map((type) => {
            const IconComponent = ACTIVITY_ICONS[type];
            const isSelected = selectedTypes.has(type);
            const iconColor = ACTIVITY_COLORS[type];

            return (
              <Pressable key={type} onPress={() => toggleActivityType(type)}>
                {({ pressed }) => (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      opacity: pressed ? 0.7 : 1,
                      paddingVertical: 4,
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: colors.rowBackground,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon as={IconComponent} size={16} color={iconColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text weight="medium" style={{ color: colors.title }}>
                        {ACTIVITY_TYPE_LABELS[type]}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        backgroundColor: isSelected ? '#0A84FF' : 'transparent',
                        borderWidth: isSelected ? 0 : 1,
                        borderColor: colors.separator,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isSelected ? <Icon as={Check} size={16} color="#fff" /> : null}
                    </View>
                  </View>
                )}
              </Pressable>
            );
          })}
        </VStack>
      </ScrollView>

      {/* Footer buttons */}
      <View
        style={{
          padding: 20,
          paddingBottom: 34,
          borderTopWidth: 0.5,
          borderTopColor: colors.separator,
          gap: 12,
          flexDirection: 'row',
        }}
      >
        <Pressable
          onPress={clearFilters}
          disabled={!hasActiveFilters}
          style={{
            flex: 1,
            paddingVertical: 14,
            borderRadius: 12,
            borderCurve: 'continuous',
            backgroundColor: colors.rowBackground,
            opacity: hasActiveFilters ? 1 : 0.5,
            alignItems: 'center',
          }}
        >
          <Text weight="semibold" style={{ color: colors.title }}>Clear all</Text>
        </Pressable>
        <Pressable
          onPress={handleDone}
          style={{
            flex: 1,
            paddingVertical: 14,
            borderRadius: 12,
            borderCurve: 'continuous',
            backgroundColor: '#0A84FF',
            alignItems: 'center',
          }}
        >
          <Text weight="semibold" style={{ color: '#fff' }}>Done</Text>
        </Pressable>
      </View>
    </View>
  );
}
