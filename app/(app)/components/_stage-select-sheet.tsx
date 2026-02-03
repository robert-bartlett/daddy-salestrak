import { View } from 'react-native';

import { VStack, HStack, Box } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BottomSheetModal,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetScrollBody,
  BottomSheetFooter,
} from '@/components/ui/bottom-sheet';
import { Check } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { type Workflow } from '@/lib/mock-data';

type StageSelectSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow: Workflow;
  currentStageId: string;
  onSelectStage: (stageId: string) => void;
};

export function StageSelectSheet({
  open,
  onOpenChange,
  workflow,
  currentStageId,
  onSelectStage,
}: StageSelectSheetProps) {
  const handleSelectStage = (stageId: string) => {
    if (stageId !== currentStageId) {
      onSelectStage(stageId);
    }
    onOpenChange(false);
  };

  return (
    <BottomSheetModal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={['50%', '85%']}
    >
      <BottomSheetHeader>
        <BottomSheetTitle>Change Stage</BottomSheetTitle>
        <Text tone="muted" size="sm">
          {workflow.name}
        </Text>
      </BottomSheetHeader>

      <BottomSheetScrollBody>
        <VStack gap="xs">
          {workflow.stages.map((stage, index) => {
            const isCurrent = stage.id === currentStageId;
            const currentIndex = workflow.stages.findIndex(
              (s) => s.id === currentStageId
            );
            const isPast = index < currentIndex;

            return (
              <Button
                key={stage.id}
                variant={isCurrent ? 'secondary' : 'ghost'}
                onPress={() => handleSelectStage(stage.id)}
              >
                <View style={{ flex: 1 }}>
                  <HStack gap="sm" align="center">
                    <Box
                      size="sm"
                      rounded="full"
                      background={isCurrent ? 'primary' : isPast ? 'accent' : 'muted'}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        weight={isCurrent ? 'semibold' : 'regular'}
                        tone={isCurrent ? 'default' : 'muted'}
                      >
                        {stage.name}
                      </Text>
                    </View>
                    {isCurrent && (
                      <Icon as={Check} size={18} />
                    )}
                    <Badge variant="color" color={stage.color} size="sm">
                      <Text>{index + 1}</Text>
                    </Badge>
                  </HStack>
                </View>
              </Button>
            );
          })}
        </VStack>
      </BottomSheetScrollBody>

      <BottomSheetFooter>
        <Button variant="ghost" onPress={() => onOpenChange(false)}>
          Cancel
        </Button>
      </BottomSheetFooter>
    </BottomSheetModal>
  );
}
