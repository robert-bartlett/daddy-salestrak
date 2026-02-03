import { Pressable, View } from 'react-native';
import {
  Check,
  MessageSquare,
  ArrowRightLeft,
  Calendar,
  UserPlus,
  Plus,
} from 'lucide-react-native';

import { Box, VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useAccentColors } from '@/lib/theme-context';
import { type ActivityType } from '@/lib/mock-data';

export type DateRange = 'today' | 'week' | 'month' | 'all';

export type ActivityFilters = {
  types: ActivityType[];
  dateRange: DateRange;
};

type ActivityFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ActivityFilters;
  onFiltersChange: (filters: ActivityFilters) => void;
};

const ALL_ACTIVITY_TYPES: ActivityType[] = [
  'note',
  'stage_change',
  'age_update',
  'assignment',
  'created',
];

const ACTIVITY_ICONS: Record<ActivityType, typeof MessageSquare> = {
  note: MessageSquare,
  stage_change: ArrowRightLeft,
  age_update: Calendar,
  assignment: UserPlus,
  created: Plus,
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  note: 'text-blue-500',
  stage_change: 'text-amber-500',
  age_update: 'text-emerald-500',
  assignment: 'text-purple-500',
  created: 'text-primary',
};

const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  note: 'Notes',
  stage_change: 'Stage moved',
  age_update: 'Age updated',
  assignment: 'Assignments',
  created: 'Project created',
};

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

export function ActivityFilterSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: ActivityFilterSheetProps) {
  const accentColors = useAccentColors();

  const handleTypeToggle = (type: ActivityType) => {
    const currentTypes = filters.types;
    let newTypes: ActivityType[];

    if (currentTypes.length === 0) {
      // All selected (empty = all), deselect this one
      newTypes = ALL_ACTIVITY_TYPES.filter((t) => t !== type);
    } else if (currentTypes.includes(type)) {
      // Type is selected, deselect it (but keep at least one)
      if (currentTypes.length > 1) {
        newTypes = currentTypes.filter((t) => t !== type);
      } else {
        // Can't deselect the last one
        return;
      }
    } else {
      // Type is not selected, select it
      newTypes = [...currentTypes, type];
      // If we selected all types, switch to empty array (means all)
      if (newTypes.length === ALL_ACTIVITY_TYPES.length) {
        newTypes = [];
      }
    }

    onFiltersChange({ ...filters, types: newTypes });
  };

  const handleDateRangeChange = (dateRange: DateRange) => {
    onFiltersChange({ ...filters, dateRange });
  };

  const handleClear = () => {
    onFiltersChange({ types: [], dateRange: 'all' });
  };

  const isTypeSelected = (type: ActivityType) => {
    // Empty array means all selected
    return filters.types.length === 0 || filters.types.includes(type);
  };

  const hasActiveFilters =
    filters.types.length > 0 || filters.dateRange !== 'all';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" showCloseButton={false}>
        <Box padding="lg">
          <VStack gap="lg">
            {/* Header */}
            <Text size="lg" weight="semibold">
              Filters
            </Text>

            {/* Activity type filters */}
            <VStack gap="sm">
              <Text size="sm" weight="medium" tone="muted">
                Activity types
              </Text>
              {ALL_ACTIVITY_TYPES.map((type) => {
                const IconComponent = ACTIVITY_ICONS[type];
                const colorClass = ACTIVITY_COLORS[type];
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
                        <View className="h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <Icon as={IconComponent} size={16} className={colorClass} />
                        </View>
                        <View className="flex-1">
                          <Text weight="medium">{ACTIVITY_TYPE_LABELS[type]}</Text>
                        </View>
                        <View
                          className="h-6 w-6 items-center justify-center rounded-md"
                          style={{
                            backgroundColor: isSelected
                              ? accentColors?.primary
                              : 'transparent',
                            borderWidth: isSelected ? 0 : 1,
                            borderColor: isSelected
                              ? 'transparent'
                              : 'rgba(255,255,255,0.2)',
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
              <Text size="sm" weight="medium" tone="muted">
                Date range
              </Text>
              {DATE_RANGE_OPTIONS.map((option) => {
                const isSelected = filters.dateRange === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleDateRangeChange(option.value)}
                  >
                    {({ pressed }) => (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                          opacity: pressed ? 0.7 : 1,
                        }}
                      >
                        <View className="flex-1">
                          <Text weight="medium">{option.label}</Text>
                        </View>
                        <View
                          className="h-6 w-6 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: isSelected
                              ? accentColors?.primary
                              : 'transparent',
                            borderWidth: isSelected ? 0 : 1,
                            borderColor: isSelected
                              ? 'transparent'
                              : 'rgba(255,255,255,0.2)',
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

            {/* Footer buttons */}
            <HStack gap="sm">
              <Button
                variant="outline"
                onPress={handleClear}
                disabled={!hasActiveFilters}
                style={{ flex: 1, opacity: hasActiveFilters ? 1 : 0.5 }}
              >
                <Text>Clear all</Text>
              </Button>
              <Button
                variant="default"
                onPress={() => onOpenChange(false)}
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
  );
}
