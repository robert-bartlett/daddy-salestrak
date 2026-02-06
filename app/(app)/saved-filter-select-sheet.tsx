import { useCallback } from 'react';
import { View, Pressable, ScrollView, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

import { VStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { useSheetContext, type MapFilters } from '@/lib/sheet-context';
import { getIOSSheetColors } from '@/lib/ios-colors';
import { MOCK_WORKFLOWS } from '@/lib/mock-data';
import { STATUS_OPTIONS } from '@/lib/age-utils';

// Mock saved filters
type SavedFilter = {
  id: string;
  name: string;
  filters: MapFilters;
};

const MOCK_SAVED_FILTERS: SavedFilter[] = [
  {
    id: 'saved-1',
    name: 'My Active Jobs',
    filters: {
      workflows: ['workflow-cash', 'workflow-insurance'],
      ageStatuses: ['on_track', 'at_risk'],
      assignees: ['user-1'],
      owners: [],
      showArchived: false,
    },
  },
  {
    id: 'saved-2',
    name: 'Needs Attention',
    filters: {
      workflows: [],
      ageStatuses: ['at_risk', 'off_track'],
      assignees: [],
      owners: [],
      showArchived: false,
    },
  },
  {
    id: 'saved-3',
    name: 'Insurance Only',
    filters: {
      workflows: ['workflow-insurance'],
      ageStatuses: [],
      assignees: [],
      owners: [],
      showArchived: false,
    },
  },
];

function getFilterSummary(filters: MapFilters): string {
  const parts: string[] = [];

  if (filters.workflows.length > 0) {
    const names = filters.workflows
      .map((id) => MOCK_WORKFLOWS.find((w) => w.id === id)?.name)
      .filter(Boolean);
    parts.push(names.join(', '));
  }

  if (filters.ageStatuses.length > 0) {
    const labels = filters.ageStatuses
      .map((status) => STATUS_OPTIONS.find((o) => o.value === status)?.label)
      .filter(Boolean);
    parts.push(labels.join(', '));
  }

  if (filters.assignees.length > 0) {
    parts.push(`${filters.assignees.length} assignee(s)`);
  }

  if (filters.owners.length > 0) {
    parts.push(`${filters.owners.length} owner(s)`);
  }

  if (filters.showArchived) {
    parts.push('Archived');
  }

  return parts.length > 0 ? parts.join(' • ') : 'No filters';
}

export default function SavedFilterSelectSheet() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);
  const { getSavedFilterSelectData, clearSavedFilterSelectData } = useSheetContext();

  const data = getSavedFilterSelectData();

  const handleSelect = useCallback((savedFilter: SavedFilter) => {
    if (data?.onSelect) {
      data.onSelect(savedFilter.filters);
    }
    router.back();
  }, [data, router]);

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
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 12,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.separator,
        }}
      >
        <Text size="lg" weight="semibold" style={{ color: colors.title }}>
          Saved Filters
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 8 }}
      >
        {MOCK_SAVED_FILTERS.map((savedFilter) => (
          <Pressable key={savedFilter.id} onPress={() => handleSelect(savedFilter)}>
            {({ pressed }) => (
              <View
                style={{
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: colors.rowBackground,
                  borderRadius: 12,
                  borderCurve: 'continuous',
                  padding: 16,
                }}
              >
                <VStack gap="xs">
                  <Text weight="medium" style={{ color: colors.title }}>
                    {savedFilter.name}
                  </Text>
                  <Text size="sm" style={{ color: colors.subtitle }}>
                    {getFilterSummary(savedFilter.filters)}
                  </Text>
                </VStack>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </BlurView>
  );
}
