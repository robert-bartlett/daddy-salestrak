import { useState } from 'react';
import { View } from 'react-native';
import { ChevronRight, Check } from 'lucide-react-native';

import { VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@/components/ui/icon';
import {
  BottomSheetModal,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetBody,
  BottomSheetScrollBody,
} from '@/components/ui/bottom-sheet';
import { STATUS_OPTIONS, REASON_OPTIONS, getStatusHexColor } from '@/lib/age-utils';
import type { ProjectStatus, AgeUpdateReason, Project } from '@/lib/mock-data';

type AgeUpdateSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  onSubmit: (status: ProjectStatus, reason: AgeUpdateReason, note?: string) => void;
};

export function AgeUpdateSheet({ open, onOpenChange, project, onSubmit }: AgeUpdateSheetProps) {
  const [status, setStatus] = useState<ProjectStatus>('on_track');
  const [reason, setReason] = useState<AgeUpdateReason>('none');
  const [note, setNote] = useState('');
  const [statusSheetOpen, setStatusSheetOpen] = useState(false);
  const [reasonSheetOpen, setReasonSheetOpen] = useState(false);

  const handleSubmit = () => {
    onSubmit(status, reason, note.trim() || undefined);
    // Reset form
    setStatus('on_track');
    setReason('none');
    setNote('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset form
    setStatus('on_track');
    setReason('none');
    setNote('');
    onOpenChange(false);
  };

  const handleStatusSelect = (selectedStatus: ProjectStatus) => {
    setStatus(selectedStatus);
    setStatusSheetOpen(false);
  };

  const handleReasonSelect = (selectedReason: AgeUpdateReason) => {
    setReason(selectedReason);
    setReasonSheetOpen(false);
  };

  const selectedStatusOption = STATUS_OPTIONS.find((opt) => opt.value === status);
  const selectedStatusLabel = selectedStatusOption?.label ?? 'On track';
  const selectedStatusColor = getStatusHexColor(status);
  const selectedReasonLabel = REASON_OPTIONS.find((opt) => opt.value === reason)?.label ?? 'None';

  return (
    <>
      <BottomSheetModal
        open={open}
        onOpenChange={onOpenChange}
        snapPoints={[480]}
        stackBehavior="push"
        footer={
          <HStack gap="sm">
            <View style={{ flex: 1 }}>
              <Button variant="ghost" onPress={handleCancel}>
                Cancel
              </Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button onPress={handleSubmit}>Reset Age</Button>
            </View>
          </HStack>
        }
      >
        <BottomSheetHeader>
          <BottomSheetTitle>Update Age</BottomSheetTitle>
        </BottomSheetHeader>

        <BottomSheetScrollBody>
          <VStack gap="lg">
            {/* Status Selection - Opens sheet */}
            <VStack gap="sm">
              <Text size="sm" weight="medium" tone="muted">
                Status
              </Text>
              <Button variant="outline" onPress={() => setStatusSheetOpen(true)}>
                <View style={{ flex: 1 }}>
                  <HStack justify="between" align="center">
                    <HStack gap="sm" align="center">
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: selectedStatusColor,
                        }}
                      />
                      <Text>{selectedStatusLabel}</Text>
                    </HStack>
                    <Icon as={ChevronRight} size={20} />
                  </HStack>
                </View>
              </Button>
            </VStack>

            {/* Reason Selection - Single bar that opens sheet */}
            <VStack gap="sm">
              <Text size="sm" weight="medium" tone="muted">
                Reason
              </Text>
              <Button variant="outline" onPress={() => setReasonSheetOpen(true)}>
                <View style={{ flex: 1 }}>
                  <HStack justify="between" align="center">
                    <Text>{selectedReasonLabel}</Text>
                    <Icon as={ChevronRight} size={20} />
                  </HStack>
                </View>
              </Button>
            </VStack>

            {/* Note Textarea */}
            <VStack gap="sm">
              <Text size="sm" weight="medium" tone="muted">
                Note
              </Text>
              <Textarea
                placeholder="Add a note..."
                value={note}
                onChangeText={setNote}
                numberOfLines={3}
              />
            </VStack>
          </VStack>
        </BottomSheetScrollBody>
      </BottomSheetModal>

      {/* Status Selection Sheet */}
      <BottomSheetModal
        open={statusSheetOpen}
        onOpenChange={setStatusSheetOpen}
        enableDynamicSizing
        stackBehavior="push"
      >
        <BottomSheetHeader>
          <BottomSheetTitle>Select Status</BottomSheetTitle>
        </BottomSheetHeader>

        <BottomSheetBody>
          <View style={{ paddingBottom: 16 }}>
            <VStack gap="xs">
              {STATUS_OPTIONS.map((option) => {
                const isSelected = status === option.value;
                const statusColor = getStatusHexColor(option.value);
                return (
                  <Button
                    key={option.value}
                    variant={isSelected ? 'secondary' : 'ghost'}
                    onPress={() => handleStatusSelect(option.value)}
                  >
                    <View style={{ flex: 1 }}>
                      <HStack justify="between" align="center">
                        <HStack gap="sm" align="center">
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: statusColor,
                            }}
                          />
                          <Text weight={isSelected ? 'semibold' : 'regular'}>
                            {option.label}
                          </Text>
                        </HStack>
                        {isSelected ? <Icon as={Check} size={18} /> : null}
                      </HStack>
                    </View>
                  </Button>
                );
              })}
            </VStack>
          </View>
        </BottomSheetBody>
      </BottomSheetModal>

      {/* Reason Selection Sheet */}
      <BottomSheetModal
        open={reasonSheetOpen}
        onOpenChange={setReasonSheetOpen}
        enableDynamicSizing
        stackBehavior="push"
      >
        <BottomSheetHeader>
          <BottomSheetTitle>Select Reason</BottomSheetTitle>
        </BottomSheetHeader>

        <BottomSheetBody>
          <View style={{ paddingBottom: 16 }}>
            <VStack gap="xs">
              {REASON_OPTIONS.map((option) => {
                const isSelected = reason === option.value;
                return (
                  <Button
                    key={option.value}
                    variant={isSelected ? 'secondary' : 'ghost'}
                    onPress={() => handleReasonSelect(option.value)}
                  >
                    <View style={{ flex: 1 }}>
                      <HStack justify="between" align="center">
                        <Text weight={isSelected ? 'semibold' : 'regular'}>
                          {option.label}
                        </Text>
                        {isSelected ? <Icon as={Check} size={18} /> : null}
                      </HStack>
                    </View>
                  </Button>
                );
              })}
            </VStack>
          </View>
        </BottomSheetBody>
      </BottomSheetModal>
    </>
  );
}
