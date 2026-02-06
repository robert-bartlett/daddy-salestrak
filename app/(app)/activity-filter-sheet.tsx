import { useEffect, useState, useCallback } from 'react';
import { Pressable, View, useColorScheme, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
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
import { useSheetContext, type DateRange } from '@/lib/sheet-context';
import { useAccentColors } from '@/lib/theme-context';
import { getIOSSheetColors } from '@/lib/ios-colors';
import { type ActivityType } from '@/lib/mock-data';

const ALL_ACTIVITY_TYPES: ActivityType[] = [
  'note',
  'stage_change',
  'age_update',
  'assignment',
  'created',
  'favorite',
  'archive',
];

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

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

/**
 * Native iOS Activity Filter Sheet
 */
export default function ActivityFilterSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);
  const isDark = colorScheme === 'dark';

  const accentColors = useAccentColors();
  const accentColor = accentColors?.primary ?? '#007AFF';

  const { getActivityFilterData, clearActivityFilterData } = useSheetContext();
  const data = getActivityFilterData();

  const [types, setTypes] = useState<ActivityType[]>(data?.filters.types ?? []);
  const [dateRange, setDateRange] = useState<DateRange>(data?.filters.dateRange ?? 'all');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (data?.filters) {
      setTypes(data.filters.types);
      setDateRange(data.filters.dateRange);
    }
  }, [data?.filters]);

  const handleTypeToggle = useCallback((type: ActivityType) => {
    setTypes((currentTypes) => {
      let newTypes: ActivityType[];

      if (currentTypes.length === 0) {
        // All selected (empty = all), deselect this one
        newTypes = ALL_ACTIVITY_TYPES.filter((t) => t !== type);
      } else if (currentTypes.includes(type)) {
        // Type is selected, deselect it (but keep at least one)
        if (currentTypes.length > 1) {
          newTypes = currentTypes.filter((t) => t !== type);
        } else {
          return currentTypes;
        }
      } else {
        // Type is not selected, select it
        newTypes = [...currentTypes, type];
        if (newTypes.length === ALL_ACTIVITY_TYPES.length) {
          newTypes = [];
        }
      }

      return newTypes;
    });
  }, []);

  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
  }, []);

  const handleClear = useCallback(() => {
    setTypes([]);
    setDateRange('all');
  }, []);

  const handleDone = useCallback(() => {
    if (data?.onFiltersChange) {
      data.onFiltersChange({ types, dateRange });
    }
    clearActivityFilterData();
    router.back();
  }, [data, types, dateRange, clearActivityFilterData, router]);

  const isTypeSelected = useCallback(
    (type: ActivityType) => {
      return types.length === 0 || types.includes(type);
    },
    [types]
  );

  const hasActiveFilters = types.length > 0 || dateRange !== 'all';

  if (!isMounted) {
    return (
      <BlurView
        intensity={100}
        tint="dark"
        style={{ flex: 1, backgroundColor: 'rgba(30, 30, 30, 0.25)' }}
      />
    );
  }

  if (!data) {
    return (
      <BlurView
        intensity={100}
        tint="dark"
        style={{ flex: 1, backgroundColor: 'rgba(30, 30, 30, 0.25)', padding: 20 }}
      >
        <Text style={{ color: colors.subtitle }}>No data available</Text>
      </BlurView>
    );
  }

  return (
    <BlurView
      intensity={100}
      tint="dark"
      style={{ flex: 1, backgroundColor: 'rgba(30, 30, 30, 0.25)' }}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 12,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.separator,
        }}
      >
        <Text size="lg" weight="semibold" style={{ color: colors.title }}>
          Filters
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 24 }}>
        {/* Activity type filters */}
        <VStack gap="sm">
          <Text size="sm" weight="medium" style={{ color: colors.subtitle }}>
            Activity types
          </Text>
          {ALL_ACTIVITY_TYPES.map((type) => {
            const IconComponent = ACTIVITY_ICONS[type];
            const isSelected = isTypeSelected(type);

            return (
              <Pressable key={type} onPress={() => handleTypeToggle(type)}>
                {({ pressed }) => (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      opacity: pressed ? 0.7 : 1,
                    }}
                  >
                    <View
                      style={{
                        height: 32,
                        width: 32,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 16,
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.05)',
                      }}
                    >
                      <Icon as={IconComponent} size={16} color={colors.title} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text weight="medium" style={{ color: colors.title }}>
                        {ACTIVITY_TYPE_LABELS[type]}
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 24,
                        width: 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 6,
                        backgroundColor: isSelected ? accentColor : 'transparent',
                        borderWidth: isSelected ? 0 : 1,
                        borderColor: isSelected ? 'transparent' : colors.separator,
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

        {/* Date range filter */}
        <VStack gap="sm">
          <Text size="sm" weight="medium" style={{ color: colors.subtitle }}>
            Date range
          </Text>
          {DATE_RANGE_OPTIONS.map((option) => {
            const isSelected = dateRange === option.value;

            return (
              <Pressable key={option.value} onPress={() => handleDateRangeChange(option.value)}>
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
                      <Text weight="medium" style={{ color: colors.title }}>
                        {option.label}
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 24,
                        width: 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 12,
                        backgroundColor: isSelected ? accentColor : 'transparent',
                        borderWidth: isSelected ? 0 : 1,
                        borderColor: isSelected ? 'transparent' : colors.separator,
                      }}
                    >
                      {isSelected ? (
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: '#fff',
                          }}
                        />
                      ) : null}
                    </View>
                  </View>
                )}
              </Pressable>
            );
          })}
        </VStack>
      </ScrollView>

      {/* Footer */}
      <View
        style={{
          padding: 16,
          paddingBottom: 16 + insets.bottom,
          borderTopWidth: 0.5,
          borderTopColor: colors.separator,
        }}
      >
        <HStack gap="sm">
          <View style={{ flex: 1 }}>
            <Button
              variant="outline"
              onPress={handleClear}
              disabled={!hasActiveFilters}
              style={{ opacity: hasActiveFilters ? 1 : 0.5 }}
            >
              <Text>Clear all</Text>
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button onPress={handleDone}>
              <Text style={{ color: '#fff' }}>Done</Text>
            </Button>
          </View>
        </HStack>
      </View>
    </BlurView>
  );
}
