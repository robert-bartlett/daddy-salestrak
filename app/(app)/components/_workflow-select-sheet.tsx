import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Check, ChevronRight } from 'lucide-react-native';

import { VStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import {
  BottomSheetModal,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetScrollBody,
} from '@/components/ui/bottom-sheet';
import { MOCK_WORKFLOWS, getWorkflowById } from '@/lib/mock-data';
import { useAccentColors } from '@/lib/theme-context';

type WorkflowSelectSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentWorkflowId: string;
  currentStageId: string;
  onSelectWorkflow: (workflowId: string, stageId: string) => void;
};

export function WorkflowSelectSheet({
  open,
  onOpenChange,
  currentWorkflowId,
  currentStageId,
  onSelectWorkflow,
}: WorkflowSelectSheetProps) {
  const accentColors = useAccentColors();
  const accentColor = accentColors?.primary ?? '#007AFF';

  // Track if we're in confirmation mode and which workflow was selected
  const [pendingWorkflow, setPendingWorkflow] = useState<string | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  const pendingWorkflowData = pendingWorkflow ? getWorkflowById(pendingWorkflow) : null;

  const handleSelectWorkflow = (workflowId: string) => {
    // If selecting the same workflow, just close
    if (workflowId === currentWorkflowId) {
      onOpenChange(false);
      return;
    }

    // Enter confirmation mode - show stage selector
    const workflow = getWorkflowById(workflowId);
    setPendingWorkflow(workflowId);
    // Pre-select the first stage
    setSelectedStageId(workflow?.stages[0]?.id ?? null);
  };

  const handleConfirmMove = () => {
    if (pendingWorkflow && selectedStageId) {
      onSelectWorkflow(pendingWorkflow, selectedStageId);
      onOpenChange(false);
      // Reset state
      setPendingWorkflow(null);
      setSelectedStageId(null);
    }
  };

  const handleBack = () => {
    setPendingWorkflow(null);
    setSelectedStageId(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state when sheet closes
    setPendingWorkflow(null);
    setSelectedStageId(null);
  };

  // Confirmation view - selecting stage
  if (pendingWorkflow && pendingWorkflowData) {
    const footerContent = (
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Button variant="ghost" onPress={handleBack}>
            Back
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button onPress={handleConfirmMove} disabled={!selectedStageId}>
            Move
          </Button>
        </View>
      </View>
    );

    return (
      <BottomSheetModal
        open={open}
        onOpenChange={handleClose}
        snapPoints={['50%', '70%']}
        footer={footerContent}
        stackBehavior="push"
      >
        <BottomSheetHeader>
          <BottomSheetTitle>Move to {pendingWorkflowData.name}</BottomSheetTitle>
        </BottomSheetHeader>

        <BottomSheetScrollBody>
          <Text style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: 12 }}>
            Select a stage in this workflow:
          </Text>

          <VStack gap="xs">
            {pendingWorkflowData.stages.map((stage) => {
              const isSelected = stage.id === selectedStageId;

              return (
                <Pressable
                  key={stage.id}
                  onPress={() => setSelectedStageId(stage.id)}
                  style={[
                    styles.stageOption,
                    isSelected && { backgroundColor: accentColors?.secondary ?? 'rgba(0, 122, 255, 0.15)' },
                  ]}
                >
                  <View style={[styles.stageColor, { backgroundColor: stage.color }]} />
                  <Text style={{ flex: 1, color: '#fff' }}>{stage.name}</Text>
                  {isSelected && <Icon as={Check} size={18} color={accentColor} />}
                </Pressable>
              );
            })}
          </VStack>
        </BottomSheetScrollBody>
      </BottomSheetModal>
    );
  }

  // Main workflow list view
  return (
    <BottomSheetModal
      open={open}
      onOpenChange={handleClose}
      enableDynamicSizing
      stackBehavior="push"
    >
      <BottomSheetHeader>
        <BottomSheetTitle>Select Workflow</BottomSheetTitle>
      </BottomSheetHeader>

      <BottomSheetScrollBody>
        <VStack gap="xs">
          {MOCK_WORKFLOWS.map((workflow) => {
            const isSelected = workflow.id === currentWorkflowId;

            return (
              <Pressable
                key={workflow.id}
                onPress={() => handleSelectWorkflow(workflow.id)}
                style={[
                  styles.workflowOption,
                  isSelected && { backgroundColor: accentColors?.secondary ?? 'rgba(0, 122, 255, 0.15)' },
                ]}
              >
                <Text style={{ flex: 1, fontWeight: isSelected ? '600' : '400', color: '#fff' }}>
                  {workflow.name}
                </Text>
                {isSelected ? (
                  <Icon as={Check} size={18} color={accentColor} />
                ) : (
                  <Icon as={ChevronRight} size={18} color="rgba(255, 255, 255, 0.4)" />
                )}
              </Pressable>
            );
          })}
        </VStack>

        {/* Cancel button */}
        <View style={{ marginTop: 16 }}>
          <Button variant="ghost" onPress={handleClose}>
            Cancel
          </Button>
        </View>
      </BottomSheetScrollBody>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  workflowOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 12,
  },
  stageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 12,
  },
  stageColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
