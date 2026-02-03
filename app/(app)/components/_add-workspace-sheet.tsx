import { useState, useCallback } from 'react';
import { Alert, KeyboardAvoidingView, Platform } from 'react-native';

import { VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BottomSheetModal,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetBody,
  BottomSheetFooter,
} from '@/components/ui/bottom-sheet';
import { useWorkspace } from '@/lib/workspace-context';

type AddWorkspaceSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkspaceAdded?: () => void;
};

export function AddWorkspaceSheet({
  open,
  onOpenChange,
  onWorkspaceAdded,
}: AddWorkspaceSheetProps) {
  const { addWorkspace } = useWorkspace();
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Reset form when sheet opens
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        setName('');
      }
      onOpenChange(isOpen);
    },
    [onOpenChange]
  );

  const handleCreate = useCallback(() => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert('Error', 'Workspace name is required');
      return;
    }

    if (trimmedName.length < 2) {
      Alert.alert('Error', 'Workspace name must be at least 2 characters');
      return;
    }

    setIsCreating(true);

    try {
      addWorkspace(trimmedName);
      onWorkspaceAdded?.();
    } catch (error) {
      console.warn('Failed to create workspace:', error);
      Alert.alert('Error', 'Failed to create workspace');
    } finally {
      setIsCreating(false);
    }
  }, [name, addWorkspace, onWorkspaceAdded]);

  return (
    <BottomSheetModal open={open} onOpenChange={handleOpenChange} snapPoints={['40%']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <BottomSheetHeader>
          <BottomSheetTitle>Create Workspace</BottomSheetTitle>
        </BottomSheetHeader>

        <BottomSheetBody>
          <VStack gap="lg">
            <VStack gap="sm">
              <Text size="sm" weight="medium" tone="muted">
                Workspace Name
              </Text>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="My Company"
                autoCapitalize="words"
                autoCorrect={false}
                autoFocus
              />
              <Text size="xs" tone="muted">
                This is the name of your organization or team.
              </Text>
            </VStack>
          </VStack>
        </BottomSheetBody>

        <BottomSheetFooter>
          <HStack gap="md">
            <Button
              variant="outline"
              style={{ flex: 1 }}
              onPress={() => onOpenChange(false)}
            >
              <Text>Cancel</Text>
            </Button>
            <Button
              variant="default"
              style={{ flex: 1 }}
              onPress={handleCreate}
              disabled={isCreating || !name.trim()}
            >
              <Text>{isCreating ? 'Creating...' : 'Create'}</Text>
            </Button>
          </HStack>
        </BottomSheetFooter>
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
}
