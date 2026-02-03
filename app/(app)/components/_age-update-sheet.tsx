import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { ChevronRight, Check, Clock, CirclePause } from 'lucide-react-native';

import { VStack, HStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import {
  BottomSheetModal,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetScrollBody,
  BottomSheetFooter,
} from '@/components/ui/bottom-sheet';
import { STATUS_OPTIONS, REASON_OPTIONS, getStatusBadgeColor } from '@/lib/age-utils';
import type { ProjectStatus, AgeUpdateReason, Project, BadgeColor } from '@/lib/mock-data';

type AgeUpdateSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  onSubmit: (status: ProjectStatus, reason: AgeUpdateReason, note?: string) => void;
};

export function AgeUpdateSheet({ open, onOpenChange, project, onSubmit }: AgeUpdateSheetProps) {
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [reason, setReason] = useState<AgeUpdateReason>('none');
  const [note, setNote] = useState('');
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
    setStatus(project.status);
    setReason('none');
    setNote('');
    onOpenChange(false);
  };

  const handleReasonSelect = (selectedReason: AgeUpdateReason) => {
    setReason(selectedReason);
    setReasonSheetOpen(false);
  };

  const selectedReasonLabel = REASON_OPTIONS.find((opt) => opt.value === reason)?.label ?? 'None';

  return (
    <>
      <BottomSheetModal
        open={open}
        onOpenChange={onOpenChange}
        snapPoints={['70%']}
      >
        <BottomSheetHeader>
          <BottomSheetTitle>Update Age</BottomSheetTitle>
        </BottomSheetHeader>

        <BottomSheetScrollBody>
          <VStack gap="lg">
            {/* Status Selection - 2 per row */}
            <VStack gap="sm">
              <Text size="sm" weight="medium" tone="muted">
                Status
              </Text>
              <VStack gap="sm">
                {/* Row 1: On track, At risk */}
                <HStack gap="sm">
                  {STATUS_OPTIONS.slice(0, 2).map((option) => {
                    const isSelected = status === option.value;
                    const color = getStatusBadgeColor(option.value);
                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => setStatus(option.value)}
                        style={{ flex: 1 }}
                      >
                        <Badge
                          variant="color"
                          color={color as BadgeColor}
                          size="lg"
                          icon={isSelected ? Check : Clock}
                        >
                          <Text>{option.label}</Text>
                        </Badge>
                      </Pressable>
                    );
                  })}
                </HStack>
                {/* Row 2: Off track, Disable age */}
                <HStack gap="sm">
                  {STATUS_OPTIONS.slice(2, 4).map((option) => {
                    const isSelected = status === option.value;
                    const color = getStatusBadgeColor(option.value);
                    const isDisabledOption = option.value === 'disabled';
                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => {
                          if (!isDisabledOption) {
                            setStatus(option.value);
                          }
                        }}
                        style={{ flex: 1, opacity: isDisabledOption ? 0.5 : 1 }}
                      >
                        <Badge
                          variant="color"
                          color={color as BadgeColor}
                          size="lg"
                          icon={isSelected ? Check : isDisabledOption ? CirclePause : Clock}
                        >
                          <Text>{option.label}</Text>
                        </Badge>
                      </Pressable>
                    );
                  })}
                </HStack>
              </VStack>
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
                Note (optional)
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

        <BottomSheetFooter>
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
        </BottomSheetFooter>
      </BottomSheetModal>

      {/* Reason Selection Sheet */}
      <BottomSheetModal
        open={reasonSheetOpen}
        onOpenChange={setReasonSheetOpen}
        snapPoints={['60%']}
        stackBehavior="push"
      >
        <BottomSheetHeader>
          <BottomSheetTitle>Select Reason</BottomSheetTitle>
        </BottomSheetHeader>

        <BottomSheetScrollBody>
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
                      {isSelected && <Icon as={Check} size={18} />}
                    </HStack>
                  </View>
                </Button>
              );
            })}
          </VStack>
        </BottomSheetScrollBody>
      </BottomSheetModal>
    </>
  );
}
