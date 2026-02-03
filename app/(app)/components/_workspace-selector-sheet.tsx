import { useCallback } from 'react';
import { View, Pressable } from 'react-native';
import { Building2, Check, Plus } from 'lucide-react-native';

import { VStack, HStack, Surface } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import {
  BottomSheetModal,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetScrollBody,
  BottomSheetFooter,
} from '@/components/ui/bottom-sheet';
import { useWorkspace, type Workspace, type WorkspaceRole } from '@/lib/workspace-context';
import { useAccentColors } from '@/lib/theme-context';
import { useState } from 'react';
import { AddWorkspaceSheet } from './_add-workspace-sheet';

type WorkspaceSelectorSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// ============================================================================
// Role Badge Colors
// ============================================================================

const ROLE_BADGE_COLORS = {
  owner: 'purple' as const,
  admin: 'blue' as const,
  member: 'grey' as const,
};

const ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
};

// ============================================================================
// Workspace Row Component
// ============================================================================

type WorkspaceRowProps = {
  workspace: Workspace;
  isSelected: boolean;
  onPress: () => void;
};

function WorkspaceRow({ workspace, isSelected, onPress }: WorkspaceRowProps) {
  const accentColors = useAccentColors();

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View style={{ opacity: pressed ? 0.7 : 1 }}>
          <Surface variant={isSelected ? 'outline' : 'ghost'} padding="md">
            <HStack justify="between" align="center">
              <HStack gap="md" align="center">
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    backgroundColor: isSelected
                      ? accentColors?.secondary ?? 'rgba(59, 130, 246, 0.15)'
                      : 'rgba(120, 120, 128, 0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon
                    as={Building2}
                    size={20}
                    color={
                      isSelected
                        ? accentColors?.primary ?? '#3b82f6'
                        : undefined
                    }
                  />
                </View>
                <VStack gap="xs">
                  <Text weight={isSelected ? 'semibold' : 'medium'}>
                    {workspace.name}
                  </Text>
                  <Badge
                    variant="color"
                    color={ROLE_BADGE_COLORS[workspace.role]}
                    size="sm"
                  >
                    <Text size="xs">{ROLE_LABELS[workspace.role]}</Text>
                  </Badge>
                </VStack>
              </HStack>
              {isSelected ? (
                <Icon
                  as={Check}
                  size={20}
                  color={accentColors?.primary ?? '#3b82f6'}
                />
              ) : null}
            </HStack>
          </Surface>
        </View>
      )}
    </Pressable>
  );
}

// ============================================================================
// Main Workspace Selector Sheet
// ============================================================================

export function WorkspaceSelectorSheet({
  open,
  onOpenChange,
}: WorkspaceSelectorSheetProps) {
  const { workspaces, currentWorkspace, switchWorkspace } = useWorkspace();
  const [addWorkspaceOpen, setAddWorkspaceOpen] = useState(false);

  const handleSelectWorkspace = useCallback(
    (workspaceId: string) => {
      switchWorkspace(workspaceId);
      onOpenChange(false);
    },
    [switchWorkspace, onOpenChange]
  );

  const handleAddWorkspace = useCallback(() => {
    setAddWorkspaceOpen(true);
  }, []);

  const handleWorkspaceAdded = useCallback(() => {
    setAddWorkspaceOpen(false);
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <>
      <BottomSheetModal open={open} onOpenChange={onOpenChange} snapPoints={['60%']}>
        <BottomSheetHeader>
          <BottomSheetTitle>Switch Workspace</BottomSheetTitle>
        </BottomSheetHeader>

        <BottomSheetScrollBody>
          <VStack gap="sm">
            {workspaces.map((workspace) => (
              <WorkspaceRow
                key={workspace.id}
                workspace={workspace}
                isSelected={workspace.id === currentWorkspace?.id}
                onPress={() => handleSelectWorkspace(workspace.id)}
              />
            ))}
          </VStack>
        </BottomSheetScrollBody>

        <BottomSheetFooter>
          <Button variant="outline" onPress={handleAddWorkspace}>
            <HStack gap="sm" align="center">
              <Icon as={Plus} size={18} />
              <Text>Add Workspace</Text>
            </HStack>
          </Button>
        </BottomSheetFooter>
      </BottomSheetModal>

      {/* Add Workspace Sheet */}
      <AddWorkspaceSheet
        open={addWorkspaceOpen}
        onOpenChange={setAddWorkspaceOpen}
        onWorkspaceAdded={handleWorkspaceAdded}
      />
    </>
  );
}
