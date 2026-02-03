import { useState, useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Check, ChevronRight, Bookmark, Archive, X } from 'lucide-react-native';

import { VStack, HStack, Surface, Box } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import {
  BottomSheetModal,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetScrollBody,
} from '@/components/ui/bottom-sheet';
import { MOCK_WORKFLOWS, MOCK_USERS, type User, type Workflow, type ProjectStatus } from '@/lib/mock-data';
import { STATUS_OPTIONS, getStatusBadgeColor, type BadgeColor } from '@/lib/age-utils';
import { useAccentColors } from '@/lib/theme-context';

// ============================================================================
// Types
// ============================================================================

export type SavedFilter = {
  id: string;
  name: string;
  filters: MapFilters;
};

export type MapFilters = {
  workflows: string[];
  ageStatuses: ProjectStatus[];
  assignees: string[];
  owners: string[];
  showArchived: boolean;
};

export const DEFAULT_FILTERS: MapFilters = {
  workflows: [],
  ageStatuses: [],
  assignees: [],
  owners: [],
  showArchived: false,
};

// Mock saved filters
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

// ============================================================================
// Main Component
// ============================================================================

type MapFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: MapFilters;
  onFiltersChange: (filters: MapFilters) => void;
};

export function MapFilterSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: MapFilterSheetProps) {
  // Local state for nested sheets
  const [savedFiltersSheetOpen, setSavedFiltersSheetOpen] = useState(false);
  const [ageSheetOpen, setAgeSheetOpen] = useState(false);
  const [assigneeSheetOpen, setAssigneeSheetOpen] = useState(false);
  const [ownerSheetOpen, setOwnerSheetOpen] = useState(false);
  const accentColors = useAccentColors();

  // Count active filters for display
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.workflows.length > 0) count += filters.workflows.length;
    if (filters.ageStatuses.length > 0) count += filters.ageStatuses.length;
    if (filters.assignees.length > 0) count += filters.assignees.length;
    if (filters.owners.length > 0) count += filters.owners.length;
    if (filters.showArchived) count += 1;
    return count;
  }, [filters]);

  // Toggle a workflow in the filter
  const toggleWorkflow = (workflowId: string) => {
    const newWorkflows = filters.workflows.includes(workflowId)
      ? filters.workflows.filter((id) => id !== workflowId)
      : [...filters.workflows, workflowId];
    onFiltersChange({ ...filters, workflows: newWorkflows });
  };

  // Handle saved filter selection
  const handleSavedFilterSelect = (savedFilter: SavedFilter) => {
    onFiltersChange(savedFilter.filters);
    setSavedFiltersSheetOpen(false);
  };

  // Clear all filters
  const handleClearFilters = () => {
    onFiltersChange(DEFAULT_FILTERS);
  };

  return (
    <>
      <BottomSheetModal
        open={open}
        onOpenChange={onOpenChange}
        snapPoints={['70%', '90%']}
        enableDynamicSizing={false}
      >
        <BottomSheetHeader>
          <HStack justify="between" align="center">
            <BottomSheetTitle>Filter</BottomSheetTitle>
            {activeFilterCount > 0 && (
              <Pressable onPress={handleClearFilters}>
                <HStack gap="xs" align="center">
                  <Icon as={X} size={14} />
                  <Text size="sm" tone="muted">Clear all</Text>
                </HStack>
              </Pressable>
            )}
          </HStack>
        </BottomSheetHeader>

        <BottomSheetScrollBody>
          <VStack gap="xl">
            {/* Saved Filters */}
            <VStack gap="sm">
              <Text size="sm" weight="medium" tone="muted">
                Saved Filters
              </Text>
              <Pressable onPress={() => setSavedFiltersSheetOpen(true)}>
                <Surface variant="outline" padding="sm" rounded="lg">
                  <HStack justify="between" align="center">
                    <HStack gap="sm" align="center">
                      <Icon as={Bookmark} size={16} />
                      <Text size="sm">Select a saved filter</Text>
                    </HStack>
                    <Icon as={ChevronRight} size={18} />
                  </HStack>
                </Surface>
              </Pressable>
            </VStack>

            {/* Quick Workflow Filter */}
            <VStack gap="sm">
              <Text size="sm" weight="medium" tone="muted">
                Workflows
              </Text>
              <HStack gap="sm" wrap>
                {MOCK_WORKFLOWS.map((workflow) => {
                  const isSelected = filters.workflows.includes(workflow.id);
                  return (
                    <Pressable key={workflow.id} onPress={() => toggleWorkflow(workflow.id)}>
                      <Badge
                        variant={isSelected ? 'default' : 'outline'}
                        size="lg"
                        icon={isSelected ? Check : undefined}
                      >
                        <Text>{workflow.name}</Text>
                      </Badge>
                    </Pressable>
                  );
                })}
              </HStack>
            </VStack>

            {/* Age Filter */}
            <VStack gap="sm">
              <Text size="sm" weight="medium" tone="muted">
                Age Status
              </Text>
              <Pressable onPress={() => setAgeSheetOpen(true)}>
                <Surface variant="outline" padding="sm" rounded="lg">
                  <HStack justify="between" align="center">
                    <Text size="sm">
                      {filters.ageStatuses.length === 0
                        ? 'All statuses'
                        : `${filters.ageStatuses.length} selected`}
                    </Text>
                    <Icon as={ChevronRight} size={18} />
                  </HStack>
                </Surface>
              </Pressable>
            </VStack>

            {/* Assignee Filter */}
            <VStack gap="sm">
              <Text size="sm" weight="medium" tone="muted">
                Assignee
              </Text>
              <Pressable onPress={() => setAssigneeSheetOpen(true)}>
                <Surface variant="outline" padding="sm" rounded="lg">
                  <HStack justify="between" align="center">
                    <Text size="sm">
                      {filters.assignees.length === 0
                        ? 'Anyone'
                        : `${filters.assignees.length} selected`}
                    </Text>
                    <Icon as={ChevronRight} size={18} />
                  </HStack>
                </Surface>
              </Pressable>
            </VStack>

            {/* Owner Filter */}
            <VStack gap="sm">
              <Text size="sm" weight="medium" tone="muted">
                Owner
              </Text>
              <Pressable onPress={() => setOwnerSheetOpen(true)}>
                <Surface variant="outline" padding="sm" rounded="lg">
                  <HStack justify="between" align="center">
                    <Text size="sm">
                      {filters.owners.length === 0
                        ? 'Anyone'
                        : `${filters.owners.length} selected`}
                    </Text>
                    <Icon as={ChevronRight} size={18} />
                  </HStack>
                </Surface>
              </Pressable>
            </VStack>

            {/* Archive Toggle */}
            <VStack gap="sm">
              <Text size="sm" weight="medium" tone="muted">
                Archive
              </Text>
              <Pressable
                onPress={() =>
                  onFiltersChange({ ...filters, showArchived: !filters.showArchived })
                }
                style={{
                  backgroundColor: filters.showArchived
                    ? accentColors?.secondary ?? 'rgba(255, 255, 255, 0.1)'
                    : 'transparent',
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: filters.showArchived
                    ? accentColors?.primary
                    : 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <HStack justify="between" align="center">
                  <HStack gap="sm" align="center">
                    <Icon
                      as={Archive}
                      size={16}
                      color={filters.showArchived ? accentColors?.primary : undefined}
                    />
                    <Text
                      size="sm"
                      style={filters.showArchived ? { color: accentColors?.primary } : undefined}
                    >
                      Show archived projects
                    </Text>
                  </HStack>
                  {filters.showArchived && (
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: accentColors?.primary ?? '#3b82f6',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon as={Check} size={12} color="#fff" />
                    </View>
                  )}
                </HStack>
              </Pressable>
            </VStack>
          </VStack>
        </BottomSheetScrollBody>
      </BottomSheetModal>

      {/* Saved Filters Sheet */}
      <SavedFiltersSheet
        open={savedFiltersSheetOpen}
        onOpenChange={setSavedFiltersSheetOpen}
        onSelect={handleSavedFilterSelect}
      />

      {/* Age Status Sheet */}
      <AgeStatusSheet
        open={ageSheetOpen}
        onOpenChange={setAgeSheetOpen}
        selected={filters.ageStatuses}
        onSelectedChange={(ageStatuses) => onFiltersChange({ ...filters, ageStatuses })}
      />

      {/* Assignee Sheet */}
      <UserSelectSheet
        open={assigneeSheetOpen}
        onOpenChange={setAssigneeSheetOpen}
        title="Select Assignees"
        selected={filters.assignees}
        onSelectedChange={(assignees) => onFiltersChange({ ...filters, assignees })}
      />

      {/* Owner Sheet */}
      <UserSelectSheet
        open={ownerSheetOpen}
        onOpenChange={setOwnerSheetOpen}
        title="Select Owners"
        selected={filters.owners}
        onSelectedChange={(owners) => onFiltersChange({ ...filters, owners })}
      />
    </>
  );
}

// ============================================================================
// Saved Filters Sheet
// ============================================================================

type SavedFiltersSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (filter: SavedFilter) => void;
};

function SavedFiltersSheet({ open, onOpenChange, onSelect }: SavedFiltersSheetProps) {
  return (
    <BottomSheetModal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={['50%']}
      enableDynamicSizing={false}
      stackBehavior="push"
    >
      <BottomSheetHeader>
        <BottomSheetTitle>Saved Filters</BottomSheetTitle>
      </BottomSheetHeader>

      <BottomSheetScrollBody>
        <VStack gap="xs">
          {MOCK_SAVED_FILTERS.map((savedFilter) => (
            <Pressable key={savedFilter.id} onPress={() => onSelect(savedFilter)}>
              <Surface variant="ghost" padding="md" rounded="lg">
                <VStack gap="xs">
                  <Text weight="medium">{savedFilter.name}</Text>
                  <Text size="sm" tone="muted">
                    {getFilterSummary(savedFilter.filters)}
                  </Text>
                </VStack>
              </Surface>
            </Pressable>
          ))}
        </VStack>
      </BottomSheetScrollBody>
    </BottomSheetModal>
  );
}

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

// ============================================================================
// Age Status Sheet
// ============================================================================

type AgeStatusSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: ProjectStatus[];
  onSelectedChange: (selected: ProjectStatus[]) => void;
};

function AgeStatusSheet({ open, onOpenChange, selected, onSelectedChange }: AgeStatusSheetProps) {
  const toggleStatus = (status: ProjectStatus) => {
    const newSelected = selected.includes(status)
      ? selected.filter((s) => s !== status)
      : [...selected, status];
    onSelectedChange(newSelected);
  };

  // Only show the first 3 statuses (on_track, at_risk, off_track) - not "disabled"
  const statusOptions = STATUS_OPTIONS.slice(0, 3);

  return (
    <BottomSheetModal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={['40%']}
      enableDynamicSizing={false}
      stackBehavior="push"
    >
      <BottomSheetHeader>
        <BottomSheetTitle>Age Status</BottomSheetTitle>
      </BottomSheetHeader>

      <BottomSheetScrollBody>
        <VStack gap="sm">
          {statusOptions.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <Pressable key={option.value} onPress={() => toggleStatus(option.value)}>
                <Surface variant={isSelected ? 'muted' : 'outline'} padding="md" rounded="lg">
                  <HStack justify="between" align="center">
                    <HStack gap="sm" align="center">
                      <Badge variant="color" color={option.badgeColor as BadgeColor} size="sm">
                        <Text>{option.label}</Text>
                      </Badge>
                    </HStack>
                    {isSelected && <Icon as={Check} size={20} />}
                  </HStack>
                </Surface>
              </Pressable>
            );
          })}
        </VStack>
      </BottomSheetScrollBody>
    </BottomSheetModal>
  );
}

// ============================================================================
// User Select Sheet (for Assignees & Owners)
// ============================================================================

type UserSelectSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  selected: string[];
  onSelectedChange: (selected: string[]) => void;
};

function UserSelectSheet({
  open,
  onOpenChange,
  title,
  selected,
  onSelectedChange,
}: UserSelectSheetProps) {
  const accentColors = useAccentColors();

  const toggleUser = (userId: string) => {
    const newSelected = selected.includes(userId)
      ? selected.filter((id) => id !== userId)
      : [...selected, userId];
    onSelectedChange(newSelected);
  };

  return (
    <BottomSheetModal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={['50%']}
      enableDynamicSizing={false}
      stackBehavior="push"
    >
      <BottomSheetHeader>
        <BottomSheetTitle>{title}</BottomSheetTitle>
      </BottomSheetHeader>

      <BottomSheetScrollBody>
        <VStack gap="xs">
          {MOCK_USERS.map((user) => {
            const isSelected = selected.includes(user.id);
            return (
              <Pressable
                key={user.id}
                onPress={() => toggleUser(user.id)}
                style={{
                  backgroundColor: isSelected
                    ? accentColors?.secondary ?? 'rgba(255, 255, 255, 0.1)'
                    : 'transparent',
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: isSelected ? 1 : 0,
                  borderColor: isSelected ? accentColors?.primary : 'transparent',
                }}
              >
                <HStack justify="between" align="center">
                  <HStack gap="sm" align="center">
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text size="sm" weight="semibold">
                        {user.initials}
                      </Text>
                    </View>
                    <VStack gap="none">
                      <Text
                        weight={isSelected ? 'semibold' : 'regular'}
                        style={isSelected ? { color: accentColors?.primary } : undefined}
                      >
                        {user.name}
                      </Text>
                      <Text size="sm" tone="muted">{user.email}</Text>
                    </VStack>
                  </HStack>
                  {isSelected && (
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: accentColors?.primary ?? '#3b82f6',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon as={Check} size={14} color="#fff" />
                    </View>
                  )}
                </HStack>
              </Pressable>
            );
          })}
        </VStack>
      </BottomSheetScrollBody>
    </BottomSheetModal>
  );
}
