import { useState, useEffect } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MapPin, User, Briefcase } from 'lucide-react-native';

import { VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BottomSheetModal, BottomSheetBody, BottomSheetHeader, BottomSheetTitle } from '@/components/ui/bottom-sheet';
import { MOCK_WORKFLOWS, type Workflow } from '@/lib/mock-data';

type NewProjectSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-select a workflow */
  defaultWorkflowId?: string;
  /** Pre-select a stage */
  defaultStageId?: string;
  /** Called when project is created */
  onProjectCreated?: (project: {
    name: string;
    address: string;
    workflowId: string;
    stageId: string;
  }) => void;
};

export function NewProjectSheet({
  open,
  onOpenChange,
  defaultWorkflowId,
  defaultStageId,
  onProjectCreated,
}: NewProjectSheetProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  // Set defaults when sheet opens
  useEffect(() => {
    if (open) {
      if (defaultWorkflowId) {
        const workflow = MOCK_WORKFLOWS.find((w) => w.id === defaultWorkflowId);
        setSelectedWorkflow(workflow ?? null);
        setSelectedStageId(defaultStageId ?? workflow?.stages[0]?.id ?? null);
      }
    }
  }, [open, defaultWorkflowId, defaultStageId]);

  // Reset form when sheet closes
  useEffect(() => {
    if (!open) {
      setName('');
      setAddress('');
      if (!defaultWorkflowId) {
        setSelectedWorkflow(null);
        setSelectedStageId(null);
      }
    }
  }, [open, defaultWorkflowId]);

  const handleWorkflowChange = (value: string) => {
    const workflow = MOCK_WORKFLOWS.find((w) => w.id === value);
    setSelectedWorkflow(workflow ?? null);
    setSelectedStageId(workflow?.stages[0]?.id ?? null);
  };

  const handleStageChange = (value: string) => {
    setSelectedStageId(value);
  };

  const handleCreate = () => {
    if (!selectedWorkflow || !selectedStageId) return;

    onProjectCreated?.({
      name: name.trim(),
      address: address.trim(),
      workflowId: selectedWorkflow.id,
      stageId: selectedStageId,
    });

    onOpenChange(false);
  };

  const isValid =
    name.trim().length > 0 && address.trim().length > 0 && selectedWorkflow !== null;

  return (
    <BottomSheetModal open={open} onOpenChange={onOpenChange} snapPoints={['90%']}>
      <BottomSheetHeader>
        <BottomSheetTitle>New Project</BottomSheetTitle>
      </BottomSheetHeader>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
          <BottomSheetBody>
            <VStack gap="lg">
              <VStack gap="md">
                {/* Project Name */}
                <VStack gap="xs">
                  <HStack gap="xs" align="center">
                    <Icon as={User} size={16} />
                    <Text weight="medium">Project Name</Text>
                  </HStack>
                  <Input
                    placeholder="e.g., Johnson Residence"
                    value={name}
                    onChangeText={setName}
                    width="full"
                  />
                </VStack>

                {/* Address */}
                <VStack gap="xs">
                  <HStack gap="xs" align="center">
                    <Icon as={MapPin} size={16} />
                    <Text weight="medium">Address</Text>
                  </HStack>
                  <Input
                    placeholder="Enter street address"
                    value={address}
                    onChangeText={setAddress}
                    width="full"
                  />
                  <Button variant="outline" size="sm">
                    <Icon as={MapPin} size={14} />
                    Use Current Location
                  </Button>
                </VStack>

                {/* Workflow Selection */}
                <VStack gap="xs">
                  <HStack gap="xs" align="center">
                    <Icon as={Briefcase} size={16} />
                    <Text weight="medium">Workflow</Text>
                  </HStack>
                  <Select
                    value={
                      selectedWorkflow
                        ? { value: selectedWorkflow.id, label: selectedWorkflow.name }
                        : undefined
                    }
                    onValueChange={(option) => option && handleWorkflowChange(option.value)}
                  >
                    <SelectTrigger fullWidth>
                      <SelectValue placeholder="Select a workflow" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {MOCK_WORKFLOWS.map((workflow) => (
                          <SelectItem key={workflow.id} label={workflow.name} value={workflow.id}>
                            {workflow.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </VStack>

                {/* Stage Selection (only shown if workflow is selected) */}
                {selectedWorkflow && (
                  <VStack gap="xs">
                    <Text weight="medium">Starting Stage</Text>
                    <Select
                      value={{
                        value: selectedStageId ?? '',
                        label:
                          selectedWorkflow.stages.find((s) => s.id === selectedStageId)?.name ?? '',
                      }}
                      onValueChange={(option) => option && handleStageChange(option.value)}
                    >
                      <SelectTrigger fullWidth>
                        <SelectValue placeholder="Select starting stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {selectedWorkflow.stages.map((stage) => (
                            <SelectItem key={stage.id} label={stage.name} value={stage.id}>
                              {stage.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </VStack>
                )}
              </VStack>

              {/* Actions */}
              <VStack gap="sm">
                <Button onPress={handleCreate} disabled={!isValid}>
                  Create Project
                </Button>
                <Button variant="ghost" onPress={() => onOpenChange(false)}>
                  Cancel
                </Button>
              </VStack>
            </VStack>
          </BottomSheetBody>
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
}
