import { useState } from 'react';
import { View } from 'react-native';
import { MapPin, User, Briefcase } from 'lucide-react-native';

import { BottomSheetScrollBody, BottomSheetHeader, BottomSheetFooter } from '@/components/ui/bottom-sheet';
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
import { MOCK_WORKFLOWS, type Workflow } from '@/lib/mock-data';
import { useProjects } from '@/lib/projects-context';
import { useMapSheet } from '@/lib/map-sheet-context';

export function AddSheetContent() {
  const { addProject } = useProjects();
  const { appState, closeSheet, selectProject } = useMapSheet();

  // Get coordinates from app state if available
  const coordinates = appState.type === 'tab' && appState.tab === 'add' ? appState.coordinates : undefined;

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  const handleWorkflowChange = (value: string) => {
    const workflow = MOCK_WORKFLOWS.find((w) => w.id === value);
    setSelectedWorkflow(workflow ?? null);
    setSelectedStageId(workflow?.stages[0]?.id ?? null);
  };

  const handleStageChange = (value: string) => {
    setSelectedStageId(value);
  };

  const handleCreate = () => {
    if (!name.trim() || !address.trim() || !selectedWorkflow || !selectedStageId) return;

    const newProject = addProject({
      name: name.trim(),
      address: address.trim(),
      workflowId: selectedWorkflow.id,
      stageId: selectedStageId,
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
    });

    // Reset form
    setName('');
    setAddress('');
    setSelectedWorkflow(null);
    setSelectedStageId(null);

    // Show the new project
    selectProject(newProject.id);
  };

  const handleCancel = () => {
    // Reset form
    setName('');
    setAddress('');
    setSelectedWorkflow(null);
    setSelectedStageId(null);
    closeSheet();
  };

  const isValid = name.trim().length > 0 && address.trim().length > 0 && selectedWorkflow !== null && selectedStageId !== null;

  return (
    <>
      <BottomSheetHeader>
        <VStack gap="xs">
          <Text size="lg" weight="semibold">
            New Project
          </Text>
          <Text size="sm" tone="muted">
            Add a new lead or project to track
          </Text>
        </VStack>
      </BottomSheetHeader>

      <BottomSheetScrollBody contentContainerStyle={{ paddingBottom: 120 }}>
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
              {coordinates ? (
                <View className="flex-row items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
                  <Icon as={MapPin} size={14} color="#22c55e" />
                  <Text size="sm" tone="muted">
                    Location selected from map
                  </Text>
                </View>
              ) : (
                <Button variant="outline" size="sm">
                  <Icon as={MapPin} size={14} />
                  Use Current Location
                </Button>
              )}
            </VStack>

            {/* Workflow Selection */}
            <VStack gap="xs">
              <HStack gap="xs" align="center">
                <Icon as={Briefcase} size={16} />
                <Text weight="medium">Workflow</Text>
              </HStack>
              <Select onValueChange={(option) => option && handleWorkflowChange(option.value)}>
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
            <Button variant="ghost" onPress={handleCancel}>
              Cancel
            </Button>
          </VStack>
        </VStack>
      </BottomSheetScrollBody>
    </>
  );
}
