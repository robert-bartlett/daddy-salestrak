import { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Pressable, ScrollView, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Check, ChevronRight, Bookmark, Archive, X } from 'lucide-react-native';

import { VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useSheetContext, type MapFilters } from '@/lib/sheet-context';
import { getIOSSheetColors } from '@/lib/ios-colors';
import { MOCK_WORKFLOWS } from '@/lib/mock-data';

export const DEFAULT_FILTERS: MapFilters = {
  workflows: [],
  ageStatuses: [],
  assignees: [],
  owners: [],
  showArchived: false,
};

export default function MapFilterSheet() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);
  const {
    getMapFilterData,
    clearMapFilterData,
    openUserSelectSheet,
    openAgeStatusSelectSheet,
    openSavedFilterSelectSheet,
  } = useSheetContext();

  const data = getMapFilterData();
  const [localFilters, setLocalFilters] = useState<MapFilters>(data?.filters ?? DEFAULT_FILTERS);

  // Sync changes back to parent
  useEffect(() => {
    if (data?.onFiltersChange) {
      data.onFiltersChange(localFilters);
    }
  }, [localFilters, data]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (localFilters.workflows.length > 0) count += localFilters.workflows.length;
    if (localFilters.ageStatuses.length > 0) count += localFilters.ageStatuses.length;
    if (localFilters.assignees.length > 0) count += localFilters.assignees.length;
    if (localFilters.owners.length > 0) count += localFilters.owners.length;
    if (localFilters.showArchived) count += 1;
    return count;
  }, [localFilters]);

  const toggleWorkflow = useCallback((workflowId: string) => {
    setLocalFilters((prev) => {
      const newWorkflows = prev.workflows.includes(workflowId)
        ? prev.workflows.filter((id) => id !== workflowId)
        : [...prev.workflows, workflowId];
      return { ...prev, workflows: newWorkflows };
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setLocalFilters(DEFAULT_FILTERS);
  }, []);

  const handleOpenSavedFilters = useCallback(() => {
    openSavedFilterSelectSheet({
      onSelect: (filters) => {
        setLocalFilters(filters);
      },
    });
  }, [openSavedFilterSelectSheet]);

  const handleOpenAgeStatus = useCallback(() => {
    openAgeStatusSelectSheet({
      selected: localFilters.ageStatuses,
      onSelectedChange: (ageStatuses) => {
        setLocalFilters((prev) => ({ ...prev, ageStatuses }));
      },
    });
  }, [localFilters.ageStatuses, openAgeStatusSelectSheet]);

  const handleOpenAssignees = useCallback(() => {
    openUserSelectSheet({
      title: 'Select Assignees',
      selected: localFilters.assignees,
      onSelectedChange: (assignees) => {
        setLocalFilters((prev) => ({ ...prev, assignees }));
      },
    });
  }, [localFilters.assignees, openUserSelectSheet]);

  const handleOpenOwners = useCallback(() => {
    openUserSelectSheet({
      title: 'Select Owners',
      selected: localFilters.owners,
      onSelectedChange: (owners) => {
        setLocalFilters((prev) => ({ ...prev, owners }));
      },
    });
  }, [localFilters.owners, openUserSelectSheet]);

  const toggleArchived = useCallback(() => {
    setLocalFilters((prev) => ({ ...prev, showArchived: !prev.showArchived }));
  }, []);

  if (!data) {
    return (
      <BlurView
        intensity={100}
        tint="dark"
        style={{ flex: 1, backgroundColor: 'rgba(30, 30, 30, 0.25)', padding: 20 }}
      >
        <Text style={{ color: colors.subtitle }}>No filter data available</Text>
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
        <HStack justify="between" align="center">
          <Text size="lg" weight="semibold" style={{ color: colors.title }}>
            Filter
          </Text>
          {activeFilterCount > 0 ? (
            <Pressable onPress={handleClearFilters}>
              <HStack gap="xs" align="center">
                <Icon as={X} size={14} color={colors.subtitle} />
                <Text size="sm" style={{ color: colors.subtitle }}>Clear all</Text>
              </HStack>
            </Pressable>
          ) : null}
        </HStack>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: 40 }}
      >
        {/* Saved Filters */}
        <VStack gap="sm">
          <Text size="sm" weight="medium" style={{ color: colors.subtitle }}>
            Saved Filters
          </Text>
          <Pressable onPress={handleOpenSavedFilters}>
            {({ pressed }) => (
              <View
                style={{
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: colors.rowBackground,
                  borderRadius: 10,
                  borderCurve: 'continuous',
                  padding: 12,
                }}
              >
                <HStack justify="between" align="center">
                  <HStack gap="sm" align="center">
                    <Icon as={Bookmark} size={16} color={colors.subtitle} />
                    <Text size="sm" style={{ color: colors.title }}>Select a saved filter</Text>
                  </HStack>
                  <Icon as={ChevronRight} size={18} color={colors.subtitle} />
                </HStack>
              </View>
            )}
          </Pressable>
        </VStack>

        {/* Workflows */}
        <VStack gap="sm">
          <Text size="sm" weight="medium" style={{ color: colors.subtitle }}>
            Workflows
          </Text>
          <HStack gap="sm" wrap>
            {MOCK_WORKFLOWS.map((workflow) => {
              const isSelected = localFilters.workflows.includes(workflow.id);
              return (
                <Pressable key={workflow.id} onPress={() => toggleWorkflow(workflow.id)}>
                  {({ pressed }) => (
                    <View
                      style={{
                        opacity: pressed ? 0.7 : 1,
                        backgroundColor: isSelected ? '#0A84FF' : colors.rowBackground,
                        borderRadius: 16,
                        borderCurve: 'continuous',
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {isSelected ? <Icon as={Check} size={14} color="#fff" /> : null}
                      <Text
                        size="sm"
                        weight={isSelected ? 'semibold' : 'regular'}
                        style={{ color: isSelected ? '#fff' : colors.title }}
                      >
                        {workflow.name}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </HStack>
        </VStack>

        {/* Age Status */}
        <VStack gap="sm">
          <Text size="sm" weight="medium" style={{ color: colors.subtitle }}>
            Age Status
          </Text>
          <Pressable onPress={handleOpenAgeStatus}>
            {({ pressed }) => (
              <View
                style={{
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: colors.rowBackground,
                  borderRadius: 10,
                  borderCurve: 'continuous',
                  padding: 12,
                }}
              >
                <HStack justify="between" align="center">
                  <Text size="sm" style={{ color: colors.title }}>
                    {localFilters.ageStatuses.length === 0
                      ? 'All statuses'
                      : `${localFilters.ageStatuses.length} selected`}
                  </Text>
                  <Icon as={ChevronRight} size={18} color={colors.subtitle} />
                </HStack>
              </View>
            )}
          </Pressable>
        </VStack>

        {/* Assignee */}
        <VStack gap="sm">
          <Text size="sm" weight="medium" style={{ color: colors.subtitle }}>
            Assignee
          </Text>
          <Pressable onPress={handleOpenAssignees}>
            {({ pressed }) => (
              <View
                style={{
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: colors.rowBackground,
                  borderRadius: 10,
                  borderCurve: 'continuous',
                  padding: 12,
                }}
              >
                <HStack justify="between" align="center">
                  <Text size="sm" style={{ color: colors.title }}>
                    {localFilters.assignees.length === 0
                      ? 'Anyone'
                      : `${localFilters.assignees.length} selected`}
                  </Text>
                  <Icon as={ChevronRight} size={18} color={colors.subtitle} />
                </HStack>
              </View>
            )}
          </Pressable>
        </VStack>

        {/* Owner */}
        <VStack gap="sm">
          <Text size="sm" weight="medium" style={{ color: colors.subtitle }}>
            Owner
          </Text>
          <Pressable onPress={handleOpenOwners}>
            {({ pressed }) => (
              <View
                style={{
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: colors.rowBackground,
                  borderRadius: 10,
                  borderCurve: 'continuous',
                  padding: 12,
                }}
              >
                <HStack justify="between" align="center">
                  <Text size="sm" style={{ color: colors.title }}>
                    {localFilters.owners.length === 0
                      ? 'Anyone'
                      : `${localFilters.owners.length} selected`}
                  </Text>
                  <Icon as={ChevronRight} size={18} color={colors.subtitle} />
                </HStack>
              </View>
            )}
          </Pressable>
        </VStack>

        {/* Archive Toggle */}
        <VStack gap="sm">
          <Text size="sm" weight="medium" style={{ color: colors.subtitle }}>
            Archive
          </Text>
          <Pressable onPress={toggleArchived}>
            {({ pressed }) => (
              <View
                style={{
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: localFilters.showArchived ? 'rgba(10, 132, 255, 0.15)' : colors.rowBackground,
                  borderRadius: 10,
                  borderCurve: 'continuous',
                  padding: 12,
                  borderWidth: localFilters.showArchived ? 1 : 0,
                  borderColor: localFilters.showArchived ? '#0A84FF' : 'transparent',
                }}
              >
                <HStack justify="between" align="center">
                  <HStack gap="sm" align="center">
                    <Icon
                      as={Archive}
                      size={16}
                      color={localFilters.showArchived ? '#0A84FF' : colors.subtitle}
                    />
                    <Text
                      size="sm"
                      style={{ color: localFilters.showArchived ? '#0A84FF' : colors.title }}
                    >
                      Show archived projects
                    </Text>
                  </HStack>
                  {localFilters.showArchived ? (
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: '#0A84FF',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon as={Check} size={12} color="#fff" />
                    </View>
                  ) : null}
                </HStack>
              </View>
            )}
          </Pressable>
        </VStack>
      </ScrollView>
    </BlurView>
  );
}
