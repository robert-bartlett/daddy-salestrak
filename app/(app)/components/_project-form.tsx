import { useState, useRef, useCallback } from 'react';
import { View, Pressable, TextInput, useColorScheme, Keyboard, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassView } from 'expo-glass-effect';
import {
  MapPin,
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
import { Icon } from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NativeSheetScrollBody } from '@/components/ui/bottom-sheet';
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
import { InlineListSelect, type ListSelectConfig } from './_inline-list-select';
import { getIOSSheetColors } from '@/lib/ios-colors';

type ProjectFormProps = {
  coordinates?: Coordinates;
  onBack: () => void;
};

export function ProjectForm({ coordinates, onBack }: ProjectFormProps) {
  const colorScheme = useColorScheme();
  const colors = getIOSSheetColors(colorScheme);
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { addProject } = useProjects();
  const { selectProject } = useMapSheet();

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

  // Inline list select state
  const [listSelect, setListSelect] = useState<ListSelectConfig | null>(null);

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
    setListSelect({
      title: 'Project Type',
      items: PROJECT_TYPES.map((pt) => ({ id: pt.id, label: pt.name })),
      selectedId: selectedProjectType?.id ?? null,
      onSelect: (id) => {
        const pt = PROJECT_TYPES.find((p) => p.id === id);
        if (pt) setSelectedProjectType(pt);
      },
    });
  }, [selectedProjectType]);

  const handleOpenWorkflowSheet = useCallback(() => {
    setListSelect({
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
  }, [selectedWorkflow]);

  const handleOpenStageSheet = useCallback(() => {
    if (!selectedWorkflow) return;
    setListSelect({
      title: 'Starting Stage',
      items: selectedWorkflow.stages.map((s) => ({ id: s.id, label: s.name, color: s.color })),
      selectedId: selectedStageId,
      onSelect: (id) => setSelectedStageId(id),
    });
  }, [selectedWorkflow, selectedStageId]);

  const handleOpenOwnersSheet = useCallback(() => {
    setListSelect({
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
      searchable: true,
    });
  }, [selectedOwners]);

  const handleOpenAssigneesSheet = useCallback(() => {
    setListSelect({
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
      searchable: true,
    });
  }, [selectedAssignees]);

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

  // Dismiss keyboard and clear editing states
  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
    setNameEditing(false);
    setAddressEditing(false);
  }, []);

  // Footer height for scroll padding
  const footerHeight = 12 + 56 + Math.max(insets.bottom, 8) + 8;

  return (
    <View style={{ height: windowHeight, maxHeight: '100%' }}>
      {/* Scrollable content */}
      <NativeSheetScrollBody
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: footerHeight + 16,
        }}
        onScrollBeginDrag={dismissKeyboard}
      >
        <VStack gap="sm">
          {/* Header */}
          <Text size="xl" weight="semibold" style={{ color: COLORS.text, marginBottom: 8 }}>
            New Project
          </Text>

          {/* Project Type + Workflow Row */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* Project Type Widget */}
            <Pressable
              onPress={handleOpenProjectTypeSheet}
              style={{
                flex: 1,
                backgroundColor: COLORS.cardBg,
                borderRadius: 16,
                padding: 16,
              }}
            >
              <HStack justify="between" align="center">
                <HStack gap="md" align="center">
                  <Icon as={FolderKanban} size={20} color={COLORS.textSecondary} />
                  <Text size="base" weight="semibold" style={{ color: COLORS.text }} numberOfLines={1}>{selectedProjectType?.name ?? 'Type'}</Text>
                </HStack>
                <Icon as={ChevronRight} size={16} color={COLORS.textMuted} />
              </HStack>
            </Pressable>

            {/* Workflow Widget */}
            <Pressable
              onPress={handleOpenWorkflowSheet}
              style={{
                flex: 1,
                backgroundColor: COLORS.cardBg,
                borderRadius: 16,
                padding: 16,
              }}
            >
              <HStack justify="between" align="center">
                <HStack gap="md" align="center">
                  <Icon as={Briefcase} size={20} color={COLORS.accent} />
                  {selectedWorkflow ? (
                    <Text size="base" weight="semibold" style={{ color: COLORS.text }} numberOfLines={1}>{selectedWorkflow.name}</Text>
                  ) : (
                    <Text size="base" weight="semibold" style={{ color: COLORS.text }}>Workflow <Text style={{ color: COLORS.accent }}>*</Text></Text>
                  )}
                </HStack>
                <Icon as={ChevronRight} size={16} color={COLORS.textMuted} />
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
                  {selectedStage ? (
                    <Text size="sm" weight="medium" style={{ color: COLORS.text }}>{selectedStage.name}</Text>
                  ) : (
                    <Text size="sm" weight="medium" style={{ color: COLORS.text }}>Starting Stage <Text style={{ color: COLORS.accent }}>*</Text></Text>
                  )}
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
                ) : name ? (
                  <Text size="base" weight="semibold" style={{ color: COLORS.text }} numberOfLines={1}>{name}</Text>
                ) : (
                  <Text size="base" weight="semibold" style={{ color: COLORS.text }}>Project Name <Text style={{ color: COLORS.accent }}>*</Text></Text>
                )}
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
                  <Text size="base" weight="semibold" style={{ color: COLORS.text }} numberOfLines={1}>{address || 'Address'}</Text>
                )}
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
                {selectedOwners.length > 0 ? (
                  <HStack gap="xs">
                    {selectedOwners.slice(0, 3).map((owner) => (
                      <Avatar key={owner.id} size="sm" alt={owner.name}>
                        <AvatarFallback>
                          <Text size="xs" style={{ color: COLORS.text }}>{owner.initials}</Text>
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {selectedOwners.length > 3 ? (
                      <Text size="sm" style={{ color: COLORS.textMuted }}>+{selectedOwners.length - 3}</Text>
                    ) : null}
                  </HStack>
                ) : (
                  <Text size="base" weight="semibold" style={{ color: COLORS.text }}>Owners</Text>
                )}
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
                {selectedAssignees.length > 0 ? (
                  <HStack gap="xs">
                    {selectedAssignees.slice(0, 3).map((assignee) => (
                      <Avatar key={assignee.id} size="sm" alt={assignee.name}>
                        <AvatarFallback>
                          <Text size="xs" style={{ color: COLORS.text }}>{assignee.initials}</Text>
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {selectedAssignees.length > 3 ? (
                      <Text size="sm" style={{ color: COLORS.textMuted }}>+{selectedAssignees.length - 3}</Text>
                    ) : null}
                  </HStack>
                ) : (
                  <Text size="base" weight="semibold" style={{ color: COLORS.text }}>Assignees</Text>
                )}
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

        </VStack>
      </NativeSheetScrollBody>

      {/* Footer - absolute positioned at bottom */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 8) + 8,
          backgroundColor: colors.background,
          zIndex: 100,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: 56,
            gap: 12,
          }}
        >
          {/* Cancel Button - Glass effect */}
          <Pressable onPress={onBack} style={{ flex: 1 }}>
            {({ pressed }) => (
              <GlassView
                glassEffectStyle="regular"
                style={{
                  height: 50,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 25,
                  borderCurve: 'continuous',
                  opacity: pressed ? 0.7 : 1,
                }}
              >
                <Text
                  weight="medium"
                  style={{
                    color: '#FFFFFF',
                    fontSize: 17,
                  }}
                >
                  Cancel
                </Text>
              </GlassView>
            )}
          </Pressable>

          {/* Create Button - Prominent glass pill */}
          <Pressable
            onPress={handleCreate}
            disabled={!isValid}
            style={{ flex: 1.2 }}
          >
            {({ pressed }) => (
              <GlassView
                glassEffectStyle="regular"
                tintColor="rgba(120, 120, 128, 0.6)"
                style={{
                  height: 50,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 25,
                  borderCurve: 'continuous',
                  opacity: !isValid ? 0.4 : pressed ? 0.8 : 1,
                }}
              >
                <Text
                  weight="semibold"
                  style={{
                    color: '#FFFFFF',
                    fontSize: 17,
                  }}
                >
                  Create
                </Text>
              </GlassView>
            )}
          </Pressable>
        </View>
      </View>

      {/* Inline list select overlay */}
      <InlineListSelect
        open={!!listSelect}
        onClose={() => setListSelect(null)}
        title={listSelect?.title ?? ''}
        items={listSelect?.items ?? []}
        selectedId={listSelect?.selectedId}
        onSelect={listSelect?.onSelect}
        allowMultiple={listSelect?.allowMultiple}
        selectedIds={listSelect?.selectedIds}
        onSelectMultiple={listSelect?.onSelectMultiple}
        searchable={listSelect?.searchable}
      />
    </View>
  );
}
