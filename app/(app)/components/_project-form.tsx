import { useState, useRef, useCallback } from 'react';
import { View, Pressable, TextInput, useColorScheme } from 'react-native';
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  Briefcase,
  Users,
  UserCircle,
} from 'lucide-react-native';

import { VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BottomSheetHeader, BottomSheetScrollBody } from '@/components/ui/bottom-sheet';
import { CustomFieldRow } from './_custom-field-row';
import {
  MOCK_WORKFLOWS,
  PROJECT_TYPES,
  PROJECT_CUSTOM_FIELDS,
  MOCK_USERS,
  type Workflow,
  type ProjectType,
  type ProjectCustomFields,
  type User,
} from '@/lib/mock-data';
import { useProjects } from '@/lib/projects-context';
import { useMapSheet, type Coordinates } from '@/lib/map-sheet-context';
import { useSheetContext } from '@/lib/sheet-context';
import { getIOSSheetColors } from '@/lib/ios-colors';

type ProjectFormProps = {
  coordinates?: Coordinates;
  onBack: () => void;
  onCancel: () => void;
};

export function ProjectForm({ coordinates, onBack, onCancel }: ProjectFormProps) {
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);
  const { addProject } = useProjects();
  const { selectProject } = useMapSheet();
  const { openListSelectSheet } = useSheetContext();

  // Colors for the form
  const COLORS = {
    text: colors.title,
    textMuted: colors.subtitle,
    textSecondary: colors.subtitle,
    cardBg: colors.rowBackground,
    border: colors.separator,
    accent: '#0A84FF',
  };

  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [selectedProjectType, setSelectedProjectType] = useState<ProjectType | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [selectedOwners, setSelectedOwners] = useState<User[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<User[]>([]);

  // Custom fields state
  const [customFields, setCustomFields] = useState<ProjectCustomFields>({});
  const [showAllFields, setShowAllFields] = useState(false);

  // Editing states
  const [nameEditing, setNameEditing] = useState(false);
  const [addressEditing, setAddressEditing] = useState(false);

  const nameInputRef = useRef<TextInput>(null);
  const addressInputRef = useRef<TextInput>(null);

  // Filter fields to show - required fields always, plus fields with values, or all if expanded
  const visibleFields = showAllFields
    ? PROJECT_CUSTOM_FIELDS
    : PROJECT_CUSTOM_FIELDS.filter((field) => {
        if (field.required) return true;
        const value = customFields[field.key];
        return value !== null && value !== undefined && value !== '';
      });

  const hiddenCount = PROJECT_CUSTOM_FIELDS.length - visibleFields.length;

  const handleOpenProjectTypeSheet = useCallback(() => {
    openListSelectSheet({
      title: 'Project Type',
      items: PROJECT_TYPES.map((pt) => ({ id: pt.id, label: pt.name })),
      selectedId: selectedProjectType?.id ?? null,
      onSelect: (id) => {
        const pt = PROJECT_TYPES.find((p) => p.id === id);
        if (pt) setSelectedProjectType(pt);
      },
    });
  }, [openListSelectSheet, selectedProjectType]);

  const handleOpenWorkflowSheet = useCallback(() => {
    openListSelectSheet({
      title: 'Workflow',
      items: MOCK_WORKFLOWS.map((w) => ({ id: w.id, label: w.name })),
      selectedId: selectedWorkflow?.id ?? null,
      onSelect: (id) => {
        const workflow = MOCK_WORKFLOWS.find((w) => w.id === id);
        if (workflow) {
          setSelectedWorkflow(workflow);
          setSelectedStageId(workflow.stages[0]?.id ?? null);
        }
      },
    });
  }, [openListSelectSheet, selectedWorkflow]);

  const handleOpenStageSheet = useCallback(() => {
    if (!selectedWorkflow) return;
    openListSelectSheet({
      title: 'Starting Stage',
      items: selectedWorkflow.stages.map((s) => ({ id: s.id, label: s.name, color: s.color })),
      selectedId: selectedStageId,
      onSelect: (id) => setSelectedStageId(id),
    });
  }, [openListSelectSheet, selectedWorkflow, selectedStageId]);

  const handleOpenOwnersSheet = useCallback(() => {
    openListSelectSheet({
      title: 'Select Owners',
      items: MOCK_USERS.map((u) => ({ id: u.id, label: u.name, sublabel: u.initials })),
      selectedId: null,
      allowMultiple: true,
      selectedIds: selectedOwners.map((o) => o.id),
      onSelect: () => {},
      onSelectMultiple: (ids) => {
        const owners = MOCK_USERS.filter((u) => ids.includes(u.id));
        setSelectedOwners(owners);
      },
    });
  }, [openListSelectSheet, selectedOwners]);

  const handleOpenAssigneesSheet = useCallback(() => {
    openListSelectSheet({
      title: 'Select Assignees',
      items: MOCK_USERS.map((u) => ({ id: u.id, label: u.name, sublabel: u.initials })),
      selectedId: null,
      allowMultiple: true,
      selectedIds: selectedAssignees.map((a) => a.id),
      onSelect: () => {},
      onSelectMultiple: (ids) => {
        const assignees = MOCK_USERS.filter((u) => ids.includes(u.id));
        setSelectedAssignees(assignees);
      },
    });
  }, [openListSelectSheet, selectedAssignees]);

  const handleCustomFieldChange = useCallback((key: string, value: string | number | Date | null) => {
    setCustomFields((prev) => {
      const updated = { ...prev };
      if (value === null || value === '') {
        delete updated[key];
      } else {
        updated[key] = value;
      }
      return updated;
    });
  }, []);

  const handleCreate = () => {
    // Validate required fields
    const leadSource = customFields.leadSource;
    if (!name.trim() || !selectedWorkflow || !selectedStageId || !leadSource) return;

    const newProject = addProject({
      name: name.trim(),
      address: address.trim(),
      workflowId: selectedWorkflow.id,
      stageId: selectedStageId,
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
      customFields,
    });

    // Reset form
    setName('');
    setAddress('');
    setSelectedProjectType(null);
    setSelectedWorkflow(null);
    setSelectedStageId(null);
    setSelectedOwners([]);
    setSelectedAssignees([]);
    setCustomFields({});
    setShowAllFields(false);

    // Show the new project
    selectProject(newProject.id);
  };

  // Check if Lead Source (required custom field) is filled
  const hasLeadSource = customFields.leadSource !== null && customFields.leadSource !== undefined && customFields.leadSource !== '';

  const isValid =
    name.trim().length > 0 &&
    selectedWorkflow !== null &&
    selectedStageId !== null &&
    hasLeadSource;

  const selectedStage = selectedWorkflow?.stages.find((s) => s.id === selectedStageId);

  return (
    <>
      <BottomSheetHeader>
        <HStack gap="sm" align="center">
          <Button variant="ghost" size="icon" onPress={onBack}>
            <Icon as={ChevronLeft} size={20} />
          </Button>
          <VStack gap="xs">
            <Text size="lg" weight="semibold">
              New Project
            </Text>
            <Text size="sm" tone="muted">
              Add a new lead or project to track
            </Text>
          </VStack>
        </HStack>
      </BottomSheetHeader>

      <BottomSheetScrollBody contentContainerStyle={{ paddingBottom: 120 }}>
        <VStack gap="sm">
          {/* Project Type + Workflow Row */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* Project Type Widget */}
            <Pressable
              onPress={handleOpenProjectTypeSheet}
              style={{
                flex: 1,
                backgroundColor: COLORS.cardBg,
                borderRadius: 12,
                padding: 12,
              }}
            >
              <HStack justify="between" align="center">
                <HStack gap="sm" align="center">
                  <Icon as={FolderKanban} size={16} color={COLORS.textSecondary} />
                  <VStack gap="xs">
                    <Text size="xs" style={{ color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Type
                    </Text>
                    <Text
                      size="sm"
                      weight="medium"
                      style={{ color: selectedProjectType ? COLORS.text : COLORS.textMuted }}
                      numberOfLines={1}
                    >
                      {selectedProjectType?.name ?? 'Select...'}
                    </Text>
                  </VStack>
                </HStack>
                <Icon as={ChevronRight} size={14} color={COLORS.textMuted} />
              </HStack>
            </Pressable>

            {/* Workflow Widget */}
            <Pressable
              onPress={handleOpenWorkflowSheet}
              style={{
                flex: 1,
                backgroundColor: COLORS.cardBg,
                borderRadius: 12,
                padding: 12,
              }}
            >
              <HStack justify="between" align="center">
                <HStack gap="sm" align="center">
                  <Icon as={Briefcase} size={16} color={COLORS.accent} />
                  <VStack gap="xs">
                    <HStack gap="xs" align="center">
                      <Text size="xs" style={{ color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Workflow
                      </Text>
                      <Text size="xs" style={{ color: COLORS.accent }}>*</Text>
                    </HStack>
                    <Text
                      size="sm"
                      weight="medium"
                      style={{ color: selectedWorkflow ? COLORS.text : COLORS.textMuted }}
                      numberOfLines={1}
                    >
                      {selectedWorkflow?.name ?? 'Select...'}
                    </Text>
                  </VStack>
                </HStack>
                <Icon as={ChevronRight} size={14} color={COLORS.textMuted} />
              </HStack>
            </Pressable>
          </View>

          {/* Stage Widget - Only shows when workflow is selected */}
          {selectedWorkflow ? (
            <Pressable
              onPress={handleOpenStageSheet}
              style={{
                backgroundColor: COLORS.cardBg,
                borderRadius: 12,
                padding: 12,
              }}
            >
              <HStack justify="between" align="center">
                <HStack gap="sm" align="center">
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: selectedStage?.color ?? COLORS.textMuted,
                    }}
                  />
                  <VStack gap="xs">
                    <HStack gap="xs" align="center">
                      <Text size="xs" style={{ color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Starting Stage
                      </Text>
                      <Text size="xs" style={{ color: COLORS.accent }}>*</Text>
                    </HStack>
                    <Text size="sm" weight="medium" style={{ color: COLORS.text }}>
                      {selectedStage?.name ?? 'Select...'}
                    </Text>
                  </VStack>
                </HStack>
                <Icon as={ChevronRight} size={14} color={COLORS.textMuted} />
              </HStack>
            </Pressable>
          ) : null}

          {/* Project Name Widget */}
          <Pressable
            onPress={() => {
              setNameEditing(true);
              setTimeout(() => nameInputRef.current?.focus(), 50);
            }}
            style={{
              backgroundColor: COLORS.cardBg,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <HStack gap="md" align="center">
              <Icon as={UserCircle} size={20} color={COLORS.accent} />
              <View style={{ flex: 1 }}>
                <VStack gap="xs">
                  <HStack gap="xs" align="center">
                    <Text size="xs" style={{ color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Project Name
                    </Text>
                    <Text size="xs" style={{ color: COLORS.accent }}>*</Text>
                  </HStack>
                  {nameEditing ? (
                    <Input
                      ref={nameInputRef}
                      placeholder="e.g., Johnson Residence"
                      value={name}
                      onChangeText={setName}
                      onBlur={() => setNameEditing(false)}
                      onSubmitEditing={() => setNameEditing(false)}
                      returnKeyType="done"
                      autoFocus
                    />
                  ) : (
                    <Text
                      size="base"
                      weight="semibold"
                      style={{ color: name ? COLORS.text : COLORS.textMuted }}
                    >
                      {name || 'Tap to enter...'}
                    </Text>
                  )}
                </VStack>
              </View>
            </HStack>
          </Pressable>

          {/* Address Widget */}
          <Pressable
            onPress={() => {
              setAddressEditing(true);
              setTimeout(() => addressInputRef.current?.focus(), 50);
            }}
            style={{
              backgroundColor: COLORS.cardBg,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <HStack gap="md" align="center">
              <Icon
                as={MapPin}
                size={20}
                color={coordinates ? '#22c55e' : COLORS.textSecondary}
              />
              <View style={{ flex: 1 }}>
                <VStack gap="xs">
                  <Text size="xs" style={{ color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Address
                  </Text>
                  {addressEditing ? (
                    <Input
                      ref={addressInputRef}
                      placeholder="Enter street address"
                      value={address}
                      onChangeText={setAddress}
                      onBlur={() => setAddressEditing(false)}
                      onSubmitEditing={() => setAddressEditing(false)}
                      returnKeyType="done"
                      autoFocus
                    />
                  ) : (
                    <Text
                      size="base"
                      weight="semibold"
                      style={{ color: address ? COLORS.text : COLORS.textMuted }}
                    >
                      {address || 'Tap to enter...'}
                    </Text>
                  )}
                </VStack>
              </View>
              {coordinates ? (
                <View
                  style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text size="xs" style={{ color: '#22c55e' }}>Map Pin Set</Text>
                </View>
              ) : null}
            </HStack>
          </Pressable>

          {/* Owners + Assignees Row */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* Owners Widget */}
            <Pressable
              onPress={handleOpenOwnersSheet}
              style={{
                flex: 1,
                backgroundColor: COLORS.cardBg,
                borderRadius: 16,
                padding: 16,
              }}
            >
              <VStack gap="sm">
                <HStack justify="between" align="center">
                  <Icon as={Users} size={20} color={COLORS.accent} />
                  <Icon as={ChevronRight} size={16} color={COLORS.textMuted} />
                </HStack>
                <VStack gap="xs">
                  <Text size="xs" style={{ color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Owners
                  </Text>
                  {selectedOwners.length > 0 ? (
                    <HStack gap="xs">
                      {selectedOwners.slice(0, 3).map((owner) => (
                        <Avatar key={owner.id} size="sm" alt={owner.name}>
                          <AvatarFallback>
                            <Text size="xs" style={{ color: COLORS.text }}>{owner.initials}</Text>
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {selectedOwners.length > 3 && (
                        <Text size="sm" style={{ color: COLORS.textMuted }}>+{selectedOwners.length - 3}</Text>
                      )}
                    </HStack>
                  ) : (
                    <Text size="sm" style={{ color: COLORS.textMuted }}>None</Text>
                  )}
                </VStack>
              </VStack>
            </Pressable>

            {/* Assignees Widget */}
            <Pressable
              onPress={handleOpenAssigneesSheet}
              style={{
                flex: 1,
                backgroundColor: COLORS.cardBg,
                borderRadius: 16,
                padding: 16,
              }}
            >
              <VStack gap="sm">
                <HStack justify="between" align="center">
                  <Icon as={Users} size={20} color={COLORS.textSecondary} />
                  <Icon as={ChevronRight} size={16} color={COLORS.textMuted} />
                </HStack>
                <VStack gap="xs">
                  <Text size="xs" style={{ color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Assignees
                  </Text>
                  {selectedAssignees.length > 0 ? (
                    <HStack gap="xs">
                      {selectedAssignees.slice(0, 3).map((assignee) => (
                        <Avatar key={assignee.id} size="sm" alt={assignee.name}>
                          <AvatarFallback>
                            <Text size="xs" style={{ color: COLORS.text }}>{assignee.initials}</Text>
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {selectedAssignees.length > 3 && (
                        <Text size="sm" style={{ color: COLORS.textMuted }}>+{selectedAssignees.length - 3}</Text>
                      )}
                    </HStack>
                  ) : (
                    <Text size="sm" style={{ color: COLORS.textMuted }}>None</Text>
                  )}
                </VStack>
              </VStack>
            </Pressable>
          </View>

          {/* Custom Fields Section */}
          <View
            style={{
              backgroundColor: COLORS.cardBg,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <VStack gap="sm">
              {/* Header */}
              <Text size="xs" weight="medium" style={{ color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Custom Fields
              </Text>

              {/* Divider */}
              <View
                style={{
                  height: 1,
                  backgroundColor: COLORS.border,
                  marginVertical: 4,
                }}
              />

              {/* Field Rows */}
              {visibleFields.map((field, index) => (
                <View key={field.key}>
                  <CustomFieldRow
                    field={field}
                    value={customFields[field.key]}
                    onChange={(value) => handleCustomFieldChange(field.key, value)}
                    colors={COLORS}
                  />
                  {index < visibleFields.length - 1 ? (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: COLORS.border,
                        marginLeft: 0,
                      }}
                    />
                  ) : null}
                </View>
              ))}

              {/* Separator before show all */}
              <View
                style={{
                  height: 1,
                  backgroundColor: COLORS.border,
                }}
              />

              {/* Show all toggle */}
              <Pressable
                onPress={() => setShowAllFields(!showAllFields)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  height: 40,
                }}
              >
                <Text size="sm" style={{ color: COLORS.accent }}>
                  {showAllFields ? 'Show required' : `Show all (${hiddenCount} more)`}
                </Text>
                <Icon
                  as={showAllFields ? ChevronUp : ChevronDown}
                  size={14}
                  color={COLORS.accent}
                />
              </Pressable>
            </VStack>
          </View>

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Button variant="ghost" onPress={onCancel}>
                Cancel
              </Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button onPress={handleCreate} disabled={!isValid}>
                Create
              </Button>
            </View>
          </View>
        </VStack>
      </BottomSheetScrollBody>
    </>
  );
}
